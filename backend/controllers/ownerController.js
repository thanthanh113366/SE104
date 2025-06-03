const { Court, Booking } = require('../models');
const { getCollection } = require('../config/db');

/**
 * @desc    Lấy thống kê dashboard cho Owner
 * @route   GET /api/owner/dashboard/stats
 * @access  Private (Owner)
 */
const getDashboardStats = async (req, res) => {
  try {
    const ownerId = req.user.uid;
    console.log('Owner đang lấy dashboard stats cho ownerId:', ownerId);

    // Lấy danh sách sân của owner
    const courts = await Court.findByOwnerId(ownerId);
    
    const totalCourts = courts.length;
    const activeCourts = courts.filter(court => court.status === 'active').length;
    const inactiveCourts = courts.filter(court => court.status === 'inactive').length;

    // Lấy booking của tất cả sân của owner
    const courtIds = courts.map(court => court.id);
    let allBookings = [];
    
    if (courtIds.length > 0) {
      const bookingsRef = getCollection('bookings');
      
      // Query bookings cho từng sân (vì Firestore không hỗ trợ array-contains-any với quá nhiều phần tử)
      for (const courtId of courtIds) {
        const courtBookingsSnapshot = await bookingsRef
          .where('courtId', '==', courtId)
          .get();
        
        const courtBookings = courtBookingsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        allBookings = allBookings.concat(courtBookings);
      }
    }

    const totalBookings = allBookings.length;
    const pendingBookings = allBookings.filter(booking => booking.status === 'pending').length;
    const confirmedBookings = allBookings.filter(booking => booking.status === 'confirmed' || booking.status === 'completed').length;
    const cancelledBookings = allBookings.filter(booking => booking.status === 'cancelled').length;

    // Tính doanh thu
    const completedBookings = allBookings.filter(booking => booking.status === 'completed');
    const totalRevenue = completedBookings.reduce((total, booking) => total + (booking.totalPrice || 0), 0);

    // Doanh thu tuần này và tuần trước
    const now = new Date();
    const startOfThisWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    startOfThisWeek.setHours(0, 0, 0, 0);
    
    const startOfLastWeek = new Date(startOfThisWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

    const thisWeekBookings = completedBookings.filter(booking => {
      const bookingDate = booking.date;
      if (!bookingDate) return false;
      
      let date;
      if (bookingDate.toDate) {
        date = bookingDate.toDate();
      } else if (typeof bookingDate === 'string') {
        date = new Date(bookingDate);
      } else {
        date = new Date(bookingDate);
      }
      
      return date >= startOfThisWeek;
    });

    const lastWeekBookings = completedBookings.filter(booking => {
      const bookingDate = booking.date;
      if (!bookingDate) return false;
      
      let date;
      if (bookingDate.toDate) {
        date = bookingDate.toDate();
      } else if (typeof bookingDate === 'string') {
        date = new Date(bookingDate);
      } else {
        date = new Date(bookingDate);
      }
      
      return date >= startOfLastWeek && date < startOfThisWeek;
    });

    const thisWeekRevenue = thisWeekBookings.reduce((total, booking) => total + (booking.totalPrice || 0), 0);
    const lastWeekRevenue = lastWeekBookings.reduce((total, booking) => total + (booking.totalPrice || 0), 0);
    
    const revenueChange = lastWeekRevenue > 0 ? ((thisWeekRevenue - lastWeekRevenue) / lastWeekRevenue * 100) : 0;

    // Booking gần đây (5 booking mới nhất)
    const recentBookings = allBookings
      .sort((a, b) => {
        const dateA = a.createdAt ? (a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt)) : new Date(0);
        const dateB = b.createdAt ? (b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt)) : new Date(0);
        return dateB - dateA;
      })
      .slice(0, 5)
      .map(booking => {
        const court = courts.find(c => c.id === booking.courtId);
        return {
          id: booking.id,
          courtName: court ? court.name : 'Sân không xác định',
          customerName: booking.renterName || 'Chưa có tên',
          time: `${booking.startTime} - ${booking.endTime}`,
          date: booking.date,
          status: booking.status,
          amount: booking.totalPrice || 0
        };
      });

    const stats = {
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
      revenue: {
        total: totalRevenue,
        thisWeek: thisWeekRevenue,
        lastWeek: lastWeekRevenue,
        change: revenueChange
      },
      recentBookings
    };

    console.log('Owner dashboard stats:', stats);

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Lỗi khi lấy owner dashboard stats:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

module.exports = {
  getDashboardStats
}; 