import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Campaign as CampaignIcon
} from '@mui/icons-material';

const AdvertisementManagement = () => {
  const [advertisements, setAdvertisements] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    link: '',
    targetRole: 'all',
    status: 'active',
    startDate: '',
    endDate: ''
  });

  // Mock data cho demo
  useEffect(() => {
    setAdvertisements([
      {
        id: 1,
        title: 'Khóa học IELTS chất lượng cao',
        description: 'Cam kết đầu ra 6.5+ với đội ngũ giáo viên kinh nghiệm',
        imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=200&h=100&fit=crop',
        link: '/courses/ielts',
        targetRole: 'student',
        status: 'active',
        views: 1250,
        clicks: 87,
        startDate: '2025-06-01',
        endDate: '2025-12-31'
      },
      {
        id: 2,
        title: 'Lớp Tiếng Anh Giao Tiếp',
        description: 'Phát triển kỹ năng giao tiếp tự tin với phương pháp hiện đại',
        imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=200&h=100&fit=crop',
        link: '/courses/speaking',
        targetRole: 'all',
        status: 'active',
        views: 890,
        clicks: 65,
        startDate: '2025-06-15',
        endDate: '2025-09-30'
      },
      {
        id: 3,
        title: 'Chương trình học thiếu nhi',
        description: 'Khóa học Tiếng Anh dành cho trẻ em với phương pháp vui nhộn',
        imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=200&h=100&fit=crop',
        link: '/courses/kids',
        targetRole: 'parent',
        status: 'paused',
        views: 645,
        clicks: 34,
        startDate: '2025-05-01',
        endDate: '2025-08-31'
      }
    ]);
  }, []);

  const handleOpenDialog = (ad = null) => {
    if (ad) {
      setEditingAd(ad);
      setFormData({
        title: ad.title,
        description: ad.description,
        imageUrl: ad.imageUrl,
        link: ad.link,
        targetRole: ad.targetRole,
        status: ad.status,
        startDate: ad.startDate,
        endDate: ad.endDate
      });
    } else {
      setEditingAd(null);
      setFormData({
        title: '',
        description: '',
        imageUrl: '',
        link: '',
        targetRole: 'all',
        status: 'active',
        startDate: '',
        endDate: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAd(null);
  };

  const handleSaveAd = () => {
    if (editingAd) {
      // Update existing ad
      setAdvertisements(prev => prev.map(ad => 
        ad.id === editingAd.id 
          ? { ...ad, ...formData }
          : ad
      ));
    } else {
      // Create new ad
      const newAd = {
        id: Date.now(),
        ...formData,
        views: 0,
        clicks: 0
      };
      setAdvertisements(prev => [...prev, newAd]);
    }
    handleCloseDialog();
  };

  const handleDeleteAd = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa quảng cáo này?')) {
      setAdvertisements(prev => prev.filter(ad => ad.id !== id));
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setAdvertisements(prev => prev.map(ad => 
      ad.id === id ? { ...ad, status: newStatus } : ad
    ));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'paused': return 'warning';
      case 'expired': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'Đang chạy';
      case 'paused': return 'Tạm dừng';
      case 'expired': return 'Hết hạn';
      default: return status;
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Quản trị viên';
      case 'teacher': return 'Giáo viên';
      case 'student': return 'Học sinh';
      case 'parent': return 'Phụ huynh';
      case 'all': return 'Tất cả';
      default: return role;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          <CampaignIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Quản lý Quảng cáo
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Tạo quảng cáo mới
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Tổng quảng cáo
              </Typography>
              <Typography variant="h4" color="primary">
                {advertisements.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Đang hoạt động
              </Typography>
              <Typography variant="h4" color="success.main">
                {advertisements.filter(ad => ad.status === 'active').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Tổng lượt xem
              </Typography>
              <Typography variant="h4" color="info.main">
                {advertisements.reduce((sum, ad) => sum + ad.views, 0).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Tổng lượt click
              </Typography>
              <Typography variant="h4" color="warning.main">
                {advertisements.reduce((sum, ad) => sum + ad.clicks, 0).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Advertisements Table */}
      <Card>
        <CardContent>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Hình ảnh</TableCell>
                  <TableCell>Tiêu đề</TableCell>
                  <TableCell>Đối tượng</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Lượt xem</TableCell>
                  <TableCell>Lượt click</TableCell>
                  <TableCell>Thời gian</TableCell>
                  <TableCell>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {advertisements.map((ad) => (
                  <TableRow key={ad.id}>
                    <TableCell>
                      <Avatar
                        src={ad.imageUrl}
                        alt={ad.title}
                        variant="rounded"
                        sx={{ width: 60, height: 40 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {ad.title}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {ad.description.substring(0, 50)}...
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getRoleLabel(ad.targetRole)}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(ad.status)}
                        size="small"
                        color={getStatusColor(ad.status)}
                      />
                    </TableCell>
                    <TableCell>{ad.views.toLocaleString()}</TableCell>
                    <TableCell>
                      {ad.clicks.toLocaleString()}
                      <Typography variant="caption" display="block" color="textSecondary">
                        CTR: {ad.views > 0 ? ((ad.clicks / ad.views) * 100).toFixed(1) : 0}%
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" display="block">
                        {ad.startDate} - {ad.endDate}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(ad)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteAd(ad.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingAd ? 'Chỉnh sửa quảng cáo' : 'Tạo quảng cáo mới'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tiêu đề"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Mô tả"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="URL hình ảnh"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Liên kết"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Đối tượng"
                value={formData.targetRole}
                onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="student">Học sinh</MenuItem>
                <MenuItem value="parent">Phụ huynh</MenuItem>
                <MenuItem value="teacher">Giáo viên</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Trạng thái"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <MenuItem value="active">Đang chạy</MenuItem>
                <MenuItem value="paused">Tạm dừng</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Ngày bắt đầu"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Ngày kết thúc"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button 
            onClick={handleSaveAd} 
            variant="contained"
            disabled={!formData.title || !formData.description}
          >
            {editingAd ? 'Cập nhật' : 'Tạo mới'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdvertisementManagement;
