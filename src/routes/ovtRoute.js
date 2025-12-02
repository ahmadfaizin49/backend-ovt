const express = require('express');
const router = express.Router();
const { createOvt,
    updateOvt
} = require('../controllers/ovtController')
const authMiddleware = require('../middleware/authMiddleware');

//create overtime route
router.post('/create', authMiddleware, createOvt);

//update overtime route
router.put('/update/:id', authMiddleware, updateOvt);

module.exports = router;