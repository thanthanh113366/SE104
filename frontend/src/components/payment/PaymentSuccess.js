import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Home as HomeIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import { paymentService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { userDetails } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [error, setError] = useState('');

  const bookingId = searchParams.get('bookingId');
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    if (bookingId) {
      fetchPaymentInfo();
    } else {
      setError('Không tìm thấy thông tin đặt sân');
      setLoading(false);
    }
  }, [bookingId]);

  const fetchPaymentInfo = async () => {
    try {
      setLoading(true);
      
      // Lấy thông tin payment theo booking
      const response = await paymentService.getPaymentByBooking(bookingId);
      
      if (response.data && response.data.payment) {
        setPaymentInfo(response.data.payment);
      } else {
        setError('Không tìm thấy thông tin thanh toán');
      }
    } catch (error) {
      console.error('Error fetching payment info:', error);
      setError('Không thể lấy thông tin thanh toán');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const handleGoHome = () => {
    if (userDetails?.role === 'renter') {
      navigate('/renter');
    } else if (userDetails?.role === 'owner') {
      navigate('/owner');
    } else if (userDetails?.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  const handleViewBookings = () => {
    if (userDetails?.role === 'renter') {
      navigate('/renter/bookings');
    } else {
      navigate('/');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Đang tải thông tin thanh toán...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          {error}
        </Alert>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button variant="contained" onClick={handleGoHome}>
            Về trang chủ
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        {/* Header với icon thành công */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <CheckCircleIcon 
            sx={{ 
              fontSize: 80, 
              color: 'success.main',
              mb: 2
            }} 
          />
          <Typography variant="h4" gutterBottom color="success.main">
            Thanh toán thành công!
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Đặt sân của bạn đã được xác nhận
          </Typography>
        </Box>

        {/* Thông tin thanh toán */}
        {paymentInfo && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Chi tiết thanh toán
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color="text.secondary">Mã giao dịch:</Typography>
                <Typography fontFamily="monospace">
                  {paymentInfo.transactionId || orderId}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color="text.secondary">Phương thức:</Typography>
                <Typography>MoMo E-Wallet</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color="text.secondary">Thời gian:</Typography>
                <Typography>
                  {paymentInfo.paymentDate ? formatDate(paymentInfo.paymentDate) : 'Vừa xong'}
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">Số tiền:</Typography>
                <Typography variant="h6" color="primary">
                  {formatPrice(paymentInfo.amount)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Thông báo quan trọng */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography>
            <strong>Lưu ý quan trọng:</strong>
          </Typography>
          <Typography variant="body2">
            • Vui lòng có mặt đúng giờ đã đặt<br/>
            • Mang theo giấy tờ tùy thân để xác nhận<br/>
            • Liên hệ chủ sân nếu cần thay đổi lịch đặt<br/>
            • Kiểm tra email để nhận thông tin chi tiết
          </Typography>
        </Alert>

        {/* Action buttons */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <Button
            variant="outlined"
            startIcon={<ReceiptIcon />}
            onClick={handleViewBookings}
            size="large"
          >
            Xem lịch đặt sân
          </Button>
          
          <Button
            variant="contained"
            startIcon={<HomeIcon />}
            onClick={handleGoHome}
            size="large"
          >
            Về trang chủ
          </Button>
        </Box>

        {/* Footer note */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Cảm ơn bạn đã sử dụng dịch vụ đặt sân của chúng tôi!
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default PaymentSuccess; 