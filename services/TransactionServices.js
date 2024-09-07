const User = require('../model/userModel');
const Transaction = require('../model/transactionModel');
const fetch = require('node-fetch');

const processAirtimeTransaction = async ({ userId, type, amount, phoneNumber }) => {
  // Find the user
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Create a new transaction
  let transaction = new Transaction({
    user: user._id,
    type,
    amount,
    phoneNumber,
  });

  // External API call to buy airtime
  const isSuccess = await executeAirtimePurchase({ amount, phoneNumber });

  // Update transaction status
  transaction.status = isSuccess ? 'successful' : 'failed';

  // Save the transaction
  transaction = await transaction.save();

  // Add the transaction to the user's transaction history
  user.transactions.push(transaction._id);
  await user.save();

  return {
    success: isSuccess,
    transaction,
    message: `Transaction ${isSuccess ? 'completed' : 'failed'}`,
  };
};

const executeAirtimePurchase = async ({ amount, phoneNumber }) => {
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      public_key: process.env.PUBLIC_KEY,  // Use environment variables
      amount,
      phone: phoneNumber,
      service_name: 'airtel'
    })
  };

  try {
    const response = await fetch('https://strowallet.com/api/buyairtime/request/', options);
    const data = await response.json();

    return data.success;  // Adjust based on API's response structure
  } catch (error) {
    console.error('Airtime purchase failed:', error);
    throw new Error('Failed to process airtime purchase');
  }
};

module.exports = {
  processAirtimeTransaction
};
