const express = require('express');
const { body } = require('express-validator');
const transactionController = require('../controllers/transactionController');

const router = express.Router();

// Validation middleware
const transactionValidation = [
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('description').trim().isLength({ min: 1 }).withMessage('Description is required'),
  body('category').trim().isLength({ min: 1 }).withMessage('Category is required'),
  body('division').isIn(['personal', 'office']).withMessage('Division must be personal or office'),
  body('datetime').isISO8601().withMessage('Valid datetime is required')
];

// Routes
router.get('/', transactionController.getAllTransactions);
router.post('/', transactionValidation, transactionController.createTransaction);
router.put('/:id', transactionValidation, transactionController.updateTransaction);
router.delete('/:id', transactionController.deleteTransaction);
router.get('/range', transactionController.getTransactionsByDateRange);
router.get('/summary', transactionController.getSummary);

module.exports = router;