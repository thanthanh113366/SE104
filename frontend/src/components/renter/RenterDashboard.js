import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';

// Material UI Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import EventNoteIcon from '@mui/icons-material/EventNote';
import StarIcon from '@mui/icons-material/Star';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

// Import các component con
import RenterHome from './RenterHome';
import MyBookings from './MyBookings';
import SearchCourts from './SearchCourts';
import CourtDetail from './CourtDetail';
import MyRatings from './MyRatings';
import Support from '../shared/Support';

// Placeholder components removed - Support imported

const RenterDashboard = () => {
  const { userDetails } = useAuth();
  
  const menuItems = [
    {
      label: 'Trang chủ',
      path: '/renter',
      icon: <DashboardIcon />
    },
    {
      label: 'Tìm sân',
      path: '/renter/find-courts',
      icon: <SportsSoccerIcon />
    },
    {
      label: 'Lịch đặt của tôi',
      path: '/renter/bookings',
      icon: <EventNoteIcon />
    },
    {
      label: 'Đánh giá sân',
      path: '/renter/ratings',
      icon: <StarIcon />
    },
    {
      label: 'Hỗ trợ',
      path: '/renter/support',
      icon: <SupportAgentIcon />
    }
  ];
  
  return (
    <MainLayout title={`Chào mừng, ${userDetails?.displayName || 'Người thuê sân'}`} menuItems={menuItems}>
      <Routes>
        <Route path="/" element={<RenterHome />} />
        <Route path="/find-courts" element={<SearchCourts />} />
        <Route path="/bookings" element={<MyBookings />} />
        <Route path="/ratings" element={<MyRatings />} />
        <Route path="/support" element={<Support />} />
        <Route path="/court/:courtId" element={<CourtDetail />} />
      </Routes>
    </MainLayout>
  );
};

export default RenterDashboard; 