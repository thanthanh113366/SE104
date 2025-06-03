/**
 * Script để cập nhật loại sân trong Firestore
 * Chạy script này một lần để fix dữ liệu
 */

const admin = require('firebase-admin');
const serviceAccount = require('../config/serviceAccountKey');

// Khởi tạo Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  });
}

const db = admin.firestore();

// Map tên sân với loại sân dựa trên tên
const mapCourtNameToType = (name) => {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('bóng đá') || lowerName.includes('football')) {
    return 'football';
  } else if (lowerName.includes('cầu lông') || lowerName.includes('badminton')) {
    return 'badminton';
  } else if (lowerName.includes('bóng rổ') || lowerName.includes('basketball')) {
    return 'basketball';
  } else if (lowerName.includes('tennis')) {
    return 'tennis';
  } else if (lowerName.includes('bóng chuyền') || lowerName.includes('volleyball')) {
    return 'volleyball';
  } else if (lowerName.includes('bida') || lowerName.includes('billiards')) {
    return 'billiards';
  } else {
    // Mặc định là bóng đá nếu không xác định được
    return 'football';
  }
};

const updateCourtTypes = async () => {
  try {
    console.log('🚀 Bắt đầu cập nhật loại sân...');
    
    // Lấy tất cả sân
    const courtsRef = db.collection('courts');
    const snapshot = await courtsRef.get();
    
    console.log(`📊 Tìm thấy ${snapshot.size} sân cần cập nhật`);
    
    const batch = db.batch();
    let updateCount = 0;
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      const courtName = data.name || '';
      const currentType = data.type || '';
      
      // Xác định loại sân từ tên
      const newType = mapCourtNameToType(courtName);
      
      console.log(`📝 Sân: "${courtName}"`);
      console.log(`   - Type hiện tại: "${currentType}"`);
      console.log(`   - Type mới: "${newType}"`);
      
      // Cập nhật nếu cần
      if (currentType !== newType) {
        const courtRef = courtsRef.doc(doc.id);
        batch.update(courtRef, {
          type: newType,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        updateCount++;
        console.log(`   ✅ Sẽ cập nhật type thành "${newType}"`);
      } else {
        console.log(`   ⏭️  Không cần cập nhật`);
      }
      
      console.log('---');
    });
    
    // Thực hiện batch update
    if (updateCount > 0) {
      await batch.commit();
      console.log(`🎉 Đã cập nhật thành công ${updateCount} sân!`);
    } else {
      console.log('ℹ️  Không có sân nào cần cập nhật');
    }
    
    console.log('✨ Hoàn thành cập nhật loại sân');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Lỗi khi cập nhật loại sân:', error);
    process.exit(1);
  }
};

// Chạy script
updateCourtTypes(); 