const Vehicle = require('../models/Vehicle');

const addVehicle = async (req, res) => {
  try {
    const {
      vehicleNumber,
      carModel,
      rentPerHour,
      ownerName,
      bankAccountNumber
    } = req.body;

    const vehicle = new Vehicle({
      providerId: req.user._id,
      vehicleNumber,
      carModel,
      rentPerHour,
      ownerName,
      bankAccountNumber,
      aadharCardImage: req.files['aadharCardImage'][0].path,
      vehicleFrontImage: req.files['vehicleFrontImage'][0].path
    });

    await vehicle.save();
    res.status(201).json({
      message: 'Vehicle added successfully. Pending admin approval.',
      vehicle
    });
  } catch (error) {
    console.error('Add vehicle error:', error);
    res.status(500).json({ message: 'Server error while adding vehicle' });
  }
};

const getMyVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ providerId: req.user._id })
      .sort({ createdAt: -1 });
    res.json(vehicles);
  } catch (error) {
    console.error('Get my vehicles error:', error);
    res.status(500).json({ message: 'Server error while fetching vehicles' });
  }
};

const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const vehicle = await Vehicle.findOneAndUpdate(
      { _id: id, providerId: req.user._id },
      updateData,
      { new: true }
    );

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found or unauthorized' });
    }

    res.json({
      message: 'Vehicle updated successfully',
      vehicle
    });
  } catch (error) {
    console.error('Update vehicle error:', error);
    res.status(500).json({ message: 'Server error while updating vehicle' });
  }
};

const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await Vehicle.findOneAndDelete({
      _id: id,
      providerId: req.user._id
    });

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found or unauthorized' });
    }

    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    res.status(500).json({ message: 'Server error while deleting vehicle' });
  }
};

const getAllApprovedVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ status: 'approved' })
      .populate('providerId', 'name email')
      .sort({ createdAt: -1 });
    res.json(vehicles);
  } catch (error) {
    console.error('Get approved vehicles error:', error);
    res.status(500).json({ message: 'Server error while fetching vehicles' });
  }
};

const getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findById(id)
      .populate('providerId', 'name email');

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    if (vehicle.status !== 'approved' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Vehicle not approved' });
    }

    res.json(vehicle);
  } catch (error) {
    console.error('Get vehicle error:', error);
    res.status(500).json({ message: 'Server error while fetching vehicle' });
  }
};

module.exports = {
  addVehicle,
  getMyVehicles,
  updateVehicle,
  deleteVehicle,
  getAllApprovedVehicles,
  getVehicleById
};
