const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const {
  createBooking,
  getBookingById,
  getUserBookings,
  getOwnerBookings,
  updateBookingStatus,
  cancelBooking,
  getCourtBookings,
  checkAvailability,
  getReviewableBookings,
  cleanupOldPendingBookings
} = require('../controllers/bookingController');

/**
 * @route POST /api/bookings
 * @desc Tạo đặt sân mới
 * @access Private
 */
router.post('/', [
  authenticate,
  check('courtId', 'ID sân không được để trống').notEmpty(),
  check('date', 'Ngày đặt không được để trống').notEmpty(),
  check('startTime', 'Giờ bắt đầu không được để trống').notEmpty(),
  check('endTime', 'Giờ kết thúc không được để trống').notEmpty(),
  check('totalPrice', 'Tổng tiền phải là số').isNumeric()
], createBooking);

/**
 * @route GET /api/bookings/user
 * @desc Lấy danh sách đặt sân của người dùng
 * @access Private
 */
router.get('/user', authenticate, getUserBookings);

/**
 * @route GET /api/bookings/owner
 * @desc Lấy danh sách đặt sân của chủ sân
 * @access Private (Owner)
 */
router.get('/owner', authenticate, getOwnerBookings);

/**
 * @route GET /api/bookings/reviewable
 * @desc Lấy danh sách đặt sân có thể đánh giá
 * @access Private
 */
router.get('/reviewable', authenticate, getReviewableBookings);

/**
 * @route GET /api/bookings/:id
 * @desc Lấy chi tiết đặt sân
 * @access Private
 */
router.get('/:id', authenticate, getBookingById);

/**
 * @route PUT /api/bookings/:id/status
 * @desc Cập nhật trạng thái đặt sân
 * @access Private
 */
router.put('/:id/status', authenticate, updateBookingStatus);

/**
 * @route PUT /api/bookings/:id/cancel
 * @desc Hủy đặt sân
 * @access Private
 */
router.put('/:id/cancel', authenticate, cancelBooking);

/**
 * @route GET /api/bookings/court/:courtId
 * @desc Lấy danh sách đặt sân theo sân
 * @access Private
 */
router.get('/court/:courtId', authenticate, getCourtBookings);

/**
 * @route GET /api/bookings/available/:courtId
 * @desc Kiểm tra thời gian trống
 * @access Public
 */
router.get('/available/:courtId', checkAvailability);

/**
 * @route POST /api/bookings/cleanup
 * @desc Cleanup old pending bookings
 * @access Private
 */
router.post('/cleanup', authenticate, cleanupOldPendingBookings);

module.exports = router; 