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

/**
 * @desc    Lấy tất cả người dùng (Admin only)
 * @route   GET /api/auth/users
 * @access  Admin
 */
const getAllUsers = async (req, res) => {
  try {
    // Kiểm tra quyền admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    const users = await User.findAll();
    
    // Lấy thêm thông tin từ Firebase Auth
    const usersWithAuthInfo = await Promise.all(
      users.map(async (user) => {
        try {
          const authUser = await admin.auth().getUser(user._id);
          return {
            id: user._id,
            uid: user._id,
            email: user.email,
            displayName: user.displayName,
            phoneNumber: user.phoneNumber,
            role: user.role,
            status: user.status,
            address: user.address,
            photoURL: user.photoURL,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            lastSignInTime: authUser.metadata?.lastSignInTime,
            creationTime: authUser.metadata?.creationTime,
            emailVerified: authUser.emailVerified
          };
        } catch (authError) {
          console.error(`Error getting auth info for user ${user._id}:`, authError);
          return {
            id: user._id,
            uid: user._id,
            email: user.email,
            displayName: user.displayName,
            phoneNumber: user.phoneNumber,
            role: user.role,
            status: user.status,
            address: user.address,
            photoURL: user.photoURL,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            lastSignInTime: null,
            creationTime: null,
            emailVerified: false
          };
        }
      })
    );

    res.json({
      users: usersWithAuthInfo,
      total: usersWithAuthInfo.length
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách người dùng:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * @desc    Cập nhật trạng thái người dùng (Admin only)
 * @route   PUT /api/auth/users/:userId/status
 * @access  Admin
 */
const updateUserStatus = async (req, res) => {
  try {
    // Kiểm tra quyền admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    const { userId } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['active', 'inactive', 'banned'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }

    // Không cho phép tự khóa tài khoản admin của chính mình
    if (userId === req.user.uid && status !== 'active') {
      return res.status(400).json({ message: 'Không thể thay đổi trạng thái tài khoản của chính mình' });
    }

    const success = await User.updateStatus(userId, status);
    if (!success) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Vô hiệu hóa token của user nếu bị khóa
    if (status === 'inactive' || status === 'banned') {
      try {
        await admin.auth().revokeRefreshTokens(userId);
      } catch (error) {
        console.error('Error revoking tokens:', error);
      }
    }

    res.json({ message: 'Cập nhật trạng thái thành công' });
  } catch (error) {
    console.error('Lỗi cập nhật trạng thái người dùng:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * @desc    Xóa người dùng (Admin only)
 * @route   DELETE /api/auth/users/:userId
 * @access  Admin
 */
const deleteUser = async (req, res) => {
  try {
    // Kiểm tra quyền admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    const { userId } = req.params;

    // Không cho phép xóa tài khoản admin của chính mình
    if (userId === req.user.uid) {
      return res.status(400).json({ message: 'Không thể xóa tài khoản của chính mình' });
    }

    // Xóa từ Firebase Auth
    try {
      await admin.auth().deleteUser(userId);
    } catch (authError) {
      console.error('Error deleting from Firebase Auth:', authError);
      // Tiếp tục xóa từ Firestore ngay cả khi Auth có lỗi
    }

    // Xóa từ Firestore
    const success = await User.delete(userId);
    if (!success) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    res.json({ message: 'Xóa người dùng thành công' });
  } catch (error) {
    console.error('Lỗi xóa người dùng:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * @desc    Lấy thống kê người dùng (Admin only)
 * @route   GET /api/auth/users/stats
 * @access  Admin
 */
const getUserStats = async (req, res) => {
  try {
    // Kiểm tra quyền admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    const users = await User.findAll();
    
    const stats = {
      total: users.length,
      byRole: {
        admin: users.filter(u => u.role === 'admin').length,
        owner: users.filter(u => u.role === 'owner').length,
        renter: users.filter(u => u.role === 'renter').length
      },
      byStatus: {
        active: users.filter(u => u.status === 'active').length,
        inactive: users.filter(u => u.status === 'inactive').length,
        banned: users.filter(u => u.status === 'banned').length
      }
    };

    res.json({ stats });
  } catch (error) {
    console.error('Lỗi lấy thống kê người dùng:', error);
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
  syncUser,
  getAllUsers,
  updateUserStatus,
  deleteUser,
  getUserStats
}; 