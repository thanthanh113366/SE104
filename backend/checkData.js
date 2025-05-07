const { db } = require('./config/db');

const main = async () => {
  try {
    // Kiểm tra collection courts
    const courtsSnapshot = await db.collection('courts').get();
    console.log('Số lượng sân:', courtsSnapshot.size);
    
    if (courtsSnapshot.size > 0) {
      console.log('\nDanh sách sân:');
      courtsSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`- ${doc.id}: ${data.name} (${data.type})`);
      });
    } else {
      console.log('Không có sân nào trong database');
    }
    
    // Kiểm tra collection bookings
    const bookingsSnapshot = await db.collection('bookings').get();
    console.log('\nSố lượng bookings:', bookingsSnapshot.size);
    
    if (bookingsSnapshot.size > 0) {
      console.log('\nDanh sách bookings:');
      bookingsSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`- ${doc.id}: Court: ${data.courtId}, Date: ${data.date}, Status: ${data.status}`);
      });
    } else {
      console.log('Không có booking nào trong database');
    }
    
    // Kiểm tra collection users
    const usersSnapshot = await db.collection('users').get();
    console.log('\nSố lượng users:', usersSnapshot.size);
    
    if (usersSnapshot.size > 0) {
      console.log('\nDanh sách users:');
      usersSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`- ${doc.id}: ${data.displayName} (${data.role || 'No role'})`);
      });
    } else {
      console.log('Không có user nào trong database');
    }
    
  } catch (error) {
    console.error('Lỗi khi kiểm tra dữ liệu:', error);
  }
};

main(); 