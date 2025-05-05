/**
 * Tiện ích để đọc biến môi trường an toàn
 * Chúng ta không lưu trữ giá trị mặc định để tránh commit thông tin nhạy cảm
 */

// Hàm kiểm tra và cảnh báo về biến môi trường thiếu
const checkAndWarn = (key) => {
  const value = process.env[key];
  if (!value) {
    console.warn(`Environment variable ${key} is missing. Please check your .env file.`);
  }
  return value;
};

// Tạo một đối tượng chứa tất cả biến môi trường
export const env = {
  // Firebase config
  FIREBASE_API_KEY: checkAndWarn('REACT_APP_FIREBASE_API_KEY'),
  FIREBASE_AUTH_DOMAIN: checkAndWarn('REACT_APP_FIREBASE_AUTH_DOMAIN'),
  FIREBASE_PROJECT_ID: checkAndWarn('REACT_APP_FIREBASE_PROJECT_ID'),
  FIREBASE_STORAGE_BUCKET: checkAndWarn('REACT_APP_FIREBASE_STORAGE_BUCKET'),
  FIREBASE_MESSAGING_SENDER_ID: checkAndWarn('REACT_APP_FIREBASE_MESSAGING_SENDER_ID'),
  FIREBASE_APP_ID: checkAndWarn('REACT_APP_FIREBASE_APP_ID'),
  FIREBASE_MEASUREMENT_ID: checkAndWarn('REACT_APP_FIREBASE_MEASUREMENT_ID'),
  
  // API endpoints - dùng cho sau này
  API_URL: process.env.REACT_APP_API_URL || "http://localhost:5000",
  
  // Cấu hình khác
  NODE_ENV: process.env.NODE_ENV || "development",
  IS_PRODUCTION: process.env.NODE_ENV === "production",
};

/**
 * Kiểm tra xem biến môi trường có hoạt động hay không
 * @returns {boolean} - true nếu biến môi trường hoạt động
 */
export const checkEnvWorking = () => {
  return Boolean(process.env.REACT_APP_FIREBASE_API_KEY);
};

export default env; 