const express = require('express');
const { registerUser } = require('../controller/userController');
// const protect = require('../middleware/Authmiddleware');
const router = express.Router()


router.post("/register",registerUser)
// router.post('/login',protect, loginUser)
// router.post('/logout', logOutUser);
// router.get('/getuser',protect, getUser);
// router.get('/loggedin', loggedInStatus);
// router.patch('/updateuser',protect, UpdateUser);
// router.patch('/changepassword',protect, ChangePassword);
// router.post('/forgotpassword', forgotpassword)
// router.put('/resetpassword/:resetToken', resetPassword)

module.exports = router