const asyncHandler = require('express-async-handler');
const User = require('../Model/userModel');
const Listener = require('../Model/listenerModel');
const jwt = require('jsonwebtoken');

const protect = asyncHandler(async (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;

    // If no token is provided, allow unauthenticated access
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer')) {
      return next();
    }

    const token = authorizationHeader.split(' ')[1];

    // Verify Token
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    // Get user or listener id from token
    const user = await User.findById(verified.id).select('-password');

    if (user) {
      req.user = user;
    } else if (listener) {
      req.listener = listener;
    } else {
      res.status(401);
      throw new Error('User or listener not found');
    }

    next();
  } catch (error) {
    res.status(401);
    throw new Error('Not authorized, please login');
  }
});

module.exports = protect;
