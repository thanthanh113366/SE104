import React, { useState } from 'react';
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
  InputAdornment
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

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

const MyCourts = () => {
  const navigate = useNavigate();
  const [courts, setCourts] = useState(SAMPLE_COURTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSport, setFilterSport] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [sortOption, setSortOption] = useState('name-asc');
  
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
  const handleDeleteCourt = () => {
    // Trong trường hợp thực tế, bạn sẽ gọi API để xóa sân
    setCourts(courts.filter(court => court.id !== selectedCourt.id));
    handleCloseDeleteDialog();
  };
  
  // Xử lý chuyển đến trang chỉnh sửa
  const handleEditCourt = () => {
    navigate(`/owner/courts/edit/${selectedCourt.id}`);
    handleMenuClose();
  };
  
  // Xử lý thay đổi trạng thái sân
  const handleToggleStatus = (courtId) => {
    setCourts(courts.map(court => {
      if (court.id === courtId) {
        const newIsAvailable = !court.isAvailable;
        return {
          ...court,
          isAvailable: newIsAvailable,
          status: newIsAvailable ? 'active' : 'inactive'
        };
      }
      return court;
    }));
    handleMenuClose();
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
  
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Quản lý sân thể thao
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => navigate('/owner/courts/add')}
        >
          Thêm sân mới
        </Button>
      </Box>
      
      {/* Bộ lọc và tìm kiếm */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm theo tên hoặc địa chỉ"
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
              label="Loại sân"
              value={filterSport}
              onChange={(e) => setFilterSport(e.target.value)}
            >
              <MenuItem value="all">Tất cả loại sân</MenuItem>
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
              <MenuItem value="all">Tất cả trạng thái</MenuItem>
              <MenuItem value="active">Đang hoạt động</MenuItem>
              <MenuItem value="inactive">Tạm ngưng</MenuItem>
            </TextField>
          </Grid>
          
          <Grid item xs={12} md={4}>
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
              <MenuItem value="name-asc">Tên A-Z</MenuItem>
              <MenuItem value="name-desc">Tên Z-A</MenuItem>
              <MenuItem value="price-asc">Giá tăng dần</MenuItem>
              <MenuItem value="price-desc">Giá giảm dần</MenuItem>
              <MenuItem value="rating-desc">Đánh giá cao nhất</MenuItem>
              <MenuItem value="bookings-desc">Đặt sân nhiều nhất</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Hiển thị kết quả */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1">
          {sortedCourts.length} Sân thể thao
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        {sortedCourts.map((court) => (
          <Grid item xs={12} md={6} lg={4} key={court.id}>
            <Card sx={{ 
              borderRadius: 2, 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              boxShadow: 2
            }}>
              <Box sx={{ position: 'relative' }}>
                <CardMedia
                  component="img"
                  height="180"
                  image={court.images[0]}
                  alt={court.name}
                />
                <Box sx={{ 
                  position: 'absolute', 
                  top: 10, 
                  right: 10,
                  display: 'flex',
                  gap: 1
                }}>
                  <Chip 
                    label={court.sportName} 
                    size="small" 
                    color="primary" 
                    icon={getSportIcon(court.sport)}
                  />
                  <Chip 
                    label={court.isAvailable ? 'Đang hoạt động' : 'Tạm ngưng'} 
                    size="small" 
                    color={court.isAvailable ? 'success' : 'error'} 
                    icon={court.isAvailable ? <CheckCircleIcon /> : <ErrorIcon />}
                  />
                </Box>
              </Box>
              
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {court.name}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOnIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {court.address}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocalAtmIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                  <Typography variant="body2">
                    {formatCurrency(court.price)}/giờ
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AccessTimeIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                  <Typography variant="body2">
                    {court.openTime} - {court.closeTime}
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 1 }} />
                
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Đặt sân:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {court.totalBookings} lần
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Doanh thu:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(court.totalRevenue)}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
              
              <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={court.isAvailable}
                      onChange={() => handleToggleStatus(court.id)}
                      color="success"
                    />
                  }
                  label={court.isAvailable ? "Hoạt động" : "Tạm ngưng"}
                />
                
                <div>
                  <Button 
                    variant="outlined" 
                    startIcon={<EditIcon />}
                    size="small"
                    onClick={() => navigate(`/owner/courts/edit/${court.id}`)}
                    sx={{ mr: 1 }}
                  >
                    Sửa
                  </Button>
                  <IconButton 
                    aria-label="more options" 
                    onClick={(e) => handleMenuClick(e, court)}
                    size="small"
                  >
                    <MoreVertIcon />
                  </IconButton>
                </div>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {/* Menu tùy chọn */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditCourt}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Chỉnh sửa sân
        </MenuItem>
        <MenuItem 
          onClick={() => handleToggleStatus(selectedCourt?.id)}
          sx={{ color: selectedCourt?.isAvailable ? 'error.main' : 'success.main' }}
        >
          {selectedCourt?.isAvailable ? (
            <>
              <ErrorIcon fontSize="small" sx={{ mr: 1 }} />
              Tạm ngưng hoạt động
            </>
          ) : (
            <>
              <CheckCircleIcon fontSize="small" sx={{ mr: 1 }} />
              Kích hoạt sân
            </>
          )}
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleOpenDeleteDialog} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Xóa sân
        </MenuItem>
      </Menu>
      
      {/* Dialog xác nhận xóa */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Xác nhận xóa sân</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa sân "{selectedCourt?.name}"? Hành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu liên quan đến sân này.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Hủy</Button>
          <Button onClick={handleDeleteCourt} color="error" variant="contained">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Hiển thị khi không có sân nào */}
      {sortedCourts.length === 0 && (
        <Paper sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Không tìm thấy sân thể thao
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Không có sân thể thao nào phù hợp với tiêu chí tìm kiếm hoặc bạn chưa thêm sân nào.
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => navigate('/owner/courts/add')}
          >
            Thêm sân mới
          </Button>
        </Paper>
      )}
    </Box>
  );
};

export default MyCourts; 