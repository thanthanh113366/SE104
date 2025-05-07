const { User, Court, Booking, Review, Payment, Support } = require('../models');

// Demo tình huống đặt sân, thanh toán và đánh giá
async function advancedTest() {
  try {
    console.log('Bắt đầu kịch bản test nâng cao...');

    // 1. Tạo người dùng thuê sân
    console.log('\n--- PHẦN 1: TẠO NGƯỜI DÙNG ---');
    const renterData = {
      email: 'renter@example.com',
      name: 'Người Thuê Sân',
      phone: '0901234567',
      role: 'renter'
    };
    const renter = new User(renterData);
    const renterId = await renter.save();
    console.log(`Đã tạo người thuê sân với ID: ${renterId}`);

    // 2. Tạo chủ sân
    const ownerData = {
      email: 'owner@example.com',
      name: 'Chủ Sân',
      phone: '0909876543',
      role: 'owner'
    };
    const owner = new User(ownerData);
    const ownerId = await owner.save();
    console.log(`Đã tạo chủ sân với ID: ${ownerId}`);

    // 3. Tạo sân thể thao
    console.log('\n--- PHẦN 2: TẠO SÂN THỂ THAO ---');
    const courtData = {
      name: 'Sân Bóng Đá Mini 5v5',
      ownerId: ownerId,
      address: '123 Đường Thể Thao, Quận 1, TP.HCM',
      description: 'Sân bóng đá mini 5v5 với cỏ nhân tạo cao cấp',
      sportType: 'football',
      pricePerHour: 300000,
      facilities: ['parking', 'lighting', 'changing_room', 'shower'],
      images: ['https://example.com/court1.jpg'],
      openTime: '06:00',
      closeTime: '23:00',
      status: 'active'
    };
    const court = new Court(courtData);
    const courtId = await court.save();
    console.log(`Đã tạo sân thể thao với ID: ${courtId}`);

    // 4. Tạo lịch đặt sân
    console.log('\n--- PHẦN 3: TẠO LỊCH ĐẶT SÂN ---');
    const bookingDate = new Date();
    bookingDate.setDate(bookingDate.getDate() + 1); // Đặt cho ngày mai
    const startTime = new Date(bookingDate);
    startTime.setHours(18, 0, 0, 0); // 18:00
    const endTime = new Date(bookingDate);
    endTime.setHours(20, 0, 0, 0); // 20:00

    const bookingData = {
      courtId,
      userId: renterId,
      ownerId,
      startTime,
      endTime,
      totalPrice: 600000, // 2 giờ x 300,000đ
      status: 'pending'
    };
    const booking = new Booking(bookingData);
    const bookingId = await booking.save();
    console.log(`Đã tạo lịch đặt sân với ID: ${bookingId}`);

    // 5. Tạo thanh toán cho đặt sân
    console.log('\n--- PHẦN 4: TẠO THANH TOÁN ---');
    const paymentData = {
      bookingId,
      userId: renterId,
      ownerId,
      courtId,
      amount: 600000,
      method: 'bank_transfer',
      provider: 'vietcombank',
      status: 'pending',
      transactionId: `VCB${Date.now()}`
    };
    const payment = new Payment(paymentData);
    const paymentId = await payment.save();
    console.log(`Đã tạo thanh toán với ID: ${paymentId}`);

    // 6. Xác nhận thanh toán thành công
    console.log('\n--- PHẦN 5: CẬP NHẬT TRẠNG THÁI THANH TOÁN ---');
    await Payment.updateStatus(paymentId, 'completed');
    console.log('Đã cập nhật trạng thái thanh toán thành "completed"');

    // 7. Cập nhật trạng thái đặt sân
    await Booking.updateStatus(bookingId, 'confirmed');
    console.log('Đã cập nhật trạng thái đặt sân thành "confirmed"');

    // 8. Đánh dấu booking đã hoàn thành (giả sử đã sử dụng xong)
    await Booking.updateStatus(bookingId, 'completed');
    console.log('Đã cập nhật trạng thái đặt sân thành "completed"');

    // 9. Thêm đánh giá sau khi sử dụng sân
    console.log('\n--- PHẦN 6: THÊM ĐÁNH GIÁ ---');
    const reviewData = {
      courtId,
      userId: renterId,
      bookingId,
      rating: 4,
      comment: 'Sân rất tốt, dịch vụ chu đáo, chỉ có điều giá hơi cao',
      images: []
    };
    const review = new Review(reviewData);
    const reviewId = await review.save();
    console.log(`Đã thêm đánh giá với ID: ${reviewId}`);

    // 10. Chủ sân trả lời đánh giá
    await Review.addReply(reviewId, 'Cảm ơn bạn đã đánh giá. Chúng tôi sẽ xem xét điều chỉnh giá cho phù hợp hơn.');
    console.log('Chủ sân đã trả lời đánh giá');

    // 11. Người dùng tạo yêu cầu hỗ trợ
    console.log('\n--- PHẦN 7: TẠO YÊU CẦU HỖ TRỢ ---');
    const supportData = {
      userId: renterId,
      ownerId,
      courtId,
      bookingId,
      subject: 'Cần hoàn tiền một phần',
      category: 'payment',
      priority: 'high'
    };
    const support = new Support(supportData);
    const supportId = await support.save();
    console.log(`Đã tạo yêu cầu hỗ trợ với ID: ${supportId}`);

    // 12. Thêm tin nhắn cho yêu cầu hỗ trợ
    await Support.addMessage(supportId, {
      senderId: renterId,
      senderRole: 'user',
      content: 'Tôi vào sân trễ 30 phút vì tắc đường nên muốn được hoàn lại một phần tiền.'
    });
    console.log('Người dùng đã gửi tin nhắn hỗ trợ');

    // 13. Chủ sân trả lời
    await Support.addMessage(supportId, {
      senderId: ownerId,
      senderRole: 'owner',
      content: 'Chúng tôi sẽ xem xét hoàn lại 20% tiền thuê sân trong giờ đầu tiên. Bạn vui lòng đợi xử lý trong 24h.'
    });
    console.log('Chủ sân đã trả lời yêu cầu hỗ trợ');

    // 14. Cập nhật trạng thái yêu cầu hỗ trợ
    await Support.updateStatus(supportId, 'in_progress');
    console.log('Đã cập nhật trạng thái yêu cầu hỗ trợ thành "in_progress"');

    // 15. Thực hiện hoàn tiền một phần
    console.log('\n--- PHẦN 8: XỬ LÝ HOÀN TIỀN ---');
    const refundAmount = 60000; // 20% của giờ đầu (300,000đ)
    await Payment.processRefund(paymentId, refundAmount, 'Hoàn tiền do khách hàng vào sân trễ 30 phút');
    console.log(`Đã hoàn tiền ${refundAmount}đ cho khách hàng`);

    // 16. Đánh dấu yêu cầu hỗ trợ đã giải quyết
    await Support.updateStatus(supportId, 'resolved');
    console.log('Đã đánh dấu yêu cầu hỗ trợ đã được giải quyết');

    // 17. Lấy thống kê đánh giá của sân
    console.log('\n--- PHẦN 9: LẤY THỐNG KÊ ---');
    const ratingStats = await Review.getCourtRatingStats(courtId);
    console.log('Thống kê đánh giá sân:', ratingStats);

    console.log('\nHoàn thành kịch bản test nâng cao!');

    // Hiển thị thông tin chi tiết của các đối tượng
    console.log('\n--- KẾT QUẢ CHI TIẾT ---');
    console.log('Mã đặt sân:', bookingId);
    console.log('Mã thanh toán:', paymentId);
    console.log('Mã đánh giá:', reviewId);
    console.log('Mã yêu cầu hỗ trợ:', supportId);
  } catch (error) {
    console.error('Lỗi khi thực hiện test nâng cao:', error);
  }
}

// Chạy test nâng cao
advancedTest(); 