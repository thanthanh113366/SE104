const readline = require('readline');

// Import Firebase config từ cấu hình hiện có của dự án
let db;
try {
  const config = require('../config/db');
  db = config.db;
  console.log('✅ Đã tải cấu hình Firebase thành công');
} catch (error) {
  console.error('❌ Lỗi tải cấu hình Firebase:', error.message);
  console.log('📝 Hướng dẫn: Đảm bảo file .env có đầy đủ thông tin Firebase Admin SDK');
  process.exit(1);
}

// Các collection cần xóa
const COLLECTIONS_TO_CLEAR = ['bookings', 'payments', 'reviews'];

/**
 * Xóa tất cả documents trong một collection
 * @param {string} collectionName - Tên collection
 */
async function clearCollection(collectionName) {
  try {
    console.log(`🔄 Đang xóa collection: ${collectionName}...`);
    
    const collectionRef = db.collection(collectionName);
    const snapshot = await collectionRef.get();
    
    if (snapshot.empty) {
      console.log(`✅ Collection ${collectionName} đã trống`);
      return;
    }
    
    console.log(`📊 Tìm thấy ${snapshot.size} documents trong ${collectionName}`);
    
    // Xóa theo batch (tối đa 500 documents mỗi batch)
    const batch = db.batch();
    let count = 0;
    
    for (const doc of snapshot.docs) {
      batch.delete(doc.ref);
      count++;
      
      // Nếu đạt giới hạn batch, commit và tạo batch mới
      if (count === 500) {
        await batch.commit();
        console.log(`  ➤ Đã xóa ${count} documents...`);
        count = 0;
      }
    }
    
    // Commit batch cuối cùng nếu còn documents
    if (count > 0) {
      await batch.commit();
    }
    
    console.log(`✅ Đã xóa hoàn tất collection: ${collectionName} (${snapshot.size} documents)`);
    
  } catch (error) {
    console.error(`❌ Lỗi khi xóa collection ${collectionName}:`, error.message);
    throw error;
  }
}

/**
 * Xóa tất cả collections được chỉ định
 */
async function clearAllCollections() {
  try {
    console.log('🚀 Bắt đầu xóa các collections...\n');
    
    for (const collectionName of COLLECTIONS_TO_CLEAR) {
      await clearCollection(collectionName);
      console.log(''); // Dòng trống để dễ đọc
    }
    
    console.log('🎉 Hoàn thành! Tất cả collections đã được xóa.');
    
  } catch (error) {
    console.error('❌ Có lỗi xảy ra:', error.message);
    process.exit(1);
  }
}

/**
 * Hiển thị thông tin và yêu cầu xác nhận
 */
async function confirmAndExecute() {
  console.log('🔥 SCRIPT XÓA DỮ LIỆU FIREBASE FIRESTORE 🔥\n');
  console.log('⚠️  CẢNH BÁO: Script này sẽ xóa TẤT CẢ dữ liệu trong các collections sau:');
  COLLECTIONS_TO_CLEAR.forEach(collection => {
    console.log(`   - ${collection}`);
  });
  console.log('\n🚫 Hành động này KHÔNG THỂ HOÀN TÁC!\n');
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question('❓ Bạn có chắc chắn muốn tiếp tục? (gõ "YES" để xác nhận): ', (answer) => {
      rl.close();
      
      if (answer.trim().toUpperCase() === 'YES') {
        console.log('\n✅ Xác nhận thành công. Bắt đầu xóa dữ liệu...\n');
        resolve(true);
      } else {
        console.log('\n❌ Đã hủy. Không có dữ liệu nào bị xóa.');
        resolve(false);
      }
    });
  });
}

/**
 * Kiểm tra kết nối Firebase trước khi thực hiện
 */
async function checkFirebaseConnection() {
  try {
    console.log('🔍 Kiểm tra kết nối Firebase...');
    
    // Test bằng cách đọc một collection
    const testRef = db.collection('bookings').limit(1);
    await testRef.get();
    
    console.log('✅ Kết nối Firebase thành công!\n');
    return true;
  } catch (error) {
    console.error('❌ Không thể kết nối với Firebase:', error.message);
    console.log('📝 Kiểm tra lại cấu hình Firebase và kết nối mạng.');
    return false;
  }
}

/**
 * Hiển thị thống kê trước khi xóa
 */
async function showStatistics() {
  try {
    console.log('📊 THỐNG KÊ DỮ LIỆU HIỆN TẠI:\n');
    
    for (const collectionName of COLLECTIONS_TO_CLEAR) {
      try {
        const snapshot = await db.collection(collectionName).get();
        console.log(`   ${collectionName}: ${snapshot.size} documents`);
      } catch (error) {
        console.log(`   ${collectionName}: Không thể đếm (${error.message})`);
      }
    }
    
    console.log('');
  } catch (error) {
    console.log('⚠️  Không thể lấy thống kê:', error.message);
  }
}

/**
 * Main function
 */
async function main() {
  try {
    // Kiểm tra kết nối
    const connected = await checkFirebaseConnection();
    if (!connected) {
      process.exit(1);
    }
    
    // Hiển thị thống kê
    await showStatistics();
    
    // Xác nhận và thực hiện
    const confirmed = await confirmAndExecute();
    if (confirmed) {
      await clearAllCollections();
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Lỗi không mong đợi:', error);
    process.exit(1);
  }
}

// Chạy script
if (require.main === module) {
  main();
}

module.exports = {
  clearCollection,
  clearAllCollections
}; 