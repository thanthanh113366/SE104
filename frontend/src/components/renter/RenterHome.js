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
  ListItemIcon,
  ListItemText,
  Stack,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import BookingServiceWrapper from '../../services/bookingServiceWrapper';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import EventNoteIcon from '@mui/icons-material/EventNote';
import StarIcon from '@mui/icons-material/Star';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import SportsBasketballIcon from '@mui/icons-material/SportsBasketball';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';

const RenterHome = () => {
  const { userDetails, currentUser } = useAuth();
  const navigate = useNavigate();
  
  // State for real data
  const [loading, setLoading] = useState(true);
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  
  // Các hình ảnh mẫu cho banner
  const bannerImages = [
    'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1000&auto=format&fit=crop'
  ];

  useEffect(() => {
    if (currentUser) {
      fetchDashboardData();
    }
  }, [currentUser]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Lấy recent bookings từ API
      try {
        const bookingsResponse = await BookingServiceWrapper.getUserBookings(currentUser.uid);
        if (bookingsResponse && bookingsResponse.bookings) {
          // Lấy 3 booking gần nhất
          const sortedBookings = bookingsResponse.bookings
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 3);
          setRecentBookings(sortedBookings);
        }
      } catch (bookingError) {
        console.error('Error fetching recent bookings:', bookingError);
      }

      // Lấy recent reviews từ Firebase
      try {
        const { db } = await import('../../firebase');
        const { collection, query, where, orderBy, limit, getDocs } = await import('firebase/firestore');
        
        const reviewsQuery = query(
          collection(db, 'reviews'),
          where('userId', '==', currentUser.uid),
          orderBy('createdAt', 'desc'),
          limit(2)
        );
        
        const reviewsSnapshot = await getDocs(reviewsQuery);
        const reviews = reviewsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setRecentReviews(reviews);
      } catch (reviewError) {
        console.error('Error fetching recent reviews:', reviewError);
      }

             
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const formatTime = (time) => {
    if (!time) return 'N/A';
    return time;
  };
  
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
      
      {/* Recent Activities */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>Hoạt động gần đây</Typography>
            <Divider sx={{ mb: 2 }} />
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <Stack spacing={2}>
                {/* Recent bookings */}
                {recentBookings.slice(0, 1).map((booking) => (
                  <Box key={booking.id}>
                    <Typography variant="subtitle2">
                      Bạn đã đặt sân {booking.courtName || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Ngày {formatDate(booking.date)}, {formatTime(booking.startTime)}-{formatTime(booking.endTime)}
                    </Typography>
                  </Box>
                ))}
                
                {/* Recent reviews */}
                {recentReviews.slice(0, 1).map((review) => (
                  <Box key={review.id}>
                    <Typography variant="subtitle2">
                      Bạn đã đánh giá một sân
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Đánh giá: {review.rating}/5 sao - "{review.comment?.substring(0, 50)}..."
                    </Typography>
                  </Box>
                ))}
                
                {/* No activities message */}
                {recentBookings.length === 0 && recentReviews.length === 0 && (
                  <Typography color="text.secondary">
                    Chưa có hoạt động nào. Hãy bắt đầu đặt sân!
                  </Typography>
                )}
                
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => navigate('/renter/bookings')}
                  sx={{ alignSelf: 'flex-start', mt: 1 }}
                >
                  Xem tất cả hoạt động
                </Button>
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RenterHome; 