// Script đơn giản để kiểm tra kết nối với Firebase Firestore
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, addDoc, serverTimestamp } = require('firebase/firestore');

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
console.log('Đang kết nối với Firebase...');
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Hàm đọc dữ liệu
async function readCourts() {
  try {
    console.log('Đang đọc collection courts...');
    const courtsCol = collection(db, 'courts');
    const courtsSnapshot = await getDocs(courtsCol);

    console.log(`Tìm thấy ${courtsSnapshot.size} sân:`);
    courtsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`- ${doc.id}: ${data.name} (${data.sport})`);
    });
    
    return courtsSnapshot.size;
  } catch (error) {
    console.error('Lỗi khi đọc dữ liệu:', error);
    return 0;
  }
}

// Hàm thêm sân
async function addSampleCourt() {
  try {
    console.log('Đang thêm sân mẫu...');
    
    // Sân mẫu để thêm
    const court = {
      name: `Sân test ${new Date().toTimeString().split(' ')[0]}`,
      address: '123 Test Street, Quận 1, TP.HCM',
      sport: 'football',
      price: 200000,
      facilities: ['Wifi', 'Đèn chiếu sáng'],
      status: 'active',
      ownerId: 'test-user',
      createdAt: serverTimestamp(),
      image: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?q=80&w=800&auto=format&fit=crop'
    };
    
    // Thêm vào Firestore
    const docRef = await addDoc(collection(db, 'courts'), court);
    console.log(`Đã thêm sân mẫu với ID: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    console.error('Lỗi khi thêm sân:', error);
    return null;
  }
}

// Chạy kiểm tra
async function runTest() {
  try {
    // Đọc dữ liệu hiện tại
    const courtCount = await readCourts();
    
    // Thêm sân mẫu
    if (await addSampleCourt()) {
      console.log('Thêm sân thành công!');
      
      // Đọc lại dữ liệu sau khi thêm
      console.log('\nDanh sách sân sau khi thêm:');
      await readCourts();
    } else {
      console.log('Không thể thêm sân mẫu');
    }
  } catch (error) {
    console.error('Lỗi khi chạy kiểm tra:', error);
  } finally {
    console.log('\nĐã hoàn thành kiểm tra.');
    process.exit(0);
  }
}

// Chạy kiểm tra
runTest(); 