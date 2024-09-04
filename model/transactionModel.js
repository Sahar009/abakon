const mongoose = require('mongoose');

const transactionSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['airtime', 'data', 'bill_payment','examination'], // Example transaction types
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'successful', 'failed'],
    default: 'pending',
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
