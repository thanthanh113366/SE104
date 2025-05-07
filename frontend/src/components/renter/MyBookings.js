import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  Tabs, 
  Tab, 
  Chip, 
  Divider, 
  Paper,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';

// Icons
import SportsIcon from '@mui/icons-material/Sports';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventIcon from '@mui/icons-material/Event';
import PaidIcon from '@mui/icons-material/Paid';
import RefreshIcon from '@mui/icons-material/Refresh';

// Demo data
const DEMO_BOOKINGS = [
  {
    id: 'booking1',
    courtId: 'court1',
    courtName: 'Sân bóng đá Mini Thủ Đức',
    courtImage: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?q=80&w=800&auto=format&fit=crop',
    address: '123 Võ Văn Ngân, Thủ Đức, TP.HCM',
    sport: 'Bóng đá',
    date: '2023-11-25',
    time: '18:00-19:30',
    price: 350000,
    status: 'upcoming', // upcoming, completed, cancelled
    paymentMethod: 'cash',
    notes: '',
    createdAt: '2023-11-20T08:30:00Z'
  },
  {
    id: 'booking2',
    courtId: 'court2',
    courtName: 'Sân cầu lông Tân Bình',
    courtImage: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=800&auto=format&fit=crop',
    address: '456 Hoàng Văn Thụ, Tân Bình, TP.HCM',
    sport: 'Cầu lông',
    date: '2023-11-20',
    time: '07:00-08:00',
    price: 120000,
    status: 'completed',
    paymentMethod: 'banking',
    notes: 'Mang vợt riêng',
    createdAt: '2023-11-15T10:15:00Z'
  },
  {
    id: 'booking3',
    courtId: 'court3',
    courtName: 'Sân bóng rổ Quận 1',
    courtImage: 'https://images.unsplash.com/photo-1505666287802-931dc83a0fe4?q=80&w=800&auto=format&fit=crop',
    address: '789 Nguyễn Huệ, Quận 1, TP.HCM',
    sport: 'Bóng rổ',
    date: '2023-11-18',
    time: '19:30-21:00',
    price: 200000,
    status: 'cancelled',
    paymentMethod: 'momo',
    notes: 'Huỷ vì trời mưa',
    createdAt: '2023-11-10T14:20:00Z'
  }
];

