const express = require('express');
const router = express.Router();
const { createOvt,
    updateOvt,
    deleteOvt,
    getReportMonthlyOvt,
    getReportWeeklyOvt,
    getOvertimeDateRange
} = require('../controllers/ovtController')
const authMiddleware = require('../middleware/authMiddleware');

//create overtime route
router.post('/create', authMiddleware, createOvt);

//update overtime route
router.put('/update/:id', authMiddleware, updateOvt);

//delete overtime route
router.delete('/delete/:id', authMiddleware, deleteOvt);

//get monthly overtime report route
router.get('/report/monthly', authMiddleware, getReportMonthlyOvt);

//get weekly overtime report route
router.get('/report/weekly', authMiddleware, getReportWeeklyOvt);

//get overtime in date range route
router.get('/date-range', authMiddleware, getOvertimeDateRange);

module.exports = router;