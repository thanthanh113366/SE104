import React from 'react';
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
  const { userDetails } = useAuth();
  const navigate = useNavigate();
  
  // Dữ liệu mẫu
  const stats = {
    totalCourts: 5,
    activeCourts: 4,
    totalBookings: 28,
    pendingBookings: 3,
    confirmedBookings: 22,
    cancelledBookings: 3,
    totalRevenue: 12500000,
    lastWeekRevenue: 2800000,
    thisWeekRevenue: 3200000,
    revenueChange: 14.3, // phần trăm thay đổi
  };
  
  // Dữ liệu biểu đồ
  const bookingStatusData = [
    { id: 0, value: stats.pendingBookings, label: 'Chờ xác nhận', color: '#ff9800' },
    { id: 1, value: stats.confirmedBookings, label: 'Đã xác nhận', color: '#4caf50' },
    { id: 2, value: stats.cancelledBookings, label: 'Đã hủy', color: '#f44336' },
  ];
  
  // Dữ liệu biểu đồ doanh thu theo ngày trong tuần
  const revenueData = [
    { day: 'T2', revenue: 450000 },
    { day: 'T3', revenue: 380000 },
    { day: 'T4', revenue: 520000 },
    { day: 'T5', revenue: 420000 },
    { day: 'T6', revenue: 580000 },
    { day: 'T7', revenue: 650000 },
    { day: 'CN', revenue: 500000 },
  ];
  
  // Dữ liệu đặt sân gần đây
  const recentBookings = [
    { id: 'b1', courtName: 'Sân bóng đá Mini A', customerName: 'Nguyễn Văn A', time: '18:00 - 20:00', date: '15/05/2023', status: 'confirmed', amount: 600000 },
    { id: 'b2', courtName: 'Sân cầu lông số 2', customerName: 'Trần Thị B', time: '07:00 - 09:00', date: '16/05/2023', status: 'pending', amount: 240000 },
    { id: 'b3', courtName: 'Sân bóng rổ', customerName: 'Lê Văn C', time: '15:30 - 17:00', date: '16/05/2023', status: 'confirmed', amount: 350000 },
    { id: 'b4', courtName: 'Sân bóng đá Mini B', customerName: 'Phạm Văn D', time: '19:00 - 21:00', date: '17/05/2023', status: 'cancelled', amount: 600000 },
  ];
  
  // Format tiền VND
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
      .format(amount)
      .replace('₫', 'VNĐ');
  };
  
  // Icon trạng thái
  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircleIcon color="success" />;
      case 'pending':
        return <PendingIcon color="warning" />;
      case 'cancelled':
        return <ErrorIcon color="error" />;
      default:
        return <PendingIcon color="info" />;
    }
  };
  
  // Hiển thị trạng thái
  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed':
        return 'Đã xác nhận';
      case 'pending':
        return 'Chờ xác nhận';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return 'Không xác định';
    }
  };
  
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
                {formatCurrency(stats.thisWeekRevenue).replace('VNĐ', '')}
              </Typography>
              <Typography variant="body2" color={stats.revenueChange >= 0 ? 'success.main' : 'error.main'}>
                {stats.revenueChange >= 0 ? '+' : ''}{stats.revenueChange}% so với tuần trước
              </Typography>
              <Button 
                variant="text" 
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/owner/revenue')}
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
                {recentBookings.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Khách hàng mới trong tuần
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
      
      {/* Biểu đồ */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Doanh thu theo ngày trong tuần
            </Typography>
            <BarChart
              xAxis={[{ scaleType: 'band', data: revenueData.map(item => item.day) }]}
              series={[{ data: revenueData.map(item => item.revenue), color: '#2e7d32' }]}
              height={300}
              margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
            />
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Trạng thái đặt sân
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80%' }}>
              <PieChart
                series={[
                  {
                    data: bookingStatusData,
                    innerRadius: 30,
                    paddingAngle: 2,
                    cornerRadius: 4,
                  },
                ]}
                width={300}
                height={200}
              />
            </Box>
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
        
        <List>
          {recentBookings.map((booking) => (
            <React.Fragment key={booking.id}>
              <ListItem
                alignItems="flex-start"
                secondaryAction={
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(booking.amount)}
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
                  primary={booking.customerName}
                  secondary={
                    <React.Fragment>
                      <Typography component="span" variant="body2" color="text.primary">
                        {booking.courtName}
                      </Typography>
                      {` — ${booking.date}, ${booking.time}`}
                    </React.Fragment>
                  }
                />
              </ListItem>
              <Divider variant="inset" component="li" />
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default OwnerHome; 