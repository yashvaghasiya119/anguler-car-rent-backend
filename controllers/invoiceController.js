const PDFDocument = require('pdfkit');
const Booking = require('../models/Booking');
const path = require('path');

const getHoursDiffCeil = (start, end) => {
  const hours = Math.ceil((end - start) / (1000 * 60 * 60));
  return Math.max(hours, 0);
};

const buildInvoiceData = async ({ bookingId, userId }) => {
  const booking = await Booking.findById(bookingId)
    .populate('vehicleId', 'vehicleNumber carModel rentPerHour ownerName vehicleFrontImage')
    .populate('paymentId')
    .populate('userId', 'name email');

  if (!booking) {
    return { status: 404, body: { message: 'Booking not found' } };
  }

  if (String(booking.userId?._id || booking.userId) !== String(userId)) {
    return { status: 403, body: { message: 'Access denied for this booking' } };
  }

  if (booking.status !== 'confirmed' && booking.status !== 'completed') {
    return { status: 400, body: { message: 'Invoice is available only for confirmed/completed bookings' } };
  }

  const start = new Date(booking.startTime);
  const end = new Date(booking.endTime);
  const hours = getHoursDiffCeil(start, end);

  const invoiceNumber = `INV-${String(booking._id).slice(-8).toUpperCase()}`;
  const issuedAt = new Date();

  const subtotal = booking.totalPrice;
  const tax = 0;
  const total = subtotal + tax;

  return {
    status: 200,
    body: {
      invoiceNumber,
      issuedAt,
      booking: {
        id: booking._id,
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: booking.status,
        createdAt: booking.createdAt
      },
      customer: {
        name: booking.userId?.name,
        email: booking.userId?.email
      },
      vehicle: {
        id: booking.vehicleId?._id,
        vehicleNumber: booking.vehicleId?.vehicleNumber,
        carModel: booking.vehicleId?.carModel,
        rentPerHour: booking.vehicleId?.rentPerHour,
        ownerName: booking.vehicleId?.ownerName,
        vehicleFrontImage: booking.vehicleId?.vehicleFrontImage
      },
      payment: booking.paymentId
        ? {
          id: booking.paymentId?._id,
          method: booking.paymentId?.method,
          amount: booking.paymentId?.amount,
          currency: booking.paymentId?.currency,
          status: booking.paymentId?.status,
          card: booking.paymentId?.card
            ? {
              bankName: booking.paymentId?.card?.bankName,
              cardNumberLast4: booking.paymentId?.card?.cardNumberLast4,
              cardHolderName: booking.paymentId?.card?.cardHolderName
            }
            : undefined
        }
        : undefined,
      pricing: {
        hours,
        subtotal,
        tax,
        total
      }
    }
  };
};

const getInvoice = async (req, res) => {
  try {
    const result = await buildInvoiceData({ bookingId: req.params.bookingId, userId: req.user._id });
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('Get invoice error:', error);
    return res.status(500).json({ message: 'Server error while generating invoice' });
  }
};

const getInvoicePdf = async (req, res) => {
  try {
    const result = await buildInvoiceData({ bookingId: req.params.bookingId, userId: req.user._id });
    if (result.status !== 200) {
      return res.status(result.status).json(result.body);
    }

    const invoice = result.body;

    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    const filename = `invoice-${invoice.invoiceNumber}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.pipe(res);

    // Header with dark green background
    doc.rect(0, 0, doc.page.width, 100).fill('#1A4D2E'); // Dark green header background
    doc.fill('#FFFFFF') // White text color
      .fontSize(20)
      .text('rentlify', 50, 30) // Company Name
      .fontSize(10)
      .text('PROFESSIONAL PARTNERS', 50, 50)
      .text('100 Fifth Avenue, New York, NY 10011', 50, 70)
      .text('(208) 555-0155', 50, 85);

    doc.fill('#FFFFFF') // White text color
      .fontSize(10)
      .text('www.rentlify.com', doc.page.width - 150, 70, { width: 100, align: 'right' });

    // Invoice title
    doc.fill('#000000').fontSize(36).text('Invoice', 50, 150);

    // Customer details
    doc.fontSize(12).text('Customer Name:', 50, 200);
    doc.text(`${invoice.customer.name || ''}`, 150, 200);

    // Invoice details (Customer ID, Event Date, Billing Date)
    doc.fontSize(10).fill('#333333');
    doc.text('Customer ID:', 400, 180);
    doc.text(`${invoice.customer.id || invoice.booking.id || 'N/A'}`, 480, 180);
    doc.text('Event date:', 400, 210);
    doc.text(`${new Date(invoice.booking.startTime).toLocaleDateString()}`, 480, 210);
    doc.text('Billing date:', 400, 250);
    doc.text(`${new Date(invoice.issuedAt).toLocaleDateString()}`, 480, 250);

    // Table header
    const tableTop = 250;
    doc.fill('#E8F5E9'); // Light green header background
    doc.rect(50, tableTop, 500, 25).fill();
    doc.fill('#1A4D2E').fontSize(12).text('Description', 55, tableTop + 8);
    doc.text('Quantity', 250, tableTop + 8);
    doc.text('Unit Price', 350, tableTop + 8);
    doc.text('Total', 450, tableTop + 8);

    // Table rows
    let currentY = tableTop + 30;
    doc.fill('#000000').fontSize(10);
    const itemDesc = `${invoice.vehicle.carModel} (${invoice.vehicle.vehicleNumber})`;
    doc.text(itemDesc, 55, currentY + 5);
    doc.text(`${invoice.pricing.hours}`, 250, currentY + 5);
    doc.text(`$${invoice.vehicle.rentPerHour}`, 350, currentY + 5);
    doc.text(`$${invoice.pricing.subtotal}`, 450, currentY + 5);

    // Totals
    const totalsY = currentY + 40;
    doc.fontSize(12).text('Subtotal:', 400, totalsY);
    doc.text(`$${invoice.pricing.subtotal}`, 480, totalsY);
    doc.text('Tax:', 400, totalsY + 20);
    doc.text(`$${invoice.pricing.tax}`, 480, totalsY + 20);
    doc.fill('#1A4D2E').fontSize(14).text('Total:', 400, totalsY + 40);
    doc.text(`$${invoice.pricing.total}`, 480, totalsY + 40);

    doc.end();
  } catch (error) {
    console.error('Get invoice PDF error:', error);
    return res.status(500).json({ message: 'Server error while generating invoice PDF' });
  }
};

module.exports = {
  getInvoice,
  getInvoicePdf
};
