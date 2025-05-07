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
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where, orderBy, limit, startAfter } from 'firebase/firestore';
import { db } from '../../firebase';

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

  // Fetch courts from Firestore
  useEffect(() => {
    const fetchCourts = async () => {
      try {
        setLoading(true);
        
        // Lấy dữ liệu từ Firestore với truy vấn đơn giản hơn
        const courtsRef = collection(db, 'courts');
        
        // Chỉ lấy tất cả các sân mà không có điều kiện nào
        console.log('Đang truy vấn collection courts...');
        const querySnapshot = await getDocs(courtsRef);
        
        const courtsData = [];
        console.log('Số lượng document tìm thấy:', querySnapshot.size);
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          console.log("Sân:", doc.id, data.name || 'Chưa có tên');
          
          // Chuyển đổi dữ liệu, đảm bảo các trường cần thiết luôn tồn tại
          courtsData.push({ 
            id: doc.id, 
            ...data,
            name: data.name || 'Chưa có tên',
            address: data.address || 'Chưa có địa chỉ',
            price: data.price || 0,
            sport: data.sport || 'Không xác định',
            facilities: Array.isArray(data.facilities) ? data.facilities : [],
            image: data.image || 'https://images.unsplash.com/photo-1459865264687-595d652de67e?q=80&w=800&auto=format&fit=crop',
            rating: data.rating || 0
          });
        });
        
        console.log('Tổng số sân tìm thấy:', courtsData.length);
        
        // Nếu không có dữ liệu từ Firestore, sử dụng dữ liệu demo
        if (courtsData.length === 0) {
          console.log('Không tìm thấy dữ liệu từ Firestore, sử dụng dữ liệu demo');
          setCourts(DEMO_COURTS);
          setFilteredCourts(DEMO_COURTS);
        } else {
          console.log('Đã tìm thấy', courtsData.length, 'sân từ Firestore');
          setCourts(courtsData);
          setFilteredCourts(courtsData);
        }
        
      } catch (error) {
        console.error('Lỗi truy vấn Firestore:', error);
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

      // Lọc theo môn thể thao
      if (sport !== 'Tất cả') {
        result = result.filter(court => court.sport === sport);
      }

      // Lọc theo khu vực
      if (district !== 'Tất cả') {
        result = result.filter(court => court.address.includes(district));
      }

      // Lọc theo giá
      result = result.filter(
        court => court.price >= priceRange[0] && court.price <= priceRange[1]
      );

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
  }, [searchTerm, sport, district, priceRange, facilities, courts]);

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

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Tìm kiếm sân thể thao
      </Typography>

      {/* Search bar */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
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
        </Grid>

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
                      height="200"
                      image={court.image}
                      alt={court.name}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="div" gutterBottom>
                        {court.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationOnIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {court.address}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <SportsIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {court.sport}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <StarIcon fontSize="small" sx={{ mr: 1, color: 'warning.main' }} />
                        <Typography variant="body2" component="span">
                          {court.rating}
                        </Typography>
                      </Box>
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                      <Typography variant="body1" fontWeight="bold">
                        {formatPrice(court.price)}
                      </Typography>
                      <Button 
                        variant="contained" 
                        size="small"
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