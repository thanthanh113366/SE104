import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, updateDoc, deleteDoc, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
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
  CircularProgress
} from '@mui/material';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import SportsBasketballIcon from '@mui/icons-material/SportsBasketball';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BlockIcon from '@mui/icons-material/Block';

// Dữ liệu mẫu
const SAMPLE_COURTS = [
  {
    id: 'court1',
    name: 'Sân bóng đá Mini Thành Công',
    address: '123 Nguyễn Văn Linh, Quận 7, TP.HCM',
    ownerId: 'owner1',
    ownerName: 'Trần Thị B',
    sport: 'football',
    sportName: 'Bóng đá',
    price: 300000,
    openTime: '06:00',
    closeTime: '22:00',
    status: 'active',
    totalBookings: 32,
    totalRevenue: 9600000,
    rating: 4.7,
    createdAt: '15/01/2023'
  },
  {
    id: 'court2',
    name: 'Sân cầu lông Olympia',
    address: '45 Lê Văn Việt, Quận 9, TP.HCM',
    ownerId: 'owner1',
    ownerName: 'Trần Thị B',
    sport: 'badminton',
    sportName: 'Cầu lông',
    price: 120000,
    openTime: '07:00',
    closeTime: '21:00',
    status: 'active',
    totalBookings: 45,
    totalRevenue: 5400000,
    rating: 4.5,
    createdAt: '20/01/2023'
  },
  {
    id: 'court3',
    name: 'Sân bóng rổ Hòa Bình',
    address: '78 Trần Não, Quận 2, TP.HCM',
    ownerId: 'owner2',
    ownerName: 'Nguyễn Văn H',
    sport: 'basketball',
    sportName: 'Bóng rổ',
    price: 200000,
    openTime: '06:30',
    closeTime: '21:30',
    status: 'inactive',
    totalBookings: 18,
    totalRevenue: 3600000,
    rating: 4.3,
    createdAt: '05/02/2023'
  },
  {
    id: 'court4',
    name: 'Sân tennis Lakeview',
    address: '25 Nguyễn Hữu Thọ, Quận 7, TP.HCM',
    ownerId: 'owner1',
    ownerName: 'Trần Thị B',
    sport: 'tennis',
    sportName: 'Tennis',
    price: 250000,
    openTime: '06:00',
    closeTime: '20:00',
    status: 'active',
    totalBookings: 38,
    totalRevenue: 9500000,
    rating: 4.8,
    createdAt: '10/02/2023'
  },
  {
    id: 'court5',
    name: 'Sân bóng đá 7 người Sài Gòn',
    address: '56 Nguyễn Trãi, Quận 5, TP.HCM',
    ownerId: 'owner3',
    ownerName: 'Phạm Văn M',
    sport: 'football',
    sportName: 'Bóng đá',
    price: 400000,
    openTime: '08:00',
    closeTime: '22:00',
    status: 'active',
    totalBookings: 25,
    totalRevenue: 10000000,
    rating: 4.6,
    createdAt: '15/03/2023'
  }
];

