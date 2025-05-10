import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from './firebase.config';

// Khởi tạo Firebase với cấu hình từ file cấu hình riêng
// File cấu hình đã được thêm vào .gitignore để bảo mật
// Khi bạn đẩy mã nguồn lên Git, hãy đảm bảo không đẩy firebase.config.js
const app = initializeApp(firebaseConfig);

// Khởi tạo các dịch vụ
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export { auth, db, storage, googleProvider }; 