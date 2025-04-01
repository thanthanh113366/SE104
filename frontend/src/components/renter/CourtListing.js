import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Container,
  Button,
  Grid
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const CourtListing = () => {
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
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, color: '#4caf50' }}>
            Danh Sách Sân Thể Thao
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 3 }}>
            Xin chào, {userDetails?.displayName || 'Renter'}! Bạn đang đăng nhập với tư cách người thuê sân.
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
            Tính năng người thuê sẽ được phát triển:
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography component="ul" sx={{ pl: 2 }}>
                <li>Tìm kiếm sân thể thao theo vị trí, loại, giá cả</li>
                <li>Xem thông tin chi tiết và đánh giá về sân</li>
                <li>Đặt sân và thanh toán trực tuyến</li>
                <li>Xem lịch sử đặt sân và thanh toán</li>
                <li>Quản lý thông tin cá nhân</li>
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body1" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                Hiện tại chưa có sân thể thao nào được đăng ký. Vui lòng quay lại sau.
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default CourtListing; 