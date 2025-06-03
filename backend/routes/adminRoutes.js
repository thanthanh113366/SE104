const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// Dashboard stats
router.get('/dashboard/stats', authenticate, adminController.getDashboardStats);

module.exports = router; 