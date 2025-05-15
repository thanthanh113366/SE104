import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Box, CssBaseline, CircularProgress } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import RoleSelection from './components/auth/RoleSelection';
import TermsAndConditions from './components/auth/TermsAndConditions';
import AdminDashboard from './components/admin/AdminDashboard';
import OwnerDashboard from './components/owner/OwnerDashboard';
import RenterDashboard from './components/renter/RenterDashboard';
import UserProfile from './components/shared/UserProfile';

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
  const location = useLocation();
  
  console.log("=== ProtectedRoute Check ===");
  console.log("URL hiện tại:", location.pathname);
  console.log("Yêu cầu vai trò:", requiredRole);
  console.log("Người dùng hiện tại:", currentUser?.uid);
  console.log("Thông tin chi tiết:", userDetails);
  console.log("Đang tải:", loading);
  
  if (loading) {
    console.log("Đang tải thông tin người dùng...");
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!currentUser) {
    console.log("Chưa đăng nhập, chuyển hướng đến /login");
    return <Navigate to="/login" />;
  }
  
  // Kiểm tra vai trò
  if (requiredRole) {
    // Nếu chưa chọn vai trò
    if (!userDetails || !userDetails.role) {
      console.log("Chưa có vai trò, chuyển hướng đến /select-role");
      return <Navigate to="/select-role" />;
    }
    
    // Nếu không đúng vai trò
    if (userDetails.role !== requiredRole) {
      console.log("Vai trò không khớp, hiện tại:", userDetails.role, "yêu cầu:", requiredRole);
      // Chuyển hướng dựa trên vai trò hiện tại
      if (userDetails.role === 'admin') {
        console.log("Chuyển hướng đến /admin");
        return <Navigate to="/admin" />;
      }
      if (userDetails.role === 'owner') {
        console.log("Chuyển hướng đến /owner");
        return <Navigate to="/owner" />;
      }
      if (userDetails.role === 'renter') {
        console.log("Chuyển hướng đến /renter");
        return <Navigate to="/renter" />;
      }
    } else {
      console.log("Vai trò khớp, cho phép truy cập:", requiredRole);
    }
  }
  
  console.log("ProtectedRoute: Cho phép truy cập");
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
            <Route path="/terms" element={<TermsAndConditions />} />
            
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
            
            {/* Profile route */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            } />
            
            {/* Smart redirect route */}
            <Route path="/" element={<SmartRedirect />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

// Smart redirect component
const SmartRedirect = () => {
  const { currentUser, userDetails, loading } = useAuth();
  const navigate = useNavigate();
  
  console.log("SmartRedirect - Checking user state");
  console.log("currentUser:", currentUser);
  console.log("userDetails:", userDetails);
  console.log("loading:", loading);
  
  useEffect(() => {
    if (loading) return;
    
    if (!currentUser) {
      console.log("SmartRedirect - No user, redirecting to login");
      navigate('/login');
      return;
    }
    
    if (!userDetails || !userDetails.role) {
      console.log("SmartRedirect - User has no role, redirecting to select-role");
      navigate('/select-role');
      return;
    }
    
    // Redirect based on role
    console.log("SmartRedirect - User has role:", userDetails.role);
    if (userDetails.role === 'admin') {
      navigate('/admin');
    } else if (userDetails.role === 'owner') {
      navigate('/owner');
    } else if (userDetails.role === 'renter') {
      navigate('/renter');
    } else {
      console.log("SmartRedirect - Unknown role, redirecting to select-role");
      navigate('/select-role');
    }
  }, [currentUser, userDetails, loading, navigate]);
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return null;
};

export default App;
