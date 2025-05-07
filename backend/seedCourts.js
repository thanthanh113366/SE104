const { db } = require('./config/db');
const { collection, addDoc, getDocs, Timestamp } = require('firebase-admin/firestore');

// Dữ liệu mẫu cho sân thể thao
const SAMPLE_COURTS = [
  {
    name: 'Sân bóng đá Mini Thủ Đức',
    address: '123 Võ Văn Ngân, Thủ Đức, TP.HCM',
    sport: 'football',
    price: 250000,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?q=80&w=800&auto=format&fit=crop',
    facilities: ['Đèn chiếu sáng', 'Phòng thay đồ', 'Wifi'],
    openTime: '06:00',
    closeTime: '22:00',
    description: 'Sân bóng đá cỏ nhân tạo 5 người, có mái che, hệ thống đèn chiếu sáng hiện đại. Thích hợp cho các trận đấu giao hữu hoặc tập luyện.',
    status: 'active',
    ownerId: 'system',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    name: 'Sân cầu lông Tân Bình',
    address: '456 Hoàng Văn Thụ, Tân Bình, TP.HCM',
    sport: 'badminton',
    price: 120000,
    rating: 4.2,
    image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=800&auto=format&fit=crop',
    facilities: ['Phòng thay đồ', 'Nước uống'],
    openTime: '07:00',
    closeTime: '21:00',
    description: 'Sân cầu lông trong nhà với tiêu chuẩn thi đấu, mặt sân chất lượng cao, không bị chói mắt.',
    status: 'active',
    ownerId: 'system',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    name: 'Sân bóng rổ Quận 1',
    address: '789 Nguyễn Huệ, Quận 1, TP.HCM',
    sport: 'basketball',
    price: 180000,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1505666287802-931dc83a0fe4?q=80&w=800&auto=format&fit=crop',
    facilities: ['Đèn chiếu sáng', 'Phòng thay đồ', 'Chỗ đậu xe'],
    openTime: '06:30',
    closeTime: '22:30',
    description: 'Sân bóng rổ ngoài trời, mặt sân chất lượng cao, thích hợp cho đội nhóm và luyện tập cá nhân.',
    status: 'active',
    ownerId: 'system',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
];

// Hàm kiểm tra sân đã tồn tại chưa
const checkExistingCourts = async () => {
  try {
    const courtsRef = collection(db, 'courts');
    const snapshot = await getDocs(courtsRef);
    
    console.log(`Hiện tại có ${snapshot.size} sân trong Firestore.`);
    
    if (snapshot.size > 0) {
      console.log('Danh sách sân hiện có:');
      snapshot.forEach(doc => {
        const data = doc.data();
        console.log(`- ${doc.id}: ${data.name} (${data.sport})`);
      });
    }
    
    return snapshot.size;
  } catch (error) {
    console.error('Lỗi khi kiểm tra sân đã tồn tại:', error);
    return 0;
  }
};

// Thêm dữ liệu mẫu vào Firestore
const seedCourts = async () => {
  try {
    const existingCount = await checkExistingCourts();
    
    if (existingCount > 0) {
      const confirm = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      confirm.question('\nĐã có sân trong database. Bạn vẫn muốn thêm dữ liệu mẫu? (y/n): ', async (answer) => {
        if (answer.toLowerCase() === 'y') {
          await addSampleCourts();
        } else {
          console.log('Hủy thêm dữ liệu mẫu.');
        }
        confirm.close();
        process.exit(0);
      });
    } else {
      await addSampleCourts();
      process.exit(0);
    }
  } catch (error) {
    console.error('Lỗi khi thêm dữ liệu mẫu:', error);
    process.exit(1);
  }
};

// Thêm sân mẫu vào Firestore
const addSampleCourts = async () => {
  console.log('\nBắt đầu thêm dữ liệu mẫu...');
  
  for (const court of SAMPLE_COURTS) {
    try {
      const docRef = await addDoc(collection(db, 'courts'), court);
      console.log(`Đã thêm sân: ${court.name} với ID: ${docRef.id}`);
    } catch (error) {
      console.error(`Lỗi khi thêm sân ${court.name}:`, error);
    }
  }
  
  console.log('\nHoàn tất thêm dữ liệu mẫu!');
  await checkExistingCourts();
};

// Chạy script
seedCourts(); 