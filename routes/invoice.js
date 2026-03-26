const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { allowUser } = require('../middleware/roleMiddleware');
const { getInvoice, getInvoicePdf } = require('../controllers/invoiceController');

// GET /api/invoice/:bookingId
router.get('/:bookingId', authMiddleware, allowUser, getInvoice);

// GET /api/invoice/:bookingId/pdf
router.get('/:bookingId/pdf', authMiddleware, allowUser, getInvoicePdf);

module.exports = router;
