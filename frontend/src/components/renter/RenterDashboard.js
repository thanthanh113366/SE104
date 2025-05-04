import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';

// Material UI Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import SearchIcon from '@mui/icons-material/Search';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import EventNoteIcon from '@mui/icons-material/EventNote';
import StarIcon from '@mui/icons-material/Star';

// Import components
import SearchCourts from './SearchCourts';
import CourtDetail from './CourtDetail';
import MyBookings from './MyBookings';
import RenterHome from './RenterHome';

// Placeholder components (sẽ triển khai sau)
const FavoriteCourts = () => <div>Sân yêu thích</div>;
const RateBookings = () => <div>Đánh giá sân</div>;

const RenterDashboard = () => {
  const { userDetails } = useAuth();
  
  const menuItems = [
    {
      label: 'Trang chủ',
      path: '/renter',
      icon: <DashboardIcon />
    },
    {
      label: 'Tìm kiếm sân',
      path: '/renter/search',
      icon: <SearchIcon />
    },
    {
      label: 'Lịch đặt sân',
      path: '/renter/bookings',
      icon: <EventNoteIcon />
    },
    {
      label: 'Sân yêu thích',
      path: '/renter/favorites',
      icon: <BookmarkIcon />
    },
    {
      label: 'Đánh giá sân',
      path: '/renter/ratings',
      icon: <StarIcon />
    }
  ];
  
  return (
    <MainLayout title={`Chào mừng, ${userDetails?.displayName || 'Người thuê sân'}`} menuItems={menuItems}>
      <Routes>
        <Route path="/" element={<RenterHome />} />
        <Route path="/search" element={<SearchCourts />} />
        <Route path="/court/:courtId" element={<CourtDetail />} />
        <Route path="/bookings" element={<MyBookings />} />
        <Route path="/favorites" element={<FavoriteCourts />} />
        <Route path="/ratings" element={<RateBookings />} />
      </Routes>
    </MainLayout>
  );
};

export default RenterDashboard; 