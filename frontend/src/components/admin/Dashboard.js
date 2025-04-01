import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Container,
  Button
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { userDetails, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error', error);
    }
  };

  return (
    <Container component="main" maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ width: '100%', padding: '40px' }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, color: '#673ab7' }}>
            Admin Dashboard
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 3 }}>
            Xin chào, {userDetails?.displayName || 'Admin'}! Bạn đang đăng nhập với tư cách quản trị viên.
          </Typography>
          
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={handleLogout}
            sx={{ mt: 2 }}
          >
            Đăng xuất
          </Button>
        </Box>
        
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Tính năng quản trị viên sẽ được phát triển:
          </Typography>
          
          <Typography component="ul" sx={{ pl: 2 }}>
            <li>Quản lý tất cả người dùng</li>
            <li>Quản lý tất cả các sân thể thao</li>
            <li>Xem và phê duyệt đăng ký chủ sân</li>
            <li>Xem báo cáo và thống kê</li>
            <li>Quản lý thanh toán và hóa đơn</li>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Dashboard; 