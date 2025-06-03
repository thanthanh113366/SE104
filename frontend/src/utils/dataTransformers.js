/**
 * Utilities cho việc chuyển đổi dữ liệu giữa API và ứng dụng
 */

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
 * Chuyển đổi dữ liệu sân từ API để sử dụng trong frontend
 * @param {Object} court - Dữ liệu sân từ API
 * @returns {Object} - Dữ liệu sân đã được xử lý
 */
export const transformCourtData = (court) => {
  if (!court) return null;
  
  // Xử lý sport type - chuyển từ 'type' sang 'sport' và map tên tiếng Việt
  const sportType = court.type || court.sport || 'football';
  const sportName = SPORT_NAMES[sportType] || sportType || 'Không xác định';
  
  return {
    ...court,
    // Chuyển đổi ngày giờ nếu cần
    createdAt: court.createdAt ? new Date(court.createdAt) : null,
    updatedAt: court.updatedAt ? new Date(court.updatedAt) : null,
    
    // Đảm bảo các trường bắt buộc
    name: court.name || 'Chưa có tên',
    address: court.address || 'Chưa có địa chỉ',
    description: court.description || 'Chưa có mô tả',
    price: court.price || 0,
    
    // Xử lý sport - giữ cả mã tiếng Anh và tên tiếng Việt
    type: sportType, // Mã tiếng Anh cho việc lọc
    sport: sportName, // Tên tiếng Việt để hiển thị
    sportCode: sportType, // Alias cho type để tương thích với code cũ
    
    // Đảm bảo giờ mở cửa/đóng cửa
    openTime: court.openTime || '07:00',
    closeTime: court.closeTime || '22:00',
    
    // Đảm bảo facilities là mảng
    facilities: Array.isArray(court.facilities) ? court.facilities : [],
    
    // Đảm bảo owner có giá trị mặc định
    owner: court.owner || { name: 'Chưa có thông tin', phone: 'Chưa có thông tin' },
    
    // Đảm bảo reviews là mảng
    reviews: Array.isArray(court.reviews) ? court.reviews : [],
    
    // Đảm bảo có hình ảnh mặc định
    image: court.image || 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800',
    
    // Đảm bảo amenities là mảng
    amenities: Array.isArray(court.amenities) ? court.amenities : [],
    
    // Đảm bảo images là mảng
    images: Array.isArray(court.images) ? court.images : [],
    
    // Tính toán giá hiển thị (có thể thêm logic giảm giá ở đây)
    displayPrice: court.price?.toLocaleString('vi-VN') + ' đ/giờ' || 'Liên hệ để biết giá',
    
    // Đảm bảo rating có giá trị
    rating: court.rating || 0,
    
    // Trạng thái sân
    status: court.status || 'active'
  };
};

/**
 * Chuyển đổi dữ liệu booking từ API để sử dụng trong frontend
 * @param {Object} booking - Dữ liệu booking từ API
 * @returns {Object} - Dữ liệu booking đã được xử lý
 */
export const transformBookingData = (booking) => {
  if (!booking) return null;
  
  return {
    ...booking,
    // Chuyển đổi ngày giờ
    startTime: booking.startTime ? new Date(booking.startTime) : null,
    endTime: booking.endTime ? new Date(booking.endTime) : null,
    createdAt: booking.createdAt ? new Date(booking.createdAt) : null,
    
    // Định dạng giá tiền
    displayAmount: booking.amount?.toLocaleString('vi-VN') + ' đ' || '0 đ',
    
    // Trạng thái booking
    statusText: getBookingStatusText(booking.status)
  };
};

/**
 * Lấy text hiển thị cho trạng thái booking
 * @param {string} status - Trạng thái booking
 * @returns {string} - Text hiển thị
 */
const getBookingStatusText = (status) => {
  const statusMap = {
    'pending': 'Chờ xác nhận',
    'confirmed': 'Đã xác nhận',
    'canceled': 'Đã hủy',
    'completed': 'Hoàn thành',
    'paid': 'Đã thanh toán'
  };
  
  return statusMap[status] || 'Không xác định';
}; 