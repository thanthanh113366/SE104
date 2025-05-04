import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Tabs, 
  Tab, 
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  TextField,
  Button,
  IconButton,
  Chip,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Stack
} from '@mui/material';

// Icons
import PersonIcon from '@mui/icons-material/Person';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CloseIcon from '@mui/icons-material/Close';

// Dữ liệu mẫu cho các ticket hỗ trợ
const SAMPLE_TICKETS = [
  {
    id: 'ticket1',
    customerId: 'user1',
    customerName: 'Nguyễn Văn A',
    customerEmail: 'nguyenvana@example.com',
    customerPhone: '0901234567',
    subject: 'Vấn đề khi đặt sân online',
    status: 'pending',
    priority: 'high',
    createdAt: '15/05/2023 09:30',
    lastUpdated: '15/05/2023 14:20',
    category: 'booking',
    messages: [
      {
        id: 'msg1',
        senderId: 'user1',
        senderName: 'Nguyễn Văn A',
        isOwner: false,
        message: 'Tôi không thể đặt sân online cho ngày mai. Hệ thống báo lỗi "Không thể xử lý thanh toán".',
        timestamp: '15/05/2023 09:30'
      },
      {
        id: 'msg2',
        senderId: 'owner1',
        senderName: 'Quản trị viên',
        isOwner: true,
        message: 'Chào anh/chị, cảm ơn đã liên hệ với chúng tôi. Hiện tại hệ thống thanh toán đang gặp sự cố. Anh/chị có thể đặt sân qua số điện thoại của chúng tôi không ạ?',
        timestamp: '15/05/2023 10:15'
      },
      {
        id: 'msg3',
        senderId: 'user1',
        senderName: 'Nguyễn Văn A',
        isOwner: false,
        message: 'Vâng, số điện thoại đặt sân là gì vậy?',
        timestamp: '15/05/2023 14:20'
      }
    ]
  },
  {
    id: 'ticket2',
    customerId: 'user2',
    customerName: 'Trần Thị B',
    customerEmail: 'tranthib@example.com',
    customerPhone: '0912345678',
    subject: 'Yêu cầu hủy đặt sân và hoàn tiền',
    status: 'open',
    priority: 'medium',
    createdAt: '14/05/2023 16:45',
    lastUpdated: '14/05/2023 16:45',
    category: 'refund',
    messages: [
      {
        id: 'msg1',
        senderId: 'user2',
        senderName: 'Trần Thị B',
        isOwner: false,
        message: 'Tôi đã đặt sân bóng đá Mini cho ngày 16/05/2023 từ 18:00-20:00 nhưng do có việc đột xuất nên không thể tham gia. Tôi muốn hủy đặt sân và yêu cầu hoàn tiền. Mã đặt sân là B12345.',
        timestamp: '14/05/2023 16:45'
      }
    ]
  },
  {
    id: 'ticket3',
    customerId: 'user3',
    customerName: 'Lê Văn C',
    customerEmail: 'levanc@example.com',
    customerPhone: '0923456789',
    subject: 'Đánh giá và phản hồi về chất lượng sân',
    status: 'closed',
    priority: 'low',
    createdAt: '10/05/2023 08:15',
    lastUpdated: '12/05/2023 11:30',
    category: 'feedback',
    messages: [
      {
        id: 'msg1',
        senderId: 'user3',
        senderName: 'Lê Văn C',
        isOwner: false,
        message: 'Tôi vừa sử dụng sân tennis của quý công ty và rất hài lòng về chất lượng sân. Tuy nhiên, phòng thay đồ cần được vệ sinh thường xuyên hơn.',
        timestamp: '10/05/2023 08:15'
      },
      {
        id: 'msg2',
        senderId: 'owner1',
        senderName: 'Quản trị viên',
        isOwner: true,
        message: 'Cảm ơn anh/chị đã phản hồi. Chúng tôi rất vui khi anh/chị hài lòng về chất lượng sân. Về vấn đề phòng thay đồ, chúng tôi sẽ nhắc nhở nhân viên vệ sinh thường xuyên hơn. Mong anh/chị tiếp tục ủng hộ.',
        timestamp: '10/05/2023 10:20'
      },
      {
        id: 'msg3',
        senderId: 'user3',
        senderName: 'Lê Văn C',
        isOwner: false,
        message: 'Cảm ơn quý công ty đã phản hồi nhanh chóng.',
        timestamp: '11/05/2023 14:45'
      },
      {
        id: 'msg4',
        senderId: 'owner1',
        senderName: 'Quản trị viên',
        isOwner: true,
        message: 'Không có gì ạ. Chúng tôi luôn sẵn sàng lắng nghe góp ý từ khách hàng để cải thiện dịch vụ ngày càng tốt hơn.',
        timestamp: '12/05/2023 11:30'
      }
    ]
  },
  {
    id: 'ticket4',
    customerId: 'user4',
    customerName: 'Phạm Văn D',
    customerEmail: 'phamvand@example.com',
    customerPhone: '0934567890',
    subject: 'Câu hỏi về giá thuê sân dịp lễ',
    status: 'pending',
    priority: 'medium',
    createdAt: '13/05/2023 19:20',
    lastUpdated: '14/05/2023 09:45',
    category: 'inquiry',
    messages: [
      {
        id: 'msg1',
        senderId: 'user4',
        senderName: 'Phạm Văn D',
        isOwner: false,
        message: 'Chào ban quản lý, tôi muốn hỏi về giá thuê sân bóng đá vào dịp lễ 2/9 sắp tới. Giá có thay đổi không và tôi có thể đặt trước từ bây giờ không?',
        timestamp: '13/05/2023 19:20'
      },
      {
        id: 'msg2',
        senderId: 'owner1',
        senderName: 'Quản trị viên',
        isOwner: true,
        message: 'Chào anh/chị, trong dịp lễ 2/9, giá thuê sân sẽ tăng thêm 20% so với ngày thường. Anh/chị có thể đặt trước từ bây giờ thông qua hệ thống đặt sân online hoặc qua số điện thoại của chúng tôi.',
        timestamp: '14/05/2023 09:45'
      }
    ]
  }
];

