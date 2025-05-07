// File debug Firebase cho frontend
import { db } from './firebase';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';

// Thêm sân mẫu vào Firestore
export const addSampleCourt = async () => {
  try {
    console.log('Bắt đầu thêm sân mẫu...');
    
    // Dữ liệu sân mẫu
    const sampleCourt = {
      name: `Sân mẫu FE ${new Date().toISOString().substr(11, 8)}`,
      address: 'Địa chỉ mẫu từ Frontend, TP.HCM',
      sport: 'football',
      price: 200000,
      rating: 4.0,
      image: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?q=80&w=800&auto=format&fit=crop',
      facilities: ['Đèn chiếu sáng', 'Wifi'],
      openTime: '06:00',
      closeTime: '22:00',
      description: 'Sân mẫu để test từ frontend',
      status: 'active',
      ownerId: 'frontend-test',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    console.log('Dữ liệu sân mẫu:', sampleCourt);
    
    // Thêm vào Firestore
    const courtsRef = collection(db, 'courts');
    const docRef = await addDoc(courtsRef, sampleCourt);
    
    console.log(`Đã thêm sân mẫu thành công với ID: ${docRef.id}`);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Lỗi khi thêm sân mẫu:', error);
    console.error('Chi tiết lỗi:', error.code, error.message);
    return { success: false, error };
  }
};

// Lấy tất cả sân
export const getAllCourts = async () => {
  try {
    console.log('Đang lấy tất cả sân...');
    const courtsRef = collection(db, 'courts');
    const snapshot = await getDocs(courtsRef);
    
    console.log(`Tìm thấy ${snapshot.size} sân`);
    
    const courts = [];
    snapshot.forEach(doc => {
      courts.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return courts;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách sân:', error);
    return [];
  }
};

// Export các hàm debug
const firebaseDebug = {
  addSampleCourt,
  getAllCourts
};

export default firebaseDebug; 