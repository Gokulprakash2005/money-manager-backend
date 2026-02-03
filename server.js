const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const transactionRoutes = require('./routes/transactions');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/money-manager';

console.log('Environment check:', {
  NODE_ENV: process.env.NODE_ENV,
  MONGODB_URI: process.env.MONGODB_URI ? 'Set' : 'Not set'
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/transactions', transactionRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ message: 'Money Manager API is running!' });
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Money Manager API', 
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      transactions: '/api/transactions',
      summary: '/api/transactions/summary'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Database connection
mongoose.set('bufferCommands', false);

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      bufferMaxEntries: 0
    });
    console.log('Connected to MongoDB successfully');
  } catch (error) {
    console.error('Database connection error:', error.message);
    throw error;
  }
};

// Connect to database on every request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({ message: 'Database connection failed' });
  }
});

module.exports = app;