# Ứng dụng Đặt Sân Thể Thao

Ứng dụng web giúp đặt và quản lý sân thể thao với 3 vai trò người dùng: Admin, Chủ sân và Người thuê sân.

## Cấu trúc dự án

Dự án được chia thành 2 phần chính:
- **Frontend**: Sử dụng React với Material UI
- **Backend**: Sử dụng Express.js với Firebase Firestore

## Yêu cầu hệ thống

- Node.js (v18.x trở lên)
- npm hoặc yarn
- Tài khoản Firebase và Firestore

## Cài đặt

### 1. Clone dự án

```bash
git clone <repository-url>
cd SE104
```

### 2. Cấu hình Firebase

1. Tạo dự án Firebase mới tại [Firebase Console](https://console.firebase.google.com/)
2. Kích hoạt các dịch vụ Authentication và Firestore
3. Tạo Web App trong Firebase Project và lấy thông tin cấu hình
4. Tạo file service account key:
   - Vào Project Settings > Service accounts > Generate new private key
   - Tải về file JSON và đổi tên thành `serviceAccountKey.json`

5. Tạo các file cấu hình Firebase:

   **Tạo file `frontend/src/firebase.config.js`:**
   ```javascript
   export const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

   **Tạo file `backend/config/firebase.config.js`:**
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };

   module.exports = firebaseConfig;
   ```

   **Đặt file `serviceAccountKey.json` vào thư mục `backend/config/`**

### 3. Cài đặt dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

## Chạy ứng dụng

### Chế độ development

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm start
```

Sau khi khởi động, frontend sẽ chạy tại `http://localhost:3000` và backend sẽ chạy tại `http://localhost:5000`.

### Tạo tài khoản admin

Để tạo tài khoản admin đầu tiên, chạy script sau:

```bash
cd backend
npm run setup-admin
```

Nhập email và mật khẩu khi được nhắc.

## Tính năng chính

### Người dùng

1. **Admin**
   - Quản lý tất cả người dùng
   - Xem thống kê toàn hệ thống
   - Phê duyệt sân thể thao mới

2. **Chủ sân**
   - Thêm/sửa/xóa sân thể thao
   - Quản lý lịch đặt sân
   - Xem thống kê doanh thu

3. **Người thuê sân**
   - Tìm kiếm sân phù hợp
   - Đặt sân theo khung giờ
   - Quản lý lịch đặt cá nhân
   - Đánh giá sân sau khi sử dụng

## Thông tin liên hệ

Nếu bạn có bất kỳ câu hỏi hoặc đề xuất nào, vui lòng liên hệ [email@example.com].

# SE104
Link drive BaoCaoDeTai_SEP.28: https://drive.google.com/drive/u/0/folders/1tdr2ePP3CE-g_i_Sredy3rrfdLBmQTZY

Link Google Sheet SE104.P28_DeTai: https://docs.google.com/spreadsheets/d/1RhBuRweLjN-NTBbcuI_y2r9DXx-ig117/edit?rtpof=true&gid=1830823844#gid=1830823844

Link Report: https://uithcm-my.sharepoint.com/:w:/g/personal/23521319_ms_uit_edu_vn/ERvY2kD0hN5NsvFKNyIL0NABX7wYe2hbCb-IwkaGY5CGnQ?rtime=fcMFwENs3Ug
