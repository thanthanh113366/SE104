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

    const { courtId, bookingId, rating, comment, images, userName } = req.body;

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
    if (booking.status !== 'completed' && booking.status !== 'confirmed' && booking.status !== 'Đã xác nhận') {
      return res.status(400).json({ message: 'Chỉ có thể đánh giá sau khi đặt sân được xác nhận hoặc hoàn thành' });
    }

    // Kiểm tra đã đánh giá chưa
    const existingReview = await Review.findByBooking(bookingId);
    if (existingReview) {
      return res.status(400).json({ message: 'Bạn đã đánh giá đặt sân này' });
    }

    // Tạo review mới
    const review = new Review({
      courtId,
      bookingId,
      userId: req.user.uid,
      userName: userName || 'Người dùng ẩn danh',
      rating,
      comment,
      images: images || []
    });

    await review.save();

    // Cập nhật rating trung bình của sân
    await Court.updateRating(courtId, rating);

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
    const courtId = req.params.courtId;
    
    // Sử dụng Firestore methods thay vì MongoDB
    const reviews = await Review.findByCourt(courtId, Number(limit));
    
    // Lọc theo rating nếu có
    let filteredReviews = reviews;
    if (rating) {
      filteredReviews = reviews.filter(review => review.rating === Number(rating));
    }

    res.json({
      reviews: filteredReviews,
      currentPage: Number(page),
      totalPages: Math.ceil(filteredReviews.length / limit),
      totalReviews: filteredReviews.length
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
    
    // Sử dụng Firestore method
    const reviews = await Review.findByUser(req.user.uid);
    
    // Phân trang đơn giản
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + Number(limit);
    const paginatedReviews = reviews.slice(startIndex, endIndex);

    res.json({
      reviews: paginatedReviews,
      currentPage: Number(page),
      totalPages: Math.ceil(reviews.length / limit),
      totalReviews: reviews.length
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

    // Cập nhật rating trung bình của sân - cần tính toán lại toàn bộ rating
    // Tạm thời bỏ qua việc cập nhật rating vì cần logic phức tạp hơn
    // TODO: Implement proper rating recalculation

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

    // Sử dụng static method để xóa
    await Review.delete(req.params.id);

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

    // Sử dụng static method để thêm reply
    await Review.addReply(req.params.id, reply);
    
    // Lấy review đã cập nhật
    const updatedReview = await Review.findById(req.params.id);

    res.json({
      message: 'Thêm phản hồi thành công',
      review: updatedReview
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

    // Sử dụng static method từ Review model
    const stats = await Review.getCourtRatingStats(req.params.courtId);

    res.json(stats);
  } catch (error) {
    console.error('Lỗi lấy thống kê đánh giá:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * @desc    Kiểm tra xem user có thể đánh giá booking không
 * @route   GET /api/reviews/can-review/:bookingId
 * @access  Private
 */
const canUserReviewBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    // Kiểm tra booking tồn tại và thuộc về user
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.json({ canReview: false, reason: 'Không tìm thấy đặt sân' });
    }
    
    if (booking.userId !== req.user.uid) {
      return res.json({ canReview: false, reason: 'Không có quyền đánh giá đặt sân này' });
    }
    
    if (booking.status !== 'completed' && booking.status !== 'confirmed' && booking.status !== 'Đã xác nhận') {
      return res.json({ canReview: false, reason: 'Chỉ có thể đánh giá sau khi đặt sân được xác nhận hoặc hoàn thành' });
    }

    // Kiểm tra đã đánh giá chưa
    const existingReview = await Review.findByBooking(bookingId);
    if (existingReview) {
      return res.json({ canReview: false, reason: 'Bạn đã đánh giá đặt sân này' });
    }

    res.json({ canReview: true });
  } catch (error) {
    console.error('Lỗi kiểm tra quyền đánh giá:', error);
    res.status(500).json({ canReview: false, reason: 'Lỗi hệ thống' });
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
  getReviewStats,
  canUserReviewBooking
}; 