const async_handler =require('express-async-handler')

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// const Token = require('../Model/tokenModel')
const crypto = require('crypto');
const sendMail = require('../utility/sendMail');
const User = require('../model/userModel');


//functtion to generate a token with user id
const generateToken = (id) =>{
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: '365d'})
};


const registerUser = async_handler(async (req, res) => {
    const { firstName,lastName,phone, email, password,transactionPin } = req.body;

    // Validation
    if (!firstName||!lastName||!phone|| !email || !password ||!transactionPin) {
        res.status(400);
        throw new Error('Please fill in all required fields');
    }

    if (password.length < 6) {
        res.status(400);
        throw new Error('Password must be at least 6 characters');
    }
    if (transactionPin.length < 4) {
        res.status(400);
        throw new Error('transaction Pin must be at least 4 characters');
    }
    // Check if the user email already exists
    const userExist = await User.findOne({ email });

    if (userExist) {
        res.status(404);
        throw new Error('Email has already been registered');
    }

    // Create a new user
    const user = await User.create({
        name,
        email,
        password,
    });

    // Generate token
    const token = generateToken(user._id);

    // Send token to the client 
    // res.cookie('token', token, {
    //     path: '/',
    //     httpOnly: true,
    //     expires: new Date('9999-12-31T23:59:59Z'),
    //     sameSite: 'none',
    //     secure: true,
    // });

    // Send user data and token in the response
    res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        photo: user.photo,
        token,
    });
});
