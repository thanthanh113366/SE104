import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  Tabs, 
  Tab,
  Stack,
  Button,
  ButtonGroup,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  MenuItem,
  IconButton,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { vi } from 'date-fns/locale';

// Charts
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { LineChart } from '@mui/x-charts/LineChart';

// Icons
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import DownloadIcon from '@mui/icons-material/Download';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DateRangeIcon from '@mui/icons-material/DateRange';
import PrintIcon from '@mui/icons-material/Print';
import PeopleIcon from '@mui/icons-material/People';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import EventNoteIcon from '@mui/icons-material/EventNote';
import PaidIcon from '@mui/icons-material/Paid';

const Reports = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [tabValue, setTabValue] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  
  // Dữ liệu mẫu
  const stats = {
    totalUsers: 145,
    userGrowth: 12.5,
    totalBookings: 256,
    bookingGrowth: 8.3,
    totalRevenue: 25800000,
    revenueGrowth: 15.2,
    activeCourts: 35,
  };
  
  // Dữ liệu biểu đồ doanh thu
  const MONTHLY_REVENUE = [
    { month: 'T1', revenue: 12500000 },
    { month: 'T2', revenue: 15800000 },
    { month: 'T3', revenue: 14200000 },
    { month: 'T4', revenue: 16500000 },
    { month: 'T5', revenue: 18200000 },
    { month: 'T6', revenue: 17500000 },
    { month: 'T7', revenue: 19800000 },
    { month: 'T8', revenue: 21500000 },
    { month: 'T9', revenue: 20300000 },
    { month: 'T10', revenue: 22500000 },
    { month: 'T11', revenue: 24800000 },
    { month: 'T12', revenue: 23500000 }
  ];

  // Dữ liệu biểu đồ người dùng mới
  const MONTHLY_USERS = [
    { month: 'T1', users: 8 },
    { month: 'T2', users: 12 },
    { month: 'T3', users: 18 },
    { month: 'T4', users: 15 },
    { month: 'T5', users: 25 },
    { month: 'T6', users: 30 },
    { month: 'T7', users: 22 },
    { month: 'T8', users: 28 },
    { month: 'T9', users: 32 },
    { month: 'T10', users: 20 },
    { month: 'T11', users: 15 },
    { month: 'T12', users: 10 },
  ];

  // Dữ liệu biểu đồ đặt sân
  const MONTHLY_BOOKINGS = [
    { month: 'T1', bookings: 28 },
    { month: 'T2', bookings: 35 },
    { month: 'T3', bookings: 42 },
    { month: 'T4', bookings: 38 },
    { month: 'T5', bookings: 52 },
    { month: 'T6', bookings: 58 },
    { month: 'T7', bookings: 62 },
    { month: 'T8', bookings: 70 },
    { month: 'T9', bookings: 65 },
    { month: 'T10', bookings: 55 },
    { month: 'T11', bookings: 48 },
    { month: 'T12', bookings: 42 },
  ];
  
  // Dữ liệu biểu đồ phân loại người dùng
  const USER_DISTRIBUTION = [
    { id: 0, value: 120, label: 'Người thuê sân', color: '#2196f3' },
    { id: 1, value: 22, label: 'Chủ sân', color: '#4caf50' },
    { id: 2, value: 3, label: 'Quản trị viên', color: '#f44336' },
  ];
  
  // Dữ liệu top chủ sân
  const TOP_OWNERS = [
    { id: 1, name: 'Trần Thị B', totalCourts: 5, totalRevenue: 8500000, totalBookings: 85 },
    { id: 2, name: 'Vũ Văn F', totalCourts: 3, totalRevenue: 6200000, totalBookings: 62 },
    { id: 3, name: 'Nguyễn Văn H', totalCourts: 2, totalRevenue: 4800000, totalBookings: 48 },
    { id: 4, name: 'Lê Thị K', totalCourts: 2, totalRevenue: 3200000, totalBookings: 32 },
    { id: 5, name: 'Phạm Văn M', totalCourts: 1, totalRevenue: 2500000, totalBookings: 25 },
  ];
  
  // Dữ liệu top sân thể thao
  const TOP_COURTS = [
    { id: 1, name: 'Sân bóng đá Mini Thành Công', owner: 'Trần Thị B', totalRevenue: 3200000, totalBookings: 32 },
    { id: 2, name: 'Sân tennis Lakeview', owner: 'Trần Thị B', totalRevenue: 2800000, totalBookings: 28 },
    { id: 3, name: 'Sân cầu lông Olympia', owner: 'Vũ Văn F', totalRevenue: 2600000, totalBookings: 26 },
    { id: 4, name: 'Sân bóng rổ Hòa Bình', owner: 'Nguyễn Văn H', totalRevenue: 2200000, totalBookings: 22 },
    { id: 5, name: 'Sân bóng đá 7 người Sài Gòn', owner: 'Phạm Văn M', totalRevenue: 2000000, totalBookings: 20 },
  ];
  
  // Xử lý thay đổi tab
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Xử lý thay đổi khoảng thời gian
  const handleTimeRangeChange = (newRange) => {
    setTimeRange(newRange);
  };
  
  // Format tiền VND
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
      .format(amount)
      .replace('₫', 'VNĐ');
  };
  
  // Dữ liệu biểu đồ dựa trên khoảng thời gian
  const getRevenueData = () => {
    if (timeRange === 'week') {
      return [
        { day: 'T2', revenue: 1850000 },
        { day: 'T3', revenue: 1650000 },
        { day: 'T4', revenue: 2250000 },
        { day: 'T5', revenue: 1950000 },
        { day: 'T6', revenue: 2550000 },
        { day: 'T7', revenue: 3150000 },
        { day: 'CN', revenue: 2750000 }
      ];
    } else {
      return MONTHLY_REVENUE;
    }
  };
  
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Báo cáo thống kê
        </Typography>
        <Box>
          <ButtonGroup variant="outlined" aria-label="time range">
            <Button 
              variant={timeRange === 'week' ? 'contained' : 'outlined'} 
              onClick={() => handleTimeRangeChange('week')}
              startIcon={<CalendarTodayIcon />}
            >
              Tuần
            </Button>
            <Button 
              variant={timeRange === 'month' ? 'contained' : 'outlined'} 
              onClick={() => handleTimeRangeChange('month')}
              startIcon={<CalendarMonthIcon />}
            >
              Tháng
            </Button>
            <Button 
              variant={timeRange === 'custom' ? 'contained' : 'outlined'} 
              onClick={() => handleTimeRangeChange('custom')}
              startIcon={<DateRangeIcon />}
            >
              Tùy chỉnh
            </Button>
          </ButtonGroup>
        </Box>
      </Box>
      
      {/* Khoảng thời gian tùy chỉnh */}
      {timeRange === 'custom' && (
        <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
                <DatePicker
                  label="Từ ngày"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'outlined'
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
                <DatePicker
                  label="Đến ngày"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'outlined'
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Button 
                variant="contained" 
                fullWidth
                disabled={!startDate || !endDate}
              >
                Áp dụng
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}
      
      {/* Thẻ tổng quan */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Tổng người dùng
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {stats.totalUsers}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon color="success" fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="body2" color="success.main">
                  +{stats.userGrowth}% so với {timeRange === 'week' ? 'tuần trước' : 'tháng trước'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Tổng đặt sân
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {stats.totalBookings}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon color="success" fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="body2" color="success.main">
                  +{stats.bookingGrowth}% so với {timeRange === 'week' ? 'tuần trước' : 'tháng trước'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Tổng doanh thu
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {formatCurrency(stats.totalRevenue).replace('VNĐ', '')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon color="success" fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="body2" color="success.main">
                  +{stats.revenueGrowth}% so với {timeRange === 'week' ? 'tuần trước' : 'tháng trước'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Sân đang hoạt động
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {stats.activeCourts}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  trên tổng số 38 sân
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Tabs báo cáo */}
      <Paper sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 2 }}
        >
          <Tab label="Tổng quan" />
          <Tab label="Doanh thu" />
          <Tab label="Người dùng" />
          <Tab label="Đặt sân" />
        </Tabs>
        
        {/* Tab Tổng quan */}
        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Typography variant="h6" gutterBottom>
                  Doanh thu theo {timeRange === 'week' ? 'ngày trong tuần' : 'tháng'}
                </Typography>
                <Box sx={{ height: 350 }}>
                  <BarChart
                    xAxis={[{ 
                      scaleType: 'band', 
                      data: getRevenueData().map(item => item[timeRange === 'week' ? 'day' : 'month']) 
                    }]}
                    series={[{ 
                      data: getRevenueData().map(item => item.revenue), 
                      color: '#2e7d32',
                      label: 'Doanh thu'
                    }]}
                    height={350}
                    margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Typography variant="h6" gutterBottom>
                  Phân loại người dùng
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', height: 350 }}>
                  <PieChart
                    series={[
                      {
                        data: USER_DISTRIBUTION,
                        highlightScope: { faded: 'global', highlighted: 'item' },
                        innerRadius: 30,
                        outerRadius: 100,
                        paddingAngle: 2,
                        cornerRadius: 4,
                      },
                    ]}
                    height={350}
                    margin={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    slotProps={{
                      legend: {
                        direction: 'column',
                        position: { vertical: 'middle', horizontal: 'right' },
                        padding: 0,
                      },
                    }}
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Top 5 chủ sân có doanh thu cao nhất
                </Typography>
                
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Tên chủ sân</TableCell>
                        <TableCell align="right">Số sân</TableCell>
                        <TableCell align="right">Đặt sân</TableCell>
                        <TableCell align="right">Doanh thu</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {TOP_OWNERS.map((owner) => (
                        <TableRow key={owner.id} hover>
                          <TableCell>{owner.id}</TableCell>
                          <TableCell>{owner.name}</TableCell>
                          <TableCell align="right">{owner.totalCourts}</TableCell>
                          <TableCell align="right">{owner.totalBookings}</TableCell>
                          <TableCell align="right">{formatCurrency(owner.totalRevenue)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Top 5 sân thể thao được đặt nhiều nhất
                </Typography>
                
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Tên sân</TableCell>
                        <TableCell>Chủ sân</TableCell>
                        <TableCell align="right">Đặt sân</TableCell>
                        <TableCell align="right">Doanh thu</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {TOP_COURTS.map((court) => (
                        <TableRow key={court.id} hover>
                          <TableCell>{court.id}</TableCell>
                          <TableCell>{court.name}</TableCell>
                          <TableCell>{court.owner}</TableCell>
                          <TableCell align="right">{court.totalBookings}</TableCell>
                          <TableCell align="right">{formatCurrency(court.totalRevenue)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </Box>
        )}
        
        {/* Tab Doanh thu */}
        {tabValue === 1 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Doanh thu theo {timeRange === 'week' ? 'ngày trong tuần' : 'tháng'}
                </Typography>
                <Box sx={{ height: 400 }}>
                  <BarChart
                    xAxis={[{ 
                      scaleType: 'band', 
                      data: getRevenueData().map(item => item[timeRange === 'week' ? 'day' : 'month']) 
                    }]}
                    series={[{ 
                      data: getRevenueData().map(item => item.revenue), 
                      color: '#2e7d32',
                      label: 'Doanh thu'
                    }]}
                    height={400}
                    margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
        
        {/* Tab Người dùng */}
        {tabValue === 2 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Typography variant="h6" gutterBottom>
                  Người dùng mới theo tháng
                </Typography>
                <Box sx={{ height: 400 }}>
                  <BarChart
                    xAxis={[{ 
                      scaleType: 'band', 
                      data: MONTHLY_USERS.map(item => item.month) 
                    }]}
                    series={[{ 
                      data: MONTHLY_USERS.map(item => item.users), 
                      color: '#2196f3',
                      label: 'Người dùng mới'
                    }]}
                    height={400}
                    margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Typography variant="h6" gutterBottom>
                  Phân loại người dùng
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', height: 400 }}>
                  <PieChart
                    series={[
                      {
                        data: USER_DISTRIBUTION,
                        highlightScope: { faded: 'global', highlighted: 'item' },
                        innerRadius: 30,
                        outerRadius: 100,
                        paddingAngle: 2,
                        cornerRadius: 4,
                      },
                    ]}
                    height={400}
                    margin={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    slotProps={{
                      legend: {
                        direction: 'column',
                        position: { vertical: 'middle', horizontal: 'right' },
                        padding: 0,
                      },
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
        
        {/* Tab Đặt sân */}
        {tabValue === 3 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Số lượng đặt sân theo tháng
                </Typography>
                <Box sx={{ height: 400 }}>
                  <BarChart
                    xAxis={[{ 
                      scaleType: 'band', 
                      data: MONTHLY_BOOKINGS.map(item => item.month) 
                    }]}
                    series={[{ 
                      data: MONTHLY_BOOKINGS.map(item => item.bookings), 
                      color: '#ff9800',
                      label: 'Đặt sân'
                    }]}
                    height={400}
                    margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
      
      {/* Chức năng in/xuất báo cáo */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Button 
          variant="outlined" 
          startIcon={<PrintIcon />}
        >
          In báo cáo
        </Button>
        <Button 
          variant="outlined" 
          startIcon={<DownloadIcon />}
        >
          Xuất Excel
        </Button>
      </Box>
    </Box>
  );
};

export default Reports; 