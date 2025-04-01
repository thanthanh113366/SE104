import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Container,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  IconButton,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

const Dashboard = () => {
  const { userDetails, logout } = useAuth();
  const navigate = useNavigate();
  
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, courtId: null, courtName: '' });
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  // Fetch courts owned by the current user
  useEffect(() => {
    const fetchCourts = async () => {
      if (!userDetails?.uid) return;
      
      try {
        setLoading(true);
        const q = query(
          collection(db, 'courts'),
          where('ownerId', '==', userDetails.uid)
        );
        
        const querySnapshot = await getDocs(q);
        const courtsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setCourts(courtsData);
      } catch (error) {
        console.error('Error fetching courts:', error);
        setAlert({
          open: true,
          message: `Lỗi khi tải danh sách sân: ${error.message}`,
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourts();
  }, [userDetails]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error', error);
    }
  };
  
  const handleCreateCourt = () => {
    navigate('/owner/courts/create');
  };
  
  const handleEditCourt = (courtId) => {
    navigate(`/owner/courts/edit/${courtId}`);
  };
  
  const openDeleteDialog = (courtId, courtName) => {
    setDeleteDialog({
      open: true,
      courtId,
      courtName
    });
  };
  
  const closeDeleteDialog = () => {
    setDeleteDialog({
      open: false,
      courtId: null,
      courtName: ''
    });
  };
  
  const handleDeleteCourt = async () => {
    if (!deleteDialog.courtId) return;
    
    try {
      await deleteDoc(doc(db, 'courts', deleteDialog.courtId));
      
      // Update the local state
      setCourts(prev => prev.filter(court => court.id !== deleteDialog.courtId));
      
      setAlert({
        open: true,
        message: 'Xóa sân thành công!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting court:', error);
      setAlert({
        open: true,
        message: `Lỗi khi xóa sân: ${error.message}`,
        severity: 'error'
      });
    } finally {
      closeDeleteDialog();
    }
  };
  
  const handleAlertClose = () => {
    setAlert(prev => ({ ...prev, open: false }));
  };

  return (
    <Container component="main" maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ width: '100%', padding: '40px' }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, color: '#2196f3' }}>
            Chào mừng, {userDetails?.displayName || 'Chủ sân'}!
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, mb: 4 }}>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={handleCreateCourt}
              sx={{ py: 1.2 }}
            >
              Thêm sân mới
            </Button>
            
            <Button 
              variant="outlined" 
              color="inherit" 
              onClick={handleLogout}
            >
              Đăng xuất
            </Button>
          </Box>
        </Box>
        
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            Sân của bạn
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : courts.length === 0 ? (
            <Alert severity="info" sx={{ mb: 4 }}>
              Bạn chưa có sân nào. Hãy thêm sân mới để bắt đầu!
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {courts.map(court => (
                <Grid item xs={12} md={6} lg={4} key={court.id}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 12px 20px rgba(0,0,0,0.1)'
                      }
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="180"
                      image={court.imageUrls?.[0] || 'https://source.unsplash.com/random?sports+court'}
                      alt={court.name}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="div" gutterBottom sx={{ fontWeight: 600 }}>
                        {court.name}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <SportsSoccerIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {court.courtType}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationOnIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {court.address}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {court.openingTime} - {court.closingTime}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <AttachMoneyIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {court.pricePerHour?.toLocaleString()} VND/giờ
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                        {court.facilities?.slice(0, 3).map((facility, index) => (
                          <Chip 
                            key={index}
                            label={facility}
                            size="small"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        ))}
                        {court.facilities?.length > 3 && (
                          <Chip 
                            label={`+${court.facilities.length - 3}`}
                            size="small"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        )}
                      </Box>
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleEditCourt(court.id)}
                        aria-label="Chỉnh sửa"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => openDeleteDialog(court.id, court.name)}
                        aria-label="Xóa"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Paper>
      
      {/* Confirm Delete Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={closeDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Xác nhận xóa sân"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Bạn có chắc chắn muốn xóa sân "{deleteDialog.courtName}"? Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} color="inherit">Hủy</Button>
          <Button onClick={handleDeleteCourt} color="error" autoFocus>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Alert Snackbar */}
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

export default Dashboard; 