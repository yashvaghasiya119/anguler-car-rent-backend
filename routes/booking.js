const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { allowUser } = require('../middleware/roleMiddleware');
const {
  bookVehicle,
  getBookingHistory
} = require('../controllers/bookingController');

// POST /api/booking/book
router.post('/book', authMiddleware, allowUser, bookVehicle);

// GET /api/booking/history
router.get('/history', authMiddleware, allowUser, getBookingHistory);

module.exports = router;
