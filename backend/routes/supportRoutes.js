const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const {
  createSupport,
  getSupportById,
  getUserSupports,
  getAdminSupports,
  updateSupportStatus,
  addReply,
  rateSupport,
  getSupportStats
} = require('../controllers/supportController');

/**
 * @route POST /api/supports
 * @desc Tạo ticket hỗ trợ mới
 * @access Private
 */
router.post('/', [
  authenticate,
  check('title', 'Tiêu đề không được để trống').notEmpty(),
  check('description', 'Mô tả không được để trống').notEmpty(),
  check('category', 'Danh mục không được để trống').notEmpty(),
  check('priority', 'Độ ưu tiên không được để trống').isIn(['low', 'medium', 'high'])
], createSupport);

/**
 * @route GET /api/supports/:id
 * @desc Lấy chi tiết ticket
 * @access Private
 */
router.get('/:id', authenticate, getSupportById);

/**
 * @route GET /api/supports/user
 * @desc Lấy danh sách ticket của user
 * @access Private
 */
router.get('/user', authenticate, getUserSupports);

/**
 * @route GET /api/supports/admin
 * @desc Lấy danh sách ticket cho admin
 * @access Private (Admin)
 */
router.get('/admin', authenticate, getAdminSupports);

/**
 * @route PUT /api/supports/:id/status
 * @desc Cập nhật trạng thái ticket
 * @access Private (Admin)
 */
router.put('/:id/status', [
  authenticate,
  check('status', 'Trạng thái không hợp lệ').isIn(['open', 'in_progress', 'closed'])
], updateSupportStatus);

/**
 * @route POST /api/supports/:id/reply
 * @desc Thêm phản hồi cho ticket
 * @access Private
 */
router.post('/:id/reply', [
  authenticate,
  check('message', 'Nội dung phản hồi không được để trống').notEmpty()
], addReply);

/**
 * @route POST /api/supports/:id/rate
 * @desc Đánh giá chất lượng hỗ trợ
 * @access Private
 */
router.post('/:id/rate', [
  authenticate,
  check('rating', 'Đánh giá phải từ 1-5').isInt({ min: 1, max: 5 }),
  check('feedback', 'Phản hồi không được để trống').notEmpty()
], rateSupport);

/**
 * @route GET /api/supports/stats
 * @desc Lấy thống kê hỗ trợ
 * @access Private (Admin)
 */
router.get('/stats', authenticate, getSupportStats);

module.exports = router; 