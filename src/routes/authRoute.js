const express = require('express');
const router = express.Router();
const { register,
    login,
    refreshToken,
    changeEmail,
    verifyEmailChange,
} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const refreshTokenMiddleware = require('../middleware/refreshTokenMiddleware');
const { uploadAvatar } = require('../helper/multer');

//register route
router.post('/register', register);
//login route
router.post('/login', login);

//refresh token route
router.post('/refresh-token', refreshTokenMiddleware, refreshToken);

//change email route
router.post('/change-email', authMiddleware, changeEmail);

//verify email change route
router.post('/verify-email-change', authMiddleware, verifyEmailChange);



module.exports = router;