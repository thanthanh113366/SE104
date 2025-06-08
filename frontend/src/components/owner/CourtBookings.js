import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Tabs, 
  Tab, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TablePagination,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Grid,
  Divider,
  FormControl,
  InputLabel,
  Select,
  Stack,
  CircularProgress,
  Alert
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { vi } from 'date-fns/locale';
import { collection, query, where, getDocs, getDoc, doc, updateDoc, orderBy, Timestamp, limit } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventNoteIcon from '@mui/icons-material/EventNote';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import MoneyIcon from '@mui/icons-material/Money';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import RefreshIcon from '@mui/icons-material/Refresh';

// Dữ liệu mẫu để sử dụng khi không có dữ liệu thực
const SAMPLE_BOOKINGS = [
  {
    id: 'b1',
    courtId: 'court1',
    courtName: 'Sân bóng đá Mini Thành Công',
    customerName: 'Nguyễn Văn A',
    customerPhone: '0901234567',
    customerEmail: 'nguyenvana@example.com',
    date: '15/05/2023',
    startTime: '18:00',
    endTime: '20:00',
    duration: 2,
    totalPrice: 600000,
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: 'online',
    notes: 'Đặt sân cho 10 người',
    createdAt: '12/05/2023 09:15:22'
  },
  // Các booking khác...
];

