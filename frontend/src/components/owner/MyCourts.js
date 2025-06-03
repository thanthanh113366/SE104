import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  CardActions,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Switch,
  FormControlLabel,
  Divider,
  Paper,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import CourtServiceWrapper from '../../services/courtServiceWrapper';

// Icons
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import SportsBasketballIcon from '@mui/icons-material/SportsBasketball';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import SortIcon from '@mui/icons-material/Sort';
import RefreshIcon from '@mui/icons-material/Refresh';

// Dữ liệu mẫu cho danh sách sân
const SAMPLE_COURTS = [
  {
    id: 'court1',
    name: 'Sân bóng đá Mini Thành Công',
    address: '123 Nguyễn Văn Linh, Quận 7, TP.HCM',
    description: 'Sân cỏ nhân tạo 5 người, có đèn chiếu sáng buổi tối',
    sport: 'football',
    sportName: 'Bóng đá',
    price: 300000,
    openTime: '06:00',
    closeTime: '22:00',
    images: [
      'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1536122985607-4fe00c07d587?w=800&auto=format&fit=crop',
    ],
    facilities: ['Đèn chiếu sáng', 'Nhà vệ sinh', 'Nước uống', 'Wifi'],
    isAvailable: true,
    status: 'active',
    totalBookings: 48,
    totalRevenue: 14400000,
    rating: 4.7
  },
  {
    id: 'court2',
    name: 'Sân cầu lông Olympia',
    address: '45 Lê Văn Việt, Quận 9, TP.HCM',
    description: 'Sân cầu lông tiêu chuẩn, mặt sân tốt, ánh sáng đều',
    sport: 'badminton',
    sportName: 'Cầu lông',
    price: 120000,
    openTime: '07:00',
    closeTime: '21:00',
    images: [
      'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop',
    ],
    facilities: ['Đèn chiếu sáng', 'Phòng thay đồ', 'Gửi xe'],
    isAvailable: true,
    status: 'active',
    totalBookings: 32,
    totalRevenue: 3840000,
    rating: 4.5
  },
  {
    id: 'court3',
    name: 'Sân bóng rổ Hòa Bình',
    address: '78 Trần Não, Quận 2, TP.HCM',
    description: 'Sân bóng rổ ngoài trời, mặt sân cao su chất lượng cao',
    sport: 'basketball',
    sportName: 'Bóng rổ',
    price: 200000,
    openTime: '06:30',
    closeTime: '21:30',
    images: [
      'https://images.unsplash.com/photo-1505666287802-931dc83a0fe4?w=800&auto=format&fit=crop',
    ],
    facilities: ['Đèn chiếu sáng', 'Chỗ để xe', 'Nước uống'],
    isAvailable: false,
    status: 'maintenance',
    totalBookings: 15,
    totalRevenue: 3000000,
    rating: 4.3
  },
  {
    id: 'court4',
    name: 'Sân tennis Lakeview',
    address: '25 Nguyễn Hữu Thọ, Quận 7, TP.HCM',
    description: 'Sân tennis ngoài trời, view đẹp, phục vụ chuyên nghiệp',
    sport: 'tennis',
    sportName: 'Tennis',
    price: 250000,
    openTime: '06:00',
    closeTime: '20:00',
    images: [
      'https://images.unsplash.com/photo-1595228702420-b3740f7f9b5c?w=800&auto=format&fit=crop',
    ],
    facilities: ['Phòng thay đồ', 'Nhà vệ sinh', 'Chỗ để xe', 'Wifi'],
    isAvailable: true,
    status: 'active',
    totalBookings: 20,
    totalRevenue: 5000000,
    rating: 4.8
  }
];

// Map thể loại sân
const SPORT_NAMES = {
  'football': 'Bóng đá',
  'basketball': 'Bóng rổ',
  'tennis': 'Tennis',
  'badminton': 'Cầu lông',
  'volleyball': 'Bóng chuyền'
};

