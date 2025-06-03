const { admin } = require('../config/firebaseAdmin');
const { User } = require('../models');
const { validationResult } = require('express-validator');

/**
 * @desc    Đăng ký tài khoản mới
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name, role } = req.body;

    // Kiểm tra email đã tồn tại
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }

    // Tạo user trong Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name
    });

    // Tạo user trong Firestore
    const user = new User({
      uid: userRecord.uid,
      email,
      displayName: name,
      role: role || 'renter' // Mặc định là renter nếu không chỉ định
    });

    await user.save();

    res.status(201).json({
      message: 'Đăng ký thành công',
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Lỗi đăng ký:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * @desc    Đăng nhập
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Xác thực với Firebase Auth
    const userCredential = await admin.auth().getUserByEmail(email);
    
    // Lấy thông tin user từ Firestore
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản' });
    }

    // Tạo custom token
    const token = await admin.auth().createCustomToken(user.uid);

    res.json({
      message: 'Đăng nhập thành công',
      token,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
  }
};

/**
 * @desc    Lấy thông tin profile của người dùng
 * @route   GET /api/auth/profile
 * @access  Private
 */
const getProfile = async (req, res) => {
  try {
    const user = await User.findByUid(req.user.uid);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin người dùng' });
    }

    res.json({
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        phoneNumber: user.phoneNumber,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Lỗi lấy profile:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * @desc    Cập nhật thông tin profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res) => {
  try {
    const { displayName, phoneNumber } = req.body;
    const user = await User.findByUid(req.user.uid);

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin người dùng' });
    }

    // Cập nhật thông tin trong Firebase Auth
    await admin.auth().updateUser(user.uid, {
      displayName: displayName || user.displayName
    });

    // Cập nhật thông tin trong Firestore
    if (displayName) user.displayName = displayName;
    if (phoneNumber) user.phoneNumber = phoneNumber;

    await user.save();

    res.json({
      message: 'Cập nhật profile thành công',
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        phoneNumber: user.phoneNumber
      }
    });
  } catch (error) {
    console.error('Lỗi cập nhật profile:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * @desc    Đổi mật khẩu
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
const changePassword = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    const user = await User.findByUid(req.user.uid);

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin người dùng' });
    }

    // Cập nhật mật khẩu trong Firebase Auth
    await admin.auth().updateUser(user.uid, {
      password: newPassword
    });

    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    console.error('Lỗi đổi mật khẩu:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * @desc    Đăng xuất
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = async (req, res) => {
  try {
    // Trong Firebase Auth, việc đăng xuất được xử lý ở phía client
    // Server chỉ cần trả về response thành công
    res.json({ message: 'Đăng xuất thành công' });
  } catch (error) {
    console.error('Lỗi đăng xuất:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * @desc    Tạo hoặc cập nhật user từ Firebase token
 * @route   POST /api/auth/sync-user  
 * @access  Private
 */
const syncUser = async (req, res) => {
  try {
    const { uid, email, name, role } = req.body;

    // Kiểm tra user đã tồn tại chưa
    let user = await User.findById(uid);
    
    if (!user) {
      // Tạo user mới
      user = new User({
        _id: uid,
        email: email,
        displayName: name,
        role: role || 'renter'
      });
      await user.save(uid);
    }

    res.json({
      message: 'Đồng bộ user thành công',
      user: {
        uid: user._id,
        email: user.email,
        displayName: user.displayName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Lỗi đồng bộ user:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  syncUser
}; 