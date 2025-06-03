require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connect } = require('./config/db');
const routes = require('./routes');

// Khởi tạo Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Kết nối đến Firestore
try {
  connect();
  console.log('Firebase Firestore đã kết nối');
} catch (error) {
  console.error('Không thể kết nối đến Firebase Firestore:', error);
}

// Gắn tất cả routes vào endpoint /api
app.use('/api', routes);

// Route mặc định cho root
app.get('/', (req, res) => {
  res.json({ 
    message: 'Chào mừng đến với API của ứng dụng đặt sân thể thao',
    apiEndpoint: '/api'
  });
});

// Middleware xử lý lỗi 404
app.use((req, res, next) => {
  res.status(404).json({ message: 'Endpoint không tìm thấy' });
});

// Middleware xử lý lỗi
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Lỗi server', 
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

// Khởi động server
app.listen(PORT, () => {
  console.log(`Server đang chạy tại cổng ${PORT}`);
});
