const { db, getCollection } = require('../config/db');

// Định nghĩa collection
const reviewCollection = 'reviews';

/**
 * Model Review - Quản lý đánh giá sân thể thao
 */
class Review {
  /**
   * Tạo một đối tượng Review
   * @param {Object} data - Dữ liệu đánh giá
   */
  constructor(data) {
    this.id = data.id || null;
    this.courtId = data.courtId || '';
    this.userId = data.userId || '';
    this.userName = data.userName || 'Người dùng ẩn danh';
    this.bookingId = data.bookingId || '';
    this.rating = data.rating || 0; // Điểm đánh giá (1-5)
    this.comment = data.comment || '';
    this.images = data.images || []; // Mảng URL hình ảnh kèm theo đánh giá
    this.ownerReply = data.ownerReply || '';
    this.status = data.status || 'active'; // 'active', 'hidden', 'removed'
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.replyAt = data.replyAt || null;
  }

  /**
   * Tạo/Cập nhật đánh giá trong Firestore
   * @returns {Promise<string>} - ID của đánh giá
   */
  async save() {
    try {
      const reviewData = {
        courtId: this.courtId,
        userId: this.userId,
        userName: this.userName,
        bookingId: this.bookingId,
        rating: this.rating,
        comment: this.comment,
        images: this.images,
        ownerReply: this.ownerReply,
        status: this.status,
        updatedAt: new Date()
      };

      if (this.replyAt) {
        reviewData.replyAt = this.replyAt;
      }

      if (this.id) {
        // Cập nhật đánh giá
        await getCollection(reviewCollection).doc(this.id).update(reviewData);
        return this.id;
      } else {
        // Tạo đánh giá mới
        reviewData.createdAt = new Date();
        const docRef = await getCollection(reviewCollection).add(reviewData);
        this.id = docRef.id;
        return docRef.id;
      }
    } catch (error) {
      console.error('Lỗi khi lưu đánh giá:', error);
      throw error;
    }
  }

  /**
   * Tìm đánh giá theo ID
   * @param {string} reviewId - ID của đánh giá
   * @returns {Promise<Review|null>} - Đối tượng Review hoặc null nếu không tìm thấy
   */
  static async findById(reviewId) {
    try {
      const doc = await getCollection(reviewCollection).doc(reviewId).get();
      if (!doc.exists) {
        return null;
      }
      const reviewData = doc.data();
      return new Review({ id: doc.id, ...reviewData });
    } catch (error) {
      console.error('Lỗi khi tìm đánh giá theo ID:', error);
      throw error;
    }
  }

  /**
   * Tìm đánh giá theo sân
   * @param {string} courtId - ID của sân
   * @param {number} limit - Số lượng đánh giá tối đa muốn lấy
   * @returns {Promise<Array<Review>>} - Danh sách đánh giá
   */
  static async findByCourt(courtId, limit = 50) {
    try {
      const snapshot = await getCollection(reviewCollection)
        .where('courtId', '==', courtId)
        // .where('status', '==', 'active') // Tạm thời comment để tránh cần composite index
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      // Lọc status trong code thay vì Firestore query
      const reviews = snapshot.docs.map(doc => new Review({ id: doc.id, ...doc.data() }))
        .filter(review => review.status === 'active');

      return reviews;
    } catch (error) {
      console.error('Lỗi khi tìm đánh giá theo sân:', error);
      throw error;
    }
  }

  /**
   * Tìm đánh giá theo người dùng
   * @param {string} userId - ID của người dùng
   * @returns {Promise<Array<Review>>} - Danh sách đánh giá
   */
  static async findByUser(userId) {
    try {
      const snapshot = await getCollection(reviewCollection)
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map(doc => new Review({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Lỗi khi tìm đánh giá theo người dùng:', error);
      throw error;
    }
  }

  /**
   * Tìm đánh giá theo lượt đặt sân
   * @param {string} bookingId - ID của lượt đặt sân
   * @returns {Promise<Review|null>} - Đánh giá hoặc null nếu không tìm thấy
   */
  static async findByBooking(bookingId) {
    try {
      const snapshot = await getCollection(reviewCollection)
        .where('bookingId', '==', bookingId)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return new Review({ id: doc.id, ...doc.data() });
    } catch (error) {
      console.error('Lỗi khi tìm đánh giá theo lượt đặt sân:', error);
      throw error;
    }
  }

  /**
   * Lấy tất cả đánh giá
   * @param {Object} options - Các tùy chọn: limit, status
   * @returns {Promise<Array<Review>>} - Danh sách tất cả đánh giá
   */
  static async findAll(options = {}) {
    try {
      let query = getCollection(reviewCollection);

      // Lọc theo trạng thái
      if (options.status) {
        query = query.where('status', '==', options.status);
      }

      // Sắp xếp
      query = query.orderBy('createdAt', 'desc');

      // Giới hạn số lượng
      if (options.limit) {
        query = query.limit(options.limit);
      }

      const snapshot = await query.get();
      return snapshot.docs.map(doc => new Review({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Lỗi khi lấy tất cả đánh giá:', error);
      throw error;
    }
  }

  /**
   * Thêm phản hồi của chủ sân vào đánh giá
   * @param {string} reviewId - ID của đánh giá
   * @param {string} ownerReply - Nội dung phản hồi
   * @returns {Promise<boolean>} - Kết quả cập nhật
   */
  static async addReply(reviewId, ownerReply) {
    try {
      await getCollection(reviewCollection).doc(reviewId).update({
        ownerReply,
        replyAt: new Date(),
        updatedAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Lỗi khi thêm phản hồi vào đánh giá:', error);
      throw error;
    }
  }

  /**
   * Cập nhật trạng thái đánh giá
   * @param {string} reviewId - ID của đánh giá
   * @param {string} status - Trạng thái mới ('active', 'hidden', 'removed')
   * @returns {Promise<boolean>} - Kết quả cập nhật
   */
  static async updateStatus(reviewId, status) {
    try {
      await getCollection(reviewCollection).doc(reviewId).update({
        status,
        updatedAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái đánh giá:', error);
      throw error;
    }
  }

  /**
   * Xóa đánh giá
   * @param {string} reviewId - ID của đánh giá
   * @returns {Promise<boolean>} - Kết quả xóa
   */
  static async delete(reviewId) {
    try {
      await getCollection(reviewCollection).doc(reviewId).delete();
      return true;
    } catch (error) {
      console.error('Lỗi khi xóa đánh giá:', error);
      throw error;
    }
  }

  /**
   * Tính điểm đánh giá trung bình cho một sân
   * @param {string} courtId - ID của sân
   * @returns {Promise<Object>} - Thống kê đánh giá: {average, total, distribution}
   */
  static async getCourtRatingStats(courtId) {
    try {
      const snapshot = await getCollection(reviewCollection)
        .where('courtId', '==', courtId)
        .where('status', '==', 'active')
        .get();

      const reviews = snapshot.docs.map(doc => doc.data());
      
      if (reviews.length === 0) {
        return {
          average: 0,
          total: 0,
          distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        };
      }

      // Tính phân phối đánh giá
      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      let sum = 0;

      reviews.forEach(review => {
        const rating = review.rating;
        sum += rating;
        distribution[rating] = (distribution[rating] || 0) + 1;
      });

      return {
        average: parseFloat((sum / reviews.length).toFixed(1)),
        total: reviews.length,
        distribution
      };
    } catch (error) {
      console.error('Lỗi khi tính điểm đánh giá trung bình:', error);
      throw error;
    }
  }
}

module.exports = Review; 