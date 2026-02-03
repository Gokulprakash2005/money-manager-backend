const Transaction = require('../models/Transaction');
const { validationResult } = require('express-validator');

// Get all transactions
exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ datetime: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new transaction
exports.createTransaction = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const transaction = new Transaction(req.body);
    const savedTransaction = await transaction.save();
    res.status(201).json(savedTransaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update transaction (only within 12 hours)
exports.updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findById(id);
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check if transaction is within 12 hours
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
    if (transaction.datetime < twelveHoursAgo) {
      return res.status(403).json({ message: 'Cannot edit transaction after 12 hours' });
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedTransaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete transaction
exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findByIdAndDelete(id);
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get transactions by date range
exports.getTransactionsByDateRange = async (req, res) => {
  try {
    const { start, end } = req.query;
    
    if (!start || !end) {
      return res.status(400).json({ message: 'Start and end dates are required' });
    }

    const transactions = await Transaction.find({
      datetime: {
        $gte: new Date(start),
        $lte: new Date(end)
      }
    }).sort({ datetime: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get summary statistics
exports.getSummary = async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;
    let startDate;
    const endDate = new Date();

    switch (period) {
      case 'weekly':
        startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'yearly':
        startDate = new Date(endDate.getFullYear(), 0, 1);
        break;
      case 'monthly':
      default:
        startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
        break;
    }

    const transactions = await Transaction.find({
      datetime: { $gte: startDate, $lte: endDate }
    });

    const summary = transactions.reduce((acc, transaction) => {
      if (transaction.type === 'income') {
        acc.totalIncome += transaction.amount;
      } else {
        acc.totalExpense += transaction.amount;
      }
      return acc;
    }, { totalIncome: 0, totalExpense: 0 });

    summary.balance = summary.totalIncome - summary.totalExpense;

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};