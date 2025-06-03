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
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/api';

// Charts
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';

// Icons
import PeopleIcon from '@mui/icons-material/People';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import EventNoteIcon from '@mui/icons-material/EventNote';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PendingIcon from '@mui/icons-material/Pending';

const AdminHome = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Lấy dữ liệu dashboard
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await adminService.getDashboardStats();
        console.log('Dashboard stats response:', response.data);
        
        if (response.data && response.data.stats) {
          setStats(response.data.stats);
        } else {
          setError('Không thể lấy dữ liệu thống kê');
        }
      } catch (err) {
        console.error('Lỗi khi lấy dashboard stats:', err);
        setError('Không thể tải dữ liệu dashboard: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);
  
  // Hiển thị loading
  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6">Đang tải dữ liệu...</Typography>
        </Box>
      </Box>
    );
  }
  
  // Hiển thị lỗi
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Thử lại
        </Button>
      </Box>
    );
  }
  
  // Dữ liệu biểu đồ người dùng theo vai trò
  const userRoleData = [
    { id: 0, value: stats.users.renter, label: 'Người thuê sân', color: '#2196f3' },
    { id: 1, value: stats.users.owner, label: 'Chủ sân', color: '#4caf50' },
    { id: 2, value: stats.users.admin, label: 'Quản trị viên', color: '#f44336' },
  ];
  
  // Dữ liệu biểu đồ đặt sân theo trạng thái
  const bookingStatusData = [
    { id: 0, value: stats.bookings.pending, label: 'Chờ xác nhận', color: '#ff9800' },
    { id: 1, value: stats.bookings.confirmed, label: 'Hoàn thành', color: '#4caf50' },
    { id: 2, value: stats.bookings.cancelled, label: 'Đã hủy', color: '#f44336' },
  ];
  
  // Dữ liệu biểu đồ đăng ký theo thời gian
  const registrationData = [
    { month: 'T1', users: 8 },
    { month: 'T2', users: 12 },
    { month: 'T3', users: 18 },
    { month: 'T4', users: 15 },
    { month: 'T5', users: 25 },
    { month: 'T6', users: 30 },
    { month: 'T7', users: 22 },
    { month: 'T8', users: 28 },
    { month: 'T9', users: 32 },
    { month: 'T10', users: 20 },
    { month: 'T11', users: 15 },
    { month: 'T12', users: 10 },
  ];
  
  // Hiển thị chip vai trò người dùng
  const getUserRoleChip = (role) => {
    switch (role) {
      case 'admin':
        return <Chip size="small" color="error" label="Admin" />;
      case 'owner':
        return <Chip size="small" color="success" label="Chủ sân" />;
      case 'renter':
        return <Chip size="small" color="primary" label="Người thuê sân" />;
      default:
        return <Chip size="small" label={role} />;
    }
  };
  
  // Hiển thị chip trạng thái người dùng
  const getUserStatusChip = (status) => {
    switch (status) {
      case 'active':
        return <Chip size="small" color="success" icon={<CheckCircleIcon />} label="Hoạt động" />;
      case 'inactive':
        return <Chip size="small" color="error" icon={<ErrorIcon />} label="Tạm khóa" />;
      case 'pending':
        return <Chip size="small" color="warning" icon={<PendingIcon />} label="Chờ xác minh" />;
      default:
        return <Chip size="small" label={status} />;
    }
  };
  
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Thống kê tổng quan */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <PeopleIcon />
                </Avatar>
                <Typography variant="h6">Người dùng</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {stats.users.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                +{stats.users.newInLast30Days} người dùng mới trong 30 ngày
              </Typography>
              <Button 
                variant="text" 
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/admin/users')}
                sx={{ mt: 2 }}
              >
                Quản lý
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <SportsSoccerIcon />
                </Avatar>
                <Typography variant="h6">Sân thể thao</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {stats.courts.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stats.courts.active} sân đang hoạt động
              </Typography>
              <Button 
                variant="text" 
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/admin/courts')}
                sx={{ mt: 2 }}
              >
                Quản lý
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
                <Typography variant="h6">Đặt sân</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {stats.bookings.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stats.bookings.pending} đơn chờ xác nhận
              </Typography>
              <Button 
                variant="text" 
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/admin/bookings')}
                sx={{ mt: 2 }}
              >
                Quản lý
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <EventNoteIcon />
                </Avatar>
                <Typography variant="h6">Tỷ lệ thành công</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {stats.bookings.total > 0 ? Math.round((stats.bookings.confirmed / stats.bookings.total) * 100) : 0}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tỷ lệ đặt sân thành công
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Biểu đồ */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Thống kê đặt sân theo trạng thái
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
              <PieChart
                series={[
                  {
                    data: bookingStatusData,
                    innerRadius: 30,
                    paddingAngle: 2,
                    cornerRadius: 4,
                  },
                ]}
                width={400}
                height={250}
              />
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Người dùng theo vai trò
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80%' }}>
              <PieChart
                series={[
                  {
                    data: userRoleData,
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
      
      {/* Người dùng mới */}
      {stats.recentUsers && stats.recentUsers.length > 0 && (
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Người dùng mới đăng ký
            </Typography>
            <Button 
              variant="outlined" 
              endIcon={<ArrowForwardIcon />}
              size="small"
              onClick={() => navigate('/admin/users')}
            >
              Xem tất cả
            </Button>
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          <List>
            {stats.recentUsers.map((user, index) => (
              <React.Fragment key={user.id}>
                <ListItem
                  alignItems="flex-start"
                  secondaryAction={
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                      {getUserRoleChip(user.role)}
                      {getUserStatusChip(user.status)}
                    </Box>
                  }
                >
                  <ListItemAvatar>
                    <Avatar>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={user.name}
                    secondary={
                      <React.Fragment>
                        <Typography component="span" variant="body2" color="text.primary">
                          {user.email}
                        </Typography>
                        {` — Đăng ký: ${user.registeredDate}`}
                      </React.Fragment>
                    }
                  />
                </ListItem>
                {index < stats.recentUsers.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default AdminHome; 