const express = require('express');
const router = express.Router();
const { register,
    login,
    refreshToken,
    changeEmail,
    verifyEmailChange,
    me,
    updateProfile } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

//register route
router.post('/register', register);
//login route
router.post('/login', login);

//refresh token route
router.post('/refresh-token', refreshToken);

//me route
router.get('/me', authMiddleware, me);

//change email route
router.post('/change-email', authMiddleware, changeEmail);

//verify email change route
router.post('/verify-email-change', authMiddleware, verifyEmailChange);

//update profile route
router.put('/update-profile', authMiddleware, updateProfile);



module.exports = router;