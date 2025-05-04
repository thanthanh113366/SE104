import React, { useState } from 'react';
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
  Stack
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { vi } from 'date-fns/locale';

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

// Dữ liệu mẫu
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
  {
    id: 'b2',
    courtId: 'court2',
    courtName: 'Sân cầu lông Olympia',
    customerName: 'Trần Thị B',
    customerPhone: '0912345678',
    customerEmail: 'tranthib@example.com',
    date: '16/05/2023',
    startTime: '07:00',
    endTime: '09:00',
    duration: 2,
    totalPrice: 240000,
    status: 'pending',
    paymentStatus: 'pending',
    paymentMethod: 'cash',
    notes: 'Cần chuẩn bị vợt và cầu',
    createdAt: '14/05/2023 14:30:45'
  },
  {
    id: 'b3',
    courtId: 'court3',
    courtName: 'Sân bóng rổ Hòa Bình',
    customerName: 'Lê Văn C',
    customerPhone: '0923456789',
    customerEmail: 'levanc@example.com',
    date: '16/05/2023',
    startTime: '15:30',
    endTime: '17:00',
    duration: 1.5,
    totalPrice: 300000,
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: 'online',
    notes: '',
    createdAt: '13/05/2023 18:22:33'
  },
  {
    id: 'b4',
    courtId: 'court1',
    courtName: 'Sân bóng đá Mini Thành Công',
    customerName: 'Phạm Văn D',
    customerPhone: '0934567890',
    customerEmail: 'phamvand@example.com',
    date: '17/05/2023',
    startTime: '19:00',
    endTime: '21:00',
    duration: 2,
    totalPrice: 600000,
    status: 'cancelled',
    paymentStatus: 'refunded',
    paymentMethod: 'online',
    notes: 'Hủy do thời tiết xấu',
    createdAt: '14/05/2023 20:10:05'
  },
  {
    id: 'b5',
    courtId: 'court4',
    courtName: 'Sân tennis Lakeview',
    customerName: 'Hoàng Thị E',
    customerPhone: '0945678901',
    customerEmail: 'hoangthie@example.com',
    date: '18/05/2023',
    startTime: '08:00',
    endTime: '10:00',
    duration: 2,
    totalPrice: 500000,
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: 'online',
    notes: '',
    createdAt: '15/05/2023 07:55:41'
  },
  // Thêm các booking khác
  {
    id: 'b6',
    courtId: 'court2',
    courtName: 'Sân cầu lông Olympia',
    customerName: 'Trương Văn F',
    customerPhone: '0956789012',
    customerEmail: 'truongvanf@example.com',
    date: '19/05/2023',
    startTime: '16:00',
    endTime: '18:00',
    duration: 2,
    totalPrice: 240000,
    status: 'pending',
    paymentStatus: 'pending',
    paymentMethod: 'cash',
    notes: '',
    createdAt: '16/05/2023 10:12:33'
  }
];

