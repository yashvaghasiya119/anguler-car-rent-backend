const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');

const bookVehicle = async (req, res) => {
  try {
    const { vehicleId, startTime, endTime } = req.body;

    // Check if vehicle exists and is approved
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    if (vehicle.status !== 'approved') {
      return res.status(400).json({ message: 'Vehicle is not available for booking' });
    }

    // Calculate total price
    const start = new Date(startTime);
    const end = new Date(endTime);
    const hours = Math.ceil((end - start) / (1000 * 60 * 60));
    const totalPrice = hours * vehicle.rentPerHour;

    // Create booking
    const booking = new Booking({
      userId: req.user._id,
      vehicleId,
      startTime: start,
      endTime: end,
      totalPrice,
      status: 'pending'
    });

    await booking.save();
    await booking.populate('vehicleId', 'vehicleNumber carModel rentPerHour');

    res.status(201).json({
      message: 'Vehicle booked successfully',
      booking
    });
  } catch (error) {
    console.error('Book vehicle error:', error);
    res.status(500).json({ message: 'Server error while booking vehicle' });
  }
};

const getBookingHistory = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('vehicleId', 'vehicleNumber carModel rentPerHour')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    console.error('Get booking history error:', error);
    res.status(500).json({ message: 'Server error while fetching booking history' });
  }
};

module.exports = {
  bookVehicle,
  getBookingHistory
};
