import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  CircularProgress,
  Grid,
  Paper,
  IconButton
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import { Student } from '../../../types';
import {
  validateName,
  validateEmail,
  validatePhone,

  validateAddress,
  validateGender,
  validateDiscountCode,
  validatePassword
} from '../../../validations/commonValidation';
import { createStudentAPI, updateStudentAPI } from '../../../services/students';

interface StudentFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (result: { success: boolean; message?: string }) => void;
  student?: Student | null;
  loading?: boolean;
}

interface FormData {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
}

const StudentForm: React.FC<StudentFormProps> = ({
  open,
  onClose,
  onSubmit,
  student,
  loading: externalLoading = false
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: 'male'
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [classEdits, setClassEdits] = useState<Array<{ classId?: string; className: string; discountPercent: number; status: 'active' | 'completed'; }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || student.userId?.name || '',
        email: student.email || student.userId?.email || '',
        password: '',
        phone: student.phone || student.userId?.phone || '',
        address: student.address || student.userId?.address || '',
        dateOfBirth: student.dayOfBirth ? new Date(student.dayOfBirth).toISOString().split('T')[0] :
                     student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : '',
        gender: student.gender || 'male'
      });
      const mapped = (student.classes || []).map((cls: any, index: number) => ({
        classId: cls.class?.id || cls.classId?.id || cls.classId,
        className: cls.class?.name || cls.classId?.name || cls.name ||
                  (cls.class?.grade && cls.class?.section ? `${cls.class.grade}.${cls.class.section}` : '') ||
                  (cls.classId?.grade && cls.classId?.section ? `${cls.classId.grade}.${cls.classId.section}` : '') ||
                  `Lớp ${index + 1}`,
        discountPercent: Number(cls.discountPercent || cls.discount || 0),
        status: (cls.status as 'active' | 'completed') ?? 'active'
      }));
      setClassEdits(mapped);
    } else {
      resetForm();
    }
  }, [student, open]);

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      address: '',
      dateOfBirth: '',
      gender: 'male'
    });
    setErrors({});
    setClassEdits([]);
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleClassChange = (index: number, field: 'discountPercent' | 'status', value: any) => {
    setClassEdits(prev => prev.map((item, i) => i === index ? { ...item, [field]: field === 'discountPercent' ? Number(value) : value } : item));
  };

  const validateDateOfBirth = (dateStr: string): string => {
    if (!dateStr) return 'Ngày sinh không được để trống';

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Ngày sinh không hợp lệ';

    const today = new Date();
    if (date >= today) return 'Ngày sinh phải nhỏ hơn ngày hiện tại';

    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 3);
    if (date > minDate) return 'Học sinh phải ít nhất 3 tuổi';

    return '';
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const nameError = validateName(formData.name);
    if (nameError) newErrors.name = nameError;

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    if (!student) {
      const passwordError = validatePassword(formData.password);
      if (passwordError) newErrors.password = passwordError;
    }

    const phoneError = validatePhone(formData.phone);
    if (phoneError) newErrors.phone = phoneError;

    const addressError = validateAddress(formData.address);
    if (addressError) newErrors.address = addressError;

    const dobError = validateDateOfBirth(formData.dateOfBirth);
    if (dobError) newErrors.dateOfBirth = dobError;

    const genderError = validateGender(formData.gender);
    if (genderError) newErrors.gender = genderError;

    for (let i = 0; i < classEdits.length; i++) {
      const discountError = validateDiscountCode(classEdits[i].discountPercent);
      if (discountError) {
        newErrors.address = newErrors.address || `Lỗi giảm giá lớp ${classEdits[i].className}: ${discountError}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const payload = student?.id
        ? {
            userData: {
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              dayOfBirth: formData.dateOfBirth,
              gender: formData.gender,
              address: formData.address,
            },
            studentData: classEdits.map(edit => ({
              classId: edit.classId,
              status: edit.status,
              discountPercent: edit.discountPercent || 0
            }))
          }
        : {
            email: formData.email,
            password: formData.password,
            name: formData.name,
            dayOfBirth: formData.dateOfBirth,
            phone: formData.phone,
            address: formData.address,
            gender: formData.gender
          };

      if (student?.id) {
        await updateStudentAPI(student.id, payload as any);
      } else {
        await createStudentAPI(payload as any);
      }

      if (onSubmit) {
        onSubmit({ success: true, message: student?.id ? 'Cập nhật học sinh thành công!' : 'Thêm học sinh thành công!' });
      }

      resetForm();
      onClose();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi lưu học sinh';
      if (onSubmit) {
        onSubmit({ success: false, message: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const renderSectionHeader = (title: string, icon: React.ReactNode) => (
    <Typography variant="h6" sx={{
      color: '#1E3A5F',
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      gap: 1.2,
      mb: 3
    }}>
      <Box sx={{ display: 'flex', color: '#D32F2F' }}>
        {icon}
      </Box>
      {title}
    </Typography>
  );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          boxShadow: '0 20px 60px rgba(30, 58, 95, 0.15)',
          overflow: 'hidden',
          bgcolor: '#f8fafc',
        }
      }}
    >
      <DialogTitle sx={{
        background: 'linear-gradient(135deg, #D32F2F 0%, #1E3A5F 100%)',
        color: 'white',
        py: 3,
        px: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, letterSpacing: '-0.5px' }}>
            {student ? 'Chỉnh sửa thông tin học sinh' : 'Thêm học sinh mới'}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.85, fontWeight: 500 }}>
            {student ? 'Cập nhật thông tin học sinh' : 'Nhập thông tin học sinh mới'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{
            bgcolor: 'rgba(255,255,255,0.15)',
            borderRadius: 3,
            p: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 1
          }}>
            {student ? <EditIcon sx={{ fontSize: 24, color: 'white' }} /> : <AddIcon sx={{ fontSize: 24, color: 'white' }} />}
          </Box>
          <IconButton 
            onClick={handleClose}
            sx={{ 
              color: 'white',
              bgcolor: 'rgba(255,255,255,0.1)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: { xs: 3, md: 4 }, display: 'flex', flexDirection: 'column', gap: 3.5 }}>
          {/* Section 1: Personal Info */}
          <Paper sx={{ 
            p: 3.5, 
            borderRadius: 3, 
            bgcolor: 'white', 
            border: '1px solid #f1f5f9',
            boxShadow: '0 4px 20px rgba(30, 58, 95, 0.02)'
          }}>
            {renderSectionHeader('Thông tin học sinh', <PersonIcon />)}
            
            <Grid container spacing={3}>
              {/* Họ tên */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Họ và tên"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  error={!!errors.name}
                  helperText={errors.name}
                  required
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
                />
              </Grid>

              {/* Email */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  error={!!errors.email}
                  helperText={errors.email}
                  required
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
                />
              </Grid>

              {/* Mật khẩu */}
              {!student && (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Mật khẩu"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    error={!!errors.password}
                    helperText={errors.password || 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm cả chữ và số'}
                    required
                    InputProps={{
                      sx: { borderRadius: 2 }
                    }}
                  />
                </Grid>
              )}

              {/* Số điện thoại */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Số điện thoại"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  error={!!errors.phone}
                  helperText={errors.phone}
                  required
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
                />
              </Grid>

              {/* Ngày sinh */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Ngày sinh"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  error={!!errors.dateOfBirth}
                  helperText={errors.dateOfBirth}
                  InputLabelProps={{ shrink: true }}
                  required
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
                />
              </Grid>

              {/* Giới tính */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required error={!!errors.gender}>
                  <InputLabel>Giới tính</InputLabel>
                  <Select
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    label="Giới tính"
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="male">Nam</MenuItem>
                    <MenuItem value="female">Nữ</MenuItem>
                  </Select>
                  {errors.gender && (
                    <Typography variant="caption" color="error" mt={0.5} display="block">
                      {errors.gender}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Địa chỉ */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Địa chỉ"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  error={!!errors.address}
                  helperText={errors.address}
                  required
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Section 2: Classes edit (when editing student) */}
          {student && (
            <Paper sx={{ 
              p: 3.5, 
              borderRadius: 3, 
              bgcolor: 'white', 
              border: '1px solid #f1f5f9',
              boxShadow: '0 4px 20px rgba(30, 58, 95, 0.02)'
            }}>
              {renderSectionHeader('Danh sách lớp đang học', <SchoolIcon />)}
              
              <Grid container spacing={3}>
                {classEdits.map((item, idx) => (
                  <Grid item xs={12} key={idx}>
                    <Paper variant="outlined" sx={{
                      p: 2.5,
                      borderRadius: 3,
                      bgcolor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderLeft: '4px solid #1E3A5F'
                    }}>
                      <Grid container spacing={2.5} alignItems="center">
                        <Grid item xs={12} md={4}>
                          <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 700, letterSpacing: '0.5px', display: 'block', mb: 0.5 }}>
                            TÊN LỚP HỌC
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 700, color: '#1E3A5F' }}>
                            {item.className}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={4}>
                          <TextField
                            fullWidth
                            label="Giảm giá (%)"
                            type="number"
                            value={item.discountPercent}
                            onChange={(e) => handleClassChange(idx, 'discountPercent', e.target.value)}
                            InputProps={{
                              sx: { borderRadius: 2 },
                              inputProps: { min: 0, max: 100 }
                            }}
                          />
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControl fullWidth>
                            <InputLabel>Trạng thái</InputLabel>
                            <Select
                              value={item.status}
                              label="Trạng thái"
                              onChange={(e) => handleClassChange(idx, 'status', e.target.value as any)}
                              sx={{ borderRadius: 2 }}
                            >
                              <MenuItem value="active">Đang học</MenuItem>
                              <MenuItem value="completed">Đã hoàn thành</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                ))}
                
                {classEdits.length === 0 && (
                  <Grid item xs={12}>
                    <Box sx={{ py: 3, textAlign: 'center' }}>
                      <Typography color="textSecondary" sx={{ fontStyle: 'italic', fontWeight: 500 }}>
                        Học sinh này chưa đăng ký lớp học nào.
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Paper>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, px: 4, bgcolor: '#f8fafc', borderTop: '1px solid #f1f5f9', gap: 2 }}>
        <Button
          onClick={handleClose}
          startIcon={<CancelIcon />}
          variant="outlined"
          disabled={loading || externalLoading}
          sx={{
            px: 3,
            py: 1.25,
            borderRadius: 2.5,
            textTransform: 'none',
            fontWeight: 600,
            borderColor: '#cbd5e1',
            color: '#64748b',
            '&:hover': {
              borderColor: '#94a3b8',
              bgcolor: '#f1f5f9',
            },
            transition: 'all 0.2s'
          }}
        >
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          startIcon={(loading || externalLoading) ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <SaveIcon />}
          variant="contained"
          disabled={loading || externalLoading}
          sx={{
            px: 3.5,
            py: 1.25,
            borderRadius: 2.5,
            textTransform: 'none',
            fontWeight: 700,
            bgcolor: '#D32F2F',
            color: 'white',
            boxShadow: '0 4px 12px rgba(211, 47, 47, 0.2)',
            '&:hover': {
              bgcolor: '#b91c1c',
              boxShadow: '0 6px 16px rgba(211, 47, 47, 0.3)',
            },
            transition: 'all 0.2s'
          }}
        >
          {(loading || externalLoading) ? 'Đang lưu...' : (student ? 'Cập nhật' : 'Thêm mới')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StudentForm;
