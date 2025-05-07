import api from './api';
import { transformCourtData } from '../utils/dataTransformers';

const courtService = {
  // Lấy danh sách sân
  getCourts: async (params) => {
    try {
      const response = await api.get('/courts', { params });
      return {
        ...response.data,
        courts: response.data.courts.map(transformCourtData)
      };
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lấy chi tiết sân
  getCourtById: async (id) => {
    try {
      const response = await api.get(`/courts/${id}`);
      return transformCourtData(response.data);
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Tạo sân mới (chỉ owner)
  createCourt: async (courtData) => {
    try {
      const response = await api.post('/courts', courtData);
      return transformCourtData(response.data);
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cập nhật sân (chỉ owner)
  updateCourt: async (id, courtData) => {
    try {
      const response = await api.put(`/courts/${id}`, courtData);
      return transformCourtData(response.data);
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Xóa sân (chỉ owner)
  deleteCourt: async (id) => {
    try {
      const response = await api.delete(`/courts/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lấy danh sách sân của owner
  getOwnerCourts: async () => {
    try {
      const response = await api.get('/courts/owner');
      return {
        ...response.data,
        courts: response.data.courts.map(transformCourtData)
      };
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default courtService; 