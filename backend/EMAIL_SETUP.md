# Hướng dẫn cài đặt Email Service

## 1. Cài đặt dependencies

```bash
npm install nodemailer
```

## 2. Cấu hình biến môi trường

Thêm các biến môi trường sau vào file `.env`:

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
FRONTEND_URL=http://localhost:3000
```

## 3. Tạo App Password cho Gmail

1. Đăng nhập vào tài khoản Google của bạn
2. Vào [Google Account Settings](https://myaccount.google.com/)
3. Chọn "Security" → "2-Step Verification" (bật nếu chưa có)
4. Sau khi bật 2-Step Verification, chọn "App passwords"
5. Chọn "Mail" và "Other (Custom name)"
6. Nhập tên ứng dụng (ví dụ: "Sports Court Booking")
7. Copy App Password được tạo và dán vào `EMAIL_PASSWORD`

## 4. Cấu hình cho production

Với Gmail, bạn có thể sử dụng miễn phí với giới hạn:
- 500 emails/ngày cho tài khoản thường
- 2000 emails/ngày cho G Suite

Cho production, nên sử dụng:
- **SendGrid**: Miễn phí 100 emails/ngày
- **Mailgun**: Miễn phí 5000 emails/tháng (3 tháng đầu)
- **AWS SES**: Rất rẻ, $0.10 cho 1000 emails

## 5. Test Email Service

API endpoint để test: `GET /api/bookings/test-email`

## 6. Email Templates

Email service hỗ trợ:
- ✅ **Thông báo booking mới** cho chủ sân
- ✅ **Xác nhận booking** cho người thuê
- ✅ **Từ chối booking** cho người thuê

## 7. Error Handling

Email service được thiết kế để không ảnh hưởng đến luồng chính:
- Nếu gửi email thất bại, hệ thống vẫn hoạt động bình thường
- Logs được ghi để debug
- Retry mechanism có thể thêm sau nếu cần

## 8. Customization

Để tùy chỉnh email templates, chỉnh sửa file `services/emailService.js`:
- Thay đổi HTML templates
- Thêm logo, màu sắc
- Thêm các trường thông tin khác 