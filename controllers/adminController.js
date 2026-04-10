const User = require('../models/User');
const Vehicle = require('../models/Vehicle');

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
};

const getAllProviders = async (req, res) => {
  try {
    const providers = await User.find({ role: 'provider' })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(providers);
  } catch (error) {
    console.error('Get providers error:', error);
    res.status(500).json({ message: 'Server error while fetching providers' });
  }
};

const banProvider = async (req, res) => {
  try {
    const { id } = req.params;
    const provider = await User.findByIdAndUpdate(
      id,
      { isBanned: true },
      { new: true }
    ).select('-password');

    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    res.json({
      message: 'Provider banned successfully',
      provider
    });
  } catch (error) {
    console.error('Ban provider error:', error);
    res.status(500).json({ message: 'Server error while banning provider' });
  }
};

const unbanProvider = async (req, res) => {
  try {
    const { id } = req.params;
    const provider = await User.findByIdAndUpdate(
      id,
      { isBanned: false },
      { new: true }
    ).select('-password');

    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    res.json({
      message: 'Provider unbanned successfully',
      provider
    });
  } catch (error) {
    console.error('Unban provider error:', error);
    res.status(500).json({ message: 'Server error while unbanning provider' });
  }
};

const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find()
      .populate('providerId', 'name email isBanned')
      .sort({ createdAt: -1 });
    res.json(vehicles);
  } catch (error) {
    console.error('Get vehicles error:', error);
    res.status(500).json({ message: 'Server error while fetching vehicles' });
  }
};

const approveVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findByIdAndUpdate(
      id,
      { status: 'approved' },
      { new: true }
    ).populate('providerId', 'name email');

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    res.json({
      message: 'Vehicle approved successfully',
      vehicle
    });
  } catch (error) {
    console.error('Approve vehicle error:', error);
    res.status(500).json({ message: 'Server error while approving vehicle' });
  }
};

const rejectVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findByIdAndUpdate(
      id,
      { status: 'rejected' },
      { new: true }
    ).populate('providerId', 'name email');

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    res.json({
      message: 'Vehicle rejected successfully',
      vehicle
    });
  } catch (error) {
    console.error('Reject vehicle error:', error);
    res.status(500).json({ message: 'Server error while rejecting vehicle' });
  }
};

const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const vehicle = await Vehicle.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('providerId', 'name email');

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
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

const deleteProvider = async (req, res) => {
  try {
    const { id } = req.params;
    
    // First check if provider exists
    const provider = await User.findById(id);
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }
    
    // Check if the user is actually a provider
    if (provider.role !== 'provider') {
      return res.status(400).json({ message: 'User is not a provider' });
    }
    
    // Delete all vehicles associated with this provider
    await Vehicle.deleteMany({ providerId: id });
    
    // Delete the provider
    await User.findByIdAndDelete(id);
    
    res.json({
      message: 'Provider and all associated vehicles deleted successfully'
    });
  } catch (error) {
    console.error('Delete provider error:', error);
    res.status(500).json({ message: 'Server error while deleting provider' });
  }
};

module.exports = {
  getAllUsers,
  getAllProviders,
  banProvider,
  unbanProvider,
  getAllVehicles,
  approveVehicle,
  rejectVehicle,
  updateVehicle,
  deleteProvider
};
