import React, { useState } from 'react';
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
  Tab
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
  const [courts, setCourts] = useState(SAMPLE_COURTS);
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
  
  // Xử lý khóa/mở khóa sân
  const handleToggleCourtStatus = () => {
    if (!selectedCourt) return;
    
    setCourts(courts.map(court => {
      if (court.id === selectedCourt.id) {
        const newStatus = court.status === 'active' ? 'inactive' : 'active';
        return { ...court, status: newStatus };
      }
      return court;
    }));
    
    setBlockDialogOpen(false);
  };
  
  // Xử lý xóa sân
  const handleDeleteCourt = () => {
    if (!selectedCourt) return;
    
    setCourts(courts.filter(court => court.id !== selectedCourt.id));
    setDeleteDialogOpen(false);
  };
  
  // Lọc sân theo tìm kiếm và bộ lọc
  const filteredCourts = courts.filter(court => {
    // Lọc theo tab (loại sân)
    if (tabValue === 1 && court.sport !== 'football') return false;
    if (tabValue === 2 && court.sport !== 'badminton') return false;
    if (tabValue === 3 && court.sport !== 'basketball') return false;
    if (tabValue === 4 && court.sport !== 'tennis') return false;
    
    // Lọc theo từ khóa tìm kiếm
    const searchLower = searchTerm.toLowerCase();
    if (
      searchTerm &&
      !court.name.toLowerCase().includes(searchLower) &&
      !court.address.toLowerCase().includes(searchLower) &&
      !court.ownerName.toLowerCase().includes(searchLower)
    ) {
      return false;
    }
    
    // Lọc theo loại sân
    if (sportFilter !== 'all' && court.sport !== sportFilter) {
      return false;
    }
    
    // Lọc theo trạng thái
    if (statusFilter !== 'all' && court.status !== statusFilter) {
      return false;
    }
    
    return true;
  });
  
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
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Quản lý sân thể thao
      </Typography>
      
      {/* Thanh công cụ tìm kiếm và lọc */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
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
      
      {/* Tab và bảng hiển thị */}
      <Paper sx={{ borderRadius: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Tất cả sân" />
          <Tab label="Bóng đá" />
          <Tab label="Cầu lông" />
          <Tab label="Bóng rổ" />
          <Tab label="Tennis" />
        </Tabs>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Tên sân</TableCell>
                <TableCell>Loại sân</TableCell>
                <TableCell>Chủ sân</TableCell>
                <TableCell>Giá (VNĐ/giờ)</TableCell>
                <TableCell>Đặt sân</TableCell>
                <TableCell>Doanh thu</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCourts
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((court) => (
                  <TableRow key={court.id} hover>
                    <TableCell>{court.id}</TableCell>
                    <TableCell>{court.name}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getSportIcon(court.sport)}
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          {court.sportName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{court.ownerName}</TableCell>
                    <TableCell>{formatCurrency(court.price)}</TableCell>
                    <TableCell>{court.totalBookings} lần</TableCell>
                    <TableCell>{formatCurrency(court.totalRevenue)}</TableCell>
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
                ))}
              {filteredCourts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                    <Typography variant="subtitle1">
                      Không tìm thấy sân thể thao nào phù hợp
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
          count={filteredCourts.length}
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
      
      {/* Dialog chi tiết sân */}
      <Dialog
        open={detailDialogOpen}
        onClose={handleCloseDetailDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedCourt && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getSportIcon(selectedCourt.sport)}
                <Typography variant="h6">Chi tiết sân thể thao</Typography>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                      Thông tin cơ bản
                    </Typography>
                    
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Tên sân</Typography>
                        <Typography variant="body1">{selectedCourt.name}</Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="body2" color="text.secondary">Loại sân</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getSportIcon(selectedCourt.sport)}
                          <Typography variant="body1" sx={{ ml: 1 }}>
                            {selectedCourt.sportName}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                        <LocationOnIcon sx={{ mr: 1, color: 'text.secondary', mt: 0.5 }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">Địa chỉ</Typography>
                          <Typography variant="body1">{selectedCourt.address}</Typography>
                        </Box>
                      </Box>
                    </Stack>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                      Thông tin hoạt động
                    </Typography>
                    
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Giá thuê</Typography>
                        <Typography variant="body1">{formatCurrency(selectedCourt.price)}/giờ</Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="body2" color="text.secondary">Giờ hoạt động</Typography>
                        <Typography variant="body1">{selectedCourt.openTime} - {selectedCourt.closeTime}</Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="body2" color="text.secondary">Trạng thái</Typography>
                        {getStatusChip(selectedCourt.status)}
                      </Box>
                      
                      <Box>
                        <Typography variant="body2" color="text.secondary">Ngày tạo</Typography>
                        <Typography variant="body1">{selectedCourt.createdAt}</Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                      Thông tin chủ sân
                    </Typography>
                    
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                        <PersonIcon sx={{ mr: 1, color: 'text.secondary', mt: 0.5 }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">Chủ sân</Typography>
                          <Typography variant="body1">{selectedCourt.ownerName}</Typography>
                          <Typography variant="body2" color="text.secondary">ID: {selectedCourt.ownerId}</Typography>
                        </Box>
                      </Box>
                    </Stack>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                      Thống kê
                    </Typography>
                    
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Tổng số lần đặt sân</Typography>
                        <Typography variant="body1">{selectedCourt.totalBookings} lần</Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="body2" color="text.secondary">Tổng doanh thu</Typography>
                        <Typography variant="body1">{formatCurrency(selectedCourt.totalRevenue)}</Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="body2" color="text.secondary">Đánh giá trung bình</Typography>
                        <Typography variant="body1">{selectedCourt.rating}/5</Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetailDialog}>Đóng</Button>
              
              <Button 
                variant="outlined" 
                color={selectedCourt.status === 'active' ? 'error' : 'success'}
                onClick={() => {
                  handleCloseDetailDialog();
                  handleOpenBlockDialog();
                }}
              >
                {selectedCourt.status === 'active' ? 'Tạm ngưng sân' : 'Kích hoạt sân'}
              </Button>
              
              <Button 
                variant="outlined" 
                color="error"
                onClick={() => {
                  handleCloseDetailDialog();
                  handleOpenDeleteDialog();
                }}
              >
                Xóa sân
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Dialog xác nhận khóa/mở khóa sân */}
      <Dialog
        open={blockDialogOpen}
        onClose={handleCloseBlockDialog}
      >
        <DialogTitle>
          {selectedCourt?.status === 'active' 
            ? 'Xác nhận tạm ngưng sân' 
            : 'Xác nhận kích hoạt sân'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedCourt?.status === 'active' 
              ? `Bạn có chắc chắn muốn tạm ngưng hoạt động của sân "${selectedCourt?.name}" không? Sân sẽ không thể được đặt cho đến khi được kích hoạt lại.`
              : `Bạn có chắc chắn muốn kích hoạt sân "${selectedCourt?.name}" không? Sân sẽ được hiển thị trong danh sách đặt sân.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBlockDialog}>Hủy</Button>
          <Button 
            onClick={handleToggleCourtStatus} 
            color={selectedCourt?.status === 'active' ? 'error' : 'success'}
            variant="contained"
          >
            {selectedCourt?.status === 'active' ? 'Tạm ngưng sân' : 'Kích hoạt sân'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog xác nhận xóa sân */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Xác nhận xóa sân</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa sân "{selectedCourt?.name}" không? Hành động này không thể hoàn tác và tất cả dữ liệu liên quan đến sân này sẽ bị xóa.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Hủy</Button>
          <Button 
            onClick={handleDeleteCourt} 
            color="error"
            variant="contained"
          >
            Xóa sân
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageCourts; 