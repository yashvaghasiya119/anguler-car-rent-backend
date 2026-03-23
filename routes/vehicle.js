const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { allowProvider, allowUser } = require('../middleware/roleMiddleware');
const upload = require('../config/multer');
const {
  addVehicle,
  getMyVehicles,
  updateVehicle,
  deleteVehicle,
  getAllApprovedVehicles,
  getVehicleById
} = require('../controllers/vehicleController');

// Provider routes
router.post('/add', authMiddleware, allowProvider, upload.fields([
  { name: 'aadharCardImage', maxCount: 1 },
  { name: 'vehicleFrontImage', maxCount: 1 }
]), addVehicle);

router.get('/my', authMiddleware, allowProvider, getMyVehicles);
router.put('/update/:id', authMiddleware, allowProvider, updateVehicle);
router.delete('/delete/:id', authMiddleware, allowProvider, deleteVehicle);

// User routes
router.get('/all-approved', authMiddleware, allowUser, getAllApprovedVehicles);
router.get('/:id', authMiddleware, allowUser, getVehicleById);

module.exports = router;
