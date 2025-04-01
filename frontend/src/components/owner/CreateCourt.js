import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Chip,
  InputAdornment,
  Snackbar,
  Alert,
  IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

const COURT_TYPES = [
  'Sân bóng đá', 
  'Sân bóng rổ', 
  'Sân tennis', 
  'Sân cầu lông', 
  'Sân bóng chuyền', 
  'Sân golf'
];

const FACILITIES = [
  'Phòng thay đồ', 
  'Nhà vệ sinh', 
  'Khu vực để xe', 
  'Quầy đồ uống', 
  'WiFi miễn phí', 
  'Dịch vụ cho thuê thiết bị', 
  'Chỗ ngồi khán giả',
  'Đèn chiếu sáng',
  'Máy lạnh'
];

const CreateCourt = () => {
  const { currentUser, userDetails } = useAuth();
  const navigate = useNavigate();
  
  const [courtData, setCourtData] = useState({
    name: '',
    address: '',
    courtType: '',
    size: '',
    facilities: [],
    pricePerHour: '',
    openingTime: '06:00',
    closingTime: '22:00',
    contactPhone: '',
    contactEmail: '',
    description: ''
  });
  
  const [images, setImages] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourtData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFacilityChange = (e) => {
    setCourtData(prev => ({ ...prev, facilities: e.target.value }));
  };
  
  const handleImageChange = (e) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      setImages(prev => [...prev, ...newImages]);
    }
  };
  
  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser || !userDetails) {
      setAlert({
        open: true,
        message: 'Bạn cần đăng nhập để thực hiện chức năng này',
        severity: 'error'
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Validate required fields
      if (!courtData.name || !courtData.address || !courtData.courtType || !courtData.pricePerHour) {
        setAlert({
          open: true,
          message: 'Vui lòng điền đầy đủ thông tin bắt buộc',
          severity: 'error'
        });
        setIsSubmitting(false);
        return;
      }
      
      // Prepare data for Firestore
      const courtToSave = {
        ...courtData,
        pricePerHour: Number(courtData.pricePerHour),
        ownerId: currentUser.uid,
        ownerName: userDetails.displayName || 'Chủ sân',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        imageUrls: []
      };
      
      // Save the court to Firestore first
      const docRef = await addDoc(collection(db, 'courts'), courtToSave);
      
      // Update the alert status
      setAlert({
        open: true,
        message: 'Tạo sân thành công!',
        severity: 'success'
      });
      
      // Navigate back to dashboard
      setTimeout(() => {
        navigate('/owner/dashboard');
      }, 2000);
      
    } catch (error) {
      console.error('Error creating court:', error);
      setAlert({
        open: true,
        message: `Lỗi: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleAlertClose = () => {
    setAlert(prev => ({ ...prev, open: false }));
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <IconButton 
            onClick={() => navigate('/owner/dashboard')}
            sx={{ mr: 2 }}
            aria-label="Quay lại"
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: '#2196f3' }}>
            Tạo Sân Thể Thao Mới
          </Typography>
        </Box>
        
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Thông tin cơ bản */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Thông tin cơ bản
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Tên sân"
                name="name"
                value={courtData.name}
                onChange={handleChange}
                helperText="Nhập tên sân thể thao"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Loại sân</InputLabel>
                <Select
                  name="courtType"
                  value={courtData.courtType}
                  onChange={handleChange}
                  label="Loại sân"
                >
                  {COURT_TYPES.map(type => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Địa chỉ"
                name="address"
                value={courtData.address}
                onChange={handleChange}
                helperText="Nhập địa chỉ đầy đủ của sân"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Kích thước"
                name="size"
                value={courtData.size}
                onChange={handleChange}
                helperText="Ví dụ: 20m x 40m"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Giá thuê mỗi giờ"
                name="pricePerHour"
                type="number"
                value={courtData.pricePerHour}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">VND</InputAdornment>,
                }}
                helperText="Nhập giá thuê sân mỗi giờ (VND)"
              />
            </Grid>
            
            {/* Thời gian hoạt động */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, mt: 2 }}>
                Thời gian hoạt động
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Giờ mở cửa"
                name="openingTime"
                type="time"
                value={courtData.openingTime}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Giờ đóng cửa"
                name="closingTime"
                type="time"
                value={courtData.closingTime}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            {/* Tiện ích */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, mt: 2 }}>
                Tiện ích
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Tiện ích</InputLabel>
                <Select
                  multiple
                  name="facilities"
                  value={courtData.facilities}
                  onChange={handleFacilityChange}
                  label="Tiện ích"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  {FACILITIES.map(facility => (
                    <MenuItem key={facility} value={facility}>
                      {facility}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* Thông tin liên hệ */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, mt: 2 }}>
                Thông tin liên hệ
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Số điện thoại liên hệ"
                name="contactPhone"
                value={courtData.contactPhone}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email liên hệ"
                name="contactEmail"
                type="email"
                value={courtData.contactEmail}
                onChange={handleChange}
              />
            </Grid>
            
            {/* Mô tả */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, mt: 2 }}>
                Mô tả
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mô tả chi tiết"
                name="description"
                multiline
                rows={4}
                value={courtData.description}
                onChange={handleChange}
                helperText="Mô tả chi tiết về sân thể thao, các quy định đặc biệt, v.v."
              />
            </Grid>
            
            {/* Hình ảnh */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, mt: 2 }}>
                Hình ảnh
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<AddPhotoAlternateIcon />}
                sx={{ mb: 2 }}
              >
                Thêm hình ảnh
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={handleImageChange}
                />
              </Button>
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {images.map((image, index) => (
                  <Grid item xs={6} sm={4} md={3} key={index}>
                    <Box
                      sx={{
                        position: 'relative',
                        height: 150,
                        borderRadius: 1,
                        overflow: 'hidden'
                      }}
                    >
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                      <IconButton
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          bgcolor: 'rgba(0,0,0,0.5)',
                          color: 'white',
                          '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                        }}
                        onClick={() => removeImage(index)}
                      >
                        X
                      </IconButton>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>
            
            {/* Submit button */}
            <Grid item xs={12} sx={{ mt: 4 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={isSubmitting}
                sx={{ py: 1.5, px: 4 }}
              >
                {isSubmitting ? 'Đang tạo...' : 'Tạo sân'}
              </Button>
              
              <Button
                variant="outlined"
                color="inherit"
                size="large"
                onClick={() => navigate('/owner/dashboard')}
                sx={{ py: 1.5, px: 4, ml: 2 }}
              >
                Hủy
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleAlertClose} severity={alert.severity} sx={{ width: '100%' }}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CreateCourt; 