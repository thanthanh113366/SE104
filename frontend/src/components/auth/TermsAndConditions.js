import React from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const TermsAndConditions = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ mt: 4, p: 4, borderRadius: 2 }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
          >
            Quay lại
          </Button>
          <Typography variant="h4" component="h1" align="center" sx={{ flex: 1 }}>
            Điều khoản và Chính sách
          </Typography>
          <Box sx={{ width: 100 }}></Box>
        </Box>

        <Divider sx={{ mb: 4 }} />

        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          1. Điều khoản sử dụng
        </Typography>
        <Typography paragraph>
          Khi sử dụng dịch vụ của chúng tôi, bạn đồng ý tuân thủ những điều khoản và điều kiện sau đây. 
          Vui lòng đọc kỹ các điều khoản này trước khi sử dụng dịch vụ.
        </Typography>

        <Typography paragraph>
          Dịch vụ của chúng tôi cung cấp nền tảng kết nối giữa chủ sân thể thao và người thuê sân. 
          Chúng tôi không chịu trách nhiệm trực tiếp về chất lượng sân và các dịch vụ liên quan.
        </Typography>

        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mt: 3 }}>
          2. Quy định về đăng ký và sử dụng tài khoản
        </Typography>

        <Typography paragraph>
          <strong>2.1 Đăng ký tài khoản:</strong> Khi đăng ký tài khoản, bạn phải cung cấp thông tin chính xác, 
          đầy đủ và cập nhật nhất. Việc cung cấp thông tin sai lệch có thể dẫn đến việc tài khoản bị đình chỉ hoặc chấm dứt.
        </Typography>

        <Typography paragraph>
          <strong>2.2 Bảo mật tài khoản:</strong> Bạn chịu trách nhiệm duy trì tính bảo mật của tài khoản và mật khẩu của mình. 
          Bạn phải thông báo cho chúng tôi ngay lập tức nếu phát hiện bất kỳ vi phạm bảo mật nào đối với tài khoản của bạn.
        </Typography>

        <Typography paragraph>
          <strong>2.3 Sử dụng tài khoản:</strong> Mỗi người dùng chỉ được phép tạo và sử dụng một tài khoản. 
          Việc sử dụng nhiều tài khoản hoặc chia sẻ tài khoản là vi phạm điều khoản sử dụng.
        </Typography>

        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mt: 3 }}>
          3. Chính sách bảo mật
        </Typography>

        <Typography paragraph>
          <strong>3.1 Thu thập thông tin:</strong> Chúng tôi thu thập và xử lý dữ liệu cá nhân của bạn, bao gồm họ tên, 
          địa chỉ email, số điện thoại và một số thông tin khác khi bạn đăng ký và sử dụng dịch vụ của chúng tôi.
        </Typography>

        <Typography paragraph>
          <strong>3.2 Sử dụng thông tin:</strong> Chúng tôi sử dụng thông tin của bạn để cung cấp và cải thiện dịch vụ, 
          liên lạc với bạn, và đảm bảo an toàn cho tài khoản của bạn.
        </Typography>

        <Typography paragraph>
          <strong>3.3 Bảo vệ thông tin:</strong> Chúng tôi áp dụng các biện pháp bảo mật để bảo vệ thông tin cá nhân của bạn 
          khỏi truy cập trái phép, sửa đổi, tiết lộ hoặc phá hủy.
        </Typography>

        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mt: 3 }}>
          4. Quy định đặt sân và thanh toán
        </Typography>

        <Typography paragraph>
          <strong>4.1 Đặt sân:</strong> Việc đặt sân phải được thực hiện trước thời gian sử dụng ít nhất 1 giờ. 
          Bạn có thể đặt sân tối đa 7 ngày trước.
        </Typography>

        <Typography paragraph>
          <strong>4.2 Hủy đặt sân:</strong> Bạn có thể hủy đặt sân trước thời gian sử dụng ít nhất 3 giờ để được hoàn tiền 100%. 
          Hủy trước 1-3 giờ được hoàn 50%. Hủy trong vòng 1 giờ trước khi sử dụng sẽ không được hoàn tiền.
        </Typography>

        <Typography paragraph>
          <strong>4.3 Thanh toán:</strong> Chúng tôi chấp nhận thanh toán qua nhiều phương thức khác nhau bao gồm 
          thẻ tín dụng, ví điện tử và chuyển khoản ngân hàng.
        </Typography>

        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mt: 3 }}>
          5. Quyền và Trách nhiệm
        </Typography>

        <Typography paragraph>
          <strong>5.1 Quyền của chủ sân:</strong> Chủ sân có quyền từ chối phục vụ nếu người thuê vi phạm quy định 
          của sân hoặc có hành vi không phù hợp.
        </Typography>

        <Typography paragraph>
          <strong>5.2 Trách nhiệm của người thuê:</strong> Người thuê sân phải tuân thủ các quy định của sân, 
          bảo quản cơ sở vật chất và bồi thường nếu gây ra thiệt hại.
        </Typography>

        <Typography paragraph>
          <strong>5.3 Trách nhiệm của nền tảng:</strong> Chúng tôi có trách nhiệm duy trì hệ thống ổn định, 
          xử lý tranh chấp giữa các bên và bảo vệ thông tin người dùng.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="body2" color="text.secondary" align="center">
          Bằng việc đăng ký và sử dụng dịch vụ, bạn xác nhận đã đọc, hiểu và đồng ý với toàn bộ điều khoản và chính sách của chúng tôi.
          Chúng tôi có quyền thay đổi các điều khoản này mà không cần thông báo trước. Việc tiếp tục sử dụng dịch vụ sau khi
          các thay đổi được công bố đồng nghĩa với việc bạn chấp nhận những thay đổi đó.
        </Typography>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            onClick={() => navigate(-1)}
          >
            Tôi đã đọc và đồng ý
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default TermsAndConditions; 