const MyCourts = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [courts, setCourts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSport, setFilterSport] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [sortOption, setSortOption] = useState('name-asc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  // Kiểm tra kết nối internet
  useEffect(() => {
    // Hàm xử lý khi trạng thái kết nối thay đổi
    const handleConnectionChange = () => {
      const online = navigator.onLine;
      setIsOnline(online);
      if (online) {
        // Nếu vừa có kết nối trở lại, tự động làm mới dữ liệu
        fetchCourts();
      }
    };

    // Lắng nghe sự kiện online/offline
    window.addEventListener('online', handleConnectionChange);
    window.addEventListener('offline', handleConnectionChange);

    // Dọn dẹp event listener khi component unmount
    return () => {
      window.removeEventListener('online', handleConnectionChange);
      window.removeEventListener('offline', handleConnectionChange);
    };
  }, []);
  
  // Di chuyển hàm fetchCourts ra khỏi useEffect
  const fetchCourts = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Check if user is authenticated
      if (!currentUser) {
        console.log('Không có thông tin người dùng, hiển thị dữ liệu mẫu');
        setCourts(SAMPLE_COURTS);
        setLoading(false);
        return;
      }
      
      console.log('=== DEBUG: Lấy sân của chủ sân qua Backend API ===');
      console.log('Đang lấy danh sách sân của người dùng với UID:', currentUser.uid);
      
      // Sử dụng CourtServiceWrapper thay vì truy cập Firestore trực tiếp
      const response = await CourtServiceWrapper.getCourtsByOwner(currentUser.uid);
      console.log('=== DEBUG: Raw response từ CourtServiceWrapper.getCourtsByOwner ===', response);
      
      const courtsList = response.courts || [];
      console.log('=== DEBUG: Tổng số sân của chủ sân ===', courtsList.length);
      
      // Log chi tiết về sport data
      courtsList.forEach((court, index) => {
        console.log(`=== DEBUG: Sân chủ sân ${index + 1} ===`, {
          name: court.name,
          type: court.type,
          sport: court.sport,
          sportCode: court.sportCode,
          rawData: court
        });
      });
      
      if (courtsList.length === 0) {
        console.log('Không tìm thấy sân nào của người dùng:', currentUser.uid);
        setError('Bạn chưa có sân nào. Hãy thêm sân mới!');
        setCourts([]);
        setLoading(false);
        return;
      }
      
      console.log('=== DEBUG: Sử dụng dữ liệu thực từ backend API ===', courtsList.length, 'sân');
      setCourts(courtsList);
      setError(''); // Xóa thông báo lỗi nếu có
      
    } catch (err) {
      console.error('Lỗi khi lấy danh sách sân qua API:', err);
      console.error('Chi tiết lỗi:', err);
      setError('Không thể tải danh sách sân. Vui lòng thử lại sau.');
      // Fallback to sample data on error
      console.log('=== DEBUG: Lỗi API, sử dụng dữ liệu mẫu ===');
      setCourts(SAMPLE_COURTS);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch courts from Firestore
  useEffect(() => {
    fetchCourts();

    // Thêm route làm dependency để refresh khi quay lại trang
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, window.location.pathname]);
  
  // Xử lý mở menu
  const handleMenuClick = (event, court) => {
    setAnchorEl(event.currentTarget);
    setSelectedCourt(court);
  };
  
  // Đóng menu
  const handleMenuClose = () => {
    setAnchorEl(null);
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
  
  // Xử lý xóa sân
  const handleDeleteCourt = async () => {
    if (!selectedCourt) return;
    
    try {
      setActionLoading(true);
      
      // Xóa sân từ Firestore
      await deleteDoc(doc(db, 'courts', selectedCourt.id));
      
      console.log('Đã xóa sân với ID:', selectedCourt.id);
      
      // Cập nhật state
      setCourts(courts.filter(court => court.id !== selectedCourt.id));
      handleCloseDeleteDialog();
    } catch (err) {
      console.error('Lỗi khi xóa sân:', err);
      setError('Không thể xóa sân. Vui lòng thử lại sau.');
    } finally {
      setActionLoading(false);
    }
  };
  
  // Xử lý chuyển đến trang chỉnh sửa
  const handleEditCourt = () => {
    navigate(`/owner/courts/edit/${selectedCourt.id}`);
    handleMenuClose();
  };
  
  // Xử lý thay đổi trạng thái sân
  const handleToggleStatus = async (courtId) => {
    try {
      setActionLoading(true);
      
      const courtToUpdate = courts.find(court => court.id === courtId);
      if (!courtToUpdate) return;
      
      const newIsAvailable = !courtToUpdate.isAvailable;
      const newStatus = newIsAvailable ? 'active' : 'inactive';
      
      // Cập nhật trong Firestore
      const courtRef = doc(db, 'courts', courtId);
      await updateDoc(courtRef, { 
        status: newStatus,
        updatedAt: new Date()
      });
      
      console.log(`Đã cập nhật trạng thái sân ${courtId} thành ${newStatus}`);
      
      // Cập nhật state
      setCourts(courts.map(court => {
        if (court.id === courtId) {
          return {
            ...court,
            isAvailable: newIsAvailable,
            status: newStatus
          };
        }
        return court;
      }));
    } catch (err) {
      console.error('Lỗi khi cập nhật trạng thái sân:', err);
      setError('Không thể cập nhật trạng thái sân. Vui lòng thử lại sau.');
    } finally {
      setActionLoading(false);
      handleMenuClose();
    }
  };
  
  // Lọc sân dựa trên tìm kiếm và bộ lọc
  const filteredCourts = courts.filter(court => {
    const matchesSearch = court.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          court.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSport = filterSport === 'all' || court.sport === filterSport;
    
    const matchesStatus = filterStatus === 'all' || 
                          (filterStatus === 'active' && court.isAvailable) ||
                          (filterStatus === 'inactive' && !court.isAvailable);
    
    return matchesSearch && matchesSport && matchesStatus;
  });
  
  // Sắp xếp sân
  const sortedCourts = [...filteredCourts].sort((a, b) => {
    switch (sortOption) {
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'rating-desc':
        return b.rating - a.rating;
      case 'bookings-desc':
        return b.totalBookings - a.totalBookings;
      default:
        return 0;
    }
  });
  
  // Lấy icon cho loại sân
  const getSportIcon = (sport) => {
    switch(sport) {
      case 'football':
        return <SportsSoccerIcon color="primary" />;
      case 'basketball':
        return <SportsBasketballIcon color="warning" />;
      case 'tennis':
        return <SportsTennisIcon color="success" />;
      default:
        return <SportsSoccerIcon color="action" />;
    }
  };
  
  // Format tiền VND
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
      .format(amount)
      .replace('₫', 'VNĐ');
  };
  
  // Thêm hàm refresh danh sách sân
  const handleRefreshCourts = async () => {
    setRefreshing(true);
    await fetchCourts();
    setRefreshing(false);
  };
  
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Sân của tôi
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={refreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
            onClick={handleRefreshCourts}
            disabled={refreshing || loading}
          >
            {refreshing ? 'Đang làm mới...' : 'Làm mới'}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/owner/courts/add')}
          >
            Thêm sân mới
          </Button>
        </Box>
      </Box>
      
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm theo tên hoặc địa chỉ..."
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
          
          <Grid item xs={6} md={2}>
            <TextField
              select
              fullWidth
              label="Môn thể thao"
              value={filterSport}
              onChange={(e) => setFilterSport(e.target.value)}
            >
              <MenuItem value="all">Tất cả</MenuItem>
              <MenuItem value="football">Bóng đá</MenuItem>
              <MenuItem value="basketball">Bóng rổ</MenuItem>
              <MenuItem value="tennis">Tennis</MenuItem>
              <MenuItem value="badminton">Cầu lông</MenuItem>
              <MenuItem value="volleyball">Bóng chuyền</MenuItem>
            </TextField>
          </Grid>
          
          <Grid item xs={6} md={2}>
            <TextField
              select
              fullWidth
              label="Trạng thái"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <MenuItem value="all">Tất cả</MenuItem>
              <MenuItem value="active">Đang hoạt động</MenuItem>
              <MenuItem value="inactive">Tạm ngưng</MenuItem>
              <MenuItem value="maintenance">Bảo trì</MenuItem>
            </TextField>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Sắp xếp"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SortIcon />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value="name-asc">Tên (A-Z)</MenuItem>
              <MenuItem value="name-desc">Tên (Z-A)</MenuItem>
              <MenuItem value="price-asc">Giá (Thấp-Cao)</MenuItem>
              <MenuItem value="price-desc">Giá (Cao-Thấp)</MenuItem>
              <MenuItem value="rating-desc">Đánh giá (Cao nhất)</MenuItem>
              <MenuItem value="bookings-desc">Số lượt đặt (Cao nhất)</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <CircularProgress />
        </Box>
      ) : filteredCourts.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {searchTerm || filterSport !== 'all' || filterStatus !== 'all' 
              ? 'Không tìm thấy sân nào phù hợp với điều kiện tìm kiếm'
              : 'Bạn chưa có sân nào. Hãy thêm sân mới!'}
          </Typography>
          {!(searchTerm || filterSport !== 'all' || filterStatus !== 'all') && (
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />} 
                onClick={() => navigate('/owner/courts/add')}
              >
                Thêm sân mới
              </Button>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Thêm sân để người dùng có thể tìm kiếm và đặt sân của bạn.
              </Typography>
            </Box>
          )}
        </Box>
      ) : (
        <Grid container spacing={3}>
          {sortedCourts.map((court) => (
            <Grid item xs={12} md={6} lg={4} key={court.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2, overflow: 'hidden' }}>
                <CardMedia
                  component="img"
                  height="180"
                  image={court.image}
                  alt={court.name}
                  sx={{ 
                    objectFit: 'cover',
                    bgcolor: 'grey.200'
                  }}
                  onError={(e) => {
                    console.error(`Lỗi hiển thị ảnh (${court.id}): ${court.image}`);
                    e.target.onerror = null; // Prevent infinite loop
                    e.target.src = 'https://images.unsplash.com/photo-1459865264687-595d652de67e?q=80&w=800&auto=format&fit=crop';
                  }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="h6" gutterBottom>
                      {court.name}
                    </Typography>
                    <IconButton 
                      size="small" 
                      aria-label="options"
                      onClick={(e) => handleMenuClick(e, court)}
                      disabled={actionLoading}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {getSportIcon(court.sport)}
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {court.sportName}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOnIcon fontSize="small" color="action" />
                    <Typography variant="body2" sx={{ ml: 1 }} noWrap>
                      {court.address}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AccessTimeIcon fontSize="small" color="action" />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {court.openTime} - {court.closeTime}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocalAtmIcon fontSize="small" color="action" />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {formatCurrency(court.price)}/giờ
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {court.facilities.slice(0, 3).map((facility, index) => (
                      <Chip key={index} label={facility} size="small" sx={{ mb: 0.5 }} />
                    ))}
                    {court.facilities.length > 3 && (
                      <Chip 
                        label={`+${court.facilities.length - 3}`} 
                        size="small" 
                        variant="outlined" 
                      />
                    )}
                  </Box>
                </CardContent>
                
                <Divider />
                
                <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {court.isAvailable ? (
                      <Chip 
                        icon={<CheckCircleIcon />} 
                        label="Đang hoạt động" 
                        color="success" 
                        size="small" 
                      />
                    ) : (
                      <Chip 
                        icon={<ErrorIcon />} 
                        label={court.status === 'maintenance' ? 'Đang bảo trì' : 'Tạm ngưng'} 
                        color="error" 
                        size="small" 
                      />
                    )}
                  </Box>
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={court.isAvailable}
                        onChange={() => handleToggleStatus(court.id)}
                        disabled={actionLoading}
                      />
                    }
                    label=""
                  />
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Menu for court actions */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditCourt} disabled={actionLoading}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Chỉnh sửa
        </MenuItem>
        <MenuItem onClick={handleOpenDeleteDialog} disabled={actionLoading}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Xóa
        </MenuItem>
      </Menu>
      
      {/* Confirmation dialog for deleting court */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>
          Xác nhận xóa sân
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa sân "{selectedCourt?.name}" không? Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={actionLoading}>
            Hủy
          </Button>
          <Button 
            onClick={handleDeleteCourt} 
            color="error" 
            startIcon={actionLoading ? <CircularProgress size={20} /> : null}
            disabled={actionLoading}
          >
            {actionLoading ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Thêm phần hiển thị time để debug khi nào refresh lần cuối */}
      <Box sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
        <Typography variant="caption">
          Cập nhật lúc: {new Date().toLocaleTimeString()}
        </Typography>
      </Box>
    </Box>
  );
};

export default MyCourts; 