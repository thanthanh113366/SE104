/**
 * Service wrapper cho Booking
 * File này xử lý việc chuyển đổi giữa gọi API từ backend và Firebase trực tiếp
 */

import { collection, query, getDocs, addDoc, doc, getDoc, updateDoc, deleteDoc, where, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
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
    if (USE_BACKEND_API) {
      try {
        // Gọi API /bookings, truyền courtId vào body
        const response = await api.post('/bookings', { ...bookingData, courtId });
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

  // Lấy trạng thái các khung giờ của sân
  getTimeSlotStatus: async (courtId, date) => {
    if (USE_BACKEND_API) {
      try {
        // Format date to YYYY-MM-DD
        const formattedDate = date instanceof Date 
          ? date.toISOString().split('T')[0]
          : date;

        const response = await api.get(`/courts/${courtId}/time-slots`, {
          params: { date: formattedDate }
        });
        
        console.log('Time slots response:', response.data);
        return response.data.timeSlots || [];
      } catch (error) {
        console.error('Lỗi khi lấy trạng thái khung giờ:', error);
        return [];
      }
    } else {
      try {
        const bookingsRef = collection(db, 'bookings');
        const q = query(
          bookingsRef,
          where('courtId', '==', courtId),
          where('date', '==', date),
          where('status', 'in', ['confirmed', 'pending'])
        );
        
        const querySnapshot = await getDocs(q);
        const timeSlots = [];
        
        querySnapshot.forEach((doc) => {
          const booking = doc.data();
          timeSlots.push({
            startTime: booking.startTime,
            endTime: booking.endTime,
            status: booking.status
          });
        });
        
        return timeSlots;
      } catch (error) {
        console.error('Lỗi khi truy cập Firebase trực tiếp:', error);
        return [];
      }
    }
  },

  // Lấy danh sách đặt sân của một sân
  getCourtBookings: async (courtId) => {
    if (USE_BACKEND_API) {
      try {
        // Sử dụng endpoint chính xác
        const response = await api.get(`/bookings/court/${courtId}`);
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
      } catch (error) {
        console.error('Lỗi khi gọi API getCourtBookings:', error);
        // Nếu API lỗi, trả về mảng rỗng để không làm gián đoạn UI
        return {
          bookings: [],
          totalBookings: 0
        };
      }
    }

    // Nếu không sử dụng API, dùng Firebase trực tiếp
    try {
      const bookingsRef = collection(db, 'bookings');
      // Sử dụng index hiện có: courtId, status, date
      const q = query(
        bookingsRef,
        where('courtId', '==', courtId),
        where('status', 'in', ['confirmed', 'pending', 'completed']),
        orderBy('date', 'asc')
      );
      
      console.log('Đang lấy bookings cho sân:', courtId);
      const querySnapshot = await getDocs(q);
      
      const bookings = [];
      querySnapshot.forEach((doc) => {
        const bookingData = doc.data();
        // Chỉ lấy thông tin cần thiết cho hiển thị
        const publicBookingData = {
          id: doc.id,
          courtId: bookingData.courtId,
          date: bookingData.date instanceof Timestamp ? bookingData.date.toDate() : new Date(bookingData.date),
          startTime: bookingData.startTime,
          endTime: bookingData.endTime,
          status: bookingData.status
        };
        console.log('Booking data:', publicBookingData);
        bookings.push(publicBookingData);
      });
      
      console.log('Tổng số bookings tìm thấy:', bookings.length);
      return {
        bookings,
        totalBookings: bookings.length
      };
    } catch (error) {
      console.error('Lỗi khi truy cập Firebase trực tiếp:', error);
      if (error.code === 'failed-precondition') {
        console.error('Lỗi index. Vui lòng tạo composite index cho collection bookings');
        console.error('Link tạo index:', error.message);
      }
      return {
        bookings: [],
        totalBookings: 0
      };
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