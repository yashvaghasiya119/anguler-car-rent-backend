const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vehicleNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  carModel: {
    type: String,
    required: true,
    trim: true
  },
  rentPerHour: {
    type: Number,
    required: true,
    min: 0
  },
  ownerName: {
    type: String,
    required: true,
    trim: true
  },
  bankAccountNumber: {
    type: String,
    required: true,
    trim: true
  },
  aadharCardImage: {
    type: String,
    required: true
  },
  vehicleFrontImage: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Vehicle', vehicleSchema);
