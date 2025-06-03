const { Court, Review, Booking } = require('../models');
const { validationResult } = require('express-validator');
const { getCollection } = require('../config/db');

/**
 * @desc    Lấy danh sách sân
 * @route   GET /api/courts
 * @access  Public
 */
const getCourts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      city,
      district,
      type,
      priceMin,
      priceMax,
      rating
    } = req.query;

    // Tạo options cho findAll
    const options = {
      limit: Number(limit),
      page: Number(page),
      type: type,
      status: 'active'
    };
    
    if (priceMin) options.minPrice = Number(priceMin);
    if (priceMax) options.maxPrice = Number(priceMax);
    if (rating) options.minRating = Number(rating);
    
    // Thêm log options
    console.log('Options truyền vào Court.findAll:', options);
    const courts = await Court.findAll(options);
    
    // Nếu có search, lọc thêm trên kết quả
    let filteredCourts = courts;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredCourts = courts.filter(court => 
        court.name.toLowerCase().includes(searchLower) || 
        (court.address && court.address.toLowerCase().includes(searchLower))
      );
    }
    
    if (city) {
      filteredCourts = filteredCourts.filter(court => 
        court.address && court.address.city && court.address.city.toLowerCase() === city.toLowerCase()
      );
    }
    
    if (district) {
      filteredCourts = filteredCourts.filter(court => 
        court.address && court.address.district && court.address.district.toLowerCase() === district.toLowerCase()
      );
    }

    res.json({
      courts: filteredCourts,
      currentPage: Number(page),
      totalPages: 1, // Tạm thời hardcode vì không dùng skip/limit
      totalCourts: filteredCourts.length
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách sân:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * @desc    Lấy chi tiết sân
 * @route   GET /api/courts/:id
 * @access  Public
 */
const getCourtById = async (req, res) => {
  try {
    const court = await Court.findById(req.params.id);
    if (!court) {
      return res.status(404).json({ message: 'Không tìm thấy sân' });
    }

    res.json({ court });
  } catch (error) {
    console.error('Lỗi lấy chi tiết sân:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * @desc    Tạo sân mới
 * @route   POST /api/courts
 * @access  Private (Owner)
 */
const createCourt = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      address,
      city,
      district,
      type,
      price,
      description,
      images,
      amenities,
      openingHours,
      rules
    } = req.body;

    // Kiểm tra quyền owner
    if (req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Không có quyền tạo sân' });
    }

    const court = new Court({
      name,
      address,
      city,
      district,
      type,
      price,
      description,
      images,
      amenities,
      openingHours,
      rules,
      ownerId: req.user.uid
    });

    await court.save();

    res.status(201).json({
      message: 'Tạo sân thành công',
      court
    });
  } catch (error) {
    console.error('Lỗi tạo sân:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * @desc    Cập nhật thông tin sân
 * @route   PUT /api/courts/:id
 * @access  Private (Owner)
 */
const updateCourt = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const court = await Court.findById(req.params.id);
    if (!court) {
      return res.status(404).json({ message: 'Không tìm thấy sân' });
    }

    // Kiểm tra quyền sở hữu
    if (court.ownerId !== req.user.uid && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền cập nhật sân này' });
    }

    const {
      name,
      address,
      city,
      district,
      type,
      price,
      description,
      images,
      amenities,
      openingHours,
      rules,
      status
    } = req.body;

    // Cập nhật thông tin
    if (name) court.name = name;
    if (address) court.address = address;
    if (city) court.city = city;
    if (district) court.district = district;
    if (type) court.type = type;
    if (price) court.price = price;
    if (description) court.description = description;
    if (images) court.images = images;
    if (amenities) court.amenities = amenities;
    if (openingHours) court.openingHours = openingHours;
    if (rules) court.rules = rules;
    if (status) court.status = status;

    await court.save();

    res.json({
      message: 'Cập nhật sân thành công',
      court
    });
  } catch (error) {
    console.error('Lỗi cập nhật sân:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * @desc    Xóa sân
 * @route   DELETE /api/courts/:id
 * @access  Private (Owner, Admin)
 */
const deleteCourt = async (req, res) => {
  try {
    const court = await Court.findById(req.params.id);
    if (!court) {
      return res.status(404).json({ message: 'Không tìm thấy sân' });
    }

    // Kiểm tra quyền xóa
    if (court.ownerId !== req.user.uid && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền xóa sân này' });
    }

    await court.remove();

    res.json({ message: 'Xóa sân thành công' });
  } catch (error) {
    console.error('Lỗi xóa sân:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * @desc    Lấy lịch sân
 * @route   GET /api/courts/:id/schedule
 * @access  Public
 */
const getCourtSchedule = async (req, res) => {
  try {
    const { date } = req.query;
    const court = await Court.findById(req.params.id);
    
    if (!court) {
      return res.status(404).json({ message: 'Không tìm thấy sân' });
    }

    const schedule = await court.getSchedule(date);

    res.json({ schedule });
  } catch (error) {
    console.error('Lỗi lấy lịch sân:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * @desc    Lấy đánh giá sân
 * @route   GET /api/courts/:id/reviews
 * @access  Public
 */
const getCourtReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const court = await Court.findById(req.params.id);
    
    if (!court) {
      return res.status(404).json({ message: 'Không tìm thấy sân' });
    }

    const reviews = await court.getReviews(page, limit);

    res.json({
      reviews: reviews.reviews,
      currentPage: Number(page),
      totalPages: reviews.totalPages,
      totalReviews: reviews.total
    });
  } catch (error) {
    console.error('Lỗi lấy đánh giá sân:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * @desc    Lấy danh sách sân của một chủ sân
 * @route   GET /api/courts/owner/:ownerId
 * @access  Public
 */
const getCourtsByOwner = async (req, res) => {
  try {
    const ownerId = req.params.ownerId;
    
    // Sử dụng findByOwnerId thay vì find
    const courts = await Court.findByOwnerId(ownerId);
    
    res.json({
      courts,
      totalCourts: courts.length
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách sân của chủ sân:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

const getBookedSlots = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;
    const bookingsRef = getCollection('bookings');
    const snapshot = await bookingsRef
      .where('courtId', '==', id)
      .where('date', '==', date)
      .get();
    const slots = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        startTime: data.startTime,
        endTime: data.endTime,
        status: data.status
      };
    });
    res.json({ slots });
  } catch (error) {
    console.error('Lỗi lấy booked slots:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * @desc    Lấy danh sách booking công khai của sân
 * @route   GET /api/public/courts/:id/bookings
 * @access  Public
 */
const getPublicCourtBookings = async (req, res) => {
  try {
    const court = await Court.findById(req.params.id);
    if (!court) {
      return res.status(404).json({ message: 'Không tìm thấy sân' });
    }

    const bookings = await Booking.findByCourtId(req.params.id);
    
    // Chỉ trả về các thông tin công khai
    const publicBookings = bookings.map(booking => ({
      id: booking.id,
      courtId: booking.courtId,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status
    }));

    res.json({ bookings: publicBookings });
  } catch (error) {
    console.error('Lỗi lấy danh sách booking công khai:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

module.exports = {
  getCourts,
  getCourtById,
  createCourt,
  updateCourt,
  deleteCourt,
  getCourtSchedule,
  getCourtReviews,
  getCourtsByOwner,
  getBookedSlots,
  getPublicCourtBookings
}; 