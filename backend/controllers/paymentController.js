const { Payment, Booking, Court } = require('../models');
const { validationResult } = require('express-validator');
const momoService = require('../services/momoService');

/**
 * @desc    Tạo thanh toán MoMo
 * @route   POST /api/payments/momo/create
 * @access  Private
 */
const createMoMoPayment = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { bookingId } = req.body;

    let booking, court;
    let isTemporaryBooking = bookingId.startsWith('TEMP_');

    if (isTemporaryBooking) {
      // Temporary booking - create dummy data for MoMo payment
      console.log('Processing temporary booking ID:', bookingId);
      
      // For temporary booking, we need booking data from request body
      const { bookingData } = req.body;
      if (!bookingData) {
        return res.status(400).json({ message: 'Thiếu thông tin đặt sân cho thanh toán tạm thời' });
      }

      booking = bookingData;
      court = { 
        id: bookingData.courtId, 
        name: bookingData.courtName,
        ownerId: bookingData.ownerId 
      };
    } else {
      // Real booking - validate as before
      booking = await Booking.findById(bookingId);
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
      const existingPayments = await Payment.findByBooking(bookingId);
      const successfulPayment = existingPayments.find(p => p.status === 'completed');
      if (successfulPayment) {
        return res.status(400).json({ message: 'Đặt sân này đã được thanh toán' });
      }

      // Lấy thông tin sân
      court = await Court.findById(booking.courtId);
      if (!court) {
        return res.status(404).json({ message: 'Không tìm thấy sân' });
      }
    }

    // Chuẩn bị dữ liệu cho MoMo
    const momoData = {
      bookingId: bookingId,
      userId: req.user.uid,
      courtId: booking.courtId || court.id,
      amount: booking.totalPrice,
      courtName: court.name,
      date: booking.date
    };

    // Tạo payment với MoMo
    const momoResult = await momoService.createPayment(momoData);

    if (!momoResult.success) {
      return res.status(400).json({ 
        message: 'Không thể tạo thanh toán MoMo',
        error: momoResult.message
      });
    }

    // Tạo payment record
    const payment = new Payment({
      bookingId: bookingId,
      userId: req.user.uid,
      ownerId: court.ownerId,
      courtId: booking.courtId,
      amount: booking.totalPrice,
      method: 'e_wallet',
      provider: 'momo',
      status: 'pending',
      transactionId: momoResult.orderId,
      metadata: {
        requestId: momoResult.requestId,
        orderId: momoResult.orderId,
        qrCodeUrl: momoResult.qrCodeUrl
      }
    });

    await payment.save();

    res.status(201).json({
      message: 'Tạo thanh toán MoMo thành công',
      payment: {
        id: payment.id,
        amount: payment.amount,
        status: payment.status
      },
      momoUrl: momoResult.payUrl,
      qrCodeUrl: momoResult.qrCodeUrl
    });
  } catch (error) {
    console.error('Lỗi tạo thanh toán MoMo:', error);
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
    const payments = await Payment.findByBooking(req.params.bookingId);
    const payment = payments.length > 0 ? payments[0] : null;
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
    const payments = await Payment.findByUser(req.user.uid, { limit: Number(limit) });

    const total = payments.length;

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
 * @desc    Xử lý callback từ MoMo
 * @route   POST /api/payments/momo/callback
 * @access  Public (MoMo server)
 */
const handleMoMoCallback = async (req, res) => {
  try {
    console.log('MoMo Callback received:', req.body);

    const callbackData = req.body;
    
    // Xác thực signature từ MoMo
    const isValidSignature = momoService.verifyCallback(callbackData);
    if (!isValidSignature) {
      console.error('Invalid MoMo signature');
      return res.status(400).json({ message: 'Invalid signature' });
    }

    const { orderId, resultCode, transId, extraData } = callbackData;

    // Parse extraData để lấy bookingId
    let bookingData;
    try {
      bookingData = JSON.parse(extraData);
    } catch (error) {
      console.error('Error parsing extraData:', error);
      return res.status(400).json({ message: 'Invalid extraData' });
    }

    // Tìm payment record
    const payment = await Payment.findByTransactionId(orderId);
    if (!payment) {
      console.error('Payment not found for orderId:', orderId);
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Cập nhật payment status
    if (resultCode === 0) {
      // Thanh toán thành công
      await Payment.updateStatus(payment.id, 'completed', {
        paymentDate: new Date(),
        transactionId: transId,
        metadata: {
          ...payment.metadata,
          momoTransId: transId,
          resultCode: resultCode
        }
      });

      // Cập nhật booking status
      const booking = await Booking.findById(bookingData.bookingId);
      if (booking) {
        booking.status = 'confirmed';
        await booking.save();
      }

      console.log('Payment completed successfully:', orderId);
    } else {
      // Thanh toán thất bại
      await Payment.updateStatus(payment.id, 'failed', {
        metadata: {
          ...payment.metadata,
          resultCode: resultCode,
          failureReason: callbackData.message
        }
      });

      console.log('Payment failed:', orderId, 'Result code:', resultCode);
    }

    // Trả về response cho MoMo
    res.status(200).json({ message: 'Callback processed successfully' });
  } catch (error) {
    console.error('Error handling MoMo callback:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Xử lý return URL từ MoMo (user quay lại app)
 * @route   GET /api/payments/momo/return
 * @access  Public
 */
const handleMoMoReturn = async (req, res) => {
  try {
    console.log('MoMo Return URL accessed:', req.query);

    const { orderId, resultCode, extraData } = req.query;

    // Parse extraData
    let bookingData;
    try {
      bookingData = JSON.parse(extraData);
    } catch (error) {
      console.error('Error parsing extraData in return:', error);
      return res.redirect(`${process.env.CLIENT_URL}/payment/error`);
    }

    if (resultCode === '0') {
      // Thanh toán thành công
      res.redirect(`${process.env.CLIENT_URL}/payment/success?bookingId=${bookingData.bookingId}&orderId=${orderId}`);
    } else {
      // Thanh toán thất bại
      res.redirect(`${process.env.CLIENT_URL}/payment/error?reason=payment_failed&bookingId=${bookingData.bookingId}`);
    }
  } catch (error) {
    console.error('Error handling MoMo return:', error);
    res.redirect(`${process.env.CLIENT_URL}/payment/error?reason=server_error`);
  }
};

/**
 * @desc    Kiểm tra trạng thái thanh toán
 * @route   GET /api/payments/momo/status/:orderId
 * @access  Private
 */
const checkMoMoPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Tìm payment trong database
    const payment = await Payment.findByTransactionId(orderId);
    if (!payment) {
      return res.status(404).json({ message: 'Không tìm thấy thanh toán' });
    }

    // Kiểm tra quyền truy cập
    if (payment.userId !== req.user.uid && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền kiểm tra thanh toán này' });
    }

    // Kiểm tra với MoMo nếu cần
    if (payment.status === 'pending') {
      try {
        const momoStatus = await momoService.checkTransactionStatus(
          orderId, 
          payment.metadata.requestId
        );
        
        if (momoStatus.resultCode === 0 && payment.status !== 'completed') {
          // Cập nhật status nếu MoMo đã confirm
          await Payment.updateStatus(payment.id, 'completed', {
            paymentDate: new Date(),
            transactionId: momoStatus.transId
          });
          payment.status = 'completed';
        }
      } catch (error) {
        console.error('Error checking MoMo status:', error);
      }
    }

    res.json({
      payment: {
        id: payment.id,
        orderId: orderId,
        status: payment.status,
        amount: payment.amount,
        createdAt: payment.createdAt,
        paymentDate: payment.paymentDate
      }
    });
  } catch (error) {
    console.error('Error checking payment status:', error);
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
  createMoMoPayment,
  handleMoMoCallback,
  handleMoMoReturn,
  checkMoMoPaymentStatus,
  getPaymentById,
  getPaymentByBooking,
  getUserPayments,
  getOwnerPayments,
  refundPayment
}; 