# Sports Court Booking Backend

Backend API cho ứng dụng đặt sân thể thao.

## Cài đặt

```bash
npm install
```

## Chạy server

```bash
npm start
```

## Tài khoản chủ sân

Ứng dụng sử dụng 2 tài khoản chủ sân chính:

- Thanh Thanh 1: thanthanh1369@gmail.com (13 sân)
- Thanh Thanh 2: thanthanh13699@gmail.com (12 sân)

## Cấu hình Firebase

1. **Cài đặt**
   ```bash
   npm install
   ```

2. **Cấu hình Firebase**
   - Tạo file `serviceAccountKey.json` trong thư mục `backend/config/` dựa trên file mẫu `serviceAccountKey.example.json`
   - Thay thế các thông tin bằng thông tin từ Firebase service account của bạn:
     - Truy cập Firebase Console -> Project Settings -> Service Accounts
     - Chọn "Generate new private key"
     - Tải file JSON và đổi tên thành `serviceAccountKey.json`
     - Đặt file này vào thư mục `backend/config/`

3. **Chạy backend**
   ```bash
   npm run dev
   ```

## API Routes

- **Authentication**: `/api/auth`
- **Courts**: `/api/courts`
- **Bookings**: `/api/bookings`
- **Payments**: `/api/payments`
- **Reviews**: `/api/reviews`
- **Support**: `/api/support`

## Lưu ý bảo mật

- Không commit file `serviceAccountKey.json` lên Git
- File này đã được thêm vào `.gitignore`