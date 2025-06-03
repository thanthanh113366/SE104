const { Court, Review, Booking } = require('../models');
const { validationResult } = require('express-validator');
const { getCollection } = require('../config/db');

// Map tên thể thao từ tiếng Anh sang tiếng Việt  
const SPORT_NAMES = {
  'football': 'Bóng đá',
  'basketball': 'Bóng rổ', 
  'tennis': 'Tennis',
  'badminton': 'Cầu lông',
  'volleyball': 'Bóng chuyền',
  'billiards': 'Bida',
  'pool': 'Bida',
  'snooker': 'Bida'
};

/**
 * Transform court data for consistent frontend display
 * @param {Object} court - Raw court data from database
 * @returns {Object} - Transformed court data
 */
const transformCourtData = (court) => {
  if (!court) return null;
  
  // Xử lý sport type - lấy từ 'sport' field (do frontend lưu vào đó)
  const sportType = court.sport || court.type || 'football';
  const sportName = SPORT_NAMES[sportType] || sportType || 'Không xác định';
  
  return {
    ...court,
    // Giữ nguyên sport field (mã tiếng Anh) để tương thích với frontend
    sport: sportType,
    // Thêm type field để tương thích với code cũ
    type: sportType,
    // Thêm sportName để hiển thị tiếng Việt
    sportName: sportName,
    // Đảm bảo các trường khác
    name: court.name || 'Chưa có tên',
    address: court.address || 'Chưa có địa chỉ',
    description: court.description || 'Chưa có mô tả',
    price: court.price || 0,
    openTime: court.openTime || '07:00',
    closeTime: court.closeTime || '22:00',
    // Đảm bảo facilities được trả về đúng - ưu tiên facilities, fallback về amenities
    facilities: Array.isArray(court.facilities) ? court.facilities : 
                Array.isArray(court.amenities) ? court.amenities : [],
    image: court.image || 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800',
    amenities: Array.isArray(court.amenities) ? court.amenities : 
               Array.isArray(court.facilities) ? court.facilities : [],
    rating: court.rating || 0,
    status: court.status || 'active',
    // Giữ nguyên owner info nếu có
    owner: court.owner || null,
    // Đảm bảo các field khác
    ownerId: court.ownerId,
    totalBookings: court.totalBookings || 0,
    totalRevenue: court.totalRevenue || 0,
    // Thêm field để frontend kiểm tra trạng thái
    isAvailable: court.status === 'active'
  };
};

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
    
    const courts = await Court.findAll(options);
    
    // Transform dữ liệu trước khi lọc
    const transformedCourts = courts.map(transformCourtData);
    
    // Nếu có search, lọc thêm trên kết quả đã transform
    let filteredCourts = transformedCourts;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredCourts = transformedCourts.filter(court => 
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

    // Transform dữ liệu trước khi trả về
    const transformedCourt = transformCourtData(court);

    res.json({ court: transformedCourt });
  } catch (error) {
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
      facilities,
      openingHours,
      rules
    } = req.body;

    // Kiểm tra quyền owner
    if (req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Không có quyền tạo sân' });
    }

    // Sử dụng facilities hoặc amenities (facilities có ưu tiên)
    const courtFacilities = facilities || amenities || [];

    const court = new Court({
      name,
      address,
      city,
      district,
      type,
      price,
      description,
      images,
      amenities: courtFacilities,
      facilities: courtFacilities,
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
      facilities,
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
    
    // Xử lý facilities/amenities - cập nhật cả hai trường để đảm bảo tương thích
    if (facilities) {
      court.facilities = facilities;
      court.amenities = facilities; // Đồng bộ với amenities
    } else if (amenities) {
      court.amenities = amenities;
      court.facilities = amenities; // Đồng bộ với facilities
    }
    
    if (openingHours) court.openingHours = openingHours;
    if (rules) court.rules = rules;
    if (status) court.status = status;

    await court.save();

    res.json({
      message: 'Cập nhật sân thành công',
      court
    });
  } catch (error) {
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
    console.error('Lỗi khi xóa sân:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa sân',
      error: error.message
    });
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
    
    // Transform dữ liệu trước khi trả về
    const transformedCourts = courts.map(transformCourtData);
    
    res.json({
      courts: transformedCourts,
      totalCourts: transformedCourts.length
    });
  } catch (error) {
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
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * @desc    Cập nhật trạng thái sân (Admin only)
 * @route   PUT /api/courts/:id/status
 * @access  Private (Admin)
 */
const updateCourtStatus = async (req, res) => {
  try {
    // Kiểm tra quyền admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền cập nhật trạng thái sân' });
    }

    const { status } = req.body;
    
    // Validate status
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }

    const court = await Court.findById(req.params.id);
    if (!court) {
      return res.status(404).json({ message: 'Không tìm thấy sân' });
    }

    // Cập nhật trạng thái
    court.status = status;
    court.updatedAt = new Date();
    await court.save();

    res.json({
      message: `${status === 'active' ? 'Kích hoạt' : 'Tạm ngưng'} sân thành công`,
      court: transformCourtData(court)
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái sân:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * @desc    Lấy danh sách tất cả sân cho Admin (với thông tin owner)
 * @route   GET /api/courts/admin/all
 * @access  Private (Admin)
 */
const getAllCourtsForAdmin = async (req, res) => {
  try {
    // Kiểm tra quyền admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    const { 
      limit = 1000, 
      type,
      sport,
      status
    } = req.query;

    const options = {
      limit: Number(limit),
      type: type || sport, // Hỗ trợ cả type và sport param
      status: status
    };
    
    console.log('Admin đang lấy danh sách sân với options:', options);
    
    // Lấy danh sách cơ bản trước
    const courts = await Court.findAll(options);
    console.log(`Tìm thấy ${courts.length} sân cơ bản`);
    console.log('Sample court data:', courts[0] ? {
      id: courts[0].id,
      name: courts[0].name,
      ownerId: courts[0].ownerId
    } : 'No courts found');
    
    // Sau đó với mỗi sân, sử dụng findById để lấy thông tin owner đầy đủ
    const courtsWithOwnerInfo = await Promise.all(
      courts.map(async (court, index) => {
        try {
          console.log(`Processing court ${index + 1}/${courts.length}: ${court.name} (ID: ${court.id})`);
          
          // Sử dụng findById có sẵn để lấy thông tin owner
          const courtWithOwner = await Court.findById(court.id);
          console.log(`Court ${court.id} owner info:`, courtWithOwner?.owner);
          
          const result = {
            ...courtWithOwner,
            totalBookings: courtWithOwner?.bookingCount || 0, // Sử dụng bookingCount từ database
            totalRevenue: 0
          };
          
          console.log(`Final court ${court.id} data:`, {
            id: result.id,
            name: result.name,
            owner: result.owner,
            totalBookings: result.totalBookings
          });
          
          return result;
        } catch (error) {
          console.error(`Lỗi khi lấy thông tin chi tiết sân ${court.id}:`, error);
          return {
            ...court,
            owner: { name: 'Chưa có tên', phone: 'Chưa có SĐT', email: 'Chưa có email' },
            totalBookings: 0,
            totalRevenue: 0
          };
        }
      })
    );
    
    console.log(`Đã xử lý xong thông tin owner cho ${courtsWithOwnerInfo.length} sân`);
    
    // Transform dữ liệu trước khi trả về
    const transformedCourts = courtsWithOwnerInfo.map(transformCourtData);
    
    console.log('Sample transformed court:', transformedCourts[0] ? {
      id: transformedCourts[0].id,
      name: transformedCourts[0].name,
      owner: transformedCourts[0].owner,
      totalBookings: transformedCourts[0].totalBookings
    } : 'No transformed courts');
    
    res.json({
      courts: transformedCourts,
      totalCourts: transformedCourts.length
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách sân cho admin:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

module.exports = {
  getCourts,
  getCourtById,
  createCourt,
  updateCourt,
  deleteCourt,
  updateCourtStatus,
  getAllCourtsForAdmin,
  getCourtSchedule,
  getCourtReviews,
  getCourtsByOwner,
  getBookedSlots,
  getPublicCourtBookings
}; 