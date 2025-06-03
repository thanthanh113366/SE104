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
  getAllBookings,
  updateBookingStatusAdmin,
  getBookingStats,
  deleteBookingAdmin
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
 * @desc Lấy danh sách đặt sân của user
 * @access Private
 */
router.get('/user', authenticate, getUserBookings);

/**
 * @route GET /api/bookings/reviewable
 * @desc Lấy danh sách đặt sân có thể đánh giá của user
 * @access Private
 */
router.get('/reviewable', authenticate, getReviewableBookings);

/**
 * @route GET /api/bookings/owner
 * @desc Lấy danh sách đặt sân của owner
 * @access Private (Owner)
 */
router.get('/owner', authenticate, getOwnerBookings);

// Admin routes
/**
 * @route GET /api/bookings/admin/all
 * @desc Lấy tất cả đặt sân (Admin only)
 * @access Admin
 */
router.get('/admin/all', authenticate, getAllBookings);

/**
 * @route GET /api/bookings/admin/stats
 * @desc Lấy thống kê đặt sân (Admin only)
 * @access Admin
 */
router.get('/admin/stats', authenticate, getBookingStats);

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
 * @route GET /api/bookings/:id
 * @desc Lấy chi tiết đặt sân
 * @access Private
 */
router.get('/:id', authenticate, getBookingById);

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
 * @route PUT /api/bookings/:bookingId/admin-status
 * @desc Cập nhật trạng thái đặt sân (Admin only)
 * @access Admin
 */
router.put('/:bookingId/admin-status', [
  authenticate,
  check('status', 'Trạng thái không hợp lệ').isIn(['pending', 'confirmed', 'completed', 'cancelled'])
], updateBookingStatusAdmin);

/**
 * @route PUT /api/bookings/:id/cancel
 * @desc Hủy đặt sân
 * @access Private
 */
router.put('/:id/cancel', authenticate, cancelBooking);

/**
 * @route DELETE /api/bookings/:bookingId/admin
 * @desc Xóa đặt sân (Admin only)
 * @access Admin
 */
router.delete('/:bookingId/admin', authenticate, deleteBookingAdmin);

module.exports = router; 