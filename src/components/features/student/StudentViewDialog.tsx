import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Cake as CakeIcon,
  Wc as GenderIcon,
  LocationOn as AddressIcon,
  FamilyRestroom as ParentIcon,
  Class as ClassIcon,
  CheckCircle as StatusIcon,
  School as SchoolIcon,
  Percent as PercentIcon,
} from '@mui/icons-material';
import { getStudentByIdAPI } from '../../../services/students';
import { Student } from '../../../types';

const formatGender = (gender?: string) => {
  return gender === 'male' ? 'Nam' : gender === 'female' ? 'Nữ' : 'Không xác định';
};

const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  } catch {
    return dateString;
  }
};

interface StudentViewDialogProps {
  open: boolean;
  onClose: () => void;
  selectedStudent: Student | null;
}

const StudentViewDialog: React.FC<StudentViewDialogProps> = ({
  open,
  onClose,
  selectedStudent,
}) => {
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudentDetails = async () => {
      if (!open || !selectedStudent?.id) {
        setStudentData(null);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await getStudentByIdAPI(selectedStudent.id);
        const payload = (response as any)?.data?.data ?? (response as any)?.data ?? response;
        if (payload) {
          const normalized: any = {
            ...payload,
            classes: Array.isArray(payload.classes) ? payload.classes : [],
          };
          setStudentData(normalized as Student);
        } else {
          setError('Không thể tải thông tin học sinh');
        }
      } catch (err: any) {
        console.error('Error fetching student details:', err);
        setError(err.response?.data?.message || 'Có lỗi xảy ra khi tải thông tin học sinh');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentDetails();
  }, [open, selectedStudent?.id]);

  const handleClose = () => {
    setStudentData(null);
    setError(null);
    onClose();
  };

  if (!selectedStudent) return null;

  const isStudentActive = studentData?.classes && studentData.classes.length > 0;

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
        justifyContent: 'space-between',
        position: 'relative'
      }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, letterSpacing: '-0.5px' }}>
            Chi tiết học sinh
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.85, fontWeight: 500 }}>
            Thông tin chi tiết về học sinh và lớp học
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
            <ViewIcon sx={{ fontSize: 24, color: 'white' }} />
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
        {loading ? (
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '350px',
            gap: 2,
            p: 4
          }}>
            <CircularProgress size={50} thickness={4} sx={{ color: '#1E3A5F' }} />
            <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500 }}>
              Đang tải dữ liệu học viên...
            </Typography>
          </Box>
        ) : error ? (
          <Box sx={{ p: 4 }}>
            <Alert severity="error" variant="outlined" sx={{ borderRadius: 3, fontWeight: 500 }}>
              {error}
            </Alert>
          </Box>
        ) : studentData ? (
        <Box sx={{ p: { xs: 3, md: 4 } }}>
          {/* Main Information Grid */}
          <Grid container spacing={3.5}>
            {/* Left Column - Personal Info */}
            <Grid item xs={12} md={6}>
              <Paper sx={{
                p: 3,
                borderRadius: 3,
                bgcolor: 'white',
                border: '1px solid #f1f5f9',
                boxShadow: '0 4px 20px rgba(30, 58, 95, 0.02)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <Typography variant="h6" sx={{
                  color: '#1E3A5F',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  mb: 3
                }}>
                  <Box sx={{
                    width: 4,
                    height: 18,
                    bgcolor: '#D32F2F',
                    borderRadius: 2
                  }} />
                  Thông tin cá nhân
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  {/* Họ và tên */}
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2, 
                    pb: 2, 
                    borderBottom: '1px dashed #f1f5f9' 
                  }}>
                    <Box sx={{ 
                      bgcolor: 'rgba(211, 47, 47, 0.08)', 
                      color: '#D32F2F', 
                      borderRadius: 2.5, 
                      p: 1, 
                      display: 'flex' 
                    }}>
                      <PersonIcon sx={{ fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, display: 'block', mb: 0.2 }}>
                        HỌ VÀ TÊN
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700, color: '#D32F2F' }}>
                        {studentData.userId?.name || studentData.name || 'Chưa cập nhật'}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Email */}
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2, 
                    pb: 2, 
                    borderBottom: '1px dashed #f1f5f9' 
                  }}>
                    <Box sx={{ 
                      bgcolor: 'rgba(30, 58, 95, 0.08)', 
                      color: '#1E3A5F', 
                      borderRadius: 2.5, 
                      p: 1, 
                      display: 'flex' 
                    }}>
                      <EmailIcon sx={{ fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, display: 'block', mb: 0.2 }}>
                        EMAIL
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: '#1E3A5F' }}>
                        {studentData.userId?.email || studentData.email || 'Chưa cập nhật'}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Số điện thoại */}
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2, 
                    pb: 2, 
                    borderBottom: '1px dashed #f1f5f9' 
                  }}>
                    <Box sx={{ 
                      bgcolor: 'rgba(0, 150, 136, 0.08)', 
                      color: '#009688', 
                      borderRadius: 2.5, 
                      p: 1, 
                      display: 'flex' 
                    }}>
                      <PhoneIcon sx={{ fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, display: 'block', mb: 0.2 }}>
                        SỐ ĐIỆN THOẠI
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: '#334155' }}>
                        {studentData.userId?.phone || studentData.phone || 'Chưa cập nhật'}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Ngày sinh */}
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2, 
                    pb: 2, 
                    borderBottom: '1px dashed #f1f5f9' 
                  }}>
                    <Box sx={{ 
                      bgcolor: 'rgba(255, 152, 0, 0.08)', 
                      color: '#ff9800', 
                      borderRadius: 2.5, 
                      p: 1, 
                      display: 'flex' 
                    }}>
                      <CakeIcon sx={{ fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, display: 'block', mb: 0.2 }}>
                        NGÀY SINH
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: '#334155' }}>
                        {formatDate(studentData.userId?.dayOfBirth || studentData.dayOfBirth) || 'Chưa cập nhật'}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Giới tính */}
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2, 
                    pb: 2, 
                    borderBottom: '1px dashed #f1f5f9' 
                  }}>
                    <Box sx={{ 
                      bgcolor: 'rgba(156, 39, 176, 0.08)', 
                      color: '#9c27b0', 
                      borderRadius: 2.5, 
                      p: 1, 
                      display: 'flex' 
                    }}>
                      <GenderIcon sx={{ fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, display: 'block', mb: 0.2 }}>
                        GIỚI TÍNH
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: '#334155' }}>
                        {formatGender(studentData.userId?.gender || studentData.gender) || 'Chưa cập nhật'}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Địa chỉ */}
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2 
                  }}>
                    <Box sx={{ 
                      bgcolor: 'rgba(63, 81, 181, 0.08)', 
                      color: '#3f51b5', 
                      borderRadius: 2.5, 
                      p: 1, 
                      display: 'flex' 
                    }}>
                      <AddressIcon sx={{ fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, display: 'block', mb: 0.2 }}>
                        ĐỊA CHỈ
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: '#334155', lineHeight: 1.4 }}>
                        {studentData.userId?.address || studentData.address || 'Chưa cập nhật'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            {/* Right Column - Family & Class Info */}
            <Grid item xs={12} md={6}>
              <Paper sx={{
                p: 3,
                borderRadius: 3,
                bgcolor: 'white',
                border: '1px solid #f1f5f9',
                boxShadow: '0 4px 20px rgba(30, 58, 95, 0.02)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <Typography variant="h6" sx={{
                  color: '#1E3A5F',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  mb: 3
                }}>
                  <Box sx={{
                    width: 4,
                    height: 18,
                    bgcolor: '#D32F2F',
                    borderRadius: 2
                  }} />
                  Thông tin học tập & gia đình
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, flexGrow: 1 }}>
                  {/* Phụ huynh */}
                  <Paper variant="outlined" sx={{
                    p: 2.5,
                    borderRadius: 3,
                    bgcolor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderLeft: '4px solid #1E3A5F',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 700, letterSpacing: '0.5px' }}>
                        THÔNG TIN PHỤ HUYNH
                      </Typography>
                      <ParentIcon sx={{ color: 'rgba(30, 58, 95, 0.15)', fontSize: 28 }} />
                    </Box>
                    
                    {studentData.parent ? (
                      <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography variant="body1" sx={{ fontWeight: 700, color: '#1E3A5F' }}>
                          {studentData.parent.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.875rem' }}>
                          Email: <strong>{studentData.parent.email}</strong>
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.875rem' }}>
                          SĐT: <strong>{studentData.parent.phone}</strong>
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{ mt: 1.5, color: '#64748b', fontWeight: 500, fontStyle: 'italic' }}>
                        Chưa có thông tin phụ huynh
                      </Typography>
                    )}
                  </Paper>

                  {/* Số lớp đang học */}
                  <Paper variant="outlined" sx={{
                    p: 2.5,
                    borderRadius: 3,
                    bgcolor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderLeft: '4px solid #7b1fa2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <Box>
                      <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 700, letterSpacing: '0.5px', display: 'block', mb: 0.5 }}>
                        SỐ LỚP ĐANG HỌC
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: '#7b1fa2' }}>
                        {studentData.classes ? studentData.classes.length : 0}
                      </Typography>
                    </Box>
                    <SchoolIcon sx={{ color: 'rgba(123, 31, 162, 0.15)', fontSize: 40 }} />
                  </Paper>

                  {/* Trạng thái học tập */}
                  <Paper variant="outlined" sx={{
                    p: 2.5,
                    borderRadius: 3,
                    bgcolor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderLeft: '4px solid #2e7d32',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <Box>
                      <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 700, letterSpacing: '0.5px', display: 'block', mb: 0.5 }}>
                        TRẠNG THÁI HỌC TẬP
                      </Typography>
                      <Chip
                        icon={<StatusIcon sx={{ fontSize: '16px !important', color: `${isStudentActive ? '#2e7d32' : '#64748b'} !important` }} />}
                        label={isStudentActive ? 'Đang học' : 'Chưa đăng ký lớp'}
                        sx={{
                          bgcolor: isStudentActive ? '#e8f5e9' : '#f1f5f9',
                          color: isStudentActive ? '#2e7d32' : '#64748b',
                          fontWeight: 700,
                          borderRadius: 2,
                          border: `1px solid ${isStudentActive ? '#c8e6c9' : '#cbd5e1'}`
                        }}
                      />
                    </Box>
                    <ClassIcon sx={{ color: isStudentActive ? 'rgba(46, 125, 50, 0.15)' : 'rgba(100, 116, 139, 0.15)', fontSize: 40 }} />
                  </Paper>
                </Box>
              </Paper>
            </Grid>

            {/* Full Width - Class Details */}
            {studentData.classes && studentData.classes.length > 0 && (
              <Grid item xs={12}>
                <Paper sx={{
                  p: 3.5,
                  borderRadius: 3,
                  bgcolor: 'white',
                  border: '1px solid #f1f5f9',
                  boxShadow: '0 4px 20px rgba(30, 58, 95, 0.02)'
                }}>
                  <Typography variant="h6" sx={{
                    color: '#1E3A5F',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    mb: 3
                  }}>
                    <Box sx={{
                      width: 4,
                      height: 18,
                      bgcolor: '#D32F2F',
                      borderRadius: 2
                    }} />
                    Danh sách lớp học đăng ký
                  </Typography>

                  <Grid container spacing={2.5}>
                    {studentData.classes.map((cls, index) => {
                      const isActive = cls.status === 'active';
                      return (
                        <Grid item xs={12} sm={6} md={4} key={String(cls.class?.id || cls.classId?.id || cls.classId || `view-class-${index}`)}>
                          <Box sx={{
                            p: 2.5,
                            borderRadius: 3,
                            bgcolor: isActive ? '#f0fdf4' : '#fffbeb',
                            border: `1px solid ${isActive ? '#bbf7d0' : '#fef3c7'}`,
                            boxShadow: `0 4px 12px ${isActive ? 'rgba(22, 163, 74, 0.04)' : 'rgba(217, 119, 6, 0.04)'}`,
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              transform: 'translateY(-3px)',
                              boxShadow: `0 8px 20px ${isActive ? 'rgba(22, 163, 74, 0.08)' : 'rgba(217, 119, 6, 0.08)'}`
                            }
                          }}>
                            {/* Class status circle & Name */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                              <Box sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: isActive ? '#16a34a' : '#d97706'
                              }} />
                              <Typography variant="subtitle2" sx={{
                                fontWeight: 700,
                                color: isActive ? '#15803d' : '#b45309',
                                fontSize: '0.95rem'
                              }}>
                                {cls.class?.name || cls.classId?.name || cls.name || `${cls.class?.grade || cls.classId?.grade || ''}.${cls.class?.section || cls.classId?.section || ''}`}
                              </Typography>
                            </Box>

                            <Typography variant="body2" sx={{
                              fontWeight: 600,
                              color: isActive ? '#166534' : '#92400e',
                              mb: 2,
                              display: 'inline-flex',
                              alignItems: 'center',
                              px: 1,
                              py: 0.25,
                              borderRadius: 1,
                              bgcolor: isActive ? '#dcfce7' : '#fef3c7',
                              fontSize: '0.78rem'
                            }}>
                              {isActive ? 'Đang học' : 'Đã nghỉ'}
                            </Typography>

                            {/* Discount Tag */}
                            {(cls.discountPercent || cls.discount) && (
                              <Box sx={{ display: 'block', mt: 1 }}>
                                <Box sx={{ 
                                  display: 'inline-flex', 
                                  alignItems: 'center', 
                                  gap: 0.5, 
                                  px: 1.2, 
                                  py: 0.5, 
                                  borderRadius: '20px', 
                                  bgcolor: '#fef2f2', 
                                  color: '#ef4444', 
                                  border: '1px solid #fee2e2' 
                                }}>
                                  <PercentIcon sx={{ fontSize: 12 }} />
                                  <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: '0.2px' }}>
                                    Giảm {cls.discountPercent || cls.discount}%
                                  </Typography>
                                </Box>
                              </Box>
                            )}
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Box>
        ) : null}
      </DialogContent>
      <DialogActions sx={{ p: 3, bgcolor: '#f8fafc', borderTop: '1px solid #f1f5f9', gap: 2 }}>
        <Button
          onClick={handleClose}
          variant="contained"
          startIcon={<CloseIcon />}
          sx={{
            px: 4,
            py: 1.25,
            borderRadius: 2.5,
            textTransform: 'none',
            fontWeight: 700,
            bgcolor: '#D32F2F',
            color: 'white',
            boxShadow: '0 4px 12px rgba(211, 47, 47, 0.2)',
            '&:hover': { 
              bgcolor: '#b91c1c',
              boxShadow: '0 6px 16px rgba(211, 47, 47, 0.3)'
            },
            transition: 'all 0.2s'
          }}
        >
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StudentViewDialog;
