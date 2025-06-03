const { Court, Booking, User } = require('../models');
const { getCollection } = require('../config/db');

/**
 * @desc    Lấy thống kê dashboard cho Admin
 * @route   GET /api/admin/dashboard/stats
 * @access  Private (Admin)
 */
const getDashboardStats = async (req, res) => {
  try {
    // Kiểm tra quyền admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    console.log('Admin đang lấy dashboard stats...');

    // Lấy thống kê người dùng
    const usersRef = getCollection('users');
    const usersSnapshot = await usersRef.get();
    const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const totalUsers = users.length;
    const adminUsers = users.filter(user => user.role === 'admin').length;
    const ownerUsers = users.filter(user => user.role === 'owner').length;
    const renterUsers = users.filter(user => user.role === 'renter').length;

    // Lấy thống kê sân
    const courtsRef = getCollection('courts');
    const courtsSnapshot = await courtsRef.get();
    const courts = courtsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const totalCourts = courts.length;
    const activeCourts = courts.filter(court => court.status === 'active').length;
    const inactiveCourts = courts.filter(court => court.status === 'inactive').length;

    // Lấy thống kê booking
    const bookingsRef = getCollection('bookings');
    const bookingsSnapshot = await bookingsRef.get();
    const bookings = bookingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter(booking => booking.status === 'pending').length;
    const confirmedBookings = bookings.filter(booking => booking.status === 'confirmed' || booking.status === 'completed').length;
    const cancelledBookings = bookings.filter(booking => booking.status === 'cancelled').length;

    // Thống kê người dùng mới trong 30 ngày qua
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const newUsers = users.filter(user => {
      if (!user.createdAt) return false;
      const userCreatedAt = user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
      return userCreatedAt >= thirtyDaysAgo;
    });

    // Lấy người dùng mới gần đây (5 người)
    const recentUsers = users
      .filter(user => user.createdAt)
      .sort((a, b) => {
        const dateA = a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const dateB = b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return dateB - dateA;
      })
      .slice(0, 5)
      .map(user => ({
        id: user.id,
        name: user.displayName || user.name || 'Chưa có tên',
        email: user.email,
        role: user.role,
        registeredDate: user.createdAt.toDate ? user.createdAt.toDate().toLocaleDateString('vi-VN') : new Date(user.createdAt).toLocaleDateString('vi-VN'),
        status: user.status || 'active'
      }));

    const stats = {
      users: {
        total: totalUsers,
        admin: adminUsers,
        owner: ownerUsers,
        renter: renterUsers,
        newInLast30Days: newUsers.length
      },
      courts: {
        total: totalCourts,
        active: activeCourts,
        inactive: inactiveCourts
      },
      bookings: {
        total: totalBookings,
        pending: pendingBookings,
        confirmed: confirmedBookings,
        cancelled: cancelledBookings
      },
      recentUsers
    };

    console.log('Admin dashboard stats:', stats);

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Lỗi khi lấy admin dashboard stats:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

module.exports = {
  getDashboardStats
}; 