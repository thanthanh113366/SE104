import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  Paper,
  Divider,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  Avatar,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import BookingServiceWrapper from '../../services/bookingServiceWrapper';

// Charts
import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';

// Icons
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import EventNoteIcon from '@mui/icons-material/EventNote';
import PaidIcon from '@mui/icons-material/Paid';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import ErrorIcon from '@mui/icons-material/Error';
import PersonIcon from '@mui/icons-material/Person';

const OwnerHome = () => {
  const { userDetails, currentUser } = useAuth();
  const navigate = useNavigate();
  
  // State for real data
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourts: 0,
    activeCourts: 0,
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    cancelledBookings: 0,
    totalRevenue: 0,
    recentBookings: []
  });

  useEffect(() => {
    if (currentUser) {
      fetchOwnerData();
    }
  }, [currentUser]);

  const fetchOwnerData = async () => {
    try {
      setLoading(true);
      
      // Lấy courts của owner từ Firebase
      let ownerCourts = [];
      try {
        const { db } = await import('../../firebase');
        const { collection, query, where, getDocs } = await import('firebase/firestore');
        
        const courtsQuery = query(
          collection(db, 'courts'),
          where('ownerId', '==', currentUser.uid)
        );
        
        const courtsSnapshot = await getDocs(courtsQuery);
        ownerCourts = courtsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (courtsError) {
        console.error('Error fetching courts:', courtsError);
      }

      // Lấy bookings của các sân của owner
      let ownerBookings = [];
      try {
        const { db } = await import('../../firebase');
        const { collection, query, where, getDocs, orderBy, limit } = await import('firebase/firestore');
        
        if (ownerCourts.length > 0) {
          const courtIds = ownerCourts.map(court => court.id);
          
          // Firebase không support array trong where nên phải query từng court
          for (const courtId of courtIds) {
            const bookingsQuery = query(
              collection(db, 'bookings'),
              where('courtId', '==', courtId),
              orderBy('createdAt', 'desc'),
              limit(20)
            );
            
            const bookingsSnapshot = await getDocs(bookingsQuery);
            const courtBookings = bookingsSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              courtName: ownerCourts.find(c => c.id === courtId)?.name || 'N/A'
            }));
            
            ownerBookings = [...ownerBookings, ...courtBookings];
          }
          
          // Sort lại theo createdAt
          ownerBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
      } catch (bookingsError) {
        console.error('Error fetching bookings:', bookingsError);
      }

      // Tính toán stats
      const pendingBookings = ownerBookings.filter(b => b.status === 'pending' || b.status === 'Chờ xác nhận').length;
      const confirmedBookings = ownerBookings.filter(b => b.status === 'confirmed' || b.status === 'Đã xác nhận').length;
      const cancelledBookings = ownerBookings.filter(b => b.status === 'cancelled' || b.status === 'rejected' || b.status === 'Đã hủy').length;
      
      // Tính tổng doanh thu từ các booking đã xác nhận
      const totalRevenue = ownerBookings
        .filter(b => b.status === 'confirmed' || b.status === 'Đã xác nhận')
        .reduce((sum, booking) => sum + (booking.totalPrice || booking.price || 0), 0);

      setStats({
        totalCourts: ownerCourts.length,
        activeCourts: ownerCourts.filter(c => c.status === 'active').length || ownerCourts.length,
        totalBookings: ownerBookings.length,
        pendingBookings,
        confirmedBookings,
        cancelledBookings,
        totalRevenue,
        recentBookings: ownerBookings.slice(0, 5) // 5 booking gần nhất
      });

    } catch (error) {
      console.error('Error fetching owner data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Dữ liệu biểu đồ trạng thái booking
  const bookingStatusData = [
    { id: 0, value: stats.pendingBookings, label: 'Chờ xác nhận', color: '#ff9800' },
    { id: 1, value: stats.confirmedBookings, label: 'Đã xác nhận', color: '#4caf50' },
    { id: 2, value: stats.cancelledBookings, label: 'Đã hủy', color: '#f44336' },
  ];

  // Format tiền VND
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
      .format(amount)
      .replace('₫', 'VNĐ');
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const formatTime = (time) => {
    if (!time) return 'N/A';
    return time;
  };
  
  // Icon trạng thái
  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
      case 'Đã xác nhận':
        return <CheckCircleIcon color="success" />;
      case 'pending':
      case 'Chờ xác nhận':
        return <PendingIcon color="warning" />;
      case 'cancelled':
      case 'rejected':
      case 'Đã hủy':
        return <ErrorIcon color="error" />;
      default:
        return <PendingIcon color="info" />;
    }
  };
  
  // Hiển thị trạng thái
  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed':
      case 'Đã xác nhận':
        return 'Đã xác nhận';
      case 'pending':
      case 'Chờ xác nhận':
        return 'Chờ xác nhận';
      case 'cancelled':
      case 'Đã hủy':
        return 'Đã hủy';
      case 'rejected':
        return 'Đã từ chối';
      default:
        return 'Không xác định';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Chào mừng */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Chào mừng, {userDetails?.displayName || 'Chủ sân'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Đây là bảng điều khiển quản lý sân thể thao của bạn
        </Typography>
      </Box>
      
      {/* Thống kê tổng quan */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <SportsSoccerIcon />
                </Avatar>
                <Typography variant="h6">Sân của bạn</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {stats.totalCourts}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stats.activeCourts} sân đang hoạt động
              </Typography>
              <Button 
                variant="text" 
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/owner/courts')}
                sx={{ mt: 2 }}
              >
                Quản lý sân
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <EventNoteIcon />
                </Avatar>
                <Typography variant="h6">Lịch đặt sân</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {stats.totalBookings}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stats.pendingBookings} đơn chờ xác nhận
              </Typography>
              <Button 
                variant="text" 
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/owner/bookings')}
                sx={{ mt: 2 }}
              >
                Xem lịch đặt
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <PaidIcon />
                </Avatar>
                <Typography variant="h6">Doanh thu</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {formatCurrency(stats.totalRevenue).replace('VNĐ', '')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tổng doanh thu đã xác nhận
              </Typography>
              <Button 
                variant="text" 
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/owner/bookings')}
                sx={{ mt: 2 }}
              >
                Xem báo cáo
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <PersonIcon />
                </Avatar>
                <Typography variant="h6">Khách hàng</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {stats.confirmedBookings}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Lượt đặt sân thành công
              </Typography>
              <Button 
                variant="text" 
                endIcon={<ArrowForwardIcon />}
                sx={{ mt: 2 }}
                onClick={() => navigate('/owner/bookings')}
              >
                Xem chi tiết
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Biểu đồ trạng thái đặt sân */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Trạng thái đặt sân
            </Typography>
            {stats.totalBookings > 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                <PieChart
                  series={[
                    {
                      data: bookingStatusData,
                      innerRadius: 60,
                      paddingAngle: 2,
                      cornerRadius: 4,
                    },
                  ]}
                  width={500}
                  height={300}
                />
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">
                  Chưa có đơn đặt sân nào
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Đơn đặt sân gần đây */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Đơn đặt sân gần đây
          </Typography>
          <Button 
            variant="outlined" 
            endIcon={<ArrowForwardIcon />}
            size="small"
            onClick={() => navigate('/owner/bookings')}
          >
            Xem tất cả
          </Button>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        {stats.recentBookings.length > 0 ? (
          <List>
            {stats.recentBookings.map((booking) => (
              <React.Fragment key={booking.id}>
                <ListItem
                  alignItems="flex-start"
                  secondaryAction={
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {formatCurrency(booking.totalPrice || booking.price || 0)}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        {getStatusIcon(booking.status)}
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          {getStatusText(booking.status)}
                        </Typography>
                      </Box>
                    </Box>
                  }
                >
                  <ListItemAvatar>
                    <Avatar>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={booking.renterName || booking.userName || 'Khách hàng'}
                    secondary={
                      <React.Fragment>
                        <Typography component="span" variant="body2" color="text.primary">
                          {booking.courtName}
                        </Typography>
                        {` — ${formatDate(booking.date)}, ${formatTime(booking.startTime)}-${formatTime(booking.endTime)}`}
                      </React.Fragment>
                    }
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              Chưa có đơn đặt sân nào. Hãy thêm sân để bắt đầu nhận booking!
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default OwnerHome; 