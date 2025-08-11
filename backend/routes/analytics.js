const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// Sales analytics for products/accessories
router.get('/sales', analyticsController.getSalesAnalytics);

module.exports = router;
