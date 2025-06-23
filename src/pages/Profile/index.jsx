import React, { useState, useRef, useEffect } from 'react';
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
  InputAdornment,
  Chip,
  Card,
  CardContent
} from '@mui/material';
import {
  Edit as EditIcon,
  PhotoCamera as PhotoCameraIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  School as SchoolIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  FamilyRestroom as FamilyIcon
} from '@mui/icons-material';
import { COLORS } from '../../utils/colors';
import { commonStyles } from '../../utils/styles';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { changePasswordAPI, uploadAvatarAPI } from '../../services/api';

const Profile = ({ role }) => {
  const { user, updateUser } = useAuth();
  const userRole = role || user?.role || 'student';
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
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const fileInputRef = useRef();

  // Initialize profile data from user context
  useEffect(() => {
    console.log('Profile useEffect - user data:', user);
    console.log('Profile useEffect - userRole:', userRole);

    if (user) {
      const initialData = {
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        dayOfBirth: user.dayOfBirth || user.dateOfBirth || '',
        avatar: user.avatar || '',
        // Role-specific data
        studentId: user.studentId || user.id || '',
        grade: user.grade || '',
        parentName: user.parentName || '',
        parentPhone: user.parentPhone || '',
        teacherId: user.teacherId || user.id || '',
        subject: user.subject || '',
        experience: user.experience || '',
        adminId: user.id || '',
        gender: user.gender || '',
        isEmailVerified: user.isEmailVerified || false
      };
      console.log('Profile useEffect - initialData:', initialData);
      setProfileData(initialData);
      setAvatarPreview(user.avatar || '');
    } else {
      console.log('Profile useEffect - No user data found');
    }
  }, [user]);

  // Handle avatar upload
  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Vui lòng chọn file ảnh hợp lệ');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Kích thước file không được vượt quá 5MB');
        return;
      }

      setAvatarLoading(true);
      setError('');
      setSuccess('');

      try {
        // Create FormData
        const formData = new FormData();
        formData.append('image', file); // Changed back to 'image' based on Postman screenshot

        // Debug: Log FormData contents
        console.log('FormData contents:');
        for (let [key, value] of formData.entries()) {
          console.log(key, value);
        }

        // Also try logging the file details
        console.log('File details:', {
          name: file.name,
          type: file.type,
          size: file.size
        });

        // Upload avatar
        const response = await uploadAvatarAPI(formData);
        console.log('Upload response:', response);

        // Update avatar preview and profile data
        // Try different possible response formats
        const newAvatarUrl = response.data?.avatar ||
                           response.avatar ||
                           response.data?.url ||
                           response.url ||
                           response.data?.imageUrl ||
                           response.imageUrl;

        if (newAvatarUrl) {
        setAvatarPreview(newAvatarUrl);
        setProfileData(prev => ({ ...prev, avatar: newAvatarUrl }));
        setAvatarFile(null);
        setSuccess('Cập nhật avatar thành công!');

          // Update user in AuthContext
          updateUser({ avatar: newAvatarUrl });

        } else {
          console.warn('No avatar URL found in response:', response);
          setError('Không nhận được URL avatar từ server');
        }

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess('');
        }, 3000);

      } catch (err) {
        console.error('Upload avatar error:', err);
        console.error('Error response:', err.response);
        console.error('Error message:', err.message);
        console.error('Error status:', err.response?.status);

        let errorMessage = 'Upload avatar thất bại';

        if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.response?.data?.error) {
          errorMessage = err.response.data.error;
        } else if (err.response?.status === 400) {
          errorMessage = 'File không hợp lệ';
        } else if (err.response?.status === 413) {
          errorMessage = 'File quá lớn';
        } else if (err.message) {
          errorMessage = err.message;
        }

        setError(errorMessage);

        // Clear error message after 5 seconds
        setTimeout(() => {
          setError('');
        }, 5000);
      } finally {
        setAvatarLoading(false);
      }
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
    if (user) {
      const initialData = {
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        dayOfBirth: user.dayOfBirth || user.dateOfBirth || '',
        avatar: user.avatar || '',
        studentId: user.studentId || user.id || '',
        grade: user.grade || '',
        parentName: user.parentName || '',
        parentPhone: user.parentPhone || '',
        teacherId: user.teacherId || user.id || '',
        subject: user.subject || '',
        experience: user.experience || '',
        adminId: user.id || '',
        gender: user.gender || '',
        isEmailVerified: user.isEmailVerified || false
      };
      setProfileData(initialData);
      setAvatarPreview(user.avatar || '');
    }
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
  const handleChangePassword = async () => {
    if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    if (passwordData.new !== passwordData.confirm) {
      setError('Mật khẩu mới không khớp');
      return;
    }
    if (passwordData.new.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    setPasswordLoading(true);
    setError('');
    setSuccess('');

    try {
      await changePasswordAPI(passwordData.current, passwordData.new);
      setSuccess('Đổi mật khẩu thành công!');
      setPasswordData({ current: '', new: '', confirm: '' });
      setTimeout(() => {
        setShowPasswordDialog(false);
        setSuccess('');
      }, 2000);
    } catch (err) {
      console.error('Change password error:', err);
      let errorMessage = 'Đổi mật khẩu thất bại';

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 400) {
        errorMessage = 'Mật khẩu hiện tại không đúng';
      } else if (err.response?.status === 401) {
        errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <DashboardLayout role={userRole}>
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <Typography sx={commonStyles.pageTitle}>Trang cá nhân</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <Avatar
                    src={avatarPreview}
                    sx={{
                      width: 150,
                      height: 150,
                      mb: 2,
                      border: '4px solid #fff',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      cursor: !avatarLoading ? 'pointer' : 'default',
                      opacity: avatarLoading ? 0.7 : 1
                    }}
                    onClick={!avatarLoading ? handleAvatarClick : undefined}
                  >
                    {!avatarPreview && profileData.name.charAt(0)}
                  </Avatar>
                  {!avatarLoading && (
                    <IconButton
                      sx={{ position: 'absolute', bottom: 10, right: 10, bgcolor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', '&:hover': { bgcolor: 'white' } }}
                      onClick={handleAvatarClick}
                    >
                      <PhotoCameraIcon />
                    </IconButton>
                  )}
                  {avatarLoading && (
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 10,
                        right: 10,
                        bgcolor: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        borderRadius: '50%',
                        width: 40,
                        height: 40,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Typography variant="caption">...</Typography>
                    </Box>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                    disabled={avatarLoading}
                  />
                </Box>
                <Typography variant="h6" sx={{ mb: 1 }}>{profileData.name}</Typography>
                <Typography color="textSecondary" sx={{ mb: 2 }}>{profileData.email}</Typography>
                {avatarLoading && (
                  <Typography variant="caption" color="primary" sx={{ display: 'block', mb: 1 }}>
                    Đang tải lên avatar...
                  </Typography>
                )}
                {success && (
                  <Typography variant="caption" color="success.main" sx={{ display: 'block', mb: 1 }}>
                    {success}
                  </Typography>
                )}
                {error && (
                  <Typography variant="caption" color="error.main" sx={{ display: 'block', mb: 1 }}>
                    {error}
                  </Typography>
                )}
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
                  {userRole !== 'admin' && (
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
                  )}

                  {/* Role-specific fields */}
                  {userRole === 'student' && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Lớp"
                          value={profileData.grade}
                          disabled={!isEditing}
                          onChange={e => setProfileData(prev => ({ ...prev, grade: e.target.value }))}
                          sx={commonStyles.formField}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Tên phụ huynh"
                          value={profileData.parentName}
                          disabled={!isEditing}
                          onChange={e => setProfileData(prev => ({ ...prev, parentName: e.target.value }))}
                          sx={commonStyles.formField}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="SĐT phụ huynh"
                          value={profileData.parentPhone}
                          disabled={!isEditing}
                          onChange={e => setProfileData(prev => ({ ...prev, parentPhone: e.target.value }))}
                          sx={commonStyles.formField}
                        />
                      </Grid>
                    </>
                  )}

                  {userRole === 'teacher' && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Môn học"
                          value={profileData.subject}
                          disabled={!isEditing}
                          onChange={e => setProfileData(prev => ({ ...prev, subject: e.target.value }))}
                          sx={commonStyles.formField}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Kinh nghiệm (năm)"
                          value={profileData.experience}
                          disabled={!isEditing}
                          onChange={e => setProfileData(prev => ({ ...prev, experience: e.target.value }))}
                          sx={commonStyles.formField}
                        />
                      </Grid>
                    </>
                  )}

                  {userRole === 'admin' && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Giới tính"
                          value={profileData.gender === 'male' ? 'Nam' : profileData.gender === 'female' ? 'Nữ' : 'Khác'}
                          disabled
                          sx={commonStyles.formField}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Trạng thái email"
                          value={profileData.isEmailVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                          disabled
                          sx={commonStyles.formField}
                        />
                      </Grid>
                    </>
                  )}

                  {userRole === 'parent' && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Số con"
                          value={user?.children?.length || 0}
                          disabled
                          sx={commonStyles.formField}
                        />
                      </Grid>
                    </>
                  )}
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
          <Button onClick={handleClosePasswordDialog} disabled={passwordLoading}>
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleChangePassword}
            disabled={passwordLoading}
          >
            {passwordLoading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
};

export default Profile;
