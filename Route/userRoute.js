const express = require('express');
const { registerUser, activateAccount, loginUser,logOutUser,getUser,loggedInStatus,ChangePassword, updateTransactionPin,resendActivationToken } = require('../controller/userController');
const protect = require('../middleware/Authmiddleware');
const router = express.Router()


router.post("/register",registerUser)
router.post('/activate', activateAccount)
router.post('/login', loginUser)
router.post('/logout', logOutUser);
router.get('/getuser',protect, getUser);
router.get('/loggedin', loggedInStatus);
// router.patch('/updateuser',protect, UpdateUser);
router.patch('/changepassword',protect, ChangePassword);
router.patch('/changepin',protect,updateTransactionPin);
router.post('/resendtoken',resendActivationToken)
// router.post('/forgotpassword', forgotpassword)
// router.put('/resetpassword/:resetToken', resetPassword)

module.exports = router