const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const {
  createReview,
  getReviewById,
  getCourtReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  addReply,
  getReviewStats,
  canUserReviewBooking
} = require('../controllers/reviewController');

/**
 * @route POST /api/reviews
 * @desc Tạo đánh giá mới
 * @access Private
 */
router.post('/', [
  authenticate,
  check('courtId', 'ID sân không được để trống').notEmpty(),
  check('bookingId', 'ID đặt sân không được để trống').notEmpty(),
  check('rating', 'Đánh giá phải từ 1-5').isInt({ min: 1, max: 5 }),
  check('comment', 'Bình luận không được để trống').notEmpty()
], createReview);

/**
 * @route GET /api/reviews/court/:courtId
 * @desc Lấy đánh giá theo sân
 * @access Public
 */
router.get('/court/:courtId', getCourtReviews);

/**
 * @route GET /api/reviews/user
 * @desc Lấy đánh giá của user
 * @access Private
 */
router.get('/user', authenticate, getUserReviews);

/**
 * @route GET /api/reviews/can-review/:bookingId
 * @desc Kiểm tra xem user có thể đánh giá booking không
 * @access Private
 */
router.get('/can-review/:bookingId', authenticate, canUserReviewBooking);

/**
 * @route GET /api/reviews/stats/:courtId
 * @desc Lấy thống kê đánh giá
 * @access Public
 */
router.get('/stats/:courtId', getReviewStats);

/**
 * @route GET /api/reviews/:id
 * @desc Lấy chi tiết đánh giá
 * @access Public
 */
router.get('/:id', getReviewById);

/**
 * @route PUT /api/reviews/:id
 * @desc Cập nhật đánh giá
 * @access Private
 */
router.put('/:id', [
  authenticate,
  check('rating', 'Đánh giá phải từ 1-5').optional().isInt({ min: 1, max: 5 }),
  check('comment', 'Bình luận không được để trống').optional().notEmpty()
], updateReview);

/**
 * @route DELETE /api/reviews/:id
 * @desc Xóa đánh giá
 * @access Private
 */
router.delete('/:id', authenticate, deleteReview);

/**
 * @route POST /api/reviews/:id/reply
 * @desc Thêm phản hồi cho đánh giá
 * @access Private (Owner)
 */
router.post('/:id/reply', [
  authenticate,
  check('reply', 'Phản hồi không được để trống').notEmpty()
], addReply);

module.exports = router; 