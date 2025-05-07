const { firestore } = require('./firebaseAdmin');

/**
 * Kết nối đến Firestore Database
 * @returns {Object} - Đối tượng firestore đã được khởi tạo
 */
const connectFirestore = () => {
  try {
    console.log('Kết nối đến Firestore thành công');
    return firestore;
  } catch (error) {
    console.error('Lỗi kết nối đến Firestore:', error);
    throw error;
  }
};

/**
 * Thực hiện truy vấn đến collection trong Firestore
 * @param {string} collectionName - Tên collection
 * @returns {Object} - Đối tượng tham chiếu đến collection
 */
const getCollection = (collectionName) => {
  return firestore.collection(collectionName);
};

module.exports = {
  connect: connectFirestore,
  getCollection,
  db: firestore
}; 