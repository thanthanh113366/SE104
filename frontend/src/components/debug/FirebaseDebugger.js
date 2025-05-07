import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  CircularProgress, 
  List, 
  ListItem, 
  Divider,
  Alert,
  Card,
  CardContent,
  Grid,
  Chip
} from '@mui/material';
import firebaseDebug, { getAllCourts, addSampleCourt } from '../../firebase.debug';
import { useAuth } from '../../contexts/AuthContext';

const FirebaseDebugger = () => {
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultMessage, setResultMessage] = useState('');
  const { currentUser } = useAuth();
  
  // Load courts on component mount
  useEffect(() => {
    loadCourts();
  }, []);
  
  // Load courts from Firestore
  const loadCourts = async () => {
    try {
      setLoading(true);
      setError('');
      
      const courtsData = await getAllCourts();
      setCourts(courtsData);
      
      setResultMessage(`Đã tải ${courtsData.length} sân từ Firestore`);
    } catch (err) {
      console.error('Error loading courts:', err);
      setError('Không thể tải dữ liệu sân. Chi tiết lỗi trong console.');
    } finally {
      setLoading(false);
    }
  };
  
  // Add sample court to Firestore
  const handleAddSampleCourt = async () => {
    try {
      setLoading(true);
      setError('');
      setResultMessage('');
      
      const result = await addSampleCourt();
      
      if (result.success) {
        setResultMessage(`Đã thêm sân mẫu thành công với ID: ${result.id}`);
        // Reload courts
        loadCourts();
      } else {
        setError('Không thể thêm sân mẫu. Chi tiết lỗi trong console.');
      }
    } catch (err) {
      console.error('Error adding sample court:', err);
      setError('Lỗi khi thêm sân mẫu. Chi tiết lỗi trong console.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Firebase Debugger
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Trạng thái kết nối
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography>
            <strong>Người dùng hiện tại:</strong> {currentUser ? `${currentUser.email} (${currentUser.uid})` : 'Chưa đăng nhập'}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="contained" 
            onClick={loadCourts} 
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} sx={{ mr: 1 }} /> : null}
            Tải danh sách sân
          </Button>
          
          <Button 
            variant="contained" 
            color="success" 
            onClick={handleAddSampleCourt} 
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} sx={{ mr: 1 }} /> : null}
            Thêm sân mẫu
          </Button>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        
        {resultMessage && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {resultMessage}
          </Alert>
        )}
      </Paper>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Danh sách sân ({courts.length})
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : courts.length === 0 ? (
          <Typography>Không có sân nào trong database</Typography>
        ) : (
          <Grid container spacing={2}>
            {courts.map(court => (
              <Grid item xs={12} md={6} lg={4} key={court.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{court.name}</Typography>
                    <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                      ID: {court.id}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Sport:</strong> {court.sport}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Price:</strong> {court.price?.toLocaleString()} VND/hour
                    </Typography>
                    <Typography variant="body2">
                      <strong>Address:</strong> {court.address}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Owner:</strong> {court.ownerId}
                    </Typography>
                    
                    <Box sx={{ mt: 1 }}>
                      {court.facilities?.map((facility, index) => (
                        <Chip 
                          key={index} 
                          label={facility} 
                          size="small" 
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Box>
  );
};

export default FirebaseDebugger; 