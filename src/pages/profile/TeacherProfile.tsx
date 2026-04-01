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
  Cake as CakeIcon,
  Home as HomeIcon,
  Wc as GenderIcon,
  School as SchoolIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserAPI } from '../../services/users';
import { updateTeacherAPI } from '../../services/teachers';
import { validateUserUpdate } from '../../validations/commonValidation';
import { validateTeacherUpdate } from '../../validations/teacherValidation';
import { commonStyles } from '../../utils/styles';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { AvatarUpload, ChangePasswordDialog, VerifyEmailDialog } from '../../components/common';

interface UserUpdateData {
  name: string;
  email: string;
  phone: string;
  gender: string;
  address: string;
  dayOfBirth: string;
}

interface TeacherUpdateData {
  description: string;
  isActive: boolean;
}

interface UserUpdateErrors {
  name?: string;
  email?: string;
  phone?: string;
  gender?: string;
  address?: string;
  dayOfBirth?: string;
}

interface TeacherUpdateErrors {
  description?: string;
}

const TeacherProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [verifyEmailOpen, setVerifyEmailOpen] = useState(false);

  const [userFormData, setUserFormData] = useState<UserUpdateData>({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    gender: user?.gender || '',
    address: user?.address || '',
    dayOfBirth: user?.dayOfBirth ? user.dayOfBirth.split('T')[0] : '',
  });

  const [teacherFormData, setTeacherFormData] = useState<TeacherUpdateData>({
    description: user?.teacher?.description || '',
    isActive: user?.teacher?.isActive ?? true,
  });

  const [userErrors, setUserErrors] = useState<UserUpdateErrors>({});
  const [teacherErrors, setTeacherErrors] = useState<TeacherUpdateErrors>({});

  useEffect(() => {
    if (user) {
      setUserFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        gender: user.gender || '',
        address: user.address || '',
        dayOfBirth: user.dayOfBirth ? user.dayOfBirth.split('T')[0] : '',
      });

      setTeacherFormData({
        description: user.teacher?.description || '',
        isActive: user.teacher?.isActive ?? true,
      });
    }
  }, [user]);

  const handleUserInputChange = (field: keyof UserUpdateData, value: string) => {
    setUserFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    if (userErrors[field]) {
      setUserErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleTeacherInputChange = (field: keyof TeacherUpdateData, value: string | boolean) => {
    setTeacherFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    if (teacherErrors[field as keyof TeacherUpdateErrors]) {
      setTeacherErrors(prev => ({
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

      // Validate user data
      const userValidationErrors = validateUserUpdate(userFormData);
      if (Object.keys(userValidationErrors).length > 0) {
        setUserErrors(userValidationErrors);
        return;
      }

      // Validate teacher data
      const teacherValidationErrors = validateTeacherUpdate(teacherFormData);
      if (Object.keys(teacherValidationErrors).length > 0) {
        setTeacherErrors(teacherValidationErrors);
        return;
      }

      if (!user?.id) {
        setError('Không tìm thấy thông tin người dùng');
        return;
      }

      // Update user data
      const userResponse = await updateUserAPI(user.id, userFormData);

      // Update teacher data if user update is successful
      if (userResponse.data && user.teacher?.id) {
        await updateTeacherAPI(user.teacher.id, {
          description: teacherFormData.description,
          isActive: teacherFormData.isActive,
        });
      }

      // Update local user data
      updateUser({
        ...user,
        ...userFormData,
        dayOfBirth: userFormData.dayOfBirth,
        gender: userFormData.gender as 'male' | 'female' | undefined,
        teacher: {
          ...user.teacher,
          description: teacherFormData.description,
          isActive: teacherFormData.isActive,
        } as any,
      });

      setSuccess('Cập nhật thông tin thành công!');
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setUserFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      gender: user?.gender || '',
      address: user?.address || '',
      dayOfBirth: user?.dayOfBirth ? user.dayOfBirth.split('T')[0] : '',
    });

    setTeacherFormData({
      description: user?.teacher?.description || '',
      isActive: user?.teacher?.isActive ?? true,
    });

    setUserErrors({});
    setTeacherErrors({});
    setIsEditing(false);
  };

  if (!user) {
    return (
      <DashboardLayout role="teacher">
        <Box sx={commonStyles.pageContainer}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="teacher">
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
                  background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 50%, #1a237e 100%)',
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
                    background: 'linear-gradient(135deg, #1565c0, #42a5f5, #1a237e, #00bcd4)',
                    boxShadow: '0 4px 20px rgba(21,101,192,0.3)',
                    '@keyframes subtlePulseBlue': {
                      '0%, 100%': { boxShadow: '0 4px 20px rgba(21,101,192,0.3)' },
                      '50%': { boxShadow: '0 4px 28px rgba(21,101,192,0.45)' },
                    },
                    animation: 'subtlePulseBlue 3s ease-in-out infinite',
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
                    <SchoolIcon sx={{ fontSize: 16, color: '#1565c0' }} />
                    <Typography variant="body2" sx={{ color: '#94a3b8', fontWeight: 500 }}>
                      Giáo viên
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
                            value={userFormData.name}
                            onChange={(e) => handleUserInputChange('name', e.target.value)}
                            error={!!userErrors.name}
                            helperText={userErrors.name}
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
                          <PhoneIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                            Số điện thoại
                          </Typography>
                        </Box>
                        {isEditing ? (
                          <TextField
                            fullWidth
                            value={userFormData.phone}
                            onChange={(e) => handleUserInputChange('phone', e.target.value)}
                            error={!!userErrors.phone}
                            helperText={userErrors.phone}
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
                              value={userFormData.gender}
                              onChange={(e) => handleUserInputChange('gender', e.target.value)}
                              error={!!userErrors.gender}
                            >
                              <MenuItem value="male">Nam</MenuItem>
                              <MenuItem value="female">Nữ</MenuItem>
                              <MenuItem value="other">Khác</MenuItem>
                            </Select>
                          </FormControl>
                        ) : (
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {userFormData.gender === 'male'
                              ? 'Nam'
                              : userFormData.gender === 'female'
                              ? 'Nữ'
                              : 'Khác'}
                          </Typography>
                        )}
                      </Box>

                      <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <CheckCircleIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                            Trạng thái hoạt động
                          </Typography>
                        </Box>
                        {isEditing ? (
                          <FormControl fullWidth size="small">
                            <Select
                              value={teacherFormData.isActive}
                              onChange={(e) => handleTeacherInputChange('isActive', e.target.value === 'true')}
                            >
                              <MenuItem value="true">Đang hoạt động</MenuItem>
                              <MenuItem value="false">Tạm ngưng</MenuItem>
                            </Select>
                          </FormControl>
                        ) : (
                          <Chip
                            label={teacherFormData.isActive ? 'Đang hoạt động' : 'Tạm ngưng'}
                            color={teacherFormData.isActive ? 'success' : 'default'}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        )}
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
                          <CakeIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                            Ngày sinh
                          </Typography>
                        </Box>
                        {isEditing ? (
                          <TextField
                            fullWidth
                            type="date"
                            value={userFormData.dayOfBirth}
                            onChange={(e) => handleUserInputChange('dayOfBirth', e.target.value)}
                            error={!!userErrors.dayOfBirth}
                            helperText={userErrors.dayOfBirth}
                            size="small"
                            InputLabelProps={{ shrink: true }}
                          />
                        ) : (
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {userFormData.dayOfBirth
                              ? new Date(userFormData.dayOfBirth).toLocaleDateString('vi-VN')
                              : 'Chưa cập nhật'}
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
                            value={userFormData.address}
                            onChange={(e) => handleUserInputChange('address', e.target.value)}
                            error={!!userErrors.address}
                            helperText={userErrors.address}
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
                    </Grid>

                    {/* Teacher Specific Fields - Full Width */}
                    <Grid item xs={12}>
                      <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <DescriptionIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                            Mô tả
                          </Typography>
                        </Box>
                        {isEditing ? (
                          <TextField
                            fullWidth
                            multiline
                            rows={4}
                            value={teacherFormData.description}
                            onChange={(e) => handleTeacherInputChange('description', e.target.value)}
                            error={!!teacherErrors.description}
                            helperText={teacherErrors.description}
                            size="small"
                            placeholder="Mô tả về kinh nghiệm giảng dạy, chuyên môn..."
                          />
                        ) : (
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {user.teacher?.description || 'Chưa cập nhật'}
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
                          background: 'linear-gradient(135deg, #1565c0 0%, #1a237e 100%)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #0d47a1 0%, #0d1b5e 100%)',
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
                            background: 'linear-gradient(135deg, #1565c0 0%, #1a237e 100%)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #0d47a1 0%, #0d1b5e 100%)',
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

export default TeacherProfile;
