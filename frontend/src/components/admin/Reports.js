import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db } from '../../firebase';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourts: 0,
    totalBookings: 0,
    activeBookings: 0,
    revenue: 0
  });
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Thống kê số lượng người dùng
        const usersQuery = query(collection(db, 'users'), limit(1000));
        const usersSnapshot = await getDocs(usersQuery);
        
        // Thống kê số lượng sân
        const courtsQuery = query(collection(db, 'courts'), limit(1000));
        const courtsSnapshot = await getDocs(courtsQuery);
        
        // Thống kê số lượng đặt sân
        const bookingsQuery = query(collection(db, 'bookings'), limit(1000));
        const bookingsSnapshot = await getDocs(bookingsQuery);
        
        // Thống kê số lượng đặt sân đang hoạt động
        const activeBookingsQuery = query(
          collection(db, 'bookings'), 
          where('status', '==', 'confirmed'),
          limit(1000)
        );
        const activeBookingsSnapshot = await getDocs(activeBookingsQuery);
        
        // Tính tổng doanh thu
        let totalRevenue = 0;
        bookingsSnapshot.forEach(doc => {
          const booking = doc.data();
          if (booking.status === 'completed' && booking.totalPrice) {
            totalRevenue += booking.totalPrice;
          }
        });
        
        setStats({
          totalUsers: usersSnapshot.size,
          totalCourts: courtsSnapshot.size,
          totalBookings: bookingsSnapshot.size,
          activeBookings: activeBookingsSnapshot.size,
          revenue: totalRevenue
        });
      } catch (err) {
        console.error('Lỗi khi lấy thông tin thống kê:', err);
        setError('Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);
  
  // Format tiền VND
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount).replace('₫', 'VNĐ');
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Báo cáo thống kê
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Tổng số người dùng
              </Typography>
              <Typography variant="h4" component="div">
                {stats.totalUsers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Tổng số sân
              </Typography>
              <Typography variant="h4" component="div">
                {stats.totalCourts}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Lượt đặt sân
              </Typography>
              <Typography variant="h4" component="div">
                {stats.totalBookings}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Đặt sân đang hoạt động
              </Typography>
              <Typography variant="h4" component="div">
                {stats.activeBookings}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Tổng doanh thu
              </Typography>
              <Typography variant="h4" component="div">
                {formatCurrency(stats.revenue)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Typography variant="body2" sx={{ mt: 3, textAlign: 'center', fontStyle: 'italic', color: 'text.secondary' }}>
        *Dữ liệu thống kê được cập nhật theo thời gian thực
      </Typography>
    </Box>
  );
};

export default Reports; 