const jwt = require('jsonwebtoken');
const { admin } = require('../config/firebaseAdmin');
const { User } = require('../models');

// JWT Secret (nên lưu trong biến môi trường)
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret';

/**
 * Middleware xác thực người dùng
 */
const authenticate = async (req, res, next) => {
  try {
    // Lấy token từ header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Không tìm thấy token xác thực' });
    }

    const token = authHeader.split(' ')[1];

    // Xác thực token bằng Firebase Admin SDK
    const decoded = await admin.auth().verifyIdToken(token);

    // Kiểm tra user tồn tại
    let user = await User.findById(decoded.uid);

    if (!user) {
      // Lấy thông tin đầy đủ từ Firebase Auth
      const firebaseUser = await admin.auth().getUser(decoded.uid);
      
      // Tự động tạo user với thông tin đầy đủ từ Firebase
      user = new User({
        _id: decoded.uid,
        email: decoded.email,
        displayName: decoded.name || firebaseUser.displayName || decoded.email.split('@')[0],
        phoneNumber: firebaseUser.phoneNumber || '',
        photoURL: firebaseUser.photoURL || '',
        role: 'renter' // Mặc định là renter, có thể thay đổi sau
      });
      await user.save(decoded.uid);
    } else {
      // Kiểm tra và cập nhật thông tin nếu thiếu
      let needUpdate = false;
      const firebaseUser = await admin.auth().getUser(decoded.uid);
      
      if (!user.displayName || user.displayName === user.email) {
        user.displayName = decoded.name || firebaseUser.displayName || decoded.email.split('@')[0];
        needUpdate = true;
      }
      
      if (!user.phoneNumber && firebaseUser.phoneNumber) {
        user.phoneNumber = firebaseUser.phoneNumber;
        needUpdate = true;
      }
      
      if (!user.photoURL && firebaseUser.photoURL) {
        user.photoURL = firebaseUser.photoURL;
        needUpdate = true;
      }
      
      if (needUpdate) {
        await user.save(decoded.uid);
      }
    }

    // Kiểm tra user có bị khóa không
    if (user.status === 'blocked') {
      return res.status(403).json({ message: 'Tài khoản của bạn đã bị khóa' });
    }

    // Thêm thông tin user vào request
    req.user = {
      uid: user._id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      phoneNumber: user.phoneNumber
    };

    next();
  } catch (error) {
    if (error.code === 'auth/argument-error' || error.code === 'auth/id-token-expired' || error.code === 'auth/invalid-id-token') {
      return res.status(401).json({ message: 'Token không hợp lệ' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token đã hết hạn' });
    }
    console.error('Lỗi xác thực:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * Middleware phân quyền admin
 */
const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Không có quyền truy cập' });
  }
  next();
};

/**
 * Middleware phân quyền owner
 */
const authorizeOwner = (req, res, next) => {
  if (req.user.role !== 'owner' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Không có quyền truy cập' });
  }
  next();
};

/**
 * Middleware phân quyền user
 */
const authorizeUser = (req, res, next) => {
  if (req.user.role !== 'user' && req.user.role !== 'owner' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Không có quyền truy cập' });
  }
  next();
};

/**
 * Middleware kiểm tra quyền sở hữu
 */
const checkOwnership = (model) => async (req, res, next) => {
  try {
    const resource = await model.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Không tìm thấy tài nguyên' });
    }

    // Admin có quyền truy cập tất cả
    if (req.user.role === 'admin') {
      return next();
    }

    // Kiểm tra quyền sở hữu
    if (resource.userId && resource.userId.toString() !== req.user.uid) {
      return res.status(403).json({ message: 'Không có quyền truy cập tài nguyên này' });
    }

    next();
  } catch (error) {
    console.error('Lỗi kiểm tra quyền sở hữu:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * Hàm kiểm tra quyền chủ sân đối với một sân cụ thể
 * @param {string} courtId - ID của sân
 * @param {string} userId - ID của người dùng
 */
const isCourtOwner = async (courtId, userId) => {
  try {
    const { Court } = require('../models');
    const court = await Court.findById(courtId);
    
    if (!court) {
      return false;
    }

    return court.ownerId === userId;
  } catch (error) {
    console.error('Lỗi kiểm tra quyền chủ sân:', error);
    return false;
  }
};

module.exports = {
  authenticate,
  authorizeAdmin,
  authorizeOwner,
  authorizeUser,
  checkOwnership,
  isCourtOwner
}; 