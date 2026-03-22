import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Avatar,
  Divider,
  Paper,
  Grid,
  Skeleton,
  Chip,
  Button
} from '@mui/material';
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  ArrowBack as ArrowBackIcon,
  LockOutlined as LockIcon
} from '@mui/icons-material';
import { getTeacherByIdAPI, getTypicalTeacherDetailAPI } from '../../services/teachers';
import { Teacher } from '../../types';
import PublicLayout from '../../components/layouts/PublicLayout';

const TeacherDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation() as any;
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requireLogin, setRequireLogin] = useState(false);

  useEffect(() => {
    const fetchTeacher = async () => {
      // Get teacher ID from location state (if available)
      let teacherId = location.state?.teacherId;
      const isTypical = location.state?.isTypical === true;

      // If no teacherId in state, try to extract it from the slug URL param
      // URL format: "nguyen-thi-hoa-<uuid>" where uuid contains dashes
      if (!teacherId && slug) {
        // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
        // Try to extract UUID from the end of the slug
        const uuidRegex = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;
        const match = slug.match(uuidRegex);
        if (match) {
          teacherId = match[1];
        }
      }

      if (teacherId) {
        try {
          setLoading(true);
          let response: any;

          // Always try public typical endpoint first (no auth needed)
          try {
            response = await getTypicalTeacherDetailAPI(teacherId);
            setTeacher(response.data?.data || response.data);
          } catch {
            // If typical fails, try standard endpoint (requires auth)
            const token = localStorage.getItem('access_token');
            if (!token) {
              // Not logged in → show login prompt
              setRequireLogin(true);
              return;
            }
            try {
              response = await getTeacherByIdAPI(teacherId);
              setTeacher(response.data?.data || response.data);
            } catch (apiErr: any) {
              const status = apiErr?.response?.status;
              if (status === 401 || status === 403) {
                setRequireLogin(true);
              } else {
                setError('Không thể tải thông tin giáo viên');
              }
            }
          }
        } finally {
          setLoading(false);
        }
      } else {
        setError('Không tìm thấy thông tin giáo viên');
        setLoading(false);
      }
    };

    fetchTeacher();
  }, [slug, location.state]);

  const formatQualifications = (qualifications: string[]) => {
    if (!qualifications || qualifications.length === 0) return [];
    return qualifications;
  };

  const formatSpecializations = (specializations: string[]) => {
    if (!specializations || specializations.length === 0) return [];
    return specializations;
  };

  if (loading) {
    return (
      <PublicLayout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Skeleton variant="rectangular" height={400} />
              <Skeleton variant="text" sx={{ fontSize: '2rem', mt: 2 }} />
              <Skeleton variant="text" sx={{ fontSize: '1rem', mt: 1 }} />
            </Grid>
            <Grid item xs={12} md={8}>
              <Skeleton variant="text" sx={{ fontSize: '1.5rem', mb: 2 }} />
              <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
              <Skeleton variant="text" sx={{ fontSize: '1.5rem', mb: 2 }} />
              <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
              <Skeleton variant="text" sx={{ fontSize: '1.5rem', mb: 2 }} />
              <Skeleton variant="rectangular" height={200} />
            </Grid>
          </Grid>
        </Container>
      </PublicLayout>
    );
  }

  if (requireLogin) {
    return (
      <PublicLayout>
        <Container maxWidth="sm" sx={{ py: 8 }}>
          <Paper
            elevation={3}
            sx={{
              p: 5,
              textAlign: 'center',
              borderRadius: 3,
              background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
            }}
          >
            <LockIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Yêu cầu đăng nhập
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Bạn cần đăng nhập để xem thông tin chi tiết của giáo viên.
              Thông tin cá nhân được bảo mật và chỉ hiển thị cho người dùng đã xác thực.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/login')}
              sx={{
                px: 5,
                py: 1.5,
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            >
              Đăng nhập ngay
            </Button>
            <Box sx={{ mt: 2 }}>
              <Button
                variant="text"
                onClick={() => navigate(-1)}
                sx={{ textTransform: 'none', color: 'text.secondary' }}
              >
                ← Quay lại
              </Button>
            </Box>
          </Paper>
        </Container>
      </PublicLayout>
    );
  }

  if (error || !teacher) {
    return (
      <PublicLayout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography variant="h4" color="error" textAlign="center">
            {error || 'Không tìm thấy thông tin giáo viên'}
          </Typography>
        </Container>
      </PublicLayout>
    );
  }

  const handleGoBack = () => {
    // Check if there's history to go back to
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // Fallback to teachers list page if no history
      navigate('/gioi-thieu/doi-ngu-giang-vien');
    }
  };

  return (
    <PublicLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Quay lại button */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleGoBack}
          sx={{
            mb: 4,
            textTransform: 'none',
            color: 'text.secondary',
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          Quay lại
        </Button>

      <Grid container spacing={4}>
        {/* Left Column - Profile */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
            {/* Profile Picture */}
            <Box sx={{ mb: 3 }}>
              {teacher.avatar ? (
                <Avatar
                  src={teacher.avatar}
                  alt={teacher.name}
                  sx={{
                    width: 300,
                    height: 300,
                    mx: 'auto',
                    mb: 2,
                    fontSize: '4rem'
                  }}
                />
              ) : (
                <Avatar
                  sx={{
                    width: 300,
                    height: 300,
                    mx: 'auto',
                    mb: 2,
                    fontSize: '4rem',
                    bgcolor: 'primary.main'
                  }}
                >
                  {teacher.name.charAt(0).toUpperCase()}
                </Avatar>
              )}
            </Box>

            {/* Name */}
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 'bold',
                color: 'primary.main',
                mb: 2,
                textTransform: 'uppercase'
              }}
            >
              {teacher.name}
            </Typography>

                         {/* Contact Information */}
             <Box sx={{ textAlign: 'left' }}>
               <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                 Giảng viên tiếng Anh
               </Typography>

               {teacher.phone && (
                 <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                   <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                   <Typography variant="body2" color="text.secondary">
                     {teacher.phone}
                   </Typography>
                 </Box>
               )}

               {teacher.email && (
                 <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                   <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                   <Typography variant="body2" color="text.secondary">
                     {teacher.email}
                   </Typography>
                 </Box>
               )}
             </Box>
          </Paper>
        </Grid>

        {/* Right Column - Details */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 4 }}>
                                       {/* Qualifications Section */}
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h5"
                  component="h2"
                  sx={{
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    mb: 2,
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: -8,
                      left: 0,
                      width: 60,
                      height: 3,
                      bgcolor: 'error.main'
                    }
                  }}
                >
                  Bằng cấp
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formatQualifications(teacher.qualifications || []).map((qualification, index) => (
                    <Chip
                      key={index}
                      label={qualification}
                      variant="outlined"
                      color="primary"
                      sx={{ fontWeight: 500 }}
                    />
                  ))}
                  {formatQualifications(teacher.qualifications || []).length === 0 && (
                    <Typography variant="body2" color="text.secondary" fontStyle="italic">
                      Chưa có thông tin bằng cấp
                    </Typography>
                  )}
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Specializations Section */}
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h5"
                  component="h2"
                  sx={{
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    mb: 2,
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: -8,
                      left: 0,
                      width: 60,
                      height: 3,
                      bgcolor: 'error.main'
                    }
                  }}
                >
                  Chuyên môn
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formatSpecializations(teacher.specializations || []).map((specialization, index) => (
                    <Chip
                      key={index}
                      label={specialization}
                      variant="outlined"
                      color="secondary"
                      sx={{ fontWeight: 500 }}
                    />
                  ))}
                  {formatSpecializations(teacher.specializations || []).length === 0 && (
                    <Typography variant="body2" color="text.secondary" fontStyle="italic">
                      Chưa có thông tin chuyên môn
                    </Typography>
                  )}
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Work Experience Section */}
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h5"
                  component="h2"
                  sx={{
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    mb: 2,
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: -8,
                      left: 0,
                      width: 60,
                      height: 3,
                      bgcolor: 'error.main'
                    }
                  }}
                >
                  Kinh nghiệm làm việc
                </Typography>
                {teacher.workExperience ? (
                  <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                    {teacher.workExperience}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary" fontStyle="italic">
                    Chưa có thông tin kinh nghiệm làm việc
                  </Typography>
                )}
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Introduction Section */}
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h5"
                  component="h2"
                  sx={{
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    mb: 2,
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: -8,
                      left: 0,
                      width: 60,
                      height: 3,
                      bgcolor: 'error.main'
                    }
                  }}
                >
                  Lời giới thiệu
                </Typography>
                {teacher.introduction ? (
                  <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                    {teacher.introduction}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary" fontStyle="italic">
                    Chưa có lời giới thiệu
                  </Typography>
                )}
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Description */}
              <Box>
                <Typography
                  variant="h5"
                  component="h2"
                  sx={{
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    mb: 2,
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: -8,
                      left: 0,
                      width: 60,
                      height: 3,
                      bgcolor: 'error.main'
                    }
                  }}
                >
                  Mô tả
                </Typography>
                {teacher.description ? (
                  <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                    {teacher.description}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary" fontStyle="italic">
                    Chưa có mô tả
                  </Typography>
                )}
              </Box>
          </Paper>
        </Grid>
      </Grid>
      </Container>
    </PublicLayout>
  );
};

export default TeacherDetail;
