const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendMail = require('../utility/sendMail');
const User = require('../model/userModel');
const strowallet = require('stream/consumers')
// Function to generate a JWT token with user id
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '365d' });
};

// Function to generate a 4-character activation token
const generateActivationToken = () => {
    return Math.random().toString(36).substring(2, 6).toUpperCase(); // Generates a random 4-character string
};

// register user

const registerUser = asyncHandler(async (req, res, next) => {
    const { firstName, lastName, phone, email, password, transactionPin, state } = req.body;

    // Validation
    if (!firstName || !lastName || !phone || !email || !password || !transactionPin || !state) {
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

    // Validate phone number
    if (!/^\d{11}$/.test(phone)) {
        res.status(400);
        throw new Error('Phone number must be exactly 11 digits and contain only numbers');
    }

    // Check if the user email or phone already exists
    const emailExists = await User.findOne({ email });
    const phoneExists = await User.findOne({ phone });

    if (emailExists) {
        res.status(400);
        throw new Error('Email has already been registered');
    }

    if (phoneExists) {
        res.status(400);
        throw new Error('Phone number has already been registered');
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
        state,
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
        token, 
        success: true,
        message: `Account activated successfully`,
    });
});

// resend activationg taoken
const resendActivationToken = asyncHandler(async (req, res, next) => {
    const { email } = req.body;

    // Validate input
    if (!email) {
        res.status(400);
        throw new Error('Please provide an email');
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Check if the user is already active
    if (user.isActive) {
        res.status(400);
        throw new Error('Account is already active');
    }

    // Generate a new activation token
    const activationToken = generateActivationToken();

    // Update the user with the new activation token
    user.activationToken = activationToken;
    await user.save();

    try {
        // Resend activation email
        await sendMail({
            to: user.email,
            subject: 'Resend: Activate Your Account',
            message: `Use this token to verify your account: ${activationToken}`
        });

        res.status(200).json({
            success: true,
            message: `A new activation token has been sent to your email: ${user.email}`,
        });
    } catch (error) {
        return next(new Error('Failed to send activation email', 500));
    }
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
        success:true,
        message: 'Login successful',
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
            const { _id, firstName, lastName, phone, email,transactions,state, isActive,walletBalance } = user;
            res.status(200).json(
                {
                    _id, firstName, lastName, phone, email,state,transactions, isActive,walletBalance
                
            });
        
        }else{
            res.status(400);
            throw new Error('User not Found')
        }
        
        })

        
        const loggedInStatus = asyncHandler(async (req, res) => {
            // Get the token from the Authorization header
            const token = req.headers.authorization?.split(' ')[1];
        
            // If no token is found, return false
            if (!token) {
                return res.status(400).json({ isLoggedIn: false });
            }
        
            try {
                // Verify the token
                const verified = jwt.verify(token, process.env.JWT_SECRET);
        
                // If verified, return true
                return res.status(200).json({ isLoggedIn: !!verified });
            } catch (error) {
                // If verification fails, return false
                return res.status(400).json({
                     isLoggedIn: false });
            }
        });

        const ChangePassword = asyncHandler(async (req, res) => {
            const user = await User.findById(req.user._id);
          
            const { oldPassword, password } = req.body;
          
            if (!user) {
              res.status(400);
              throw new Error("User Not Found, sign up");
            }
            // validation
            if (!oldPassword || !password) {
              res.status(400);
              throw new Error("please add old and new password ");
            }
          
            //check  if old password matches passwordin DB
          
            const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password);
          
            // Sava new password
            if (user && passwordIsCorrect) {
              user.password = password;
              await user.save();
              res.status(200).send({
                success:true,
                message:"password change successful"});
            } else {
              res.status(404);
              throw new Error("Old passwword is incorrect ");
            }
          });

    const updateTransactionPin = asyncHandler(async (req, res) => {
            const user = await User.findById(req.user._id);
        
            const { oldTransactionPin, newTransactionPin } = req.body;
        
            // Validation
            if (!user) {
                res.status(400);
                throw new Error('User not found');
            }
        
            if (!oldTransactionPin || !newTransactionPin) {
                res.status(400);
                throw new Error({message:'Please provide both old and new transaction PINs'});
            }
        
            // Check if old transaction PIN matches the one in the DB
            const isOldPinValid = await bcrypt.compare(oldTransactionPin, user.transactionPin);
        
            if (!isOldPinValid) {
                res.status(400);
                throw new Error('Old transaction PIN is incorrect');
            }
        
            // Hash the new transaction PIN
            const hashedNewTransactionPin = await bcrypt.hash(newTransactionPin, 12);
        
            // Update the user’s transaction PIN
            user.transactionPin = hashedNewTransactionPin;
            await user.save();
        
            res.status(200).json({
                success: true,
                message: 'Transaction PIN updated successfully',
            });
        });
module.exports = {
    registerUser,
    activateAccount,
    loginUser,
    logOutUser,
    getUser,
    loggedInStatus,
    ChangePassword,
    updateTransactionPin,
    resendActivationToken
};
