# Sports Facility Booking System / Hệ Thống Đặt Sân Thể Thao

## Project Description / Mô Tả Dự Án
A web application for managing sports facility bookings, allowing users to view available courts, make reservations, and administrators to manage facilities and bookings.

Ứng dụng web quản lý đặt sân thể thao, cho phép người dùng xem các sân có sẵn, đặt chỗ và quản trị viên quản lý cơ sở vật chất và đặt chỗ.

## Features / Tính Năng
- User authentication / Xác thực người dùng
- Court listing and details / Danh sách và chi tiết sân
- Booking management / Quản lý đặt chỗ
- Admin dashboard / Bảng điều khiển quản trị
- Payment integration / Tích hợp thanh toán

## Tech Stack / Công Nghệ Sử Dụng
- Frontend: React.js, Material-UI
- Backend: Node.js, Express.js
- Database: Firebase Firestore
- Authentication: Firebase Authentication

## Security Notice / Lưu Ý Bảo Mật
**IMPORTANT / QUAN TRỌNG**: 
- Never commit files containing API keys, secrets, or sensitive information to Git.
- Không bao giờ commit các file chứa API keys, secrets, hoặc thông tin nhạy cảm lên Git.
- The `firebase.config.js` file is added to `.gitignore` to prevent accidental commits.
- File `firebase.config.js` đã được thêm vào `.gitignore` để ngăn chặn việc vô tình commit.

## Getting Started / Bắt Đầu
1. Clone the repository / Clone kho lưu trữ
2. Install dependencies / Cài đặt các phụ thuộc
3. Set up Firebase configuration files / Thiết lập các file cấu hình Firebase
4. Run the application / Chạy ứng dụng

## Installation / Cài Đặt
```bash
# Install frontend dependencies / Cài đặt phụ thuộc frontend
cd frontend
npm install

# Install backend dependencies / Cài đặt phụ thuộc backend
cd backend
npm install
```

## Firebase Setup / Thiết Lập Firebase
1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Authentication, Firestore, and Storage services
3. Get your Firebase configuration from Project Settings > General
4. For frontend:
   - Copy `frontend/src/firebase.config.example.js` to `frontend/src/firebase.config.js`
   - Update the configuration in `firebase.config.js` with your Firebase details
5. For backend:
   - Generate a service account key from Project Settings > Service accounts
   - Save the key file securely and reference it in your backend setup

## Running the Application / Chạy Ứng Dụng
```bash
# Start frontend / Khởi động frontend
cd frontend
npm start

# Start backend / Khởi động backend
cd backend
npm run dev
```

## Tạo tài khoản Admin

Để tạo tài khoản admin với email "admin@example.com" và mật khẩu "admin123", thực hiện các bước sau:

```bash
# Cài đặt thư viện nếu cần
npm install firebase

# Chạy script tạo admin
npm run setup-admin
```

Sau khi chạy script, bạn có thể đăng nhập vào hệ thống với:
- Email: admin@example.com
- Mật khẩu: admin123

Tài khoản này đã được thiết lập với quyền admin và có thể truy cập vào Admin Dashboard để quản lý hệ thống.

# SE104
Link drive BaoCaoDeTai_SEP.28: https://drive.google.com/drive/u/0/folders/1tdr2ePP3CE-g_i_Sredy3rrfdLBmQTZY

Link Google Sheet SE104.P28_DeTai: https://docs.google.com/spreadsheets/d/1RhBuRweLjN-NTBbcuI_y2r9DXx-ig117/edit?rtpof=true&gid=1830823844#gid=1830823844

Link Report: https://uithcm-my.sharepoint.com/:w:/g/personal/23521319_ms_uit_edu_vn/ERvY2kD0hN5NsvFKNyIL0NABX7wYe2hbCb-IwkaGY5CGnQ?rtime=fcMFwENs3Ug
