/**
 * Service wrapper cho Booking
 * File này xử lý việc chuyển đổi giữa gọi API từ backend và Firebase trực tiếp
 */

import api from './api';
import { USE_BACKEND_API } from '../config/appConfig';

// Hàm chuyển đổi dữ liệu booking
const transformBookingData = (booking) => {
  if (!booking) return null;
  
  // Chuyển đổi timestamp nếu cần
  let startTime = booking.startTime;
  let endTime = booking.endTime;
  let date = booking.date;
  
  // Xử lý startTime
  if (typeof startTime === 'string' && startTime.includes(':')) {
    startTime = startTime; // Giữ nguyên nếu là string format "HH:mm"
  } else if (startTime instanceof Date) {
    startTime = startTime.toTimeString().substring(0, 5);
  } else if (startTime?._seconds) {
    const time = new Date(startTime._seconds * 1000);
    startTime = time.toTimeString().substring(0, 5);
  }
  
  // Xử lý endTime
  if (typeof endTime === 'string' && endTime.includes(':')) {
    endTime = endTime; // Giữ nguyên nếu là string format "HH:mm"
  } else if (endTime instanceof Date) {
    endTime = endTime.toTimeString().substring(0, 5);
  } else if (endTime?._seconds) {
    const time = new Date(endTime._seconds * 1000);
    endTime = time.toTimeString().substring(0, 5);
  }
  
  // Xử lý date
  if (date instanceof Date) {
    date = date;
  } else if (typeof date === 'string') {
    date = new Date(date);
  } else if (date?._seconds) {
    date = new Date(date._seconds * 1000);
  }
  
  return {
    ...booking,
    startTime,
    endTime,
    date
  };
};

// Wrapper cho BookingService
const BookingServiceWrapper = {
  // Tạo đặt sân mới
  createBooking: async (courtId, bookingData) => {
    try {
      console.log('BookingServiceWrapper.createBooking called with:', { courtId, bookingData });
      
      // Gọi API /bookings, truyền courtId vào body
      const response = await api.post('/bookings', { ...bookingData, courtId });
      console.log('API response status:', response.status);
      console.log('API response data:', response.data);
      
      if (!response.data || !response.data.booking) {
        console.error('Invalid API response format:', response.data);
        throw new Error('Invalid response format from server');
      }
      
      const transformedBooking = transformBookingData(response.data.booking);
      console.log('Transformed booking:', transformedBooking);
      
      return transformedBooking;
    } catch (error) {
      console.error('Error in BookingServiceWrapper.createBooking:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      throw error;
    }
  },

  // Lấy danh sách đặt sân của người dùng
  getUserBookings: async (userId) => {
    const response = await api.get('/bookings/user');
    return {
      ...response.data,
      bookings: response.data.bookings.map(transformBookingData)
    };
  },

  // Lấy danh sách đặt sân có thể đánh giá
  getReviewableBookings: async () => {
    const response = await api.get('/bookings/reviewable');
    return {
      ...response.data,
      bookings: response.data.bookings.map(transformBookingData)
    };
  },

  // Lấy trạng thái các khung giờ của sân
  getTimeSlotStatus: async (courtId, date) => {
    // Format date to YYYY-MM-DD
    const formattedDate = date instanceof Date 
      ? date.toISOString().split('T')[0]
      : date;

    const response = await api.get(`/courts/${courtId}/time-slots`, {
      params: { date: formattedDate }
    });
    
    console.log('Time slots response:', response.data);
    return response.data.timeSlots || [];
  },

  // Lấy danh sách đặt sân của một sân
  getCourtBookings: async (courtId, date = null, activeOnly = false) => {
    // Tạo params object
    const params = { limit: 50 }; // Giới hạn 50 bookings là đủ cho 1 ngày
    
    // Nếu có date, chỉ lấy bookings cho ngày đó
    if (date) {
      const formattedDate = date instanceof Date 
        ? date.toISOString().split('T')[0]
        : date;
      params.date = formattedDate;
    }
    
    // Nếu activeOnly = true, chỉ lấy pending và confirmed bookings
    if (activeOnly) {
      params.activeOnly = 'true';
    }
    
    const response = await api.get(`/bookings/court/${courtId}`, { params });
    console.log('Response from bookings API:', response.data);
    
    if (!response.data || !response.data.bookings) {
      console.log('Không có dữ liệu booking hoặc định dạng không đúng');
      return {
        bookings: [],
        totalBookings: 0
      };
    }

    // Chuyển đổi dữ liệu từ API về định dạng phù hợp
    const bookings = response.data.bookings.map(booking => ({
      id: booking.id || `${booking.courtId}-${booking.startTime}`,
      courtId: booking.courtId,
      date: booking.date ? new Date(booking.date) : null,
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status || 'booked'
    }));
    
    console.log('Đã xử lý bookings:', bookings);
    
    return {
      bookings: bookings.map(transformBookingData),
      totalBookings: bookings.length
    };
  },

  // Cập nhật trạng thái đặt sân
  updateBookingStatus: async (bookingId, status) => {
    const response = await api.put(`/bookings/${bookingId}/status`, { status });
    return transformBookingData(response.data.booking);
  },

  // Hủy đặt sân
  cancelBooking: async (bookingId) => {
    const response = await api.put(`/bookings/${bookingId}/cancel`);
    return transformBookingData(response.data.booking);
  }
};

export default BookingServiceWrapper; 