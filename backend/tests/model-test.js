const { User, Court, Review, Payment, Support } = require('../models');

// Test các model
async function testModels() {
  try {
    console.log('Bắt đầu kiểm tra các model...');

    // Test tạo User mới
    console.log('\n--- TEST USER MODEL ---');
    const userData = {
      email: 'test@example.com',
      name: 'Người Dùng Test',
      phone: '0123456789',
      role: 'renter'
    };
    const user = new User(userData);
    const userId = await user.save();
    console.log(`Tạo người dùng thành công với ID: ${userId}`);

    // Tìm user theo ID
    const foundUser = await User.findById(userId);
    console.log('Tìm thấy người dùng:', foundUser);

    // Test tạo Court mới
    console.log('\n--- TEST COURT MODEL ---');
    const courtData = {
      name: 'Sân bóng đá Test',
      ownerId: userId,
      address: '123 Đường Test, Quận 1, TP.HCM',
      description: 'Sân bóng đá 5v5 chất lượng cao',
      sportType: 'football',
      pricePerHour: 200000,
    };
    const court = new Court(courtData);
    const courtId = await court.save();
    console.log(`Tạo sân thể thao thành công với ID: ${courtId}`);

    // Test tạo Review mới
    console.log('\n--- TEST REVIEW MODEL ---');
    const reviewData = {
      courtId: courtId,
      userId: userId,
      rating: 5,
      comment: 'Sân rất tốt, dịch vụ chuyên nghiệp'
    };
    const review = new Review(reviewData);
    const reviewId = await review.save();
    console.log(`Tạo đánh giá thành công với ID: ${reviewId}`);

    // Test tạo Payment mới
    console.log('\n--- TEST PAYMENT MODEL ---');
    const paymentData = {
      userId: userId,
      courtId: courtId,
      amount: 400000,
      method: 'bank_transfer',
      status: 'completed'
    };
    const payment = new Payment(paymentData);
    const paymentId = await payment.save();
    console.log(`Tạo thanh toán thành công với ID: ${paymentId}`);

    // Test tạo Support mới
    console.log('\n--- TEST SUPPORT MODEL ---');
    const supportData = {
      userId: userId,
      subject: 'Câu hỏi về đặt sân',
      category: 'booking',
      priority: 'normal'
    };
    const support = new Support(supportData);
    const supportId = await support.save();
    console.log(`Tạo yêu cầu hỗ trợ thành công với ID: ${supportId}`);

    // Thêm tin nhắn vào yêu cầu hỗ trợ
    const messageId = await Support.addMessage(supportId, {
      senderId: userId,
      senderRole: 'user',
      content: 'Tôi gặp vấn đề khi đặt sân vào cuối tuần này.'
    });
    console.log(`Thêm tin nhắn hỗ trợ thành công với ID: ${messageId}`);

    // Lấy thống kê đánh giá cho sân
    const ratingStats = await Review.getCourtRatingStats(courtId);
    console.log('Thống kê đánh giá sân:', ratingStats);

    console.log('\nHoàn thành kiểm tra các model!');
  } catch (error) {
    console.error('Lỗi khi kiểm tra model:', error);
  }
}

// Chạy test
testModels(); 