const MyBookings = () => {
  const [tabValue, setTabValue] = useState(0);
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Hàm làm mới dữ liệu
  const handleRefresh = () => {
    setRefreshing(true);
    setError('');
    fetchBookings();
  };
  
  // Fetch bookings from Firestore/demo data
  useEffect(() => {
    fetchBookings();
  }, [currentUser]);
  
  // Fetch bookings data
  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!currentUser) {
        console.log('Không có người dùng đăng nhập');
        setBookings([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }
      
      console.log('Đang lấy dữ liệu booking của người dùng:', currentUser.uid);
      
      // Lấy dữ liệu từ Firestore - sử dụng cả orderBy vì đã có index
      const bookingsRef = collection(db, 'bookings');
      const q = query(
        bookingsRef,
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const bookingsData = [];
      
      console.log(`Tìm thấy ${querySnapshot.size} bookings từ Firestore với userId=${currentUser.uid}`);
      
      // Thu thập dữ liệu booking
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        bookingsData.push({ id: doc.id, ...data });
      });
      
      // Nếu không có dữ liệu từ Firestore, sử dụng dữ liệu demo
      if (bookingsData.length === 0) {
        console.log('Không có dữ liệu booking từ Firestore, sử dụng dữ liệu demo');
        setBookings(DEMO_BOOKINGS);
      } else {
        console.log('Đã tìm thấy và đang xử lý dữ liệu bookings của người dùng');
        
        // Xử lý dữ liệu từ Firestore để định dạng phù hợp với UI
        const processedBookings = bookingsData.map(booking => {
          try {
            // Định dạng ngày tháng
            let formattedDate = booking.date;
            if (booking.date) {
              if (booking.date instanceof Timestamp) {
                formattedDate = booking.date.toDate();
              } else if (booking.date.toDate && typeof booking.date.toDate === 'function') {
                formattedDate = booking.date.toDate();
              } else if (typeof booking.date === 'string') {
                formattedDate = new Date(booking.date);
              } else if (booking.date instanceof Date) {
                formattedDate = booking.date;
              }
            }
            
            // Kiểm tra định dạng thời gian
            const timeStr = booking.time || `${booking.startTime || '00:00'}-${booking.endTime || '00:00'}`;
            
            return {
              ...booking,
              date: formattedDate,
              time: timeStr,
              // Đảm bảo các trường quan trọng có giá trị mặc định hợp lý
              courtName: booking.courtName || 'Không có tên',
              address: booking.address || 'Không có địa chỉ',
              sport: booking.sport || 'Không xác định',
              status: booking.status || 'upcoming',
              price: booking.totalPrice || 0,
              courtImage: booking.courtImage || 'https://via.placeholder.com/300x200?text=No+Image'
            };
          } catch (err) {
            console.error('Lỗi khi xử lý booking:', err, booking);
            return {
              ...booking,
              date: new Date(),
              time: '00:00-00:00',
              courtName: booking.courtName || 'Lỗi định dạng',
              status: booking.status || 'upcoming'
            };
          }
        });
        
        setBookings(processedBookings);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(`Không thể tải dữ liệu đặt sân: ${err.message}`);
      
      // Sử dụng dữ liệu demo trong trường hợp lỗi
      console.log('Sử dụng dữ liệu demo do lỗi Firestore');
      setBookings(DEMO_BOOKINGS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Filter bookings based on selected tab
  useEffect(() => {
    const filterBookingsByStatus = () => {
      if (tabValue === 0) { // All
        setFilteredBookings(bookings);
      } else if (tabValue === 1) { // Upcoming
        setFilteredBookings(bookings.filter(b => b.status === 'upcoming' || b.status === 'pending'));
      } else if (tabValue === 2) { // Completed
        setFilteredBookings(bookings.filter(b => b.status === 'completed'));
      } else if (tabValue === 3) { // Cancelled
        setFilteredBookings(bookings.filter(b => b.status === 'cancelled'));
      }
    };
    
    filterBookingsByStatus();
  }, [tabValue, bookings]);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleViewCourt = (courtId) => {
    navigate(`/renter/court/${courtId}`);
  };
  
  const handleCancelBookingOpen = (booking) => {
    setSelectedBooking(booking);
    setCancelDialogOpen(true);
  };
  
  const handleCancelBookingClose = () => {
    setCancelDialogOpen(false);
    setSelectedBooking(null);
  };
  
  const handleCancelBooking = async () => {
    try {
      if (!selectedBooking) return;
      
      // Cập nhật trạng thái trong Firestore
      const bookingRef = doc(db, 'bookings', selectedBooking.id);
      await updateDoc(bookingRef, { 
        status: 'cancelled',
        updatedAt: new Date()
      });
      
      console.log(`Đã hủy booking ${selectedBooking.id} trong Firestore`);
      
      // Cập nhật state
      setBookings(bookings.map(b => 
        b.id === selectedBooking.id ? { ...b, status: 'cancelled' } : b
      ));
      
      handleCancelBookingClose();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      setError('Không thể hủy đặt sân. Vui lòng thử lại sau.');
      
      // Nếu lỗi khi cập nhật Firestore, vẫn cập nhật UI để người dùng thấy thay đổi
      setBookings(bookings.map(b => 
        b.id === selectedBooking.id ? { ...b, status: 'cancelled' } : b
      ));
      
      handleCancelBookingClose();
    }
  };
  
  // Format price to VND
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price).replace('₫', 'VNĐ');
  };
  
  // Format date to dd/mm/yyyy
  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'Không xác định';
      
      // Nếu là đối tượng Date
      if (dateString instanceof Date) {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return dateString.toLocaleDateString('vi-VN', options);
      }
      
      // Nếu là string
      return new Date(dateString).toLocaleDateString('vi-VN', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
    } catch (error) {
      console.error('Lỗi khi định dạng ngày tháng:', error);
      return 'Không xác định';
    }
  };
  
  // Get status chip color and label
  const getStatusChip = (status) => {
    switch (status) {
      case 'upcoming':
        return <Chip label="Sắp diễn ra" color="primary" size="small" />;
      case 'pending':
        return <Chip label="Chờ xác nhận" color="warning" size="small" />;
      case 'completed':
        return <Chip label="Đã hoàn thành" color="success" size="small" />;
      case 'cancelled':
        return <Chip label="Đã hủy" color="error" size="small" />;
      case 'confirmed':
        return <Chip label="Đã xác nhận" color="success" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };
  
  // Get payment method label
  const getPaymentMethodLabel = (method) => {
    switch (method) {
      case 'cash':
        return 'Tiền mặt tại sân';
      case 'banking':
        return 'Chuyển khoản ngân hàng';
      case 'momo':
        return 'Ví MoMo';
      default:
        return method;
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }
  
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Lịch đặt sân của tôi</Typography>
        <Button
          variant="outlined"
          startIcon={refreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
          onClick={handleRefresh}
          disabled={refreshing || loading}
        >
          {refreshing ? 'Đang làm mới...' : 'Làm mới'}
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label={`Tất cả (${bookings.length})`} />
          <Tab label={`Sắp diễn ra (${bookings.filter(b => b.status === 'upcoming' || b.status === 'pending').length})`} />
          <Tab label={`Đã hoàn thành (${bookings.filter(b => b.status === 'completed').length})`} />
          <Tab label={`Đã hủy (${bookings.filter(b => b.status === 'cancelled').length})`} />
        </Tabs>
      </Paper>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ ml: 2 }}>
            Đang tải dữ liệu...
          </Typography>
        </Box>
      ) : filteredBookings.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Alert severity="info" sx={{ mb: 3, maxWidth: '500px', mx: 'auto' }}>
            {tabValue === 0 
              ? 'Bạn chưa có lịch đặt sân nào. Hãy đặt sân để sử dụng dịch vụ!'
              : tabValue === 1 
                ? 'Bạn không có lịch đặt sân nào sắp tới!'
                : tabValue === 2
                  ? 'Bạn chưa có sân nào đã hoàn thành.' 
                  : 'Bạn không có sân nào đã bị hủy.'}
          </Alert>
          
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => navigate('/renter/search')}
            sx={{ mt: 2 }}
          >
            Tìm và đặt sân ngay
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredBookings.map((booking) => (
            <Grid item xs={12} key={booking.id}>
              <Card sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <Grid container>
                  <Grid item xs={12} sm={3}>
                    <Box
                      sx={{
                        height: '100%',
                        minHeight: 200,
                        backgroundImage: `url(${booking.courtImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={9}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6">{booking.courtName}</Typography>
                        {getStatusChip(booking.status)}
                      </Box>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <SportsIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2">{booking.sport}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <LocationOnIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2">{booking.address}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <PaidIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {formatPrice(booking.price || booking.totalPrice || 0)} - {getPaymentMethodLabel(booking.paymentMethod)}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <EventIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              Ngày: {typeof booking.date === 'object' && booking.date instanceof Date 
                                ? formatDate(booking.date) 
                                : 'Không xác định'}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2">Giờ: {booking.time}</Typography>
                          </Box>
                          {booking.notes && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              Ghi chú: {booking.notes}
                            </Typography>
                          )}
                        </Grid>
                      </Grid>
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Đặt vào: {new Date(booking.createdAt).toLocaleString('vi-VN')}
                          </Typography>
                        </Box>
                        <Box>
                          <Button 
                            variant="outlined" 
                            sx={{ mr: 1 }}
                            onClick={() => handleViewCourt(booking.courtId)}
                          >
                            Xem sân
                          </Button>
                          
                          {booking.status === 'upcoming' && (
                            <Button 
                              variant="contained" 
                              color="error"
                              onClick={() => handleCancelBookingOpen(booking)}
                            >
                              Hủy đặt sân
                            </Button>
                          )}
                          
                          {booking.status === 'completed' && (
                            <Button 
                              variant="contained" 
                              color="secondary"
                              onClick={() => navigate('/renter/ratings')}
                            >
                              Đánh giá
                            </Button>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Grid>
                </Grid>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Cancel booking confirmation dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={handleCancelBookingClose}
      >
        <DialogTitle>
          Xác nhận hủy đặt sân
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn hủy đặt sân này không? Chủ sân sẽ nhận được thông báo về việc hủy đặt sân của bạn.
          </DialogContentText>
          {selectedBooking && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                {selectedBooking.courtName}
              </Typography>
              <Typography variant="body2">
                Ngày: {formatDate(selectedBooking.date)}
              </Typography>
              <Typography variant="body2">
                Giờ: {selectedBooking.time}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelBookingClose}>
            Không, giữ lại
          </Button>
          <Button 
            onClick={handleCancelBooking} 
            color="error" 
            variant="contained"
          >
            Có, hủy đặt sân
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyBookings; 