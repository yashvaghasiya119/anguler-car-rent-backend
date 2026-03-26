const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const Payment = require('../models/Payment');

const getHoursDiffCeil = (start, end) => {
  const hours = Math.ceil((end - start) / (1000 * 60 * 60));
  return Math.max(hours, 0);
};

const getLast4 = (cardNumber) => {
  if (!cardNumber) return undefined;
  const digits = String(cardNumber).replace(/\D/g, '');
  if (digits.length < 4) return undefined;
  return digits.slice(-4);
};

const shouldFakePaymentSucceed = ({ method, cardNumber }) => {
  if (method === 'cash') return true;
  const digits = String(cardNumber || '').replace(/\D/g, '');
  return digits.length === 12;
};

// POST /api/payment/pay
// Creates a booking (pending), then processes a fake payment. If payment succeeds => booking confirmed.
const payAndBookVehicle = async (req, res) => {
  try {
    const {
      vehicleId,
      startTime,
      endTime,
      method,
      bankName,
      cardNumber,
      cardHolderName
    } = req.body;

    if (!vehicleId || !startTime || !endTime) {
      return res.status(400).json({ message: 'vehicleId, startTime and endTime are required' });
    }

    if (!method || !['cash', 'card'].includes(method)) {
      return res.status(400).json({ message: 'Valid payment method is required (cash/card)' });
    }

    if (method === 'card') {
      if (!bankName || !cardNumber || !cardHolderName) {
        return res.status(400).json({ message: 'bankName, cardNumber and cardHolderName are required for card payment' });
      }

      const cardDigits = String(cardNumber).replace(/\D/g, '');
      if (cardDigits.length !== 12) {
        return res.status(400).json({ message: 'Card number must be exactly 12 digits' });
      }
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    if (vehicle.status !== 'approved') {
      return res.status(400).json({ message: 'Vehicle is not available for booking' });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid startTime/endTime' });
    }

    if (end <= start) {
      return res.status(400).json({ message: 'endTime must be after startTime' });
    }

    const hours = getHoursDiffCeil(start, end);
    const totalPrice = hours * vehicle.rentPerHour;

    const booking = new Booking({
      userId: req.user._id,
      vehicleId,
      startTime: start,
      endTime: end,
      totalPrice,
      status: 'pending'
    });

    await booking.save();

    const success = shouldFakePaymentSucceed({ method, cardNumber });

    const payment = new Payment({
      userId: req.user._id,
      bookingId: booking._id,
      vehicleId,
      method,
      amount: totalPrice,
      status: success ? 'success' : 'failed',
      failureReason: success ? undefined : 'Fake payment failed',
      card: method === 'card'
        ? {
          bankName,
          cardNumberLast4: getLast4(cardNumber),
          cardHolderName
        }
        : undefined
    });

    await payment.save();

    booking.paymentId = payment._id;
    booking.status = success ? 'confirmed' : 'cancelled';
    await booking.save();

    await booking.populate('vehicleId', 'vehicleNumber carModel rentPerHour');

    if (success) {
      return res.status(201).json({
        message: 'Vehicle booked successfully',
        booking,
        payment
      });
    }

    return res.status(402).json({
      message: 'Payment failed',
      booking,
      payment
    });
  } catch (error) {
    console.error('Pay & book error:', error);
    return res.status(500).json({ message: 'Server error while processing payment' });
  }
};

module.exports = {
  payAndBookVehicle
};
