const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// In-memory storage for demo (replace with MongoDB later)
let transactions = [
  {
    _id: '1',
    type: 'income',
    amount: 5000,
    description: 'Salary',
    category: 'Salary',
    division: 'personal',
    datetime: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '2',
    type: 'expense',
    amount: 500,
    description: 'Groceries',
    category: 'Food',
    division: 'personal',
    datetime: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

let nextId = 3;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/transactions', (req, res) => {
  res.json(transactions.sort((a, b) => new Date(b.datetime) - new Date(a.datetime)));
});

app.post('/api/transactions', (req, res) => {
  const transaction = {
    _id: nextId.toString(),
    ...req.body,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  transactions.push(transaction);
  nextId++;
  res.status(201).json(transaction);
});

app.put('/api/transactions/:id', (req, res) => {
  const { id } = req.params;
  const index = transactions.findIndex(t => t._id === id);
  
  if (index === -1) {
    return res.status(404).json({ message: 'Transaction not found' });
  }

  // Check 12-hour restriction
  const transaction = transactions[index];
  const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
  if (new Date(transaction.datetime) < twelveHoursAgo) {
    return res.status(403).json({ message: 'Cannot edit transaction after 12 hours' });
  }

  transactions[index] = { ...transactions[index], ...req.body, updatedAt: new Date() };
  res.json(transactions[index]);
});

app.delete('/api/transactions/:id', (req, res) => {
  const { id } = req.params;
  const index = transactions.findIndex(t => t._id === id);
  
  if (index === -1) {
    return res.status(404).json({ message: 'Transaction not found' });
  }

  transactions.splice(index, 1);
  res.json({ message: 'Transaction deleted successfully' });
});

app.get('/api/transactions/summary', (req, res) => {
  const { period = 'monthly' } = req.query;
  
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
});

app.get('/api/health', (req, res) => {
  res.json({ message: 'Money Manager API is running!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('API endpoints:');
  console.log(`- GET http://localhost:${PORT}/api/transactions`);
  console.log(`- POST http://localhost:${PORT}/api/transactions`);
  console.log(`- Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;