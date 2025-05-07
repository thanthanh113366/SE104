const { db, getCollection } = require('../config/db');

// Định nghĩa collection
const supportCollection = 'supports';
const messageCollection = 'support_messages';

/**
 * Model Support - Quản lý yêu cầu hỗ trợ
 */
class Support {
  /**
   * Tạo một đối tượng Support
   * @param {Object} data - Dữ liệu yêu cầu hỗ trợ
   */
  constructor(data) {
    this.id = data.id || null;
    this.userId = data.userId || '';
    this.ownerId = data.ownerId || ''; // Có thể null nếu là yêu cầu hỗ trợ chung
    this.courtId = data.courtId || ''; // Có thể null nếu không liên quan đến sân cụ thể
    this.bookingId = data.bookingId || ''; // Có thể null nếu không liên quan đến đặt sân
    this.subject = data.subject || '';
    this.category = data.category || ''; // 'booking', 'payment', 'technical', 'feedback', 'other'
    this.status = data.status || 'open'; // 'open', 'in_progress', 'resolved', 'closed'
    this.priority = data.priority || 'normal'; // 'low', 'normal', 'high', 'urgent'
    this.assignedTo = data.assignedTo || ''; // ID của admin được gán xử lý
    this.lastMessageAt = data.lastMessageAt || new Date();
    this.resolvedAt = data.resolvedAt || null;
    this.closedAt = data.closedAt || null;
    this.isNewMessageFromUser = data.isNewMessageFromUser || false; // true nếu có tin nhắn mới từ người dùng
    this.isNewMessageFromSupport = data.isNewMessageFromSupport || false; // true nếu có tin nhắn mới từ hỗ trợ
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Tạo/Cập nhật yêu cầu hỗ trợ trong Firestore
   * @returns {Promise<string>} - ID của yêu cầu hỗ trợ
   */
  async save() {
    try {
      const supportData = {
        userId: this.userId,
        ownerId: this.ownerId,
        courtId: this.courtId,
        bookingId: this.bookingId,
        subject: this.subject,
        category: this.category,
        status: this.status,
        priority: this.priority,
        assignedTo: this.assignedTo,
        lastMessageAt: this.lastMessageAt,
        isNewMessageFromUser: this.isNewMessageFromUser,
        isNewMessageFromSupport: this.isNewMessageFromSupport,
        updatedAt: new Date()
      };

      if (this.resolvedAt) {
        supportData.resolvedAt = this.resolvedAt;
      }

      if (this.closedAt) {
        supportData.closedAt = this.closedAt;
      }

      if (this.id) {
        // Cập nhật yêu cầu hỗ trợ
        await getCollection(supportCollection).doc(this.id).update(supportData);
        return this.id;
      } else {
        // Tạo yêu cầu hỗ trợ mới
        supportData.createdAt = new Date();
        const docRef = await getCollection(supportCollection).add(supportData);
        this.id = docRef.id;
        return docRef.id;
      }
    } catch (error) {
      console.error('Lỗi khi lưu yêu cầu hỗ trợ:', error);
      throw error;
    }
  }

  /**
   * Tìm yêu cầu hỗ trợ theo ID
   * @param {string} supportId - ID của yêu cầu hỗ trợ
   * @returns {Promise<Support|null>} - Đối tượng Support hoặc null nếu không tìm thấy
   */
  static async findById(supportId) {
    try {
      const doc = await getCollection(supportCollection).doc(supportId).get();
      if (!doc.exists) {
        return null;
      }
      const supportData = doc.data();
      return new Support({ id: doc.id, ...supportData });
    } catch (error) {
      console.error('Lỗi khi tìm yêu cầu hỗ trợ theo ID:', error);
      throw error;
    }
  }

  /**
   * Tìm yêu cầu hỗ trợ theo người dùng
   * @param {string} userId - ID của người dùng
   * @param {Object} options - Các tùy chọn: limit, status
   * @returns {Promise<Array<Support>>} - Danh sách yêu cầu hỗ trợ
   */
  static async findByUser(userId, options = {}) {
    try {
      let query = getCollection(supportCollection).where('userId', '==', userId);

      // Lọc theo trạng thái
      if (options.status) {
        query = query.where('status', '==', options.status);
      }

      // Sắp xếp theo thời gian cập nhật gần nhất
      query = query.orderBy('updatedAt', 'desc');

      // Giới hạn số lượng
      if (options.limit) {
        query = query.limit(options.limit);
      }

      const snapshot = await query.get();
      return snapshot.docs.map(doc => new Support({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Lỗi khi tìm yêu cầu hỗ trợ theo người dùng:', error);
      throw error;
    }
  }

  /**
   * Tìm yêu cầu hỗ trợ theo chủ sân
   * @param {string} ownerId - ID của chủ sân
   * @param {Object} options - Các tùy chọn: limit, status
   * @returns {Promise<Array<Support>>} - Danh sách yêu cầu hỗ trợ
   */
  static async findByOwner(ownerId, options = {}) {
    try {
      let query = getCollection(supportCollection).where('ownerId', '==', ownerId);

      // Lọc theo trạng thái
      if (options.status) {
        query = query.where('status', '==', options.status);
      }

      // Sắp xếp theo thời gian cập nhật gần nhất
      query = query.orderBy('updatedAt', 'desc');

      // Giới hạn số lượng
      if (options.limit) {
        query = query.limit(options.limit);
      }

      const snapshot = await query.get();
      return snapshot.docs.map(doc => new Support({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Lỗi khi tìm yêu cầu hỗ trợ theo chủ sân:', error);
      throw error;
    }
  }

  /**
   * Lấy tất cả yêu cầu hỗ trợ
   * @param {Object} options - Các tùy chọn: limit, status, category, priority
   * @returns {Promise<Array<Support>>} - Danh sách tất cả yêu cầu hỗ trợ
   */
  static async findAll(options = {}) {
    try {
      let query = getCollection(supportCollection);

      // Lọc theo trạng thái
      if (options.status) {
        query = query.where('status', '==', options.status);
      }

      // Lọc theo danh mục
      if (options.category) {
        query = query.where('category', '==', options.category);
      }

      // Lọc theo mức độ ưu tiên
      if (options.priority) {
        query = query.where('priority', '==', options.priority);
      }

      // Sắp xếp
      query = query.orderBy('createdAt', 'desc');

      // Giới hạn số lượng
      if (options.limit) {
        query = query.limit(options.limit);
      }

      const snapshot = await query.get();
      return snapshot.docs.map(doc => new Support({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Lỗi khi lấy tất cả yêu cầu hỗ trợ:', error);
      throw error;
    }
  }

  /**
   * Cập nhật trạng thái yêu cầu hỗ trợ
   * @param {string} supportId - ID của yêu cầu hỗ trợ
   * @param {string} status - Trạng thái mới ('open', 'in_progress', 'resolved', 'closed')
   * @returns {Promise<boolean>} - Kết quả cập nhật
   */
  static async updateStatus(supportId, status) {
    try {
      const updateData = {
        status,
        updatedAt: new Date()
      };

      if (status === 'resolved') {
        updateData.resolvedAt = new Date();
      }

      if (status === 'closed') {
        updateData.closedAt = new Date();
      }

      await getCollection(supportCollection).doc(supportId).update(updateData);
      return true;
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái yêu cầu hỗ trợ:', error);
      throw error;
    }
  }

  /**
   * Gán yêu cầu hỗ trợ cho người hỗ trợ
   * @param {string} supportId - ID của yêu cầu hỗ trợ
   * @param {string} assignedTo - ID của người được gán xử lý
   * @returns {Promise<boolean>} - Kết quả cập nhật
   */
  static async assignTo(supportId, assignedTo) {
    try {
      await getCollection(supportCollection).doc(supportId).update({
        assignedTo,
        status: 'in_progress',
        updatedAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Lỗi khi gán yêu cầu hỗ trợ:', error);
      throw error;
    }
  }

  /**
   * Đánh dấu yêu cầu hỗ trợ có tin nhắn mới từ người dùng
   * @param {string} supportId - ID của yêu cầu hỗ trợ
   * @param {boolean} hasNewMessage - Có tin nhắn mới không
   * @returns {Promise<boolean>} - Kết quả cập nhật
   */
  static async markNewMessageFromUser(supportId, hasNewMessage = true) {
    try {
      await getCollection(supportCollection).doc(supportId).update({
        isNewMessageFromUser: hasNewMessage,
        lastMessageAt: new Date(),
        updatedAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Lỗi khi đánh dấu tin nhắn mới từ người dùng:', error);
      throw error;
    }
  }

  /**
   * Đánh dấu yêu cầu hỗ trợ có tin nhắn mới từ bộ phận hỗ trợ
   * @param {string} supportId - ID của yêu cầu hỗ trợ
   * @param {boolean} hasNewMessage - Có tin nhắn mới không
   * @returns {Promise<boolean>} - Kết quả cập nhật
   */
  static async markNewMessageFromSupport(supportId, hasNewMessage = true) {
    try {
      await getCollection(supportCollection).doc(supportId).update({
        isNewMessageFromSupport: hasNewMessage,
        lastMessageAt: new Date(),
        updatedAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Lỗi khi đánh dấu tin nhắn mới từ bộ phận hỗ trợ:', error);
      throw error;
    }
  }

  /**
   * Thêm tin nhắn vào yêu cầu hỗ trợ
   * @param {string} supportId - ID của yêu cầu hỗ trợ
   * @param {Object} messageData - Thông tin tin nhắn
   * @returns {Promise<string>} - ID của tin nhắn
   */
  static async addMessage(supportId, messageData) {
    try {
      const message = {
        supportId,
        senderId: messageData.senderId,
        senderRole: messageData.senderRole, // 'user', 'owner', 'admin'
        content: messageData.content,
        attachments: messageData.attachments || [],
        createdAt: new Date()
      };

      // Lưu tin nhắn vào collection support_messages
      const docRef = await getCollection(messageCollection).add(message);

      // Cập nhật lastMessageAt và trạng thái tin nhắn mới trong yêu cầu hỗ trợ
      const updateData = {
        lastMessageAt: new Date(),
        updatedAt: new Date()
      };

      if (messageData.senderRole === 'user') {
        updateData.isNewMessageFromUser = true;
        updateData.isNewMessageFromSupport = false;
        // Nếu yêu cầu đã resolved, thì mở lại
        updateData.status = 'open';
      } else {
        updateData.isNewMessageFromUser = false;
        updateData.isNewMessageFromSupport = true;
      }

      await getCollection(supportCollection).doc(supportId).update(updateData);

      return docRef.id;
    } catch (error) {
      console.error('Lỗi khi thêm tin nhắn vào yêu cầu hỗ trợ:', error);
      throw error;
    }
  }

  /**
   * Lấy tất cả tin nhắn của một yêu cầu hỗ trợ
   * @param {string} supportId - ID của yêu cầu hỗ trợ
   * @returns {Promise<Array<Object>>} - Danh sách tin nhắn
   */
  static async getMessages(supportId) {
    try {
      const snapshot = await getCollection(messageCollection)
        .where('supportId', '==', supportId)
        .orderBy('createdAt', 'asc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Lỗi khi lấy tin nhắn của yêu cầu hỗ trợ:', error);
      throw error;
    }
  }

  /**
   * Lấy thống kê yêu cầu hỗ trợ
   * @returns {Promise<Object>} - Thống kê yêu cầu hỗ trợ
   */
  static async getStats() {
    try {
      const snapshot = await getCollection(supportCollection).get();
      const supports = snapshot.docs.map(doc => doc.data());

      // Tính toán thống kê
      const stats = {
        total: supports.length,
        statusCounts: {
          open: supports.filter(support => support.status === 'open').length,
          in_progress: supports.filter(support => support.status === 'in_progress').length,
          resolved: supports.filter(support => support.status === 'resolved').length,
          closed: supports.filter(support => support.status === 'closed').length
        },
        categoryCounts: {
          booking: supports.filter(support => support.category === 'booking').length,
          payment: supports.filter(support => support.category === 'payment').length,
          technical: supports.filter(support => support.category === 'technical').length,
          feedback: supports.filter(support => support.category === 'feedback').length,
          other: supports.filter(support => support.category === 'other').length
        },
        priorityCounts: {
          low: supports.filter(support => support.priority === 'low').length,
          normal: supports.filter(support => support.priority === 'normal').length,
          high: supports.filter(support => support.priority === 'high').length,
          urgent: supports.filter(support => support.priority === 'urgent').length
        },
        avgResolutionTime: 0
      };

      // Tính thời gian giải quyết trung bình (bỏ qua các yêu cầu chưa giải quyết)
      const resolvedSupports = supports.filter(support => support.resolvedAt && support.createdAt);
      if (resolvedSupports.length > 0) {
        const totalTime = resolvedSupports.reduce((sum, support) => {
          const resolutionTime = support.resolvedAt.toMillis() - support.createdAt.toMillis();
          return sum + resolutionTime;
        }, 0);
        stats.avgResolutionTime = totalTime / resolvedSupports.length / (1000 * 60 * 60); // Giờ
      }

      return stats;
    } catch (error) {
      console.error('Lỗi khi lấy thống kê yêu cầu hỗ trợ:', error);
      throw error;
    }
  }
}

module.exports = Support; 