const CourtBookings = () => {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [courts, setCourts] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  
  // State for filters
  const [dateFilter, setDateFilter] = useState(null);
  const [courtFilter, setCourtFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  
  // Fetch bookings from Firestore
  useEffect(() => {
    fetchBookings();
  }, [currentUser]);
  
  // Fetch courts list for filter dropdown
  useEffect(() => {
    const fetchCourts = async () => {
      try {
        if (!currentUser) return;
        
        const courtsRef = collection(db, 'courts');
        const q = query(courtsRef, where('ownerId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        const courtsList = [];
        querySnapshot.forEach(doc => {
          courtsList.push({
            id: doc.id,
            name: doc.data().name || 'Sân không tên'
          });
        });
        
        setCourts(courtsList);
      } catch (err) {
        console.error('Lỗi khi lấy danh sách sân:', err);
      }
    };
    
    fetchCourts();
  }, [currentUser]);
  
  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!currentUser) {
        console.log('Không có người dùng đăng nhập, sử dụng dữ liệu mẫu');
        setBookings(SAMPLE_BOOKINGS);
        return;
      }
      
      console.log('Đang lấy dữ liệu lịch đặt sân cho chủ sân:', currentUser.uid);
      
      // Đầu tiên lấy tất cả bookings để debug
      try {
        console.log('Lấy tất cả bookings để debug');
        const allBookingsRef = collection(db, 'bookings');
        const allBookingsSnapshot = await getDocs(allBookingsRef);
        
        if (allBookingsSnapshot.empty) {
          console.log('Không có booking nào trong cơ sở dữ liệu');
        } else {
          console.log(`Tổng số booking trong cơ sở dữ liệu: ${allBookingsSnapshot.size}`);
          
          // Hiển thị chi tiết từng booking để debug
          allBookingsSnapshot.forEach(doc => {
            const data = doc.data();
            console.log('------------------------------------');
            console.log(`Booking ID: ${doc.id}`);
            console.log(`ownerId: "${data.ownerId || 'không có'}"`);
            console.log(`courtId: "${data.courtId || 'không có'}"`);
            console.log(`userId: "${data.userId || 'không có'}"`);
            console.log(`Khách hàng: ${data.userName || 'không có'}`);
            
            // Check if owner ID matches
            if (data.ownerId === currentUser.uid) {
              console.log('>>> MATCH: ownerId trùng khớp với currentUser.uid');
            } else {
              console.log('>>> NO MATCH: ownerId không trùng khớp với currentUser.uid');
            }
          });
        }
      } catch (debugErr) {
        console.error('Lỗi khi lấy tất cả bookings để debug:', debugErr);
      }
      
      // Lấy danh sách sân của chủ sân
      let courtIds = [];
      try {
        const courtsRef = collection(db, 'courts');
        const courtsQuery = query(courtsRef, where('ownerId', '==', currentUser.uid));
        const courtsSnapshot = await getDocs(courtsQuery);
        
        if (courtsSnapshot.empty) {
          console.log('Không tìm thấy sân nào của chủ sân này');
        } else {
          courtIds = courtsSnapshot.docs.map(doc => doc.id);
          console.log('Danh sách ID sân của chủ sân:', courtIds);
        }
      } catch (err) {
        console.error('Lỗi khi lấy danh sách sân:', err);
      }
      
      // Phương pháp 1: Sử dụng chỉ where (không có orderBy) để tránh lỗi index
      console.log('Phương pháp 1: Lấy booking theo ownerId (không có orderBy)');
      const bookingsData = [];
      
      try {
        const bookingsRef = collection(db, 'bookings');
        const ownerBookingsQuery = query(
          bookingsRef,
          where('ownerId', '==', currentUser.uid)
        );
        
        const ownerBookingsSnapshot = await getDocs(ownerBookingsQuery);
        console.log(`Phương pháp 1: Tìm thấy ${ownerBookingsSnapshot.size} bookings với ownerId = ${currentUser.uid}`);
        
        // Thu thập dữ liệu booking từ kết quả tìm kiếm
        ownerBookingsSnapshot.forEach(doc => {
          const data = doc.data();
          console.log(`Đã tìm thấy booking ID: ${doc.id}, Khách hàng: ${data.userName}`);
          bookingsData.push({ id: doc.id, ...data });
        });
      } catch (err) {
        console.error('Lỗi khi lấy booking theo ownerId:', err);
      }
      
      // Phương pháp 2: Sử dụng truy vấn theo courtId
      if (courtIds.length > 0 && bookingsData.length === 0) {
        console.log('Phương pháp 2: Lấy booking theo courtId (không có orderBy)');
        
        try {
          // Truy vấn theo từng courtId riêng lẻ để tránh giới hạn "in" của Firestore
          for (const courtId of courtIds) {
            const bookingsRef = collection(db, 'bookings');
            const courtBookingsQuery = query(
              bookingsRef,
              where('courtId', '==', courtId)
            );
            
            const courtBookingsSnapshot = await getDocs(courtBookingsQuery);
            console.log(`Phương pháp 2: Tìm thấy ${courtBookingsSnapshot.size} bookings với courtId = ${courtId}`);
            
            // Thu thập dữ liệu booking từ kết quả tìm kiếm
            courtBookingsSnapshot.forEach(doc => {
              const data = doc.data();
              console.log(`Đã tìm thấy booking ID: ${doc.id}, Khách hàng: ${data.userName}`);
              
              // Kiểm tra xem booking đã có trong mảng kết quả chưa
              if (!bookingsData.some(b => b.id === doc.id)) {
                bookingsData.push({ id: doc.id, ...data });
              }
            });
          }
        } catch (err) {
          console.error('Lỗi khi lấy booking theo courtId:', err);
        }
      }
      
      console.log(`Tổng số unique bookings tìm thấy: ${bookingsData.length}`);
      
      if (bookingsData.length === 0) {
        console.log('Không tìm thấy booking nào, sử dụng dữ liệu mẫu');
        setBookings(SAMPLE_BOOKINGS);
        setLoading(false);
        setRefreshing(false);
        return;
      }
      
      // Xử lý và định dạng dữ liệu booking
      const formattedBookings = bookingsData.map(data => {
        try {
          // Format ngày tháng
          let formattedDate = 'Không rõ';
          if (data.date) {
            let dateObj;
            if (data.date instanceof Timestamp) {
              dateObj = data.date.toDate();
            } else if (data.date.toDate && typeof data.date.toDate === 'function') {
              dateObj = data.date.toDate();
            } else if (data.date instanceof Date) {
              dateObj = data.date;
            } else if (typeof data.date === 'string') {
              dateObj = new Date(data.date);
            } else {
              console.warn('Không thể xác định kiểu dữ liệu ngày:', data.date);
              dateObj = new Date();
            }
            
            formattedDate = dateObj.toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            });
          }
          
          // Format thời gian tạo
          let formattedCreatedAt = 'Không rõ';
          if (data.createdAt) {
            let createdAtObj;
            if (data.createdAt instanceof Timestamp) {
              createdAtObj = data.createdAt.toDate();
            } else if (data.createdAt.toDate && typeof data.createdAt.toDate === 'function') {
              createdAtObj = data.createdAt.toDate();
            } else if (data.createdAt instanceof Date) {
              createdAtObj = data.createdAt;
            } else if (typeof data.createdAt === 'string') {
              createdAtObj = new Date(data.createdAt);
            } else {
              console.warn('Không thể xác định kiểu dữ liệu thời gian tạo:', data.createdAt);
              createdAtObj = new Date();
            }
            
            formattedCreatedAt = createdAtObj.toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            });
          }
          
          // Trả về đối tượng booking đã định dạng
          return {
            id: data.id,
            courtId: data.courtId || '',
            courtName: data.courtName || 'Không có tên',
            customerName: data.userName || 'Không rõ',
            customerPhone: data.userPhone || 'Không rõ',
            customerEmail: data.userEmail || 'Không rõ',
            date: formattedDate,
            startTime: data.startTime || '',
            endTime: data.endTime || '',
            time: data.time || `${data.startTime || '00:00'}-${data.endTime || '00:00'}`,
            duration: data.duration || 0,
            totalPrice: data.totalPrice || 0,
            status: data.status || 'pending',
            paymentStatus: data.paymentStatus || 'unpaid',
            paymentMethod: data.paymentMethod || '',
            notes: data.notes || '',
            createdAt: formattedCreatedAt,
            rawData: data // Lưu trữ dữ liệu gốc nếu cần
          };
        } catch (formatErr) {
          console.error('Lỗi khi định dạng booking:', formatErr, data);
          // Trả về dữ liệu mặc định nếu có lỗi
          return {
            id: data.id || 'unknown',
            courtName: data.courtName || 'Lỗi định dạng',
            customerName: data.userName || 'Không rõ',
            date: 'Không xác định',
            time: 'Không xác định',
            status: 'pending',
            paymentStatus: 'unpaid'
          };
        }
      });
      
      console.log('Dữ liệu bookings đã xử lý:', formattedBookings);
      setBookings(formattedBookings);
      
    } catch (err) {
      console.error('Lỗi chung khi lấy dữ liệu lịch đặt sân:', err);
      setError(`Không thể tải dữ liệu lịch đặt sân: ${err.message}`);
      
      // Sử dụng dữ liệu mẫu nếu có lỗi
      setBookings(SAMPLE_BOOKINGS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Xử lý làm mới danh sách đặt sân
  const handleRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };
  
  // Xử lý thay đổi tab
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0);
  };
  
  // Lọc bookings dựa trên tab hiện tại và điều kiện tìm kiếm
  const filteredBookings = bookings.filter(booking => {
    // Lọc theo tab (trạng thái)
    if (tabValue === 0 && booking.status !== 'pending') return false;
    if (tabValue === 1 && booking.status !== 'confirmed') return false;
    if (tabValue === 2 && booking.status !== 'cancelled' && booking.status !== 'rejected') return false;
    if (tabValue === 3) { /* Tất cả booking */ }
    
    // Lọc theo tìm kiếm
    const searchLower = searchTerm.toLowerCase();
    if (
      searchTerm &&
      !booking.customerName.toLowerCase().includes(searchLower) &&
      !booking.customerPhone.toLowerCase().includes(searchLower) &&
      !booking.courtName.toLowerCase().includes(searchLower)
    ) {
      return false;
    }
    
    // Lọc theo ngày
    if (dateFilter && !booking.date.includes(formatDate(dateFilter))) {
      return false;
    }
    
    // Lọc theo sân
    if (courtFilter !== 'all' && booking.courtId !== courtFilter) {
      return false;
    }
    
    // Lọc theo trạng thái thanh toán
    if (paymentFilter !== 'all' && booking.paymentStatus !== paymentFilter) {
      return false;
    }
    
    return true;
  });
  
  // Format date để so sánh
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };
  
  // Xử lý thay đổi trang
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  // Xử lý thay đổi số hàng mỗi trang
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Xử lý mở menu
  const handleMenuClick = (event, booking) => {
    setAnchorEl(event.currentTarget);
    setSelectedBooking(booking);
  };
  
  // Đóng menu
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  // Mở dialog chi tiết đặt sân
  const handleOpenDetailDialog = () => {
    setDialogOpen(true);
    handleMenuClose();
  };
  
  // Đóng dialog chi tiết
  const handleCloseDetailDialog = () => {
    setDialogOpen(false);
  };
  
  // Mở dialog xác nhận hủy
  const handleOpenCancelDialog = () => {
    setCancelDialogOpen(true);
    handleMenuClose();
  };
  
  // Đóng dialog xác nhận hủy
  const handleCloseCancelDialog = () => {
    setCancelDialogOpen(false);
  };
  
  // Xử lý xác nhận đặt sân
  const handleConfirmBooking = async (bookingId) => {
    try {
      if (!bookingId) return;
      
      // Gọi API backend để xác nhận đặt sân (sẽ gửi email)
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/bookings/${bookingId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await auth.currentUser.getIdToken()}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Không thể xác nhận đặt sân');
      }
      
      const result = await response.json();
      console.log(`✅ Đã xác nhận đặt sân ${bookingId} và gửi email`);
      
      // Cập nhật state
      setBookings(bookings.map(booking => {
        if (booking.id === bookingId) {
          return { ...booking, status: 'confirmed' };
        }
        return booking;
      }));
      
      handleMenuClose();
    } catch (err) {
      console.error('Lỗi khi xác nhận đặt sân:', err);
      setError('Không thể xác nhận đặt sân. Vui lòng thử lại sau.');
    }
  };
  
  // Xử lý hủy đặt sân
  const handleCancelBooking = async () => {
    try {
      if (!selectedBooking) return;
      
      // Gọi API backend để từ chối đặt sân (sẽ gửi email)
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/bookings/${selectedBooking.id}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await auth.currentUser.getIdToken()}`
        },
        body: JSON.stringify({
          reason: 'Sân đã có lịch đặt khác' // Có thể thêm input để chủ sân nhập lý do
        })
      });
      
      if (!response.ok) {
        throw new Error('Không thể từ chối đặt sân');
      }
      
      const result = await response.json();
      console.log(`✅ Đã từ chối đặt sân ${selectedBooking.id} và gửi email`);
      
      // Cập nhật state
      setBookings(bookings.map(booking => {
        if (booking.id === selectedBooking.id) {
          return { ...booking, status: 'rejected' };
        }
        return booking;
      }));
      
      handleCloseCancelDialog();
    } catch (err) {
      console.error('Lỗi khi từ chối đặt sân:', err);
      setError('Không thể từ chối đặt sân. Vui lòng thử lại sau.');
    }
  };
  
  // Format tiền Việt Nam
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(amount).replace('₫', 'VNĐ');
  };
  
  // Lấy chip hiển thị trạng thái
  const getStatusChip = (status) => {
    switch (status) {
      case 'pending':
        return (
          <Chip 
            icon={<AccessTimeIcon fontSize="small" />} 
            label="Chờ xác nhận" 
            color="warning" 
            size="small" 
          />
        );
      case 'confirmed':
        return (
          <Chip 
            icon={<CheckCircleIcon fontSize="small" />} 
            label="Đã xác nhận" 
            color="success" 
            size="small" 
          />
        );
      case 'cancelled':
        return (
          <Chip 
            icon={<CancelIcon fontSize="small" />} 
            label="Đã hủy" 
            color="error" 
            size="small" 
          />
        );
      case 'rejected':
        return (
          <Chip 
            icon={<CancelIcon fontSize="small" />} 
            label="Đã từ chối" 
            color="error" 
            size="small" 
          />
        );
      default:
        return <Chip label={status} size="small" />;
    }
  };
  
  // Lấy chip hiển thị trạng thái thanh toán
  const getPaymentStatusChip = (status) => {
    switch (status) {
      case 'paid':
        return <Chip label="Đã thanh toán" color="success" size="small" />;
      case 'pending':
        return <Chip label="Chưa thanh toán" color="warning" size="small" />;
      case 'refunded':
        return <Chip label="Đã hoàn tiền" color="info" size="small" />;
      case 'partial':
        return <Chip label="Thanh toán một phần" color="warning" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };
  
  // Reset filter
  const handleResetFilter = () => {
    setDateFilter(null);
    setCourtFilter('all');
    setPaymentFilter('all');
    setFilterDialogOpen(false);
  };
  
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Quản lý lịch đặt sân
        </Typography>
        <Button
          variant="outlined"
          startIcon={refreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? 'Đang làm mới...' : 'Làm mới'}
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm theo tên, số điện thoại khách hàng hoặc tên sân..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => setFilterDialogOpen(true)}
            >
              Lọc nâng cao
            </Button>
          </Grid>
        </Grid>
      </Box>
      
      {/* Tab và bảng hiển thị */}
      <Paper sx={{ borderRadius: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label={`Chờ xác nhận (${bookings.filter(b => b.status === 'pending').length})`} />
          <Tab label={`Đã xác nhận (${bookings.filter(b => b.status === 'confirmed').length})`} />
          <Tab label={`Đã hủy (${bookings.filter(b => b.status === 'cancelled' || b.status === 'rejected').length})`} />
          <Tab label="Tất cả" />
        </Tabs>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Mã đặt sân</TableCell>
                    <TableCell>Khách hàng</TableCell>
                    <TableCell>Sân</TableCell>
                    <TableCell>Ngày</TableCell>
                    <TableCell>Thời gian</TableCell>
                    <TableCell>Giá tiền</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell>Thanh toán</TableCell>
                    <TableCell align="right">Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredBookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                        <Typography variant="subtitle1">
                          Không tìm thấy lịch đặt sân nào phù hợp
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBookings
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((booking) => (
                        <TableRow key={booking.id} hover>
                          <TableCell>{booking.id}</TableCell>
                          <TableCell>{booking.customerName}</TableCell>
                          <TableCell>{booking.courtName}</TableCell>
                          <TableCell>{booking.date}</TableCell>
                          <TableCell>{`${booking.startTime} - ${booking.endTime}`}</TableCell>
                          <TableCell>{formatCurrency(booking.totalPrice)}</TableCell>
                          <TableCell>{getStatusChip(booking.status)}</TableCell>
                          <TableCell>{getPaymentStatusChip(booking.paymentStatus)}</TableCell>
                          <TableCell align="right">
                            <IconButton
                              onClick={(e) => handleMenuClick(e, booking)}
                              size="small"
                            >
                              <MoreVertIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredBookings.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Số hàng mỗi trang:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
            />
          </>
        )}
      </Paper>
      
      {/* Menu for booking actions */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleOpenDetailDialog}>
          <EventNoteIcon fontSize="small" sx={{ mr: 1 }} />
          Xem chi tiết
        </MenuItem>
        
        {selectedBooking && selectedBooking.status === 'pending' && (
          <MenuItem onClick={() => handleConfirmBooking(selectedBooking.id)}>
            <CheckCircleIcon fontSize="small" sx={{ mr: 1 }} />
            Xác nhận đặt sân
          </MenuItem>
        )}
        
        {selectedBooking && (selectedBooking.status === 'pending' || selectedBooking.status === 'confirmed') && (
          <MenuItem onClick={handleOpenCancelDialog}>
            <CancelIcon fontSize="small" sx={{ mr: 1 }} />
            {selectedBooking.status === 'pending' ? 'Từ chối đặt sân' : 'Hủy đặt sân'}
          </MenuItem>
        )}
      </Menu>
      
      {/* Dialog for viewing booking details */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDetailDialog}
        maxWidth="sm"
        fullWidth
      >
        {selectedBooking && (
          <>
            <DialogTitle>
              Chi tiết đặt sân
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SportsSoccerIcon sx={{ mr: 1 }} /> Thông tin sân
                </Typography>
                
                <Stack spacing={2} sx={{ mb: 3 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Tên sân</Typography>
                    <Typography variant="body1">{selectedBooking.courtName}</Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">Ngày đặt</Typography>
                    <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarTodayIcon fontSize="small" sx={{ mr: 1 }} />
                      {selectedBooking.date}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">Thời gian</Typography>
                    <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccessTimeIcon fontSize="small" sx={{ mr: 1 }} />
                      {selectedBooking.startTime} - {selectedBooking.endTime} ({selectedBooking.duration} giờ)
                    </Typography>
                  </Box>
                </Stack>
                
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', mb: 2 }}>
                  <MoneyIcon sx={{ mr: 1 }} /> Thông tin thanh toán
                </Typography>
                
                <Stack spacing={2} sx={{ mb: 3 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Tổng tiền</Typography>
                    <Typography variant="body1">{formatCurrency(selectedBooking.totalPrice)}</Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">Trạng thái thanh toán</Typography>
                    <Box sx={{ mt: 0.5 }}>
                      {getPaymentStatusChip(selectedBooking.paymentStatus)}
                    </Box>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">Phương thức thanh toán</Typography>
                    <Typography variant="body1">{selectedBooking.paymentMethod}</Typography>
                  </Box>
                </Stack>
                
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PersonIcon sx={{ mr: 1 }} /> Thông tin khách hàng
                </Typography>
                
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Họ tên</Typography>
                    <Typography variant="body1">{selectedBooking.customerName}</Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">Số điện thoại</Typography>
                    <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                      <PhoneIcon fontSize="small" sx={{ mr: 1 }} />
                      {selectedBooking.customerPhone}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">Email</Typography>
                    <Typography variant="body1">{selectedBooking.customerEmail}</Typography>
                  </Box>
                  
                  {selectedBooking.notes && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">Ghi chú</Typography>
                      <Typography variant="body1">{selectedBooking.notes}</Typography>
                    </Box>
                  )}
                </Stack>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={handleCloseDetailDialog}
                variant="outlined"
              >
                Đóng
              </Button>
              {selectedBooking.status === 'pending' && (
                <Button
                  onClick={() => {
                    handleConfirmBooking(selectedBooking.id);
                    handleCloseDetailDialog();
                  }}
                  variant="contained"
                  color="primary"
                  startIcon={<CheckCircleIcon />}
                >
                  Xác nhận đặt sân
                </Button>
              )}
              {(selectedBooking.status === 'pending' || selectedBooking.status === 'confirmed') && (
                <Button
                  onClick={() => {
                    handleCloseDetailDialog();
                    handleOpenCancelDialog();
                  }}
                  variant="contained"
                  color="error"
                  startIcon={<CancelIcon />}
                >
                  {selectedBooking.status === 'pending' ? 'Từ chối đặt sân' : 'Hủy đặt sân'}
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Dialog for canceling booking */}
      <Dialog
        open={cancelDialogOpen}
        onClose={handleCloseCancelDialog}
      >
        <DialogTitle>
          Xác nhận hủy đặt sân
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn hủy đặt sân này không? Hành động này có thể ảnh hưởng đến trải nghiệm của khách hàng.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCancelDialog}>
            Không
          </Button>
          <Button onClick={handleCancelBooking} color="error">
            Đồng ý
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog for advanced filtering */}
      <Dialog
        open={filterDialogOpen}
        onClose={() => setFilterDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Lọc nâng cao
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
                <DatePicker
                  label="Lọc theo ngày"
                  value={dateFilter}
                  onChange={(newValue) => setDateFilter(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  inputFormat="dd/MM/yyyy"
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="court-filter-label">Sân</InputLabel>
                <Select
                  labelId="court-filter-label"
                  value={courtFilter}
                  label="Sân"
                  onChange={(e) => setCourtFilter(e.target.value)}
                >
                  <MenuItem value="all">Tất cả sân</MenuItem>
                  {courts.map((court) => (
                    <MenuItem key={court.id} value={court.id}>
                      {court.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="payment-filter-label">Trạng thái thanh toán</InputLabel>
                <Select
                  labelId="payment-filter-label"
                  value={paymentFilter}
                  label="Trạng thái thanh toán"
                  onChange={(e) => setPaymentFilter(e.target.value)}
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  <MenuItem value="paid">Đã thanh toán</MenuItem>
                  <MenuItem value="pending">Chưa thanh toán</MenuItem>
                  <MenuItem value="refunded">Đã hoàn tiền</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleResetFilter}>
            Đặt lại
          </Button>
          <Button
            onClick={() => setFilterDialogOpen(false)}
            variant="contained"
          >
            Áp dụng
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Hiển thị thời gian cập nhật gần nhất */}
      <Box sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
        <Typography variant="caption">
          Cập nhật lúc: {new Date().toLocaleTimeString()}
        </Typography>
      </Box>
    </Box>
  );
};

export default CourtBookings; 