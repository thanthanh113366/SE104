import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Paper, 
  Container,
  Divider,
  IconButton,
  InputAdornment,
  Alert,
  Link as MuiLink,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import GoogleIcon from '@mui/icons-material/Google';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [openResetDialog, setOpenResetDialog] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState('');
  
  const { login, loginWithGoogle, currentUser, userDetails, resetPassword } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      return setError('Vui lòng nhập email và mật khẩu');
    }
    
    try {
      setError('');
      setLoading(true);
      
      // Thêm timeout để ngăn chặn tình trạng treo trang
      const loginPromise = login(email, password, rememberMe);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Thao tác hết thời gian. Vui lòng thử lại sau.")), 10000);
      });
      
      await Promise.race([loginPromise, timeoutPromise]);
    } catch (error) {
      console.error("Login error:", error);
      
      // Xử lý các lỗi phổ biến từ Firebase Auth
      if (error.code === 'auth/too-many-requests') {
        setError('Tài khoản tạm khóa 30 phút do nhập sai mật khẩu quá nhiều lần. Vui lòng thử lại sau hoặc sử dụng tính năng "Quên mật khẩu".');
      } else if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        setError('Sai thông tin đăng nhập!');
      } else if (error.code === 'auth/user-disabled') {
        setError('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.');
      } else {
        setError(error.message || "Đã xảy ra lỗi khi đăng nhập");
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoogleLogin = async () => {
    try {
      setError('');
      setLoading(true);
      
      // Thêm timeout để ngăn chặn tình trạng treo trang
      const googleLoginPromise = loginWithGoogle(rememberMe);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Thao tác hết thời gian. Vui lòng thử lại sau.")), 10000);
      });
      
      await Promise.race([googleLoginPromise, timeoutPromise]);
    } catch (error) {
      console.error("Google login error:", error);
      
      // Xử lý các lỗi phổ biến từ Firebase Auth
      if (error.code === 'auth/too-many-requests') {
        setError('Tài khoản tạm khóa 30 phút do đăng nhập quá nhiều lần. Vui lòng thử lại sau.');
      } else if (error.code === 'auth/user-disabled') {
        setError('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        setError('Bạn đã đóng cửa sổ đăng nhập Google. Vui lòng thử lại.');
      } else {
        setError(error.message || "Đã xảy ra lỗi khi đăng nhập với Google");
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleOpenResetDialog = () => {
    if (!email) {
      setError('Vui lòng nhập email trước khi sử dụng tính năng quên mật khẩu');
      return;
    }
    setResetError('');
    setResetSuccess(false);
    setOpenResetDialog(true);
  };
  
  const handleResetPassword = async () => {
    try {
      setResetError('');
      setLoading(true);
      
      // Thêm timeout để ngăn chặn tình trạng treo trang
      const resetPromise = resetPassword(email);
      const timeoutPromise = new Promise((resolve, reject) => {
        setTimeout(() => resolve("timeout"), 10000); // 10 giây timeout
      });
      
      // Sử dụng Promise.race để ngăn chặn tình trạng treo vô hạn
      const result = await Promise.race([resetPromise, timeoutPromise]);
      
      if (result === "timeout") {
        setResetError("Quá thời gian chờ. Vui lòng thử lại sau.");
      } else {
        setResetSuccess(true);
      }
    } catch (error) {
      setResetError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCloseResetDialog = () => {
    setOpenResetDialog(false);
    setResetError('');
    setResetSuccess(false);
  };
  
  useEffect(() => {
    if (currentUser) {
      console.log("Login - User already logged in:", currentUser.uid);
      
      if (userDetails) {
        console.log("Login - User details available:", userDetails);
        
        if (userDetails.role) {
          console.log("Login - User has role:", userDetails.role);
          if (userDetails.role === 'admin') {
            navigate('/admin');
          } else if (userDetails.role === 'owner') {
            navigate('/owner');
          } else if (userDetails.role === 'renter') {
            navigate('/renter');
          }
        } else {
          console.log("Login - User has no role, redirecting to select-role");
          navigate('/select-role');
        }
      } else {
        console.log("Login - User details not available yet");
        setTimeout(() => {
          navigate('/');
        }, 500);
      }
    }
  }, [currentUser, userDetails, navigate]);
  
  return (
    <Container component="main" maxWidth="sm">
      <Paper elevation={3} sx={{ mt: 8, p: 4, borderRadius: 2 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
            Đăng nhập
          </Typography>
          
          {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Mật khẩu"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={rememberMe} 
                    onChange={(e) => setRememberMe(e.target.checked)} 
                    color="primary"
                  />
                }
                label="Ghi nhớ đăng nhập"
              />
              
              <MuiLink 
                component="button" 
                type="button"
                variant="body2" 
                onClick={handleOpenResetDialog}
                sx={{ textAlign: 'right' }}
              >
                Quên mật khẩu?
              </MuiLink>
            </Box>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ 
                py: 1.5, 
                mb: 2,
                fontWeight: 'bold',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  transition: '0.3s',
                }
              }}
            >
              {loading ? 'Đang xử lý...' : 'Đăng nhập'}
            </Button>
            
            <Divider sx={{ my: 2 }}>hoặc</Divider>
            
            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleLogin}
              disabled={loading}
              sx={{ 
                py: 1.5, 
                mb: 2,
                '&:hover': {
                  backgroundColor: '#f8f8f8',
                }
              }}
            >
              Đăng nhập với Google
            </Button>
            
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2">
                Chưa có tài khoản?{' '}
                <MuiLink component={Link} to="/register" variant="body2" sx={{ fontWeight: 'bold' }}>
                  Đăng ký ngay
                </MuiLink>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>
      
      {/* Dialog Quên mật khẩu */}
      <Dialog open={openResetDialog} onClose={handleCloseResetDialog}>
        <DialogTitle>Quên mật khẩu</DialogTitle>
        <DialogContent>
          {resetSuccess ? (
            <Alert severity="success" sx={{ mt: 2 }}>
              Hướng dẫn đặt lại mật khẩu đã được gửi đến email: {email}. Vui lòng kiểm tra hộp thư.
            </Alert>
          ) : (
            <>
              <DialogContentText>
                Chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu đến email: <strong>{email}</strong>
              </DialogContentText>
              {resetError && <Alert severity="error" sx={{ mt: 2 }}>{resetError}</Alert>}
            </>
          )}
        </DialogContent>
        <DialogActions>
          {resetSuccess ? (
            <Button onClick={handleCloseResetDialog}>Đóng</Button>
          ) : (
            <>
              <Button onClick={handleCloseResetDialog}>Hủy</Button>
              <Button onClick={handleResetPassword} disabled={loading}>
                {loading ? 'Đang xử lý...' : 'Gửi'}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Login; 