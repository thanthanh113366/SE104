import axios from 'axios';
import { auth } from '../firebase';
import { API_BASE_URL } from '../config/appConfig';

// Axios instance với cấu hình mặc định
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để tự động thêm token xác thực vào header
api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Các service cho người dùng
export const userService = {
  // Lấy thông tin hồ sơ người dùng
  getProfile: async () => {
    return api.get('/api/users/profile');
  },
  
  // Cập nhật thông tin hồ sơ
  updateProfile: async (userData) => {
    return api.put('/api/users/profile', userData);
  },
};

// Các service cho chủ sân
export const ownerService = {
  // Tạo sân mới
  createCourt: async (courtData) => {
    return api.post('/api/courts', courtData);
  },
  
  // Lấy danh sách sân đã đăng ký
  getMyCourts: async () => {
    return api.get('/api/courts/owner');
  },
  
  // Cập nhật thông tin sân
  updateCourt: async (courtId, courtData) => {
    return api.put(`/api/courts/${courtId}`, courtData);
  },
  
  // Xóa sân
  deleteCourt: async (courtId) => {
    return api.delete(`/api/courts/${courtId}`);
  },
  
  // Lấy danh sách đặt sân
  getCourtBookings: async (courtId) => {
    return api.get(`/api/courts/${courtId}/bookings`);
  },
  
  // Chấp nhận yêu cầu đặt sân
  approveBooking: async (bookingId) => {
    return api.put(`/api/bookings/${bookingId}/approve`);
  },
  
  // Từ chối yêu cầu đặt sân
  rejectBooking: async (bookingId) => {
    return api.put(`/api/bookings/${bookingId}/reject`);
  },
};

// Các service cho người thuê sân
export const renterService = {
  // Tìm kiếm sân
  searchCourts: async (params) => {
    return api.get('/api/courts/search', { params });
  },
  
  // Lấy thông tin chi tiết sân
  getCourtDetails: async (courtId) => {
    return api.get(`/api/courts/${courtId}`);
  },
  
  // Đặt sân
  createBooking: async (courtId, bookingData) => {
    return api.post(`/api/courts/${courtId}/bookings`, bookingData);
  },
  
  // Lấy lịch sử đặt sân
  getMyBookings: async () => {
    return api.get('/api/bookings/my-bookings');
  },
  
  // Hủy đặt sân
  cancelBooking: async (bookingId) => {
    return api.put(`/api/bookings/${bookingId}/cancel`);
  },
};

// Các service cho Admin
export const adminService = {
  // Lấy danh sách tất cả người dùng
  getAllUsers: async () => {
    return api.get('/api/admin/users');
  },
  
  // Lấy danh sách tất cả sân
  getAllCourts: async () => {
    return api.get('/api/admin/courts');
  },
  
  // Lấy danh sách tất cả đặt sân
  getAllBookings: async () => {
    return api.get('/api/admin/bookings');
  },
  
  // Cập nhật trạng thái người dùng
  updateUserStatus: async (userId, status) => {
    return api.put(`/api/admin/users/${userId}/status`, { status });
  },
};

export default api; 