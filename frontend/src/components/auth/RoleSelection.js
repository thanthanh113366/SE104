import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  Container,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  Avatar,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  AdminPanelSettings as AdminIcon, 
  Business as OwnerIcon, 
  Person as RenterIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const cardStyle = {
  height: '100%',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
  }
};

const selectedCardStyle = {
  ...cardStyle,
  border: '2px solid #1976d2',
  position: 'relative'
};

const RoleSelection = () => {
  const { currentUser, userDetails, updateRole } = useAuth();
  const navigate = useNavigate();
  
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };
  
  const handleConfirm = async () => {
    if (!selectedRole) {
      setError('Vui lòng chọn một vai trò');
      return;
    }
    
    setLoading(true);
    try {
      // Cập nhật vai trò trong Firestore
      await updateRole(selectedRole);
      
      // Điều hướng dựa trên vai trò đã chọn
      if (selectedRole === 'admin') {
        navigate('/admin/dashboard');
      } else if (selectedRole === 'owner') {
        navigate('/owner/dashboard');
      } else {
        navigate('/courts');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      setError(error.message || 'Có lỗi xảy ra khi chọn vai trò. Vui lòng thử lại sau.');
      
      // Xử lý riêng cho lỗi 401
      if (error.response && error.response.status === 401) {
        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleCloseError = () => {
    setError('');
  };
  
  if (!currentUser) {
    // Nếu người dùng chưa đăng nhập, chuyển hướng về trang đăng nhập
    navigate('/login');
    return null;
  }
  
  const roles = [
    { 
      id: 'admin', 
      title: 'Quản trị viên', 
      description: 'Quản lý toàn bộ hệ thống, người dùng và các sân thể thao',
      icon: <AdminIcon sx={{ fontSize: 60, color: '#673ab7' }} />
    },
    { 
      id: 'owner', 
      title: 'Chủ sân', 
      description: 'Quản lý các sân thể thao của bạn và các lịch đặt sân',
      icon: <OwnerIcon sx={{ fontSize: 60, color: '#2196f3' }} />
    },
    { 
      id: 'renter', 
      title: 'Người thuê', 
      description: 'Tìm kiếm và đặt sân thể thao phù hợp',
      icon: <RenterIcon sx={{ fontSize: 60, color: '#4caf50' }} />
    }
  ];

  return (
    <Container component="main" maxWidth="md" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Paper elevation={3} sx={{ width: '100%', padding: '40px' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
          }}
        >
          <Typography component="h1" variant="h4" sx={{ fontWeight: 700, mb: 2, color: '#1976d2' }}>
            Chọn vai trò của bạn
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
            Hãy chọn vai trò phù hợp với nhu cầu của bạn trong hệ thống
          </Typography>
          
          {error && (
            <Typography color="error" sx={{ mb: 3 }}>
              {error}
            </Typography>
          )}
          
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {roles.map((role) => (
              <Grid item xs={12} md={4} key={role.id}>
                <Card 
                  sx={selectedRole === role.id ? selectedCardStyle : cardStyle}
                  onClick={() => handleRoleSelect(role.id)}
                >
                  <CardActionArea sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
                    <Avatar sx={{ 
                      width: 80, 
                      height: 80, 
                      mb: 2, 
                      bgcolor: 'white',
                      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)'
                    }}>
                      {role.icon}
                    </Avatar>
                    <CardContent sx={{ textAlign: 'center', flexGrow: 1 }}>
                      <Typography gutterBottom variant="h5" component="div" sx={{ fontWeight: 600 }}>
                        {role.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {role.description}
                      </Typography>
                    </CardContent>
                    {selectedRole === role.id && (
                      <CheckIcon 
                        sx={{ 
                          position: 'absolute', 
                          top: 16, 
                          right: 16, 
                          color: '#1976d2', 
                          fontSize: 28 
                        }} 
                      />
                    )}
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleConfirm}
              disabled={!selectedRole || loading}
              sx={{ py: 1.5, px: 5, borderRadius: 2 }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Xác nhận vai trò'
              )}
            </Button>
          </Box>
        </Box>
      </Paper>
      
      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseError}>
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default RoleSelection; 