import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Cấu hình Firebase sử dụng biến môi trường
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyDUpwKOocg3VOZlyMO2_nfymoNcUjx0YuA",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "se104-85ce1.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "se104-85ce1",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "se104-85ce1.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "733364175434",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:733364175434:web:feaab1162c001516939cb3",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-9LCPER6VFE"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// Khởi tạo các dịch vụ
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider }; 