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
  InputAdornment
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Icons
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MoneyIcon from '@mui/icons-material/Money';

const AddCourt = () => {
  const navigate = useNavigate();
  
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
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // Xử lý thêm sân (trong thực tế sẽ gọi API)
    console.log('Submitted court data:', courtData);
    
    // Chuyển về trang quản lý sân
    navigate('/owner/courts');
  };
  
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Thêm sân thể thao mới
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
                  Lưu và thêm sân
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default AddCourt; 