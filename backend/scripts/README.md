# Scripts Documentation

## clearCollections.js

Script để xóa dữ liệu từ các collections trong Firebase Firestore.

### Chức năng
Script này sẽ xóa **TẤT CẢ** documents trong các collections sau:
- `bookings` - Dữ liệu đặt sân
- `payments` - Dữ liệu thanh toán  
- `reviews` - Dữ liệu đánh giá

### Yêu cầu trước khi chạy
1. **File cấu hình Firebase**: Đảm bảo file `.env` có đầy đủ thông tin Firebase Admin SDK
2. **Kết nối mạng**: Đảm bảo có kết nối internet để truy cập Firebase
3. **Quyền truy cập**: Service account phải có quyền đọc/ghi Firestore
4. **Biến môi trường**: Các biến Firebase cần thiết trong file `.env`:
   - `FIREBASE_SERVICE_ACCOUNT_TYPE`
   - `FIREBASE_SERVICE_ACCOUNT_PROJECT_ID`
   - `FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY_ID`
   - `FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY`
   - `FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL`
   - `FIREBASE_SERVICE_ACCOUNT_CLIENT_ID`

### Cách chạy

#### Cách 1: Sử dụng npm script (Khuyến nghị)
```bash
cd backend
npm run clear-collections
```

#### Cách 2: Chạy trực tiếp-
```bash
cd backend
node scripts/clearCollections.js
```

### Quy trình thực hiện
1. **Kiểm tra kết nối**: Script sẽ test kết nối Firebase trước
2. **Hiển thị thống kê**: Đếm số documents hiện tại trong mỗi collection
3. **Xác nhận**: Yêu cầu người dùng gõ "YES" để xác nhận
4. **Xóa dữ liệu**: Xóa từng collection một cách tuần tự
5. **Báo cáo kết quả**: Thông báo số documents đã xóa

### Ví dụ output
```
🔍 Kiểm tra kết nối Firebase...
✅ Kết nối Firebase thành công!

📊 THỐNG KÊ DỮ LIỆU HIỆN TẠI:

   bookings: 15 documents
   payments: 12 documents
   reviews: 8 documents

🔥 SCRIPT XÓA DỮ LIỆU FIREBASE FIRESTORE 🔥

⚠️  CẢNH BÁO: Script này sẽ xóa TẤT CẢ dữ liệu trong các collections sau:
   - bookings
   - payments
   - reviews

🚫 Hành động này KHÔNG THỂ HOÀN TÁC!

❓ Bạn có chắc chắn muốn tiếp tục? (gõ "YES" để xác nhận): YES

✅ Xác nhận thành công. Bắt đầu xóa dữ liệu...

🚀 Bắt đầu xóa các collections...

🔄 Đang xóa collection: bookings...
📊 Tìm thấy 15 documents trong bookings
✅ Đã xóa hoàn tất collection: bookings (15 documents)

🔄 Đang xóa collection: payments...
📊 Tìm thấy 12 documents trong payments
✅ Đã xóa hoàn tất collection: payments (12 documents)

🔄 Đang xóa collection: reviews...
📊 Tìm thấy 8 documents trong reviews
✅ Đã xóa hoàn tất collection: reviews (8 documents)

🎉 Hoàn thành! Tất cả collections đã được xóa.
```

### Tính năng an toàn
- ✅ **Xác nhận bắt buộc**: Phải gõ "YES" để tiếp tục
- ✅ **Kiểm tra kết nối**: Test Firebase trước khi thực hiện
- ✅ **Batch operations**: Xóa theo batch để tránh timeout
- ✅ **Error handling**: Xử lý lỗi và dừng khi có vấn đề
- ✅ **Logging chi tiết**: Theo dõi tiến trình từng bước

### Lưu ý quan trọng
⚠️ **CẢNH BÁO**: 
- Hành động xóa **KHÔNG THỂ HOÀN TÁC**
- Đảm bảo đã backup dữ liệu nếu cần thiết
- Chỉ chạy script này trên môi trường development/testing
- **KHÔNG** chạy trên production environment

### Troubleshooting

#### Lỗi: "Lỗi tải cấu hình Firebase"
- Đảm bảo file `.env` có trong thư mục `backend/`
- Kiểm tra các biến môi trường Firebase trong file `.env`
- Đảm bảo `serviceAccountKey.js` có trong `backend/config/`

#### Lỗi: "Permission denied"
- Kiểm tra quyền của service account
- Đảm bảo có quyền đọc/ghi Firestore
- Kiểm tra format của `FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY`

#### Lỗi: "Network error"
- Kiểm tra kết nối internet
- Kiểm tra firewall settings

#### Lỗi: "Thiếu thông tin xác thực Firebase Admin SDK"
- Kiểm tra tất cả biến môi trường Firebase trong file `.env`
- Đảm bảo `FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY` có format đúng (bao gồm `\n`)

### Mở rộng
Để thêm/bớt collections khác, chỉnh sửa array `COLLECTIONS_TO_CLEAR` trong file script:

```javascript
const COLLECTIONS_TO_CLEAR = ['bookings', 'payments', 'reviews', 'new_collection'];
``` 