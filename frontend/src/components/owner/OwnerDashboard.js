import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';

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
    </MainLayout>
  );
};

export default OwnerDashboard; 