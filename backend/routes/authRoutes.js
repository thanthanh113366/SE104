const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const { verifyToken, authorize } = require('../middleware/auth');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  '/register',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('displayName', 'Name is required').not().isEmpty(),
    check('firebaseUid', 'Firebase UID is required').not().isEmpty(),
    check('role', 'Role must be admin, owner, or renter').isIn(['admin', 'owner', 'renter'])
  ],
  authController.registerUser
);

// @route   PUT /api/auth/role
// @desc    Update user role
// @access  Private
router.put(
  '/role',
  verifyToken,
  authController.updateUserRole
);

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get(
  '/me',
  verifyToken,
  authController.getCurrentUser
);

module.exports = router; 