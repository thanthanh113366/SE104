import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  Grid,
  MenuItem,
  FormControlLabel,
  Switch,
  Divider,
  InputAdornment,
  Alert,
  Snackbar,
  CircularProgress,
  IconButton,
  LinearProgress,
  Tooltip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';

// Icons
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MoneyIcon from '@mui/icons-material/Money';
import ImageIcon from '@mui/icons-material/Image';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';

// Kích thước tối đa cho ảnh (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;
// Chất lượng nén ảnh (0-1)
const COMPRESSION_QUALITY = 0.6;

const AddCourt = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [compressedImage, setCompressedImage] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('stable');
  
  const [courtData, setCourtData] = useState({
    name: '',
    address: '',
    description: '',
    sport: 'football',
    price: '',
    openTime: '06:00',
    closeTime: '22:00',
    facilities: '',
    isAvailable: true,
  });

  // Kiểm tra kết nối internet
  useEffect(() => {
    const checkConnection = () => {
      if (navigator.onLine) {
        setConnectionStatus('stable');
      } else {
        setConnectionStatus('offline');
      }
    };

    window.addEventListener('online', checkConnection);
    window.addEventListener('offline', checkConnection);
    
    // Initial check
    checkConnection();
    
    return () => {
      window.removeEventListener('online', checkConnection);
      window.removeEventListener('offline', checkConnection);
    };
  }, []);
  
  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setCourtData({
      ...courtData,
      [name]: name === 'isAvailable' ? checked : value
    });
  };

  // Nén ảnh trước khi upload
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('Không có file ảnh'));
        return;
      }

      // Nếu file không phải ảnh hoặc dưới 500KB, không cần nén
      if (!file.type.startsWith('image/') || file.size < 500 * 1024) {
        resolve(file);
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          // Tạo canvas để nén ảnh
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Giảm kích thước cho ảnh quá lớn
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Chuyển canvas thành blob
          canvas.toBlob((blob) => {
            if (blob) {
              // Tạo file mới từ blob đã nén
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });
              console.log(`Đã nén ảnh từ ${file.size / 1024}KB xuống ${compressedFile.size / 1024}KB`);
              resolve(compressedFile);
            } else {
              console.error('Không thể nén ảnh');
              resolve(file); // Sử dụng file gốc nếu không nén được
            }
          }, file.type, COMPRESSION_QUALITY);
        };
        img.onerror = (error) => {
          console.error('Lỗi khi tải ảnh để nén:', error);
          resolve(file); // Sử dụng file gốc nếu có lỗi
        };
      };
      reader.onerror = (error) => {
        console.error('Lỗi khi đọc file:', error);
        resolve(file); // Sử dụng file gốc nếu có lỗi
      };
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setError(`Kích thước file quá lớn. Vui lòng chọn ảnh dưới ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
        return;
      }
      
      setError('');
      setImageFile(file);
      
      // Hiển thị preview ngay để người dùng thấy nhanh
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Nén ảnh ngay sau khi chọn
      try {
        setUploadStatus('Đang chuẩn bị ảnh...');
        const compressed = await compressImage(file);
        setCompressedImage(compressed);
        setUploadStatus('Ảnh đã sẵn sàng để tải lên');
      } catch (err) {
        console.error('Lỗi khi nén ảnh:', err);
        setCompressedImage(file); // Sử dụng file gốc nếu không nén được
      }
    }
  };
  
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setCompressedImage(null);
    setUploadProgress(0);
    setUploadStatus('');
  };

  const handleRetryUpload = () => {
    if (compressedImage) {
      setRetryCount(prev => prev + 1);
      uploadImage(compressedImage);
    }
  };

  const uploadImage = async (file) => {
    if (!file) return null;
    if (connectionStatus === 'offline') {
      setError('Không có kết nối internet. Vui lòng kiểm tra kết nối của bạn và thử lại.');
      return null;
    }
    
    try {
      setIsUploading(true);
      setUploadStatus('Đang chuẩn bị tải lên...');
      
      // Tạo đường dẫn lưu trữ trên Firebase Storage
      const fileName = `court_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const storageRef = ref(storage, `courts/${currentUser.uid}/${fileName}`);
      console.log('Bắt đầu upload ảnh:', fileName);
      
      // Bắt đầu quá trình upload với theo dõi tiến trình
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      return new Promise((resolve, reject) => {
        // Thiết lập timeout để hủy upload nếu quá lâu (60 giây)
        const timeoutId = setTimeout(() => {
          if (uploadProgress < 100) {
            setUploadStatus('Tải lên quá thời gian. Vui lòng thử lại.');
            setIsUploading(false);
            reject(new Error('Upload timeout'));
          }
        }, 60000);
        
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Cập nhật tiến trình
            const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            setUploadProgress(progress);
            setUploadStatus(`Đang tải lên: ${progress}%`);
            
            // Cập nhật trạng thái dựa trên tốc độ
            if (snapshot.state === 'running') {
              // Tính tốc độ tải lên
              const transferred = snapshot.bytesTransferred;
              const total = snapshot.totalBytes;
              if (transferred > 0 && progress < 100) {
                // Hiển thị thông tin về lượng dữ liệu đã tải
                setUploadStatus(`Đang tải lên: ${progress}% (${Math.round(transferred / 1024)}KB/${Math.round(total / 1024)}KB)`);
              }
            }
          },
          (error) => {
            // Xử lý lỗi upload
            clearTimeout(timeoutId);
            console.error('Lỗi khi upload hình ảnh:', error);
            
            // Phân loại lỗi
            let errorMessage = 'Tải lên thất bại. ';
            if (error.code === 'storage/unauthorized') {
              errorMessage += 'Bạn không có quyền tải lên ảnh này.';
            } else if (error.code === 'storage/canceled') {
              errorMessage += 'Tải lên đã bị hủy.';
            } else if (error.code === 'storage/unknown') {
              errorMessage += 'Đã xảy ra lỗi không xác định.';
            } else if (error.code === 'storage/retry-limit-exceeded') {
              errorMessage += 'Kết nối không ổn định, vui lòng thử lại.';
            }
            
            setUploadStatus(errorMessage);
            setIsUploading(false);
            reject(error);
          },
          async () => {
            // Upload hoàn thành
            clearTimeout(timeoutId);
            setUploadStatus('Đã tải lên thành công! Đang lấy URL...');
            
            try {
              console.log('Upload hoàn tất, lấy download URL...');
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              console.log('Đã nhận được URL:', downloadURL);
              setUploadStatus('Đã tải lên và nhận URL thành công!');
              setIsUploading(false);
              resolve(downloadURL);
            } catch (urlError) {
              console.error('Lỗi khi lấy URL tải về:', urlError);
              setUploadStatus('Không thể lấy URL của ảnh.');
              setIsUploading(false);
              reject(urlError);
            }
          }
        );
      });
    } catch (error) {
      console.error('Lỗi khi bắt đầu upload:', error);
      setUploadStatus('Không thể bắt đầu quá trình tải lên.');
      setIsUploading(false);
      return null;
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError('Bạn cần đăng nhập để thêm sân');
      return;
    }
    
    if (!courtData.name || !courtData.address || !courtData.price) {
      setError('Vui lòng điền đầy đủ các thông tin bắt buộc');
      return;
    }
    
    if (connectionStatus === 'offline') {
      setError('Không có kết nối internet. Vui lòng kiểm tra kết nối của bạn và thử lại.');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Chuyển đổi facilities từ chuỗi thành mảng
      const facilitiesArray = courtData.facilities
        ? courtData.facilities.split(',').map(item => item.trim())
        : [];
      
      // Chuyển đổi price từ chuỗi thành số
      const priceNumber = parseInt(courtData.price, 10);
      
      // Dữ liệu sân để lưu vào Firestore
      const courtToSave = {
        name: courtData.name,
        address: courtData.address,
        description: courtData.description,
        sport: courtData.sport,
        price: priceNumber,
        openTime: courtData.openTime,
        closeTime: courtData.closeTime,
        facilities: facilitiesArray,
        status: courtData.isAvailable ? 'active' : 'inactive',
        ownerId: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        // Luôn đặt URL ảnh mặc định ban đầu
        image: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?q=80&w=800&auto=format&fit=crop'
      };
      
      // Upload hình ảnh nếu có
      let imageURL = null;
      if (compressedImage) {
        try {
          console.log('Bắt đầu tải lên ảnh...');
          imageURL = await uploadImage(compressedImage);
          console.log('Đã nhận URL ảnh sau khi upload:', imageURL);
          
          if (imageURL) {
            // Chỉ cập nhật nếu có URL hợp lệ
            courtToSave.image = imageURL;
            console.log('Đã cập nhật URL ảnh vào dữ liệu sân:', imageURL);
          } else {
            console.warn('Không nhận được URL ảnh, sử dụng ảnh mặc định');
          }
        } catch (imageError) {
          console.error('Lỗi khi upload hình ảnh:', imageError);
          setError('Có lỗi khi tải lên hình ảnh, nhưng sân vẫn sẽ được tạo với ảnh mặc định');
        }
      } else {
        console.log('Không có ảnh được chọn, sử dụng ảnh mặc định');
      }
      
      console.log('Lưu dữ liệu sân vào Firestore:', courtToSave);
      
      // Lưu vào collection "courts" trong Firestore
      const docRef = await addDoc(collection(db, 'courts'), courtToSave);
      console.log('Đã thêm sân thành công với ID:', docRef.id);
      
      // Xác nhận URL ảnh cuối cùng được lưu trong db
      console.log('URL ảnh cuối cùng được lưu vào DB:', courtToSave.image);
      
      setSuccess(true);
      
      // Đợi 1 giây rồi chuyển về trang quản lý sân
      setTimeout(() => {
        navigate('/owner/courts');
      }, 1000);
    } catch (error) {
      console.error('Lỗi khi thêm sân:', error);
      setError('Có lỗi xảy ra khi thêm sân. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Thêm sân thể thao mới
        </Typography>
      </Box>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {connectionStatus === 'offline' && 
        <Alert severity="warning" sx={{ mb: 2 }}>
          Bạn đang ngoại tuyến. Một số tính năng có thể không hoạt động.
        </Alert>
      }
      
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <SportsSoccerIcon sx={{ mr: 1 }} /> Thông tin cơ bản
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tên sân"
                name="name"
                value={courtData.name}
                onChange={handleChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Loại sân"
                name="sport"
                value={courtData.sport}
                onChange={handleChange}
                required
              >
                <MenuItem value="football">Sân bóng đá</MenuItem>
                <MenuItem value="basketball">Sân bóng rổ</MenuItem>
                <MenuItem value="tennis">Sân tennis</MenuItem>
                <MenuItem value="badminton">Sân cầu lông</MenuItem>
                <MenuItem value="volleyball">Sân bóng chuyền</MenuItem>
              </TextField>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Địa chỉ"
                name="address"
                value={courtData.address}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOnIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mô tả"
                name="description"
                value={courtData.description}
                onChange={handleChange}
                multiline
                rows={3}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                <ImageIcon sx={{ mr: 1 }} /> Hình ảnh sân
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px dashed #ccc', borderRadius: 2, p: 2 }}>
                {imagePreview ? (
                  <Box sx={{ mb: 2, width: '100%', position: 'relative' }}>
                    <Box sx={{ maxHeight: '200px', overflow: 'hidden', borderRadius: 1 }}>
                      <img 
                        src={imagePreview} 
                        alt="Xem trước hình ảnh sân" 
                        style={{ width: '100%', objectFit: 'cover', maxHeight: '200px' }} 
                      />
                    </Box>
                    <IconButton 
                      sx={{ position: 'absolute', top: 5, right: 5, bgcolor: 'rgba(0,0,0,0.5)' }}
                      onClick={handleRemoveImage}
                      disabled={isUploading}
                    >
                      <DeleteIcon sx={{ color: 'white' }} />
                    </IconButton>
                    
                    {isUploading && (
                      <Box sx={{ width: '100%', mt: 1 }}>
                        <LinearProgress variant="determinate" value={uploadProgress} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                          <Typography variant="caption" sx={{ flex: 1 }}>
                            {uploadStatus}
                          </Typography>
                          {uploadProgress < 100 && uploadProgress > 0 && uploadStatus.includes('thất bại') && (
                            <Tooltip title="Thử tải lên lại">
                              <IconButton 
                                size="small" 
                                color="primary" 
                                onClick={handleRetryUpload}
                              >
                                <RefreshIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Box sx={{ 
                    mb: 2, 
                    width: '100%', 
                    height: '150px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    bgcolor: '#f5f5f5',
                    borderRadius: 1
                  }}>
                    <Typography color="text.secondary">Chưa có hình ảnh</Typography>
                  </Box>
                )}
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<AddPhotoAlternateIcon />}
                    disabled={isUploading}
                  >
                    Tải lên hình ảnh
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </Button>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  Định dạng: JPG, PNG, GIF. Kích thước tối đa: 5MB
                </Typography>
                {compressedImage && (
                  <Typography variant="caption" color="success.main" sx={{ mt: 0.5 }}>
                    Ảnh đã được tối ưu hóa để tải lên nhanh hơn
                  </Typography>
                )}
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <AccessTimeIcon sx={{ mr: 1 }} /> Giờ hoạt động và giá
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Giá thuê (VNĐ/giờ)"
                name="price"
                type="number"
                value={courtData.price}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MoneyIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Giờ mở cửa"
                name="openTime"
                type="time"
                value={courtData.openTime}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  step: 300, // 5 min
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Giờ đóng cửa"
                name="closeTime"
                type="time"
                value={courtData.closeTime}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  step: 300, // 5 min
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tiện ích (phân cách bởi dấu phẩy)"
                name="facilities"
                value={courtData.facilities}
                onChange={handleChange}
                placeholder="Ví dụ: Đèn chiếu sáng, Nhà vệ sinh, Nước uống, Wifi"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={courtData.isAvailable}
                    onChange={handleChange}
                    name="isAvailable"
                    color="success"
                  />
                }
                label="Sân đang hoạt động"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={() => navigate('/owner/courts')}
                  disabled={loading || isUploading}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={loading ? <CircularProgress size={24} /> : <SaveIcon />}
                  disabled={loading || isUploading}
                >
                  {loading ? 'Đang lưu...' : 'Lưu và thêm sân'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
      
      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Đã thêm sân thành công!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddCourt; 