const ManageCourts = () => {
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [sportFilter, setSportFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const { currentUser } = useAuth();
  
  // Map thể loại sân
  const SPORT_NAMES = {
    'football': 'Bóng đá',
    'basketball': 'Bóng rổ',
    'tennis': 'Tennis',
    'badminton': 'Cầu lông',
    'volleyball': 'Bóng chuyền'
  };
  
  // Lấy dữ liệu sân từ Firestore
  useEffect(() => {
    const fetchCourts = async () => {
      try {
        setLoading(true);
        setError('');
        
        console.log('Đang lấy danh sách tất cả sân cho admin...');
        
        const courtsRef = collection(db, 'courts');
        console.log('Đã tạo reference đến collection courts');
        
        // Lấy tất cả sân không phân biệt owner
        const querySnapshot = await getDocs(courtsRef);
        console.log('Số lượng sân tìm thấy:', querySnapshot.size);
        
        const courtsList = [];
        
        querySnapshot.forEach(async (doc) => {
          const data = doc.data();
          console.log('Sân:', doc.id, data.name || 'Không có tên');
          
          // Xử lý dữ liệu bổ sung (lấy thông tin owner nếu cần)
          let ownerName = 'Không rõ';
          
          // Thêm vào danh sách
          courtsList.push({
            id: doc.id,
            ...data,
            // Đảm bảo các trường cần thiết
            name: data.name || 'Chưa có tên',
            address: data.address || 'Chưa có địa chỉ',
            ownerId: data.ownerId || 'unknown',
            ownerName: ownerName,
            sport: data.sport || 'unknown',
            sportName: SPORT_NAMES[data.sport] || 'Không xác định',
            price: data.price || 0,
            openTime: data.openTime || '06:00',
            closeTime: data.closeTime || '22:00',
            status: data.status || 'active',
            totalBookings: data.totalBookings || 0,
            totalRevenue: data.totalRevenue || 0,
            rating: data.rating || 0,
            createdAt: data.createdAt ? new Date(data.createdAt.toDate()).toLocaleDateString('vi-VN') : 'Không rõ'
          });
        });
        
        console.log('Danh sách sân đã xử lý:', courtsList.length);
        setCourts(courtsList);
        
      } catch (err) {
        console.error('Lỗi khi lấy danh sách sân:', err);
        console.error('Chi tiết lỗi:', err.code, err.message);
        setError('Không thể tải danh sách sân. Vui lòng thử lại sau.');
        
        // Nếu có lỗi, sử dụng dữ liệu mẫu
        console.log('Sử dụng dữ liệu mẫu do lỗi');
        setCourts(SAMPLE_COURTS);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourts();
  }, []);
  
  // Xử lý thay đổi tab
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
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
  const handleMenuClick = (event, court) => {
    setAnchorEl(event.currentTarget);
    setSelectedCourt(court);
  };
  
  // Đóng menu
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  // Mở dialog chi tiết sân
  const handleOpenDetailDialog = () => {
    setDetailDialogOpen(true);
    handleMenuClose();
  };
  
  // Đóng dialog chi tiết sân
  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
  };
  
  // Mở dialog xác nhận khóa/mở khóa sân
  const handleOpenBlockDialog = () => {
    setBlockDialogOpen(true);
    handleMenuClose();
  };
  
  // Đóng dialog xác nhận khóa/mở khóa sân
  const handleCloseBlockDialog = () => {
    setBlockDialogOpen(false);
  };
  
  // Mở dialog xác nhận xóa sân
  const handleOpenDeleteDialog = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };
  
  // Đóng dialog xác nhận xóa sân
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };
  
  // Xử lý thay đổi trạng thái sân
  const handleToggleCourtStatus = async () => {
    if (!selectedCourt) return;
    
    try {
      setLoading(true);
      
      const newStatus = selectedCourt.status === 'active' ? 'inactive' : 'active';
      
      // Cập nhật trong Firestore
      const courtRef = doc(db, 'courts', selectedCourt.id);
      await updateDoc(courtRef, { 
        status: newStatus,
        updatedAt: new Date()
      });
      
      console.log(`Đã cập nhật trạng thái sân ${selectedCourt.id} thành ${newStatus}`);
      
      // Cập nhật state
      setCourts(courts.map(court => {
        if (court.id === selectedCourt.id) {
          return {
            ...court,
            status: newStatus
          };
        }
        return court;
      }));
      
      setBlockDialogOpen(false);
    } catch (err) {
      console.error('Lỗi khi thay đổi trạng thái sân:', err);
      setError('Không thể cập nhật trạng thái sân. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  // Xử lý xóa sân
  const handleDeleteCourt = async () => {
    if (!selectedCourt) return;
    
    try {
      setLoading(true);
      
      // Xóa sân từ Firestore
      const courtRef = doc(db, 'courts', selectedCourt.id);
      await deleteDoc(courtRef);
      
      console.log(`Đã xóa sân ${selectedCourt.id} khỏi Firestore`);
      
      // Cập nhật state
      setCourts(courts.filter(court => court.id !== selectedCourt.id));
      
      setDeleteDialogOpen(false);
    } catch (err) {
      console.error('Lỗi khi xóa sân:', err);
      setError('Không thể xóa sân. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  // Áp dụng bộ lọc
  const filteredCourts = courts.filter(court => {
    // Lọc theo tab (trạng thái hoạt động)
    if (tabValue === 1 && court.status !== 'active') return false;
    if (tabValue === 2 && court.status !== 'inactive') return false;
    
    // Lọc theo tên hoặc địa chỉ
    const matchesSearch = 
      court.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      court.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Lọc theo loại sân
    const matchesSport = sportFilter === 'all' || court.sport === sportFilter;
    
    // Lọc theo trạng thái (nếu đang ở tab tất cả)
    const matchesStatus = 
      tabValue !== 0 ? true : (statusFilter === 'all' || court.status === statusFilter);
    
    return matchesSearch && matchesSport && matchesStatus;
  });
  
  // Phân trang
  const paginatedCourts = filteredCourts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  
  // Format tiền VND
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
      .format(amount)
      .replace('₫', 'VNĐ');
  };
  
  // Hiển thị icon loại sân
  const getSportIcon = (sport) => {
    switch(sport) {
      case 'football':
        return <SportsSoccerIcon color="primary" />;
      case 'basketball':
        return <SportsBasketballIcon color="warning" />;
      case 'tennis':
        return <SportsTennisIcon color="success" />;
      case 'badminton':
        return <SportsTennisIcon color="info" />;
      default:
        return <SportsSoccerIcon />;
    }
  };
  
  // Hiển thị chip trạng thái sân
  const getStatusChip = (status) => {
    switch (status) {
      case 'active':
        return <Chip size="small" color="success" icon={<CheckCircleIcon />} label="Đang hoạt động" />;
      case 'inactive':
        return <Chip size="small" color="error" icon={<BlockIcon />} label="Tạm ngưng" />;
      default:
        return <Chip size="small" label={status} />;
    }
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Quản lý sân
      </Typography>
      
      {error && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: '#ffebee' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}
      
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm theo tên sân, địa chỉ hoặc chủ sân"
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
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Loại sân</InputLabel>
                  <Select
                    value={sportFilter}
                    label="Loại sân"
                    onChange={(e) => setSportFilter(e.target.value)}
                  >
                    <MenuItem value="all">Tất cả loại sân</MenuItem>
                    <MenuItem value="football">Bóng đá</MenuItem>
                    <MenuItem value="badminton">Cầu lông</MenuItem>
                    <MenuItem value="basketball">Bóng rổ</MenuItem>
                    <MenuItem value="tennis">Tennis</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Trạng thái"
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="all">Tất cả trạng thái</MenuItem>
                    <MenuItem value="active">Đang hoạt động</MenuItem>
                    <MenuItem value="inactive">Tạm ngưng</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Button 
              fullWidth
              variant="outlined"
              startIcon={<FilterListIcon />}
            >
              Lọc nâng cao
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      <Paper sx={{ width: '100%', borderRadius: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Tất cả sân" />
          <Tab label="Sân đang hoạt động" />
          <Tab label="Sân đã khóa" />
        </Tabs>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tên sân</TableCell>
                <TableCell>Loại</TableCell>
                <TableCell>Địa chỉ</TableCell>
                <TableCell>Chủ sân</TableCell>
                <TableCell>Giá</TableCell>
                <TableCell>Đánh giá</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="right">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                      <CircularProgress size={40} sx={{ mb: 2 }} />
                      <Typography variant="body2" color="text.secondary">
                        Đang tải dữ liệu sân...
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : paginatedCourts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                    <Typography variant="body1">
                      Không tìm thấy sân nào{searchTerm ? ` phù hợp với "${searchTerm}"` : ''}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCourts.map((court) => (
                  <TableRow key={court.id} hover>
                    <TableCell>{court.name}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getSportIcon(court.sport)}
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          {court.sportName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{court.address}</TableCell>
                    <TableCell>{court.ownerName}</TableCell>
                    <TableCell>{formatCurrency(court.price)}</TableCell>
                    <TableCell>{court.rating}/5</TableCell>
                    <TableCell>{getStatusChip(court.status)}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={(e) => handleMenuClick(e, court)}
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
          component="div"
          count={filteredCourts.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số hàng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
        />
      </Paper>
      
      {/* Menu tùy chọn */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleOpenDetailDialog}>
          <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
          Xem chi tiết
        </MenuItem>
        
        <MenuItem onClick={handleOpenBlockDialog}>
          {selectedCourt?.status === 'active' ? (
            <>
              <BlockIcon fontSize="small" sx={{ mr: 1, color: 'error.main' }} />
              <Typography color="error.main">Tạm ngưng sân</Typography>
            </>
          ) : (
            <>
              <CheckCircleIcon fontSize="small" sx={{ mr: 1, color: 'success.main' }} />
              <Typography color="success.main">Kích hoạt sân</Typography>
            </>
          )}
        </MenuItem>
        
        <MenuItem onClick={handleOpenDeleteDialog} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Xóa sân
        </MenuItem>
      </Menu>
      
      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onClose={handleCloseDetailDialog} maxWidth="md">
        {selectedCourt && (
          <>
            <DialogTitle>
              Chi tiết sân: {selectedCourt.name}
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Thông tin cơ bản</Typography>
                  <Typography><strong>ID:</strong> {selectedCourt.id}</Typography>
                  <Typography><strong>Tên sân:</strong> {selectedCourt.name}</Typography>
                  <Typography><strong>Loại sân:</strong> {selectedCourt.sportName}</Typography>
                  <Typography><strong>Địa chỉ:</strong> {selectedCourt.address}</Typography>
                  <Typography><strong>Giá thuê:</strong> {formatCurrency(selectedCourt.price)}/giờ</Typography>
                  <Typography><strong>Mô tả:</strong> {selectedCourt.description || 'Không có mô tả'}</Typography>
                  <Typography><strong>Đánh giá:</strong> {selectedCourt.rating}/5</Typography>
                  <Typography><strong>Trạng thái:</strong> {selectedCourt.status === 'active' ? 'Đang hoạt động' : 'Tạm khóa'}</Typography>
                  <Typography><strong>Ngày tạo:</strong> {selectedCourt.createdAt}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Thông tin chủ sân</Typography>
                  <Typography><strong>ID chủ sân:</strong> {selectedCourt.ownerId}</Typography>
                  <Typography><strong>Tên chủ sân:</strong> {selectedCourt.ownerName}</Typography>
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="h6" gutterBottom>Tiện ích</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selectedCourt.facilities && selectedCourt.facilities.length > 0 ? 
                        selectedCourt.facilities.map((facility, idx) => (
                          <Chip key={idx} label={facility} size="small" />
                        )) : 
                        <Typography variant="body2">Không có thông tin</Typography>
                      }
                    </Box>
                  </Box>
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="h6" gutterBottom>Thời gian hoạt động</Typography>
                    <Typography><strong>Mở cửa:</strong> {selectedCourt.openTime} - {selectedCourt.closeTime}</Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>Thống kê</Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6} md={3}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4">{selectedCourt.totalBookings || 0}</Typography>
                        <Typography variant="body2">Lượt đặt sân</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4">{formatCurrency(selectedCourt.totalRevenue || 0)}</Typography>
                        <Typography variant="body2">Doanh thu</Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetailDialog}>
                Đóng
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Block Dialog */}
      <Dialog open={blockDialogOpen} onClose={handleCloseBlockDialog}>
        {selectedCourt && (
          <>
            <DialogTitle>
              {selectedCourt.status === 'active' ? 'Khóa sân' : 'Mở khóa sân'}
            </DialogTitle>
            <DialogContent>
              <DialogContentText>
                {selectedCourt.status === 'active'
                  ? `Bạn có chắc chắn muốn khóa sân "${selectedCourt.name}"? Khi bị khóa, sân sẽ không hiển thị cho người thuê và không thể đặt sân.`
                  : `Bạn có chắc chắn muốn mở khóa sân "${selectedCourt.name}"? Khi được mở khóa, sân sẽ hiển thị cho người thuê và có thể đặt sân.`
                }
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseBlockDialog}>
                Hủy
              </Button>
              <Button 
                onClick={handleToggleCourtStatus} 
                color={selectedCourt.status === 'active' ? 'error' : 'success'}
                variant="contained"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} sx={{ mx: 1 }} /> : null}
                {selectedCourt.status === 'active' ? 'Khóa sân' : 'Mở khóa sân'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        {selectedCourt && (
          <>
            <DialogTitle>
              Xác nhận xóa sân
            </DialogTitle>
            <DialogContent>
              <DialogContentText>
                Bạn có chắc chắn muốn xóa sân "{selectedCourt.name}"? 
                Hành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu liên quan đến sân này.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDeleteDialog}>
                Hủy
              </Button>
              <Button 
                onClick={handleDeleteCourt} 
                color="error"
                variant="contained"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} sx={{ mx: 1 }} /> : null}
                Xóa sân
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default ManageCourts; 