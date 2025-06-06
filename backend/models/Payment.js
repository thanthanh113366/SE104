const { db, getCollection } = require('../config/db');

// Định nghĩa collection
const paymentCollection = 'payments';

/**
 * Model Payment - Quản lý thông tin thanh toán đặt sân
 */
class Payment {
  /**
   * Tạo một đối tượng Payment
   * @param {Object} data - Dữ liệu thanh toán
   */
  constructor(data) {
    this.id = data.id || null;
    this.bookingId = data.bookingId || '';
    this.userId = data.userId || '';
    this.ownerId = data.ownerId || '';
    this.courtId = data.courtId || '';
    this.amount = data.amount || 0; // Số tiền thanh toán
    this.method = data.method || ''; // 'cash', 'credit_card', 'bank_transfer', 'e_wallet'
    this.provider = data.provider || ''; // 'momo', 'zalopay', 'vnpay', 'visa', 'mastercard', ...
    this.status = data.status || 'pending'; // 'pending', 'completed', 'failed', 'refunded'
    this.transactionId = data.transactionId || ''; // ID giao dịch từ cổng thanh toán
    this.paymentDate = data.paymentDate || null; // Ngày thanh toán thành công
    this.refundDate = data.refundDate || null; // Ngày hoàn tiền (nếu có)
    this.refundAmount = data.refundAmount || 0; // Số tiền hoàn lại (nếu có)
    this.refundReason = data.refundReason || ''; // Lý do hoàn tiền
    this.notes = data.notes || ''; // Ghi chú thanh toán
    this.metadata = data.metadata || {}; // Dữ liệu bổ sung
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Tạo/Cập nhật thanh toán trong Firestore
   * @returns {Promise<string>} - ID của thanh toán
   */
  async save() {
    try {
      const paymentData = {
        bookingId: this.bookingId,
        userId: this.userId,
        ownerId: this.ownerId,
        courtId: this.courtId,
        amount: this.amount,
        method: this.method,
        provider: this.provider,
        status: this.status,
        transactionId: this.transactionId,
        paymentDate: this.paymentDate,
        refundDate: this.refundDate,
        refundAmount: this.refundAmount,
        refundReason: this.refundReason,
        notes: this.notes,
        metadata: this.metadata,
        updatedAt: new Date()
      };

      if (this.id) {
        // Cập nhật thanh toán
        await getCollection(paymentCollection).doc(this.id).update(paymentData);
        return this.id;
      } else {
        // Tạo thanh toán mới
        paymentData.createdAt = new Date();
        const docRef = await getCollection(paymentCollection).add(paymentData);
        this.id = docRef.id;
        return docRef.id;
      }
    } catch (error) {
      console.error('Lỗi khi lưu thanh toán:', error);
      throw error;
    }
  }

  /**
   * Tìm thanh toán theo ID
   * @param {string} paymentId - ID của thanh toán
   * @returns {Promise<Payment|null>} - Đối tượng Payment hoặc null nếu không tìm thấy
   */
  static async findById(paymentId) {
    try {
      const doc = await getCollection(paymentCollection).doc(paymentId).get();
      if (!doc.exists) {
        return null;
      }
      const paymentData = doc.data();
      return new Payment({ id: doc.id, ...paymentData });
    } catch (error) {
      console.error('Lỗi khi tìm thanh toán theo ID:', error);
      throw error;
    }
  }

  /**
   * Tìm thanh toán theo mã giao dịch bên ngoài
   * @param {string} transactionId - Mã giao dịch từ nhà cung cấp thanh toán
   * @returns {Promise<Payment|null>} - Đối tượng Payment hoặc null nếu không tìm thấy
   */
  static async findByTransactionId(transactionId) {
    try {
      const snapshot = await getCollection(paymentCollection)
        .where('transactionId', '==', transactionId)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return new Payment({ id: doc.id, ...doc.data() });
    } catch (error) {
      console.error('Lỗi khi tìm thanh toán theo mã giao dịch:', error);
      throw error;
    }
  }

  /**
   * Tìm thanh toán theo đặt sân
   * @param {string} bookingId - ID của đặt sân
   * @returns {Promise<Array<Payment>>} - Danh sách thanh toán
   */
  static async findByBooking(bookingId) {
    try {
      const snapshot = await getCollection(paymentCollection)
        .where('bookingId', '==', bookingId)
        .get();

      // Sort manually in memory to avoid index requirement
      const payments = snapshot.docs.map(doc => new Payment({ id: doc.id, ...doc.data() }));
      return payments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.error('Lỗi khi tìm thanh toán theo đặt sân:', error);
      throw error;
    }
  }

  /**
   * Tìm thanh toán theo người dùng
   * @param {string} userId - ID của người dùng
   * @param {Object} options - Các tùy chọn: limit, status
   * @returns {Promise<Array<Payment>>} - Danh sách thanh toán
   */
  static async findByUser(userId, options = {}) {
    try {
      let query = getCollection(paymentCollection).where('userId', '==', userId);

      // Lọc theo trạng thái
      if (options.status) {
        query = query.where('status', '==', options.status);
      }

      const snapshot = await query.get();
      let payments = snapshot.docs.map(doc => new Payment({ id: doc.id, ...doc.data() }));
      
      // Sort manually in memory to avoid index requirement
      payments = payments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Giới hạn số lượng sau khi sort
      if (options.limit) {
        payments = payments.slice(0, options.limit);
      }

      return payments;
    } catch (error) {
      console.error('Lỗi khi tìm thanh toán theo người dùng:', error);
      throw error;
    }
  }

  /**
   * Tìm thanh toán theo chủ sân
   * @param {string} ownerId - ID của chủ sân
   * @param {Object} options - Các tùy chọn: limit, status, startDate, endDate
   * @returns {Promise<Array<Payment>>} - Danh sách thanh toán
   */
  static async findByOwner(ownerId, options = {}) {
    try {
      let query = getCollection(paymentCollection).where('ownerId', '==', ownerId);

      // Lọc theo trạng thái
      if (options.status) {
        query = query.where('status', '==', options.status);
      }

      // Lọc theo ngày thanh toán
      if (options.startDate && options.endDate) {
        query = query.where('paymentDate', '>=', options.startDate)
                    .where('paymentDate', '<=', options.endDate);
      }

      // Sắp xếp
      query = query.orderBy('paymentDate', 'desc').orderBy('createdAt', 'desc');

      // Giới hạn số lượng
      if (options.limit) {
        query = query.limit(options.limit);
      }

      const snapshot = await query.get();
      return snapshot.docs.map(doc => new Payment({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Lỗi khi tìm thanh toán theo chủ sân:', error);
      throw error;
    }
  }

  /**
   * Cập nhật trạng thái thanh toán
   * @param {string} paymentId - ID của thanh toán
   * @param {string} status - Trạng thái mới ('pending', 'completed', 'failed', 'refunded')
   * @param {Object} additionalData - Dữ liệu bổ sung cần cập nhật
   * @returns {Promise<boolean>} - Kết quả cập nhật
   */
  static async updateStatus(paymentId, status, additionalData = {}) {
    try {
      const updateData = {
        status,
        updatedAt: new Date(),
        ...additionalData
      };

      if (status === 'completed' && !additionalData.paymentDate) {
        updateData.paymentDate = new Date();
      }

      if (status === 'refunded' && !additionalData.refundDate) {
        updateData.refundDate = new Date();
      }

      await getCollection(paymentCollection).doc(paymentId).update(updateData);
      return true;
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái thanh toán:', error);
      throw error;
    }
  }

  /**
   * Xử lý hoàn tiền
   * @param {string} paymentId - ID của thanh toán
   * @param {number} amount - Số tiền hoàn lại
   * @param {string} reason - Lý do hoàn tiền
   * @returns {Promise<boolean>} - Kết quả hoàn tiền
   */
  static async processRefund(paymentId, amount, reason) {
    try {
      await getCollection(paymentCollection).doc(paymentId).update({
        status: 'refunded',
        refundAmount: amount,
        refundReason: reason,
        refundDate: new Date(),
        updatedAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Lỗi khi xử lý hoàn tiền:', error);
      throw error;
    }
  }

  /**
   * Lấy thống kê thanh toán theo khoảng thời gian
   * @param {string} ownerId - ID của chủ sân
   * @param {Date} startDate - Ngày bắt đầu
   * @param {Date} endDate - Ngày kết thúc
   * @returns {Promise<Object>} - Thống kê thanh toán
   */
  static async getPaymentStats(ownerId, startDate, endDate) {
    try {
      const snapshot = await getCollection(paymentCollection)
        .where('ownerId', '==', ownerId)
        .where('paymentDate', '>=', startDate)
        .where('paymentDate', '<=', endDate)
        .get();

      const payments = snapshot.docs.map(doc => doc.data());

      // Tính toán thống kê
      const stats = {
        totalAmount: payments
          .filter(payment => payment.status === 'completed')
          .reduce((sum, payment) => sum + payment.amount, 0),
        totalRefunded: payments
          .filter(payment => payment.status === 'refunded')
          .reduce((sum, payment) => sum + payment.refundAmount, 0),
        netAmount: 0, // Sẽ tính sau
        paymentCounts: {
          completed: payments.filter(payment => payment.status === 'completed').length,
          pending: payments.filter(payment => payment.status === 'pending').length,
          failed: payments.filter(payment => payment.status === 'failed').length,
          refunded: payments.filter(payment => payment.status === 'refunded').length
        },
        methodBreakdown: {},
        dailyRevenue: {}
      };

      // Tính toán doanh thu ròng
      stats.netAmount = stats.totalAmount - stats.totalRefunded;

      // Phân tích theo phương thức thanh toán
      payments
        .filter(payment => payment.status === 'completed')
        .forEach(payment => {
          const method = payment.method || 'unknown';
          if (!stats.methodBreakdown[method]) {
            stats.methodBreakdown[method] = 0;
          }
          stats.methodBreakdown[method] += payment.amount;
        });

      // Phân tích doanh thu theo ngày
      payments
        .filter(payment => payment.status === 'completed')
        .forEach(payment => {
          const day = payment.paymentDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
          if (!stats.dailyRevenue[day]) {
            stats.dailyRevenue[day] = 0;
          }
          stats.dailyRevenue[day] += payment.amount;
        });

      return stats;
    } catch (error) {
      console.error('Lỗi khi lấy thống kê thanh toán:', error);
      throw error;
    }
  }
}

module.exports = Payment; 