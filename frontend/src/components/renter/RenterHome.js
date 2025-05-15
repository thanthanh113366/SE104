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
  ListItemIcon,
  ListItemText,
  Stack
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import EventNoteIcon from '@mui/icons-material/EventNote';
import StarIcon from '@mui/icons-material/Star';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import SportsBasketballIcon from '@mui/icons-material/SportsBasketball';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';

const RenterHome = () => {
  const { userDetails } = useAuth();
  const navigate = useNavigate();
  
  // Các hình ảnh mẫu cho banner
  const bannerImages = [
    'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1000&auto=format&fit=crop'
  ];
  
  // Thông tin thể thao phổ biến
  const popularSports = [
    { name: 'Bóng đá', icon: <SportsSoccerIcon color="primary" />, count: 15 },
    { name: 'Bóng rổ', icon: <SportsBasketballIcon color="warning" />, count: 8 },
    { name: 'Tennis', icon: <SportsTennisIcon color="success" />, count: 12 }
  ];
  
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Welcome section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Chào mừng, {userDetails?.displayName || 'Người thuê sân'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Hôm nay bạn muốn tìm sân gì?
        </Typography>
      </Box>
      
      {/* Banner with call-to-action */}
      <Paper 
        sx={{ 
          p: 0, 
          mb: 4, 
          overflow: 'hidden',
          position: 'relative',
          borderRadius: 2,
          height: 200
        }}
      >
        <Box 
          sx={{ 
            backgroundImage: `url(${bannerImages[0]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            height: '100%',
            width: '100%',
            position: 'absolute',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0,0,0,0.4)'
            }
          }}
        />
        <Box 
          sx={{ 
            position: 'relative', 
            p: 3,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          <Typography variant="h5" sx={{ color: 'white', mb: 2, fontWeight: 'bold' }}>
            Tìm và đặt sân thể thao ngay hôm nay
          </Typography>
          <Typography variant="body1" sx={{ color: 'white', mb: 2 }}>
            Hàng trăm sân thể thao chất lượng cao đang chờ bạn
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<SearchIcon />}
            onClick={() => navigate('/renter/find-courts')}
            sx={{ width: 'fit-content' }}
          >
            Tìm sân ngay
          </Button>
        </Box>
      </Paper>
      
      {/* Quick access cards */}
      <Typography variant="h5" gutterBottom>Truy cập nhanh</Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              borderRadius: 2,
              cursor: 'pointer',
              transition: 'transform 0.3s',
              '&:hover': { transform: 'translateY(-5px)' }
            }}
            onClick={() => navigate('/renter/find-courts')}
          >
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <SearchIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6">Tìm kiếm sân</Typography>
              <Typography variant="body2" color="text.secondary">
                Tìm sân phù hợp với nhu cầu của bạn
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              borderRadius: 2,
              cursor: 'pointer',
              transition: 'transform 0.3s',
              '&:hover': { transform: 'translateY(-5px)' }
            }}
            onClick={() => navigate('/renter/bookings')}
          >
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <EventNoteIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6">Lịch đặt sân</Typography>
              <Typography variant="body2" color="text.secondary">
                Xem và quản lý lịch đặt sân của bạn
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              borderRadius: 2,
              cursor: 'pointer',
              transition: 'transform 0.3s',
              '&:hover': { transform: 'translateY(-5px)' }
            }}
            onClick={() => navigate('/renter/favorites')}
          >
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <BookmarkIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6">Sân yêu thích</Typography>
              <Typography variant="body2" color="text.secondary">
                Danh sách sân bạn đã lưu
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              borderRadius: 2,
              cursor: 'pointer',
              transition: 'transform 0.3s',
              '&:hover': { transform: 'translateY(-5px)' }
            }}
            onClick={() => navigate('/renter/ratings')}
          >
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <StarIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6">Đánh giá sân</Typography>
              <Typography variant="body2" color="text.secondary">
                Đánh giá sân bạn đã sử dụng
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Popular sports */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>Môn thể thao phổ biến</Typography>
            <Divider sx={{ mb: 2 }} />
            <List>
              {popularSports.map((sport, index) => (
                <ListItem 
                  key={index}
                  component="div"
                  onClick={() => navigate('/renter/find-courts')}
                  sx={{ borderRadius: 1, cursor: 'pointer' }}
                >
                  <ListItemIcon>
                    {sport.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={sport.name} 
                    secondary={`${sport.count} sân có sẵn`} 
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>Hoạt động gần đây</Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2">
                  Bạn đã đặt sân bóng đá Mini Thủ Đức
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ngày 25/11/2023, 18:00-19:30
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2">
                  Bạn đã đánh giá sân cầu lông Tân Bình
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Đánh giá: 4.5/5 sao
                </Typography>
              </Box>
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => navigate('/renter/bookings')}
                sx={{ alignSelf: 'flex-start', mt: 1 }}
              >
                Xem tất cả hoạt động
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RenterHome; 