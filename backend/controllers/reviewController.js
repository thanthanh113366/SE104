const { Review, Court, Booking } = require('../models');
const { validationResult } = require('express-validator');

/**
 * @desc    Tạo đánh giá mới
 * @route   POST /api/reviews
 * @access  Private
 */
const createReview = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { courtId, bookingId, rating, comment, images } = req.body;

    // Kiểm tra sân tồn tại
    const court = await Court.findById(courtId);
    if (!court) {
      return res.status(404).json({ message: 'Không tìm thấy sân' });
    }

    // Kiểm tra booking tồn tại và thuộc về user
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy đặt sân' });
    }
    if (booking.userId !== req.user.uid) {
      return res.status(403).json({ message: 'Không có quyền đánh giá đặt sân này' });
    }
    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'Chỉ có thể đánh giá sau khi sử dụng sân' });
    }

    // Kiểm tra đã đánh giá chưa
    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      return res.status(400).json({ message: 'Bạn đã đánh giá đặt sân này' });
    }

    // Tạo review mới
    const review = new Review({
      courtId,
      bookingId,
      userId: req.user.uid,
      rating,
      comment,
      images
    });

    await review.save();

    // Cập nhật rating trung bình của sân
    await court.updateRating();

    res.status(201).json({
      message: 'Đánh giá thành công',
      review
    });
  } catch (error) {
    console.error('Lỗi tạo đánh giá:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * @desc    Lấy chi tiết đánh giá
 * @route   GET /api/reviews/:id
 * @access  Public
 */
const getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
    }

    res.json({ review });
  } catch (error) {
    console.error('Lỗi lấy chi tiết đánh giá:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * @desc    Lấy đánh giá theo sân
 * @route   GET /api/reviews/court/:courtId
 * @access  Public
 */
const getCourtReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, rating } = req.query;
    const query = { courtId: req.params.courtId };
    
    if (rating) {
      query.rating = Number(rating);
    }

    const reviews = await Review.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Review.countDocuments(query);

    res.json({
      reviews,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      totalReviews: total
    });
  } catch (error) {
    console.error('Lỗi lấy đánh giá sân:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * @desc    Lấy đánh giá của user
 * @route   GET /api/reviews/user
 * @access  Private
 */
const getUserReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const reviews = await Review.find({ userId: req.user.uid })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Review.countDocuments({ userId: req.user.uid });

    res.json({
      reviews,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      totalReviews: total
    });
  } catch (error) {
    console.error('Lỗi lấy đánh giá của user:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * @desc    Cập nhật đánh giá
 * @route   PUT /api/reviews/:id
 * @access  Private
 */
const updateReview = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rating, comment, images } = req.body;
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
    }

    // Kiểm tra quyền cập nhật
    if (review.userId !== req.user.uid && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền cập nhật đánh giá này' });
    }

    // Cập nhật thông tin
    if (rating) review.rating = rating;
    if (comment) review.comment = comment;
    if (images) review.images = images;

    await review.save();

    // Cập nhật rating trung bình của sân
    const court = await Court.findById(review.courtId);
    await court.updateRating();

    res.json({
      message: 'Cập nhật đánh giá thành công',
      review
    });
  } catch (error) {
    console.error('Lỗi cập nhật đánh giá:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * @desc    Xóa đánh giá
 * @route   DELETE /api/reviews/:id
 * @access  Private
 */
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
    }

    // Kiểm tra quyền xóa
    if (review.userId !== req.user.uid && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền xóa đánh giá này' });
    }

    await review.remove();

    // Cập nhật rating trung bình của sân
    const court = await Court.findById(review.courtId);
    await court.updateRating();

    res.json({ message: 'Xóa đánh giá thành công' });
  } catch (error) {
    console.error('Lỗi xóa đánh giá:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * @desc    Thêm phản hồi cho đánh giá
 * @route   POST /api/reviews/:id/reply
 * @access  Private (Owner)
 */
const addReply = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { reply } = req.body;
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
    }

    // Kiểm tra quyền phản hồi
    const court = await Court.findById(review.courtId);
    if (court.ownerId !== req.user.uid && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền phản hồi đánh giá này' });
    }

    // Thêm phản hồi
    review.reply = reply;
    review.replyAt = new Date();
    await review.save();

    res.json({
      message: 'Thêm phản hồi thành công',
      review
    });
  } catch (error) {
    console.error('Lỗi thêm phản hồi:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * @desc    Lấy thống kê đánh giá
 * @route   GET /api/reviews/stats/:courtId
 * @access  Public
 */
const getReviewStats = async (req, res) => {
  try {
    const court = await Court.findById(req.params.courtId);
    if (!court) {
      return res.status(404).json({ message: 'Không tìm thấy sân' });
    }

    const stats = await Review.aggregate([
      { $match: { courtId: court._id } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: {
              rating: '$rating'
            }
          }
        }
      }
    ]);

    // Tính phân phối rating
    const distribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0
    };

    if (stats.length > 0) {
      stats[0].ratingDistribution.forEach(item => {
        distribution[item.rating]++;
      });
    }

    res.json({
      averageRating: stats.length > 0 ? stats[0].averageRating : 0,
      totalReviews: stats.length > 0 ? stats[0].totalReviews : 0,
      distribution
    });
  } catch (error) {
    console.error('Lỗi lấy thống kê đánh giá:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

module.exports = {
  createReview,
  getReviewById,
  getCourtReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  addReply,
  getReviewStats
}; 