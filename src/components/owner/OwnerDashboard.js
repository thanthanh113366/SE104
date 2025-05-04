import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import EventIcon from '@mui/icons-material/Event';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const OwnerDashboard = () => {
  const { userDetails } = useAuth();
  const navigate = useNavigate();
  
  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">
          Xin chào, {userDetails?.displayName || 'Chủ sân'}
        </Typography>
        
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => navigate('/owner/courts/add')}
        >
          Thêm sân mới
        </Button>
      </Box>
      
      <Typography variant="h6" sx={{ mb: 3 }}>
        Bảng điều khiển Chủ sân
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            height: '100%',
            transition: 'transform 0.3s',
            '&:hover': { transform: 'translateY(-5px)' }
          }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <SportsSoccerIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" component="div">
                Sân của tôi
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Xem và quản lý danh sách sân của bạn
              </Typography>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/owner/courts')}
              >
                Xem sân
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            height: '100%',
            transition: 'transform 0.3s',
            '&:hover': { transform: 'translateY(-5px)' }
          }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <EventIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" component="div">
                Quản lý đặt sân
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Xem và quản lý danh sách đặt sân
              </Typography>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/owner/bookings')}
              >
                Xem đặt sân
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Thống kê nhanh
        </Typography>
        <Typography variant="body1">
          Hiện chưa có dữ liệu thống kê. Hãy thêm sân và bắt đầu nhận đặt sân.
        </Typography>
      </Box>
    </Box>
  );
};

export default OwnerDashboard; 