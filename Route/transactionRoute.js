const express = require('express');
const { registerUser, activateAccount, loginUser,logOutUser,getUser } = require('../controller/userController');
const protect = require('../middleware/Authmiddleware');
const { transaction } = require('../controller/transactionController');
const router = express.Router()


router.post("/transaction",transaction)





module.exports = router