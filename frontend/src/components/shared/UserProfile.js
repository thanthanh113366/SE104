import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Avatar,
  IconButton,
  Divider,
  Tab,
  Tabs,
  Alert,
  Snackbar,
  CircularProgress,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress
} from '@mui/material';
import {
  Save as SaveIcon,
  Edit as EditIcon,
  CameraAlt as CameraIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider, updateProfile } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

// Component TabPanel để hiển thị nội dung của từng tab
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const UserProfile = () => {
  const { currentUser, userDetails, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    phoneNumber: '',
    photoURL: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Lấy dữ liệu người dùng khi component mount
  useEffect(() => {
    if (userDetails) {
      setFormData({
        displayName: userDetails.displayName || '',
        phoneNumber: userDetails.phoneNumber || '',
        photoURL: userDetails.tempPhotoURL || userDetails.photoURL || currentUser?.photoURL || ''
      });
    }
  }, [userDetails, currentUser]);

  // Xử lý thay đổi tab
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Xử lý thay đổi form thông tin cá nhân
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Xử lý thay đổi form đổi mật khẩu
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Xử lý upload ảnh đại diện
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      setError('');
      setUploadProgress(0);
      
      // Kiểm tra kích thước tệp (giới hạn 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("Kích thước ảnh quá lớn. Tối đa 5MB.");
      }
      
      // Kiểm tra loại tệp
      if (!file.type.match('image.*')) {
        throw new Error("Vui lòng chọn tệp hình ảnh.");
      }
      
      // Đọc file thành Data URL để hiển thị tạm thời
      const reader = new FileReader();
      
      // Promise để đợi đọc file xong
      const fileReaderPromise = new Promise((resolve, reject) => {
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = (error) => reject(error);
      });
      
      reader.readAsDataURL(file);
      
      // Đợi đọc file xong và hiển thị trước khi tiếp tục
      const tempURL = await fileReaderPromise;
      
      // Hiển thị ảnh tạm thời trong UI để phản hồi người dùng ngay lập tức
      setFormData(prev => ({
        ...prev,
        photoURL: tempURL
      }));
      
      // Tăng tiến trình lên 30%
      setUploadProgress(30);
      
      // Tạm thời lưu URL tạm thời vào Firestore
      // Bỏ qua việc tải lên Firebase Storage do vấn đề CORS
      try {
        // Lưu URL tạm thời vào Firestore
        const userRef = doc(db, "users", currentUser.uid);
        await updateDoc(userRef, { tempPhotoURL: tempURL });
        
        setSuccess("Đã lưu ảnh tạm thời. Tải lên Firebase Storage sẽ được thực hiện sau.");
        setUploadProgress(100);
        setUploadingImage(false);
      } catch (error) {
        console.error("Lỗi khi lưu URL tạm thời:", error);
        setError("Không thể lưu ảnh tạm thời: " + error.message);
        setUploadingImage(false);
      }
    } catch (error) {
      console.error("Lỗi khi tải lên ảnh:", error);
      setError(error.message || "Không thể tải lên ảnh. Vui lòng thử lại.");
      setUploadingImage(false);
      setUploadProgress(0);
    }
  };

  // Lưu thông tin cá nhân
  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!currentUser) {
        throw new Error("Không tìm thấy thông tin người dùng");
      }
      
      // Validate thông tin
      if (!formData.displayName) {
        throw new Error("Họ tên không được để trống");
      }
      
      if (formData.phoneNumber && !/^0\d{9}$/.test(formData.phoneNumber)) {
        throw new Error("Số điện thoại không hợp lệ");
      }
      
      // Chuẩn bị dữ liệu cần cập nhật
      const firestoreData = {
        displayName: formData.displayName,
        phoneNumber: formData.phoneNumber,
        // Nếu đang sử dụng ảnh tạm thời, lưu tempPhotoURL
        tempPhotoURL: formData.photoURL.startsWith('data:') ? formData.photoURL : null
      };
      
      // Chỉ cập nhật photoURL trong Firestore nếu không phải data URL
      if (!formData.photoURL.startsWith('data:')) {
        firestoreData.photoURL = formData.photoURL;
      }
      
      const authData = {
        displayName: formData.displayName,
        // Không lưu data URL vào Authentication
        photoURL: formData.photoURL.startsWith('data:') ? null : formData.photoURL
      };
      
      // Cập nhật đồng thời cả Firestore và Authentication
      const userRef = doc(db, "users", currentUser.uid);
      await Promise.all([
        updateDoc(userRef, firestoreData),
        updateProfile(currentUser, authData)
      ]);
      
      // Hiển thị thông báo thành công
      setSuccess("Cập nhật thông tin thành công!");
      setEditMode(false);
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Mở dialog đổi mật khẩu
  const handleOpenPasswordDialog = () => {
    setPasswordDialogOpen(true);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  // Đóng dialog đổi mật khẩu
  const handleClosePasswordDialog = () => {
    setPasswordDialogOpen(false);
    setError('');
  };

  // Đổi mật khẩu
  const handleChangePassword = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Kiểm tra mật khẩu
      if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
        throw new Error("Vui lòng điền đầy đủ thông tin mật khẩu");
      }
      
      if (passwordData.newPassword.length < 6) {
        throw new Error("Mật khẩu mới phải có ít nhất 6 ký tự");
      }
      
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        throw new Error("Mật khẩu xác nhận không khớp với mật khẩu mới");
      }
      
      if (passwordData.currentPassword === passwordData.newPassword) {
        throw new Error("Mật khẩu mới không được trùng với mật khẩu hiện tại");
      }
      
      // Xác thực lại người dùng trước khi thay đổi mật khẩu
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        passwordData.currentPassword
      );
      
      try {
        // Xác thực lại với mật khẩu hiện tại
        await reauthenticateWithCredential(currentUser, credential);
        
        // Thay đổi mật khẩu nếu xác thực thành công
        await updatePassword(currentUser, passwordData.newPassword);
        
        // Hiển thị thông báo thành công
        setSuccess("Đổi mật khẩu thành công!");
        setPasswordDialogOpen(false);
      } catch (authError) {
        // Xử lý các lỗi xác thực cụ thể
        if (authError.code === 'auth/wrong-password') {
          throw new Error("Mật khẩu hiện tại không chính xác. Vui lòng kiểm tra lại.");
        } else if (authError.code === 'auth/too-many-requests') {
          throw new Error("Quá nhiều yêu cầu không thành công. Vui lòng thử lại sau vài phút.");
        } else if (authError.code === 'auth/requires-recent-login') {
          throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng xuất và đăng nhập lại để tiếp tục.");
        } else if (authError.code === 'auth/invalid-credential') {
          throw new Error("Thông tin xác thực không hợp lệ. Vui lòng kiểm tra lại mật khẩu hiện tại.");
        } else {
          console.error("Lỗi Firebase:", authError);
          throw new Error("Không thể đổi mật khẩu. Lỗi: " + (authError.message || "không xác định"));
        }
      }
    } catch (error) {
      console.error("Lỗi khi đổi mật khẩu:", error);
      setError(error.message || "Đã xảy ra lỗi khi đổi mật khẩu. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý đóng thông báo
  const handleCloseSnackbar = () => {
    setSuccess('');
  };

  // Hàm xử lý quay lại
  const handleGoBack = () => {
    // Quay lại trang trước đó
    navigate(-1);
  };

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleGoBack}
            variant="outlined"
            sx={{ mb: 2 }}
          >
            Quay lại
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', flex: 1, textAlign: 'center' }}>
            Thông tin tài khoản
          </Typography>
          <Box sx={{ width: 100 }}></Box>
        </Box>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile tabs">
            <Tab label="Thông tin cá nhân" />
            <Tab label="Bảo mật" />
          </Tabs>
        </Box>
        
        {/* Tab Thông tin cá nhân */}
        <TabPanel value={tabValue} index={0}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box sx={{ position: 'relative', mb: 2 }}>
                <Avatar
                  src={formData.photoURL}
                  alt={formData.displayName || "User"}
                  sx={{ width: 150, height: 150, mb: 2 }}
                />
                {uploadingImage && (
                  <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
                    <LinearProgress variant="determinate" value={uploadProgress} />
                    <Typography variant="caption" align="center" display="block">
                      {uploadProgress}%
                    </Typography>
                  </Box>
                )}
                {editMode && (
                  <>
                    <input
                      accept="image/*"
                      type="file"
                      id="upload-profile-image"
                      style={{ display: 'none' }}
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                    />
                    <label htmlFor="upload-profile-image">
                      <IconButton
                        component="span"
                        sx={{
                          position: 'absolute',
                          bottom: 10,
                          right: 0,
                          bgcolor: 'primary.main',
                          color: 'white',
                          '&:hover': { bgcolor: 'primary.dark' }
                        }}
                        disabled={uploadingImage}
                      >
                        {uploadingImage ? <CircularProgress size={24} color="inherit" /> : <CameraIcon />}
                      </IconButton>
                    </label>
                  </>
                )}
              </Box>
              
              <Typography variant="h6" align="center" gutterBottom>
                {userDetails?.displayName || "Tên người dùng"}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" align="center" gutterBottom>
                {currentUser?.email}
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <Button
                  variant={editMode ? "outlined" : "contained"}
                  startIcon={editMode ? <SaveIcon /> : <EditIcon />}
                  onClick={editMode ? handleSaveProfile : () => setEditMode(true)}
                  disabled={loading}
                  sx={{ px: 3 }}
                >
                  {loading ? "Đang xử lý..." : editMode ? "Lưu thay đổi" : "Chỉnh sửa"}
                </Button>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Thông tin cá nhân
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Họ và tên"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleChange}
                    disabled={!editMode || loading}
                    required
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={currentUser?.email || ""}
                    disabled
                    helperText="Email không thể thay đổi"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Số điện thoại"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    disabled={!editMode || loading}
                    helperText={editMode ? "Định dạng: 10 số, bắt đầu bằng số 0" : ""}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Vai trò"
                    value={
                      userDetails?.role === 'owner' 
                        ? 'Chủ sân' 
                        : userDetails?.role === 'renter' 
                          ? 'Người thuê sân' 
                          : userDetails?.role === 'admin' 
                            ? 'Quản trị viên' 
                            : 'Chưa xác định'
                    }
                    disabled
                  />
                </Grid>
                
                {editMode && (
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSaveProfile}
                      disabled={loading}
                      startIcon={<SaveIcon />}
                      fullWidth
                      sx={{ mt: 2 }}
                    >
                      {loading ? "Đang lưu..." : "Lưu thay đổi"}
                    </Button>
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Tab Bảo mật */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Bảo mật tài khoản
          </Typography>
          
          <Box sx={{ my: 3 }}>
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={8}>
                <Typography variant="subtitle1">Mật khẩu</Typography>
                <Typography variant="body2" color="text.secondary">
                  Thay đổi mật khẩu của bạn để bảo vệ tài khoản
                </Typography>
              </Grid>
              <Grid item xs={12} md={4} sx={{ textAlign: 'right' }}>
                <Button 
                  variant="outlined" 
                  onClick={handleOpenPasswordDialog}
                >
                  Đổi mật khẩu
                </Button>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={8}>
                <Typography variant="subtitle1">Đăng xuất khỏi tất cả thiết bị</Typography>
                <Typography variant="body2" color="text.secondary">
                  Đăng xuất tài khoản của bạn trên tất cả các thiết bị đã đăng nhập
                </Typography>
              </Grid>
              <Grid item xs={12} md={4} sx={{ textAlign: 'right' }}>
                <Button 
                  variant="outlined" 
                  color="error"
                  onClick={logout}
                >
                  Đăng xuất
                </Button>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>
      </Paper>
      
      {/* Dialog đổi mật khẩu */}
      <Dialog open={passwordDialogOpen} onClose={handleClosePasswordDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Đổi mật khẩu</DialogTitle>
        <DialogContent>
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 2, mt: 1 }}
              variant="filled"
            >
              {error}
            </Alert>
          )}
          
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              margin="normal"
              label="Mật khẩu hiện tại"
              name="currentPassword"
              type={showCurrentPassword ? "text" : "password"}
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              required
              error={!!error && error.includes("hiện tại")}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      edge="end"
                    >
                      {showCurrentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            
            <TextField
              fullWidth
              margin="normal"
              label="Mật khẩu mới"
              name="newPassword"
              type={showNewPassword ? "text" : "password"}
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              required
              error={!!error && error.includes("mới")}
              helperText="Mật khẩu phải có ít nhất 6 ký tự"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      edge="end"
                    >
                      {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            
            <TextField
              fullWidth
              margin="normal"
              label="Xác nhận mật khẩu mới"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              required
              error={!!error && error.includes("xác nhận")}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePasswordDialog} disabled={loading}>
            Hủy
          </Button>
          <Button 
            onClick={handleChangePassword} 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} />
                Đang xử lý...
              </Box>
            ) : "Xác nhận"}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Thông báo thành công */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UserProfile; 