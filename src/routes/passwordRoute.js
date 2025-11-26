const express = require('express');
const router = express.Router();
const { forgotPassword, verifyOtp, resetPassword } = require('../controllers/passwordController');

//forgot password route
router.post('/forgot-password', forgotPassword);

//verify otp route
router.post('/verify-otp', verifyOtp);

//reset password route
router.post('/reset-password', resetPassword);

module.exports = router;