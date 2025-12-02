const express = require('express');
const router = express.Router();
const { createOvt,
    updateOvt,
    deleteOvt
} = require('../controllers/ovtController')
const authMiddleware = require('../middleware/authMiddleware');

//create overtime route
router.post('/create', authMiddleware, createOvt);

//update overtime route
router.put('/update/:id', authMiddleware, updateOvt);

//delete overtime route
router.delete('/delete/:id', authMiddleware, deleteOvt);

module.exports = router;