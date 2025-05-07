const { db, getCollection } = require('../config/db');

// Định nghĩa collection
const userCollection = 'users';

/**
 * Model User - Quản lý thông tin người dùng trong hệ thống
 */
class User {
  /**
   * Tạo một đối tượng User
   * @param {Object} data - Dữ liệu người dùng
   */
  constructor(data) {
    this.id = data.id || null;
    this.email = data.email || '';
    this.displayName = data.displayName || '';
    this.phoneNumber = data.phoneNumber || '';
    this.role = data.role || 'renter'; // 'admin', 'owner', 'renter'
    this.photoURL = data.photoURL || '';
    this.address = data.address || '';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.status = data.status || 'active'; // 'active', 'inactive', 'banned'
  }

  /**
   * Tạo/Cập nhật người dùng trong Firestore
   * @returns {Promise<string>} - ID của người dùng
   */
  async save() {
    try {
      const userData = {
        email: this.email,
        displayName: this.displayName,
        phoneNumber: this.phoneNumber,
        role: this.role,
        photoURL: this.photoURL,
        address: this.address,
        updatedAt: new Date()
      };

      if (this.id) {
        // Cập nhật người dùng
        await getCollection(userCollection).doc(this.id).update(userData);
        return this.id;
      } else {
        // Tạo người dùng mới
        userData.createdAt = new Date();
        userData.status = 'active';
        const docRef = await getCollection(userCollection).add(userData);
        this.id = docRef.id;
        return docRef.id;
      }
    } catch (error) {
      console.error('Lỗi khi lưu người dùng:', error);
      throw error;
    }
  }

  /**
   * Tìm người dùng theo ID
   * @param {string} userId - ID của người dùng
   * @returns {Promise<User|null>} - Đối tượng User hoặc null nếu không tìm thấy
   */
  static async findById(userId) {
    try {
      const doc = await getCollection(userCollection).doc(userId).get();
      if (!doc.exists) {
        return null;
      }
      const userData = doc.data();
      return new User({ id: doc.id, ...userData });
    } catch (error) {
      console.error('Lỗi khi tìm người dùng theo ID:', error);
      throw error;
    }
  }

  /**
   * Tìm người dùng theo email
   * @param {string} email - Email của người dùng
   * @returns {Promise<User|null>} - Đối tượng User hoặc null nếu không tìm thấy
   */
  static async findByEmail(email) {
    try {
      const snapshot = await getCollection(userCollection)
        .where('email', '==', email)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return new User({ id: doc.id, ...doc.data() });
    } catch (error) {
      console.error('Lỗi khi tìm người dùng theo email:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách người dùng theo vai trò
   * @param {string} role - Vai trò người dùng ('admin', 'owner', 'renter')
   * @returns {Promise<Array<User>>} - Danh sách người dùng
   */
  static async findByRole(role) {
    try {
      const snapshot = await getCollection(userCollection)
        .where('role', '==', role)
        .get();

      return snapshot.docs.map(doc => new User({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Lỗi khi tìm người dùng theo vai trò:', error);
      throw error;
    }
  }

  /**
   * Lấy tất cả người dùng
   * @returns {Promise<Array<User>>} - Danh sách tất cả người dùng
   */
  static async findAll() {
    try {
      const snapshot = await getCollection(userCollection).get();
      return snapshot.docs.map(doc => new User({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Lỗi khi lấy tất cả người dùng:', error);
      throw error;
    }
  }

  /**
   * Xóa người dùng
   * @param {string} userId - ID của người dùng cần xóa
   * @returns {Promise<boolean>} - Kết quả xóa
   */
  static async delete(userId) {
    try {
      await getCollection(userCollection).doc(userId).delete();
      return true;
    } catch (error) {
      console.error('Lỗi khi xóa người dùng:', error);
      throw error;
    }
  }

  /**
   * Cập nhật trạng thái người dùng
   * @param {string} userId - ID của người dùng
   * @param {string} status - Trạng thái mới ('active', 'inactive', 'banned')
   * @returns {Promise<boolean>} - Kết quả cập nhật
   */
  static async updateStatus(userId, status) {
    try {
      await getCollection(userCollection).doc(userId).update({
        status,
        updatedAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái người dùng:', error);
      throw error;
    }
  }
}

module.exports = User; 