import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Container
} from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';

const PaymentReturn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Prevent multiple executions
    const hasProcessed = sessionStorage.getItem('paymentProcessed');
    if (hasProcessed) {
      console.log('Payment already processed, skipping...');
      return;
    }

    const handlePaymentReturn = async () => {
      const resultCode = searchParams.get('resultCode');
      const orderId = searchParams.get('orderId');
      const message = searchParams.get('message');

      console.log('MoMo Payment Return:', { resultCode, orderId, message });
      
      // Mark as processed immediately
      sessionStorage.setItem('paymentProcessed', 'true');

      if (resultCode === '0') {
        // Thanh toán thành công
        console.log('Payment successful, notifying parent tab...');
        
        // Tạo payment object để gửi về tab gốc
        const paymentData = {
          id: orderId,
          orderId: orderId,
          status: 'completed',
          message: message,
          timestamp: new Date().toISOString()
        };

        // Gửi thông tin về tab gốc qua localStorage
        console.log('Setting paymentSuccess in localStorage:', paymentData);
        localStorage.setItem('paymentSuccess', JSON.stringify(paymentData));
        
        // Trigger storage event manually cho same tab (workaround)
        console.log('Dispatching storage event manually...');
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'paymentSuccess',
          newValue: JSON.stringify(paymentData),
          oldValue: null,
          storageArea: localStorage
        }));

        // Focus về tab gốc nếu có thể
        if (window.opener && !window.opener.closed) {
          console.log('Focusing back to parent tab...');
          window.opener.focus();
        }

        // Auto close tab sau khi thông báo thành công
        setTimeout(() => {
          console.log('Auto closing payment tab...');
          // Clear processed flag before closing
          sessionStorage.removeItem('paymentProcessed');
          window.close();
          
          // Fallback: nếu không đóng được tab, redirect về trang chính
          setTimeout(() => {
            navigate('/renter');
          }, 1000);
        }, 1500); // Giảm thời gian xuống 1.5 giây để UX mượt mà hơn

      } else {
        // Thanh toán thất bại
        console.log('Payment failed:', message);
        
        const errorData = {
          status: 'failed',
          message: message || 'Thanh toán thất bại',
          resultCode: resultCode
        };

        localStorage.setItem('paymentError', JSON.stringify(errorData));
        
        // Trigger storage event manually
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'paymentError',
          newValue: JSON.stringify(errorData),
          oldValue: null,
          storageArea: localStorage
        }));

        // Focus về tab gốc nếu có thể
        if (window.opener && !window.opener.closed) {
          console.log('Focusing back to parent tab...');
          window.opener.focus();
        }

        setTimeout(() => {
          console.log('Auto closing payment tab...');
          // Clear processed flag before closing
          sessionStorage.removeItem('paymentProcessed');
          window.close();
          setTimeout(() => {
            navigate('/renter');
          }, 1000);
        }, 2000); // Thất bại thì để lâu hơn một chút
      }
    };

    handlePaymentReturn();
  }, [searchParams, navigate]);

  const resultCode = searchParams.get('resultCode');
  const isSuccess = resultCode === '0';

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center'
        }}
      >
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          {isSuccess ? (
            <>
              <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom color="success.main">
                Thanh toán thành công!
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Đang quay về trang chính...
              </Typography>
            </>
          ) : (
            <>
              <Typography variant="h5" gutterBottom color="error">
                Thanh toán thất bại
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {searchParams.get('message') || 'Đã có lỗi xảy ra'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Đang quay về trang chính...
              </Typography>
            </>
          )}
          
          <Box sx={{ mt: 3 }}>
            <CircularProgress size={24} />
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default PaymentReturn; 