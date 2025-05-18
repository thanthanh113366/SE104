/**
 * Service wrapper cho Booking
 * File này xử lý việc chuyển đổi giữa gọi API từ backend và Firebase trực tiếp
 */

import { collection, query, getDocs, addDoc, doc, getDoc, updateDoc, deleteDoc, where, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import api from './api';
import { USE_BACKEND_API } from '../config/appConfig';

// Hàm chuyển đổi dữ liệu booking
const transformBookingData = (booking) => {
  if (!booking) return null;
  
  // Chuyển đổi timestamp nếu cần
  const startTime = booking.startTime instanceof Timestamp 
    ? booking.startTime.toDate() 
    : (booking.startTime && booking.startTime._seconds 
      ? new Date(booking.startTime._seconds * 1000) 
      : booking.startTime);
  
  const endTime = booking.endTime instanceof Timestamp 
    ? booking.endTime.toDate() 
    : (booking.endTime && booking.endTime._seconds 
      ? new Date(booking.endTime._seconds * 1000) 
      : booking.endTime);
  
  return {
    ...booking,
    startTime,
    endTime
  };
};

// Wrapper cho BookingService
const BookingServiceWrapper = {
  // Tạo đặt sân mới
  createBooking: async (courtId, bookingData) => {
    if (USE_BACKEND_API) {
      try {
        const response = await api.post(`/courts/${courtId}/bookings`, bookingData);
        return transformBookingData(response.data.booking);
      } catch (error) {
        console.error('Lỗi khi gọi API createBooking:', error);
        throw error.response?.data || error.message;
      }
    } else {
      try {
        const bookingsRef = collection(db, 'bookings');
        const bookingWithTimestamp = {
          ...bookingData,
          courtId,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: bookingData.status || 'pending'
        };
        
        const docRef = await addDoc(bookingsRef, bookingWithTimestamp);
        
        const newBooking = {
          id: docRef.id,
          ...bookingWithTimestamp
        };
        
        return transformBookingData(newBooking);
      } catch (error) {
        console.error('Lỗi khi truy cập Firebase trực tiếp:', error);
        throw error;
      }
    }
  },

  // Lấy danh sách đặt sân của người dùng
  getUserBookings: async (userId) => {
    if (USE_BACKEND_API) {
      try {
        const response = await api.get('/bookings/my-bookings');
        return {
          ...response.data,
          bookings: response.data.bookings.map(transformBookingData)
        };
      } catch (error) {
        console.error('Lỗi khi gọi API getUserBookings:', error);
        throw error.response?.data || error.message;
      }
    } else {
      try {
        const bookingsRef = collection(db, 'bookings');
        const q = query(bookingsRef, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        
        const bookings = [];
        querySnapshot.forEach((doc) => {
          bookings.push({ id: doc.id, ...doc.data() });
        });
        
        return {
          bookings: bookings.map(transformBookingData),
          totalBookings: bookings.length
        };
      } catch (error) {
        console.error('Lỗi khi truy cập Firebase trực tiếp:', error);
        throw error;
      }
    }
  },

  // Lấy danh sách đặt sân của một sân
  getCourtBookings: async (courtId) => {
    if (USE_BACKEND_API) {
      try {
        const response = await api.get(`/courts/${courtId}/bookings`);
        return {
          ...response.data,
          bookings: response.data.bookings.map(transformBookingData)
        };
      } catch (error) {
        console.error('Lỗi khi gọi API getCourtBookings:', error);
        throw error.response?.data || error.message;
      }
    } else {
      try {
        const bookingsRef = collection(db, 'bookings');
        const q = query(bookingsRef, where('courtId', '==', courtId));
        const querySnapshot = await getDocs(q);
        
        const bookings = [];
        querySnapshot.forEach((doc) => {
          bookings.push({ id: doc.id, ...doc.data() });
        });
        
        return {
          bookings: bookings.map(transformBookingData),
          totalBookings: bookings.length
        };
      } catch (error) {
        console.error('Lỗi khi truy cập Firebase trực tiếp:', error);
        throw error;
      }
    }
  },

  // Cập nhật trạng thái đặt sân
  updateBookingStatus: async (bookingId, status) => {
    if (USE_BACKEND_API) {
      try {
        const response = await api.put(`/bookings/${bookingId}/status`, { status });
        return transformBookingData(response.data.booking);
      } catch (error) {
        console.error('Lỗi khi gọi API updateBookingStatus:', error);
        throw error.response?.data || error.message;
      }
    } else {
      try {
        const bookingRef = doc(db, 'bookings', bookingId);
        const updateData = {
          status,
          updatedAt: new Date()
        };
        
        await updateDoc(bookingRef, updateData);
        
        // Lấy dữ liệu đã cập nhật
        const updatedDoc = await getDoc(bookingRef);
        
        return transformBookingData({ id: updatedDoc.id, ...updatedDoc.data() });
      } catch (error) {
        console.error('Lỗi khi truy cập Firebase trực tiếp:', error);
        throw error;
      }
    }
  },

  // Hủy đặt sân
  cancelBooking: async (bookingId) => {
    if (USE_BACKEND_API) {
      try {
        const response = await api.put(`/bookings/${bookingId}/cancel`);
        return transformBookingData(response.data.booking);
      } catch (error) {
        console.error('Lỗi khi gọi API cancelBooking:', error);
        throw error.response?.data || error.message;
      }
    } else {
      try {
        const bookingRef = doc(db, 'bookings', bookingId);
        const updateData = {
          status: 'cancelled',
          updatedAt: new Date()
        };
        
        await updateDoc(bookingRef, updateData);
        
        // Lấy dữ liệu đã cập nhật
        const updatedDoc = await getDoc(bookingRef);
        
        return transformBookingData({ id: updatedDoc.id, ...updatedDoc.data() });
      } catch (error) {
        console.error('Lỗi khi truy cập Firebase trực tiếp:', error);
        throw error;
      }
    }
  }
};

export default BookingServiceWrapper; 