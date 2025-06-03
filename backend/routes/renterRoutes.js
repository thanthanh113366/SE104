const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const renterController = require('../controllers/renterController');

// Dashboard stats
router.get('/dashboard/stats', authenticate, renterController.getDashboardStats);

module.exports = router; 