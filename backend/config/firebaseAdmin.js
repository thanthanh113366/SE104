const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const config = require('./firebase.config');

// Khởi tạo Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || serviceAccount.project_id + '.appspot.com'
  });
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
  getCollection
}; 