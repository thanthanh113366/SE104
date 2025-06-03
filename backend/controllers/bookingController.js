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
    console.log('getUserBookings called');
    console.log('User from token:', req.user);
    
    if (!req.user || !req.user.uid) {
      console.log('User not authenticated properly');
      return res.status(401).json({ message: 'Người dùng chưa được xác thực' });
    }

    console.log('Getting bookings for user:', req.user.uid);
    
    // Sử dụng Firestore method từ Booking model
    const bookings = await Booking.findByUser(req.user.uid);
    
    console.log('Found bookings:', bookings.length);
    console.log('Bookings data:', bookings.map(b => ({ 
      id: b.id, 
      status: b.status, 
      courtName: b.courtName,
      date: b.date 
    })));

    res.json({
      bookings,
      totalBookings: bookings.length
    });
  } catch (error) {
    console.error('Error in getUserBookings:');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error code:', error.code);
    res.status(500).json({ 
      message: 'Lỗi server', 
      error: error.message,
      details: error.stack 
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
    console.log('getReviewableBookings called for user:', req.user.uid);
    
    // Lấy tất cả bookings của user
    console.log('Fetching bookings for user...');
    const bookings = await Booking.findByUser(req.user.uid);
    console.log('Total bookings found:', bookings.length);
    
    // Lọc các booking có thể đánh giá (confirmed hoặc completed và chưa được đánh giá)
    const reviewableBookings = [];
    
    for (const booking of bookings) {
      console.log('Checking booking:', {
        id: booking.id,
        status: booking.status,
        courtName: booking.courtName
      });
      
      // Chỉ các booking confirmed hoặc completed mới có thể đánh giá
      if (booking.status === 'confirmed' || booking.status === 'completed' || booking.status === 'Đã xác nhận') {
        console.log('Booking is eligible for review, checking if already reviewed...');
        
        try {
          // Kiểm tra xem đã đánh giá chưa
          const Review = require('../models/Review');
          const existingReview = await Review.findByBooking(booking.id);
          
          if (!existingReview) {
            console.log('No existing review found, adding to reviewable list');
            reviewableBookings.push(booking);
          } else {
            console.log('Already reviewed');
          }
        } catch (reviewError) {
          console.error('Error checking review for booking:', booking.id, reviewError);
          // Nếu có lỗi khi check review, vẫn cho phép review
          reviewableBookings.push(booking);
        }
      } else {
        console.log('Booking status not eligible:', booking.status);
      }
    }

    console.log('Found reviewable bookings:', reviewableBookings.length);

    res.json({
      bookings: reviewableBookings,
      totalBookings: reviewableBookings.length
    });
  } catch (error) {
    console.error('Error in getReviewableBookings:', error);
    console.error('Error stack:', error.stack);
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
    let query = bookingsRef.where('courtId', '==', courtId);
    
    if (status) {
      query = query.where('status', '==', status);
    }
    if (date) {
      // Chuyển đổi date string thành Date object nếu cần
      const queryDate = new Date(date);
      query = query.where('date', '==', queryDate);
    }

    // Thêm sắp xếp
    query = query.orderBy('createdAt', 'desc');

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

    // Phân trang thủ công vì Firestore không hỗ trợ skip
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + Number(limit);
    const paginatedBookings = bookings.slice(startIndex, endIndex);

    res.json({
      bookings: paginatedBookings,
      currentPage: Number(page),
      totalPages: Math.ceil(bookings.length / limit),
      totalBookings: bookings.length
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
 * @desc    Lấy tất cả đặt sân (Admin only)
 * @route   GET /api/bookings/admin/all
 * @access  Admin
 */
const getAllBookings = async (req, res) => {
  try {
    // Kiểm tra quyền admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    const { page = 1, limit = 10, status, courtId, userId, startDate, endDate } = req.query;
    
    const bookings = await Booking.findAll({
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      courtId,
      userId,
      startDate,
      endDate
    });

    // Lấy thêm thông tin chi tiết và đếm số lượt đặt sân
    const bookingsWithDetails = await Promise.all(
      bookings.map(async (booking) => {
        try {
          console.log('Processing booking:', booking.id, 'courtId:', booking.courtId, 'userId:', booking.userId);
          
          // Lấy thông tin court trước để có ownerId
          let court = null;
          if (booking.courtId && booking.courtId.trim()) {
            try {
              court = await Court.findById(booking.courtId);
              console.log('Court found:', court?.name, 'court ownerId:', court?.ownerId);
            } catch (courtError) {
              console.error('Error finding court:', courtError);
            }
          } else {
            console.log('Invalid courtId:', booking.courtId);
          }
          
          // Lấy thông tin user
          let user = null;
          if (booking.userId && booking.userId.trim()) {
            try {
              user = await User.findById(booking.userId);
              console.log('User found:', user?.displayName || user?.email);
            } catch (userError) {
              console.error('Error finding user:', userError);
            }
          } else {
            console.log('Invalid userId:', booking.userId);
          }
          
          // Lấy thông tin owner (chủ sân) - luôn từ court
          let owner = null;
          if (court && court.ownerId && court.ownerId.trim()) {
            try {
              owner = await User.findById(court.ownerId);
              console.log('Owner found:', owner?.displayName || owner?.email || 'No name/email');
            } catch (ownerError) {
              console.error('Error finding owner:', ownerError);
            }
          } else {
            console.log('No court or invalid ownerId:', court?.ownerId);
          }
          
          // Đếm số lượt đặt sân của user này (chỉ nếu có userId hợp lệ)
          let userBookingCount = 0;
          if (booking.userId && booking.userId.trim()) {
            try {
              const userBookings = await Booking.findByUser(booking.userId);
              userBookingCount = userBookings.length;
            } catch (countError) {
              console.error('Error counting user bookings:', countError);
            }
          }
          
          const result = {
            ...booking,
            courtDetails: court ? {
              name: court.name,
              type: court.type,
              address: court.address
            } : null,
            userDetails: user ? {
              name: user.displayName,
              email: user.email,
              phone: user.phoneNumber
            } : null,
            ownerDetails: owner ? {
              name: owner.displayName || 'Chưa có tên',
              email: owner.email || 'Chưa có email',
              phone: owner.phoneNumber || 'Chưa có SĐT'
            } : null,
            userBookingCount: userBookingCount
          };
          
          console.log('Final owner details:', result.ownerDetails);
          return result;
          
        } catch (error) {
          console.error(`Error getting details for booking ${booking.id}:`, error);
          return {
            ...booking,
            courtDetails: null,
            userDetails: null,
            ownerDetails: null,
            userBookingCount: 0
          };
        }
      })
    );

    res.json({
      bookings: bookingsWithDetails,
      total: bookingsWithDetails.length
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách đặt sân:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * @desc    Cập nhật trạng thái đặt sân (Admin only)
 * @route   PUT /api/bookings/:bookingId/admin-status
 * @access  Admin
 */
const updateBookingStatusAdmin = async (req, res) => {
  try {
    // Kiểm tra quyền admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    const { bookingId } = req.params;
    const { status, reason } = req.body;

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy đặt sân' });
    }

    // Cập nhật trạng thái
    await booking.updateStatus(status, reason);

    res.json({ 
      message: 'Cập nhật trạng thái thành công',
      booking 
    });
  } catch (error) {
    console.error('Lỗi cập nhật trạng thái đặt sân:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * @desc    Lấy thống kê đặt sân (Admin only)
 * @route   GET /api/bookings/admin/stats
 * @access  Admin
 */
const getBookingStats = async (req, res) => {
  try {
    // Kiểm tra quyền admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    const { startDate, endDate } = req.query;
    
    const bookings = await Booking.findAll({ startDate, endDate });
    
    const stats = {
      total: bookings.length,
      byStatus: {
        pending: bookings.filter(b => b.status === 'pending').length,
        confirmed: bookings.filter(b => b.status === 'confirmed').length,
        cancelled: bookings.filter(b => b.status === 'cancelled').length,
        completed: bookings.filter(b => b.status === 'completed').length
      },
      totalRevenue: bookings
        .filter(b => b.status === 'confirmed' || b.status === 'completed')
        .reduce((sum, b) => sum + (b.totalPrice || 0), 0),
      byDate: {},
      byCourtType: {}
    };

    // Thống kê theo ngày
    bookings.forEach(booking => {
      const date = booking.date;
      if (!stats.byDate[date]) {
        stats.byDate[date] = 0;
      }
      stats.byDate[date]++;
    });

    // Thống kê theo loại sân (cần lấy thông tin court)
    const courtTypes = {};
    await Promise.all(
      bookings.map(async (booking) => {
        try {
          const court = await Court.findById(booking.courtId);
          if (court && court.type) {
            if (!courtTypes[court.type]) {
              courtTypes[court.type] = 0;
            }
            courtTypes[court.type]++;
          }
        } catch (error) {
          console.error(`Error getting court type for booking ${booking.id}:`, error);
        }
      })
    );
    stats.byCourtType = courtTypes;

    res.json({ stats });
  } catch (error) {
    console.error('Lỗi lấy thống kê đặt sân:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * @desc    Xóa đặt sân (Admin only)
 * @route   DELETE /api/bookings/:bookingId/admin
 * @access  Admin
 */
const deleteBookingAdmin = async (req, res) => {
  try {
    // Kiểm tra quyền admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy đặt sân' });
    }

    await booking.delete();

    res.json({ message: 'Xóa đặt sân thành công' });
  } catch (error) {
    console.error('Lỗi xóa đặt sân:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

module.exports = {
  createBooking,
  getBookingById,
  getUserBookings,
  getReviewableBookings,
  getOwnerBookings,
  updateBookingStatus,
  cancelBooking,
  getCourtBookings,
  checkAvailability,
  getAllBookings,
  updateBookingStatusAdmin,
  getBookingStats,
  deleteBookingAdmin
}; 