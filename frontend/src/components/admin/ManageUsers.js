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
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import EventIcon from '@mui/icons-material/Event';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const ManageUsers = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { db } = await import('../../firebase');
      const { collection, getDocs, query, orderBy } = await import('firebase/firestore');
      
      const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const usersSnapshot = await getDocs(usersQuery);
      
      const usersData = usersSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.displayName || data.email?.split('@')[0] || 'Người dùng',
          email: data.email || 'N/A',
          phone: data.phone || 'N/A',
          role: data.role || 'renter',
          status: data.status || 'active',
          registeredDate: data.createdAt ? new Date(data.createdAt).toLocaleDateString('vi-VN') : 'N/A',
          lastLogin: data.lastLogin ? new Date(data.lastLogin).toLocaleString('vi-VN') : 'N/A',
          totalBookings: data.totalBookings || 0,
          totalCourts: data.totalCourts || 0
        };
      });
      
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      setSnackbar({ 
        open: true, 
        message: 'Lỗi khi tải danh sách người dùng', 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('vi-VN');
  };
  
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
  const handleMenuClick = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };
  
  // Đóng menu
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  // Mở dialog chi tiết người dùng
  const handleOpenDetailDialog = () => {
    setDetailDialogOpen(true);
    handleMenuClose();
  };
  
  // Đóng dialog chi tiết người dùng
  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
  };
  
  // Mở dialog xác nhận khóa tài khoản
  const handleOpenBlockDialog = () => {
    setBlockDialogOpen(true);
    handleMenuClose();
  };
  
  // Đóng dialog xác nhận khóa tài khoản
  const handleCloseBlockDialog = () => {
    setBlockDialogOpen(false);
  };
  
  // Mở dialog xác nhận xóa tài khoản
  const handleOpenDeleteDialog = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };
  
  // Đóng dialog xác nhận xóa tài khoản
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };
  
  // Xử lý khóa/mở khóa tài khoản
  const handleToggleUserStatus = async () => {
    if (!selectedUser) return;
    
    try {
      const { db } = await import('../../firebase');
      const { doc, updateDoc } = await import('firebase/firestore');
      
      const newStatus = selectedUser.status === 'active' ? 'inactive' : 'active';
      
      await updateDoc(doc(db, 'users', selectedUser.id), {
        status: newStatus
      });
      
      setUsers(users.map(user => {
        if (user.id === selectedUser.id) {
          return { ...user, status: newStatus };
        }
        return user;
      }));
      
      setSnackbar({ 
        open: true, 
        message: `Đã ${newStatus === 'active' ? 'kích hoạt' : 'khóa'} tài khoản thành công`, 
        severity: 'success' 
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      setSnackbar({ 
        open: true, 
        message: 'Lỗi khi cập nhật trạng thái người dùng', 
        severity: 'error' 
      });
    }
    
    setBlockDialogOpen(false);
  };
  
  // Xử lý xóa người dùng
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      const { db } = await import('../../firebase');
      const { doc, deleteDoc } = await import('firebase/firestore');
      
      await deleteDoc(doc(db, 'users', selectedUser.id));
      
      setUsers(users.filter(user => user.id !== selectedUser.id));
      
      setSnackbar({ 
        open: true, 
        message: 'Đã xóa người dùng thành công', 
        severity: 'success' 
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      setSnackbar({ 
        open: true, 
        message: 'Lỗi khi xóa người dùng', 
        severity: 'error' 
      });
    }
    
    setDeleteDialogOpen(false);
  };
  
  // Lọc người dùng theo tìm kiếm và bộ lọc
  const filteredUsers = users.filter(user => {
    // Lọc theo tab (vai trò)
    if (tabValue === 1 && user.role !== 'renter') return false;
    if (tabValue === 2 && user.role !== 'owner') return false;
    if (tabValue === 3 && user.role !== 'admin') return false;
    
    // Lọc theo từ khóa tìm kiếm
    const searchLower = searchTerm.toLowerCase();
    if (
      searchTerm &&
      !user.name.toLowerCase().includes(searchLower) &&
      !user.email.toLowerCase().includes(searchLower) &&
      !user.phone.toLowerCase().includes(searchLower)
    ) {
      return false;
    }
    
    // Lọc theo vai trò
    if (roleFilter !== 'all' && user.role !== roleFilter) {
      return false;
    }
    
    // Lọc theo trạng thái
    if (statusFilter !== 'all' && user.status !== statusFilter) {
      return false;
    }
    
    return true;
  });
  
  // Hiển thị chip vai trò người dùng
  const getUserRoleChip = (role) => {
    switch (role) {
      case 'admin':
        return <Chip size="small" color="error" label="Admin" />;
      case 'owner':
        return <Chip size="small" color="success" label="Chủ sân" />;
      case 'renter':
        return <Chip size="small" color="primary" label="Người thuê sân" />;
      default:
        return <Chip size="small" label={role} />;
    }
  };
  
  // Hiển thị chip trạng thái người dùng
  const getUserStatusChip = (status) => {
    switch (status) {
      case 'active':
        return <Chip size="small" color="success" icon={<CheckCircleIcon />} label="Hoạt động" />;
      case 'inactive':
        return <Chip size="small" color="error" icon={<BlockIcon />} label="Tạm khóa" />;
      case 'pending':
        return <Chip size="small" color="warning" icon={<CheckCircleIcon />} label="Chờ xác minh" />;
      default:
        return <Chip size="small" label={status} />;
    }
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
        Quản lý người dùng
      </Typography>
      
      {/* Thanh công cụ tìm kiếm và lọc */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm theo tên, email hoặc số điện thoại"
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
                  <InputLabel>Vai trò</InputLabel>
                  <Select
                    value={roleFilter}
                    label="Vai trò"
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <MenuItem value="all">Tất cả vai trò</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="owner">Chủ sân</MenuItem>
                    <MenuItem value="renter">Người thuê sân</MenuItem>
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
                    <MenuItem value="inactive">Tạm khóa</MenuItem>
                    <MenuItem value="pending">Chờ xác minh</MenuItem>
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
          <Tab label="Tất cả người dùng" />
          <Tab label="Người thuê sân" />
          <Tab label="Chủ sân" />
          <Tab label="Quản trị viên" />
        </Tabs>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Họ tên</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Số điện thoại</TableCell>
                <TableCell>Vai trò</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Ngày đăng ký</TableCell>
                <TableCell align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>{getUserRoleChip(user.role)}</TableCell>
                    <TableCell>{getUserStatusChip(user.status)}</TableCell>
                    <TableCell>{user.registeredDate}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={(e) => handleMenuClick(e, user)}
                        size="small"
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                    <Typography variant="subtitle1">
                      Không tìm thấy người dùng nào phù hợp
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
          count={filteredUsers.length}
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
        
        {selectedUser?.role !== 'admin' && (
          <MenuItem onClick={handleOpenBlockDialog}>
            {selectedUser?.status === 'active' ? (
              <>
                <BlockIcon fontSize="small" sx={{ mr: 1, color: 'error.main' }} />
                <Typography color="error.main">Khóa tài khoản</Typography>
              </>
            ) : (
              <>
                <CheckCircleIcon fontSize="small" sx={{ mr: 1, color: 'success.main' }} />
                <Typography color="success.main">Mở khóa tài khoản</Typography>
              </>
            )}
          </MenuItem>
        )}
        
        {selectedUser?.role !== 'admin' && (
          <MenuItem onClick={handleOpenDeleteDialog} sx={{ color: 'error.main' }}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Xóa tài khoản
          </MenuItem>
        )}
      </Menu>
      
      {/* Dialog chi tiết người dùng */}
      <Dialog
        open={detailDialogOpen}
        onClose={handleCloseDetailDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedUser && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon color="primary" />
                <Typography variant="h6">Thông tin người dùng</Typography>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                      Thông tin cá nhân
                    </Typography>
                    
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">Họ tên</Typography>
                          <Typography variant="body1">{selectedUser.name}</Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">Email</Typography>
                          <Typography variant="body1">{selectedUser.email}</Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">Số điện thoại</Typography>
                          <Typography variant="body1">{selectedUser.phone}</Typography>
                        </Box>
                      </Box>
                    </Stack>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                      Thông tin đặc biệt
                    </Typography>
                    
                    <Stack spacing={2}>
                      {selectedUser.role === 'owner' && (
                        <Box>
                          <Typography variant="body2" color="text.secondary">Số sân quản lý</Typography>
                          <Typography variant="body1">{selectedUser.totalCourts || 0} sân thể thao</Typography>
                        </Box>
                      )}
                      
                      {selectedUser.role === 'renter' && (
                        <Box>
                          <Typography variant="body2" color="text.secondary">Số lần đặt sân</Typography>
                          <Typography variant="body1">{selectedUser.totalBookings || 0} lần</Typography>
                        </Box>
                      )}
                      
                      {selectedUser.role === 'admin' && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AdminPanelSettingsIcon sx={{ mr: 1, color: 'error.main' }} />
                          <Typography variant="body1" color="error.main">
                            Tài khoản quản trị viên có toàn quyền trong hệ thống
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                      Thông tin tài khoản
                    </Typography>
                    
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Vai trò</Typography>
                        {getUserRoleChip(selectedUser.role)}
                      </Box>
                      
                      <Box>
                        <Typography variant="body2" color="text.secondary">Trạng thái</Typography>
                        {getUserStatusChip(selectedUser.status)}
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <EventIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">Ngày đăng ký</Typography>
                          <Typography variant="body1">{selectedUser.registeredDate}</Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <EventIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">Lần đăng nhập cuối</Typography>
                          <Typography variant="body1">{selectedUser.lastLogin}</Typography>
                        </Box>
                      </Box>
                    </Stack>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetailDialog}>Đóng</Button>
              
              {selectedUser.role !== 'admin' && (
                <>
                  <Button 
                    variant="outlined" 
                    color={selectedUser.status === 'active' ? 'error' : 'success'}
                    onClick={() => {
                      handleCloseDetailDialog();
                      handleOpenBlockDialog();
                    }}
                  >
                    {selectedUser.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                  </Button>
                  
                  <Button 
                    variant="outlined" 
                    color="error"
                    onClick={() => {
                      handleCloseDetailDialog();
                      handleOpenDeleteDialog();
                    }}
                  >
                    Xóa tài khoản
                  </Button>
                </>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Dialog xác nhận khóa/mở khóa tài khoản */}
      <Dialog
        open={blockDialogOpen}
        onClose={handleCloseBlockDialog}
      >
        <DialogTitle>
          {selectedUser?.status === 'active' 
            ? 'Xác nhận khóa tài khoản' 
            : 'Xác nhận mở khóa tài khoản'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedUser?.status === 'active' 
              ? `Bạn có chắc chắn muốn khóa tài khoản của "${selectedUser?.name}" không? Người dùng sẽ không thể đăng nhập hoặc sử dụng tính năng của hệ thống cho đến khi được mở khóa.`
              : `Bạn có chắc chắn muốn mở khóa tài khoản của "${selectedUser?.name}" không? Người dùng sẽ có thể đăng nhập và sử dụng tính năng của hệ thống.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBlockDialog}>Hủy</Button>
          <Button 
            onClick={handleToggleUserStatus} 
            color={selectedUser?.status === 'active' ? 'error' : 'success'}
            variant="contained"
          >
            {selectedUser?.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog xác nhận xóa tài khoản */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Xác nhận xóa tài khoản</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa tài khoản của "{selectedUser?.name}" không? Hành động này không thể hoàn tác và tất cả dữ liệu liên quan đến người dùng này sẽ bị xóa.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Hủy</Button>
          <Button 
            onClick={handleDeleteUser} 
            color="error"
            variant="contained"
          >
            Xóa tài khoản
          </Button>
        </DialogActions>
      </Dialog>
      
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

export default ManageUsers; 