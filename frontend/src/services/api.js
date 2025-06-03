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
    let token = null;
    console.log('Current user:', auth.currentUser);
    
    if (auth.currentUser) {
      token = await auth.currentUser.getIdToken();
      console.log('Got token from current user:', token ? 'yes' : 'no');
    } else {
      token = localStorage.getItem('token') || sessionStorage.getItem('token');
      console.log('Got token from storage:', token ? 'yes' : 'no');
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Added token to headers');
    } else {
      console.log('No token available');
      // Thêm header để backend biết đây là request public
      config.headers['X-Public-Access'] = 'true';
    }
    
    // Log full request URL
    const fullUrl = `${config.baseURL}${config.url}`;
    console.log('Making request to:', fullUrl);
    console.log('Request config:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      params: config.params
    });
    
    return config;
  },
  (error) => {
    console.error('Error in request interceptor:', error);
    return Promise.reject(error);
  }
);

// Interceptor để xử lý response
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      response: error.response?.data
    });
    return Promise.reject(error);
  }
);

// Các service cho người dùng
export const userService = {
  // Lấy thông tin hồ sơ người dùng
  getProfile: async () => {
    return api.get('/users/profile');
  },
  
  // Cập nhật thông tin hồ sơ
  updateProfile: async (userData) => {
    return api.put('/users/profile', userData);
  },
};

// Các service cho chủ sân
export const ownerService = {
  // Tạo sân mới
  createCourt: async (courtData) => {
    return api.post('/courts', courtData);
  },
  
  // Lấy danh sách sân đã đăng ký
  getMyCourts: async () => {
    return api.get('/courts/owner');
  },
  
  // Cập nhật thông tin sân
  updateCourt: async (courtId, courtData) => {
    return api.put(`/courts/${courtId}`, courtData);
  },
  
  // Xóa sân
  deleteCourt: async (courtId) => {
    return api.delete(`/courts/${courtId}`);
  },
  
  // Lấy danh sách đặt sân
  getCourtBookings: async (courtId) => {
    return api.get(`/courts/${courtId}/bookings`);
  },
  
  // Chấp nhận yêu cầu đặt sân
  approveBooking: async (bookingId) => {
    return api.put(`/bookings/${bookingId}/approve`);
  },
  
  // Từ chối yêu cầu đặt sân
  rejectBooking: async (bookingId) => {
    return api.put(`/bookings/${bookingId}/reject`);
  },
};

// Các service cho người thuê sân
export const renterService = {
  // Tìm kiếm sân
  searchCourts: async (params) => {
    return api.get('/courts/search', { params });
  },
  
  // Lấy thông tin chi tiết sân
  getCourtDetails: async (courtId) => {
    return api.get(`/courts/${courtId}`);
  },
  
  // Đặt sân
  createBooking: async (courtId, bookingData) => {
    return api.post(`/courts/${courtId}/bookings`, bookingData);
  },
  
  // Lấy lịch sử đặt sân
  getMyBookings: async () => {
    return api.get('/bookings/my-bookings');
  },
  
  // Hủy đặt sân
  cancelBooking: async (bookingId) => {
    return api.put(`/bookings/${bookingId}/cancel`);
  },
};

// Các service cho Admin
export const adminService = {
  // Lấy danh sách tất cả người dùng
  getAllUsers: async () => {
    return api.get('/admin/users');
  },
  
  // Lấy danh sách tất cả sân
  getAllCourts: async () => {
    return api.get('/admin/courts');
  },
  
  // Lấy danh sách tất cả đặt sân
  getAllBookings: async () => {
    return api.get('/admin/bookings');
  },
  
  // Cập nhật trạng thái người dùng
  updateUserStatus: async (userId, status) => {
    return api.put(`/admin/users/${userId}/status`, { status });
  },
};

export default api; 