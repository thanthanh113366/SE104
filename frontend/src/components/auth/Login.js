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
  Link as MuiLink
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
  
  const { login, loginWithGoogle, currentUser, userDetails } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      return setError('Vui lòng nhập email và mật khẩu');
    }
    
    try {
      setError('');
      setLoading(true);
      await login(email, password);
    } catch (error) {
      setError('Đăng nhập thất bại: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoogleLogin = async () => {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
    } catch (error) {
      setError('Đăng nhập với Google thất bại: ' + error.message);
    } finally {
      setLoading(false);
    }
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
              sx={{ mb: 3 }}
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
    </Container>
  );
};

export default Login; 