const express = require('express');
const router = express.Router();
const { getProfile,
    updateProfile } = require('../controllers/profileController');
const authMiddleware = require('../middleware/authMiddleware');
const { uploadAvatar } = require('../helper/multer');

//get profile route
router.get('/', authMiddleware, getProfile);

//update profile route
router.patch('/update', authMiddleware, uploadAvatar.single('avatar'), updateProfile);
module.exports = router;