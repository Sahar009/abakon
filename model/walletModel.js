const mongoose = require('mongoose');

const walletSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  balance: {
    type: Number,
    default: 0,
  },
  currency: {
    type: String,
    default: 'NGR', // Or whatever currency you are using
  },
  transactions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
  }],
}, {
  timestamps: true,
});

const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = Wallet;
