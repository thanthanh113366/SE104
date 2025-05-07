const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { register, login, getProfile, updateProfile, changePassword, logout } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

/**
 * @route POST /api/auth/register
 * @desc Đăng ký tài khoản mới
 * @access Public
 */
router.post('/register', [
  check('email', 'Email không hợp lệ').isEmail(),
  check('password', 'Mật khẩu cần ít nhất 6 ký tự').isLength({ min: 6 }),
  check('name', 'Tên không được để trống').notEmpty(),
  check('role', 'Vai trò không hợp lệ').isIn(['renter', 'owner', 'admin'])
], register);

/**
 * @route POST /api/auth/login
 * @desc Đăng nhập
 * @access Public
 */
router.post('/login', [
  check('email', 'Email không hợp lệ').isEmail(),
  check('password', 'Mật khẩu không được để trống').notEmpty()
], login);

/**
 * @route GET /api/auth/profile
 * @desc Lấy thông tin profile của người dùng
 * @access Private
 */
router.get('/profile', authenticate, getProfile);

/**
 * @route PUT /api/auth/profile
 * @desc Cập nhật thông tin profile
 * @access Private
 */
router.put('/profile', authenticate, updateProfile);

/**
 * @route PUT /api/auth/change-password
 * @desc Đổi mật khẩu
 * @access Private
 */
router.put('/change-password', [
  authenticate,
  check('currentPassword', 'Mật khẩu hiện tại không được để trống').notEmpty(),
  check('newPassword', 'Mật khẩu mới cần ít nhất 6 ký tự').isLength({ min: 6 })
], changePassword);

/**
 * @route POST /api/auth/logout
 * @desc Đăng xuất
 * @access Private
 */
router.post('/logout', authenticate, logout);

module.exports = router; 