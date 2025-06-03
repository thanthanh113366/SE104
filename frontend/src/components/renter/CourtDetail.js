import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardMedia, 
  Paper, 
  Divider, 
  Chip, 
  Button, 
  Rating, 
  Stack, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PaidIcon from '@mui/icons-material/Paid';
import StarIcon from '@mui/icons-material/Star';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import { useAuth } from '../../contexts/AuthContext';
import CourtServiceWrapper from '../../services/courtServiceWrapper';
import BookingServiceWrapper from '../../services/bookingServiceWrapper';

// Demo data (sẽ thay bằng dữ liệu từ Firestore)
const DEMO_COURTS = [
  {
    id: 'court1',
    name: 'Sân bóng đá Mini Thủ Đức',
    address: '123 Võ Văn Ngân, Thủ Đức, TP.HCM',
    sport: 'Bóng đá',
    price: 250000,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?q=80&w=800&auto=format&fit=crop',
    facilities: ['Đèn chiếu sáng', 'Phòng thay đồ', 'Wifi'],
    openTime: '06:00',
    closeTime: '22:00',
    description: 'Sân bóng đá cỏ nhân tạo 5 người, có mái che, hệ thống đèn chiếu sáng hiện đại. Thích hợp cho các trận đấu giao hữu hoặc tập luyện.',
    owner: {
      name: 'Nguyễn Văn A',
      phone: '0901234567'
    },
    reviews: [
      { id: 'rev1', user: 'Trần Văn B', rating: 5, comment: 'Sân rất đẹp, thái độ phục vụ tốt', date: '2023-10-15' },
      { id: 'rev2', user: 'Lê Thị C', rating: 4, comment: 'Sân tốt, nhưng thiếu nước uống', date: '2023-09-28' }
    ],
    availableSlots: [
      { date: '2023-11-25', slots: [
        { id: 'slot1', time: '06:00-07:30', status: 'available', price: 250000 },
        { id: 'slot2', time: '07:30-09:00', status: 'booked', price: 250000 },
        { id: 'slot3', time: '09:00-10:30', status: 'available', price: 280000 },
        { id: 'slot4', time: '15:00-16:30', status: 'available', price: 280000 },
        { id: 'slot5', time: '16:30-18:00', status: 'booked', price: 300000 },
        { id: 'slot6', time: '18:00-19:30', status: 'available', price: 350000 },
        { id: 'slot7', time: '19:30-21:00', status: 'available', price: 350000 }
      ]}
    ]
  },
  {
    id: 'court2',
    name: 'Sân cầu lông Tân Bình',
    address: '456 Hoàng Văn Thụ, Tân Bình, TP.HCM',
    sport: 'Cầu lông',
    price: 120000,
    rating: 4.2,
    image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=800&auto=format&fit=crop',
    facilities: ['Phòng thay đồ', 'Nước uống'],
    openTime: '07:00',
    closeTime: '21:00',
    description: 'Sân cầu lông trong nhà với tiêu chuẩn thi đấu, mặt sân chất lượng cao, không bị chói mắt.',
    owner: {
      name: 'Trần Thị D',
      phone: '0909876543'
    },
    reviews: [
      { id: 'rev3', user: 'Phạm Văn E', rating: 4, comment: 'Sân đẹp, thoáng mát', date: '2023-10-10' }
    ],
    availableSlots: [
      { date: '2023-11-25', slots: [
        { id: 'slot1', time: '07:00-08:00', status: 'available', price: 120000 },
        { id: 'slot2', time: '08:00-09:00', status: 'available', price: 120000 },
        { id: 'slot3', time: '09:00-10:00', status: 'booked', price: 120000 },
        { id: 'slot4', time: '15:00-16:00', status: 'available', price: 150000 },
        { id: 'slot5', time: '16:00-17:00', status: 'available', price: 150000 },
        { id: 'slot6', time: '17:00-18:00', status: 'booked', price: 180000 },
        { id: 'slot7', time: '18:00-19:00', status: 'available', price: 180000 }
      ]}
    ]
  }
];

