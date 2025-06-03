/**
 * Service wrapper cho Court
 * File này xử lý việc chuyển đổi giữa gọi API từ backend và Firebase trực tiếp
 */

import { collection, query, getDocs, addDoc, doc, getDoc, updateDoc, deleteDoc, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import api from './api';
import { USE_BACKEND_API } from '../config/appConfig';
import { transformCourtData } from '../utils/dataTransformers';

// Wrapper cho CourtService
const CourtServiceWrapper = {
  // Lấy danh sách sân
  getCourts: async (params) => {
    if (USE_BACKEND_API) {
      try {
        // Sử dụng API
        const response = await api.get('/courts', { params });
        return {
          ...response.data,
          courts: response.data.courts.map(transformCourtData)
        };
      } catch (error) {
        console.error('Lỗi khi gọi API getCourts:', error);
        throw error.response?.data || error.message;
      }
    } else {
      // Sử dụng Firebase trực tiếp
      try {
        const courtsRef = collection(db, 'courts');
        const q = query(courtsRef);
        const querySnapshot = await getDocs(q);
        
        const courts = [];
        querySnapshot.forEach((doc) => {
          courts.push({ id: doc.id, ...doc.data() });
        });
        
        return {
          courts: courts.map(transformCourtData),
          currentPage: 1,
          totalPages: 1,
          totalCourts: courts.length
        };
      } catch (error) {
        console.error('Lỗi khi truy cập Firebase trực tiếp:', error);
        throw error;
      }
    }
  },

  // Lấy chi tiết sân
  getCourtById: async (id) => {
    if (USE_BACKEND_API) {
      try {
        const response = await api.get(`/courts/${id}`);
        return transformCourtData(response.data.court);
      } catch (error) {
        console.error('Lỗi khi gọi API getCourtById:', error);
        throw error.response?.data || error.message;
      }
    } else {
      try {
        const courtRef = doc(db, 'courts', id);
        const courtDoc = await getDoc(courtRef);
        
        if (!courtDoc.exists()) {
          throw new Error('Không tìm thấy sân');
        }
        
        return transformCourtData({ id: courtDoc.id, ...courtDoc.data() });
      } catch (error) {
        console.error('Lỗi khi truy cập Firebase trực tiếp:', error);
        throw error;
      }
    }
  },

  // Tạo sân mới
  createCourt: async (courtData) => {
    if (USE_BACKEND_API) {
      try {
        const response = await api.post('/courts', courtData);
        return transformCourtData(response.data.court);
      } catch (error) {
        console.error('Lỗi khi gọi API createCourt:', error);
        throw error.response?.data || error.message;
      }
    } else {
      try {
        const courtsRef = collection(db, 'courts');
        const docRef = await addDoc(courtsRef, {
          ...courtData,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        const newCourt = {
          id: docRef.id,
          ...courtData,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        return transformCourtData(newCourt);
      } catch (error) {
        console.error('Lỗi khi truy cập Firebase trực tiếp:', error);
        throw error;
      }
    }
  },

  // Cập nhật sân
  updateCourt: async (id, courtData) => {
    if (USE_BACKEND_API) {
      try {
        const response = await api.put(`/courts/${id}`, courtData);
        return transformCourtData(response.data.court);
      } catch (error) {
        console.error('Lỗi khi gọi API updateCourt:', error);
        throw error.response?.data || error.message;
      }
    } else {
      try {
        const courtRef = doc(db, 'courts', id);
        const updateData = {
          ...courtData,
          updatedAt: new Date()
        };
        
        await updateDoc(courtRef, updateData);
        
        // Lấy dữ liệu đã cập nhật
        const updatedDoc = await getDoc(courtRef);
        
        return transformCourtData({ id: updatedDoc.id, ...updatedDoc.data() });
      } catch (error) {
        console.error('Lỗi khi truy cập Firebase trực tiếp:', error);
        throw error;
      }
    }
  },

  // Xóa sân
  deleteCourt: async (id) => {
    if (USE_BACKEND_API) {
      try {
        const response = await api.delete(`/courts/${id}`);
        return response.data;
      } catch (error) {
        console.error('Lỗi khi gọi API deleteCourt:', error);
        throw error.response?.data || error.message;
      }
    } else {
      try {
        const courtRef = doc(db, 'courts', id);
        await deleteDoc(courtRef);
        
        return { message: 'Xóa sân thành công' };
      } catch (error) {
        console.error('Lỗi khi truy cập Firebase trực tiếp:', error);
        throw error;
      }
    }
  },

  // Lấy sân theo chủ sân
  getCourtsByOwner: async (ownerId) => {
    if (USE_BACKEND_API) {
      try {
        const response = await api.get('/courts/owner');
        return {
          ...response.data,
          courts: response.data.courts.map(transformCourtData)
        };
      } catch (error) {
        console.error('Lỗi khi gọi API getCourtsByOwner:', error);
        throw error.response?.data || error.message;
      }
    } else {
      try {
        const courtsRef = collection(db, 'courts');
        const q = query(courtsRef, where('ownerId', '==', ownerId));
        const querySnapshot = await getDocs(q);
        
        const courts = [];
        querySnapshot.forEach((doc) => {
          courts.push({ id: doc.id, ...doc.data() });
        });
        
        return {
          courts: courts.map(transformCourtData),
          totalCourts: courts.length
        };
      } catch (error) {
        console.error('Lỗi khi truy cập Firebase trực tiếp:', error);
        throw error;
      }
    }
  },

  getBookedSlots: async (courtId, date) => {
    if (USE_BACKEND_API) {
      try {
        const response = await api.get(`/courts/${courtId}/booked-slots`, { params: { date } });
        return response.data.slots;
      } catch (error) {
        console.error('Lỗi khi gọi API getBookedSlots:', error);
        throw error.response?.data || error.message;
      }
    } else {
      // Firebase: lấy booking của sân theo ngày
      try {
        const bookingsRef = collection(db, 'bookings');
        const q = query(bookingsRef, where('courtId', '==', courtId), where('date', '==', date));
        const querySnapshot = await getDocs(q);
        const slots = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          slots.push({
            startTime: data.startTime,
            endTime: data.endTime,
            status: data.status
          });
        });
        return slots;
      } catch (error) {
        console.error('Lỗi khi truy cập Firebase trực tiếp:', error);
        throw error;
      }
    }
  }
};

export default CourtServiceWrapper; 