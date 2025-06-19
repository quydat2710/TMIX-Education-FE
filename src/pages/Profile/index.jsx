import React, { useState, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Avatar,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment
} from '@mui/material';
import {
  Edit as EditIcon,
  PhotoCamera as PhotoCameraIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { COLORS } from '../../utils/colors';
import { commonStyles } from '../../utils/styles';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    dayOfBirth: user?.dayOfBirth || '',
    avatar: user?.avatar || '',
  });
  const [avatarPreview, setAvatarPreview] = useState(profileData.avatar);
  const [avatarFile, setAvatarFile] = useState(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef();

  // Handle avatar upload
  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAvatarPreview(ev.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle info edit
  const handleEdit = () => {
    setIsEditing(true);
    setSuccess('');
    setError('');
  };
  const handleCancel = () => {
    setIsEditing(false);
    setProfileData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      dayOfBirth: user?.dayOfBirth || '',
      avatar: user?.avatar || '',
    });
    setAvatarPreview(user?.avatar || '');
    setAvatarFile(null);
    setSuccess('');
    setError('');
  };
  const handleSave = () => {
    setIsEditing(false);
    setSuccess('Cập nhật thông tin thành công!');
    setError('');
    // Nếu có avatar mới, cập nhật luôn
    if (avatarFile) {
      setProfileData((prev) => ({ ...prev, avatar: avatarPreview }));
    }
    // TODO: Gọi API cập nhật nếu cần
  };

  // Handle password change
  const handleOpenPasswordDialog = () => {
    setShowPasswordDialog(true);
    setPasswordData({ current: '', new: '', confirm: '' });
    setError('');
    setSuccess('');
  };
  const handleClosePasswordDialog = () => {
    setShowPasswordDialog(false);
    setPasswordData({ current: '', new: '', confirm: '' });
    setError('');
    setSuccess('');
  };
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };
  const handleToggleShowPassword = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };
  const handleChangePassword = () => {
    if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    if (passwordData.new !== passwordData.confirm) {
      setError('Mật khẩu mới không khớp');
      return;
    }
    setSuccess('Đổi mật khẩu thành công!');
    setError('');
    setShowPasswordDialog(false);
    // TODO: Gọi API đổi mật khẩu nếu cần
  };

  return (
    <DashboardLayout role={user?.role || 'student'}>
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <Typography sx={commonStyles.pageTitle}>Trang cá nhân</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <Avatar
                    src={avatarPreview}
                    sx={{ width: 150, height: 150, mb: 2, border: '4px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', cursor: isEditing ? 'pointer' : 'default' }}
                    onClick={isEditing ? handleAvatarClick : undefined}
                  >
                    {!avatarPreview && profileData.name.charAt(0)}
                  </Avatar>
                  {isEditing && (
                    <IconButton
                      sx={{ position: 'absolute', bottom: 10, right: 10, bgcolor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', '&:hover': { bgcolor: 'white' } }}
                      onClick={handleAvatarClick}
                    >
                      <PhotoCameraIcon />
                    </IconButton>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                  />
                </Box>
                <Typography variant="h6" sx={{ mb: 1 }}>{profileData.name}</Typography>
                <Typography color="textSecondary">{profileData.email}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Họ và tên"
                      value={profileData.name}
                      disabled={!isEditing}
                      onChange={e => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      sx={commonStyles.formField}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={profileData.email}
                      disabled
                      sx={commonStyles.formField}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Số điện thoại"
                      value={profileData.phone}
                      disabled={!isEditing}
                      onChange={e => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      sx={commonStyles.formField}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Ngày sinh"
                      type="date"
                      value={profileData.dayOfBirth}
                      disabled={!isEditing}
                      InputLabelProps={{ shrink: true }}
                      onChange={e => setProfileData(prev => ({ ...prev, dayOfBirth: e.target.value }))}
                      sx={commonStyles.formField}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Địa chỉ"
                      value={profileData.address}
                      disabled={!isEditing}
                      onChange={e => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                      sx={commonStyles.formField}
                    />
                  </Grid>
                </Grid>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                  {!isEditing ? (
                    <>
                      <Button variant="outlined" onClick={handleOpenPasswordDialog} startIcon={<LockIcon />}>
                        Đổi mật khẩu
                      </Button>
                      <Button variant="contained" onClick={handleEdit} startIcon={<EditIcon />}>
                        Chỉnh sửa
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outlined" color="error" onClick={handleCancel} startIcon={<CancelIcon />}>Hủy</Button>
                      <Button variant="contained" color="primary" onClick={handleSave} startIcon={<SaveIcon />}>Lưu</Button>
                    </>
                  )}
                </Box>
                {success && <Typography color="success.main" sx={{ mt: 2 }}>{success}</Typography>}
                {error && <Typography color="error.main" sx={{ mt: 2 }}>{error}</Typography>}
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
      {/* Đổi mật khẩu dialog */}
      <Dialog open={showPasswordDialog} onClose={handleClosePasswordDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Đổi mật khẩu</DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            label="Mật khẩu hiện tại"
            name="current"
            type={showPassword.current ? 'text' : 'password'}
            value={passwordData.current}
            onChange={handlePasswordChange}
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => handleToggleShowPassword('current')} edge="end">
                    {showPassword.current ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <TextField
            margin="normal"
            label="Mật khẩu mới"
            name="new"
            type={showPassword.new ? 'text' : 'password'}
            value={passwordData.new}
            onChange={handlePasswordChange}
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => handleToggleShowPassword('new')} edge="end">
                    {showPassword.new ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <TextField
            margin="normal"
            label="Xác nhận mật khẩu mới"
            name="confirm"
            type={showPassword.confirm ? 'text' : 'password'}
            value={passwordData.confirm}
            onChange={handlePasswordChange}
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => handleToggleShowPassword('confirm')} edge="end">
                    {showPassword.confirm ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          {error && <Typography color="error.main" sx={{ mt: 1 }}>{error}</Typography>}
          {success && <Typography color="success.main" sx={{ mt: 1 }}>{success}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePasswordDialog}>Hủy</Button>
          <Button variant="contained" onClick={handleChangePassword}>Đổi mật khẩu</Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
};

export default Profile;
