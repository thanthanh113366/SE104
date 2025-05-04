const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

// Khởi tạo Firebase Admin SDK
// Trong thực tế, bạn sẽ cần credentials từ Firebase Console
// Sẽ được cập nhật sau với thông tin thực tế
try {
  // Trong môi trường phát triển, chúng ta sẽ sử dụng cách đơn giản
  if (!admin.apps.length) {
    admin.initializeApp({
      // projectId sẽ được cập nhật sau
      projectId: 'sports-facility-booking'
    });
  }

  console.log('Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error.message);
}

const db = admin.firestore();

module.exports = { admin, db }; 