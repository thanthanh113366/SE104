import React, { useState, useEffect } from 'react';
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
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';

// Icons
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import PersonIcon from '@mui/icons-material/Person';

const RoleSelection = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [roleSelected, setRoleSelected] = useState(false);
  
  const { updateUserRole, userDetails, currentUser } = useAuth();
  const navigate = useNavigate();
  
  const handleRoleSelect = async (role) => {
    try {
      setError('');
      setLoading(true);
      setRoleSelected(true);
      
      console.log("Chọn vai trò:", role);
      console.log("Thông tin người dùng hiện tại:", userDetails);
      
      if (!currentUser) {
        throw new Error("Không thể xác thực người dùng. Vui lòng đăng nhập lại.");
      }
      
      // Cập nhật vai trò
      await updateUserRole(role);
      console.log("Đã cập nhật vai trò, chuyển hướng đến:", role === 'owner' ? '/owner' : '/renter');
      
      // Đợi một chút để đảm bảo Firestore đã cập nhật
      setTimeout(async () => {
        try {
          // Tải lại dữ liệu người dùng từ Firestore trước khi chuyển hướng
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists() && userSnap.data().role === role) {
            // Chuyển hướng dựa trên vai trò
            if (role === 'owner') {
              navigate('/owner');
            } else if (role === 'renter') {
              navigate('/renter');
            }
          } else {
            // Nếu dữ liệu không được cập nhật đúng
            console.error("Lỗi: Dữ liệu vai trò không được cập nhật đúng");
            setError("Lỗi cập nhật vai trò. Vui lòng thử lại.");
            setRoleSelected(false);
          }
        } catch (delayedError) {
          console.error("Lỗi khi tải lại dữ liệu người dùng:", delayedError);
          setError("Không thể tải dữ liệu người dùng. Vui lòng thử lại.");
          setRoleSelected(false);
        }
      }, 1000);
    } catch (error) {
      console.error("Lỗi khi cập nhật vai trò:", error);
      setError('Không thể cập nhật vai trò: ' + error.message);
      setRoleSelected(false);
    } finally {
      setLoading(false);
    }
  };
  
  // Hàm làm mới trang
  const handleRetry = () => {
    window.location.reload();
  };
  
  // Kiểm tra nếu người dùng đã có vai trò, chuyển hướng trực tiếp
  useEffect(() => {
    let isMounted = true;
    
    const checkUserRole = async () => {
      console.log("userDetails trong RoleSelection:", userDetails);
      
      if (userDetails && userDetails.role && isMounted) {
        console.log("Phát hiện vai trò:", userDetails.role);
        
        // Thêm timeout để tránh chuyển hướng quá nhanh
        setTimeout(() => {
          if (!isMounted) return;
          
          if (userDetails.role === 'owner') {
            console.log("Chuyển hướng đến trang chủ sân");
            navigate('/owner');
          } else if (userDetails.role === 'renter') {
            console.log("Chuyển hướng đến trang người thuê");
            navigate('/renter');
          } else if (userDetails.role === 'admin') {
            console.log("Chuyển hướng đến trang admin");
            navigate('/admin');
          }
        }, 300);
      } else {
        console.log("Người dùng chưa có vai trò hoặc chưa có thông tin chi tiết");
      }
    };
    
    checkUserRole();
    
    return () => {
      isMounted = false;
    };
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
          
          {error && (
            <Box sx={{ width: '100%', mb: 3 }}>
              <Alert 
                severity="error" 
                sx={{ mb: 2 }}
                action={
                  <Button color="inherit" size="small" onClick={handleRetry}>
                    Thử lại
                  </Button>
                }
              >
                {error}
              </Alert>
            </Box>
          )}
          
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