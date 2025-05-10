import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const ManageBookings = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1">
          Quản lý đặt sân
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Tính năng đang được phát triển...
        </Typography>
      </Box>
    </Container>
  );
};

export default ManageBookings; 