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
import { doc, getDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
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
        
        // Lấy dữ liệu từ Firestore
        console.log('Đang lấy thông tin sân với ID:', courtId);
        const courtRef = doc(db, 'courts', courtId);
        const courtDoc = await getDoc(courtRef);
        
        if (courtDoc.exists()) {
          console.log('Đã tìm thấy thông tin sân từ Firestore:', courtDoc.id);
          const data = courtDoc.data();
          console.log('Dữ liệu sân:', data);
          console.log('ownerId từ Firestore:', data.ownerId);
          
          // Hoàn thiện dữ liệu
          const courtData = {
            id: courtDoc.id,
            ...data,
            ownerId: data.ownerId || '',
            name: data.name || 'Chưa có tên',
            address: data.address || 'Chưa có địa chỉ',
            description: data.description || 'Chưa có mô tả',
            price: data.price || 0,
            sport: data.sport || 'Không xác định',
            facilities: Array.isArray(data.facilities) ? data.facilities : [],
            openTime: data.openTime || '06:00',
            closeTime: data.closeTime || '22:00',
            rating: data.rating || 0,
            reviews: data.reviews || [],
            image: data.image || 'https://images.unsplash.com/photo-1459865264687-595d652de67e?q=80&w=800&auto=format&fit=crop',
            owner: data.owner || { name: 'Chưa có thông tin', phone: 'Chưa có thông tin' },
          };
          
          setCourt(courtData);
        } else {
          console.log('Không tìm thấy sân trong Firestore với ID:', courtId);
          // Nếu không có dữ liệu trong Firestore, tìm từ dữ liệu demo
          const foundCourt = DEMO_COURTS.find(c => c.id === courtId);
          if (foundCourt) {
            console.log('Đã tìm thấy sân trong dữ liệu demo');
            setCourt(foundCourt);
          } else {
            console.log('Không tìm thấy sân trong cả Firestore và dữ liệu demo');
            setError('Không tìm thấy thông tin sân');
          }
        }
      } catch (err) {
        console.error('Lỗi khi lấy thông tin sân:', err);
        console.error('Chi tiết lỗi:', err.code, err.message);
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
  
  // Lấy danh sách các lượt đặt sân hiện có cho ngày đã chọn
  useEffect(() => {
    const fetchExistingBookings = async () => {
      if (!court || !selectedDate) return;
      
      try {
        // Chuyển selectedDate thành timestamp bắt đầu và kết thúc ngày
        const startDate = new Date(selectedDate);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(selectedDate);
        endDate.setHours(23, 59, 59, 999);
        
        console.log(`Đang lấy danh sách đặt sân cho ngày ${startDate.toLocaleDateString()}`);
        
        // Truy vấn Firestore để lấy tất cả booking cho sân này trong ngày đã chọn
        const bookingsRef = collection(db, 'bookings');
        
        // Query theo courtId
        // Lưu ý: Do vấn đề với queries dựa trên timestamp, chúng ta sẽ lọc lại ngày sau khi lấy dữ liệu
        const q = query(
          bookingsRef,
          where('courtId', '==', court.id)
        );
        
        const querySnapshot = await getDocs(q);
        const bookings = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          console.log("Booking từ Firestore:", doc.id, data);
          
          const bookingDate = convertFirestoreDate(data.date);
          
          // Chỉ xử lý các đặt sân cho ngày đã chọn
          if (isSameDay(bookingDate, selectedDate) && data.status !== 'rejected') {
            console.log(`Booking ${doc.id} hợp lệ cho ngày ${selectedDate.toLocaleDateString()}`);
            
            bookings.push({
              id: doc.id,
              ...data,
              date: bookingDate,
              startTime: data.startTime,
              endTime: data.endTime
            });
          }
        });
        
        console.log(`Tìm thấy ${bookings.length} lượt đặt sân hợp lệ cho ngày ${startDate.toLocaleDateString()}`);
        console.log('Danh sách đặt sân hợp lệ:', bookings);
        
        setExistingBookings(bookings);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách đặt sân:', error);
      }
    };
    
    fetchExistingBookings();
  }, [court, selectedDate]);
  
  // Tạo các khung giờ từ giờ mở cửa đến giờ đóng cửa
  const generateTimeSlots = () => {
    if (!court) return [];
    
    const slots = [];
    const [openHour, openMinute] = court.openTime.split(':').map(Number);
    const [closeHour, closeMinute] = court.closeTime.split(':').map(Number);
    
    const openTime = openHour * 60 + openMinute;
    const closeTime = closeHour * 60 + closeMinute;
    
    console.log("Existing bookings khi tạo time slots:", existingBookings);
    
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
          bookingStatus: null
        };
        
        // Kiểm tra xem khung giờ này đã có người đặt chưa và trạng thái của đơn đặt sân
        const bookingForThisSlot = existingBookings.find(booking => {
          const matchesTimeSlot = 
            (booking.startTime <= startTimeString && booking.endTime > startTimeString) || 
            (booking.startTime < endTimeString && booking.endTime >= endTimeString) ||
            (booking.startTime >= startTimeString && booking.endTime <= endTimeString);
          
          if (matchesTimeSlot) {
            console.log(`Slot ${startTimeString}-${endTimeString} matches booking:`, booking);
          }
          
          return matchesTimeSlot;
        });
        
        if (bookingForThisSlot) {
          console.log(`Slot ${startTimeString}-${endTimeString} is booked. Status: ${bookingForThisSlot.status}`);
          timeSlot.status = 'booked';
          timeSlot.bookingStatus = bookingForThisSlot.status || 'pending';
          timeSlot.bookingId = bookingForThisSlot.id;
        }
        
        slots.push(timeSlot);
      }
    }
    
    console.log("Generated time slots:", slots);
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
    if (!currentUser) {
      alert('Vui lòng đăng nhập để đặt sân!');
      return;
    }
    
    try {
      setBookingLoading(true);
      
      console.log('Thông tin sân khi đặt:', court);
      console.log('Slot được chọn:', selectedSlot);
      
      // Lấy thông tin user từ Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.exists() ? userSnap.data() : null;
      
      // Tính tổng tiền
      const price = court.price || 0;
      // Chuyển startTime và endTime thành phút
      const [startHour, startMinute] = selectedSlot.startTime.split(':').map(Number);
      const [endHour, endMinute] = selectedSlot.endTime.split(':').map(Number);
      
      const startTotalMinutes = startHour * 60 + startMinute;
      const endTotalMinutes = endHour * 60 + endMinute;
      
      const durationHours = (endTotalMinutes - startTotalMinutes) / 60;
      const totalPrice = price * durationHours;
      
      // Định dạng ngày
      const bookingDate = new Date(selectedDate);
      
      // Tạo dữ liệu đặt sân
      const bookingData = {
        courtId: court.id,
        courtName: court.name,
        ownerId: court.ownerId,
        userId: currentUser.uid,
        customerName: userData?.displayName || currentUser.displayName || 'Khách hàng',
        customerPhone: userData?.phoneNumber || '',
        customerEmail: userData?.email || currentUser.email || '',
        date: bookingDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        time: selectedSlot.time,
        duration: durationHours,
        totalPrice: totalPrice,
        sport: court.sport || 'Không xác định',
        status: 'pending',
        paymentStatus: 'unpaid',
        paymentMethod: paymentMethod,
        notes: note,
        address: court.address || '',
        createdAt: new Date(),
        courtImage: court.image || ''
      };
      
      console.log('Dữ liệu booking sẽ lưu vào Firestore:', bookingData);
      console.log('Owner ID của sân:', court.ownerId);
      
      // Lưu thông tin đặt sân vào Firestore
      const bookingsRef = collection(db, 'bookings');
      const newBookingRef = await addDoc(bookingsRef, bookingData);
      
      console.log('Đã lưu booking mới vào Firestore với ID:', newBookingRef.id);
      
      // Hiển thị thông báo thành công
      alert('Đặt sân thành công! Chủ sân sẽ xác nhận đặt sân của bạn sớm.');
      
      // Đóng dialog và cập nhật lại danh sách đặt sân
      setBookingOpen(false);
      setSelectedSlot(null);
      setNote('');
      setPaymentMethod('cash');
      
      // Thêm booking mới vào danh sách đặt sân hiện tại
      setExistingBookings(prevBookings => [
        ...prevBookings,
        {
          id: newBookingRef.id,
          ...bookingData
        }
      ]);
      
    } catch (error) {
      console.error('Lỗi khi đặt sân:', error);
      alert('Có lỗi xảy ra khi đặt sân. Vui lòng thử lại sau.');
    } finally {
      setBookingLoading(false);
    }
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
                  let statusColor, statusBgColor, statusText;
                  
                  if (slot.status === 'booked') {
                    if (slot.bookingStatus === 'confirmed') {
                      statusColor = '#d32f2f';
                      statusBgColor = '#ffebee';
                      statusText = 'Đã được đặt';
                    } else if (slot.bookingStatus === 'pending') {
                      statusColor = '#ff9800';
                      statusBgColor = '#fff3e0';
                      statusText = 'Đang chờ xác nhận';
                    } else {
                      statusColor = '#f44336';
                      statusBgColor = '#ffebee';
                      statusText = 'Đã đặt';
                    }
                  } else {
                    statusColor = '#4caf50';
                    statusBgColor = '#e8f5e9';
                    statusText = 'Còn trống';
                  }
                  
                  console.log(`Rendering slot ${slot.time} with status: ${slot.status}, bookingStatus: ${slot.bookingStatus}`);
                  
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
                        cursor: slot.status === 'booked' ? 'default' : 'pointer',
                        '&:hover': {
                          backgroundColor: slot.status === 'booked' ? statusBgColor : '#f5f5f5',
                        },
                        mb: 1
                      }}
                      onClick={() => slot.status === 'available' && handleBookingOpen(slot)}
                    >
                      <Typography variant="body2">{slot.time}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatPrice(slot.price)}
                      </Typography>
                      <Box 
                        sx={{ 
                          mt: 0.5, 
                          py: 0.25, 
                          px: 1, 
                          borderRadius: 1, 
                          fontSize: '0.7rem',
                          backgroundColor: statusColor,
                          color: 'white'
                        }}
                      >
                        {statusText}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
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
              <strong>Ngày:</strong> {selectedDate.toLocaleDateString('vi-VN')}
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
    </Box>
  );
};

export default CourtDetail; 