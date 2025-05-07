const { Support, User } = require('../models');
const { validationResult } = require('express-validator');

/**
 * @desc    Tạo ticket hỗ trợ mới
 * @route   POST /api/supports
 * @access  Private
 */
const createSupport = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, category, priority, attachments } = req.body;

    // Tạo ticket mới
    const support = new Support({
      userId: req.user.uid,
      title,
      description,
      category,
      priority,
      attachments,
      status: 'open'
    });

    await support.save();

    res.status(201).json({
      message: 'Tạo ticket hỗ trợ thành công',
      support
    });
  } catch (error) {
    console.error('Lỗi tạo ticket hỗ trợ:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * @desc    Lấy chi tiết ticket
 * @route   GET /api/supports/:id
 * @access  Private
 */
const getSupportById = async (req, res) => {
  try {
    const support = await Support.findById(req.params.id);
    if (!support) {
      return res.status(404).json({ message: 'Không tìm thấy ticket hỗ trợ' });
    }

    // Kiểm tra quyền xem
    if (support.userId !== req.user.uid && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền xem ticket này' });
    }

    res.json({ support });
  } catch (error) {
    console.error('Lỗi lấy chi tiết ticket:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * @desc    Lấy danh sách ticket của user
 * @route   GET /api/supports/user
 * @access  Private
 */
const getUserSupports = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category } = req.query;
    const query = { userId: req.user.uid };

    if (status) query.status = status;
    if (category) query.category = category;

    const supports = await Support.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Support.countDocuments(query);

    res.json({
      supports,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      totalSupports: total
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách ticket của user:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * @desc    Lấy danh sách ticket cho admin
 * @route   GET /api/supports/admin
 * @access  Private (Admin)
 */
const getAdminSupports = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category, priority } = req.query;
    const query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;

    const supports = await Support.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Support.countDocuments(query);

    res.json({
      supports,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      totalSupports: total
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách ticket cho admin:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * @desc    Cập nhật trạng thái ticket
 * @route   PUT /api/supports/:id/status
 * @access  Private (Admin)
 */
const updateSupportStatus = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status } = req.body;
    const support = await Support.findById(req.params.id);
    
    if (!support) {
      return res.status(404).json({ message: 'Không tìm thấy ticket hỗ trợ' });
    }

    // Kiểm tra quyền cập nhật
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền cập nhật trạng thái ticket' });
    }

    // Cập nhật trạng thái
    support.status = status;
    await support.save();

    res.json({
      message: 'Cập nhật trạng thái ticket thành công',
      support
    });
  } catch (error) {
    console.error('Lỗi cập nhật trạng thái ticket:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * @desc    Thêm phản hồi cho ticket
 * @route   POST /api/supports/:id/reply
 * @access  Private
 */
const addReply = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { message, attachments } = req.body;
    const support = await Support.findById(req.params.id);
    
    if (!support) {
      return res.status(404).json({ message: 'Không tìm thấy ticket hỗ trợ' });
    }

    // Kiểm tra quyền phản hồi
    if (support.userId !== req.user.uid && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền phản hồi ticket này' });
    }

    // Kiểm tra trạng thái ticket
    if (support.status === 'closed') {
      return res.status(400).json({ message: 'Không thể phản hồi ticket đã đóng' });
    }

    // Thêm phản hồi
    support.replies.push({
      userId: req.user.uid,
      message,
      attachments,
      createdAt: new Date()
    });

    // Cập nhật trạng thái nếu là phản hồi đầu tiên từ admin
    if (req.user.role === 'admin' && support.status === 'open') {
      support.status = 'in_progress';
    }

    await support.save();

    res.json({
      message: 'Thêm phản hồi thành công',
      support
    });
  } catch (error) {
    console.error('Lỗi thêm phản hồi:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * @desc    Đánh giá chất lượng hỗ trợ
 * @route   POST /api/supports/:id/rate
 * @access  Private
 */
const rateSupport = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rating, feedback } = req.body;
    const support = await Support.findById(req.params.id);
    
    if (!support) {
      return res.status(404).json({ message: 'Không tìm thấy ticket hỗ trợ' });
    }

    // Kiểm tra quyền đánh giá
    if (support.userId !== req.user.uid) {
      return res.status(403).json({ message: 'Không có quyền đánh giá ticket này' });
    }

    // Kiểm tra trạng thái ticket
    if (support.status !== 'closed') {
      return res.status(400).json({ message: 'Chỉ có thể đánh giá ticket đã đóng' });
    }

    // Kiểm tra đã đánh giá chưa
    if (support.rating) {
      return res.status(400).json({ message: 'Bạn đã đánh giá ticket này' });
    }

    // Thêm đánh giá
    support.rating = rating;
    support.feedback = feedback;
    await support.save();

    res.json({
      message: 'Đánh giá thành công',
      support
    });
  } catch (error) {
    console.error('Lỗi đánh giá hỗ trợ:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * @desc    Lấy thống kê hỗ trợ
 * @route   GET /api/supports/stats
 * @access  Private (Admin)
 */
const getSupportStats = async (req, res) => {
  try {
    const stats = await Support.aggregate([
      {
        $group: {
          _id: null,
          totalTickets: { $sum: 1 },
          openTickets: {
            $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] }
          },
          inProgressTickets: {
            $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
          },
          closedTickets: {
            $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] }
          },
          averageRating: { $avg: '$rating' },
          categoryDistribution: {
            $push: {
              category: '$category',
              count: 1
            }
          }
        }
      }
    ]);

    // Tính phân phối category
    const categoryStats = {};
    if (stats.length > 0) {
      stats[0].categoryDistribution.forEach(item => {
        if (categoryStats[item.category]) {
          categoryStats[item.category]++;
        } else {
          categoryStats[item.category] = 1;
        }
      });
    }

    res.json({
      totalTickets: stats.length > 0 ? stats[0].totalTickets : 0,
      openTickets: stats.length > 0 ? stats[0].openTickets : 0,
      inProgressTickets: stats.length > 0 ? stats[0].inProgressTickets : 0,
      closedTickets: stats.length > 0 ? stats[0].closedTickets : 0,
      averageRating: stats.length > 0 ? stats[0].averageRating : 0,
      categoryDistribution: categoryStats
    });
  } catch (error) {
    console.error('Lỗi lấy thống kê hỗ trợ:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

module.exports = {
  createSupport,
  getSupportById,
  getUserSupports,
  getAdminSupports,
  updateSupportStatus,
  addReply,
  rateSupport,
  getSupportStats
}; 