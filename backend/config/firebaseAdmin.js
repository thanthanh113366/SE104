const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey');

// Khởi tạo Firebase Admin
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });
    console.log('Đã khởi tạo Firebase Admin thành công');
  } catch (error) {
    console.error('Lỗi khởi tạo Firebase Admin:', error);
    throw error;
  }
}

// Tạo tham chiếu đến Firestore và Storage
const db = admin.firestore();
const storage = admin.storage();

// Hàm lấy collection từ Firestore
const getCollection = (collectionName) => {
  return db.collection(collectionName);
};

// Export các tham chiếu để sử dụng ở nơi khác
module.exports = {
  admin,
  db,
  getCollection,
  storage
}; 