const CourtDetail = () => {
  const { courtId } = useParams();
  const { userDetails, currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [court, setCourt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [note, setNote] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [existingBookings, setExistingBookings] = useState([]);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  
  // Helper function để chuyển đổi Firestore timestamp sang Date nếu cần
  const convertFirestoreDate = (firestoreDate) => {
    if (!firestoreDate) return null;
    
    // Nếu là Firestore Timestamp, chuyển về Date
    if (typeof firestoreDate.toDate === 'function') {
      return firestoreDate.toDate();
    }
    
    // Nếu là Date string, chuyển về Date
    if (typeof firestoreDate === 'string') {
      return new Date(firestoreDate);
    }
    
    // Nếu đã là Date, trả về nguyên bản
    return firestoreDate;
  };
  
  // Helper function để kiểm tra xem hai ngày có cùng một ngày không
  const isSameDay = (date1, date2) => {
    const d1 = convertFirestoreDate(date1);
    const d2 = convertFirestoreDate(date2);
    
    if (!d1 || !d2) return false;
    
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };
  
  // Fetch court data
  useEffect(() => {
    const fetchCourtDetails = async () => {
      try {
        setLoading(true);
        
        // Lấy dữ liệu sử dụng service wrapper thay vì Firestore trực tiếp
        console.log('Đang lấy thông tin sân với ID:', courtId);
        
        try {
          const courtData = await CourtServiceWrapper.getCourtById(courtId);
          
          if (courtData) {
            console.log('Đã tìm thấy thông tin sân:', courtData.id);
            console.log('Dữ liệu sân:', courtData);
            setCourt(courtData);
          } else {
            console.log('Không tìm thấy sân với ID:', courtId);
            // Nếu không có dữ liệu, tìm từ dữ liệu demo
            const foundCourt = DEMO_COURTS.find(c => c.id === courtId);
            if (foundCourt) {
              console.log('Đã tìm thấy sân trong dữ liệu demo');
              setCourt(foundCourt);
            } else {
              setError('Không tìm thấy thông tin sân');
            }
          }
        } catch (fetchError) {
          console.error('Lỗi khi lấy dữ liệu sân:', fetchError);
          // Sử dụng dữ liệu demo nếu có lỗi xảy ra
          const foundCourt = DEMO_COURTS.find(c => c.id === courtId);
          if (foundCourt) {
            setCourt(foundCourt);
            setError('Đang hiển thị dữ liệu demo do có lỗi khi lấy dữ liệu thực.');
          } else {
            setError('Không thể tải thông tin sân. Vui lòng thử lại sau.');
          }
        }
      } catch (error) {
        console.error('Lỗi khi lấy thông tin sân:', error);
        console.error('Chi tiết lỗi:', error.code, error.message);
        setError('Đã xảy ra lỗi khi tải thông tin sân. Vui lòng thử lại sau.');
        
        // Nếu có lỗi, thử dùng dữ liệu demo
        const foundCourt = DEMO_COURTS.find(c => c.id === courtId);
        if (foundCourt) {
          console.log('Sử dụng dữ liệu demo do lỗi kết nối Firestore');
          setCourt(foundCourt);
          setError(''); // Xóa thông báo lỗi nếu tìm thấy dữ liệu demo
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourtDetails();
  }, [courtId]);
  
  // Fetch existing bookings
  useEffect(() => {
    const fetchExistingBookings = async () => {
      try {
        if (!court) return;
        console.log('Đang lấy các lịch đặt sân hiện có cho sân:', courtId);
        
        const response = await BookingServiceWrapper.getCourtBookings(courtId);
        if (response && response.bookings) {
          console.log('Bookings từ server:', response.bookings);
          
          // Lọc booking cho ngày đã chọn
          const bookingsForSelectedDate = response.bookings.filter(booking => {
            if (!booking.date) return false;
            return isSameDay(booking.date, selectedDate);
          });
          
          console.log('Bookings cho ngày đã chọn:', bookingsForSelectedDate);
          setExistingBookings(bookingsForSelectedDate);
        } else {
          setExistingBookings([]);
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách đặt sân:', error);
        setExistingBookings([]);
      }
    };
    
    fetchExistingBookings();
  }, [court, courtId, selectedDate]);
  
  // Tạo các khung giờ từ giờ mở cửa đến giờ đóng cửa
  const generateTimeSlots = () => {
    if (!court) return [];
    
    const slots = [];
    const [openHour, openMinute] = court.openTime.split(':').map(Number);
    const [closeHour, closeMinute] = court.closeTime.split(':').map(Number);
    
    const openTime = openHour * 60 + openMinute;
    const closeTime = closeHour * 60 + closeMinute;
    
    // Lọc booking chỉ cho ngày đã chọn
    const selectedDateStr = selectedDate.toISOString().split('T')[0];
    const bookingsForSelectedDate = existingBookings.filter(booking => {
      const bookingDate = booking.date;
      if (!bookingDate) return false;
      
      const bookingDateStr = bookingDate.toISOString().split('T')[0];
      return bookingDateStr === selectedDateStr;
    });
    
    console.log(`Booking cho ngày ${selectedDateStr}:`, bookingsForSelectedDate);
    
    // Tạo các khung 1 giờ
    for (let time = openTime; time < closeTime; time += 60) {
      const hour = Math.floor(time / 60);
      const minute = time % 60;
      
      const nextTime = time + 60;
      const nextHour = Math.floor(nextTime / 60);
      const nextMinute = nextTime % 60;
      
      if (nextTime <= closeTime) {
        const startTimeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const endTimeString = `${nextHour.toString().padStart(2, '0')}:${nextMinute.toString().padStart(2, '0')}`;
        
        const timeSlot = {
          id: `slot-${startTimeString}-${endTimeString}`,
          startTime: startTimeString,
          endTime: endTimeString,
          time: `${startTimeString}-${endTimeString}`,
          price: court.price,
          status: 'available',
          bookingStatus: null,
          isWithinPendingWindow: false
        };
        
        // Kiểm tra xem khung giờ này đã có người đặt chưa
        const bookingForThisSlot = bookingsForSelectedDate.find(booking => 
          booking.startTime === startTimeString && booking.endTime === endTimeString
        );
        
        if (bookingForThisSlot) {
          console.log(`Slot ${startTimeString}-${endTimeString} is booked with status:`, bookingForThisSlot.status);
          timeSlot.status = 'booked';
          timeSlot.bookingStatus = bookingForThisSlot.status;
          timeSlot.isWithinPendingWindow = bookingForThisSlot.isWithinPendingWindow;
        }
        
        slots.push(timeSlot);
      }
    }
    
    return slots;
  };
  
  const handleBookingOpen = (slot) => {
    setSelectedSlot(slot);
    setBookingOpen(true);
  };
  
  const handleBookingClose = () => {
    setBookingOpen(false);
    setSelectedSlot(null);
    setNote('');
    setPaymentMethod('cash');
  };
  
  const handleBooking = async () => {
    try {
      if (!currentUser) {
        navigate('/login', { state: { redirectPath: `/courts/${courtId}` } });
        return;
      }

      setBookingLoading(true);

      // Dữ liệu đặt sân
      const bookingData = {
        userId: currentUser.uid,
        userName: userDetails?.displayName || currentUser.email?.split('@')[0] || 'Người dùng',
        userEmail: currentUser.email,
        userPhone: userDetails?.phone || 'Chưa cung cấp',
        ownerId: court.ownerId,
        courtId: court.id,
        courtName: court.name,
        sport: court.sport,
        address: court.address,
        date: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        time: `${selectedSlot.startTime}-${selectedSlot.endTime}`,
        price: selectedSlot.price,
        totalPrice: Number(selectedSlot.price),
        paymentMethod,
        note,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('Đang tạo đơn đặt sân với dữ liệu:', bookingData);

      try {
        const response = await BookingServiceWrapper.createBooking(courtId, bookingData);
        if (response && response.id) {
          setBookingSuccess(bookingData);
          setBookingOpen(false);
          setSuccessDialogOpen(true);
        } else {
          throw new Error('Không nhận được booking mới từ server');
        }
      } catch (bookingError) {
        console.error('Lỗi khi đặt sân:', bookingError);
        setError('Rất tiếc! Đã có lỗi xảy ra khi đặt sân. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.');
      }
    } catch (error) {
      console.error('Lỗi khi đặt sân:', error);
      setError('Rất tiếc! Đã có lỗi xảy ra khi đặt sân. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.');
    } finally {
      setBookingLoading(false);
    }
  };
  
  const handleSuccessDialogClose = () => {
    setSuccessDialogOpen(false);
    window.location.reload();
  };
  
  // Format price to VND
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price).replace('₫', 'VNĐ');
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          variant="contained" 
          sx={{ mt: 2 }}
          onClick={() => navigate(-1)}
        >
          Quay lại
        </Button>
      </Box>
    );
  }
  
  if (!court) return null;
  
  // Tạo các khung giờ
  const timeSlots = generateTimeSlots();
  
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Button 
        variant="outlined" 
        sx={{ mb: 2 }}
        onClick={() => navigate(-1)}
      >
        Quay lại
      </Button>
      
      <Grid container spacing={3}>
        {/* Court image and info */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
            <CardMedia
              component="img"
              height="400"
              image={court.image}
              alt={court.name}
              sx={{ objectFit: 'cover' }}
            />
          </Card>
          
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Typography variant="h4" gutterBottom>{court.name}</Typography>
            
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6} display="flex" alignItems="center">
                <LocationOnIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body1">{court.address}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} display="flex" alignItems="center">
                <AccessTimeIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body1">
                  Giờ hoạt động: {court.openTime} - {court.closeTime}
                </Typography>
              </Grid>
            </Grid>
            
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <PaidIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="body1">
                Giá từ {formatPrice(court.price)}/giờ
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <StarIcon color="primary" sx={{ mr: 1 }} />
              <Rating 
                value={court.rating} 
                precision={0.1} 
                readOnly 
                size="small"
                sx={{ mr: 1 }}
              />
              <Typography variant="body2">({court.rating})</Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" gutterBottom>Mô tả</Typography>
            <Typography variant="body1" paragraph>
              {court.description}
            </Typography>
            
            <Typography variant="h6" gutterBottom>Tiện ích</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap={true} sx={{ mb: 2 }}>
              {court.facilities.map((facility, index) => (
                <Chip key={index} label={facility} sx={{ m: 0.5 }} />
              ))}
            </Stack>
            
            <Typography variant="h6" gutterBottom>Liên hệ chủ sân</Typography>
            <Typography variant="body1">
              {court.owner.name} - {court.owner.phone}
            </Typography>
          </Paper>
        </Grid>
        
        {/* Booking section */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 2, position: 'sticky', top: 20 }}>
            <Typography variant="h5" gutterBottom>Đặt sân</Typography>
            
            {/* Chọn ngày đơn giản */}
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                type="date"
                label="Chọn ngày"
                InputLabelProps={{ shrink: true }}
                value={selectedDate.toISOString().split('T')[0]}
                onChange={(e) => {
                  const newDate = new Date(e.target.value);
                  setSelectedDate(newDate);
                }}
              />
            </Box>
            
            <Typography variant="h6" gutterBottom>
              Lịch trống ngày {selectedDate.toLocaleDateString('vi-VN')}
            </Typography>
            
            {timeSlots.length > 0 ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {timeSlots.map((slot) => {
                  // Xác định màu sắc và trạng thái hiển thị
                  let statusColor, statusBgColor, statusText, isDisabled;
                  
                  if (slot.status === 'booked') {
                    if (slot.bookingStatus === 'confirmed') {
                      statusColor = '#d32f2f'; // Đỏ đậm
                      statusBgColor = '#ffebee'; // Đỏ nhạt
                      statusText = 'Đã được xác nhận';
                      isDisabled = true;
                    } else if (slot.bookingStatus === 'pending') {
                      if (slot.isWithinPendingWindow) {
                        statusColor = '#ed6c02'; // Cam đậm
                        statusBgColor = '#fff3e0'; // Cam nhạt
                        statusText = 'Đang chờ xác nhận (5 phút)';
                        isDisabled = true;
                      } else {
                        statusColor = '#9e9e9e'; // Xám
                        statusBgColor = '#f5f5f5'; // Xám nhạt
                        statusText = 'Đang chờ xác nhận';
                        isDisabled = false;
                      }
                    } else {
                      statusColor = '#4caf50'; // Xanh lá
                      statusBgColor = '#e8f5e9'; // Xanh lá nhạt
                      statusText = 'Còn trống';
                      isDisabled = false;
                    }
                  } else {
                    statusColor = '#4caf50'; // Xanh lá
                    statusBgColor = '#e8f5e9'; // Xanh lá nhạt
                    statusText = 'Còn trống';
                    isDisabled = false;
                  }
                  
                  return (
                    <Box
                      key={slot.id}
                      sx={{
                        width: 'calc(50% - 8px)',
                        padding: 1,
                        textAlign: 'center',
                        border: '1px solid',
                        borderColor: statusColor,
                        backgroundColor: statusBgColor,
                        borderRadius: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                        opacity: isDisabled ? 0.8 : 1,
                        position: 'relative',
                        '&:hover': {
                          backgroundColor: isDisabled ? statusBgColor : '#f5f5f5',
                        },
                        mb: 1
                      }}
                      onClick={() => !isDisabled && handleBookingOpen(slot)}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{slot.time}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatPrice(slot.price)}
                      </Typography>
                      <Box 
                        sx={{ 
                          mt: 0.5, 
                          py: 0.25, 
                          px: 1, 
                          borderRadius: 1, 
                          fontSize: '0.75rem',
                          backgroundColor: statusColor,
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 0.5
                        }}
                      >
                        {statusText}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Không có khung giờ nào cho ngày này
              </Typography>
            )}
          </Paper>
        </Grid>
        
        {/* Reviews section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom>
              Đánh giá ({court.reviews ? court.reviews.length : 0})
            </Typography>
            
            {court.reviews && court.reviews.length > 0 ? (
              <Box>
                {court.reviews.map((review) => (
                  <Box key={review.id} sx={{ py: 2 }}>
                    <Grid container spacing={1}>
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {review.user}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Rating 
                            value={review.rating} 
                            readOnly 
                            size="small"
                            sx={{ mr: 1 }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {new Date(review.date).toLocaleDateString('vi-VN')}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body1">
                          {review.comment}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Divider sx={{ mt: 2 }} />
                  </Box>
                ))}
              </Box>
            ) : (
              <Alert severity="info">
                Chưa có đánh giá nào cho sân này
              </Alert>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Booking Dialog */}
      <Dialog open={bookingOpen} onClose={handleBookingClose}>
        <DialogTitle>Xác nhận đặt sân</DialogTitle>
        <DialogContent>
          <Box sx={{ minWidth: 300, mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              <strong>Sân:</strong> {court.name}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Ngày:</strong> {selectedDate.toLocaleDateString('vi-VN')}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Giờ:</strong> {selectedSlot ? `${selectedSlot.startTime} - ${selectedSlot.endTime}` : ''}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Giá:</strong> {selectedSlot ? formatPrice(selectedSlot.price) : ''}
            </Typography>
            
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel id="payment-method-label">Phương thức thanh toán</InputLabel>
              <Select
                labelId="payment-method-label"
                label="Phương thức thanh toán"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <MenuItem value="cash">Tiền mặt tại sân</MenuItem>
                <MenuItem value="banking">Chuyển khoản ngân hàng</MenuItem>
                <MenuItem value="momo">Ví MoMo</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Ghi chú"
              multiline
              rows={2}
              sx={{ mt: 2 }}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ghi chú thêm (nếu có)"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleBookingClose}>Hủy</Button>
          <Button variant="contained" onClick={handleBooking} disabled={bookingLoading}>
            {bookingLoading ? 'Đang xử lý...' : 'Xác nhận đặt sân'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Dialog */}
      <Dialog 
        open={successDialogOpen} 
        onClose={handleSuccessDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          textAlign: 'center', 
          bgcolor: '#4caf50', 
          color: 'white',
          py: 2
        }}>
          🎉 Đặt sân thành công!
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {bookingSuccess && (
            <Box sx={{ py: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ 
                display: 'flex', 
                alignItems: 'center',
                color: '#2e7d32'
              }}>
                <LocationOnIcon sx={{ mr: 1 }} />
                {bookingSuccess.courtName}
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1" sx={{ 
                    display: 'flex', 
                    alignItems: 'center'
                  }}>
                    📅 Ngày: {selectedDate.toLocaleDateString('vi-VN')}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1" sx={{ 
                    display: 'flex', 
                    alignItems: 'center'
                  }}>
                    ⏰ Giờ: {bookingSuccess.startTime} - {bookingSuccess.endTime}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body1" sx={{ 
                    display: 'flex', 
                    alignItems: 'center'
                  }}>
                    💰 Giá: {formatPrice(bookingSuccess.price)}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="body1" paragraph>
                Chủ sân sẽ liên hệ với bạn qua số điện thoại {userDetails?.phone || 'đã đăng ký'} để xác nhận đơn đặt sân.
              </Typography>
              
              <Typography variant="body1" color="primary">
                Bạn có thể xem chi tiết đơn đặt sân trong mục "Đơn đặt sân của tôi".
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            onClick={handleSuccessDialogClose}
            sx={{ 
              minWidth: 200,
              bgcolor: '#4caf50',
              '&:hover': {
                bgcolor: '#2e7d32'
              }
            }}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CourtDetail; 