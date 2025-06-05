import React, { useState } from 'react';
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
  FormControlLabel
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import GoogleIcon from '@mui/icons-material/Google';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase'; 

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  
  // Kiểm tra email hợp lệ
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  // Kiểm tra số điện thoại hợp lệ (10 số, bắt đầu bằng 0)
  const isValidPhone = (phone) => {
    const phoneRegex = /^0\d{9}$/;
    return phoneRegex.test(phone);
  };
  
  // Kiểm tra email đã tồn tại hay chưa
  const checkEmailExists = async (email) => {
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (error) {
      console.error("Lỗi khi kiểm tra email:", error);
      throw error;
    }
  };
  
  // Kiểm tra số điện thoại đã tồn tại hay chưa
  const checkPhoneExists = async (phone) => {
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("phoneNumber", "==", phone));
      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (error) {
      console.error("Lỗi khi kiểm tra số điện thoại:", error);
      throw error;
    }
  };
  
  const validateForm = async () => {
    // Reset các lỗi
    setEmailError('');
    setPhoneError('');
    setError('');
    
    // Kiểm tra form
    if (!email || !password || !confirmPassword || !displayName || !phoneNumber) {
      setError('Vui lòng điền đầy đủ thông tin');
      return false;
    }
    
    // Kiểm tra email hợp lệ
    if (!isValidEmail(email)) {
      setEmailError('Email không hợp lệ');
      return false;
    }
    
    // Kiểm tra số điện thoại hợp lệ
    if (!isValidPhone(phoneNumber)) {
      setPhoneError('Số điện thoại không hợp lệ (phải có 10 số và bắt đầu bằng số 0)');
      return false;
    }
    
    // Kiểm tra mật khẩu
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return false;
    }
    
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }
    
    // Kiểm tra điều khoản
    if (!acceptTerms) {
      setError('Bạn cần đồng ý với điều khoản và chính sách');
      return false;
    }
    
    try {
      // Kiểm tra email đã tồn tại
      const emailExists = await checkEmailExists(email);
      if (emailExists) {
        setEmailError('Email này đã được sử dụng');
        return false;
      }
      
      // Kiểm tra số điện thoại đã tồn tại
      const phoneExists = await checkPhoneExists(phoneNumber);
      if (phoneExists) {
        setPhoneError('Số điện thoại này đã được sử dụng');
        return false;
      }
    } catch (error) {
      setError('Lỗi khi kiểm tra thông tin: ' + error.message);
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!(await validateForm())) return;
    
    try {
      setError('');
      setLoading(true);
      const user = await register(email, password, displayName);

      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        email: email,
        displayName: displayName,
        phoneNumber: phoneNumber,
        createdAt: new Date()
      });

      navigate('/select-role'); // Điều hướng sẽ được xử lý bởi ProtectedRoute
    } catch (error) {
      setError('Đăng ký thất bại: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoogleRegister = async () => {
    if (!acceptTerms) {
      setError('Bạn cần đồng ý với điều khoản và chính sách');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
      navigate('/select-role'); // Điều hướng sẽ được xử lý bởi ProtectedRoute
    } catch (error) {
      setError('Đăng ký với Google thất bại: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
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
            Đăng ký tài khoản
          </Typography>
          
          {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
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
              error={!!emailError}
              helperText={emailError}
              sx={{ mb: 2 }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="phoneNumber"
              label="Số điện thoại"
              name="phoneNumber"
              autoComplete="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              error={!!phoneError}
              helperText={phoneError}
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
              autoComplete="new-password"
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
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2">
                  Tôi đồng ý với{' '}
                  <MuiLink component={Link} to="/terms" variant="body2" sx={{ fontWeight: 'bold' }}>
                    Điều khoản và Chính sách
                  </MuiLink>
                </Typography>
              }
              sx={{ mb: 2 }}
            />
            
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
              {loading ? 'Đang xử lý...' : 'Đăng ký'}
            </Button>
            
            <Divider sx={{ my: 2 }}>hoặc</Divider>
            
            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleRegister}
              disabled={loading}
              sx={{ 
                py: 1.5, 
                mb: 2,
                '&:hover': {
                  backgroundColor: '#f8f8f8',
                }
              }}
            >
              Đăng ký với Google
            </Button>
            
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2">
                Đã có tài khoản?{' '}
                <MuiLink component={Link} to="/login" variant="body2" sx={{ fontWeight: 'bold' }}>
                  Đăng nhập ngay
                </MuiLink>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register; 