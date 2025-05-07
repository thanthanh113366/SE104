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
  checkAvailability
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
 * @route GET /api/bookings/:id
 * @desc Lấy chi tiết đặt sân
 * @access Private
 */
router.get('/:id', authenticate, getBookingById);

/**
 * @route GET /api/bookings/user
 * @desc Lấy danh sách đặt sân của user
 * @access Private
 */
router.get('/user', authenticate, getUserBookings);

/**
 * @route GET /api/bookings/owner
 * @desc Lấy danh sách đặt sân của owner
 * @access Private (Owner)
 */
router.get('/owner', authenticate, getOwnerBookings);

/**
 * @route PUT /api/bookings/:id/status
 * @desc Cập nhật trạng thái đặt sân
 * @access Private (Owner)
 */
router.put('/:id/status', [
  authenticate,
  check('status', 'Trạng thái không hợp lệ').isIn(['pending', 'confirmed', 'completed', 'cancelled'])
], updateBookingStatus);

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

module.exports = router; 