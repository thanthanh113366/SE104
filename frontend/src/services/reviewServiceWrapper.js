import axios from 'axios';
import { auth } from '../firebase';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ReviewServiceWrapper {
  // Tạo review mới
  static async createReview(reviewData) {
    const token = await auth.currentUser?.getIdToken();
    
    if (!token) {
      throw new Error('Vui lòng đăng nhập để viết đánh giá');
    }

    const response = await axios.post(
      `${API_BASE_URL}/reviews`,
      reviewData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  }

  // Lấy đánh giá của sân
  static async getCourtReviews(courtId, options = {}) {
    const token = await auth.currentUser?.getIdToken();
    
    const response = await axios.get(
      `${API_BASE_URL}/reviews/court/${courtId}`,
      {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        params: options
      }
    );

    return response.data;
  }

  // Lấy đánh giá của user
  static async getUserReviews(userId = null) {
    const currentUserId = userId || auth.currentUser?.uid;
    
    if (!currentUserId) {
      throw new Error('Vui lòng đăng nhập để xem đánh giá');
    }

    const token = await auth.currentUser?.getIdToken();
    
    const response = await axios.get(
      `${API_BASE_URL}/reviews/user`,
      {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      }
    );

    return response.data;
  }

  // Cập nhật đánh giá
  static async updateReview(reviewId, updateData) {
    const token = await auth.currentUser?.getIdToken();
    
    if (!token) {
      throw new Error('Vui lòng đăng nhập để cập nhật đánh giá');
    }

    const response = await axios.put(
      `${API_BASE_URL}/reviews/${reviewId}`,
      updateData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  }

  // Xóa đánh giá
  static async deleteReview(reviewId) {
    const token = await auth.currentUser?.getIdToken();
    
    if (!token) {
      throw new Error('Vui lòng đăng nhập để xóa đánh giá');
    }

    const response = await axios.delete(
      `${API_BASE_URL}/reviews/${reviewId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    return response.data;
  }

  // Thêm phản hồi của chủ sân
  static async addOwnerReply(reviewId, replyData) {
    const token = await auth.currentUser?.getIdToken();
    
    if (!token) {
      throw new Error('Vui lòng đăng nhập để phản hồi');
    }

    const response = await axios.post(
      `${API_BASE_URL}/reviews/${reviewId}/reply`,
      replyData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  }

  // Kiểm tra xem user có thể đánh giá booking này không
  static async canUserReviewBooking(bookingId) {
    const token = await auth.currentUser?.getIdToken();
    
    if (!token) {
      return { canReview: false, reason: 'Chưa đăng nhập' };
    }

    const response = await axios.get(
      `${API_BASE_URL}/reviews/can-review/${bookingId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    return response.data;
  }
}

export default ReviewServiceWrapper; 