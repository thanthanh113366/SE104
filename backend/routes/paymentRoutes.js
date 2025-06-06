const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const {
  createMoMoPayment,
  handleMoMoCallback,
  handleMoMoReturn,
  checkMoMoPaymentStatus,
  getPaymentById,
  getPaymentByBooking,
  getUserPayments,
  getOwnerPayments,
  refundPayment
} = require('../controllers/paymentController');

/**
 * @route POST /api/payments/momo/create
 * @desc Tạo thanh toán MoMo
 * @access Private
 */
router.post('/momo/create', [
  authenticate,
  check('bookingId', 'ID đặt sân không được để trống').notEmpty()
], createMoMoPayment);

/**
 * @route POST /api/payments/momo/callback
 * @desc Xử lý callback từ MoMo
 * @access Public (MoMo server)
 */
router.post('/momo/callback', handleMoMoCallback);

/**
 * @route GET /api/payments/momo/return
 * @desc Xử lý return URL từ MoMo
 * @access Public
 */
router.get('/momo/return', handleMoMoReturn);

/**
 * @route GET /api/payments/momo/status/:orderId
 * @desc Kiểm tra trạng thái thanh toán MoMo
 * @access Private
 */
router.get('/momo/status/:orderId', authenticate, checkMoMoPaymentStatus);

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

// Legacy Stripe webhook removed - now using MoMo

module.exports = router; 