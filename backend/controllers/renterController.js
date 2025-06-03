const { Court, Booking } = require('../models');
const { getCollection } = require('../config/db');

/**
 * @desc    Lấy thống kê dashboard cho Renter
 * @route   GET /api/renter/dashboard/stats
 * @access  Private (Renter)
 */
const getDashboardStats = async (req, res) => {
  try {
    const renterId = req.user.uid;
    console.log('Renter đang lấy dashboard stats cho renterId:', renterId);

    // Lấy booking của renter
    const bookingsRef = getCollection('bookings');
    const renterBookingsSnapshot = await bookingsRef
      .where('renterId', '==', renterId)
      .get();
    
    const renterBookings = renterBookingsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const totalBookings = renterBookings.length;
    const pendingBookings = renterBookings.filter(booking => booking.status === 'pending').length;
    const confirmedBookings = renterBookings.filter(booking => booking.status === 'confirmed' || booking.status === 'completed').length;
    const cancelledBookings = renterBookings.filter(booking => booking.status === 'cancelled').length;

    // Tính tổng tiền đã chi
    const completedBookings = renterBookings.filter(booking => booking.status === 'completed');
    const totalSpent = completedBookings.reduce((total, booking) => total + (booking.totalPrice || 0), 0);

    // Chi tiêu tháng này và tháng trước
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const thisMonthBookings = completedBookings.filter(booking => {
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
      
      return date >= startOfThisMonth;
    });

    const lastMonthBookings = completedBookings.filter(booking => {
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
      
      return date >= startOfLastMonth && date <= endOfLastMonth;
    });

    const thisMonthSpent = thisMonthBookings.reduce((total, booking) => total + (booking.totalPrice || 0), 0);
    const lastMonthSpent = lastMonthBookings.reduce((total, booking) => total + (booking.totalPrice || 0), 0);

    // Lấy lịch đặt sắp tới (trong 7 ngày tới)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const upcomingBookings = renterBookings
      .filter(booking => {
        if (booking.status !== 'confirmed') return false;
        
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
        
        return date >= new Date() && date <= nextWeek;
      })
      .sort((a, b) => {
        const dateA = a.date.toDate ? a.date.toDate() : new Date(a.date);
        const dateB = b.date.toDate ? b.date.toDate() : new Date(b.date);
        return dateA - dateB;
      })
      .slice(0, 5);

    // Lấy thông tin sân cho upcoming bookings
    const upcomingBookingsWithCourtInfo = await Promise.all(
      upcomingBookings.map(async (booking) => {
        try {
          const court = await Court.findById(booking.courtId);
          return {
            id: booking.id,
            courtName: court ? court.name : 'Sân không xác định',
            courtType: court ? court.sport || court.type : 'football',
            time: `${booking.startTime} - ${booking.endTime}`,
            date: booking.date,
            status: booking.status,
            amount: booking.totalPrice || 0
          };
        } catch (error) {
          console.error('Error getting court info for booking:', booking.id, error);
          return {
            id: booking.id,
            courtName: 'Sân không xác định',
            courtType: 'football',
            time: `${booking.startTime} - ${booking.endTime}`,
            date: booking.date,
            status: booking.status,
            amount: booking.totalPrice || 0
          };
        }
      })
    );

    // Thống kê loại sân đã đặt
    const courtTypes = {};
    for (const booking of renterBookings) {
      try {
        const court = await Court.findById(booking.courtId);
        const type = court ? (court.sport || court.type || 'football') : 'football';
        courtTypes[type] = (courtTypes[type] || 0) + 1;
      } catch (error) {
        console.error('Error getting court type for booking:', booking.id, error);
        courtTypes['football'] = (courtTypes['football'] || 0) + 1;
      }
    }

    const stats = {
      bookings: {
        total: totalBookings,
        pending: pendingBookings,
        confirmed: confirmedBookings,
        cancelled: cancelledBookings
      },
      spending: {
        total: totalSpent,
        thisMonth: thisMonthSpent,
        lastMonth: lastMonthSpent
      },
      upcomingBookings: upcomingBookingsWithCourtInfo,
      courtTypes
    };

    console.log('Renter dashboard stats:', stats);

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Lỗi khi lấy renter dashboard stats:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

module.exports = {
  getDashboardStats
}; 