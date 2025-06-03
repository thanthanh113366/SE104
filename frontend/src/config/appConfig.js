/**
 * Cấu hình cho ứng dụng
 * File này chứa các cài đặt cho phép chuyển đổi giữa gọi API từ backend
 * và gọi Firebase trực tiếp
 */

// Cấu hình sử dụng API thay vì Firebase trực tiếp
// Đặt true để sử dụng Backend API
export const USE_BACKEND_API = true;

// URL của API backend
// Production: sử dụng same domain, Development: localhost
const isDevelopment = process.env.NODE_ENV === 'development';
const productionURL = window.location.origin + '/api';
const developmentURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const API_BASE_URL = isDevelopment ? developmentURL : productionURL;

// Firebase vẫn được sử dụng cho xác thực
export const USE_FIREBASE_AUTH = true;

console.log('App Config:', {
  isDevelopment,
  API_BASE_URL,
  USE_BACKEND_API,
  USE_FIREBASE_AUTH
}); 