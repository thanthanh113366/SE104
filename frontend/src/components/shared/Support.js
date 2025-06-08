import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Avatar,
  IconButton,
  Divider,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Alert
} from '@mui/material';

// Icons
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import FacebookIcon from '@mui/icons-material/Facebook';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LiveHelpIcon from '@mui/icons-material/LiveHelp';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import LaunchIcon from '@mui/icons-material/Launch';

const Support = () => {
  
  // Xử lý click vào thông tin liên hệ
  const handleContactClick = (type, value) => {
    switch (type) {
      case 'email':
        window.open(`mailto:${value}`, '_blank');
        break;
      case 'phone':
        window.open(`tel:${value}`, '_blank');
        break;
      case 'facebook':
        window.open(value, '_blank');
        break;
      default:
        break;
    }
  };

  // FAQ data
  const faqItems = [
    {
      question: "Làm thế nào để đặt sân?",
      answer: "Tìm sân phù hợp → Chọn khung giờ → Xác nhận thông tin → Thanh toán"
    },
    {
      question: "Tôi có thể hủy đặt sân không?",
      answer: "Có, bạn có thể hủy đặt sân trước 24 giờ. Vào phần 'Lịch đặt của tôi' để hủy."
    },
    {
      question: "Các phương thức thanh toán nào được hỗ trợ?",
      answer: "Chúng tôi hỗ trợ thanh toán tiền mặt tại sân, chuyển khoản và ví MoMo."
    },
    {
      question: "Làm thế nào để đăng ký làm chủ sân?",
      answer: "Đăng ký tài khoản → Chọn vai trò 'Chủ sân' → Thêm thông tin sân → Chờ xét duyệt."
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Avatar
          sx={{
            width: 80,
            height: 80,
            bgcolor: 'primary.main',
            mx: 'auto',
            mb: 2
          }}
        >
          <SupportAgentIcon sx={{ fontSize: 40 }} />
        </Avatar>
        <Typography variant="h4" gutterBottom>
          Hỗ trợ khách hàng
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Thông tin liên hệ */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <ContactSupportIcon sx={{ mr: 1 }} />
              Thông tin liên hệ
            </Typography>

            <List>
              {/* Email */}
              <ListItemButton
                onClick={() => handleContactClick('email', '23521689@gm.uit.edu.vn')}
                sx={{ borderRadius: 1, mb: 1 }}
              >
                <ListItemIcon>
                  <Avatar sx={{ bgcolor: 'error.main', width: 40, height: 40 }}>
                    <EmailIcon />
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary="Email hỗ trợ"
                  secondary="23521689@gm.uit.edu.vn"
                  primaryTypographyProps={{ fontWeight: 'medium' }}
                />
                <LaunchIcon color="action" />
              </ListItemButton>

              <Divider sx={{ my: 1 }} />

              {/* Số điện thoại */}
              <ListItemButton
                onClick={() => handleContactClick('phone', '0384757523')}
                sx={{ borderRadius: 1, mb: 1 }}
              >
                <ListItemIcon>
                  <Avatar sx={{ bgcolor: 'success.main', width: 40, height: 40 }}>
                    <PhoneIcon />
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary="Hotline"
                  secondary="0384757523"
                  primaryTypographyProps={{ fontWeight: 'medium' }}
                />
                <LaunchIcon color="action" />
              </ListItemButton>

              <Divider sx={{ my: 1 }} />

              {/* Facebook */}
              <ListItemButton
                onClick={() => handleContactClick('facebook', 'https://www.facebook.com/truong.ha.98943')}
                sx={{ borderRadius: 1, mb: 1 }}
              >
                <ListItemIcon>
                  <Avatar sx={{ bgcolor: '#1877f2', width: 40, height: 40 }}>
                    <FacebookIcon />
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary="Facebook"
                  secondary="@truong.ha.98943"
                  primaryTypographyProps={{ fontWeight: 'medium' }}
                />
                <LaunchIcon color="action" />
              </ListItemButton>
            </List>

            {/* Giờ hỗ trợ */}
            <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccessTimeIcon sx={{ mr: 1, fontSize: 20 }} />
                Giờ hỗ trợ
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Thứ 2 - Chủ nhật: 7:00 - 22:00<br />
                Hỗ trợ khẩn cấp: 24/7
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* FAQ */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <LiveHelpIcon sx={{ mr: 1 }} />
              Câu hỏi thường gặp
            </Typography>

            <List>
              {faqItems.map((item, index) => (
                <Box key={index}>
                  <ListItem sx={{ flexDirection: 'column', alignItems: 'flex-start', px: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <HelpOutlineIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
                      <Typography variant="subtitle2" fontWeight="medium">
                        {item.question}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 3 }}>
                      {item.answer}
                    </Typography>
                  </ListItem>
                  {index < faqItems.length - 1 && <Divider sx={{ my: 2 }} />}
                </Box>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Alert notice */}
        <Grid item xs={12}>
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Lưu ý:</strong> Để được hỗ trợ nhanh nhất, vui lòng cung cấp thông tin chi tiết về vấn đề bạn gặp phải. 
              Đội ngũ hỗ trợ của chúng tôi sẽ phản hồi trong thời gian sớm nhất.
            </Typography>
          </Alert>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Support; 