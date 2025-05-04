import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Button, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EventNoteIcon from '@mui/icons-material/EventNote';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const RenterDashboard = () => {
  const { userDetails } = useAuth();
  const navigate = useNavigate();
  
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Xin chào, {userDetails?.displayName || 'Người thuê sân'}
      </Typography>
      
      <Card sx={{ mb: 4, p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Tìm kiếm sân thể thao
        </Typography>
        
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField 
              fullWidth 
              placeholder="Nhập tên sân, địa điểm hoặc môn thể thao..."
              InputProps={{
                endAdornment: <SearchIcon color="action" />
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button 
              fullWidth 
              variant="contained" 
              onClick={() => navigate('/renter/search')}
              sx={{ py: 1.5 }}
            >
              Tìm kiếm
            </Button>
          </Grid>
        </Grid>
      </Card>
      
      <Typography variant="h6" sx={{ mb: 3 }}>
        Dịch vụ
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            height: '100%',
            transition: 'transform 0.3s',
            '&:hover': { transform: 'translateY(-5px)' }
          }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <SportsSoccerIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" component="div">
                Tìm sân thể thao
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Tìm kiếm sân theo địa điểm và thời gian
              </Typography>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/renter/search')}
              >
                Tìm sân
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            height: '100%',
            transition: 'transform 0.3s',
            '&:hover': { transform: 'translateY(-5px)' }
          }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <EventNoteIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" component="div">
                Lịch đặt sân
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Xem và quản lý lịch đặt sân của bạn
              </Typography>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/renter/bookings')}
              >
                Xem lịch
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            height: '100%',
            transition: 'transform 0.3s',
            '&:hover': { transform: 'translateY(-5px)' }
          }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <SportsSoccerIcon sx={{ fontSize: 60, color: 'secondary.main', mb: 2 }} />
              <Typography variant="h5" component="div">
                Sân yêu thích
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Xem danh sách sân bạn đã lưu
              </Typography>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/renter/favorites')}
              >
                Xem sân yêu thích
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Đặt sân gần đây
        </Typography>
        <Typography variant="body1">
          Bạn chưa có lịch sử đặt sân nào. Hãy tìm kiếm và đặt sân ngay!
        </Typography>
      </Box>
    </Box>
  );
};

export default RenterDashboard; 