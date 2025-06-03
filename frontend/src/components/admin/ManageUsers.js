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
  Alert,
  Snackbar,
  CircularProgress,
  Avatar
} from '@mui/material';

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
import RefreshIcon from '@mui/icons-material/Refresh';

// Services
import { adminService } from '../../services/api';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
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
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [userStats, setUserStats] = useState(null);
  
  // Load users from Firebase
  useEffect(() => {
    loadUsers();
    loadUserStats();
  }, []);

  // Filter users when search term or filters change
  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, statusFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllUsers();
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
      showSnackbar('Không thể tải danh sách người dùng', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      const response = await adminService.getUserStats();
      setUserStats(response.data.stats || null);
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phoneNumber?.includes(searchTerm)
      );
    }

    // Filter by role
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    setFilteredUsers(filtered);
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
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

  // Thay đổi trạng thái người dùng
  const handleToggleUserStatus = async () => {
    try {
      const newStatus = selectedUser.status === 'active' ? 'inactive' : 'active';
      await adminService.updateUserStatus(selectedUser.id, newStatus);
      
      // Update local state
      setUsers(users.map(user => 
        user.id === selectedUser.id 
          ? { ...user, status: newStatus }
          : user
      ));
      
      showSnackbar(
        `${newStatus === 'active' ? 'Kích hoạt' : 'Khóa'} tài khoản thành công`,
        'success'
      );
    } catch (error) {
      console.error('Error updating user status:', error);
      showSnackbar('Không thể cập nhật trạng thái tài khoản', 'error');
    } finally {
      handleCloseBlockDialog();
    }
  };

  // Xóa người dùng
  const handleDeleteUser = async () => {
    try {
      await adminService.deleteUser(selectedUser.id);
      
      // Update local state
      setUsers(users.filter(user => user.id !== selectedUser.id));
      
      showSnackbar('Xóa người dùng thành công', 'success');
      await loadUserStats(); // Reload stats
    } catch (error) {
      console.error('Error deleting user:', error);
      showSnackbar(
        error.response?.data?.message || 'Không thể xóa người dùng',
        'error'
      );
    } finally {
      handleCloseDeleteDialog();
    }
  };

  // Làm mới danh sách
  const handleRefresh = () => {
    loadUsers();
    loadUserStats();
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setStatusFilter('all');
  };

  // Lấy chip màu cho vai trò
  const getUserRoleChip = (role) => {
    const roleConfig = {
      admin: { label: 'Quản trị viên', color: 'error' },
      owner: { label: 'Chủ sân', color: 'warning' },
      renter: { label: 'Người thuê', color: 'primary' }
    };
    
    const config = roleConfig[role] || { label: 'Chưa xác định', color: 'default' };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  // Lấy chip màu cho trạng thái
  const getUserStatusChip = (status) => {
    const statusConfig = {
      active: { label: 'Hoạt động', color: 'success' },
      inactive: { label: 'Bị khóa', color: 'error' },
      banned: { label: 'Bị cấm', color: 'error' }
    };
    
    const config = statusConfig[status] || { label: 'Chưa xác định', color: 'default' };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa có thông tin';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Không hợp lệ';
    }
  };

  // Get paginated users
  const paginatedUsers = filteredUsers.slice(
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
          Quản lý người dùng
        </Typography>
        
        {/* Stats */}
        {userStats && (
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">{userStats.total}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Tổng người dùng
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">{userStats.byRole.admin}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Quản trị viên
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">{userStats.byRole.owner}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Chủ sân
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">{userStats.byRole.renter}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Người thuê
                </Typography>
              </Paper>
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
              placeholder="Tìm kiếm theo tên, email, số điện thoại..."
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
              <InputLabel>Vai trò</InputLabel>
              <Select
                value={roleFilter}
                label="Vai trò"
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="admin">Quản trị viên</MenuItem>
                <MenuItem value="owner">Chủ sân</MenuItem>
                <MenuItem value="renter">Người thuê</MenuItem>
              </Select>
            </FormControl>
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
                <MenuItem value="active">Hoạt động</MenuItem>
                <MenuItem value="inactive">Bị khóa</MenuItem>
                <MenuItem value="banned">Bị cấm</MenuItem>
              </Select>
            </FormControl>
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
                <TableCell>Người dùng</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Số điện thoại</TableCell>
                <TableCell>Vai trò</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Ngày tạo</TableCell>
                <TableCell>Đăng nhập cuối</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedUsers.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar 
                        src={user.photoURL} 
                        sx={{ width: 32, height: 32 }}
                      >
                        {user.displayName?.[0] || user.email?.[0] || 'U'}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {user.displayName || 'Chưa có tên'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {user.id.slice(0, 8)}...
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phoneNumber || 'Chưa có'}</TableCell>
                  <TableCell>{getUserRoleChip(user.role)}</TableCell>
                  <TableCell>{getUserStatusChip(user.status)}</TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell>{formatDate(user.lastSignInTime)}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      onClick={(e) => handleMenuClick(e, user)}
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
          count={filteredUsers.length}
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
        <MenuItem onClick={handleOpenBlockDialog}>
          {selectedUser?.status === 'active' ? (
            <>
              <BlockIcon sx={{ mr: 1 }} />
              Khóa tài khoản
            </>
          ) : (
            <>
              <CheckCircleIcon sx={{ mr: 1 }} />
              Kích hoạt tài khoản
            </>
          )}
        </MenuItem>
        <MenuItem onClick={handleOpenDeleteDialog} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Xóa tài khoản
        </MenuItem>
      </Menu>

      {/* User Detail Dialog */}
      <Dialog open={detailDialogOpen} onClose={handleCloseDetailDialog} maxWidth="md" fullWidth>
        <DialogTitle>Chi tiết người dùng</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">Tên hiển thị</Typography>
                <Typography variant="body1">{selectedUser.displayName || 'Chưa có'}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">Email</Typography>
                <Typography variant="body1">{selectedUser.email}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">Số điện thoại</Typography>
                <Typography variant="body1">{selectedUser.phoneNumber || 'Chưa có'}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">Vai trò</Typography>
                <Typography variant="body1">{getUserRoleChip(selectedUser.role)}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">Trạng thái</Typography>
                <Typography variant="body1">{getUserStatusChip(selectedUser.status)}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">Email đã xác minh</Typography>
                <Typography variant="body1">{selectedUser.emailVerified ? 'Đã xác minh' : 'Chưa xác minh'}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">Ngày tạo</Typography>
                <Typography variant="body1">{formatDate(selectedUser.createdAt)}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">Đăng nhập cuối</Typography>
                <Typography variant="body1">{formatDate(selectedUser.lastSignInTime)}</Typography>
              </Grid>
              {selectedUser.address && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Địa chỉ</Typography>
                  <Typography variant="body1">{selectedUser.address}</Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailDialog}>Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* Block/Unblock Confirmation Dialog */}
      <Dialog open={blockDialogOpen} onClose={handleCloseBlockDialog}>
        <DialogTitle>
          {selectedUser?.status === 'active' ? 'Khóa tài khoản' : 'Kích hoạt tài khoản'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedUser?.status === 'active' 
              ? `Bạn có chắc chắn muốn khóa tài khoản của ${selectedUser?.displayName || selectedUser?.email}?`
              : `Bạn có chắc chắn muốn kích hoạt tài khoản của ${selectedUser?.displayName || selectedUser?.email}?`
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBlockDialog}>Hủy</Button>
          <Button 
            onClick={handleToggleUserStatus} 
            color={selectedUser?.status === 'active' ? 'error' : 'success'}
          >
            {selectedUser?.status === 'active' ? 'Khóa' : 'Kích hoạt'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Xóa tài khoản</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa tài khoản của {selectedUser?.displayName || selectedUser?.email}?
            Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Hủy</Button>
          <Button onClick={handleDeleteUser} color="error">
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

export default ManageUsers; 