const express = require('express');
const router = express.Router();
const { createOvt } = require('../controllers/ovtController')
const authMiddleware = require('../middleware/authMiddleware');

//create overtime route
router.post('/create', authMiddleware, createOvt);

module.exports = router;