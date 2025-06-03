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
import AssessmentIcon from '@mui/icons-material/Assessment';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

// Import các component con
import OwnerHome from './OwnerHome';
import MyCourts from './MyCourts';
import CourtBookings from './CourtBookings';
import AddCourt from './AddCourt';
import EditCourt from './EditCourt';

// Placeholder components
const Reports = () => <div>Báo cáo thống kê</div>;
const Support = () => <div>Hỗ trợ</div>;

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
      label: 'Quản lý sân',
      path: '/owner/courts',
      icon: <SportsSoccerIcon />
    },
    {
      label: 'Quản lý đặt sân',
      path: '/owner/bookings',
      icon: <EventNoteIcon />
    },
    {
      label: 'Báo cáo thống kê',
      path: '/owner/reports',
      icon: <AssessmentIcon />
    },
    {
      label: 'Hỗ trợ',
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
        <Route path="/reports" element={<Reports />} />
        <Route path="/support" element={<Support />} />
      </Routes>
    </MainLayout>
  );
};

export default OwnerDashboard; 