const express = require('express');
const path = require('path');

const app = express();
const PORT = 3300;

// Phục vụ các tệp tĩnh từ thư mục public
app.use(express.static(path.join(__dirname, 'public')));

// Route mặc định
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'firestore-debugger.html'));
});

// Khởi động máy chủ
app.listen(PORT, () => {
  console.log(`Firestore Debugger đang chạy tại http://localhost:${PORT}`);
  console.log(`Mở trình duyệt và truy cập địa chỉ trên để xem dữ liệu Firestore`);
}); 