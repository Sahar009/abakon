const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'please add a name'],
  },
  lastName:{
    type: String,
    required: [true, 'please add a name'],
  },
  email: {
    type: String,
    required: [true, 'please add an email'],
    unique: true,
    trim: true,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'please enter a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'please add a password'],
    minLenght: [6, 'password must be up to 6 characters'],
  },
//   frist, lastname, email, phoneNumber, state, transactionPin
 
  phone: {
    type: String,
    // unique: true,
    // trim: true,
    default: '+234',
  },
  transactionPin:{
    type:String,
    minLenght: [4, 'transaction Pin must be up to 4 characters'],

  },
transactions: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Transactions', 
}],
},
{
  timestamps: true,
});

// encrypt password before saving to DB
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
      return next();
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next();
  });
  

const User = mongoose.model("user", userSchema);
module.exports = User;