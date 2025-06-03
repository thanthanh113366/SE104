import api from '../api/axios';

const adminService = {
  // Lấy tất cả sân
  getAllCourts: async () => {
    const response = await api.get('/courts');
    return response;
  },

  // Lấy chi tiết sân với owner info
  getCourtDetails: async (courtId) => {
    const response = await api.get(`/courts/${courtId}`);
    return response;
  }
};

export default adminService; 