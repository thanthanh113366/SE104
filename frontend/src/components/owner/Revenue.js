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
  IconButton
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
import PaidIcon from '@mui/icons-material/Paid';
import EventNoteIcon from '@mui/icons-material/EventNote';
import DownloadIcon from '@mui/icons-material/Download';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DateRangeIcon from '@mui/icons-material/DateRange';
import FilterListIcon from '@mui/icons-material/FilterList';
import PrintIcon from '@mui/icons-material/Print';

// Dữ liệu mẫu
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

const WEEKLY_REVENUE = [
  { day: 'T2', revenue: 1850000 },
  { day: 'T3', revenue: 1650000 },
  { day: 'T4', revenue: 2250000 },
  { day: 'T5', revenue: 1950000 },
  { day: 'T6', revenue: 2550000 },
  { day: 'T7', revenue: 3150000 },
  { day: 'CN', revenue: 2750000 }
];

const COURT_REVENUE = [
  { id: 0, label: 'Sân bóng đá Mini Thành Công', value: 8500000, color: '#2e7d32' },
  { id: 1, label: 'Sân cầu lông Olympia', value: 5200000, color: '#1976d2' },
  { id: 2, label: 'Sân bóng rổ Hòa Bình', value: 4300000, color: '#ed6c02' },
  { id: 3, label: 'Sân tennis Lakeview', value: 6800000, color: '#9c27b0' }
];

const REVENUE_TRANSACTIONS = [
  { 
    id: 'tr1', 
    date: '15/05/2023', 
    courtName: 'Sân bóng đá Mini Thành Công', 
    customerName: 'Nguyễn Văn A', 
    bookingId: 'b1',
    amount: 600000,
    paymentMethod: 'online',
    status: 'confirmed'
  },
  { 
    id: 'tr2', 
    date: '16/05/2023', 
    courtName: 'Sân cầu lông Olympia', 
    customerName: 'Trần Thị B', 
    bookingId: 'b2',
    amount: 240000,
    paymentMethod: 'cash',
    status: 'confirmed'
  },
  { 
    id: 'tr3', 
    date: '16/05/2023', 
    courtName: 'Sân bóng rổ Hòa Bình', 
    customerName: 'Lê Văn C', 
    bookingId: 'b3',
    amount: 300000,
    paymentMethod: 'online',
    status: 'confirmed'
  },
  { 
    id: 'tr4', 
    date: '17/05/2023', 
    courtName: 'Sân bóng đá Mini Thành Công', 
    customerName: 'Phạm Văn D', 
    bookingId: 'b4',
    amount: 600000,
    paymentMethod: 'online',
    status: 'cancelled',
    refunded: true
  },
  { 
    id: 'tr5', 
    date: '18/05/2023', 
    courtName: 'Sân tennis Lakeview', 
    customerName: 'Hoàng Thị E', 
    bookingId: 'b5',
    amount: 500000,
    paymentMethod: 'online',
    status: 'confirmed'
  },
  { 
    id: 'tr6', 
    date: '19/05/2023', 
    courtName: 'Sân cầu lông Olympia', 
    customerName: 'Trương Văn F', 
    bookingId: 'b6',
    amount: 240000,
    paymentMethod: 'cash',
    status: 'confirmed'
  },
  { 
    id: 'tr7', 
    date: '20/05/2023', 
    courtName: 'Sân tennis Lakeview', 
    customerName: 'Lý Thị G', 
    bookingId: 'b7',
    amount: 500000,
    paymentMethod: 'online',
    status: 'confirmed'
  },
  { 
    id: 'tr8', 
    date: '21/05/2023', 
    courtName: 'Sân bóng đá Mini Thành Công', 
    customerName: 'Võ Văn H', 
    bookingId: 'b8',
    amount: 600000,
    paymentMethod: 'cash',
    status: 'confirmed'
  }
];

