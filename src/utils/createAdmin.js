import { 
  createUserWithEmailAndPassword, 
  updateProfile
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Cấu hình Firebase (được lấy từ file firebase.js)
const firebaseConfig = {
  apiKey: "AIzaSyDUpwKOocg3VOZlyMO2_nfymoNcUjx0YuA",
  authDomain: "se104-85ce1.firebaseapp.com",
  projectId: "se104-85ce1",
  storageBucket: "se104-85ce1.firebasestorage.app",
  messagingSenderId: "733364175434",
  appId: "1:733364175434:web:feaab1162c001516939cb3",
  measurementId: "G-9LCPER6VFE"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// Khởi tạo các dịch vụ
const auth = getAuth(app);
const db = getFirestore(app);

// Hàm tạo tài khoản admin
const createAdmin = async () => {
  try {
    const email = 'admin@example.com';
    const password = 'admin123';
    const displayName = 'Admin';
    
    // Tạo tài khoản mới
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Cập nhật display name
    await updateProfile(user, { displayName });
    
    // Lưu thông tin vào Firestore với role là 'admin'
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: displayName,
      createdAt: new Date().toISOString(),
      role: 'admin',
      photoURL: null
    });
    
    console.log('Tài khoản admin đã được tạo thành công!');
    return user;
  } catch (error) {
    // Xử lý lỗi nếu tài khoản đã tồn tại
    if (error.code === 'auth/email-already-in-use') {
      console.error("Tài khoản email này đã tồn tại. Vui lòng sử dụng email khác.");
    } else {
      console.error("Lỗi khi tạo tài khoản admin:", error);
    }
    throw error;
  }
};

// Thực thi hàm
createAdmin()
  .then(user => {
    console.log('Admin UID:', user.uid);
    console.log('Email: admin@example.com');
    console.log('Mật khẩu: admin123');
    // Đóng kết nối Firebase sau khi xong
    setTimeout(() => process.exit(0), 3000);
  })
  .catch(error => {
    console.error('Lỗi:', error.message);
    process.exit(1);
  });

export default createAdmin; 