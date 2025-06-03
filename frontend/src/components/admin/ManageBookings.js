import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  MenuItem,
  Menu,
  Grid,
  FormControl,
  InputLabel,
  Select,
  Stack,
  Alert,
  Snackbar,
  CircularProgress,
  Avatar,
  Card,
  CardContent,
  Tooltip,
  Divider
} from '@mui/material';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RefreshIcon from '@mui/icons-material/Refresh';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import PaymentIcon from '@mui/icons-material/Payment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingIcon from '@mui/icons-material/Pending';
import TaskAltIcon from '@mui/icons-material/TaskAlt';

// Services
import { adminService } from '../../services/api';

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [bookingStats, setBookingStats] = useState(null);

  // Load bookings from Firebase
  useEffect(() => {
    loadBookings();
    loadBookingStats();
  }, []);

  // Filter bookings when search term or filters change
  useEffect(() => {
    filterBookings();
  }, [bookings, searchTerm, statusFilter, dateFilter]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllBookings();
      setBookings(response.data.bookings || []);
    } catch (error) {
      console.error('Error loading bookings:', error);
      showSnackbar('Không thể tải danh sách đặt sân', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadBookingStats = async () => {
    try {
      const response = await adminService.getBookingStats();
      setBookingStats(response.data.stats || null);
    } catch (error) {
      console.error('Error loading booking stats:', error);
    }
  };

  const filterBookings = () => {
    let filtered = bookings;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(booking => 
        booking.courtName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    // Filter by date
    if (dateFilter) {
      filtered = filtered.filter(booking => booking.date === dateFilter);
    }

    setFilteredBookings(filtered);
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
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
    setDetailDialogOpen(true);
    handleMenuClose();
  };

  // Đóng dialog chi tiết đặt sân
  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
  };

  // Mở dialog thay đổi trạng thái
  const handleOpenStatusDialog = (status) => {
    setNewStatus(status);
    setStatusDialogOpen(true);
    handleMenuClose();
  };

  // Đóng dialog thay đổi trạng thái
  const handleCloseStatusDialog = () => {
    setStatusDialogOpen(false);
  };

  // Mở dialog xác nhận xóa
  const handleOpenDeleteDialog = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  // Đóng dialog xác nhận xóa
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  // Cập nhật trạng thái đặt sân
  const handleUpdateBookingStatus = async () => {
    try {
      await adminService.updateBookingStatus(selectedBooking.id, newStatus);

      // Update local state
      setBookings(bookings.map(booking =>
        booking.id === selectedBooking.id
          ? { ...booking, status: newStatus }
          : booking
      ));

      showSnackbar('Cập nhật trạng thái thành công', 'success');
      await loadBookingStats(); // Reload stats
    } catch (error) {
      console.error('Error updating booking status:', error);
      showSnackbar('Không thể cập nhật trạng thái', 'error');
    } finally {
      handleCloseStatusDialog();
    }
  };

  // Xóa đặt sân
  const handleDeleteBooking = async () => {
    try {
      await adminService.deleteBooking(selectedBooking.id);

      // Update local state
      setBookings(bookings.filter(booking => booking.id !== selectedBooking.id));

      showSnackbar('Xóa đặt sân thành công', 'success');
      await loadBookingStats(); // Reload stats
    } catch (error) {
      console.error('Error deleting booking:', error);
      showSnackbar('Không thể xóa đặt sân', 'error');
    } finally {
      handleCloseDeleteDialog();
    }
  };

  // Làm mới danh sách
  const handleRefresh = () => {
    loadBookings();
    loadBookingStats();
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateFilter('');
  };

  // Lấy chip màu cho trạng thái
  const getStatusChip = (status) => {
    const statusConfig = {
      pending: { label: 'Chờ xác nhận', color: 'warning', icon: <PendingIcon /> },
      confirmed: { label: 'Đã xác nhận', color: 'success', icon: <CheckCircleIcon /> },
      completed: { label: 'Hoàn thành', color: 'info', icon: <TaskAltIcon /> },
      cancelled: { label: 'Đã hủy', color: 'error', icon: <CancelIcon /> }
    };

    const config = statusConfig[status] || { label: 'Chưa xác định', color: 'default', icon: null };
    return (
      <Chip
        label={config.label}
        color={config.color}
        size="small"
        icon={config.icon}
      />
    );
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa có thông tin';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch (error) {
      return 'Không hợp lệ';
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  // Get paginated bookings
  const paginatedBookings = filteredBookings.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Quản lý đặt sân
        </Typography>

        {/* Stats */}
        {bookingStats && (
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6">{bookingStats.total}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tổng đặt sân
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6">{bookingStats.byStatus.pending}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Chờ xác nhận
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6">{bookingStats.byStatus.confirmed}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Đã xác nhận
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6">{formatCurrency(bookingStats.totalRevenue)}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tổng doanh thu
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>

      {/* Search and Filter */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm theo tên sân, người đặt, email..."
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
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={statusFilter}
                label="Trạng thái"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="pending">Chờ xác nhận</MenuItem>
                <MenuItem value="confirmed">Đã xác nhận</MenuItem>
                <MenuItem value="completed">Hoàn thành</MenuItem>
                <MenuItem value="cancelled">Đã hủy</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="Ngày đặt"
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                onClick={handleResetFilters}
                startIcon={<FilterListIcon />}
              >
                Đặt lại bộ lọc
              </Button>
              <Button
                variant="outlined"
                onClick={handleRefresh}
                startIcon={<RefreshIcon />}
              >
                Làm mới
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Mã đặt sân</TableCell>
                <TableCell>Người đặt</TableCell>
                <TableCell>Sân thể thao</TableCell>
                <TableCell>Chủ sân</TableCell>
                <TableCell>Ngày đặt</TableCell>
                <TableCell>Thời gian</TableCell>
                <TableCell>Tổng tiền</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedBookings.map((booking) => (
                <TableRow key={booking.id} hover>
                  <TableCell>
                    <Tooltip title={booking.id}>
                      <Typography variant="body2" fontWeight="medium">
                        #{booking.id.slice(0, 8)}...
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {booking.userName?.[0] || booking.userEmail?.[0] || 'U'}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {booking.userName || 'Chưa có tên'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {booking.userEmail}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {booking.courtName || 'Chưa có tên sân'}
                      </Typography>
                      {booking.courtDetails && (
                        <Typography variant="caption" color="text.secondary">
                          {booking.courtDetails.type}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {booking.ownerDetails?.name || 'Chưa có tên'}
                      </Typography>
                      {booking.ownerDetails?.email && (
                        <Typography variant="caption" color="text.secondary">
                          {booking.ownerDetails.email}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{formatDate(booking.date)}</TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {booking.startTime} - {booking.endTime}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {formatCurrency(booking.totalPrice)}
                    </Typography>
                  </TableCell>
                  <TableCell>{getStatusChip(booking.status)}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      onClick={(e) => handleMenuClick(e, booking)}
                      size="small"
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredBookings.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số hàng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} của ${count !== -1 ? count : `hơn ${to}`}`
          }
        />
      </Paper>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleOpenDetailDialog}>
          <VisibilityIcon sx={{ mr: 1 }} />
          Xem chi tiết
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleOpenStatusDialog('confirmed')}>
          <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} />
          Xác nhận
        </MenuItem>
        <MenuItem onClick={() => handleOpenStatusDialog('completed')}>
          <TaskAltIcon sx={{ mr: 1, color: 'info.main' }} />
          Hoàn thành
        </MenuItem>
        <MenuItem onClick={() => handleOpenStatusDialog('cancelled')}>
          <CancelIcon sx={{ mr: 1, color: 'error.main' }} />
          Hủy đặt
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleOpenDeleteDialog} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Xóa đặt sân
        </MenuItem>
      </Menu>

      {/* Booking Detail Dialog */}
      <Dialog open={detailDialogOpen} onClose={handleCloseDetailDialog} maxWidth="md" fullWidth>
        <DialogTitle>Chi tiết đặt sân</DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">Mã đặt sân</Typography>
                <Typography variant="body1">{selectedBooking.id}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">Trạng thái</Typography>
                <Typography variant="body1">{getStatusChip(selectedBooking.status)}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">Tên người đặt</Typography>
                <Typography variant="body1">{selectedBooking.userName || 'Chưa có'}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">Email</Typography>
                <Typography variant="body1">{selectedBooking.userEmail}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">Số điện thoại</Typography>
                <Typography variant="body1">{selectedBooking.userPhone || 'Chưa có'}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">Số lượt đặt sân</Typography>
                <Typography variant="body1" fontWeight="bold" color="primary">
                  {selectedBooking.userBookingCount || 0} lượt
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">Tên sân</Typography>
                <Typography variant="body1">{selectedBooking.courtName}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">Chủ sân</Typography>
                <Typography variant="body1">{selectedBooking.ownerDetails?.name || 'Chưa có'}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">Ngày đặt</Typography>
                <Typography variant="body1">{formatDate(selectedBooking.date)}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">Thời gian</Typography>
                <Typography variant="body1">
                  {selectedBooking.startTime} - {selectedBooking.endTime}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">Tổng tiền</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {formatCurrency(selectedBooking.totalPrice)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">Ngày tạo</Typography>
                <Typography variant="body1">{formatDate(selectedBooking.createdAt)}</Typography>
              </Grid>
              {selectedBooking.note && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Ghi chú</Typography>
                  <Typography variant="body1">{selectedBooking.note}</Typography>
                </Grid>
              )}
              {selectedBooking.courtDetails && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Thông tin sân</Typography>
                  <Typography variant="body1">
                    Loại: {selectedBooking.courtDetails.type} • 
                    Địa chỉ: {selectedBooking.courtDetails.address?.street || 'Chưa có địa chỉ'}
                  </Typography>
                </Grid>
              )}
              {selectedBooking.ownerDetails && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Thông tin chủ sân</Typography>
                  <Typography variant="body1">
                    Tên: {selectedBooking.ownerDetails.name} • 
                    Email: {selectedBooking.ownerDetails.email} • 
                    {selectedBooking.ownerDetails.phone && `SĐT: ${selectedBooking.ownerDetails.phone}`}
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailDialog}>Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* Status Update Confirmation Dialog */}
      <Dialog open={statusDialogOpen} onClose={handleCloseStatusDialog}>
        <DialogTitle>Cập nhật trạng thái</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn thay đổi trạng thái đặt sân #{selectedBooking?.id.slice(0, 8)}... 
            thành "{newStatus === 'confirmed' ? 'Đã xác nhận' : 
                   newStatus === 'completed' ? 'Hoàn thành' : 
                   newStatus === 'cancelled' ? 'Đã hủy' : newStatus}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStatusDialog}>Hủy</Button>
          <Button onClick={handleUpdateBookingStatus} color="primary">
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Xóa đặt sân</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa đặt sân #{selectedBooking?.id.slice(0, 8)}...?
            Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Hủy</Button>
          <Button onClick={handleDeleteBooking} color="error">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ManageBookings; 