const Revenue = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [tabValue, setTabValue] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [courtFilter, setCourtFilter] = useState('all');
  
  // Xử lý thay đổi khoảng thời gian
  const handleTimeRangeChange = (newRange) => {
    setTimeRange(newRange);
  };
  
  // Xử lý thay đổi tab
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Xử lý thay đổi trang
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  // Xử lý thay đổi số hàng mỗi trang
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Lọc giao dịch theo khoảng thời gian và sân
  const filteredTransactions = REVENUE_TRANSACTIONS.filter(transaction => {
    if (courtFilter !== 'all') {
      // Đơn giản hóa, trong thực tế bạn sẽ so sánh ID
      if (!transaction.courtName.includes(courtFilter)) {
        return false;
      }
    }
    
    // Lọc theo khoảng thời gian tùy chỉnh nếu có
    if (startDate && endDate) {
      // Trong thực tế, bạn sẽ cần chuyển đổi chuỗi ngày thành đối tượng Date để so sánh
      // Đây chỉ là đơn giản hóa
      return true;
    }
    
    return true;
  });
  
  // Format tiền VND
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
      .format(amount)
      .replace('₫', 'VNĐ');
  };
  
  // Tính tổng doanh thu
  const totalRevenue = filteredTransactions
    .filter(tr => tr.status === 'confirmed' || (tr.status === 'cancelled' && !tr.refunded))
    .reduce((sum, tr) => sum + tr.amount, 0);
  
  // Tính doanh thu online
  const onlineRevenue = filteredTransactions
    .filter(tr => tr.paymentMethod === 'online' && (tr.status === 'confirmed' || (tr.status === 'cancelled' && !tr.refunded)))
    .reduce((sum, tr) => sum + tr.amount, 0);
  
  // Tính doanh thu tiền mặt
  const cashRevenue = filteredTransactions
    .filter(tr => tr.paymentMethod === 'cash' && (tr.status === 'confirmed' || (tr.status === 'cancelled' && !tr.refunded)))
    .reduce((sum, tr) => sum + tr.amount, 0);
  
  // Tính số lượng giao dịch
  const totalTransactions = filteredTransactions.length;
  
  // Dữ liệu biểu đồ dựa trên khoảng thời gian
  const chartData = timeRange === 'week' ? WEEKLY_REVENUE : MONTHLY_REVENUE;
  
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Báo cáo doanh thu
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
                Tổng doanh thu
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {formatCurrency(totalRevenue)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon color="success" fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="body2" color="success.main">
                  +12.5% so với {timeRange === 'week' ? 'tuần trước' : 'tháng trước'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Doanh thu thanh toán online
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {formatCurrency(onlineRevenue)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {Math.round((onlineRevenue / totalRevenue) * 100)}% tổng doanh thu
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Doanh thu tiền mặt
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {formatCurrency(cashRevenue)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {Math.round((cashRevenue / totalRevenue) * 100)}% tổng doanh thu
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Số lượng giao dịch
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {totalTransactions}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon color="success" fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="body2" color="success.main">
                  +8.3% so với {timeRange === 'week' ? 'tuần trước' : 'tháng trước'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Biểu đồ */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Doanh thu theo {timeRange === 'week' ? 'ngày trong tuần' : 'tháng'}
              </Typography>
              <IconButton size="small">
                <DownloadIcon />
              </IconButton>
            </Box>
            <Box sx={{ height: 300 }}>
              <BarChart
                xAxis={[{ 
                  scaleType: 'band', 
                  data: chartData.map(item => item[timeRange === 'week' ? 'day' : 'month']) 
                }]}
                series={[{ 
                  data: chartData.map(item => item.revenue), 
                  color: '#2e7d32',
                  label: 'Doanh thu'
                }]}
                height={300}
                margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
              />
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Doanh thu theo sân
              </Typography>
              <IconButton size="small">
                <DownloadIcon />
              </IconButton>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', height: 300 }}>
              <PieChart
                series={[
                  {
                    data: COURT_REVENUE,
                    highlightScope: { faded: 'global', highlighted: 'item' },
                    innerRadius: 30,
                    outerRadius: 100,
                    paddingAngle: 2,
                    cornerRadius: 4,
                  },
                ]}
                height={300}
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
          </Paper>
        </Grid>
      </Grid>
      
      {/* Tab và bảng giao dịch */}
      <Paper sx={{ borderRadius: 2 }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Chi tiết giao dịch
          </Typography>
          <Box>
            <Button 
              variant="outlined" 
              startIcon={<PrintIcon />} 
              sx={{ mr: 1 }}
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
        
        <Divider />
        
        <Box sx={{ p: 2, pb: 0 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                label="Lọc theo sân"
                value={courtFilter}
                onChange={(e) => setCourtFilter(e.target.value)}
              >
                <MenuItem value="all">Tất cả các sân</MenuItem>
                <MenuItem value="Thành Công">Sân bóng đá Mini Thành Công</MenuItem>
                <MenuItem value="Olympia">Sân cầu lông Olympia</MenuItem>
                <MenuItem value="Hòa Bình">Sân bóng rổ Hòa Bình</MenuItem>
                <MenuItem value="Lakeview">Sân tennis Lakeview</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID Giao dịch</TableCell>
                <TableCell>Ngày</TableCell>
                <TableCell>Mã đặt sân</TableCell>
                <TableCell>Sân</TableCell>
                <TableCell>Khách hàng</TableCell>
                <TableCell>Phương thức</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="right">Số tiền</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTransactions
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((transaction) => (
                  <TableRow key={transaction.id} hover>
                    <TableCell>{transaction.id}</TableCell>
                    <TableCell>{transaction.date}</TableCell>
                    <TableCell>{transaction.bookingId}</TableCell>
                    <TableCell>{transaction.courtName}</TableCell>
                    <TableCell>{transaction.customerName}</TableCell>
                    <TableCell>
                      {transaction.paymentMethod === 'online' ? 'Thanh toán online' : 'Tiền mặt'}
                    </TableCell>
                    <TableCell>
                      {transaction.status === 'confirmed' 
                        ? 'Thành công' 
                        : transaction.refunded 
                          ? 'Đã hoàn tiền' 
                          : 'Đã hủy'}
                    </TableCell>
                    <TableCell align="right" sx={{ 
                      fontWeight: 'bold', 
                      color: transaction.refunded ? 'error.main' : 'inherit'
                    }}>
                      {transaction.refunded ? '-' : ''}{formatCurrency(transaction.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              {filteredTransactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                    <Typography variant="subtitle1">
                      Không có giao dịch nào trong khoảng thời gian này
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredTransactions.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số hàng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} trong ${count}`}
        />
      </Paper>
    </Box>
  );
};

export default Revenue; 