/**
 * Cấu hình cho ứng dụng
 * File này chứa các cài đặt cho phép chuyển đổi giữa gọi API từ backend
 * và gọi Firebase trực tiếp
 */

// Cấu hình sử dụng API thay vì Firebase trực tiếp
// Đặt true để sử dụng Backend API
export const USE_BACKEND_API = true;

// URL của API backend
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Firebase vẫn được sử dụng cho xác thực
export const USE_FIREBASE_AUTH = true; 