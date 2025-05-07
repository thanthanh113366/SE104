const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const {
  createPayment,
  getPaymentById,
  getPaymentByBooking,
  getUserPayments,
  getOwnerPayments,
  refundPayment,
  handleWebhook
} = require('../controllers/paymentController');

/**
 * @route POST /api/payments
 * @desc Tạo thanh toán mới
 * @access Private
 */
router.post('/', [
  authenticate,
  check('bookingId', 'ID đặt sân không được để trống').notEmpty(),
  check('paymentMethod', 'Phương thức thanh toán không được để trống').notEmpty()
], createPayment);

/**
 * @route GET /api/payments/:id
 * @desc Lấy chi tiết thanh toán
 * @access Private
 */
router.get('/:id', authenticate, getPaymentById);

/**
 * @route GET /api/payments/booking/:bookingId
 * @desc Lấy thanh toán theo booking
 * @access Private
 */
router.get('/booking/:bookingId', authenticate, getPaymentByBooking);

/**
 * @route GET /api/payments/user
 * @desc Lấy thanh toán của user
 * @access Private
 */
router.get('/user', authenticate, getUserPayments);

/**
 * @route GET /api/payments/owner
 * @desc Lấy thanh toán của owner
 * @access Private (Owner)
 */
router.get('/owner', authenticate, getOwnerPayments);

/**
 * @route POST /api/payments/:id/refund
 * @desc Hoàn tiền
 * @access Private (Admin)
 */
router.post('/:id/refund', authenticate, refundPayment);

/**
 * @route POST /api/payments/webhook
 * @desc Webhook xử lý sự kiện từ Stripe
 * @access Public
 */
router.post('/webhook', handleWebhook);

module.exports = router; 