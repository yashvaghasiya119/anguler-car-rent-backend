require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const vehicleRoutes = require('./routes/vehicle');
const adminRoutes = require('./routes/admin');
const bookingRoutes = require('./routes/booking');
const paymentRoutes = require('./routes/payment');

// Initialize express app
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicle', vehicleRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/payment', paymentRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ message: 'Vehicle Rental API is running' });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => err.message);
    return res.status(400).json({ message: 'Validation Error', errors });
  }
  
  if (error.code === 11000) {
    return res.status(400).json({ message: 'Duplicate field value' });
  }
  
  res.status(500).json({ message: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
