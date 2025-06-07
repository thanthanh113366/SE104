const { Booking, Court, User } = require('../models');
const { validationResult } = require('express-validator');
const admin = require('firebase-admin');
const db = admin.firestore();

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
      note,
      paymentMethod
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

    // Kiểm tra xác thực user
    if (!req.user || !req.user.uid) {
      return res.status(401).json({ message: 'Không xác định được người dùng. Vui lòng đăng nhập lại.' });
    }

    // Lấy thông tin user
    const user = await User.findById(req.user.uid);

    // Tạo booking mới
    const booking = new Booking({
      courtId,
      userId: req.user.uid,
      ownerId: court.ownerId,
      userName: user?.displayName || user?.email || '',
      userPhone: user?.phoneNumber || '',
      userEmail: user?.email || '',
      courtName: court.name || '',
      date,
      startTime,
      endTime,
      totalPrice,
      notes: note,
      paymentMethod: paymentMethod || 'cash', // Default to cash if not specified
      status: paymentMethod ? 'confirmed' : 'pending' // If payment method provided, it's already paid
    });

    const savedBookingId = await booking.save();

    // Get the full booking object with ID
    booking.id = savedBookingId;
    const fullBooking = {
      id: savedBookingId,
      courtId: booking.courtId,
      userId: booking.userId,
      ownerId: booking.ownerId,
      userName: booking.userName,
      userPhone: booking.userPhone,
      userEmail: booking.userEmail,
      courtName: booking.courtName,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      totalPrice: booking.totalPrice,
      notes: booking.notes,
      paymentMethod: booking.paymentMethod,
      status: booking.status,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt
    };

    res.status(201).json({
      message: 'Đặt sân thành công',
      booking: fullBooking
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
    if (!req.user || !req.user.uid) {
      return res.status(401).json({ message: 'Người dùng chưa được xác thực' });
    }

    // Sử dụng Firestore method từ Booking model
    const bookings = await Booking.findByUser(req.user.uid);

    res.json({
      bookings,
      totalBookings: bookings.length
    });
  } catch (error) {
    console.error('Error in getUserBookings:', error.message);
    res.status(500).json({ 
      message: 'Lỗi server', 
      error: error.message
    });
  }
};

/**
 * @desc    Lấy danh sách đặt sân có thể đánh giá của user
 * @route   GET /api/bookings/reviewable
 * @access  Private
 */
const getReviewableBookings = async (req, res) => {
  try {
    // Lấy tất cả bookings của user
    const bookings = await Booking.findByUser(req.user.uid);
    
    // Lọc các booking có thể đánh giá (confirmed hoặc completed và chưa được đánh giá)
    const reviewableBookings = [];
    
    for (const booking of bookings) {
      // Chỉ các booking confirmed hoặc completed mới có thể đánh giá
      if (booking.status === 'confirmed' || booking.status === 'completed' || booking.status === 'Đã xác nhận') {
        try {
          // Kiểm tra xem đã đánh giá chưa
          const Review = require('../models/Review');
          const existingReview = await Review.findByBooking(booking.id);
          
          if (!existingReview) {
            reviewableBookings.push(booking);
          }
        } catch (reviewError) {
          console.error('Error checking review for booking:', booking.id, reviewError);
          // Nếu có lỗi khi check review, vẫn cho phép review
          reviewableBookings.push(booking);
        }
      }
    }

    res.json({
      bookings: reviewableBookings,
      totalBookings: reviewableBookings.length
    });
  } catch (error) {
    console.error('Error in getReviewableBookings:', error);
    res.status(500).json({ 
      message: 'Lỗi server', 
      error: error.message 
    });
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
    const courtId = req.params.courtId;

    // Sử dụng Firebase Firestore
    const bookingsRef = db.collection('bookings');
    
    // Tạm thời bỏ date filter để debug
    let query = bookingsRef.where('courtId', '==', courtId);
    
    if (status) {
      query = query.where('status', '==', status);
    }

    // Thực hiện query
    const snapshot = await query.get();
    
    // Chuyển đổi dữ liệu và kiểm tra thời gian pending
    const bookings = [];
    const now = new Date();
    
    snapshot.forEach(doc => {
      const booking = {
        id: doc.id,
        ...doc.data()
      };

      // Chuyển đổi Timestamp thành Date nếu cần
      if (booking.date && booking.date._seconds) {
        booking.date = new Date(booking.date._seconds * 1000);
      }
      
      // Tính thời gian đã trôi qua kể từ khi tạo booking
      const createdAt = booking.createdAt instanceof Date ? booking.createdAt : 
                       booking.createdAt._seconds ? new Date(booking.createdAt._seconds * 1000) : 
                       new Date(booking.createdAt);
      
      const timeDiff = (now - createdAt) / 1000 / 60; // Chuyển sang phút

      // Thêm trường để frontend biết booking có đang trong thời gian pending 5 phút không
      booking.isWithinPendingWindow = booking.status === 'pending' && timeDiff <= 5;
      
      bookings.push(booking);
    });

    // Filter thêm theo ngày cụ thể nếu có
    let filteredBookings = bookings;
    if (date) {
      const queryDateStr = date; // date param đã là string "2025-06-06"
      
              filteredBookings = bookings.filter(booking => {
        if (!booking.date) return false;
        
        let bookingDateStr;
        if (typeof booking.date === 'string') {
          // Nếu date là string "2025-06-06"
          bookingDateStr = booking.date;
        } else if (booking.date instanceof Date) {
          // Nếu date là Date object
          bookingDateStr = booking.date.toISOString().split('T')[0];
        } else {
          return false;
        }
        
                return bookingDateStr === queryDateStr;
      });
    }

    // Phân trang thủ công
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + Number(limit);
    const paginatedBookings = filteredBookings.slice(startIndex, endIndex);

    res.json({
      bookings: paginatedBookings,
      currentPage: Number(page),
      totalPages: Math.ceil(filteredBookings.length / limit),
      totalBookings: filteredBookings.length
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách đặt sân:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
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

/**
 * @desc    Cleanup old pending bookings (helper for testing)
 * @route   POST /api/bookings/cleanup
 * @access  Private
 */
const cleanupOldPendingBookings = async (req, res) => {
  try {
    console.log('Cleaning up old pending bookings...');
    
    // Get all pending bookings older than 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    
    const snapshot = await db.collection('bookings')
      .where('status', '==', 'pending')
      .where('createdAt', '<', tenMinutesAgo)
      .get();
    
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, { 
        status: 'cancelled', 
        cancellationReason: 'Auto-cancelled due to timeout',
        updatedAt: new Date()
      });
    });
    
    await batch.commit();
    console.log(`Cleaned up ${snapshot.docs.length} old pending bookings`);
    
    res.json({
      message: 'Cleanup completed',
      cleanedCount: snapshot.docs.length
    });
  } catch (error) {
    console.error('Error cleaning up old bookings:', error);
    res.status(500).json({ message: 'Cleanup failed' });
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
  checkAvailability,
  getReviewableBookings,
  cleanupOldPendingBookings
}; 