import api from './api';

const supportService = {
  // Tạo ticket hỗ trợ mới
  createSupport: async (supportData) => {
    try {
      const response = await api.post('/supports', supportData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lấy danh sách ticket của user
  getUserSupports: async () => {
    try {
      const response = await api.get('/supports/user');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lấy chi tiết ticket
  getSupportById: async (id) => {
    try {
      const response = await api.get(`/supports/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Thêm phản hồi cho ticket
  addReply: async (id, replyData) => {
    try {
      const response = await api.post(`/supports/${id}/reply`, replyData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Đánh giá chất lượng hỗ trợ
  rateSupport: async (id, ratingData) => {
    try {
      const response = await api.post(`/supports/${id}/rate`, ratingData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lấy danh sách ticket cho admin
  getAdminSupports: async () => {
    try {
      const response = await api.get('/supports/admin');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cập nhật trạng thái ticket (admin)
  updateSupportStatus: async (id, status) => {
    try {
      const response = await api.put(`/supports/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default supportService; 