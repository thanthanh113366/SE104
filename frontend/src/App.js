import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import RoleSelection from './components/auth/RoleSelection';
import AdminDashboard from './components/admin/Dashboard';
import OwnerDashboard from './components/owner/Dashboard';
import CreateCourt from './components/owner/CreateCourt';
import EditCourt from './components/owner/EditCourt';
import CourtListing from './components/renter/CourtListing';

// Context
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Protected route component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { currentUser, userDetails, loading } = useAuth();
  
  if (loading) {
    return <Box sx={{ p: 3 }}>Loading...</Box>;
  }
  
  // If user is not logged in, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  // If requiredRole is specified and user doesn't have that role, redirect
  if (requiredRole && userDetails?.role !== requiredRole) {
    // Redirect based on user's actual role
    if (userDetails?.role === 'admin') {
      return <Navigate to="/admin/dashboard" />;
    } else if (userDetails?.role === 'owner') {
      return <Navigate to="/owner/dashboard" />;
    } else if (userDetails?.role === 'renter') {
      return <Navigate to="/courts" />;
    } else {
      // If no role yet, show role selection
      return <Navigate to="/select-role" />;
    }
  }
  
  return children;
};

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Box sx={{ 
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'background.default'
          }}>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Role selection (Protected, only for authenticated users without a role) */}
              <Route 
                path="/select-role" 
                element={
                  <ProtectedRoute>
                    <RoleSelection />
                  </ProtectedRoute>
                } 
              />
              
              {/* Admin routes */}
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Owner routes */}
              <Route 
                path="/owner/dashboard" 
                element={
                  <ProtectedRoute requiredRole="owner">
                    <OwnerDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/owner/courts/create" 
                element={
                  <ProtectedRoute requiredRole="owner">
                    <CreateCourt />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/owner/courts/edit/:courtId" 
                element={
                  <ProtectedRoute requiredRole="owner">
                    <EditCourt />
                  </ProtectedRoute>
                } 
              />
              
              {/* Renter routes */}
              <Route 
                path="/courts" 
                element={
                  <ProtectedRoute requiredRole="renter">
                    <CourtListing />
                  </ProtectedRoute>
                } 
              />
              
              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/login" />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          </Box>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 