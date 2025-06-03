const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const ownerController = require('../controllers/ownerController');

// Dashboard stats
router.get('/dashboard/stats', authenticate, ownerController.getDashboardStats);

module.exports = router; 