const express = require('express');
const router = express.Router();

// Import routes
const authRoutes = require('./authRoutes');
const courtRoutes = require('./courtRoutes');
const bookingRoutes = require('./bookingRoutes');
const reviewRoutes = require('./reviewRoutes');
// const paymentRoutes = require('./paymentRoutes');
const supportRoutes = require('./supportRoutes');
const adminRoutes = require('./adminRoutes');
const ownerRoutes = require('./ownerRoutes');
const renterRoutes = require('./renterRoutes');

// Mounting routes
router.use('/auth', authRoutes);
router.use('/courts', courtRoutes);
router.use('/bookings', bookingRoutes);
router.use('/reviews', reviewRoutes);
// router.use('/payments', paymentRoutes);
router.use('/supports', supportRoutes);
router.use('/admin', adminRoutes);
router.use('/owner', ownerRoutes);
router.use('/renter', renterRoutes);

// Thêm route mặc định cho API
router.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Sports Court Booking API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      courts: '/api/courts',
      bookings: '/api/bookings',
      reviews: '/api/reviews',
      // payments: '/api/payments',
      supports: '/api/supports',
      admin: '/api/admin',
      owner: '/api/owner',
      renter: '/api/renter'
    }
  });
});

module.exports = router; 