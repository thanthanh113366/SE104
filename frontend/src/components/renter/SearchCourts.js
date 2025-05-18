import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Grid, 
  Typography, 
  Card, 
  CardContent, 
  CardMedia, 
  CardActions,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  FormControlLabel,
  Paper,
  Divider,
  CircularProgress,
  Pagination,
  Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SportsIcon from '@mui/icons-material/Sports';
import StarIcon from '@mui/icons-material/Star';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useNavigate } from 'react-router-dom';
import CourtServiceWrapper from '../../services/courtServiceWrapper';

// Demo data
const DEMO_COURTS = [
  {
    id: 'court1',
    name: 'Sân bóng đá Mini Thủ Đức',
    address: '123 Võ Văn Ngân, Thủ Đức, TP.HCM',
    sport: 'Bóng đá',
    price: 250000,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?q=80&w=800&auto=format&fit=crop',
    facilities: ['Đèn chiếu sáng', 'Phòng thay đồ', 'Wifi'],
    openTime: '06:00',
    closeTime: '22:00',
  },
  {
    id: 'court2',
    name: 'Sân cầu lông Tân Bình',
    address: '456 Hoàng Văn Thụ, Tân Bình, TP.HCM',
    sport: 'Cầu lông',
    price: 120000,
    rating: 4.2,
    image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=800&auto=format&fit=crop',
    facilities: ['Phòng thay đồ', 'Nước uống'],
    openTime: '07:00',
    closeTime: '21:00',
  },
  {
    id: 'court3',
    name: 'Sân bóng rổ Quận 1',
    address: '789 Nguyễn Huệ, Quận 1, TP.HCM',
    sport: 'Bóng rổ',
    price: 180000,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1505666287802-931dc83a0fe4?q=80&w=800&auto=format&fit=crop',
    facilities: ['Đèn chiếu sáng', 'Phòng thay đồ', 'Chỗ đậu xe'],
    openTime: '06:30',
    closeTime: '22:30',
  },
];

// Danh sách môn thể thao
const SPORTS = [
  'Tất cả',
  'Bóng đá',
  'Cầu lông',
  'Bóng rổ',
  'Tennis',
  'Bóng chuyền',
  'Bida'
];

// Bảng ánh xạ tên thể thao giữa tiếng Anh và tiếng Việt
const SPORT_MAPPINGS = {
  'football': 'bóng đá',
  'soccer': 'bóng đá',
  'badminton': 'cầu lông',
  'basketball': 'bóng rổ',
  'tennis': 'tennis',
  'volleyball': 'bóng chuyền',
  'billiards': 'bida',
  'pool': 'bida',
  'snooker': 'bida',
};

// Danh sách khu vực
const DISTRICTS = [
  'Tất cả',
  'Quận 1',
  'Quận 2',
  'Quận 3',
  'Quận 4',
  'Quận 5',
  'Quận 6',
  'Quận 7',
  'Quận 8',
  'Quận 9',
  'Quận 10',
  'Quận 11',
  'Quận 12',
  'Thủ Đức',
  'Bình Thạnh',
  'Gò Vấp',
  'Phú Nhuận',
  'Tân Bình',
  'Tân Phú',
  'Bình Tân'
];

