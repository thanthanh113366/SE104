const nodemailer = require('nodemailer');
require('dotenv').config();

/**
 * Email Service - Xử lý gửi email thông báo
 */
class EmailService {
  constructor() {
    // Cấu hình transporter cho Gmail
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Email gửi
        pass: process.env.EMAIL_PASSWORD // App password của Gmail
      }
    });
  }

  /**
   * Gửi email thông báo booking mới cho chủ sân
   * @param {Object} booking - Thông tin booking
   * @param {Object} court - Thông tin sân
   * @param {Object} owner - Thông tin chủ sân
   * @param {Object} renter - Thông tin người thuê
   */
  async sendNewBookingNotificationToOwner(booking, court, owner, renter) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: owner.email,
        subject: `🏟️ Có đặt sân mới tại ${court.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2e7d32;">🏟️ Đặt Sân Thể Thao</h1>
            <h2>Thông báo đặt sân mới</h2>
            <p>Xin chào <strong>${owner.displayName || owner.email}</strong>,</p>
            <p>Bạn có một yêu cầu đặt sân mới cần xác nhận:</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
              <h3>Thông tin đặt sân</h3>
              <p><strong>Sân:</strong> ${court.name}</p>
              <p><strong>Người đặt:</strong> ${renter.displayName || renter.email}</p>
              <p><strong>Email:</strong> ${renter.email}</p>
              <p><strong>Số điện thoại:</strong> ${booking.userPhone || 'Chưa cung cấp'}</p>
              <p><strong>Ngày đặt:</strong> ${new Date(booking.date).toLocaleDateString('vi-VN')}</p>
              <p><strong>Thời gian:</strong> ${booking.startTime} - ${booking.endTime}</p>
              <p><strong>Tổng tiền:</strong> ${booking.totalPrice.toLocaleString('vi-VN')} VNĐ</p>
              ${booking.notes ? `<p><strong>Ghi chú:</strong> ${booking.notes}</p>` : ''}
            </div>
            
            <p>Vui lòng vào hệ thống để xác nhận hoặc từ chối yêu cầu đặt sân này.</p>
            <a href="${process.env.FRONTEND_URL}/owner" style="background-color: #2e7d32; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Vào hệ thống quản lý
            </a>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email gửi thành công cho chủ sân:', result.messageId);
      return result;
    } catch (error) {
      console.error('Lỗi gửi email cho chủ sân:', error);
      throw error;
    }
  }

  /**
   * Gửi email xác nhận booking cho người thuê sân
   * @param {Object} booking - Thông tin booking
   * @param {Object} court - Thông tin sân
   * @param {Object} owner - Thông tin chủ sân
   * @param {Object} renter - Thông tin người thuê
   */
  async sendBookingConfirmationToRenter(booking, court, owner, renter) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: renter.email,
        subject: `✅ Đặt sân ${court.name} đã được xác nhận`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2e7d32;">🏟️ Đặt Sân Thể Thao</h1>
            <h2 style="color: #2e7d32;">✅ Đặt sân thành công!</h2>
            <p>Xin chào <strong>${renter.displayName || renter.email}</strong>,</p>
            <p>Yêu cầu đặt sân của bạn đã được <strong style="color: #2e7d32;">XÁC NHẬN</strong>.</p>
            
            <div style="background-color: #e8f5e8; padding: 15px; border-radius: 5px;">
              <h3>Thông tin đặt sân</h3>
              <p><strong>Mã đặt sân:</strong> ${booking.id}</p>
              <p><strong>Sân:</strong> ${court.name}</p>
              <p><strong>Địa chỉ:</strong> ${court.address?.street || ''}, ${court.address?.ward || ''}</p>
              <p><strong>Ngày đặt:</strong> ${new Date(booking.date).toLocaleDateString('vi-VN')}</p>
              <p><strong>Thời gian:</strong> ${booking.startTime} - ${booking.endTime}</p>
              <p><strong>Tổng tiền:</strong> ${booking.totalPrice.toLocaleString('vi-VN')} VNĐ</p>
              <p><strong>Trạng thái thanh toán:</strong> ${booking.paymentStatus === 'paid' ? '✅ Đã thanh toán' : '⏳ Chưa thanh toán'}</p>
            </div>
            
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin-top: 15px;">
              <h4>Thông tin liên hệ chủ sân</h4>
              <p><strong>Tên:</strong> ${owner.displayName || 'Chưa cung cấp'}</p>
              <p><strong>Email:</strong> ${owner.email}</p>
              <p><strong>Số điện thoại:</strong> ${owner.phoneNumber || 'Chưa cung cấp'}</p>
            </div>
            
            <p>Vui lòng đến đúng giờ và mang theo thông tin đặt sân này.</p>
            <a href="${process.env.FRONTEND_URL}/renter" style="background-color: #2e7d32; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Xem đặt sân của tôi
            </a>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email gửi thành công cho người thuê:', result.messageId);
      return result;
    } catch (error) {
      console.error('Lỗi gửi email cho người thuê:', error);
      throw error;
    }
  }

  /**
   * Gửi email thông báo booking bị từ chối cho người thuê sân
   * @param {Object} booking - Thông tin booking
   * @param {Object} court - Thông tin sân
   * @param {Object} renter - Thông tin người thuê
   * @param {string} reason - Lý do từ chối
   */
  async sendBookingRejectionToRenter(booking, court, renter, reason = '') {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: renter.email,
        subject: `❌ Yêu cầu đặt sân ${court.name} bị từ chối`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2e7d32;">🏟️ Đặt Sân Thể Thao</h1>
            <h2 style="color: #d32f2f;">❌ Yêu cầu đặt sân bị từ chối</h2>
            <p>Xin chào <strong>${renter.displayName || renter.email}</strong>,</p>
            <p>Rất tiếc, yêu cầu đặt sân của bạn đã bị từ chối.</p>
            
            <div style="background-color: #ffebee; padding: 15px; border-radius: 5px;">
              <h3>Thông tin đặt sân</h3>
              <p><strong>Sân:</strong> ${court.name}</p>
              <p><strong>Ngày đặt:</strong> ${new Date(booking.date).toLocaleDateString('vi-VN')}</p>
              <p><strong>Thời gian:</strong> ${booking.startTime} - ${booking.endTime}</p>
              ${reason ? `<p><strong>Lý do từ chối:</strong> ${reason}</p>` : ''}
            </div>
            
            <p>Bạn có thể tìm kiếm và đặt sân khác hoặc thử lại vào thời gian khác.</p>
            <a href="${process.env.FRONTEND_URL}/renter" style="background-color: #2e7d32; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Tìm sân khác
            </a>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email từ chối gửi thành công:', result.messageId);
      return result;
    } catch (error) {
      console.error('Lỗi gửi email từ chối:', error);
      throw error;
    }
  }

  /**
   * Kiểm tra kết nối email
   */
  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('Email service đã sẵn sàng');
      return true;
    } catch (error) {
      console.error('Lỗi kết nối email service:', error);
      return false;
    }
  }

  /**
   * Kiểm tra kết nối email
   */
  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('Email service đã sẵn sàng');
      return true;
    } catch (error) {
      console.error('Lỗi kết nối email service:', error);
      return false;
    }
  }
}

module.exports = new EmailService(); 