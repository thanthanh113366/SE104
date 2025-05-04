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
  CircularProgress
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';

// Icons
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MoneyIcon from '@mui/icons-material/Money';

// Dữ liệu mẫu
const SAMPLE_COURTS = [
  {
    id: 'court1',
    name: 'Sân bóng đá Mini Thành Công',
    address: '123 Nguyễn Văn Linh, Quận 7, TP.HCM',
    description: 'Sân cỏ nhân tạo 5 người, có đèn chiếu sáng buổi tối',
    sport: 'football',
    sportName: 'Bóng đá',
    price: 300000,
    openTime: '06:00',
    closeTime: '22:00',
    images: [
      'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1536122985607-4fe00c07d587?w=800&auto=format&fit=crop',
    ],
    facilities: 'Đèn chiếu sáng, Nhà vệ sinh, Nước uống, Wifi',
    isAvailable: true,
    status: 'active',
    totalBookings: 48,
    totalRevenue: 14400000,
    rating: 4.7
  },
  {
    id: 'court2',
    name: 'Sân cầu lông Olympia',
    address: '45 Lê Văn Việt, Quận 9, TP.HCM',
    description: 'Sân cầu lông tiêu chuẩn, mặt sân tốt, ánh sáng đều',
    sport: 'badminton',
    sportName: 'Cầu lông',
    price: 120000,
    openTime: '07:00',
    closeTime: '21:00',
    images: [
      'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop',
    ],
    facilities: 'Đèn chiếu sáng, Phòng thay đồ, Gửi xe',
    isAvailable: true,
    status: 'active',
    totalBookings: 32,
    totalRevenue: 3840000,
    rating: 4.5
  }
];

const EditCourt = () => {
  const navigate = useNavigate();
  const { courtId } = useParams();
  const [loading, setLoading] = useState(true);
  const [courtData, setCourtData] = useState(null);
  
  // Fetch court data
  useEffect(() => {
    // Trong thực tế, bạn sẽ gọi API để lấy dữ liệu sân
    const fetchCourt = () => {
      // Giả lập API call
      setTimeout(() => {
        const court = SAMPLE_COURTS.find(c => c.id === courtId);
        if (court) {
          // Chuẩn bị dữ liệu
          setCourtData({
            ...court,
            facilities: court.facilities || ''
          });
        } else {
          // Xử lý khi không tìm thấy sân
          console.error('Court not found');
          navigate('/owner/courts');
        }
        setLoading(false);
      }, 500);
    };
    
    fetchCourt();
  }, [courtId, navigate]);
  
  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setCourtData({
      ...courtData,
      [name]: name === 'isAvailable' ? checked : value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // Xử lý cập nhật sân (trong thực tế sẽ gọi API)
    console.log('Updated court data:', courtData);
    
    // Chuyển về trang quản lý sân
    navigate('/owner/courts');
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
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
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                >
                  Lưu thay đổi
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