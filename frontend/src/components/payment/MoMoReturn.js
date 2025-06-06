import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';

const MoMoReturn = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleMoMoReturn = () => {
      // Lấy thông tin từ URL params
      const orderId = searchParams.get('orderId');
      const resultCode = searchParams.get('resultCode');
      const extraData = searchParams.get('extraData');

      console.log('MoMo Return - orderId:', orderId);
      console.log('MoMo Return - resultCode:', resultCode);
      console.log('MoMo Return - extraData:', extraData);

      let courtId = null;
      let redirectUrl = '/renter';

      // Parse extraData để lấy courtId
      if (extraData) {
        try {
          const data = JSON.parse(decodeURIComponent(extraData));
          courtId = data.courtId;
        } catch (error) {
          console.error('Error parsing extraData:', error);
        }
      }

      // Tạo redirect URL
      if (courtId) {
        if (resultCode === '0') {
          // Thanh toán thành công
          redirectUrl = `/renter/court/${courtId}?payment=success&orderId=${orderId}`;
        } else {
          // Thanh toán thất bại
          redirectUrl = `/renter/court/${courtId}?payment=failed&orderId=${orderId}`;
        }
      } else {
        // Không có courtId, redirect về trang chính
        redirectUrl = `/renter?payment=${resultCode === '0' ? 'success' : 'failed'}`;
      }

      console.log('Redirecting to:', redirectUrl);
      
      // Redirect sau 2 giây để user thấy loading
      setTimeout(() => {
        navigate(redirectUrl, { replace: true });
      }, 2000);
    };

    handleMoMoReturn();
  }, [navigate, searchParams]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 2
      }}
    >
      <CircularProgress size={60} />
      <Typography variant="h6">
        Đang xử lý kết quả thanh toán...
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Vui lòng đợi trong giây lát
      </Typography>
    </Box>
  );
};

export default MoMoReturn; 