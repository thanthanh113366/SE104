# Hướng dẫn cấu hình API cho frontend

Để chuyển đổi ứng dụng từ Firebase trực tiếp sang sử dụng backend API, bạn cần tạo file `.env` trong thư mục `frontend` với nội dung sau:

```
# URL API cho backend
REACT_APP_API_URL=http://localhost:5000/api

# Cấu hình sử dụng API thay vì Firebase trực tiếp
REACT_APP_USE_API=true

# Các biến Firebase vẫn cần thiết cho xác thực
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

## Giải thích cấu hình

- **REACT_APP_API_URL**: URL của backend API. Khi phát triển local, sử dụng `http://localhost:5000/api`. Khi triển khai production, thay bằng URL của backend đã triển khai.

- **REACT_APP_USE_API**: Đặt thành `true` để sử dụng backend API thay vì gọi Firebase trực tiếp.

- **Các biến Firebase**: Vẫn cần thiết cho xác thực người dùng.

## Chạy backend

Để sử dụng backend API, bạn cần chạy backend server:

```bash
cd backend
npm install
npm start
```

Backend sẽ chạy ở cổng 5000 theo mặc định.

## Chạy frontend

Sau khi cấu hình file `.env` và chạy backend, bạn có thể chạy frontend:

```bash
cd frontend
npm install
npm start
```

Frontend sẽ sử dụng backend API thay vì Firebase trực tiếp.

## Triển khai

 