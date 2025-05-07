const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { Court, Booking } = require('../models');
const { authenticate } = require('../middleware/auth');
const courtController = require('../controllers/courtController');

// Routes cho owner (phải đặt TRƯỚC routes với id params)
router.get('/owner', authenticate, (req, res) => {
  Court.findByOwnerId(req.user.uid)
    .then(courts => res.json({ courts }))
    .catch(error => res.status(500).json({ message: error.message }));
});

router.get('/owner/:ownerId', courtController.getCourtsByOwner);

// Routes cơ bản
router.get('/', courtController.getCourts);
router.post('/', authenticate, courtController.createCourt);

// Routes với id params
router.get('/:id', courtController.getCourtById);
router.put('/:id', authenticate, courtController.updateCourt);
router.delete('/:id', authenticate, courtController.deleteCourt);

// Subroutes
router.get('/:id/schedule', courtController.getCourtSchedule);
router.get('/:id/reviews', courtController.getCourtReviews);

router.get('/:id/bookings', authenticate, (req, res) => {
  Court.findById(req.params.id)
    .then(court => {
      if (!court) {
        return res.status(404).json({ message: 'Không tìm thấy sân' });
      }
      if (court.ownerId !== req.user.uid && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Không có quyền xem booking của sân này' });
      }
      
      Booking.findByCourtId(req.params.id)
        .then(bookings => res.json({ bookings }))
        .catch(error => res.status(500).json({ message: error.message }));
    })
    .catch(error => res.status(500).json({ message: error.message }));
});

module.exports = router; 