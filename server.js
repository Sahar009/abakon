const express = require("express");
const mongoose = require("mongoose");
const cloudinary = require('cloudinary').v2;
const cors = require('cors');
const dotenv = require("dotenv").config();
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const errorHandler = require("./middleware/errorMiddleware");
const userRoute = require("./Route/userRoute");
const transactionRoute = require('./Route/transactionRoute');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Route middleware
app.use("/api/users", userRoute);
app.use('/api/transaction', transactionRoute);

// Error handler middleware
app.use(errorHandler);

// Fallback error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Root route
app.get("/", (req, res) => {
  res.send("Home page");
});

// Database connection and server start
mongoose.connect(process.env.MONGO_URI, {

})
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => console.log(err));
