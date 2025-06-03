const { db, getCollection } = require('../config/db');

// Định nghĩa collection
const courtCollection = 'courts';

/**
 * Model Court - Quản lý thông tin sân thể thao
 */
class Court {
  /**
   * Tạo một đối tượng Court
   * @param {Object} data - Dữ liệu sân thể thao
   */
  constructor(data) {
    this.id = data.id || null;
    this.name = data.name || '';
    this.description = data.description || '';
    this.type = data.type || ''; // 'football', 'badminton', 'tennis', 'basketball', etc.
    this.sport = data.sport || data.type || ''; // Đọc cả sport và type từ Firestore
    this.ownerId = data.ownerId || '';
    this.address = data.address || {
      street: '',
      ward: '',
      district: '',
      city: '',
      coordinates: { lat: 0, lng: 0 }
    };
    this.price = data.price || 0; // Giá cơ bản
    this.priceByHour = data.priceByHour || {}; // Giá theo giờ cụ thể { '8-10': 200000, '10-12': 150000 }
    this.amenities = data.amenities || []; // ['parking', 'shower', 'lighting', 'water']
    this.facilities = data.facilities || data.amenities || []; // Đọc facilities hoặc amenities từ Firestore
    this.images = data.images || [];
    this.operatingHours = data.operatingHours || {
      monday: { open: '06:00', close: '22:00' },
      tuesday: { open: '06:00', close: '22:00' },
      wednesday: { open: '06:00', close: '22:00' },
      thursday: { open: '06:00', close: '22:00' },
      friday: { open: '06:00', close: '22:00' },
      saturday: { open: '06:00', close: '22:00' },
      sunday: { open: '06:00', close: '22:00' }
    };
    this.status = data.status || 'active'; // 'active', 'inactive', 'maintenance'
    this.rating = data.rating || 0; // Đánh giá trung bình
    this.reviewCount = data.reviewCount || 0; // Số lượng đánh giá
    this.cancellationPolicy = data.cancellationPolicy || ''; // Chính sách hủy đặt sân
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Tạo/Cập nhật sân trong Firestore
   * @returns {Promise<string>} - ID của sân
   */
  async save() {
    try {
      const courtData = {
        name: this.name,
        description: this.description,
        type: this.type,
        sport: this.sport,
        ownerId: this.ownerId,
        address: this.address,
        price: this.price,
        priceByHour: this.priceByHour,
        amenities: this.amenities,
        facilities: this.facilities,
        images: this.images,
        operatingHours: this.operatingHours,
        status: this.status,
        rating: this.rating,
        reviewCount: this.reviewCount,
        cancellationPolicy: this.cancellationPolicy,
        updatedAt: new Date()
      };

      if (this.id) {
        // Cập nhật sân
        await getCollection(courtCollection).doc(this.id).update(courtData);
        return this.id;
      } else {
        // Tạo sân mới
        courtData.createdAt = new Date();
        const docRef = await getCollection(courtCollection).add(courtData);
        this.id = docRef.id;
        return docRef.id;
      }
    } catch (error) {
      console.error('Lỗi khi lưu sân:', error);
      throw error;
    }
  }

  /**
   * Tìm sân theo ID
   * @param {string} id - ID của sân
   * @returns {Promise<Court>} - Đối tượng Court
   */
  static async findById(id) {
    try {
      const doc = await getCollection(courtCollection).doc(id).get();
      if (!doc.exists) {
        return null;
      }
      
      const courtData = doc.data();
      const court = new Court({ id: doc.id, ...courtData });
      
      // Fetch owner info nếu có ownerId
      if (courtData.ownerId) {
        try {
          const User = require('./User');
          const owner = await User.findById(courtData.ownerId);
          if (owner) {
            court.owner = {
              name: owner.displayName || owner.email?.split('@')[0] || 'Chưa có tên',
              phone: owner.phoneNumber || 'Chưa có số điện thoại',
              email: owner.email
            };
          }
        } catch (ownerError) {
          console.error('Lỗi khi lấy thông tin chủ sân:', ownerError);
          court.owner = {
            name: 'Chưa có tên',
            phone: 'Chưa có số điện thoại'
          };
        }
      }
      
      return court;
    } catch (error) {
      console.error('Lỗi khi tìm sân:', error);
      throw error;
    }
  }

  /**
   * Tìm sân theo chủ sở hữu
   * @param {string} ownerId - ID của chủ sân
   * @returns {Promise<Array<Court>>} - Danh sách sân
   */
  static async findByOwnerId(ownerId) {
    try {
      const snapshot = await getCollection(courtCollection)
        .where('ownerId', '==', ownerId)
        .get();

      return snapshot.docs.map(doc => new Court({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Lỗi khi tìm sân theo chủ sở hữu:', error);
      throw error;
    }
  }

  /**
   * Cập nhật thông tin sân
   * @param {Object} data - Dữ liệu cập nhật
   * @returns {Promise<Court>} - Đối tượng Court đã cập nhật
   */
  async update(data) {
    try {
      const courtData = {
        ...data,
        updatedAt: new Date()
      };

      await getCollection(courtCollection).doc(this.id).update(courtData);
      return new Court({ id: this.id, ...this, ...data });
    } catch (error) {
      console.error('Lỗi khi cập nhật sân:', error);
      throw error;
    }
  }

  /**
   * Xóa sân
   * @returns {Promise<void>}
   */
  async delete() {
    try {
      await getCollection(courtCollection).doc(this.id).delete();
    } catch (error) {
      console.error('Lỗi khi xóa sân:', error);
      throw error;
    }
  }

  /**
   * Tìm tất cả sân
   * @param {Object} options - Các tùy chọn tìm kiếm
   * @returns {Promise<Array<Court>>} - Danh sách sân
   */
  static async findAll(options = {}) {
    try {
      let query = getCollection(courtCollection);

      // Lọc theo loại sân
      if (options.type) {
        query = query.where('type', '==', options.type);
      }

      // Lọc theo trạng thái
      if (options.status) {
        query = query.where('status', '==', options.status);
      }

      // Lọc theo giá
      if (options.minPrice) {
        query = query.where('price', '>=', options.minPrice);
      }
      if (options.maxPrice) {
        query = query.where('price', '<=', options.maxPrice);
      }

      // Sắp xếp
      if (options.sortBy) {
        query = query.orderBy(options.sortBy, options.sortOrder || 'asc');
      }

      // Giới hạn số lượng
      if (options.limit) {
        query = query.limit(options.limit);
      }

      const snapshot = await query.get();
      return snapshot.docs.map(doc => new Court({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Lỗi khi tìm tất cả sân:', error);
      throw error;
    }
  }

  /**
   * Tìm kiếm sân theo các tiêu chí
   * @param {Object} criteria - Các tiêu chí tìm kiếm
   * @returns {Promise<Array<Court>>} - Danh sách sân thỏa mãn
   */
  static async search(criteria = {}) {
    try {
      let query = getCollection(courtCollection);

      // Lọc theo loại sân
      if (criteria.type) {
        query = query.where('type', '==', criteria.type);
      }

      // Lọc theo trạng thái
      if (criteria.status) {
        query = query.where('status', '==', criteria.status);
      } else {
        // Mặc định chỉ lấy sân đang hoạt động
        query = query.where('status', '==', 'active');
      }

      // Lọc theo thành phố
      if (criteria.city) {
        query = query.where('address.city', '==', criteria.city);
      }

      // Lọc theo quận/huyện
      if (criteria.district) {
        query = query.where('address.district', '==', criteria.district);
      }

      // Lấy kết quả
      const snapshot = await query.get();
      const courts = snapshot.docs.map(doc => new Court({ id: doc.id, ...doc.data() }));

      // Lọc theo khoảng giá (thực hiện sau khi đã query do Firestore không hỗ trợ range filters trên nhiều trường)
      if (criteria.minPrice !== undefined || criteria.maxPrice !== undefined) {
        return courts.filter(court => {
          if (criteria.minPrice !== undefined && court.price < criteria.minPrice) {
            return false;
          }
          if (criteria.maxPrice !== undefined && court.price > criteria.maxPrice) {
            return false;
          }
          return true;
        });
      }

      // Lọc theo tiện ích
      if (criteria.amenities && Array.isArray(criteria.amenities) && criteria.amenities.length > 0) {
        return courts.filter(court => {
          return criteria.amenities.every(amenity => court.amenities.includes(amenity));
        });
      }

      return courts;
    } catch (error) {
      console.error('Lỗi khi tìm kiếm sân:', error);
      throw error;
    }
  }

  /**
   * Cập nhật đánh giá sân
   * @param {string} courtId - ID của sân
   * @param {number} newRating - Đánh giá mới
   * @returns {Promise<boolean>} - Kết quả cập nhật
   */
  static async updateRating(courtId, newRating) {
    try {
      const courtRef = getCollection(courtCollection).doc(courtId);
      const doc = await courtRef.get();

      if (!doc.exists) {
        throw new Error('Sân không tồn tại');
      }

      const courtData = doc.data();
      const currentReviewCount = courtData.reviewCount || 0;
      const currentRating = courtData.rating || 0;

      // Tính toán rating mới
      const totalRatingPoints = currentRating * currentReviewCount + newRating;
      const newReviewCount = currentReviewCount + 1;
      const updatedRating = totalRatingPoints / newReviewCount;

      await courtRef.update({
        rating: updatedRating,
        reviewCount: newReviewCount,
        updatedAt: new Date()
      });

      return true;
    } catch (error) {
      console.error('Lỗi khi cập nhật đánh giá sân:', error);
      throw error;
    }
  }

  /**
   * Cập nhật trạng thái sân
   * @param {string} courtId - ID của sân
   * @param {string} status - Trạng thái mới ('active', 'inactive', 'maintenance')
   * @returns {Promise<boolean>} - Kết quả cập nhật
   */
  static async updateStatus(courtId, status) {
    try {
      await getCollection(courtCollection).doc(courtId).update({
        status,
        updatedAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái sân:', error);
      throw error;
    }
  }

  async checkAvailability(date, startTime, endTime) {
    // Lấy tất cả booking của sân này trong ngày đó
    const bookingsRef = getCollection('bookings');
    const snapshot = await bookingsRef
      .where('courtId', '==', this.id)
      .where('date', '==', date)
      .get();

    for (const doc of snapshot.docs) {
      const booking = doc.data();
      // Nếu thời gian đặt mới giao với thời gian đã đặt
      if (
        !(endTime <= booking.startTime || startTime >= booking.endTime)
      ) {
        return false; // Đã có booking trùng
      }
    }
    return true; // Không trùng, có thể đặt
  }
}

module.exports = Court; 