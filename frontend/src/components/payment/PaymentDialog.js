import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import { 
  Payment as PaymentIcon,
  QrCode as QrCodeIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { paymentService } from '../../services/api';

const PaymentDialog = ({ 
  open, 
  onClose, 
  booking, 
  onPaymentSuccess,
  onPaymentError 
}) => {
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, pending, success, error
  const [error, setError] = useState('');
  const [statusCheckInterval, setStatusCheckInterval] = useState(null);

  // Tạo thanh toán MoMo
  const handleCreatePayment = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Tạo temporary booking ID vì chưa có booking thật
      const tempBookingId = `TEMP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('Using temporary booking ID:', tempBookingId);
      console.log('Booking data for payment:', booking);
      
      const response = await paymentService.createMoMoPayment(tempBookingId, booking);
      
      if (response.data) {
        setPaymentData(response.data);
        setPaymentStatus('pending');
        
        // Bắt đầu kiểm tra trạng thái thanh toán
        startStatusCheck();
        
        // Mở MoMo app hoặc web payment
        if (response.data.momoUrl) {
          const momoWindow = window.open(response.data.momoUrl, '_blank');
          
          // Check trạng thái ngay khi mở window thành công
          setTimeout(() => {
            checkPaymentStatus();
          }, 2000);
          
          // Listen cho khi window đóng
          if (momoWindow) {
            const checkClosed = setInterval(() => {
              if (momoWindow.closed) {
                clearInterval(checkClosed);
                console.log('MoMo window closed, checking payment status...');
                checkPaymentStatus();
              }
            }, 1000);
          }
        }
      }
    } catch (error) {
      console.error('Error creating MoMo payment:', error);
      setError(error.response?.data?.message || 'Không thể tạo thanh toán MoMo');
      setPaymentStatus('error');
      onPaymentError && onPaymentError(error);
    } finally {
      setLoading(false);
    }
  };

  // Kiểm tra trạng thái thanh toán
  const checkPaymentStatus = async () => {
    try {
      const orderId = paymentData?.payment?.transactionId || paymentData?.orderId;
      if (!orderId) return false;
      
      console.log('Checking payment status for orderId:', orderId);
      const response = await paymentService.checkPaymentStatus(orderId);
      const payment = response.data.payment;
      
      if (payment.status === 'completed') {
        setPaymentStatus('success');
        console.log('Payment completed:', payment);
        onPaymentSuccess && onPaymentSuccess(payment);
        return true;
      } else if (payment.status === 'failed') {
        setPaymentStatus('error');
        setError('Thanh toán thất bại');
        onPaymentError && onPaymentError(new Error('Payment failed'));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error checking payment status:', error);
      return false;
    }
  };

  // Kiểm tra trạng thái thanh toán định kỳ
  const startStatusCheck = () => {
    const interval = setInterval(async () => {
      const isCompleted = await checkPaymentStatus();
      if (isCompleted) {
        clearInterval(interval);
        setStatusCheckInterval(null);
      }
    }, 3000); // Kiểm tra mỗi 3 giây
    
    setStatusCheckInterval(interval);

    // Dừng kiểm tra sau 10 phút
    setTimeout(() => {
      clearInterval(interval);
      setStatusCheckInterval(null);
      if (paymentStatus === 'pending') {
        setPaymentStatus('error');
        setError('Hết thời gian chờ thanh toán');
      }
    }, 10 * 60 * 1000);
  };

  // Listen cho window focus để check payment ngay khi user quay lại tab
  useEffect(() => {
    const handleWindowFocus = async () => {
      if (paymentStatus === 'pending' && paymentData) {
        console.log('Window focused, checking payment status...');
        await checkPaymentStatus();
      }
    };

    window.addEventListener('focus', handleWindowFocus);
    return () => window.removeEventListener('focus', handleWindowFocus);
  }, [paymentStatus, paymentData]);

  // Listen cho localStorage changes để detect thanh toán thành công từ tab khác
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'paymentSuccess' && e.newValue) {
        console.log('Payment success detected from another tab');
        const paymentData = JSON.parse(e.newValue);
        
        setPaymentStatus('success');
        onPaymentSuccess && onPaymentSuccess(paymentData);
        
        // Clear localStorage
        localStorage.removeItem('paymentSuccess');
      } else if (e.key === 'paymentError' && e.newValue) {
        console.log('Payment error detected from another tab');
        const errorData = JSON.parse(e.newValue);
        
        setPaymentStatus('error');
        setError(errorData.message || 'Thanh toán thất bại');
        onPaymentError && onPaymentError(new Error(errorData.message));
        
        // Clear localStorage
        localStorage.removeItem('paymentError');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [onPaymentSuccess, onPaymentError]);

  // Cleanup khi component unmount
  useEffect(() => {
    return () => {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
    };
  }, [statusCheckInterval]);

  // Reset state khi dialog đóng
  const handleClose = () => {
    if (statusCheckInterval) {
      clearInterval(statusCheckInterval);
    }
    setPaymentData(null);
    setPaymentStatus('idle');
    setError('');
    setLoading(false);
    onClose();
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'pending':
        return <CircularProgress size={24} />;
      case 'success':
        return <CheckCircleIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return <PaymentIcon />;
    }
  };

  const getStatusText = () => {
    switch (paymentStatus) {
      case 'pending':
        return 'Đang chờ thanh toán...';
      case 'success':
        return 'Thanh toán thành công!';
      case 'error':
        return 'Thanh toán thất bại';
      default:
        return 'Sẵn sàng thanh toán';
    }
  };

  const getStatusColor = () => {
    switch (paymentStatus) {
      case 'pending':
        return 'warning';
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      default:
        return 'primary';
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          {getStatusIcon()}
          <Typography variant="h6">Thanh toán MoMo</Typography>
        </Box>
        <Chip 
          label={getStatusText()} 
          color={getStatusColor()}
          size="small"
          sx={{ mt: 1 }}
        />
      </DialogTitle>

      <DialogContent>
        {/* Thông tin booking */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Thông tin đặt sân
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography color="text.secondary">Sân:</Typography>
              <Typography>{booking?.courtName}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography color="text.secondary">Ngày:</Typography>
              <Typography>
                {booking?.date ? 
                  (typeof booking.date === 'string' ? booking.date : new Date(booking.date).toLocaleDateString('vi-VN'))
                  : 'N/A'
                }
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography color="text.secondary">Giờ:</Typography>
              <Typography>{booking?.startTime} - {booking?.endTime}</Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6">Tổng tiền:</Typography>
              <Typography variant="h6" color="primary">
                {formatPrice(booking?.totalPrice)}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Error display */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Payment status */}
        {paymentStatus === 'pending' && paymentData && (
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <QrCodeIcon sx={{ fontSize: 48, mb: 2, color: 'primary.main' }} />
              <Typography variant="h6" gutterBottom>
                Đang chờ thanh toán
              </Typography>
              <Typography color="text.secondary" paragraph>
                Vui lòng mở app MoMo hoặc sử dụng tab đã mở để hoàn tất thanh toán.
                <br />
                <strong>Sau khi thanh toán, hãy quay lại tab này để xem kết quả.</strong>
              </Typography>
              
              {/* Test Instructions */}
              <Alert severity="info" sx={{ mb: 2, textAlign: 'left' }}>
                <Typography variant="subtitle2" gutterBottom>
                  🧪 Hướng dẫn test (Sandbox):
                </Typography>
                <Typography variant="body2" component="div">
                  • <strong>Cách 1:</strong> Trên trang test, nhập SĐT <code>0963181714</code> để thanh toán thành công
                  <br />
                  • <strong>Cách 2:</strong> Tải app MoMo, đăng nhập bằng SĐT <code>0963181714</code> và quét QR
                  <br />
                  • Nhập SĐT <code>0963181715</code> để test thanh toán thất bại
                </Typography>
              </Alert>

              {paymentData.qrCodeUrl && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Quét mã QR bằng app MoMo:
                  </Typography>
                  <img 
                    src={paymentData.qrCodeUrl} 
                    alt="MoMo QR Code"
                    style={{ maxWidth: '200px', height: 'auto', border: '1px solid #ddd', borderRadius: '8px' }}
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        )}

        {paymentStatus === 'success' && (
          <Alert severity="success" sx={{ textAlign: 'center' }}>
            <Typography variant="h6">Thanh toán thành công!</Typography>
            <Typography>Đặt sân của bạn đã được xác nhận.</Typography>
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        {paymentStatus === 'idle' && (
          <>
            <Button onClick={handleClose} color="inherit">
              Hủy
            </Button>
            <Button 
              onClick={handleCreatePayment}
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <PaymentIcon />}
            >
              {loading ? 'Đang tạo...' : 'Thanh toán với MoMo'}
            </Button>
          </>
        )}

        {paymentStatus === 'pending' && (
          <Button onClick={handleClose} color="inherit" fullWidth>
            Đóng (Thanh toán sẽ tiếp tục ở tab khác)
          </Button>
        )}

        {(paymentStatus === 'success' || paymentStatus === 'error') && (
          <Button onClick={handleClose} variant="contained" fullWidth>
            Đóng
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default PaymentDialog; 