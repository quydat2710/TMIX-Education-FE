import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  Alert,
  CircularProgress,
  FormControl,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Lock as LockIcon,
  VerifiedUser as VerifiedUserIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Wc as GenderIcon,
  AdminPanelSettings as AdminIcon,
  Shield as ShieldIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserAPI } from '../../services/users';
import { validateUserUpdate } from '../../validations/commonValidation';
import { commonStyles } from '../../utils/styles';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { AvatarUpload, ChangePasswordDialog, VerifyEmailDialog } from '../../components/common';

interface UserUpdateData {
  name: string;
  email: string;
  phone: string;
  gender: string;
  address: string;
}

interface UserUpdateErrors {
  name?: string;
  email?: string;
  phone?: string;
  gender?: string;
  address?: string;
}

const AdminProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [verifyEmailOpen, setVerifyEmailOpen] = useState(false);

  const [formData, setFormData] = useState<UserUpdateData>({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    gender: user?.gender || '',
    address: user?.address || '',
  });

  const [errors, setErrors] = useState<UserUpdateErrors>({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        gender: user.gender || '',
        address: user.address || '',
      });
    }
  }, [user]);

  const handleInputChange = (field: keyof UserUpdateData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Validate form data
      const validationErrors = validateUserUpdate(formData);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      if (!user?.id) {
        setError('Không tìm thấy thông tin người dùng');
        return;
      }

      const response = await updateUserAPI(user.id, formData);

      if (response.data) {
        // Update local user data
        updateUser({
          ...user,
          ...formData,
          gender: formData.gender as 'male' | 'female' | undefined,
        });

        setSuccess('Cập nhật thông tin thành công!');
        setIsEditing(false);
      } else {
        setError('Có lỗi xảy ra khi cập nhật thông tin');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      gender: user?.gender || '',
      address: user?.address || '',
    });
    setErrors({});
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Chưa cập nhật';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  if (!user) {
    return (
      <DashboardLayout role="admin">
        <Box sx={commonStyles.pageContainer}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <Box sx={commonStyles.pageHeader}>
            <Typography sx={commonStyles.pageTitle}>
              Trang cá nhân
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Left Panel - Profile Summary */}
            <Grid item xs={12} md={4}>
              <Card sx={{
                height: 'fit-content',
                borderRadius: 4,
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                overflow: 'hidden',
                transition: 'box-shadow 0.3s ease',
                '&:hover': { boxShadow: '0 8px 32px rgba(0,0,0,0.12)' },
              }}>
                {/* Gradient Cover Banner */}
                <Box sx={{
                  height: 100,
                  background: 'linear-gradient(135deg, #D32F2F 0%, #b71c1c 30%, #1E3A5F 100%)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: -30,
                    right: -30,
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255,255,255,0.08)',
                  },
                }} />
                <CardContent sx={{ p: 4, textAlign: 'center', mt: -8 }}>
                  {/* Profile Picture with gradient ring */}
                  <Box sx={{
                    mb: 2,
                    display: 'inline-flex',
                    p: '4px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #D32F2F, #ff6b6b, #1E3A5F, #fbbf24)',
                    boxShadow: '0 4px 20px rgba(211,47,47,0.3)',
                    '@keyframes subtlePulse': {
                      '0%, 100%': { boxShadow: '0 4px 20px rgba(211,47,47,0.3)' },
                      '50%': { boxShadow: '0 4px 28px rgba(211,47,47,0.45)' },
                    },
                    animation: 'subtlePulse 3s ease-in-out infinite',
                  }}>
                    <Box sx={{ borderRadius: '50%', border: '3px solid #fff', position: 'relative' }}>
                      <AvatarUpload
                        currentAvatar={user.avatar}
                        userName={user.name}
                        size={160}
                        onAvatarUpdate={(newAvatarUrl) => {
                          console.log('Avatar updated:', newAvatarUrl);
                        }}
                      />
                    </Box>
                  </Box>

                  {/* User Name */}
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b', mb: 0.5 }}>
                    {user.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                    <ShieldIcon sx={{ fontSize: 16, color: '#D32F2F' }} />
                    <Typography variant="body2" sx={{ color: '#94a3b8', fontWeight: 500 }}>
                      Quản trị viên
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Right Panel - Profile Details */}
            <Grid item xs={12} md={8}>
              <Card sx={{
                borderRadius: 4,
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                transition: 'box-shadow 0.3s ease',
                '&:hover': { boxShadow: '0 8px 32px rgba(0,0,0,0.12)' },
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#1e293b' }}>
                    Thông tin cá nhân
                  </Typography>
                  <Grid container spacing={3}>
                    {/* Left Column */}
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <PersonIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                            Họ và tên
                          </Typography>
                        </Box>
                        {isEditing ? (
                          <TextField
                            fullWidth
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            error={!!errors.name}
                            helperText={errors.name}
                            size="small"
                          />
                        ) : (
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {user.name}
                          </Typography>
                        )}
                      </Box>

                      <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <HomeIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                            Địa chỉ
                          </Typography>
                        </Box>
                        {isEditing ? (
                          <TextField
                            fullWidth
                            value={formData.address}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                            error={!!errors.address}
                            helperText={errors.address}
                            size="small"
                          />
                        ) : (
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {user.address || 'Chưa cập nhật'}
                          </Typography>
                        )}
                      </Box>

                      <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <VerifiedUserIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                            Trạng thái xác thực email
                          </Typography>
                        </Box>
                        <Chip
                          label={user.isEmailVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                          color={user.isEmailVerified ? 'success' : 'warning'}
                          size="small"
                          icon={<VerifiedUserIcon />}
                        />
                      </Box>

                      <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <AdminIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                            Vai trò
                          </Typography>
                        </Box>
                        <Chip
                          label="Quản trị viên"
                          size="small"
                          sx={{
                            bgcolor: '#fef2f2',
                            color: '#D32F2F',
                            fontWeight: 600,
                            border: '1px solid #fecaca',
                          }}
                        />
                      </Box>
                    </Grid>

                    {/* Right Column */}
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <EmailIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                            Email
                          </Typography>
                        </Box>
                        <TextField
                          fullWidth
                          value={user.email}
                          size="small"
                          InputProps={{ readOnly: true }}
                        />
                      </Box>

                      <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <PhoneIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                            Số điện thoại
                          </Typography>
                        </Box>
                        {isEditing ? (
                          <TextField
                            fullWidth
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            error={!!errors.phone}
                            helperText={errors.phone}
                            size="small"
                          />
                        ) : (
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {user.phone || 'Chưa cập nhật'}
                          </Typography>
                        )}
                      </Box>

                      <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <GenderIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                            Giới tính
                          </Typography>
                        </Box>
                        {isEditing ? (
                          <FormControl fullWidth size="small">
                            <Select
                              value={formData.gender}
                              onChange={(e) => handleInputChange('gender', e.target.value)}
                              error={!!errors.gender}
                            >
                              <MenuItem value="male">Nam</MenuItem>
                              <MenuItem value="female">Nữ</MenuItem>
                              <MenuItem value="other">Khác</MenuItem>
                            </Select>
                          </FormControl>
                        ) : (
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {user.gender === 'male' ? 'Nam' : user.gender === 'female' ? 'Nữ' : 'Khác'}
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', gap: 2, mt: 4, flexWrap: 'wrap' }}>
                    <Button
                      variant="outlined"
                      startIcon={<LockIcon />}
                      onClick={() => setChangePasswordOpen(true)}
                      sx={{
                        borderRadius: 2,
                        px: 3,
                        py: 1,
                        borderColor: '#3b82f6',
                        color: '#3b82f6',
                        '&:hover': {
                          borderColor: '#2563eb',
                          bgcolor: '#eff6ff'
                        }
                      }}
                    >
                      Đổi mật khẩu
                    </Button>

                    {!user.isEmailVerified && (
                      <Button
                        variant="outlined"
                        startIcon={<VerifiedUserIcon />}
                        onClick={() => setVerifyEmailOpen(true)}
                        sx={{
                          borderRadius: 2,
                          px: 3,
                          py: 1,
                          borderColor: '#3b82f6',
                          color: '#3b82f6',
                          '&:hover': {
                            borderColor: '#2563eb',
                            bgcolor: '#eff6ff'
                          }
                        }}
                      >
                        Xác thực email
                      </Button>
                    )}

                    {!isEditing ? (
                      <Button
                        variant="contained"
                        startIcon={<EditIcon />}
                        onClick={() => setIsEditing(true)}
                        sx={{
                          borderRadius: 2,
                          px: 3,
                          py: 1,
                          background: 'linear-gradient(135deg, #D32F2F 0%, #1E3A5F 100%)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #b71c1c 0%, #152c4a 100%)',
                          }
                        }}
                      >
                        Chỉnh sửa
                      </Button>
                    ) : (
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                          variant="outlined"
                          startIcon={<CancelIcon />}
                          onClick={handleCancel}
                          disabled={loading}
                          sx={{
                            borderRadius: 2,
                            px: 3,
                            py: 1,
                            borderColor: '#64748b',
                            color: '#64748b',
                            '&:hover': {
                              borderColor: '#475569',
                              bgcolor: '#f1f5f9'
                            }
                          }}
                        >
                          Hủy
                        </Button>
                        <Button
                          variant="contained"
                          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                          onClick={handleSave}
                          disabled={loading}
                          sx={{
                            borderRadius: 2,
                            px: 3,
                            py: 1,
                            background: 'linear-gradient(135deg, #D32F2F 0%, #1E3A5F 100%)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #b71c1c 0%, #152c4a 100%)',
                            }
                          }}
                        >
                          {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </Button>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>

      <ChangePasswordDialog
        open={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />

      <VerifyEmailDialog
        open={verifyEmailOpen}
        onClose={() => setVerifyEmailOpen(false)}
        userEmail={user?.email || ''}
        onSuccess={() => {
          updateUser({ ...user, isEmailVerified: true });
        }}
      />
    </DashboardLayout>
  );
};

export default AdminProfile;
