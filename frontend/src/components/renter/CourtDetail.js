import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
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
import ReviewServiceWrapper from '../../services/reviewServiceWrapper';
import PaymentDialog from '../payment/PaymentDialog';

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
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
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
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [writeReviewOpen, setWriteReviewOpen] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [userCompletedBookings, setUserCompletedBookings] = useState([]);
  const [availableBookingsToReview, setAvailableBookingsToReview] = useState([]);
  
  // Payment states
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [createdBooking, setCreatedBooking] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  
  // Payment success handler (đặt trước useEffect để tránh hoisting error)
  const handlePaymentSuccess = useCallback(async (payment) => {
    // Prevent multiple calls
    if (paymentProcessing) {
      console.log('Payment already processing, skipping...');
      return;
    }
    
    try {
      setPaymentProcessing(true);
      console.log('=== handlePaymentSuccess started ===');
      console.log('Payment successful:', payment);
      
      // Lấy booking data từ state hoặc localStorage
      let bookingData = createdBooking;
      if (!bookingData) {
        const pendingBookingStr = localStorage.getItem('pendingBooking');
        if (pendingBookingStr) {
          bookingData = JSON.parse(pendingBookingStr);
          console.log('Recovered booking data from localStorage:', bookingData);
        }
      }
      
      if (!bookingData) {
        throw new Error('Không tìm thấy thông tin booking');
      }

      // Tạo booking trong database sau khi thanh toán thành công
      // Chỉ gửi những field cần thiết cho backend API
      const finalBookingData = {
        courtId: bookingData.courtId,
        date: bookingData.date,
        startTime: bookingData.startTime,
        endTime: bookingData.endTime,
        totalPrice: Number(bookingData.totalPrice) || Number(bookingData.price) || 0,
        note: bookingData.note || ''
      };

      console.log('Đang tạo booking sau thanh toán thành công:', finalBookingData);

      const response = await BookingServiceWrapper.createBooking(courtId, finalBookingData);
      console.log('Booking creation response:', response);
      
      if (response && response.id) {
        console.log('Booking created successfully with ID:', response.id);
        setPaymentDialogOpen(false);
        setCreatedBooking(null);
        
        // Clear localStorage
        localStorage.removeItem('pendingBooking');
        localStorage.removeItem('paymentSuccess');
        localStorage.removeItem('paymentError');
        
        // Show success message
        setBookingSuccess({
          ...finalBookingData,
          ...bookingData, // Include original booking data
          totalPrice: Number(bookingData.totalPrice) || Number(bookingData.price) || 0,
          id: response.id
        });
        setSuccessDialogOpen(true);
        console.log('Success dialog opened');
      } else {
        console.error('Invalid response from booking creation:', response);
        throw new Error('Không thể tạo booking sau thanh toán');
      }
    } catch (error) {
      console.error('Lỗi tạo booking sau thanh toán:', error);
      setPaymentDialogOpen(false);
      setError('Thanh toán thành công nhưng có lỗi khi tạo đặt sân. Vui lòng liên hệ hỗ trợ.');
    } finally {
      setPaymentProcessing(false);
      console.log('=== handlePaymentSuccess completed ===');
    }
  }, [createdBooking, courtId, paymentProcessing]);
  
  // Xử lý payment success từ URL params (MoMo return)
  useEffect(() => {
    const handlePaymentReturn = async () => {
      const paymentStatus = searchParams.get('payment');
      const orderId = searchParams.get('orderId');
      
      if (paymentStatus === 'success' && orderId) {
        // Check if already processing to prevent duplicate calls
        if (paymentProcessing) {
          console.log('Payment already processing, skipping URL params handler');
          return;
        }
        
        console.log('=== Payment Success Detected from URL ===');
        console.log('Order ID:', orderId);
        
        // Remove URL params immediately to prevent re-processing
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
        
        // Lấy booking data từ localStorage
        const pendingBookingStr = localStorage.getItem('pendingBooking');
        if (!pendingBookingStr) {
          console.log('No pending booking found in localStorage');
          return;
        }
        
        let pendingBooking;
        try {
          pendingBooking = JSON.parse(pendingBookingStr);
          console.log('Pending Booking:', pendingBooking);
        } catch (error) {
          console.error('Error parsing pending booking:', error);
          return;
        }
        
        // Set createdBooking state
        setCreatedBooking(pendingBooking);
        
        // Đóng payment dialog nếu đang mở
        setPaymentDialogOpen(false);
        
        // Simulate payment object
        const paymentData = {
          id: orderId,
          orderId: orderId,
          status: 'completed'
        };
        
        // Gọi handlePaymentSuccess để tạo booking thật
        await handlePaymentSuccess(paymentData);
        
        // Clear localStorage
        localStorage.removeItem('pendingBooking');
      }
    };

    if (searchParams.get('payment')) {
      handlePaymentReturn();
    }
  }, [searchParams, handlePaymentSuccess, paymentProcessing]);

  // Listen cho localStorage changes để detect thanh toán thành công từ tab khác
  useEffect(() => {
    const handleStorageChange = (e) => {
      console.log('localStorage change detected:', e.key, e.newValue);
      
      // Skip if already processing payment
      if (paymentProcessing) {
        console.log('Payment already processing, ignoring storage event');
        return;
      }
      
      if (e.key === 'paymentSuccess' && e.newValue) {
        console.log('Payment success detected from another tab');
        const paymentData = JSON.parse(e.newValue);
        
        // Đóng payment dialog nếu đang mở
        setPaymentDialogOpen(false);
        
        // Gọi handlePaymentSuccess để tạo booking
        handlePaymentSuccess(paymentData);
        
        // Clear localStorage
        localStorage.removeItem('paymentSuccess');
      } else if (e.key === 'paymentError' && e.newValue) {
        console.log('Payment error detected from another tab');
        const errorData = JSON.parse(e.newValue);
        
        // Đóng payment dialog và show error
        setPaymentDialogOpen(false);
        setError(errorData.message || 'Thanh toán thất bại');
        
        // Clear localStorage
        localStorage.removeItem('paymentError');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [handlePaymentSuccess, paymentProcessing]);

  // Xử lý state từ navigate (từ MyRatings)
  useEffect(() => {
    console.log('CourtDetail location.state:', location.state);
    
    if (location.state?.openReviewDialog && location.state?.booking) {
      console.log('Opening review dialog with booking:', location.state.booking);
      setSelectedBookingForReview(location.state.booking);
      setWriteReviewOpen(true);
      
      // Clear state để tránh mở lại khi component re-render
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);
  
  // Helper function để chuyển đổi Firestore timestamp sang Date nếu cần
  const convertFirestoreDate = (firestoreDate) => {
    if (!firestoreDate) return null;
    
    try {
      // Nếu là Firestore Timestamp, chuyển về Date
      if (firestoreDate && typeof firestoreDate.toDate === 'function') {
        return firestoreDate.toDate();
      }
      
      // Nếu là Date string, chuyển về Date
      if (typeof firestoreDate === 'string') {
        const convertedDate = new Date(firestoreDate);
        return isNaN(convertedDate.getTime()) ? null : convertedDate;
      }
      
      // Nếu đã là Date object, kiểm tra tính hợp lệ
      if (firestoreDate instanceof Date) {
        return isNaN(firestoreDate.getTime()) ? null : firestoreDate;
      }
      
      // Nếu là object có properties seconds (Firestore timestamp format)
      if (firestoreDate && typeof firestoreDate === 'object' && firestoreDate.seconds) {
        return new Date(firestoreDate.seconds * 1000);
      }
      
      return null;
    } catch (error) {
      console.error('Lỗi convert Firestore date:', error);
      return null;
    }
  };
  
  // Helper function để format thời gian hiển thị
  const formatDate = (date) => {
    if (!date) return 'Không rõ thời gian';
    
    try {
      const convertedDate = convertFirestoreDate(date);
      if (!convertedDate || isNaN(convertedDate.getTime())) {
        return 'Không rõ thời gian';
      }
      return convertedDate.toLocaleDateString('vi-VN');
    } catch (error) {
      console.error('Lỗi format date:', error);
      return 'Không rõ thời gian';
    }
  };
  
  // Helper function để kiểm tra xem hai ngày có cùng một ngày không
  const isSameDay = (date1, date2) => {
    const d1 = convertFirestoreDate(date1);
    const d2 = convertFirestoreDate(date2);
    
    if (!d1 || !d2) return false;
    
    try {
      return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
      );
    } catch (error) {
      console.error('Lỗi so sánh ngày:', error);
      return false;
    }
  };
  
  // Fetch court data
  useEffect(() => {
    const fetchCourtDetails = async () => {
      try {
        setLoading(true);
        
        const courtData = await CourtServiceWrapper.getCourtById(courtId);
        
        if (courtData) {
          setCourt(courtData);
        } else {
          setError('Không tìm thấy thông tin sân');
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
  
  // Fetch existing bookings với interval 1 phút
  useEffect(() => {
    let intervalId;
    
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
    
    // Fetch ngay lập tức
    fetchExistingBookings();
    
    // Sau đó fetch mỗi 1 phút (60000ms)
    intervalId = setInterval(fetchExistingBookings, 60000);
    
    // Cleanup interval khi component unmount hoặc dependencies thay đổi
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [court, courtId, selectedDate]);
  
  // Fetch court reviews
  useEffect(() => {
    const fetchCourtReviews = async () => {
      try {
        if (!court) return;
        setReviewsLoading(true);
        
        const response = await ReviewServiceWrapper.getCourtReviews(courtId, { limit: 20 });
        if (response && response.reviews) {
          setReviews(response.reviews);
        } else {
          setReviews([]);
        }
      } catch (error) {
        console.error('Lỗi khi lấy đánh giá sân:', error);
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    };
    
    fetchCourtReviews();
  }, [court, courtId]);
  
  // Fetch user's completed bookings for this court với interval 2 phút
  useEffect(() => {
    let intervalId;
    
    const fetchUserBookingsForCourt = async () => {
      try {
        if (!court || !currentUser) return;
        
        console.log('=== DEBUG: Đang lấy booking history cho user ===');
        console.log('Court ID:', courtId);
        console.log('User ID:', currentUser.uid);
        
        // Lấy tất cả booking của user
        const response = await BookingServiceWrapper.getUserBookings(currentUser.uid);
        console.log('=== DEBUG: Response từ getUserBookings ===', response);
        
        if (response && response.bookings) {
          console.log('=== DEBUG: Tất cả bookings của user ===', response.bookings);
          
          // Lọc booking cho sân này và đã hoàn thành
          const completedBookingsForThisCourt = response.bookings.filter(booking => {
            console.log(`Checking booking ${booking.id}: courtId=${booking.courtId}, status=${booking.status}`);
            return booking.courtId === courtId && booking.status === 'completed';
          });
          
          console.log('=== DEBUG: Completed bookings cho sân này ===', completedBookingsForThisCourt);
          setUserCompletedBookings(completedBookingsForThisCourt);
          
          // Kiểm tra booking nào chưa được đánh giá
          const bookingsToReview = [];
          for (const booking of completedBookingsForThisCourt) {
            try {
              console.log(`=== DEBUG: Kiểm tra quyền đánh giá cho booking ${booking.id} ===`);
              const canReviewResponse = await ReviewServiceWrapper.canUserReviewBooking(booking.id);
              console.log('Can review response:', canReviewResponse);
              
              if (canReviewResponse && canReviewResponse.canReview) {
                bookingsToReview.push(booking);
                console.log(`Booking ${booking.id} có thể đánh giá`);
              } else {
                console.log(`Booking ${booking.id} không thể đánh giá:`, canReviewResponse?.reason);
              }
            } catch (error) {
              console.error(`Lỗi kiểm tra quyền đánh giá booking ${booking.id}:`, error);
            }
          }
          
          console.log('=== DEBUG: Final bookings có thể đánh giá ===', bookingsToReview);
          setAvailableBookingsToReview(bookingsToReview);
        } else {
          console.log('=== DEBUG: Không có bookings nào ===');
        }
      } catch (error) {
        console.error('Lỗi khi lấy booking history:', error);
      }
    };
    
    // Fetch ngay lập tức
    fetchUserBookingsForCourt();
    
    // Sau đó fetch mỗi 2 phút (120000ms) để ít gây tải hơn
    intervalId = setInterval(fetchUserBookingsForCourt, 120000);
    
    // Cleanup interval
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [court, courtId, currentUser]);
  
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

      // Chuẩn bị dữ liệu đặt sân (chưa tạo booking thực tế)
      const bookingData = {
        userId: currentUser.uid,
        userName: userDetails?.displayName || currentUser.email?.split('@')[0] || 'Người dùng',
        userEmail: currentUser.email,
        userPhone: userDetails?.phoneNumber || userDetails?.phone || 'Chưa cung cấp',
        ownerId: court.ownerId,
        courtId: court.id,
        courtName: court.name,
        sport: court.sport,
        address: court.address,
        date: selectedDate.toISOString().split('T')[0], // Convert Date to string
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        time: `${selectedSlot.startTime}-${selectedSlot.endTime}`,
        price: selectedSlot.price,
        totalPrice: Number(selectedSlot.price),
        paymentMethod,
        note,
        status: 'pending', // Sẽ thành 'confirmed' sau khi thanh toán thành công
        createdAt: new Date().toISOString(), // Convert to string
        updatedAt: new Date().toISOString()  // Convert to string
      };

      console.log('Chuẩn bị dữ liệu đặt sân:', bookingData);

      // Lưu dữ liệu booking để sử dụng sau khi thanh toán thành công
      setCreatedBooking(bookingData);
      
      // Lưu vào localStorage để cross-tab communication
      localStorage.setItem('pendingBooking', JSON.stringify(bookingData));
      
      setBookingOpen(false);
      
      // Kiểm tra payment method
      if (paymentMethod === 'momo') {
        // Mở payment dialog cho MoMo
        setPaymentDialogOpen(true);
      } else {
        // Tạo booking trực tiếp cho cash/banking
        const response = await BookingServiceWrapper.createBooking(courtId, {
          courtId: bookingData.courtId,
          date: bookingData.date,
          startTime: bookingData.startTime,
          endTime: bookingData.endTime,
          totalPrice: bookingData.totalPrice,
          note: bookingData.note || ''
        });
        
        if (response && response.id) {
          setBookingSuccess({
            ...bookingData,
            id: response.id
          });
          setSuccessDialogOpen(true);
        }
      }
    } catch (error) {
      console.error('Lỗi khi chuẩn bị đặt sân:', error);
      setError('Rất tiếc! Đã có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setBookingLoading(false);
    }
  };
  
  const handleSuccessDialogClose = () => {
    setSuccessDialogOpen(false);
    window.location.reload();
  };

  // Payment handlers

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    setPaymentDialogOpen(false);
    setCreatedBooking(null); // Xóa dữ liệu booking chưa hoàn tất
    
    // Show error message - không tạo booking nếu thanh toán thất bại
    setError('Thanh toán không thành công. Vui lòng thử lại để đặt sân.');
  };

  const handlePaymentDialogClose = () => {
    setPaymentDialogOpen(false);
    setCreatedBooking(null); // Xóa dữ liệu booking chưa hoàn tất
    
    // Không cần reload vì chưa có booking nào được tạo
    console.log('Payment dialog closed - no booking created');
  };
  
  // Handlers cho review
  const handleWriteReviewOpen = (booking) => {
    setSelectedBookingForReview(booking);
    setWriteReviewOpen(true);
    setReviewRating(5);
    setReviewComment('');
  };

  const handleWriteReviewClose = () => {
    setWriteReviewOpen(false);
    setSelectedBookingForReview(null);
    setReviewRating(5);
    setReviewComment('');
  };

  const handleSubmitReview = async () => {
    try {
      if (!selectedBookingForReview || !reviewComment.trim()) {
        return;
      }

      setReviewSubmitting(true);

      const reviewData = {
        courtId: court.id,
        bookingId: selectedBookingForReview.id,
        rating: reviewRating,
        comment: reviewComment.trim(),
        userName: userDetails?.displayName || currentUser.email?.split('@')[0] || 'Người dùng ẩn danh'
      };

      await ReviewServiceWrapper.createReview(reviewData);
      
      // Refresh reviews
      const response = await ReviewServiceWrapper.getCourtReviews(courtId, { limit: 20 });
      if (response && response.reviews) {
        setReviews(response.reviews);
      }

      // Refresh available bookings to review
      const userBookingsResponse = await BookingServiceWrapper.getUserBookings(currentUser.uid);
      if (userBookingsResponse && userBookingsResponse.bookings) {
        const completedBookingsForThisCourt = userBookingsResponse.bookings.filter(booking => 
          booking.courtId === courtId && booking.status === 'completed'
        );
        
        // Kiểm tra lại booking nào chưa được đánh giá
        const bookingsToReview = [];
        for (const booking of completedBookingsForThisCourt) {
          try {
            const canReviewResponse = await ReviewServiceWrapper.canUserReviewBooking(booking.id);
            if (canReviewResponse && canReviewResponse.canReview) {
              bookingsToReview.push(booking);
            }
          } catch (error) {
            console.error(`Lỗi kiểm tra quyền đánh giá booking ${booking.id}:`, error);
          }
        }
        
        setAvailableBookingsToReview(bookingsToReview);
      }

      handleWriteReviewClose();
      
      // Show success message
      alert('Đánh giá thành công!');
    } catch (error) {
      console.error('Lỗi khi gửi đánh giá:', error);
      alert('Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại.');
    } finally {
      setReviewSubmitting(false);
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
              {court.description || 'Chưa có mô tả cho sân này.'}
            </Typography>
            
            <Typography variant="h6" gutterBottom>Tiện ích</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap={true} sx={{ mb: 2 }}>
              {court.facilities && court.facilities.length > 0 ? (
                court.facilities.map((facility, index) => (
                  <Chip key={index} label={facility} sx={{ m: 0.5 }} />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Chưa có thông tin tiện ích
                </Typography>
              )}
            </Stack>
            
            <Typography variant="h6" gutterBottom>Liên hệ chủ sân</Typography>
            <Typography variant="body1">
              {court.owner ? `${court.owner.name || 'Chưa có tên'} - ${court.owner.phone || 'Chưa có số điện thoại'}` : 'Chưa có thông tin liên hệ'}
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5">
                Đánh giá ({reviews.length})
              </Typography>
              
              {/* Nút viết đánh giá - chỉ hiện cho user đã đăng nhận và có booking completed chưa đánh giá */}
              {currentUser && availableBookingsToReview.length > 0 && (
                <Button
                  variant="outlined"
                  onClick={() => {
                    // Nếu chỉ có 1 booking, dùng booking đó
                    if (availableBookingsToReview.length === 1) {
                      handleWriteReviewOpen(availableBookingsToReview[0]);
                    } else {
                      // Nếu có nhiều booking, cho user chọn (tạm thời dùng booking đầu tiên)
                      handleWriteReviewOpen(availableBookingsToReview[0]);
                    }
                  }}
                  sx={{ ml: 2 }}
                >
                  Viết đánh giá ({availableBookingsToReview.length})
                </Button>
              )}
            </Box>
            
            {reviewsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : reviews.length > 0 ? (
              <Box>
                {reviews.map((review) => (
                  <Box key={review.id} sx={{ py: 2 }}>
                    <Grid container spacing={1}>
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {review.userName || review.userId || 'Người dùng ẩn danh'}
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
                            {formatDate(review.createdAt)}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body1">
                          {review.comment}
                        </Typography>
                      </Grid>
                      
                      {/* Phản hồi từ chủ sân nếu có */}
                      {review.ownerReply && (
                        <Grid item xs={12}>
                          <Box sx={{ 
                            ml: 2, 
                            pl: 2, 
                            borderLeft: '3px solid #e0e0e0',
                            mt: 1,
                            bgcolor: '#f5f5f5',
                            borderRadius: 1,
                            p: 2
                          }}>
                            <Typography variant="subtitle2" fontWeight="bold" color="primary">
                              Phản hồi từ chủ sân:
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              {review.ownerReply}
                            </Typography>
                            {review.replyAt && (
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(review.replyAt)}
                              </Typography>
                            )}
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                    <Divider sx={{ mt: 2 }} />
                  </Box>
                ))}
              </Box>
            ) : (
              <Alert severity="info">
                Chưa có đánh giá nào cho sân này. Hãy là người đầu tiên đánh giá!
              </Alert>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Write Review Dialog */}
      <Dialog open={writeReviewOpen} onClose={handleWriteReviewClose} maxWidth="md" fullWidth>
        <DialogTitle>Viết đánh giá cho sân</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              {court.name}
            </Typography>
            
            {/* Hiển thị thông tin booking đang được đánh giá */}
            {selectedBookingForReview && (
              <Box sx={{ 
                p: 2, 
                mb: 3, 
                bgcolor: '#f5f5f5', 
                borderRadius: 1,
                border: '1px solid #e0e0e0'
              }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Thông tin lượt đặt sân:
                </Typography>
                <Typography variant="body2">
                  📅 Ngày: {selectedBookingForReview.date ? 
                    formatDate(selectedBookingForReview.date) : 'N/A'}
                </Typography>
                <Typography variant="body2">
                  ⏰ Giờ: {selectedBookingForReview.startTime} - {selectedBookingForReview.endTime}
                </Typography>
                <Typography variant="body2">
                  💰 Giá: {formatPrice(selectedBookingForReview.totalPrice || selectedBookingForReview.price)}
                </Typography>
              </Box>
            )}
            
            <Typography variant="body1" gutterBottom sx={{ mb: 3 }}>
              Đánh giá chất lượng sân:
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Typography variant="body1" sx={{ mr: 2 }}>
                Điểm đánh giá:
              </Typography>
              <Rating
                value={reviewRating}
                onChange={(event, newValue) => {
                  setReviewRating(newValue);
                }}
                size="large"
              />
              <Typography variant="body2" sx={{ ml: 1 }}>
                ({reviewRating}/5)
              </Typography>
            </Box>
            
            <TextField
              fullWidth
              label="Nhận xét của bạn"
              multiline
              rows={4}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn về sân này..."
              helperText="Hãy chia sẻ ý kiến trung thực để giúp những người khác có sự lựa chọn tốt hơn"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleWriteReviewClose}>Hủy</Button>
          <Button 
            variant="contained" 
            onClick={handleSubmitReview} 
            disabled={reviewSubmitting || !reviewComment.trim()}
          >
            {reviewSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
          </Button>
        </DialogActions>
      </Dialog>
      
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
                    💰 Giá: {formatPrice(bookingSuccess.totalPrice || bookingSuccess.price)}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="body1" paragraph>
                Chủ sân sẽ liên hệ với bạn qua số điện thoại {userDetails?.phoneNumber || userDetails?.phone || 'đã đăng ký'} để xác nhận đơn đặt sân.
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

      {/* Payment Dialog */}
      <PaymentDialog
        open={paymentDialogOpen}
        onClose={handlePaymentDialogClose}
        booking={createdBooking}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={handlePaymentError}
      />
    </Box>
  );
};

export default CourtDetail; 