const express = require('express');
const router = express.Router();
const { forgotPassword, verifyOtp, resetPassword, changePassword } = require('../controllers/passwordController');
const authMiddleware = require('../middleware/authMiddleware');

//forgot password route
router.post('/forgot-password', forgotPassword);

//verify otp route
router.post('/verify-otp', verifyOtp);

//reset password route
router.post('/reset-password', resetPassword);

//change password route
router.put('/change-password', authMiddleware, changePassword);

module.exports = router;