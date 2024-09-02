const async_handler = require('express-async-handler');
const Listener = require('../Model/listenerModel');
const jwt = require('jsonwebtoken');

const listenerProtect = async_handler(async (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer')) {
      res.status(401);
      throw new Error('Not authorized, please login');
    }

    const token = authorizationHeader.split(' ')[1];
    console.log('Received token:', token);

    // Verify Token
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    // Get user id from token
    const listener = await Listener.findById(verified.id).select("-password");

    if (!listener) {
      res.status(401);
      throw new Error("User not found");
    }
    req.user = listener;
    next();
  } catch (error) {
    res.status(401);
    throw new Error("Not authorized, please login");
  }
});

module.exports = listenerProtect;
