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
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

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
  const { currentUser } = useAuth();
  
  // State for real data
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    ownerUsers: 0,
    renterUsers: 0,
    adminUsers: 0,
    totalCourts: 0,
    activeCourts: 0,
    inactiveCourts: 0,
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    newUsers: []
  });

  useEffect(() => {
    if (currentUser) {
      fetchAdminData();
    }
  }, [currentUser]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // Lấy tất cả users từ Firebase
      let allUsers = [];
      try {
        const { db } = await import('../../firebase');
        const { collection, getDocs, orderBy, query, limit } = await import('firebase/firestore');
        
        const usersSnapshot = await getDocs(collection(db, 'users'));
        allUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Lấy 5 user mới nhất
        const recentUsersQuery = query(
          collection(db, 'users'),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const recentUsersSnapshot = await getDocs(recentUsersQuery);
        const newUsers = recentUsersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        setStats(prev => ({ ...prev, newUsers }));
      } catch (usersError) {
        console.error('Error fetching users:', usersError);
      }

      // Lấy tất cả courts từ Firebase
      let allCourts = [];
      try {
        const { db } = await import('../../firebase');
        const { collection, getDocs } = await import('firebase/firestore');
        
        const courtsSnapshot = await getDocs(collection(db, 'courts'));
        allCourts = courtsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (courtsError) {
        console.error('Error fetching courts:', courtsError);
      }

      // Lấy tất cả bookings từ Firebase
      let allBookings = [];
      try {
        const { db } = await import('../../firebase');
        const { collection, getDocs } = await import('firebase/firestore');
        
        const bookingsSnapshot = await getDocs(collection(db, 'bookings'));
        allBookings = bookingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (bookingsError) {
        console.error('Error fetching bookings:', bookingsError);
      }

      // Tính toán stats
      const ownerUsers = allUsers.filter(u => u.role === 'owner').length;
      const renterUsers = allUsers.filter(u => u.role === 'renter').length;
      const adminUsers = allUsers.filter(u => u.role === 'admin').length;
      
      const activeCourts = allCourts.filter(c => c.status === 'active' || !c.status).length;
      const inactiveCourts = allCourts.filter(c => c.status === 'inactive').length;
      
      const pendingBookings = allBookings.filter(b => 
        b.status === 'pending' || b.status === 'Chờ xác nhận'
      ).length;
      const completedBookings = allBookings.filter(b => 
        b.status === 'completed' || b.status === 'confirmed' || b.status === 'Đã xác nhận'
      ).length;
      const cancelledBookings = allBookings.filter(b => 
        b.status === 'cancelled' || b.status === 'Đã hủy'
      ).length;

      setStats({
        totalUsers: allUsers.length,
        ownerUsers,
        renterUsers,
        adminUsers,
        totalCourts: allCourts.length,
        activeCourts,
        inactiveCourts,
        totalBookings: allBookings.length,
        pendingBookings,
        completedBookings,
        cancelledBookings,
        newUsers: stats.newUsers
      });

    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Dữ liệu biểu đồ người dùng theo vai trò
  const userRoleData = [
    { id: 0, value: stats.renterUsers, label: 'Người thuê sân', color: '#2196f3' },
    { id: 1, value: stats.ownerUsers, label: 'Chủ sân', color: '#4caf50' },
    { id: 2, value: stats.adminUsers, label: 'Quản trị viên', color: '#f44336' },
  ];

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('vi-VN');
  };
  
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
        return <Chip size="small" color="success" icon={<CheckCircleIcon />} label="Hoạt động" />;
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
                {stats.newUsers.length} người dùng mới gần đây
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
      
      {/* Biểu đồ người dùng theo vai trò */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Người dùng theo vai trò
            </Typography>
            {stats.totalUsers > 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                <PieChart
                  series={[
                    {
                      data: userRoleData,
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
                  Chưa có dữ liệu người dùng
                </Typography>
              </Box>
            )}
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
        
        {stats.newUsers.length > 0 ? (
          <List>
            {stats.newUsers.map((user) => (
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
                    primary={user.displayName || user.email?.split('@')[0] || 'Người dùng'}
                    secondary={
                      <React.Fragment>
                        <Typography component="span" variant="body2" color="text.primary">
                          {user.email || 'N/A'}
                        </Typography>
                        {` — Đăng ký: ${formatDate(user.createdAt)}`}
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
              Chưa có người dùng mới đăng ký
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default AdminHome; 