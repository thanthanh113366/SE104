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
  Divider,
  Tabs,
  Tab,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PaymentIcon from '@mui/icons-material/Payment';

const ManageBookings = () => {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [updateStatusDialogOpen, setUpdateStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (currentUser) {
      fetchBookings();
    }
  }, [currentUser]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { db } = await import('../../firebase');
      const { collection, getDocs, query, orderBy } = await import('firebase/firestore');
      
      // Lấy tất cả bookings
      const bookingsQuery = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
      const bookingsSnapshot = await getDocs(bookingsQuery);
      
      const bookingsData = [];
      
      for (const doc of bookingsSnapshot.docs) {
        const bookingData = doc.data();
        
        // Lấy thông tin sân
        let courtName = 'Không rõ';
        let courtAddress = 'Không rõ';
        if (bookingData.courtId) {
          try {
            const { doc: docRef, getDoc } = await import('firebase/firestore');
            const courtDoc = await getDoc(docRef(db, 'courts', bookingData.courtId));
            if (courtDoc.exists()) {
              const courtData = courtDoc.data();
              courtName = courtData.name || 'Không có tên';
              courtAddress = courtData.address || 'Không có địa chỉ';
            }
          } catch (error) {
            console.error('Error fetching court data:', error);
          }
        }
        
        // Lấy thông tin người dùng
        let userName = 'Không rõ';
        let userEmail = 'Không rõ';
        if (bookingData.userId) {
          try {
            const { doc: docRef, getDoc } = await import('firebase/firestore');
            const userDoc = await getDoc(docRef(db, 'users', bookingData.userId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              userName = userData.displayName || userData.email?.split('@')[0] || 'Người dùng';
              userEmail = userData.email || 'Không có email';
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
          }
        }
        
        bookingsData.push({
          id: doc.id,
          ...bookingData,
          courtName,
          courtAddress,
          userName,
          userEmail,
          date: bookingData.date || 'N/A',
          startTime: bookingData.startTime || 'N/A',
          endTime: bookingData.endTime || 'N/A',
          totalPrice: bookingData.totalPrice || 0,
          status: bookingData.status || 'pending',
          createdAt: bookingData.createdAt ? new Date(bookingData.createdAt).toLocaleDateString('vi-VN') : 'N/A',
          paymentMethod: bookingData.paymentMethod || 'Chưa xác định'
        });
      }
      
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setSnackbar({ 
        open: true, 
        message: 'Lỗi khi tải danh sách đặt sân', 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Hiển thị chip trạng thái đặt sân
  const getStatusChip = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
      case 'chờ xác nhận':
        return <Chip size="small" color="warning" icon={<PendingIcon />} label="Chờ xác nhận" />;
      case 'confirmed':
      case 'đã xác nhận':
        return <Chip size="small" color="success" icon={<CheckCircleIcon />} label="Đã xác nhận" />;
      case 'completed':
      case 'hoàn thành':
        return <Chip size="small" color="info" icon={<CheckCircleIcon />} label="Hoàn thành" />;
      case 'cancelled':
      case 'đã hủy':
        return <Chip size="small" color="error" icon={<CancelIcon />} label="Đã hủy" />;
      default:
        return <Chip size="small" label={status} />;
    }
  };

  // Format tiền VND
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
      .format(amount)
      .replace('₫', 'VNĐ');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Quản lý đặt sân
      </Typography>
      
      {/* Bảng hiển thị đặt sân */}
      <Paper sx={{ borderRadius: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Sân thể thao</TableCell>
                <TableCell>Người đặt</TableCell>
                <TableCell>Ngày đặt</TableCell>
                <TableCell>Thời gian</TableCell>
                <TableCell>Tổng tiền</TableCell>
                <TableCell>Trạng thái</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((booking) => (
                  <TableRow key={booking.id} hover>
                    <TableCell>{booking.id.substring(0, 8)}...</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {booking.courtName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {booking.courtAddress}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {booking.userName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {booking.userEmail}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{booking.date}</TableCell>
                    <TableCell>{booking.startTime} - {booking.endTime}</TableCell>
                    <TableCell>{formatCurrency(booking.totalPrice)}</TableCell>
                    <TableCell>{getStatusChip(booking.status)}</TableCell>
                  </TableRow>
                ))}
              {bookings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <Typography variant="subtitle1">
                      Chưa có đặt sân nào trong hệ thống
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
          count={bookings.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Số hàng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} trong ${count}`}
        />
      </Paper>
      
      {/* Snackbar thông báo */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ManageBookings; 