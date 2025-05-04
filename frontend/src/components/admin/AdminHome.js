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
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

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
  
  // Dữ liệu mẫu
  const stats = {
    totalUsers: 145,
    ownerUsers: 22,
    renterUsers: 120,
    adminUsers: 3,
    totalCourts: 38,
    activeCourts: 35,
    inactiveCourts: 3,
    totalBookings: 256,
    pendingBookings: 12,
    completedBookings: 220,
    cancelledBookings: 24
  };
  
  // Dữ liệu biểu đồ người dùng theo vai trò
  const userRoleData = [
    { id: 0, value: stats.renterUsers, label: 'Người thuê sân', color: '#2196f3' },
    { id: 1, value: stats.ownerUsers, label: 'Chủ sân', color: '#4caf50' },
    { id: 2, value: stats.adminUsers, label: 'Quản trị viên', color: '#f44336' },
  ];
  
  // Dữ liệu biểu đồ đặt sân theo trạng thái
  const bookingStatusData = [
    { id: 0, value: stats.pendingBookings, label: 'Chờ xác nhận', color: '#ff9800' },
    { id: 1, value: stats.completedBookings, label: 'Hoàn thành', color: '#4caf50' },
    { id: 2, value: stats.cancelledBookings, label: 'Đã hủy', color: '#f44336' },
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
  
  // Dữ liệu người dùng mới đăng ký
  const newUsers = [
    { id: 'user1', name: 'Nguyễn Văn A', email: 'nguyenvana@example.com', role: 'renter', registeredDate: '22/05/2023', status: 'active' },
    { id: 'user2', name: 'Trần Thị B', email: 'tranthib@example.com', role: 'owner', registeredDate: '21/05/2023', status: 'active' },
    { id: 'user3', name: 'Lê Văn C', email: 'levanc@example.com', role: 'renter', registeredDate: '20/05/2023', status: 'inactive' },
    { id: 'user4', name: 'Phạm Văn D', email: 'phamvand@example.com', role: 'renter', registeredDate: '19/05/2023', status: 'active' },
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
                {stats.totalUsers}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                +15 người dùng mới trong tháng
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
                {stats.totalCourts}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stats.activeCourts} sân đang hoạt động
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
                {stats.totalBookings}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stats.pendingBookings} đơn chờ xác nhận
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
                  <PeopleIcon />
                </Avatar>
                <Typography variant="h6">Chủ sân</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {stats.ownerUsers}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Quản lý {stats.totalCourts} sân
              </Typography>
              <Button 
                variant="text" 
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/admin/users')}
                sx={{ mt: 2 }}
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
              Người dùng đăng ký mới theo tháng
            </Typography>
            <BarChart
              xAxis={[{ scaleType: 'band', data: registrationData.map(item => item.month) }]}
              series={[{ data: registrationData.map(item => item.users), color: '#2196f3' }]}
              height={300}
              margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
            />
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
          {newUsers.map((user) => (
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
              <Divider variant="inset" component="li" />
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default AdminHome; 