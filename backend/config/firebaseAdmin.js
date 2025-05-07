const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const config = require('./firebaseConfig');

// Khởi tạo ứng dụng Firebase Admin nếu chưa được khởi tạo
function initializeFirebaseAdmin() {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${config.projectId}.firebaseio.com`,
      storageBucket: config.storageBucket
    });
    console.log('Firebase Admin SDK đã được khởi tạo thành công');
  }
  return admin;
}

const firebaseAdmin = initializeFirebaseAdmin();

module.exports = {
  admin: firebaseAdmin,
  firestore: firebaseAdmin.firestore(),
  auth: firebaseAdmin.auth(),
  storage: firebaseAdmin.storage()
}; 