const CourtBookings = () => {
  const [bookings, setBookings] = useState(SAMPLE_BOOKINGS);
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  
  // State for filters
  const [dateFilter, setDateFilter] = useState(null);
  const [courtFilter, setCourtFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  
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
    if (tabValue === 2 && booking.status !== 'cancelled') return false;
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
  
  // Mở dialog chi tiết booking
  const handleOpenDetailDialog = () => {
    setDialogOpen(true);
    handleMenuClose();
  };
  
  // Đóng dialog chi tiết booking
  const handleCloseDetailDialog = () => {
    setDialogOpen(false);
  };
  
  // Mở dialog hủy booking
  const handleOpenCancelDialog = () => {
    setCancelDialogOpen(true);
    handleMenuClose();
  };
  
  // Đóng dialog hủy booking
  const handleCloseCancelDialog = () => {
    setCancelDialogOpen(false);
  };
  
  // Xử lý xác nhận booking
  const handleConfirmBooking = (bookingId) => {
    setBookings(bookings.map(booking => 
      booking.id === bookingId 
        ? { ...booking, status: 'confirmed' } 
        : booking
    ));
    handleMenuClose();
  };
  
  // Xử lý hủy booking
  const handleCancelBooking = () => {
    setBookings(bookings.map(booking => 
      booking.id === selectedBooking.id 
        ? { ...booking, status: 'cancelled' } 
        : booking
    ));
    handleCloseCancelDialog();
  };
  
  // Format tiền VND
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
      .format(amount)
      .replace('₫', 'VNĐ');
  };
  
  // Hiển thị chip trạng thái booking
  const getStatusChip = (status) => {
    switch (status) {
      case 'pending':
        return <Chip size="small" color="warning" label="Chờ xác nhận" icon={<AccessTimeIcon />} />;
      case 'confirmed':
        return <Chip size="small" color="success" label="Đã xác nhận" icon={<CheckCircleIcon />} />;
      case 'cancelled':
        return <Chip size="small" color="error" label="Đã hủy" icon={<CancelIcon />} />;
      default:
        return <Chip size="small" label={status} />;
    }
  };
  
  // Hiển thị chip trạng thái thanh toán
  const getPaymentStatusChip = (status) => {
    switch (status) {
      case 'paid':
        return <Chip size="small" color="success" label="Đã thanh toán" />;
      case 'pending':
        return <Chip size="small" color="warning" label="Chưa thanh toán" />;
      case 'refunded':
        return <Chip size="small" color="info" label="Đã hoàn tiền" />;
      default:
        return <Chip size="small" label={status} />;
    }
  };
  
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Quản lý lịch đặt sân
      </Typography>
      
      {/* Thanh công cụ tìm kiếm và lọc */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm theo tên khách hàng, số điện thoại hoặc tên sân"
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
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
              <DatePicker
                label="Lọc theo ngày"
                value={dateFilter}
                onChange={(newValue) => setDateFilter(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: 'outlined'
                  }
                }}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} md={2}>
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
      </Paper>
      
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
          <Tab label={`Đã hủy (${bookings.filter(b => b.status === 'cancelled').length})`} />
          <Tab label="Tất cả" />
        </Tabs>
        
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
              {filteredBookings
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
                ))}
              {filteredBookings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                    <Typography variant="subtitle1">
                      Không tìm thấy lịch đặt sân nào phù hợp
                    </Typography>
                  </TableCell>
                </TableRow>
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
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} trong ${count}`}
        />
      </Paper>
      
      {/* Menu tùy chọn */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleOpenDetailDialog}>
          <EventNoteIcon fontSize="small" sx={{ mr: 1 }} />
          Xem chi tiết
        </MenuItem>
        
        {selectedBooking?.status === 'pending' && (
          <MenuItem onClick={() => handleConfirmBooking(selectedBooking.id)}>
            <CheckCircleIcon fontSize="small" sx={{ mr: 1, color: 'success.main' }} />
            Xác nhận đặt sân
          </MenuItem>
        )}
        
        {(selectedBooking?.status === 'pending' || selectedBooking?.status === 'confirmed') && (
          <MenuItem onClick={handleOpenCancelDialog} sx={{ color: 'error.main' }}>
            <CancelIcon fontSize="small" sx={{ mr: 1 }} />
            Hủy đặt sân
          </MenuItem>
        )}
      </Menu>
      
      {/* Dialog chi tiết đặt sân */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDetailDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedBooking && (
          <>
            <DialogTitle>
              Chi tiết đặt sân #{selectedBooking.id}
              <Box sx={{ position: 'absolute', right: 16, top: 12 }}>
                {getStatusChip(selectedBooking.status)}
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
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
                  
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Tổng tiền</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {formatCurrency(selectedBooking.totalPrice)}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary">Phương thức thanh toán</Typography>
                      <Typography variant="body1">
                        {selectedBooking.paymentMethod === 'online' ? 'Thanh toán online' : 'Tiền mặt'}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary">Trạng thái thanh toán</Typography>
                      {getPaymentStatusChip(selectedBooking.paymentStatus)}
                    </Box>
                  </Stack>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PersonIcon sx={{ mr: 1 }} /> Thông tin khách hàng
                  </Typography>
                  
                  <Stack spacing={2} sx={{ mb: 3 }}>
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
                  </Stack>
                  
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', mb: 2 }}>
                    <EventNoteIcon sx={{ mr: 1 }} /> Thông tin bổ sung
                  </Typography>
                  
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Ghi chú</Typography>
                      <Typography variant="body1">
                        {selectedBooking.notes || 'Không có ghi chú'}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary">Thời gian đặt sân</Typography>
                      <Typography variant="body1">{selectedBooking.createdAt}</Typography>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetailDialog}>Đóng</Button>
              
              {selectedBooking.status === 'pending' && (
                <Button 
                  variant="contained" 
                  color="success"
                  onClick={() => {
                    handleConfirmBooking(selectedBooking.id);
                    handleCloseDetailDialog();
                  }}
                >
                  Xác nhận đặt sân
                </Button>
              )}
              
              {(selectedBooking.status === 'pending' || selectedBooking.status === 'confirmed') && (
                <Button 
                  variant="outlined" 
                  color="error"
                  onClick={() => {
                    handleCloseDetailDialog();
                    handleOpenCancelDialog();
                  }}
                >
                  Hủy đặt sân
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Dialog hủy đặt sân */}
      <Dialog
        open={cancelDialogOpen}
        onClose={handleCloseCancelDialog}
      >
        <DialogTitle>Xác nhận hủy đặt sân</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn hủy đơn đặt sân này? Hành động này không thể hoàn tác.
          </DialogContentText>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2">Thông tin đặt sân:</Typography>
            <Typography variant="body2">
              {selectedBooking?.courtName}, ngày {selectedBooking?.date}, {selectedBooking?.startTime} - {selectedBooking?.endTime}
            </Typography>
            <Typography variant="body2">
              Khách hàng: {selectedBooking?.customerName}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCancelDialog}>Không hủy</Button>
          <Button onClick={handleCancelBooking} color="error" variant="contained">
            Xác nhận hủy
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog lọc nâng cao */}
      <Dialog
        open={filterDialogOpen}
        onClose={() => setFilterDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Lọc nâng cao</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Sân thể thao</InputLabel>
              <Select
                value={courtFilter}
                label="Sân thể thao"
                onChange={(e) => setCourtFilter(e.target.value)}
              >
                <MenuItem value="all">Tất cả các sân</MenuItem>
                <MenuItem value="court1">Sân bóng đá Mini Thành Công</MenuItem>
                <MenuItem value="court2">Sân cầu lông Olympia</MenuItem>
                <MenuItem value="court3">Sân bóng rổ Hòa Bình</MenuItem>
                <MenuItem value="court4">Sân tennis Lakeview</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Trạng thái thanh toán</InputLabel>
              <Select
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
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setCourtFilter('all');
              setPaymentFilter('all');
            }}
          >
            Đặt lại
          </Button>
          <Button 
            variant="contained"
            onClick={() => setFilterDialogOpen(false)}
          >
            Áp dụng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CourtBookings; 