import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';

// Material UI Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AssessmentIcon from '@mui/icons-material/Assessment';

// Import các component con
import AdminHome from './AdminHome';
import ManageUsers from './ManageUsers';
import ManageCourts from './ManageCourts';
import Reports from './Reports';

// Placeholder component cho tính năng chưa triển khai
const ManageBookings = () => <div>Quản lý đặt sân</div>;

const AdminDashboard = () => {
  const { userDetails } = useAuth();
  
  const menuItems = [
    {
      label: 'Trang chủ',
      path: '/admin',
      icon: <DashboardIcon />
    },
    {
      label: 'Quản lý người dùng',
      path: '/admin/users',
      icon: <PeopleIcon />
    },
    {
      label: 'Quản lý sân',
      path: '/admin/courts',
      icon: <SportsSoccerIcon />
    },
    {
      label: 'Quản lý đặt sân',
      path: '/admin/bookings',
      icon: <EventNoteIcon />
    },
    {
      label: 'Báo cáo thống kê',
      path: '/admin/reports',
      icon: <AssessmentIcon />
    }
  ];
  
  return (
    <MainLayout title={`Chào mừng, ${userDetails?.displayName || 'Admin'}`} menuItems={menuItems}>
      <Routes>
        <Route path="/" element={<AdminHome />} />
        <Route path="/users" element={<ManageUsers />} />
        <Route path="/courts" element={<ManageCourts />} />
        <Route path="/bookings" element={<ManageBookings />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </MainLayout>
  );
};

export default AdminDashboard; 