import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Paper,
  Button,
  Rating,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tabs,
  Tab,
  Snackbar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RateReviewIcon from '@mui/icons-material/RateReview';
import { useAuth } from '../../contexts/AuthContext';
import ReviewServiceWrapper from '../../services/reviewServiceWrapper';
import BookingServiceWrapper from '../../services/bookingServiceWrapper';

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '1rem',
  '&.Mui-selected': {
    color: theme.palette.primary.main,
  },
}));

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const MyRatings = () => {
  const { currentUser, userDetails } = useAuth();
  const navigate = useNavigate();
  
  const [tabValue, setTabValue] = useState(0);
  const [myReviews, setMyReviews] = useState([]);
  const [completedBookings, setCompletedBookings] = useState([]);
  const [availableToReview, setAvailableToReview] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editDialog, setEditDialog] = useState({ open: false, review: null });
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Snackbar states
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch user's reviews trực tiếp từ Firebase
      try {
        // Import Firebase functions
        const { db } = await import('../../firebase');
        const { collection, query, where, orderBy, getDocs } = await import('firebase/firestore');
        
        // Query reviews collection where userId matches current user
        const reviewsQuery = query(
          collection(db, 'reviews'),
          where('userId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );
        
        const reviewsSnapshot = await getDocs(reviewsQuery);
        const reviews = reviewsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setMyReviews(reviews);
        console.log('Fetched reviews from Firebase:', reviews);
      } catch (reviewError) {
        console.error('Error fetching reviews:', reviewError);
      }

      // Fetch user's completed bookings
      try {
        const bookingsResponse = await BookingServiceWrapper.getUserBookings(currentUser.uid);
        if (bookingsResponse && bookingsResponse.bookings) {
          // Filter bookings that can be reviewed (confirmed or completed)
          const eligibleBookings = bookingsResponse.bookings.filter(booking => 
            booking.status === 'completed' || 
            booking.status === 'confirmed' || 
            booking.status === 'Đã xác nhận'
          );
          setCompletedBookings(eligibleBookings);
        }
      } catch (bookingError) {
        console.error('Error fetching bookings:', bookingError);
      }

      // Fetch bookings that can be reviewed
      try {
        const reviewableResponse = await BookingServiceWrapper.getReviewableBookings();
        if (reviewableResponse && reviewableResponse.bookings) {
          setAvailableToReview(reviewableResponse.bookings);
        }
      } catch (reviewableError) {
        console.error('Error fetching reviewable bookings:', reviewableError);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleEditReview = (review) => {
    setEditDialog({ open: true, review });
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  const handleEditSubmit = async () => {
    try {
      setSubmitting(true);
      
      await ReviewServiceWrapper.updateReview(editDialog.review.id, {
        rating: editRating,
        comment: editComment
      });

      // Refresh data
      await fetchData();
      
      setEditDialog({ open: false, review: null });
      
      // Show success message with Snackbar
      setSnackbar({
        open: true,
        message: 'Cập nhật đánh giá thành công!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating review:', error);
      setSnackbar({
        open: true,
        message: 'Có lỗi xảy ra khi cập nhật đánh giá',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
      try {
        await ReviewServiceWrapper.deleteReview(reviewId);
        await fetchData();
        
        setSnackbar({
          open: true,
          message: 'Xóa đánh giá thành công!',
          severity: 'success'
        });
      } catch (error) {
        console.error('Error deleting review:', error);
        setSnackbar({
          open: true,
          message: 'Có lỗi xảy ra khi xóa đánh giá',
          severity: 'error'
        });
      }
    }
  };

  const handleWriteReview = (booking) => {
    navigate(`/renter/court/${booking.courtId}`, { 
      state: { openReviewDialog: true, booking } 
    });
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price).replace('₫', 'VNĐ');
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Đánh giá của tôi
      </Typography>

      <Paper sx={{ borderRadius: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} sx={{ px: 2 }}>
            <StyledTab label={`Đánh giá đã viết (${myReviews.length})`} />
            <StyledTab label={`Chờ đánh giá (${availableToReview.length})`} />
          </Tabs>
        </Box>

        {/* Tab 1: My Reviews */}
        <TabPanel value={tabValue} index={0}>
          {myReviews.length > 0 ? (
            <Grid container spacing={3}>
              {myReviews.map((review) => (
                <Grid item xs={12} key={review.id}>
                  <Card sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={8}>
                          <Typography variant="h6" gutterBottom>
                            Sân đã đánh giá
                          </Typography>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Rating value={review.rating} readOnly size="small" />
                            <Typography variant="body2" sx={{ ml: 1 }}>
                              {review.rating}/5
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                              {formatDate(review.createdAt)}
                            </Typography>
                          </Box>

                          <Typography variant="body1" sx={{ mb: 2 }}>
                            {review.comment}
                          </Typography>

                          {/* Owner reply if exists */}
                          {review.ownerReply && (
                            <Box sx={{ 
                              p: 2, 
                              bgcolor: '#f5f5f5', 
                              borderRadius: 1, 
                              borderLeft: '3px solid #2196f3',
                              mb: 2 
                            }}>
                              <Typography variant="subtitle2" fontWeight="bold" color="primary">
                                Phản hồi từ chủ sân:
                              </Typography>
                              <Typography variant="body2">
                                {review.ownerReply}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(review.replyAt)}
                              </Typography>
                            </Box>
                          )}
                        </Grid>

                        <Grid item xs={12} md={4}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<EditIcon />}
                              onClick={() => handleEditReview(review)}
                            >
                              Chỉnh sửa
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              startIcon={<DeleteIcon />}
                              onClick={() => handleDeleteReview(review.id)}
                            >
                              Xóa
                            </Button>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Alert severity="info">
              Bạn chưa viết đánh giá nào. Hãy sử dụng sân và chia sẻ trải nghiệm của bạn!
            </Alert>
          )}
        </TabPanel>

        {/* Tab 2: Available to Review */}
        <TabPanel value={tabValue} index={1}>
          {availableToReview.length > 0 ? (
            <Grid container spacing={3}>
              {availableToReview.map((booking) => (
                <Grid item xs={12} key={booking.id}>
                  <Card sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={8}>
                          <Typography variant="h6" gutterBottom>
                            {booking.courtName}
                          </Typography>
                          
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            📅 Ngày: {formatDate(booking.date)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            ⏰ Giờ: {booking.startTime} - {booking.endTime}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            💰 Giá: {formatPrice(booking.totalPrice || booking.price)}
                          </Typography>
                          
                          <Chip 
                            label="Đã hoàn thành" 
                            color="success" 
                            size="small" 
                            sx={{ mt: 1 }}
                          />
                        </Grid>

                        <Grid item xs={12} md={4}>
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                              variant="contained"
                              startIcon={<RateReviewIcon />}
                              onClick={() => handleWriteReview(booking)}
                            >
                              Viết đánh giá
                            </Button>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Alert severity="info">
              Hiện tại bạn không có lượt đặt sân nào cần đánh giá.
            </Alert>
          )}
        </TabPanel>
      </Paper>

      {/* Edit Review Dialog */}
      <Dialog 
        open={editDialog.open} 
        onClose={() => setEditDialog({ open: false, review: null })}
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>Chỉnh sửa đánh giá</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom sx={{ mb: 3 }}>
              Cập nhật đánh giá của bạn:
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Typography variant="body1" sx={{ mr: 2 }}>
                Điểm đánh giá:
              </Typography>
              <Rating
                value={editRating}
                onChange={(event, newValue) => {
                  setEditRating(newValue);
                }}
                size="large"
              />
              <Typography variant="body2" sx={{ ml: 1 }}>
                ({editRating}/5)
              </Typography>
            </Box>
            
            <TextField
              fullWidth
              label="Nhận xét của bạn"
              multiline
              rows={4}
              value={editComment}
              onChange={(e) => setEditComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn về sân này..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, review: null })}>
            Hủy
          </Button>
          <Button 
            variant="contained" 
            onClick={handleEditSubmit} 
            disabled={submitting || !editComment.trim()}
          >
            {submitting ? 'Đang cập nhật...' : 'Cập nhật'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MyRatings; 