const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const transactionRoutes = require('./routes/transactions');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/money-manager';

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/transactions', transactionRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ message: 'Money Manager API is running!' });
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
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
  if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  }
})
.catch((error) => {
  console.error('Database connection error:', error);
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

module.exports = app;