const { Payment, Booking, Court } = require('../models');
const { validationResult } = require('express-validator');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * @desc    Tạo thanh toán mới
 * @route   POST /api/payments
 * @access  Private
 */
const createPayment = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { bookingId, paymentMethod } = req.body;

    // Kiểm tra booking tồn tại và thuộc về user
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy đặt sân' });
    }
    if (booking.userId !== req.user.uid) {
      return res.status(403).json({ message: 'Không có quyền thanh toán đặt sân này' });
    }
    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Đặt sân không ở trạng thái chờ thanh toán' });
    }

    // Kiểm tra đã thanh toán chưa
    const existingPayment = await Payment.findOne({ bookingId });
    if (existingPayment) {
      return res.status(400).json({ message: 'Đặt sân này đã được thanh toán' });
    }

    // Lấy thông tin sân
    const court = await Court.findById(booking.courtId);
    if (!court) {
      return res.status(404).json({ message: 'Không tìm thấy sân' });
    }

    // Tính tổng tiền
    const totalAmount = booking.totalPrice;

    // Tạo payment intent với Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount * 100, // Convert to cents
      currency: 'vnd',
      payment_method: paymentMethod,
      confirm: true,
      return_url: `${process.env.CLIENT_URL}/payment/success`,
      metadata: {
        bookingId: booking._id.toString(),
        userId: req.user.uid
      }
    });

    // Tạo payment record
    const payment = new Payment({
      bookingId,
      userId: req.user.uid,
      amount: totalAmount,
      paymentMethod,
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status
    });

    await payment.save();

    // Cập nhật trạng thái booking
    booking.status = 'paid';
    await booking.save();

    res.status(201).json({
      message: 'Thanh toán thành công',
      payment,
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Lỗi tạo thanh toán:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * @desc    Lấy chi tiết thanh toán
 * @route   GET /api/payments/:id
 * @access  Private
 */
const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Không tìm thấy thanh toán' });
    }

    // Kiểm tra quyền xem
    if (payment.userId !== req.user.uid && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền xem thanh toán này' });
    }

    res.json({ payment });
  } catch (error) {
    console.error('Lỗi lấy chi tiết thanh toán:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * @desc    Lấy thanh toán theo booking
 * @route   GET /api/payments/booking/:bookingId
 * @access  Private
 */
const getPaymentByBooking = async (req, res) => {
  try {
    const payment = await Payment.findOne({ bookingId: req.params.bookingId });
    if (!payment) {
      return res.status(404).json({ message: 'Không tìm thấy thanh toán' });
    }

    // Kiểm tra quyền xem
    if (payment.userId !== req.user.uid && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền xem thanh toán này' });
    }

    res.json({ payment });
  } catch (error) {
    console.error('Lỗi lấy thanh toán theo booking:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * @desc    Lấy thanh toán của user
 * @route   GET /api/payments/user
 * @access  Private
 */
const getUserPayments = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const payments = await Payment.find({ userId: req.user.uid })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Payment.countDocuments({ userId: req.user.uid });

    res.json({
      payments,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      totalPayments: total
    });
  } catch (error) {
    console.error('Lỗi lấy thanh toán của user:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * @desc    Lấy thanh toán của owner
 * @route   GET /api/payments/owner
 * @access  Private (Owner)
 */
const getOwnerPayments = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // Lấy danh sách sân của owner
    const courts = await Court.find({ ownerId: req.user.uid });
    const courtIds = courts.map(court => court._id);

    // Lấy danh sách booking của các sân
    const bookings = await Booking.find({ courtId: { $in: courtIds } });
    const bookingIds = bookings.map(booking => booking._id);

    // Lấy danh sách thanh toán
    const payments = await Payment.find({ bookingId: { $in: bookingIds } })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Payment.countDocuments({ bookingId: { $in: bookingIds } });

    res.json({
      payments,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      totalPayments: total
    });
  } catch (error) {
    console.error('Lỗi lấy thanh toán của owner:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * @desc    Hoàn tiền
 * @route   POST /api/payments/:id/refund
 * @access  Private (Admin)
 */
const refundPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Không tìm thấy thanh toán' });
    }

    // Kiểm tra quyền hoàn tiền
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền hoàn tiền' });
    }

    // Kiểm tra trạng thái thanh toán
    if (payment.status !== 'succeeded') {
      return res.status(400).json({ message: 'Không thể hoàn tiền cho thanh toán chưa thành công' });
    }

    // Hoàn tiền qua Stripe
    const refund = await stripe.refunds.create({
      payment_intent: payment.paymentIntentId
    });

    // Cập nhật trạng thái payment
    payment.status = 'refunded';
    payment.refundId = refund.id;
    await payment.save();

    // Cập nhật trạng thái booking
    const booking = await Booking.findById(payment.bookingId);
    booking.status = 'cancelled';
    await booking.save();

    res.json({
      message: 'Hoàn tiền thành công',
      payment
    });
  } catch (error) {
    console.error('Lỗi hoàn tiền:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * @desc    Webhook xử lý sự kiện từ Stripe
 * @route   POST /api/payments/webhook
 * @access  Public
 */
const handleWebhook = async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      return res.status(400).json({ message: `Webhook Error: ${err.message}` });
    }

    // Xử lý các sự kiện
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Lỗi xử lý webhook:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Helper functions
const handlePaymentSuccess = async (paymentIntent) => {
  const payment = await Payment.findOne({ paymentIntentId: paymentIntent.id });
  if (payment) {
    payment.status = 'succeeded';
    await payment.save();

    const booking = await Booking.findById(payment.bookingId);
    booking.status = 'confirmed';
    await booking.save();
  }
};

const handlePaymentFailure = async (paymentIntent) => {
  const payment = await Payment.findOne({ paymentIntentId: paymentIntent.id });
  if (payment) {
    payment.status = 'failed';
    await payment.save();

    const booking = await Booking.findById(payment.bookingId);
    booking.status = 'cancelled';
    await booking.save();
  }
};

module.exports = {
  createPayment,
  getPaymentById,
  getPaymentByBooking,
  getUserPayments,
  getOwnerPayments,
  refundPayment,
  handleWebhook
}; 