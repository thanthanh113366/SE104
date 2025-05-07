import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  Grid,
  MenuItem,
  FormControlLabel,
  Switch,
  Divider,
  InputAdornment,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';

// Icons
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MoneyIcon from '@mui/icons-material/Money';

const AddCourt = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [courtData, setCourtData] = useState({
    name: '',
    address: '',
    description: '',
    sport: 'football',
    price: '',
    openTime: '06:00',
    closeTime: '22:00',
    facilities: '',
    isAvailable: true,
  });
  
  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setCourtData({
      ...courtData,
      [name]: name === 'isAvailable' ? checked : value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError('Bạn cần đăng nhập để thêm sân');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Chuyển đổi facilities từ chuỗi thành mảng
      const facilitiesArray = courtData.facilities
        ? courtData.facilities.split(',').map(item => item.trim())
        : [];
      
      // Chuyển đổi price từ chuỗi thành số
      const priceNumber = parseInt(courtData.price, 10);
      
      // Dữ liệu sân để lưu vào Firestore
      const courtToSave = {
        name: courtData.name,
        address: courtData.address,
        description: courtData.description,
        sport: courtData.sport,
        price: priceNumber,
        openTime: courtData.openTime,
        closeTime: courtData.closeTime,
        facilities: facilitiesArray,
        status: courtData.isAvailable ? 'active' : 'inactive',
        ownerId: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        // Thêm trường image mẫu để hiển thị
        image: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?q=80&w=800&auto=format&fit=crop'
      };
      
      console.log('Lưu dữ liệu sân vào Firestore:', courtToSave);
      
      // Lưu vào collection "courts" trong Firestore
      const docRef = await addDoc(collection(db, 'courts'), courtToSave);
      
      console.log('Đã thêm sân thành công với ID:', docRef.id);
      setSuccess(true);
      
      // Đợi 1 giây rồi chuyển về trang quản lý sân
      setTimeout(() => {
        navigate('/owner/courts');
      }, 1000);
    } catch (error) {
      console.error('Lỗi khi thêm sân:', error);
      setError('Có lỗi xảy ra khi thêm sân. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Thêm sân thể thao mới
        </Typography>
      </Box>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <SportsSoccerIcon sx={{ mr: 1 }} /> Thông tin cơ bản
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tên sân"
                name="name"
                value={courtData.name}
                onChange={handleChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Loại sân"
                name="sport"
                value={courtData.sport}
                onChange={handleChange}
                required
              >
                <MenuItem value="football">Sân bóng đá</MenuItem>
                <MenuItem value="basketball">Sân bóng rổ</MenuItem>
                <MenuItem value="tennis">Sân tennis</MenuItem>
                <MenuItem value="badminton">Sân cầu lông</MenuItem>
                <MenuItem value="volleyball">Sân bóng chuyền</MenuItem>
              </TextField>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Địa chỉ"
                name="address"
                value={courtData.address}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOnIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mô tả"
                name="description"
                value={courtData.description}
                onChange={handleChange}
                multiline
                rows={3}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <AccessTimeIcon sx={{ mr: 1 }} /> Giờ hoạt động và giá
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Giá thuê (VNĐ/giờ)"
                name="price"
                type="number"
                value={courtData.price}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MoneyIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Giờ mở cửa"
                name="openTime"
                type="time"
                value={courtData.openTime}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  step: 300, // 5 min
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Giờ đóng cửa"
                name="closeTime"
                type="time"
                value={courtData.closeTime}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  step: 300, // 5 min
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tiện ích (phân cách bởi dấu phẩy)"
                name="facilities"
                value={courtData.facilities}
                onChange={handleChange}
                placeholder="Ví dụ: Đèn chiếu sáng, Nhà vệ sinh, Nước uống, Wifi"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={courtData.isAvailable}
                    onChange={handleChange}
                    name="isAvailable"
                    color="success"
                  />
                }
                label="Sân đang hoạt động"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={() => navigate('/owner/courts')}
                  disabled={loading}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={loading ? <CircularProgress size={24} /> : <SaveIcon />}
                  disabled={loading}
                >
                  {loading ? 'Đang lưu...' : 'Lưu và thêm sân'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
      
      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Đã thêm sân thành công!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddCourt; 