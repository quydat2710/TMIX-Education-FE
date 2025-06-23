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
  Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { commonStyles } from '../../utils/styles';
import {
  getAllAnnouncementsAPI,
  createAnnouncementAPI,
  updateAnnouncementAPI,
  deleteAnnouncementAPI
} from '../../services/api';

const AdvertisementManagement = () => {
  const [advertisements, setAdvertisements] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    image: null,
    displayType: 'banner',
    priority: 1
  });

  // Lấy danh sách quảng cáo từ API
  useEffect(() => {
    fetchAdvertisements();
  }, []);

  const fetchAdvertisements = async () => {
    try {
      const res = await getAllAnnouncementsAPI();
      setAdvertisements(res.data || []);
    } catch (err) {
      console.error('Lỗi lấy danh sách quảng cáo:', err);
    }
  };

  const handleOpenDialog = (ad = null) => {
    if (ad) {
      setEditingAd(ad);
      setFormData({
        title: ad.title || '',
        description: ad.description || '',
        content: ad.content || '',
        image: null,
        displayType: ad.displayType || 'banner',
        priority: ad.priority || 1
      });
    } else {
      setEditingAd(null);
      setFormData({
        title: '',
        description: '',
        content: '',
        image: null,
        displayType: 'banner',
        priority: 1
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAd(null);
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleSaveAd = async () => {
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('content', formData.content);
    data.append('displayType', formData.displayType);
    data.append('priority', formData.priority);
    if (formData.image) data.append('image', formData.image);

    try {
      if (editingAd) {
        await updateAnnouncementAPI(editingAd.id, data);
      } else {
        await createAnnouncementAPI(data);
      }
      fetchAdvertisements();
      handleCloseDialog();
    } catch (err) {
      alert('Có lỗi khi lưu quảng cáo!');
      console.error(err);
    }
  };

  const handleDeleteAd = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa quảng cáo này?')) {
      try {
        await deleteAnnouncementAPI(id);
        fetchAdvertisements();
      } catch (err) {
        alert('Có lỗi khi xóa quảng cáo!');
        console.error(err);
      }
    }
  };

  return (
    <DashboardLayout role="admin">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Typography variant="h4" component="h1" fontWeight="bold">
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

          {/* Advertisements Table */}
          <Card>
            <CardContent>
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Hình ảnh</TableCell>
                      <TableCell>Tiêu đề</TableCell>
                      <TableCell>Mô tả</TableCell>
                      <TableCell>Kiểu hiển thị</TableCell>
                      <TableCell>Độ ưu tiên</TableCell>
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
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="textSecondary">
                            {ad.description}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {ad.displayType === 'banner' ? 'Banner' : 'Popup'}
                        </TableCell>
                        <TableCell>
                          {ad.priority}
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
                    label="Mô tả ngắn"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={4}
                    label="Nội dung quảng cáo"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                  >
                    {formData.image ? formData.image.name : 'Chọn ảnh quảng cáo'}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleFileChange}
                    />
                  </Button>
                  {formData.image && (
                    <Box mt={1}>
                      <img
                        src={URL.createObjectURL(formData.image)}
                        alt="preview"
                        style={{ maxWidth: '100%', maxHeight: 120, borderRadius: 8 }}
                      />
                    </Box>
                  )}
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    select
                    label="Kiểu hiển thị"
                    value={formData.displayType}
                    onChange={(e) => setFormData({ ...formData, displayType: e.target.value })}
                  >
                    <MenuItem value="banner">Banner</MenuItem>
                    <MenuItem value="popup">Popup</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Độ ưu tiên"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    inputProps={{ min: 1 }}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Hủy</Button>
              <Button
                onClick={handleSaveAd}
                variant="contained"
                disabled={!formData.title || !formData.description || !formData.content}
              >
                {editingAd ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default AdvertisementManagement;
