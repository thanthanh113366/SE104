import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CssBaseline, CircularProgress } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import RoleSelection from './components/auth/RoleSelection';
import AdminDashboard from './components/admin/AdminDashboard';
import OwnerDashboard from './components/owner/OwnerDashboard';
import RenterDashboard from './components/renter/RenterDashboard';

// AuthContext
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Tạo theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32', // Green color for sports theme
    },
    secondary: {
      main: '#ff9800',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      'Arial',
      'sans-serif',
    ].join(','),
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

// ProtectedRoute component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { currentUser, userDetails, loading } = useAuth();
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  // Kiểm tra vai trò
  if (requiredRole) {
    // Nếu chưa chọn vai trò
    if (!userDetails || !userDetails.role) {
      return <Navigate to="/select-role" />;
    }
    
    // Nếu không đúng vai trò
    if (userDetails.role !== requiredRole) {
      // Chuyển hướng dựa trên vai trò hiện tại
      if (userDetails.role === 'admin') return <Navigate to="/admin" />;
      if (userDetails.role === 'owner') return <Navigate to="/owner" />;
      if (userDetails.role === 'renter') return <Navigate to="/renter" />;
    }
  }
  
  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Auth required routes */}
            <Route path="/select-role" element={
              <ProtectedRoute>
                <RoleSelection />
              </ProtectedRoute>
            } />
            
            {/* Role-specific routes */}
            <Route path="/admin/*" element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/owner/*" element={
              <ProtectedRoute requiredRole="owner">
                <OwnerDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/renter/*" element={
              <ProtectedRoute requiredRole="renter">
                <RenterDashboard />
              </ProtectedRoute>
            } />
            
            {/* Default redirects */}
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 