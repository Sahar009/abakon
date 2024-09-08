const asyncHandler = require('express-async-handler');
const User = require('../model/userModel');
const Transaction = require('../model/transactionModel');
const transactionService = require('../services/TransactionServices');

const transactionController = asyncHandler(async (req, res) => {
  const { userId, type, amount, phoneNumber } = req.body;

  // Validate input
  if (!userId || !type || !amount || !phoneNumber) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  // Fetch user and check wallet balance
  const user = await User.findById(userId);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.walletBalance < amount) {
    res.status(400);
    throw new Error('Insufficient funds');
  }

  try {
    // Deduct the amount from the user's wallet balance
    user.walletBalance -= amount;
    await user.save();

    // Call the service to process the transaction
    const result = await transactionService.processAirtimeTransaction({
      userId,
      type,
      amount,
      phoneNumber
    });

    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({ error: 'Transaction failed', details: error.message });
  }
});

module.exports = {
  transactionController
};
