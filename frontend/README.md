# Sports Facilities Booking - Frontend

Hệ thống quản lý đặt sân thể thao trực tuyến - Phần frontend xây dựng bằng React.

## Cài đặt

```bash
# Clone repository
git clone <repository-url>

# Di chuyển vào thư mục frontend
cd frontend

# Cài đặt dependencies
npm install
```

## Cấu hình Firebase

Trước khi chạy dự án, bạn cần phải cấu hình Firebase:

1. Sao chép file `src/firebase.config.example.js` thành `src/firebase.config.js`
2. Điền thông tin Firebase của bạn vào các trường trong file `firebase.config.js`

**Lưu ý**: File `firebase.config.js` đã được thêm vào `.gitignore` để bảo mật thông tin API keys.

## Khởi chạy ứng dụng

```bash
# Khởi chạy ứng dụng ở chế độ development
npm start
```

Ứng dụng sẽ chạy tại [http://localhost:3000](http://localhost:3000).

## Cấu trúc thư mục

```
src/
├── components/     # Các thành phần UI
├── contexts/       # React Context cho quản lý state
├── services/       # Services giao tiếp với backend/Firebase
├── utils/          # Các tiện ích
├── App.js          # Component gốc
├── firebase.js     # Cấu hình Firebase
└── index.js        # Điểm khởi đầu ứng dụng
```

## Xây dựng cho production

```bash
# Tạo bản build production
npm run build
```

Build được tạo ra trong thư mục `build` có thể triển khai trên các dịch vụ hosting.