const SearchCourts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sport, setSport] = useState('Tất cả');
  const [district, setDistrict] = useState('Tất cả');
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [useLocation, setUseLocation] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [facilities, setFacilities] = useState({
    lighting: false,
    changingRoom: false,
    parking: false,
    wifi: false,
    drinks: false
  });
  const [courts, setCourts] = useState([]);
  const [filteredCourts, setFilteredCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const courtsPerPage = 9;

  const navigate = useNavigate();

  // Fetch courts using the wrapper
  useEffect(() => {
    const fetchCourts = async () => {
      try {
        setLoading(true);
        console.log('Bắt đầu lấy dữ liệu sân...');
        
        // Sử dụng CourtsServiceWrapper thay vì truy cập Firestore trực tiếp
        const response = await CourtServiceWrapper.getCourts();
        const courtsData = response.courts || [];
        
        console.log('Tổng số sân tìm thấy:', courtsData.length);
        
        // Nếu không có dữ liệu từ API/Firebase, sử dụng dữ liệu demo
        if (courtsData.length === 0) {
          console.log('Không tìm thấy dữ liệu, sử dụng dữ liệu demo');
          setCourts(DEMO_COURTS);
          setFilteredCourts(DEMO_COURTS);
          setError('Không tìm thấy dữ liệu sân thật, hiển thị dữ liệu demo.');
        } else {
          console.log('Đã tìm thấy', courtsData.length, 'sân');
          setCourts(courtsData);
          setFilteredCourts(courtsData);
          setError('');
        }
      } catch (error) {
        console.error('Lỗi truy vấn:', error);
        console.error('Chi tiết lỗi:', error.code, error.message);
        setError('Không thể tải dữ liệu sân. Vui lòng thử lại sau.');
        // Sử dụng dữ liệu demo khi có lỗi
        setCourts(DEMO_COURTS);
        setFilteredCourts(DEMO_COURTS);
      } finally {
        setLoading(false);
      }
    };

    fetchCourts();
  }, []);

  // Filter courts based on search criteria
  useEffect(() => {
    const applyFilters = () => {
      let result = [...courts];

      // Lọc theo tên và địa chỉ
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        result = result.filter(
          court => 
            court.name.toLowerCase().includes(searchLower) || 
            court.address.toLowerCase().includes(searchLower)
        );
      }

      // Lọc theo môn thể thao - Sử dụng kiểm tra không phân biệt hoa thường và hỗ trợ cả tiếng Anh/tiếng Việt
      if (sport !== 'Tất cả') {
        result = result.filter(court => {
          // Đảm bảo court.sport luôn có giá trị để tránh lỗi
          const courtSport = (court.sport || '').toLowerCase();
          const selectedSport = sport.toLowerCase();
          
          // Kiểm tra tên trùng khớp trực tiếp
          if (courtSport === selectedSport) return true;
          
          // Kiểm tra xem courtSport có phải là tên tiếng Anh không
          for (const [engName, viName] of Object.entries(SPORT_MAPPINGS)) {
            // Nếu tên tiếng Anh trong cơ sở dữ liệu, nhưng người dùng tìm bằng tên tiếng Việt
            if (courtSport === engName && viName === selectedSport) return true;
            
            // Nếu tên tiếng Việt trong cơ sở dữ liệu, nhưng người dùng tìm bằng tên tiếng Anh
            if (courtSport === viName && engName === selectedSport) return true;
          }
          
          return false;
        });
      }

      // Lọc theo khu vực
      if (district !== 'Tất cả') {
        result = result.filter(court => court.address.includes(district));
      }

      // Lọc theo giá
      result = result.filter(
        court => court.price >= priceRange[0] && court.price <= priceRange[1]
      );
      
      // Lọc theo ngày (nếu có)
      if (selectedDate) {
        // Nếu sân có thông tin availableSlots, kiểm tra xem có slot cho ngày đã chọn không
        result = result.filter(court => {
          if (!court.availableSlots || !Array.isArray(court.availableSlots)) return true;
          return court.availableSlots.some(slot => slot.date === selectedDate);
        });
      }
      
      // Lọc theo giờ (nếu có)
      if (selectedTime) {
        // Kiểm tra xem sân có mở cửa trong khoảng thời gian đã chọn không
        result = result.filter(court => {
          if (!court.openTime || !court.closeTime) return true;
          
          // Chuyển đổi thời gian sang số để so sánh
          const timeValue = parseInt(selectedTime.replace(':', ''));
          const openTimeValue = parseInt(court.openTime.replace(':', ''));
          const closeTimeValue = parseInt(court.closeTime.replace(':', ''));
          
          return timeValue >= openTimeValue && timeValue <= closeTimeValue;
        });
      }
      
      // Lọc theo vị trí (nếu có)
      if (useLocation && userLocation) {
        // Thêm khoảng cách vào mỗi sân
        result = result.map(court => {
          let distance = Infinity;
          
          // Nếu sân có thông tin vị trí
          if (court.location && court.location.latitude && court.location.longitude) {
            distance = calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              court.location.latitude,
              court.location.longitude
            );
          }
          
          return { ...court, distance };
        });
        
        // Sắp xếp theo khoảng cách gần nhất
        result.sort((a, b) => a.distance - b.distance);
        
        // Chỉ lấy các sân trong bán kính 10km (nếu có thông tin khoảng cách)
        result = result.filter(court => {
          return court.distance === Infinity || court.distance <= 10;
        });
      }

      // Lọc theo tiện ích
      if (facilities.lighting) {
        result = result.filter(court => 
          court.facilities && court.facilities.some(f => 
            f.toLowerCase().includes('đèn') || f.toLowerCase().includes('chiếu sáng')
          )
        );
      }
      if (facilities.changingRoom) {
        result = result.filter(court => 
          court.facilities && court.facilities.some(f => 
            f.toLowerCase().includes('phòng thay đồ')
          )
        );
      }
      if (facilities.parking) {
        result = result.filter(court => 
          court.facilities && court.facilities.some(f => 
            f.toLowerCase().includes('đậu xe') || 
            f.toLowerCase().includes('giữ xe') ||
            f.toLowerCase().includes('parking')
          )
        );
      }
      if (facilities.wifi) {
        result = result.filter(court => 
          court.facilities && court.facilities.some(f => 
            f.toLowerCase().includes('wifi')
          )
        );
      }
      if (facilities.drinks) {
        result = result.filter(court => 
          court.facilities && court.facilities.some(f => 
            f.toLowerCase().includes('nước') || 
            f.toLowerCase().includes('đồ uống') ||
            f.toLowerCase().includes('giải khát')
          )
        );
      }

      setFilteredCourts(result);
      setPage(1); // Reset về trang đầu tiên khi thay đổi bộ lọc
    };

    applyFilters();
  }, [searchTerm, sport, district, priceRange, facilities, courts, selectedDate, selectedTime, useLocation, userLocation]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredCourts.length / courtsPerPage);
  const paginatedCourts = filteredCourts.slice(
    (page - 1) * courtsPerPage,
    page * courtsPerPage
  );

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleFacilityChange = (event) => {
    setFacilities({
      ...facilities,
      [event.target.name]: event.target.checked
    });
  };

  const handleCourtClick = (courtId) => {
    navigate(`/renter/court/${courtId}`);
  };

  // Format price to VND
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price).replace('₫', 'VNĐ');
  };

  // Hàm lấy vị trí hiện tại của người dùng
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Trình duyệt của bạn không hỗ trợ định vị.');
      return;
    }
    
    setLoadingLocation(true);
    setLocationError('');
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        setUseLocation(true);
        setLoadingLocation(false);
      },
      (error) => {
        setLocationError('Không thể lấy vị trí của bạn. Vui lòng kiểm tra quyền truy cập vị trí.');
        setUseLocation(false);
        setLoadingLocation(false);
        console.error('Lỗi định vị:', error);
      }
    );
  };
  
  // Tính khoảng cách giữa hai điểm trên bản đồ (sử dụng công thức Haversine)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Bán kính trái đất tính bằng km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
      
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
  };
  
  // Chuyển đổi độ sang radian
  const toRad = (value) => {
    return value * Math.PI / 180;
  };
  
  // Xử lý thay đổi ngày
  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };
  
  // Xử lý thay đổi giờ
  const handleTimeChange = (event) => {
    setSelectedTime(event.target.value);
  };
  
  // Bật/tắt tìm kiếm theo vị trí
  const toggleLocationSearch = () => {
    if (!useLocation) {
      getUserLocation();
    } else {
      setUseLocation(false);
    }
  };

  return (
    <Box sx={{ p: 2, maxWidth: 1200, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        Tìm kiếm sân thể thao
      </Typography>

      {error && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Form tìm kiếm */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Tìm kiếm sân theo tên hoặc địa chỉ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Môn thể thao</InputLabel>
              <Select
                value={sport}
                label="Môn thể thao"
                onChange={(e) => setSport(e.target.value)}
              >
                {SPORTS.map((sportOption) => (
                  <MenuItem key={sportOption} value={sportOption}>
                    {sportOption}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Khu vực</InputLabel>
              <Select
                value={district}
                label="Khu vực"
                onChange={(e) => setDistrict(e.target.value)}
              >
                {DISTRICTS.map((districtOption) => (
                  <MenuItem key={districtOption} value={districtOption}>
                    {districtOption}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Chọn ngày"
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Chọn giờ"
              type="time"
              value={selectedTime}
              onChange={handleTimeChange}
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                step: 1800, // 30 phút
              }}
            />
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 2, mb: 2 }}>
          <FormControlLabel
            control={
              <Checkbox 
                checked={useLocation}
                onChange={toggleLocationSearch}
                color="primary"
              />
            }
            label={loadingLocation ? "Đang xác định vị trí..." : "Tìm sân gần tôi"}
          />
          {locationError && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              {locationError}
            </Typography>
          )}
          {useLocation && userLocation && (
            <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
              Đã xác định vị trí của bạn. Hiển thị sân trong bán kính 10km.
            </Typography>
          )}
        </Box>

        <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
          Bộ lọc nâng cao
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Tiện ích
            </Typography>
            <Grid container>
              <Grid item xs={6}>
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={facilities.lighting}
                      onChange={handleFacilityChange}
                      name="lighting"
                    />
                  }
                  label="Đèn chiếu sáng"
                />
              </Grid>
              <Grid item xs={6}>
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={facilities.changingRoom}
                      onChange={handleFacilityChange}
                      name="changingRoom"
                    />
                  }
                  label="Phòng thay đồ"
                />
              </Grid>
              <Grid item xs={6}>
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={facilities.parking}
                      onChange={handleFacilityChange}
                      name="parking"
                    />
                  }
                  label="Chỗ đậu xe"
                />
              </Grid>
              <Grid item xs={6}>
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={facilities.wifi}
                      onChange={handleFacilityChange}
                      name="wifi"
                    />
                  }
                  label="Wifi"
                />
              </Grid>
              <Grid item xs={6}>
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={facilities.drinks}
                      onChange={handleFacilityChange}
                      name="drinks"
                    />
                  }
                  label="Nước uống"
                />
              </Grid>
            </Grid>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Giá tiền (VND/giờ)
            </Typography>
            <Box sx={{ px: 2 }}>
              <Typography variant="body2" gutterBottom>
                {`${formatPrice(priceRange[0])} - ${formatPrice(priceRange[1])}`}
              </Typography>
              {/* Trong thực tế, bạn có thể sử dụng Slider từ MUI */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button 
                  variant="outlined" 
                  onClick={() => setPriceRange([0, 200000])}
                  size="small"
                >
                  &lt; 200K
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={() => setPriceRange([200000, 500000])}
                  size="small"
                >
                  200K - 500K
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={() => setPriceRange([500000, 1000000])}
                  size="small"
                >
                  &gt; 500K
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Results */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Kết quả tìm kiếm ({filteredCourts.length} sân)
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : filteredCourts.length === 0 ? (
          <Alert severity="info">
            Không tìm thấy sân phù hợp với tiêu chí tìm kiếm
          </Alert>
        ) : (
          <>
            <Grid container spacing={3}>
              {paginatedCourts.map((court) => (
                <Grid item xs={12} sm={6} md={4} key={court.id}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: 6,
                        cursor: 'pointer'
                      }
                    }}
                    onClick={() => handleCourtClick(court.id)}
                  >
                    <CardMedia
                      component="img"
                      height="180"
                      image={court.image}
                      alt={court.name}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ 
                      flexGrow: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      height: '200px',
                      padding: 2,
                      overflow: 'hidden'
                    }}>
                      <Typography 
                        variant="h6" 
                        component="div" 
                        gutterBottom
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          marginBottom: 1,
                          wordBreak: 'break-word',
                          hyphens: 'auto'
                        }}
                      >
                        {court.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                        <LocationOnIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary', flexShrink: 0, mt: 0.3 }} />
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            lineHeight: '1.3em',
                            wordBreak: 'break-word'
                          }}
                        >
                          {court.address}
                          {useLocation && court.distance && court.distance !== Infinity && (
                            <span> ({court.distance.toFixed(1)} km)</span>
                          )}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <SportsIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary', flexShrink: 0 }} />
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {court.sport || "Không xác định"}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <StarIcon fontSize="small" sx={{ mr: 1, color: 'warning.main', flexShrink: 0 }} />
                        <Typography variant="body2" component="span" noWrap>
                          {court.rating || "Chưa có đánh giá"}
                        </Typography>
                      </Box>
                      {court.openTime && court.closeTime && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary', flexShrink: 0 }} />
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {court.openTime} - {court.closeTime}
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'space-between', p: 2, pt: 0 }}>
                      <Typography variant="body1" fontWeight="bold">
                        {formatPrice(court.price)}
                      </Typography>
                      <Button 
                        variant="contained" 
                        size="small"
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCourtClick(court.id);
                        }}
                      >
                        Xem chi tiết
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
            
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination 
                  count={totalPages} 
                  page={page} 
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default SearchCourts; 