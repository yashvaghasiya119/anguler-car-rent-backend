const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  method: {
    type: String,
    enum: ['cash', 'card'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  card: {
    bankName: {
      type: String,
      trim: true
    },
    cardNumberLast4: {
      type: String,
      trim: true
    },
    cardHolderName: {
      type: String,
      trim: true
    }
  },
  status: {
    type: String,
    enum: ['success', 'failed'],
    required: true
  },
  failureReason: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);
