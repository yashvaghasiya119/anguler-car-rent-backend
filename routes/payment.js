const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { allowUser } = require('../middleware/roleMiddleware');
const { payAndBookVehicle } = require('../controllers/paymentController');

// POST /api/payment/pay
router.post('/pay', authMiddleware, allowUser, payAndBookVehicle);

module.exports = router;
