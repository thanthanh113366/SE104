/**
 * Utilities cho việc chuyển đổi dữ liệu giữa API và ứng dụng
 */

/**
 * Chuyển đổi dữ liệu sân từ API để sử dụng trong frontend
 * @param {Object} court - Dữ liệu sân từ API
 * @returns {Object} - Dữ liệu sân đã được xử lý
 */
export const transformCourtData = (court) => {
  if (!court) return null;
  
  return {
    ...court,
    // Chuyển đổi ngày giờ nếu cần
    createdAt: court.createdAt ? new Date(court.createdAt) : null,
    updatedAt: court.updatedAt ? new Date(court.updatedAt) : null,
    
    // Đảm bảo các trường bắt buộc
    name: court.name || 'Chưa có tên',
    address: court.address || 'Chưa có địa chỉ',
    price: court.price || 0,
    
    // Đảm bảo amenities là mảng
    amenities: Array.isArray(court.amenities) ? court.amenities : [],
    
    // Đảm bảo images là mảng
    images: Array.isArray(court.images) ? court.images : [],
    
    // Tính toán giá hiển thị (có thể thêm logic giảm giá ở đây)
    displayPrice: court.price?.toLocaleString('vi-VN') + ' đ/giờ' || 'Liên hệ để biết giá',
    
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