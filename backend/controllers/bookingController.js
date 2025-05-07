const { Booking, Court, User } = require('../models');
const { validationResult } = require('express-validator');

/**
 * @desc    Tạo đặt sân mới
 * @route   POST /api/bookings
 * @access  Private
 */
const createBooking = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      courtId,
      date,
      startTime,
      endTime,
      totalPrice,
      note
    } = req.body;

    // Kiểm tra sân tồn tại
    const court = await Court.findById(courtId);
    if (!court) {
      return res.status(404).json({ message: 'Không tìm thấy sân' });
    }

    // Kiểm tra thời gian đặt có hợp lệ
    const isAvailable = await court.checkAvailability(date, startTime, endTime);
    if (!isAvailable) {
      return res.status(400).json({ message: 'Thời gian này đã được đặt' });
    }

    // Tạo booking mới
    const booking = new Booking({
      courtId,
      userId: req.user.uid,
      date,
      startTime,
      endTime,
      totalPrice,
      note,
      status: 'pending'
    });

    await booking.save();

    res.status(201).json({
      message: 'Đặt sân thành công',
      booking
    });
  } catch (error) {
    console.error('Lỗi đặt sân:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * @desc    Lấy chi tiết đặt sân
 * @route   GET /api/bookings/:id
 * @access  Private
 */
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy đặt sân' });
    }

    // Kiểm tra quyền xem
    if (booking.userId !== req.user.uid && req.user.role !== 'admin') {
      const court = await Court.findById(booking.courtId);
      if (court.ownerId !== req.user.uid) {
        return res.status(403).json({ message: 'Không có quyền xem đặt sân này' });
      }
    }

    res.json({ booking });
  } catch (error) {
    console.error('Lỗi lấy chi tiết đặt sân:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * @desc    Lấy danh sách đặt sân của user
 * @route   GET /api/bookings/user
 * @access  Private
 */
const getUserBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = { userId: req.user.uid };
    
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Booking.countDocuments(query);

    res.json({
      bookings,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      totalBookings: total
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách đặt sân:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * @desc    Lấy danh sách đặt sân của owner
 * @route   GET /api/bookings/owner
 * @access  Private (Owner)
 */
const getOwnerBookings = async (req, res) => {
  try {
    // Kiểm tra quyền owner
    if (req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    const { page = 1, limit = 10, status } = req.query;
    
    // Lấy danh sách sân của owner
    const courts = await Court.find({ ownerId: req.user.uid });
    const courtIds = courts.map(court => court._id);

    const query = { courtId: { $in: courtIds } };
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Booking.countDocuments(query);

    res.json({
      bookings,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      totalBookings: total
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách đặt sân:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * @desc    Cập nhật trạng thái đặt sân
 * @route   PUT /api/bookings/:id/status
 * @access  Private (Owner)
 */
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy đặt sân' });
    }

    // Kiểm tra quyền cập nhật
    const court = await Court.findById(booking.courtId);
    if (court.ownerId !== req.user.uid && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền cập nhật đặt sân này' });
    }

    // Cập nhật trạng thái
    booking.status = status;
    await booking.save();

    res.json({
      message: 'Cập nhật trạng thái thành công',
      booking
    });
  } catch (error) {
    console.error('Lỗi cập nhật trạng thái:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * @desc    Hủy đặt sân
 * @route   PUT /api/bookings/:id/cancel
 * @access  Private
 */
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy đặt sân' });
    }

    // Kiểm tra quyền hủy
    if (booking.userId !== req.user.uid && req.user.role !== 'admin') {
      const court = await Court.findById(booking.courtId);
      if (court.ownerId !== req.user.uid) {
        return res.status(403).json({ message: 'Không có quyền hủy đặt sân này' });
      }
    }

    // Kiểm tra thời gian hủy
    const bookingDate = new Date(booking.date);
    const now = new Date();
    const hoursDiff = (bookingDate - now) / (1000 * 60 * 60);

    if (hoursDiff < 24) {
      return res.status(400).json({ message: 'Không thể hủy đặt sân trong vòng 24h trước giờ đặt' });
    }

    // Cập nhật trạng thái
    booking.status = 'cancelled';
    await booking.save();

    res.json({
      message: 'Hủy đặt sân thành công',
      booking
    });
  } catch (error) {
    console.error('Lỗi hủy đặt sân:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * @desc    Lấy danh sách đặt sân theo sân
 * @route   GET /api/bookings/court/:courtId
 * @access  Private
 */
const getCourtBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, date } = req.query;
    const query = { courtId: req.params.courtId };
    
    if (status) {
      query.status = status;
    }
    if (date) {
      query.date = date;
    }

    const bookings = await Booking.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Booking.countDocuments(query);

    res.json({
      bookings,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      totalBookings: total
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách đặt sân:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * @desc    Kiểm tra thời gian trống
 * @route   GET /api/bookings/available/:courtId
 * @access  Public
 */
const checkAvailability = async (req, res) => {
  try {
    const { date, startTime, endTime } = req.query;
    const court = await Court.findById(req.params.courtId);
    
    if (!court) {
      return res.status(404).json({ message: 'Không tìm thấy sân' });
    }

    const isAvailable = await court.checkAvailability(date, startTime, endTime);

    res.json({ isAvailable });
  } catch (error) {
    console.error('Lỗi kiểm tra thời gian trống:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

module.exports = {
  createBooking,
  getBookingById,
  getUserBookings,
  getOwnerBookings,
  updateBookingStatus,
  cancelBooking,
  getCourtBookings,
  checkAvailability
}; 