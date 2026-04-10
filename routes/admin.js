const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { allowAdmin } = require('../middleware/roleMiddleware');
const {
  getAllUsers,
  getAllProviders,
  banProvider,
  unbanProvider,
  getAllVehicles,
  approveVehicle,
  rejectVehicle,
  updateVehicle,
  deleteProvider
} = require('../controllers/adminController');

// User management
router.get('/users', authMiddleware, allowAdmin, getAllUsers);
router.get('/providers', authMiddleware, allowAdmin, getAllProviders);
router.put('/ban-provider/:id', authMiddleware, allowAdmin, banProvider);
router.put('/unban-provider/:id', authMiddleware, allowAdmin, unbanProvider);
router.delete('/providers/:id', authMiddleware, allowAdmin, deleteProvider);

// Vehicle management
router.get('/vehicles', authMiddleware, allowAdmin, getAllVehicles);
router.put('/approve-vehicle/:id', authMiddleware, allowAdmin, approveVehicle);
router.put('/reject-vehicle/:id', authMiddleware, allowAdmin, rejectVehicle);
router.put('/vehicles/:id', authMiddleware, allowAdmin, updateVehicle);

module.exports = router;
