const express = require('express');
const router = express.Router();
const { register, login, refreshToken, me } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

//register route
router.post('/register', register);
//login route
router.post('/login', login);

//refresh token route
router.post('/refresh-token', refreshToken);

//me route
router.get('/me', authMiddleware, me);


module.exports = router;