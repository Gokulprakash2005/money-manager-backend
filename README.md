# Money Manager Backend

Node.js/Express API for the Money Manager application with MongoDB integration.

## Features

- RESTful API for transaction management
- MongoDB integration with Mongoose
- Input validation with express-validator
- CORS enabled for frontend integration
- 12-hour edit restriction for transactions

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with:
```
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/money-manager
NODE_ENV=development
```

3. Start development server:
```bash
npm run dev
```

## API Endpoints

- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/:id` - Update transaction (within 12 hours)
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/transactions/range` - Get transactions by date range
- `GET /api/transactions/summary` - Get summary statistics

## Technologies Used

- Node.js
- Express.js
- MongoDB with Mongoose
- Express Validator
- CORS