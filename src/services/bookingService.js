import api from './api';
import { transformBookingData } from '../utils/dataTransformers';

const bookingService = {
  // Tạo booking mới
  createBooking: async (bookingData) => {
    try {
      const response = await api.post('/bookings', bookingData);
      return transformBookingData(response.data);
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lấy danh sách booking của user
  getUserBookings: async () => {
    try {
      const response = await api.get('/bookings/user');
      return {
        ...response.data,
        bookings: response.data.bookings.map(transformBookingData)
      };
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lấy chi tiết booking
  getBookingById: async (id) => {
    try {
      const response = await api.get(`/bookings/${id}`);
      return transformBookingData(response.data);
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Hủy booking
  cancelBooking: async (id) => {
    try {
      const response = await api.put(`/bookings/${id}/cancel`);
      return transformBookingData(response.data);
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lấy danh sách booking của sân (cho owner)
  getCourtBookings: async (courtId) => {
    try {
      const response = await api.get(`/bookings/court/${courtId}`);
      return {
        ...response.data,
        bookings: response.data.bookings.map(transformBookingData)
      };
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Xác nhận booking (cho owner)
  confirmBooking: async (id) => {
    try {
      const response = await api.put(`/bookings/${id}/confirm`);
      return transformBookingData(response.data);
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default bookingService; 