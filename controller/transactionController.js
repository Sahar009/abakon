const express = require('express');
const asyncHandler = require('express-async-handler');
const User = require('../model/userModel');  // Import the User model
const Transaction = require('../model/transactionModel');  // Import the Transaction model

const router = express.Router();

const transaction = ()  => asyncHandler(async (req, res) => {
  const { userId, type, amount } = req.body;

  // Validate input
  if (!userId || !type || !amount) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  try {
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Create a new transaction
    let transaction = new Transaction({
      user: user._id,
      type,
      amount,
    });

    // Simulate transaction processing
    const isSuccess = processTransaction();  // Placeholder function for transaction logic

    if (isSuccess) {
      transaction.status = 'completed';
    } else {
      transaction.status = 'failed';
    }

    // Save the transaction
    transaction = await transaction.save();

    // Add the transaction to the user's transaction history
    user.transactions.push(transaction._id);
    await user.save();

    res.status(201).json({
      success: true,
      transaction,
      message: `Transaction ${isSuccess ? 'completed' : 'failed'}`,
    });
  } catch (error) {
    res.status(500);
    throw new Error('Transaction failed');
  }
});

// Placeholder function for transaction processing logic
function processTransaction() {
  // Implement the actual logic to handle transactions
  // For now, we'll simulate a successful transaction
  return true;
}

module.exports ={
    transaction
}
