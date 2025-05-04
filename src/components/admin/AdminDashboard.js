import React from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import EventIcon from '@mui/icons-material/Event';
import { useAuth } from '../../contexts/AuthContext';

const AdminDashboard = () => {
  const { userDetails } = useAuth();
  
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Xin chào, {userDetails?.displayName || 'Admin'}
      </Typography>
      
      <Typography variant="h6" sx={{ mb: 3 }}>
        Bảng điều khiển Admin
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            height: '100%',
            transition: 'transform 0.3s',
            '&:hover': { transform: 'translateY(-5px)' }
          }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <PeopleIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" component="div">
                Quản lý người dùng
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Xem và quản lý danh sách người dùng
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            height: '100%',
            transition: 'transform 0.3s',
            '&:hover': { transform: 'translateY(-5px)' }
          }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <SportsSoccerIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" component="div">
                Quản lý sân thể thao
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Xem và quản lý danh sách sân thể thao
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            height: '100%',
            transition: 'transform 0.3s',
            '&:hover': { transform: 'translateY(-5px)' }
          }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <EventIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" component="div">
                Quản lý đặt sân
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Xem và quản lý danh sách đặt sân
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard; 