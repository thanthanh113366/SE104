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
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';

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
  const { userDetails } = useAuth();
  const navigate = useNavigate();
  
  const [court, setCourt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  // Fetch court data
  useEffect(() => {
    const fetchCourtDetails = async () => {
      try {
        setLoading(true);
        
        // Demo: Tìm sân từ dữ liệu mẫu
        const foundCourt = DEMO_COURTS.find(c => c.id === courtId);
        if (foundCourt) {
          setCourt(foundCourt);
        } else {
          setError('Không tìm thấy thông tin sân');
        }
        
        /* Mã thực khi kết nối Firebase
        const courtRef = doc(db, 'courts', courtId);
        const courtDoc = await getDoc(courtRef);
        
        if (courtDoc.exists()) {
          setCourt({ id: courtDoc.id, ...courtDoc.data() });
        } else {
          setError('Không tìm thấy thông tin sân');
        }
        */
      } catch (err) {
        console.error('Error fetching court details:', err);
        setError('Đã xảy ra lỗi khi tải thông tin sân. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourtDetails();
  }, [courtId]);
  
  const handleBookingOpen = (slot) => {
    setSelectedSlot(slot);
    setBookingOpen(true);
  };
  
  const handleBookingClose = () => {
    setBookingOpen(false);
    setSelectedSlot(null);
  };
  
  const handleBooking = () => {
    // Thực hiện đặt sân - sẽ triển khai sau khi có API
    alert(`Đặt sân thành công! Slot: ${selectedSlot.time}`);
    handleBookingClose();
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
  
  // Get available slots for selected date
  const todaySlots = court.availableSlots.find(s => s.date === selectedDate)?.slots || [];
  
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
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
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
            
            <TextField
              fullWidth
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              sx={{ mb: 3 }}
            />
            
            <Typography variant="h6" gutterBottom>
              Lịch trống ngày {new Date(selectedDate).toLocaleDateString('vi-VN')}
            </Typography>
            
            {todaySlots.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Thời gian</TableCell>
                      <TableCell align="right">Giá</TableCell>
                      <TableCell align="right">Trạng thái</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {todaySlots.map((slot) => (
                      <TableRow key={slot.id}>
                        <TableCell>{slot.time}</TableCell>
                        <TableCell align="right">{formatPrice(slot.price)}</TableCell>
                        <TableCell align="right">
                          {slot.status === 'available' ? (
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<BookOnlineIcon />}
                              onClick={() => handleBookingOpen(slot)}
                            >
                              Đặt ngay
                            </Button>
                          ) : (
                            <Chip label="Đã đặt" color="error" size="small" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="info">
                Không có khung giờ trống cho ngày đã chọn
              </Alert>
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
              <strong>Ngày:</strong> {new Date(selectedDate).toLocaleDateString('vi-VN')}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Giờ:</strong> {selectedSlot?.time}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Giá:</strong> {selectedSlot ? formatPrice(selectedSlot.price) : ''}
            </Typography>
            
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel id="payment-method-label">Phương thức thanh toán</InputLabel>
              <Select
                labelId="payment-method-label"
                label="Phương thức thanh toán"
                defaultValue="cash"
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
              placeholder="Ghi chú thêm (nếu có)"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleBookingClose}>Hủy</Button>
          <Button variant="contained" onClick={handleBooking}>
            Xác nhận đặt sân
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CourtDetail; 