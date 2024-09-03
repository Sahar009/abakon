const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendMail = require('../utility/sendMail');
const User = require('../model/userModel');

// Function to generate a JWT token with user id
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '365d' });
};

// Function to generate a 4-character activation token
const generateActivationToken = () => {
    return Math.random().toString(36).substring(2, 6).toUpperCase(); // Generates a random 4-character string
};

const registerUser = asyncHandler(async (req, res, next) => {
    const { firstName, lastName, phone, email, password, transactionPin } = req.body;

    // Validation
    if (!firstName || !lastName || !phone || !email || !password || !transactionPin) {
        res.status(400);
        throw new Error('Please fill in all required fields');
    }

    if (password.length < 6) {
        res.status(400);
        throw new Error('Password must be at least 6 characters');
    }

    if (transactionPin.length < 4) {
        res.status(400);
        throw new Error('Transaction Pin must be at least 4 characters');
    }

    // Check if the user email already exists
    const userExist = await User.findOne({ email });

    if (userExist) {
        res.status(400);
        throw new Error('Email has already been registered');
    }

    // Generate 4-character activation token
    const activationToken = generateActivationToken();

    // Hash the transaction pin
    const hashedTransactionPin = await bcrypt.hash(transactionPin, 12);

    // Create the user with activation token and inactive status
    const user = new User({
        firstName,
        lastName,
        phone,
        email,
        password,
        transactionPin: hashedTransactionPin,
        activationToken,  // Ensure this field is set
        isActive: false,
    });

    try {
        // Send activation email
        await sendMail({
            to: user.email,
            subject: 'Activate Your Account',
            message: `Use this token to verify your account: ${activationToken}`
        });

        // Save user to the database
        await user.save();

        res.status(201).json({
            success: true,
            message: `Please check your email: ${user.email} to activate your account!`,
        });
    } catch (error) {
        return next(new Error(error, 500));
    }
});




const activateAccount = asyncHandler(async (req, res) => {
    const { activationToken } = req.body;

    if (!activationToken) {
        res.status(400);
        throw new Error('Invalid token');
    }

    // Find user by activation token
    const user = await User.findOne({ activationToken });

    if (!user) {
        res.status(400);
        throw new Error('Invalid or expired activation token');
    }

    // Activate the user account
    user.isActive = true;
    user.activationToken = undefined; // Remove the token after activation
    await user.save(); // Save the updated user object to the database

    // Generate a token for the now active user
    const token = generateToken(user._id);

    // Return the token in the response
    res.status(200).json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        email: user.email,
        token, // Return the token to be stored in the mobile app's local storage
    });
});


const loginUser = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
        res.status(400);
        throw new Error('Please provide both email and password');
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
        res.status(400);
        throw new Error('Invalid email or password');
    }

    // Check if the account is active
    if (!user.isActive) {
        res.status(400);
        throw new Error('Please activate your account before logging in');
    }

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        res.status(400);
        throw new Error('Invalid email or password');
    }

    // Generate a JWT token for the user
    const token = generateToken(user._id);

    // Return the token and user details in the response
    res.status(200).json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        email: user.email,
        token, // Return the token to be stored in the mobile app's local storage
    });
});



const logOutUser = asyncHandler(async (req, res) => {
    
    return res.status(200).json({ message: 'logout successfully' });
 });
 
// Get Userconst 
    const getUser = asyncHandler(async(req,res) =>{
        const user = await User.findById(req.user._id)
        if (user){
            const { _id, firstName, lastName, phone, email,transactions } = user;
            res.status(200).json(
                {
                    _id, firstName, lastName, phone, email,transactions
                
            });
        
        }else{
            res.status(400);
            throw new Error('User not Found')
        }
        
        })


module.exports = {
    registerUser,
    activateAccount,
    loginUser,
    logOutUser,
    getUser
};
