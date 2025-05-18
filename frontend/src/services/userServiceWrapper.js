/**
 * Service wrapper cho User
 * File này xử lý việc chuyển đổi giữa gọi API từ backend và Firebase trực tiếp
 */

import { collection, query, getDocs, doc, getDoc, updateDoc, setDoc, where } from 'firebase/firestore';
import { db } from '../firebase';
import api from './api';
import { USE_BACKEND_API } from '../config/appConfig';

// Hàm chuyển đổi dữ liệu người dùng
const transformUserData = (user) => {
  if (!user) return null;
  return user;
};

// Wrapper cho UserService
const UserServiceWrapper = {
  // Lấy thông tin hồ sơ người dùng
  getUserProfile: async (userId) => {
    if (USE_BACKEND_API) {
      try {
        const response = await api.get('/users/profile');
        return transformUserData(response.data.user);
      } catch (error) {
        console.error('Lỗi khi gọi API getUserProfile:', error);
        throw error.response?.data || error.message;
      }
    } else {
      try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          throw new Error('Không tìm thấy người dùng');
        }
        
        return transformUserData({ id: userDoc.id, ...userDoc.data() });
      } catch (error) {
        console.error('Lỗi khi truy cập Firebase trực tiếp:', error);
        throw error;
      }
    }
  },

  // Cập nhật thông tin hồ sơ người dùng
  updateUserProfile: async (userId, userData) => {
    if (USE_BACKEND_API) {
      try {
        const response = await api.put('/users/profile', userData);
        return transformUserData(response.data.user);
      } catch (error) {
        console.error('Lỗi khi gọi API updateUserProfile:', error);
        throw error.response?.data || error.message;
      }
    } else {
      try {
        const userRef = doc(db, 'users', userId);
        const updateData = {
          ...userData,
          updatedAt: new Date()
        };
        
        await updateDoc(userRef, updateData);
        
        // Lấy dữ liệu đã cập nhật
        const updatedDoc = await getDoc(userRef);
        
        return transformUserData({ id: updatedDoc.id, ...updatedDoc.data() });
      } catch (error) {
        console.error('Lỗi khi truy cập Firebase trực tiếp:', error);
        throw error;
      }
    }
  },

  // Tạo hồ sơ người dùng mới (sau khi đăng ký)
  createUserProfile: async (userId, userData) => {
    if (USE_BACKEND_API) {
      try {
        const response = await api.post('/users/profile', userData);
        return transformUserData(response.data.user);
      } catch (error) {
        console.error('Lỗi khi gọi API createUserProfile:', error);
        throw error.response?.data || error.message;
      }
    } else {
      try {
        const userRef = doc(db, 'users', userId);
        const newUser = {
          ...userData,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await setDoc(userRef, newUser);
        
        return transformUserData({ id: userId, ...newUser });
      } catch (error) {
        console.error('Lỗi khi truy cập Firebase trực tiếp:', error);
        throw error;
      }
    }
  },

  // Kiểm tra xem một người dùng có tồn tại không
  checkUserExists: async (email) => {
    if (USE_BACKEND_API) {
      try {
        const response = await api.get(`/users/check?email=${email}`);
        return response.data.exists;
      } catch (error) {
        console.error('Lỗi khi gọi API checkUserExists:', error);
        throw error.response?.data || error.message;
      }
    } else {
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', email));
        const querySnapshot = await getDocs(q);
        
        return !querySnapshot.empty;
      } catch (error) {
        console.error('Lỗi khi truy cập Firebase trực tiếp:', error);
        throw error;
      }
    }
  }
};

export default UserServiceWrapper; 