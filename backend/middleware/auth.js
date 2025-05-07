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

    // Xác thực token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Kiểm tra user tồn tại
    const user = await User.findById(decoded.uid);
    if (!user) {
      return res.status(401).json({ message: 'Người dùng không tồn tại' });
    }

    // Kiểm tra user có bị khóa không
    if (user.status === 'blocked') {
      return res.status(403).json({ message: 'Tài khoản của bạn đã bị khóa' });
    }

    // Thêm thông tin user vào request
    req.user = {
      uid: user._id,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
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