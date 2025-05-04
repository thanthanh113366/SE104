import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Icons
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import PersonIcon from '@mui/icons-material/Person';

const RoleSelection = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { updateUserRole, userDetails } = useAuth();
  const navigate = useNavigate();
  
  const handleRoleSelect = async (role) => {
    try {
      setError('');
      setLoading(true);
      
      await updateUserRole(role);
      
      // Chuyển hướng dựa trên vai trò
      if (role === 'owner') {
        navigate('/owner');
      } else if (role === 'renter') {
        navigate('/renter');
      }
    } catch (error) {
      setError('Không thể cập nhật vai trò: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Kiểm tra nếu người dùng đã có vai trò, chuyển hướng trực tiếp
  React.useEffect(() => {
    if (userDetails && userDetails.role) {
      if (userDetails.role === 'owner') {
        navigate('/owner');
      } else if (userDetails.role === 'renter') {
        navigate('/renter');
      } else if (userDetails.role === 'admin') {
        navigate('/admin');
      }
    }
  }, [userDetails, navigate]);
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Container component="main" maxWidth="md">
      <Paper elevation={3} sx={{ mt: 8, p: 4, borderRadius: 2 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h5" sx={{ mb: 4, fontWeight: 'bold', color: 'primary.main' }}>
            Bạn là ai?
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 4, textAlign: 'center' }}>
            Vui lòng chọn vai trò phù hợp với bạn. Bạn có thể thay đổi vai trò này sau.
          </Typography>
          
          {error && <Alert severity="error" sx={{ width: '100%', mb: 3 }}>{error}</Alert>}
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', py: 4 }}>
                  <SportsSoccerIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                  <Typography gutterBottom variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                    Chủ sân
                  </Typography>
                  <Typography>
                    Đăng ký và quản lý sân thể thao của bạn, nhận đặt sân và quản lý lịch sử đặt sân.
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                  <Button 
                    size="large" 
                    variant="contained"
                    onClick={() => handleRoleSelect('owner')}
                    disabled={loading}
                    sx={{ px: 4 }}
                  >
                    Tôi là chủ sân
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', py: 4 }}>
                  <PersonIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                  <Typography gutterBottom variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                    Người thuê sân
                  </Typography>
                  <Typography>
                    Tìm kiếm và đặt sân thể thao dễ dàng, quản lý lịch đặt sân và theo dõi lịch sử đặt.
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                  <Button 
                    size="large" 
                    variant="contained"
                    onClick={() => handleRoleSelect('renter')}
                    disabled={loading}
                    sx={{ px: 4 }}
                  >
                    Tôi muốn thuê sân
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default RoleSelection; 