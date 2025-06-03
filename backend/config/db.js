const { db, getCollection } = require('./firebaseAdmin');

/**
 * Kết nối đến Firestore Database
 * @returns {Object} - Đối tượng firestore đã được khởi tạo
 */
const connectFirestore = () => {
  try {
    console.log('Kết nối đến Firestore thành công');
    return db;
  } catch (error) {
    console.error('Lỗi kết nối đến Firestore:', error);
    throw error;
  }
};

module.exports = {
  connect: connectFirestore,
  getCollection,
  db
}; 