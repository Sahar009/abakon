const asyncHandler = require('express-async-handler');
const transactionService = require('../services/TransactionServices');


const transactionController = asyncHandler(async (req, res) => {
  const { userId, type, amount, phoneNumber } = req.body;

  // Validate input
  if (!userId || !type || !amount || !phoneNumber) {
   
    res.status(400);
    throw new Error('Please provide all required fields');
   
  }

  try {
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
