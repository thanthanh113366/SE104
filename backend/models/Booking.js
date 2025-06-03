const { db, getCollection } = require('../config/db');

// Định nghĩa collection
const bookingCollection = 'bookings';

/**
 * Model Booking - Quản lý thông tin đặt sân
 */
class Booking {
  /**
   * Tạo một đối tượng Booking
   * @param {Object} data - Dữ liệu đặt sân
   */
  constructor(data) {
    this.id = data.id || null;
    this.courtId = data.courtId || '';
    this.userId = data.userId || '';
    this.ownerId = data.ownerId || '';
    this.userName = data.userName || ''; // Tên người đặt
    this.userEmail = data.userEmail || ''; // Email người đặt
    this.userPhone = data.userPhone || ''; // Số điện thoại người đặt
    this.courtName = data.courtName || ''; // Tên sân
    this.date = data.date || new Date(); // Ngày đặt sân
    this.startTime = data.startTime || ''; // Thời gian bắt đầu (format: 'HH:MM')
    this.endTime = data.endTime || ''; // Thời gian kết thúc (format: 'HH:MM')
    this.duration = data.duration || 0; // Thời lượng (giờ)
    this.totalPrice = data.totalPrice || 0; // Tổng tiền
    this.status = data.status || 'pending'; // 'pending', 'confirmed', 'cancelled', 'completed'
    this.paymentStatus = data.paymentStatus || 'unpaid'; // 'unpaid', 'partial', 'paid'
    this.paymentMethod = data.paymentMethod || ''; // 'cash', 'credit_card', 'bank_transfer', 'e_wallet'
    this.paymentId = data.paymentId || ''; // ID giao dịch thanh toán
    this.notes = data.notes || ''; // Ghi chú
    this.cancellationReason = data.cancellationReason || '';
    this.isReviewed = data.isReviewed || false; // Đã đánh giá chưa
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Tạo/Cập nhật đặt sân trong Firestore
   * @returns {Promise<string>} - ID của đặt sân
   */
  async save() {
    try {
      const bookingData = {
        courtId: this.courtId,
        userId: this.userId,
        ownerId: this.ownerId,
        userName: this.userName,
        userEmail: this.userEmail,
        userPhone: this.userPhone,
        courtName: this.courtName,
        date: this.date,
        startTime: this.startTime,
        endTime: this.endTime,
        duration: this.duration,
        totalPrice: this.totalPrice,
        status: this.status,
        paymentStatus: this.paymentStatus,
        paymentMethod: this.paymentMethod,
        paymentId: this.paymentId,
        notes: this.notes,
        cancellationReason: this.cancellationReason,
        isReviewed: this.isReviewed,
        updatedAt: new Date()
      };

      if (this.id) {
        // Cập nhật đặt sân
        await getCollection(bookingCollection).doc(this.id).update(bookingData);
        return this.id;
      } else {
        // Tạo đặt sân mới
        bookingData.createdAt = new Date();
        const docRef = await getCollection(bookingCollection).add(bookingData);
        this.id = docRef.id;
        return docRef.id;
      }
    } catch (error) {
      console.error('Lỗi khi lưu đặt sân:', error);
      throw error;
    }
  }

  /**
   * Tìm đặt sân theo ID
   * @param {string} bookingId - ID của đặt sân
   * @returns {Promise<Booking|null>} - Đối tượng Booking hoặc null nếu không tìm thấy
   */
  static async findById(bookingId) {
    try {
      const doc = await getCollection(bookingCollection).doc(bookingId).get();
      if (!doc.exists) {
        return null;
      }
      const bookingData = doc.data();
      return new Booking({ id: doc.id, ...bookingData });
    } catch (error) {
      console.error('Lỗi khi tìm đặt sân theo ID:', error);
      throw error;
    }
  }

  /**
   * Tìm đặt sân theo người dùng
   * @param {string} userId - ID của người dùng
   * @returns {Promise<Array<Booking>>} - Danh sách đặt sân
   */
  static async findByUser(userId) {
    try {
      console.log('Đang tìm bookings cho user:', userId);
      
      const snapshot = await getCollection(bookingCollection)
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')  // Chỉ dùng 1 orderBy
        .get();

      console.log('Tìm thấy', snapshot.docs.length, 'bookings');
      
      const bookings = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Booking data:', { id: doc.id, status: data.status, courtName: data.courtName });
        return new Booking({ id: doc.id, ...data });
      });

      return bookings;
    } catch (error) {
      console.error('Lỗi khi tìm đặt sân theo người dùng:', error);
      console.error('Error details:', error.code, error.message);
      throw error;
    }
  }

  /**
   * Tìm đặt sân theo chủ sân
   * @param {string} ownerId - ID của chủ sân
   * @returns {Promise<Array<Booking>>} - Danh sách đặt sân
   */
  static async findByOwner(ownerId) {
    try {
      const snapshot = await getCollection(bookingCollection)
        .where('ownerId', '==', ownerId)
        .orderBy('createdAt', 'desc')  // Chỉ dùng 1 orderBy
        .get();

      return snapshot.docs.map(doc => new Booking({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Lỗi khi tìm đặt sân theo chủ sân:', error);
      throw error;
    }
  }

  /**
   * Tìm đặt sân theo sân
   * @param {string} courtId - ID của sân
   * @returns {Promise<Array<Booking>>} - Danh sách đặt sân
   */
  static async findByCourt(courtId) {
    try {
      const snapshot = await getCollection(bookingCollection)
        .where('courtId', '==', courtId)
        .orderBy('createdAt', 'desc')  // Chỉ dùng 1 orderBy
        .get();

      return snapshot.docs.map(doc => new Booking({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Lỗi khi tìm đặt sân theo sân:', error);
      throw error;
    }
  }

  /**
   * Tìm đặt sân theo ngày và sân
   * @param {string} courtId - ID của sân
   * @param {Date} date - Ngày đặt sân
   * @returns {Promise<Array<Booking>>} - Danh sách đặt sân
   */
  static async findByCourtAndDate(courtId, date) {
    try {
      // Convert date to timestamp for Firestore comparison
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));

      const snapshot = await getCollection(bookingCollection)
        .where('courtId', '==', courtId)
        .where('date', '>=', startOfDay)
        .where('date', '<=', endOfDay)
        .orderBy('date', 'asc')
        .orderBy('startTime', 'asc')
        .get();

      return snapshot.docs.map(doc => new Booking({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Lỗi khi tìm đặt sân theo ngày và sân:', error);
      throw error;
    }
  }

  /**
   * Kiểm tra khung giờ đặt sân đã được đặt chưa
   * @param {string} courtId - ID của sân
   * @param {Date} date - Ngày đặt sân
   * @param {string} startTime - Thời gian bắt đầu (format: 'HH:MM')
   * @param {string} endTime - Thời gian kết thúc (format: 'HH:MM')
   * @param {string} excludeBookingId - ID của đặt sân cần loại trừ (dùng khi cập nhật)
   * @returns {Promise<boolean>} - true nếu khung giờ đã được đặt, false nếu chưa
   */
  static async isTimeSlotBooked(courtId, date, startTime, endTime, excludeBookingId = null) {
    try {
      // Convert date to timestamp for Firestore comparison
      const bookingDate = new Date(date.setHours(0, 0, 0, 0));

      // Lấy tất cả các đặt sân trong ngày đó cho sân này
      const snapshot = await getCollection(bookingCollection)
        .where('courtId', '==', courtId)
        .where('date', '==', bookingDate)
        .where('status', 'in', ['pending', 'confirmed']) // Chỉ xét các đặt sân đang chờ hoặc đã xác nhận
        .get();

      // Chuyển đổi startTime, endTime sang số phút trong ngày để so sánh dễ dàng hơn
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;

      // Kiểm tra từng đặt sân để xem có trùng khung giờ không
      for (const doc of snapshot.docs) {
        // Nếu là đặt sân cần loại trừ, bỏ qua
        if (excludeBookingId && doc.id === excludeBookingId) {
          continue;
        }

        const booking = doc.data();
        const [bookingStartHour, bookingStartMinute] = booking.startTime.split(':').map(Number);
        const [bookingEndHour, bookingEndMinute] = booking.endTime.split(':').map(Number);
        const bookingStartMinutes = bookingStartHour * 60 + bookingStartMinute;
        const bookingEndMinutes = bookingEndHour * 60 + bookingEndMinute;

        // Kiểm tra xem hai khung giờ có giao nhau không
        if (
          (startMinutes < bookingEndMinutes && endMinutes > bookingStartMinutes) ||
          (startMinutes === bookingStartMinutes && endMinutes === bookingEndMinutes)
        ) {
          return true; // Đã có đặt sân trong khung giờ này
        }
      }

      return false; // Khung giờ trống
    } catch (error) {
      console.error('Lỗi khi kiểm tra khung giờ đặt sân:', error);
      throw error;
    }
  }

  /**
   * Cập nhật trạng thái đặt sân
   * @param {string} bookingId - ID của đặt sân
   * @param {string} status - Trạng thái mới ('pending', 'confirmed', 'cancelled', 'completed')
   * @param {string} reason - Lý do (dùng cho trường hợp hủy đặt sân)
   * @returns {Promise<boolean>} - Kết quả cập nhật
   */
  static async updateStatus(bookingId, status, reason = '') {
    try {
      const updateData = {
        status,
        updatedAt: new Date()
      };

      if (status === 'cancelled' && reason) {
        updateData.cancellationReason = reason;
      }

      await getCollection(bookingCollection).doc(bookingId).update(updateData);
      return true;
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái đặt sân:', error);
      throw error;
    }
  }

  /**
   * Cập nhật trạng thái thanh toán
   * @param {string} bookingId - ID của đặt sân
   * @param {string} paymentStatus - Trạng thái thanh toán ('unpaid', 'partial', 'paid')
   * @param {string} paymentMethod - Phương thức thanh toán
   * @param {string} paymentId - ID giao dịch thanh toán
   * @returns {Promise<boolean>} - Kết quả cập nhật
   */
  static async updatePayment(bookingId, paymentStatus, paymentMethod = '', paymentId = '') {
    try {
      const updateData = {
        paymentStatus,
        updatedAt: new Date()
      };

      if (paymentMethod) {
        updateData.paymentMethod = paymentMethod;
      }

      if (paymentId) {
        updateData.paymentId = paymentId;
      }

      await getCollection(bookingCollection).doc(bookingId).update(updateData);
      return true;
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái thanh toán:', error);
      throw error;
    }
  }

  /**
   * Đánh dấu đã đánh giá cho đặt sân
   * @param {string} bookingId - ID của đặt sân
   * @returns {Promise<boolean>} - Kết quả cập nhật
   */
  static async markAsReviewed(bookingId) {
    try {
      await getCollection(bookingCollection).doc(bookingId).update({
        isReviewed: true,
        updatedAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Lỗi khi đánh dấu đã đánh giá cho đặt sân:', error);
      throw error;
    }
  }

  /**
   * Lấy thống kê đặt sân theo khoảng thời gian
   * @param {string} ownerId - ID của chủ sân
   * @param {Date} startDate - Ngày bắt đầu
   * @param {Date} endDate - Ngày kết thúc
   * @returns {Promise<Object>} - Thống kê đặt sân
   */
  static async getBookingStats(ownerId, startDate, endDate) {
    try {
      const snapshot = await getCollection(bookingCollection)
        .where('ownerId', '==', ownerId)
        .where('date', '>=', startDate)
        .where('date', '<=', endDate)
        .get();

      const bookings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Tính toán thống kê
      const stats = {
        totalBookings: bookings.length,
        confirmedBookings: bookings.filter(booking => booking.status === 'confirmed').length,
        cancelledBookings: bookings.filter(booking => booking.status === 'cancelled').length,
        completedBookings: bookings.filter(booking => booking.status === 'completed').length,
        totalRevenue: bookings
          .filter(booking => ['confirmed', 'completed'].includes(booking.status) && booking.paymentStatus === 'paid')
          .reduce((sum, booking) => sum + booking.totalPrice, 0),
        avgBookingPrice: 0,
        bookingsByDay: {}
      };

      // Tính giá trung bình
      if (stats.confirmedBookings + stats.completedBookings > 0) {
        stats.avgBookingPrice = stats.totalRevenue / (stats.confirmedBookings + stats.completedBookings);
      }

      // Tính số lượng đặt sân theo ngày
      bookings.forEach(booking => {
        const bookingDate = booking.date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
        if (!stats.bookingsByDay[bookingDate]) {
          stats.bookingsByDay[bookingDate] = 0;
        }
        stats.bookingsByDay[bookingDate]++;
      });

      return stats;
    } catch (error) {
      console.error('Lỗi khi lấy thống kê đặt sân:', error);
      throw error;
    }
  }
}

module.exports = Booking; 