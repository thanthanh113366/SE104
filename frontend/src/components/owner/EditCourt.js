import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  Alert
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';

// Icons
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MoneyIcon from '@mui/icons-material/Money';

// Map tên loại sân
const SPORT_NAMES = {
  'football': 'Bóng đá',
  'basketball': 'Bóng rổ',
  'tennis': 'Tennis',
  'badminton': 'Cầu lông',
  'volleyball': 'Bóng chuyền'
};

const EditCourt = () => {
  const navigate = useNavigate();
  const { courtId } = useParams();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [courtData, setCourtData] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  
  // Fetch court data from Firestore
  useEffect(() => {
    const fetchCourt = async () => {
      try {
        setLoading(true);
        console.log('Đang lấy thông tin sân với ID:', courtId);
        
        if (!courtId) {
          setError('Không tìm thấy ID sân');
          setLoading(false);
          return;
        }
        
        const courtRef = doc(db, 'courts', courtId);
        const courtDoc = await getDoc(courtRef);
        
        if (courtDoc.exists()) {
          const data = courtDoc.data();
          
          // Kiểm tra quyền sở hữu
          if (data.ownerId !== currentUser?.uid) {
            setError('Bạn không có quyền chỉnh sửa sân này');
            setLoading(false);
            setTimeout(() => navigate('/owner/courts'), 2000);
            return;
          }
          
          console.log('Đã tìm thấy dữ liệu sân:', data);
          
          // Chuyển đổi facilities từ mảng sang chuỗi nếu cần
          let facilitiesString = '';
          if (Array.isArray(data.facilities)) {
            facilitiesString = data.facilities.join(', ');
          } else if (typeof data.facilities === 'string') {
            facilitiesString = data.facilities;
          }
          
          setCourtData({
            id: courtId,
            name: data.name || '',
            address: data.address || '',
            description: data.description || '',
            sport: data.sport || 'football',
            sportName: SPORT_NAMES[data.sport] || 'Bóng đá',
            price: data.price || 0,
            openTime: data.openTime || '06:00',
            closeTime: data.closeTime || '22:00',
            facilities: facilitiesString,
            isAvailable: data.status === 'active',
            status: data.status || 'active',
            image: data.image || ''
          });
          
        } else {
          console.error('Không tìm thấy sân với ID:', courtId);
          setError('Không tìm thấy thông tin sân');
          setTimeout(() => navigate('/owner/courts'), 2000);
        }
      } catch (err) {
        console.error('Lỗi khi lấy thông tin sân:', err);
        setError('Đã xảy ra lỗi khi tải thông tin sân: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (currentUser) {
      fetchCourt();
    } else {
      setError('Bạn cần đăng nhập để chỉnh sửa sân');
      setLoading(false);
    }
  }, [courtId, navigate, currentUser]);
  
  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setCourtData({
      ...courtData,
      [name]: name === 'isAvailable' ? checked : value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!courtData || !courtId) {
      setError('Không có dữ liệu sân để cập nhật');
      return;
    }
    
    try {
      setSaving(true);
      
      // Chuyển đổi facilities từ chuỗi thành mảng
      const facilitiesArray = courtData.facilities
        ? courtData.facilities.split(',').map(item => item.trim())
        : [];
      
      // Dữ liệu sân cập nhật
      const updatedCourtData = {
        name: courtData.name,
        address: courtData.address,
        description: courtData.description,
        sport: courtData.sport,
        price: Number(courtData.price),
        openTime: courtData.openTime,
        closeTime: courtData.closeTime,
        facilities: facilitiesArray,
        status: courtData.isAvailable ? 'active' : 'inactive',
        updatedAt: new Date()
      };
      
      // Cập nhật trong Firestore
      const courtRef = doc(db, 'courts', courtId);
      await updateDoc(courtRef, updatedCourtData);
      
      console.log('Đã cập nhật sân thành công:', courtId);
      
      // Chuyển về trang quản lý sân
      navigate('/owner/courts');
    } catch (err) {
      console.error('Lỗi khi cập nhật sân:', err);
      setError('Đã xảy ra lỗi khi cập nhật sân: ' + err.message);
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/owner/courts')}>
          Quay lại danh sách sân
        </Button>
      </Box>
    );
  }
  
  if (!courtData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          Không tìm thấy thông tin sân
        </Alert>
        <Button variant="contained" onClick={() => navigate('/owner/courts')} sx={{ mt: 2 }}>
          Quay lại danh sách sân
        </Button>
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Chỉnh sửa sân
        </Typography>
      </Box>
      
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
              <Divider sx={{ my: 2 }} />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Tiện ích
              </Typography>
              <TextField
                fullWidth
                label="Tiện ích (phân cách bằng dấu phẩy)"
                name="facilities"
                value={courtData.facilities}
                onChange={handleChange}
                placeholder="Ví dụ: Đèn chiếu sáng, Nhà vệ sinh, Wifi, Chỗ để xe, Phòng thay đồ..."
                helperText="Nhập các tiện ích của sân, cách nhau bởi dấu phẩy"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={courtData.isAvailable}
                    onChange={handleChange}
                    name="isAvailable"
                  />
                }
                label={courtData.isAvailable ? "Đang hoạt động" : "Tạm ngưng"}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={() => navigate('/owner/courts')}
                  disabled={saving}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                  disabled={saving}
                >
                  {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default EditCourt; 