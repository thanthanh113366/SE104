import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Grid, 
  Link, 
  Paper, 
  Container,
  Divider,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import { Google as GoogleIcon, Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Register = () => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('renter');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { register, loginWithGoogle, currentUser, userDetails } = useAuth();
  const navigate = useNavigate();

  // Kiểm tra nếu người dùng đã đăng nhập
  useEffect(() => {
    if (currentUser && userDetails) {
      redirectBasedOnRole(userDetails.role);
    }
  }, [currentUser, userDetails]);

  const redirectBasedOnRole = (role) => {
    if (role === 'admin') {
      navigate('/admin/dashboard');
    } else if (role === 'owner') {
      navigate('/owner/dashboard');
    } else if (role === 'renter') {
      navigate('/courts');
    } else {
      navigate('/select-role');
    }
  };

  const handleEmailRegister = async (e) => {
    e.preventDefault();
    
    // Validate password match
    if (password !== confirmPassword) {
      setErrorMessage('Mật khẩu không khớp');
      return;
    }
    
    setLoading(true);
    setErrorMessage('');
    
    try {
      await register(email, password, displayName, role);
      
      // Chuyển hướng sẽ được xử lý bởi useEffect khi userDetails được cập nhật
    } catch (error) {
      console.error("Registration error:", error);
      
      // Xử lý các lỗi đăng ký thường gặp
      if (error.code === 'auth/email-already-in-use') {
        setErrorMessage('Email này đã được sử dụng');
      } else if (error.code === 'auth/weak-password') {
        setErrorMessage('Mật khẩu quá yếu (cần ít nhất 6 ký tự)');
      } else {
        setErrorMessage(error.message || 'Đăng ký thất bại');
      }
      
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setLoading(true);
    setErrorMessage('');
    
    try {
      await loginWithGoogle(role);
      
      // Chuyển hướng sẽ được xử lý bởi useEffect khi userDetails được cập nhật
    } catch (error) {
      console.error("Google registration error:", error);
      setErrorMessage(error.message || 'Đăng ký với Google thất bại');
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Paper elevation={3} sx={{ width: '100%', padding: '40px' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h4" sx={{ fontWeight: 700, mb: 4, color: '#1976d2' }}>
            Đăng Ký
          </Typography>
          
          {errorMessage && (
            <Typography color="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Typography>
          )}
          
          <Box component="form" onSubmit={handleEmailRegister} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="displayName"
              label="Họ và tên"
              name="displayName"
              autoComplete="name"
              autoFocus
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              sx={{ mb: 2 }}
              disabled={loading}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
              disabled={loading}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Mật khẩu"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 2 }}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    disabled={loading}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Xác nhận mật khẩu"
              type={showPassword ? 'text' : 'password'}
              id="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              sx={{ mb: 3 }}
              disabled={loading}
              error={password !== confirmPassword && confirmPassword !== ''}
              helperText={
                password !== confirmPassword && confirmPassword !== ''
                  ? 'Mật khẩu không khớp'
                  : ''
              }
            />
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="role-select-label">Vai trò</InputLabel>
              <Select
                labelId="role-select-label"
                id="role-select"
                value={role}
                label="Vai trò"
                onChange={(e) => setRole(e.target.value)}
                disabled={loading}
              >
                <MenuItem value="admin">Quản trị viên</MenuItem>
                <MenuItem value="owner">Chủ sân</MenuItem>
                <MenuItem value="renter">Người thuê</MenuItem>
              </Select>
            </FormControl>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                mt: 3, 
                mb: 2, 
                padding: '12px',
                backgroundColor: '#1976d2',
                '&:hover': {
                  backgroundColor: '#1565c0',
                }
              }}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Đăng Ký'
              )}
            </Button>
            
            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                HOẶC
              </Typography>
            </Divider>
            
            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleRegister}
              disabled={loading}
              sx={{ 
                mb: 2, 
                padding: '12px',
                color: '#4285F4',
                borderColor: '#4285F4',
                '&:hover': {
                  borderColor: '#4285F4',
                  backgroundColor: 'rgba(66, 133, 244, 0.04)',
                }
              }}
            >
              Đăng ký với Google
            </Button>
            
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link href="/login" variant="body2" sx={{ color: '#1976d2' }}>
                  Đã có tài khoản? Đăng nhập
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register; 