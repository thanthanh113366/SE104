import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import MainLayout from '../layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Alert
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import courtService from '../../services/courtService';

// Material UI Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import EventNoteIcon from '@mui/icons-material/EventNote';
import PaidIcon from '@mui/icons-material/Paid';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

// Import các component con
import OwnerHome from './OwnerHome';
import MyCourts from './MyCourts';
import CourtBookings from './CourtBookings';
import Revenue from './Revenue';
import Support from './Support';
import AddCourt from './AddCourt';
import EditCourt from './EditCourt';

const OwnerDashboard = () => {
  const { userDetails } = useAuth();
  const navigate = useNavigate();
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'football',
    address: {
      street: '',
      ward: '',
      district: '',
      city: ''
    },
    price: '',
    amenities: []
  });

  // Load danh sách sân
  useEffect(() => {
    loadCourts();
  }, []);

  const loadCourts = async () => {
    try {
      setLoading(true);
      const response = await courtService.getOwnerCourts();
      setCourts(response.courts);
      setError(null);
    } catch (error) {
      setError('Không thể tải danh sách sân');
      console.error('Lỗi:', error);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Mở dialog tạo/cập nhật sân
  const handleOpenDialog = (court = null) => {
    if (court) {
      setSelectedCourt(court);
      setFormData({
        name: court.name,
        description: court.description,
        type: court.type,
        address: court.address,
        price: court.price,
        amenities: court.amenities
      });
    } else {
      setSelectedCourt(null);
      setFormData({
        name: '',
        description: '',
        type: 'football',
        address: {
          street: '',
          ward: '',
          district: '',
          city: ''
        },
        price: '',
        amenities: []
      });
    }
    setOpenDialog(true);
  };

  // Đóng dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCourt(null);
    setFormData({
      name: '',
      description: '',
      type: 'football',
      address: {
        street: '',
        ward: '',
        district: '',
        city: ''
      },
      price: '',
      amenities: []
    });
  };

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedCourt) {
        await courtService.updateCourt(selectedCourt.id, formData);
      } else {
        await courtService.createCourt(formData);
      }
      handleCloseDialog();
      loadCourts();
    } catch (error) {
      setError('Không thể lưu sân');
      console.error('Lỗi:', error);
    }
  };

  // Xóa sân
  const handleDeleteCourt = async (courtId) => {
    if (window.confirm('Bạn có chắc muốn xóa sân này?')) {
      try {
        await courtService.deleteCourt(courtId);
        loadCourts();
      } catch (error) {
        setError('Không thể xóa sân');
        console.error('Lỗi:', error);
      }
    }
  };

  // Xem chi tiết sân
  const handleViewCourt = (courtId) => {
    navigate(`/courts/${courtId}`);
  };

  const menuItems = [
    {
      label: 'Trang chủ',
      path: '/owner',
      icon: <DashboardIcon />
    },
    {
      label: 'Quản lý sân thể thao',
      path: '/owner/courts',
      icon: <SportsSoccerIcon />
    },
    {
      label: 'Lịch đặt sân',
      path: '/owner/bookings',
      icon: <EventNoteIcon />
    },
    {
      label: 'Báo cáo doanh thu',
      path: '/owner/revenue',
      icon: <PaidIcon />
    },
    {
      label: 'Phản hồi & Hỗ trợ',
      path: '/owner/support',
      icon: <SupportAgentIcon />
    }
  ];
  
  return (
    <MainLayout title={`Chào mừng, ${userDetails?.displayName || 'Chủ sân'}`} menuItems={menuItems}>
      <Routes>
        <Route path="/" element={<OwnerHome />} />
        <Route path="/courts" element={<MyCourts />} />
        <Route path="/courts/add" element={<AddCourt />} />
        <Route path="/courts/edit/:courtId" element={<EditCourt />} />
        <Route path="/bookings" element={<CourtBookings />} />
        <Route path="/revenue" element={<Revenue />} />
        <Route path="/support" element={<Support />} />
      </Routes>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Quản lý sân
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Thêm sân mới
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {courts.map((court) => (
            <Grid item xs={12} sm={6} md={4} key={court.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {court.name}
                  </Typography>
                  <Typography color="textSecondary" gutterBottom>
                    {court.type}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    {court.address.street}, {court.address.ward}, {court.address.district}, {court.address.city}
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {court.price} VND/giờ
                  </Typography>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <Button
                      size="small"
                      onClick={() => handleViewCourt(court.id)}
                    >
                      Xem chi tiết
                    </Button>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(court)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteCourt(court.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Dialog tạo/cập nhật sân */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {selectedCourt ? 'Cập nhật sân' : 'Thêm sân mới'}
          </DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Tên sân"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Mô tả"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    multiline
                    rows={3}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    select
                    label="Loại sân"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                  >
                    <MenuItem value="football">Bóng đá</MenuItem>
                    <MenuItem value="badminton">Cầu lông</MenuItem>
                    <MenuItem value="tennis">Tennis</MenuItem>
                    <MenuItem value="basketball">Bóng rổ</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Đường"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phường/Xã"
                    name="address.ward"
                    value={formData.address.ward}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Quận/Huyện"
                    name="address.district"
                    value={formData.address.district}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Thành phố"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Giá (VND/giờ)"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Hủy</Button>
              <Button type="submit" variant="contained">
                {selectedCourt ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Container>
    </MainLayout>
  );
};

export default OwnerDashboard; 