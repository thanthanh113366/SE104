const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  getDoc,
  addDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp 
} = require('firebase/firestore');

// Lấy cấu hình từ file
const firebaseConfig = require('./config/firebaseConfig');

// Khởi tạo Firebase
console.log('Cấu hình Firebase:', firebaseConfig);
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Tạo menu CLI để thao tác
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// In menu chính
function showMainMenu() {
  console.log('\n=== FIREBASE TESTER ===');
  console.log('1. Xem tất cả sân');
  console.log('2. Xem chi tiết sân theo ID');
  console.log('3. Thêm sân mẫu');
  console.log('4. Cập nhật sân');
  console.log('5. Xóa sân');
  console.log('0. Thoát');
  
  rl.question('\nChọn chức năng (0-5): ', async (choice) => {
    switch(choice) {
      case '1':
        await getAllCourts();
        break;
      case '2':
        rl.question('Nhập ID sân: ', async (id) => {
          await getCourtById(id);
          showMainMenu();
        });
        return;
      case '3':
        await addSampleCourt();
        break;
      case '4':
        rl.question('Nhập ID sân cần cập nhật: ', async (id) => {
          await updateCourt(id);
          showMainMenu();
        });
        return;
      case '5':
        rl.question('Nhập ID sân cần xóa: ', async (id) => {
          await deleteCourt(id);
          showMainMenu();
        });
        return;
      case '0':
        console.log('Kết thúc chương trình.');
        rl.close();
        process.exit(0);
        return;
      default:
        console.log('Lựa chọn không hợp lệ.');
    }
    
    showMainMenu();
  });
}

// Lấy tất cả sân
async function getAllCourts() {
  try {
    console.log('\n=== DANH SÁCH SÂN ===');
    const courtsRef = collection(db, 'courts');
    const snapshot = await getDocs(courtsRef);
    
    console.log(`Tìm thấy ${snapshot.size} sân:`);
    
    if (snapshot.empty) {
      console.log('Không có sân nào trong database.');
      return;
    }
    
    let i = 1;
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log(`${i++}. ID: ${doc.id} - ${data.name} (${data.sport}) - ${data.address}`);
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách sân:', error);
  }
}

// Lấy thông tin chi tiết sân theo ID
async function getCourtById(id) {
  try {
    console.log(`\n=== THÔNG TIN SÂN ID: ${id} ===`);
    const docRef = doc(db, 'courts', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      console.log('Không tìm thấy sân với ID này!');
      return;
    }
    
    const data = docSnap.data();
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Lỗi khi lấy thông tin sân:', error);
  }
}

// Thêm sân mẫu
async function addSampleCourt() {
  try {
    console.log('\n=== THÊM SÂN MẪU ===');
    
    // Dữ liệu sân mẫu
    const sampleCourt = {
      name: `Sân mẫu ${new Date().toISOString().substr(11, 8)}`,
      address: 'Địa chỉ mẫu, TP.HCM',
      sport: 'football',
      price: 200000,
      rating: 4.0,
      image: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?q=80&w=800&auto=format&fit=crop',
      facilities: ['Đèn chiếu sáng', 'Wifi'],
      openTime: '06:00',
      closeTime: '22:00',
      description: 'Sân mẫu để test',
      status: 'active',
      ownerId: 'test-user',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    console.log('Dữ liệu sân mẫu:', sampleCourt);
    
    // Thêm vào Firestore
    const courtsRef = collection(db, 'courts');
    const docRef = await addDoc(courtsRef, sampleCourt);
    
    console.log(`Đã thêm sân mẫu thành công với ID: ${docRef.id}`);
  } catch (error) {
    console.error('Lỗi khi thêm sân mẫu:', error);
    console.error('Chi tiết lỗi:', error.code, error.message);
  }
}

// Cập nhật sân
async function updateCourt(id) {
  try {
    console.log(`\n=== CẬP NHẬT SÂN ID: ${id} ===`);
    
    // Cập nhật giá và trạng thái
    const courtRef = doc(db, 'courts', id);
    await updateDoc(courtRef, {
      price: 250000,
      updatedAt: serverTimestamp(),
      status: 'active'
    });
    
    console.log(`Đã cập nhật sân ${id} thành công!`);
  } catch (error) {
    console.error('Lỗi khi cập nhật sân:', error);
  }
}

// Xóa sân
async function deleteCourt(id) {
  try {
    console.log(`\n=== XÓA SÂN ID: ${id} ===`);
    
    rl.question(`Bạn có chắc chắn muốn xóa sân có ID: ${id}? (y/n): `, async (answer) => {
      if (answer.toLowerCase() === 'y') {
        const courtRef = doc(db, 'courts', id);
        await deleteDoc(courtRef);
        console.log(`Đã xóa sân ${id} thành công!`);
      } else {
        console.log('Đã hủy thao tác xóa sân.');
      }
      
      showMainMenu();
    });
    return;
  } catch (error) {
    console.error('Lỗi khi xóa sân:', error);
    showMainMenu();
  }
}

// Bắt đầu chương trình
console.log('Đang kết nối tới Firebase...');
showMainMenu(); 