import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Cấu hình Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDUpwKOocg3VOZlyMO2_nfymoNcUjx0YuA",
  authDomain: "se104-85ce1.firebaseapp.com",
  projectId: "se104-85ce1",
  storageBucket: "se104-85ce1.appspot.com",
  messagingSenderId: "733364175434",
  appId: "1:733364175434:web:feaab1162c001516939cb3",
  measurementId: "G-9LCPER6VFE"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// Khởi tạo các dịch vụ
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider }; 