const Support = () => {
  const [tickets, setTickets] = useState(SAMPLE_TICKETS);
  const [tabValue, setTabValue] = useState(0);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  
  // Xử lý thay đổi tab
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Xử lý khi chọn ticket
  const handleSelectTicket = (ticket) => {
    setSelectedTicket(ticket);
  };
  
  // Xử lý gửi phản hồi
  const handleSendReply = () => {
    if (!replyMessage.trim()) return;
    
    const newMessage = {
      id: `msg${selectedTicket.messages.length + 1}`,
      senderId: 'owner1',
      senderName: 'Quản trị viên',
      isOwner: true,
      message: replyMessage,
      timestamp: new Date().toLocaleString('vi-VN', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
    
    // Cập nhật danh sách tin nhắn
    const updatedTickets = tickets.map(ticket => {
      if (ticket.id === selectedTicket.id) {
        return {
          ...ticket,
          messages: [...ticket.messages, newMessage],
          lastUpdated: newMessage.timestamp,
          status: ticket.status === 'pending' ? 'open' : ticket.status
        };
      }
      return ticket;
    });
    
    // Cập nhật state
    setTickets(updatedTickets);
    setSelectedTicket({
      ...selectedTicket,
      messages: [...selectedTicket.messages, newMessage],
      lastUpdated: newMessage.timestamp,
      status: selectedTicket.status === 'pending' ? 'open' : selectedTicket.status
    });
    setReplyMessage('');
  };
  
  // Mở dialog xác nhận đóng ticket
  const handleOpenCloseDialog = () => {
    setCloseDialogOpen(true);
  };
  
  // Đóng dialog xác nhận đóng ticket
  const handleCloseDialog = () => {
    setCloseDialogOpen(false);
  };
  
  // Xử lý đóng ticket
  const handleCloseTicket = () => {
    const updatedTickets = tickets.map(ticket => {
      if (ticket.id === selectedTicket.id) {
        return { ...ticket, status: 'closed' };
      }
      return ticket;
    });
    
    setTickets(updatedTickets);
    setSelectedTicket({ ...selectedTicket, status: 'closed' });
    setCloseDialogOpen(false);
  };
  
  // Lọc tickets dựa trên tab hiện tại
  const filteredTickets = tickets.filter(ticket => {
    if (tabValue === 0) return ticket.status === 'pending';
    if (tabValue === 1) return ticket.status === 'open';
    if (tabValue === 2) return ticket.status === 'closed';
    return true; // Tab 3: All
  });
  
  // Hiển thị chip trạng thái
  const getStatusChip = (status) => {
    switch (status) {
      case 'pending':
        return <Chip size="small" color="warning" label="Chờ xử lý" icon={<PendingIcon />} />;
      case 'open':
        return <Chip size="small" color="info" label="Đang xử lý" icon={<AccessTimeIcon />} />;
      case 'closed':
        return <Chip size="small" color="success" label="Đã giải quyết" icon={<CheckCircleIcon />} />;
      default:
        return <Chip size="small" label={status} />;
    }
  };
  
  // Hiển thị chip mức độ ưu tiên
  const getPriorityChip = (priority) => {
    switch (priority) {
      case 'high':
        return <Chip size="small" color="error" label="Cao" />;
      case 'medium':
        return <Chip size="small" color="warning" label="Trung bình" />;
      case 'low':
        return <Chip size="small" color="success" label="Thấp" />;
      default:
        return <Chip size="small" label={priority} />;
    }
  };
  
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Phản hồi & Hỗ trợ
      </Typography>
      
      <Grid container spacing={3}>
        {/* Danh sách ticket */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ borderRadius: 2, overflow: 'hidden', height: 'calc(100vh - 180px)', display: 'flex', flexDirection: 'column' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab 
                label={
                  <Badge badgeContent={tickets.filter(t => t.status === 'pending').length} color="error">
                    Chờ xử lý
                  </Badge>
                } 
              />
              <Tab 
                label={
                  <Badge badgeContent={tickets.filter(t => t.status === 'open').length} color="primary">
                    Đang xử lý
                  </Badge>
                } 
              />
              <Tab label="Đã giải quyết" />
              <Tab label="Tất cả" />
            </Tabs>
            
            <List sx={{ overflow: 'auto', flexGrow: 1 }}>
              {filteredTickets.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    Không có yêu cầu hỗ trợ nào
                  </Typography>
                </Box>
              ) : (
                filteredTickets.map((ticket) => (
                  <React.Fragment key={ticket.id}>
                    <ListItem 
                      alignItems="flex-start" 
                      button
                      selected={selectedTicket?.id === ticket.id}
                      onClick={() => handleSelectTicket(ticket)}
                      sx={{ 
                        backgroundColor: ticket.status === 'pending' && 
                                        !selectedTicket?.id !== ticket.id ? 
                                        'action.hover' : 'inherit'
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle2" noWrap sx={{ maxWidth: '150px' }}>
                              {ticket.customerName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {ticket.lastUpdated.split(' ')[0]}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <React.Fragment>
                            <Typography
                              variant="body2"
                              noWrap
                              sx={{ display: 'block', maxWidth: '200px' }}
                            >
                              {ticket.subject}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                              {getStatusChip(ticket.status)}
                              {getPriorityChip(ticket.priority)}
                            </Box>
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))
              )}
            </List>
          </Paper>
        </Grid>
        
        {/* Chi tiết ticket */}
        <Grid item xs={12} md={8}>
          {selectedTicket ? (
            <Paper sx={{ borderRadius: 2, height: 'calc(100vh - 180px)', display: 'flex', flexDirection: 'column' }}>
              {/* Header */}
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6">
                    {selectedTicket.subject}
                  </Typography>
                  <Box>
                    {getStatusChip(selectedTicket.status)}
                    {selectedTicket.status !== 'closed' && (
                      <Button 
                        variant="outlined" 
                        color="error" 
                        size="small" 
                        sx={{ ml: 1 }}
                        onClick={handleOpenCloseDialog}
                      >
                        Đóng ticket
                      </Button>
                    )}
                  </Box>
                </Box>
                
                <Grid container spacing={1}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PersonIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {selectedTicket.customerName}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {selectedTicket.customerEmail}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {selectedTicket.customerPhone}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        Tạo lúc: {selectedTicket.createdAt}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
              
              {/* Tin nhắn */}
              <Box sx={{ p: 2, flexGrow: 1, overflow: 'auto' }}>
                {selectedTicket.messages.map((message) => (
                  <Box 
                    key={message.id} 
                    sx={{ 
                      display: 'flex', 
                      flexDirection: message.isOwner ? 'row-reverse' : 'row',
                      mb: 2
                    }}
                  >
                    <Avatar sx={{ bgcolor: message.isOwner ? 'primary.main' : 'secondary.main', mr: message.isOwner ? 0 : 1, ml: message.isOwner ? 1 : 0 }}>
                      {message.isOwner ? <SupportAgentIcon /> : <PersonIcon />}
                    </Avatar>
                    <Box 
                      sx={{ 
                        backgroundColor: message.isOwner ? 'primary.light' : 'grey.100',
                        p: 2,
                        borderRadius: 2,
                        maxWidth: '80%'
                      }}
                    >
                      <Typography variant="subtitle2">
                        {message.senderName}
                        <Typography variant="caption" sx={{ ml: 1 }}>
                          {message.timestamp}
                        </Typography>
                      </Typography>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                        {message.message}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
              
              {/* Phần phản hồi */}
              {selectedTicket.status !== 'closed' && (
                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Nhập phản hồi của bạn..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <IconButton disabled>
                            <AttachFileIcon />
                          </IconButton>
                          <Button 
                            variant="contained" 
                            endIcon={<SendIcon />}
                            onClick={handleSendReply}
                            disabled={!replyMessage.trim()}
                          >
                            Gửi
                          </Button>
                        </Box>
                      )
                    }}
                  />
                </Box>
              )}
            </Paper>
          ) : (
            <Paper sx={{ 
              borderRadius: 2, 
              height: 'calc(100vh - 180px)', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              p: 3
            }}>
              <Box sx={{ textAlign: 'center' }}>
                <SupportAgentIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Chọn một yêu cầu hỗ trợ để xem chi tiết
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Từ đây bạn có thể phản hồi và quản lý các yêu cầu hỗ trợ từ khách hàng
                </Typography>
              </Box>
            </Paper>
          )}
        </Grid>
      </Grid>
      
      {/* Dialog xác nhận đóng ticket */}
      <Dialog
        open={closeDialogOpen}
        onClose={handleCloseDialog}
      >
        <DialogTitle>Xác nhận đóng ticket</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn đóng ticket này không? Ticket sẽ được đánh dấu là đã giải quyết và chuyển vào mục đã giải quyết.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleCloseTicket} variant="contained" color="primary">
            Đóng ticket
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Support; 