const { Court, Review, Booking } = require('../models');
const { validationResult } = require('express-validator');

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

    const query = {};
    
    // Thêm điều kiện tìm kiếm nếu có
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } }
      ];
    }

    if (city) query.city = city;
    if (district) query.district = district;
    if (type) query.type = type;
    if (priceMin || priceMax) {
      query.price = {};
      if (priceMin) query.price.$gte = Number(priceMin);
      if (priceMax) query.price.$lte = Number(priceMax);
    }
    if (rating) query.rating = { $gte: Number(rating) };

    const courts = await Court.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Court.countDocuments(query);

    res.json({
      courts,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      totalCourts: total
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách sân:', error);
    res.status(500).json({ message: 'Lỗi server' });
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
 * @desc    Lấy sân theo chủ sở hữu
 * @route   GET /api/courts/owner/:ownerId
 * @access  Public
 */
const getCourtsByOwner = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const courts = await Court.find({ ownerId: req.params.ownerId })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Court.countDocuments({ ownerId: req.params.ownerId });

    res.json({
      courts,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      totalCourts: total
    });
  } catch (error) {
    console.error('Lỗi lấy sân theo chủ sở hữu:', error);
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
  getCourtsByOwner
}; 