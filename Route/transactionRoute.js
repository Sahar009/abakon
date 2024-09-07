const express = require('express');
const { registerUser, activateAccount, loginUser,logOutUser,getUser } = require('../controller/userController');
const protect = require('../middleware/Authmiddleware');
const {  transactionController } = require('../controller/transactionController');
const router = express.Router()


router.post("/airtime", transactionController)





module.exports = router