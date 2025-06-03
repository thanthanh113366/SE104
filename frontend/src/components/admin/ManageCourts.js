import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
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
  
  // Lấy dữ liệu sân từ API Backend
  useEffect(() => {
    const fetchCourts = async () => {
      try {
        setLoading(true);
        setError('');
        
        console.log('Đang lấy danh sách tất cả sân cho admin từ API...');
        
        // Lấy danh sách sân cơ bản trước
        const response = await adminService.getAllCourts();
        console.log('API response:', response.data);
        
        if (response.data && response.data.courts) {
          const basicCourts = response.data.courts;
          console.log(`Tìm thấy ${basicCourts.length} sân cơ bản`);
          
          // Với mỗi sân, lấy thông tin chi tiết để có owner info
          const courtsWithDetails = await Promise.all(
            basicCourts.map(async (court) => {
              try {
                // Lấy chi tiết sân (có owner info)
                const detailResponse = await adminService.getCourtDetails(court.id);
                const courtDetail = detailResponse.data.court;
                
                return {
                  id: court.id,
                  name: court.name || 'Chưa có tên',
                  sport: court.sport || court.type || 'football',
                  sportName: court.sportName || SPORT_NAMES[court.sport || court.type] || 'Khác',
                  address: typeof court.address === 'string' ? court.address : 
                           `${court.address?.street || ''}, ${court.address?.district || ''}, ${court.address?.city || ''}`.replace(/^, |, $/g, '') || 'Chưa có địa chỉ',
                  ownerId: court.ownerId,
                  ownerName: courtDetail?.owner?.name || 'Chưa có tên',
                  price: court.price || 0,
                  rating: court.rating || 0,
                  status: court.status || 'active',
                  totalBookings: courtDetail?.bookingCount || 0,
                  totalRevenue: 0,
                  openTime: court.openTime || '06:00',
                  closeTime: court.closeTime || '22:00',
                  createdAt: court.createdAt || 'Chưa rõ',
                  description: court.description || 'Chưa có mô tả',
                  facilities: court.facilities || court.amenities || []
                };
              } catch (detailError) {
                console.error(`Lỗi lấy chi tiết sân ${court.id}:`, detailError);
                return {
                  id: court.id,
                  name: court.name || 'Chưa có tên',
                  sport: court.sport || court.type || 'football',
                  sportName: court.sportName || SPORT_NAMES[court.sport || court.type] || 'Khác',
                  address: typeof court.address === 'string' ? court.address : 
                           `${court.address?.street || ''}, ${court.address?.district || ''}, ${court.address?.city || ''}`.replace(/^, |, $/g, '') || 'Chưa có địa chỉ',
                  ownerId: court.ownerId,
                  ownerName: 'Chưa có tên',
                  price: court.price || 0,
                  rating: court.rating || 0,
                  status: court.status || 'active',
                  totalBookings: 0,
                  totalRevenue: 0,
                  openTime: court.openTime || '06:00',
                  closeTime: court.closeTime || '22:00',
                  createdAt: court.createdAt || 'Chưa rõ',
                  description: court.description || 'Chưa có mô tả',
                  facilities: court.facilities || court.amenities || []
                };
              }
            })
          );
          
          console.log('Danh sách sân đã xử lý:', courtsWithDetails.length);
          console.log('Sample court:', courtsWithDetails[0]);
          setCourts(courtsWithDetails);
        } else {
          console.error('Định dạng response không đúng:', response.data);
          setError('Định dạng dữ liệu không đúng');
          setCourts([]);
        }
        
      } catch (error) {
        console.error('Lỗi khi lấy danh sách sân:', error);
        setError('Không thể tải danh sách sân: ' + (error.response?.data?.message || error.message));
        setCourts([]);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchCourts();
    }
  }, [currentUser]);
  
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
      
      // Gọi API backend để cập nhật trạng thái
      await adminService.updateCourtStatus(selectedCourt.id, newStatus);
      
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
      setError('Không thể cập nhật trạng thái sân: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };
  
  // Xử lý xóa sân
  const handleDeleteCourt = async () => {
    if (!selectedCourt) return;
    
    try {
      setLoading(true);
      
      // Gọi API backend để xóa sân
      await adminService.deleteCourt(selectedCourt.id);
      
      console.log(`Đã xóa sân ${selectedCourt.id}`);
      
      // Cập nhật state
      setCourts(courts.filter(court => court.id !== selectedCourt.id));
      
      setDeleteDialogOpen(false);
    } catch (err) {
      console.error('Lỗi khi xóa sân:', err);
      setError('Không thể xóa sân: ' + (err.response?.data?.message || err.message));
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
      court.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      court.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
    
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
  
  // Hiển thị thông báo lỗi
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
          Quản lý sân
        </Typography>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <ErrorIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h6" color="error" gutterBottom>
            Lỗi khi tải dữ liệu
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {error}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => window.location.reload()}
          >
            Thử lại
          </Button>
        </Paper>
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Quản lý sân
      </Typography>
      
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
                <TableCell>Lượt đặt</TableCell>
                <TableCell>Đánh giá</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="right">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
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
                  <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
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
                    <TableCell>
                      <Typography variant="body2">
                        {court.address}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {court.ownerName}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatCurrency(court.price)}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold" color="primary">
                        {court.totalBookings} lượt
                      </Typography>
                    </TableCell>
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
                  <Typography><strong>Mô tả:</strong> {selectedCourt.description}</Typography>
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