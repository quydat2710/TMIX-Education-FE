import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Button,
} from '@mui/material';
import {
  School as SchoolIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import PublicLayout from '../components/layouts/PublicLayout';
import { getPublicClassesAPI } from '../services/classes';
import ClassRegistrationModal from '../components/features/home/ClassRegistrationModal';

interface ClassItem {
  id: string;
  name: string;
  description?: string;
  grade: number;
  section: number;
  year: number;
  schedule?: {
    start_date: string;
    end_date: string;
    days_of_week: string[];
    time_slots: {
      start_time: string;
      end_time: string;
    };
  };
  feePerLesson?: number;
  max_student?: number;
  status: string;
  room?: string;
  teacher?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
}

const CoursesPage: React.FC = () => {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [registrationModalOpen, setRegistrationModalOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  // ✅ Fetch tất cả lớp học trực tiếp từ DB — không phụ thuộc vào menu API
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getPublicClassesAPI({
          page: 1,
          limit: 100,
        });

        const classesData = response.data?.data?.result || response.data?.data || [];
        setClasses(Array.isArray(classesData) ? classesData : []);
      } catch (err: any) {
        console.error('Error fetching classes:', err);
        setError(err?.response?.data?.message || 'Không thể tải dữ liệu khóa học');
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Chưa xác định';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getDateRange = (classItem: ClassItem): string => {
    if (!classItem.schedule) return '';
    const start = formatDate(classItem.schedule.start_date);
    const end = formatDate(classItem.schedule.end_date);
    return `${start} - ${end}`;
  };

  const formatDaysOfWeek = (schedule: any): string => {
    if (!schedule || !schedule.days_of_week || !Array.isArray(schedule.days_of_week)) {
      return 'Liên hệ';
    }

    const daysMap: { [key: string]: string } = {
      '0': 'CN',
      '1': 'T2',
      '2': 'T3',
      '3': 'T4',
      '4': 'T5',
      '5': 'T6',
      '6': 'T7'
    };

    return schedule.days_of_week
      .map((day: string) => daysMap[day.toString()] || day)
      .join(', ');
  };

  const formatTimeSlots = (schedule: any): string => {
    if (!schedule || !schedule.time_slots) {
      return 'Liên hệ';
    }

    if (typeof schedule.time_slots === 'object' && schedule.time_slots.start_time && schedule.time_slots.end_time) {
      return `${schedule.time_slots.start_time} - ${schedule.time_slots.end_time}`;
    }

    return 'Liên hệ';
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'ongoing':
        return 'success';
      case 'upcoming':
        return 'info';
      case 'completed':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'Đang học';
      case 'upcoming':
        return 'Sắp khai giảng';
      case 'closed':
        return 'Đã kết thúc';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <PublicLayout>
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress size={60} />
          </Box>
        </Container>
      </PublicLayout>
    );
  }

  if (error) {
    return (
      <PublicLayout>
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Typography color="error" textAlign="center">{error}</Typography>
        </Container>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      {/* Hero Header — TMix Navy gradient */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1E3A5F 0%, #0F1F33 100%)',
          color: '#fff',
          py: { xs: 8, md: 10 },
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'radial-gradient(circle at 80% 20%, rgba(211,47,47,0.12) 0%, transparent 50%)',
          },
        }}
      >
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h3" fontWeight={800} gutterBottom sx={{ fontSize: { xs: '2rem', md: '3rem' }, letterSpacing: '-0.5px' }}>
            Các Khóa Học
          </Typography>
          <Box sx={{ width: 60, height: 4, bgcolor: '#D32F2F', mx: 'auto', mb: 2, borderRadius: 2 }} />
          <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
            Chương trình đào tạo tiếng Anh chất lượng cho mọi cấp độ
          </Typography>
        </Container>
      </Box>

      <Box sx={{ bgcolor: '#f8f9fc', minHeight: '60vh' }}>
        {/* Classes Grid */}
        <Container maxWidth="lg" sx={{ py: 6 }}>
          {classes.length === 0 ? (
            <Box textAlign="center" py={8}>
              <SchoolIcon sx={{ fontSize: 80, color: '#bbb', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Chưa có khóa học nào
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Hiện tại chưa có khóa học nào. Vui lòng quay lại sau hoặc liên hệ với chúng tôi để biết thêm thông tin.
              </Typography>
            </Box>
          ) : (
            <>
              <Grid container spacing={3}>
                {(showAll ? classes : classes.slice(0, 6)).map((classItem) => (
                  <Grid item xs={12} sm={6} md={4} key={classItem.id}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        border: '1px solid #e0e0e0',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          borderColor: '#1976d2',
                        },
                      }}
                    >
                      {/* Card Header */}
                      <Box
                        sx={{
                          bgcolor: '#f5f5f5',
                          p: 2.5,
                          borderBottom: '1px solid #e0e0e0',
                        }}
                      >
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Box display="flex" alignItems="center" gap={1.5}>
                            <Typography variant="h6" fontWeight={600} color="text.primary">
                              Lớp {classItem.name}
                            </Typography>
                            <Chip
                              label={`Khối ${classItem.grade}`}
                              size="small"
                              sx={{
                                bgcolor: '#1976d2',
                                color: 'white',
                                fontWeight: 500,
                              }}
                            />
                          </Box>
                          <Chip
                            label={getStatusLabel(classItem.status)}
                            size="small"
                            color={getStatusColor(classItem.status)}
                            sx={{ fontWeight: 500 }}
                          />
                        </Box>
                      </Box>

                      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2.5 }}>
                        <Box sx={{ flexGrow: 1 }}>
                          {/* Lịch học */}
                          <Box sx={{ mb: 1.5 }}>
                            <Typography variant="body2" color="text.secondary">
                              <strong>Lịch học:</strong> {formatDaysOfWeek(classItem.schedule)}
                            </Typography>
                          </Box>

                          {/* Giờ học */}
                          <Box sx={{ mb: 1.5 }}>
                            <Typography variant="body2" color="text.secondary">
                              <strong>Giờ học:</strong> {formatTimeSlots(classItem.schedule)}
                            </Typography>
                          </Box>

                          {/* Phòng học */}
                          {classItem.room && (
                            <Box sx={{ mb: 1.5 }}>
                              <Typography variant="body2" color="text.secondary">
                                <strong>Phòng:</strong> {classItem.room}
                              </Typography>
                            </Box>
                          )}

                          {/* Sĩ số */}
                          <Box sx={{ mb: 1.5 }}>
                            <Typography variant="body2" color="text.secondary">
                              <strong>Sĩ số tối đa:</strong> {classItem.max_student || 'N/A'} học sinh
                            </Typography>
                          </Box>

                          {/* Học phí */}
                          <Box sx={{ mb: 1.5 }}>
                            <Typography variant="body2" color="text.secondary">
                              <strong>Học phí:</strong> {formatCurrency(classItem.feePerLesson)}/buổi
                            </Typography>
                          </Box>

                          {/* Giáo viên */}
                          {classItem.teacher && (
                            <Box sx={{ mb: 1.5 }}>
                              <Typography variant="body2" color="text.secondary">
                                <strong>Giáo viên:</strong> {classItem.teacher.name}
                              </Typography>
                            </Box>
                          )}

                          {/* Thời gian khóa học */}
                          {classItem.schedule && (
                            <Box sx={{ mb: 1.5 }}>
                              <Typography variant="body2" color="text.secondary">
                                <strong>Thời gian:</strong> {getDateRange(classItem)}
                              </Typography>
                            </Box>
                          )}

                          {/* Mô tả - xuống cuối */}
                          {classItem.description && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                mb: 2,
                                p: 1.5,
                                bgcolor: '#fafafa',
                                borderRadius: 1,
                                lineHeight: 1.6,
                                fontStyle: 'italic',
                              }}
                            >
                              {classItem.description}
                            </Typography>
                          )}
                        </Box>

                        <Button
                          variant="contained"
                          fullWidth
                          onClick={() => {
                            setSelectedClassId(classItem.id);
                            setRegistrationModalOpen(true);
                          }}
                          sx={{
                            bgcolor: '#1976d2',
                            '&:hover': {
                              bgcolor: '#1565c0',
                            },
                            fontWeight: 500,
                            textTransform: 'none',
                            py: 1,
                          }}
                        >
                          Đăng ký ngay
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* Show More / Show Less Button */}
              {classes.length > 6 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Button
                    variant="outlined"
                    onClick={() => setShowAll(!showAll)}
                    endIcon={showAll ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    sx={{
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      borderColor: '#1976d2',
                      color: '#1976d2',
                      '&:hover': {
                        borderColor: '#1565c0',
                        bgcolor: 'rgba(25, 118, 210, 0.04)',
                      },
                    }}
                  >
                    {showAll ? 'Thu gọn' : `Xem thêm ${classes.length - 6} khóa học`}
                  </Button>
                </Box>
              )}
            </>
          )}
        </Container>
      </Box>
      {/* Registration Modal */}
      <ClassRegistrationModal
        open={registrationModalOpen}
        onClose={() => {
          setRegistrationModalOpen(false);
          setSelectedClassId(null);
        }}
        classId={selectedClassId}
      />
    </PublicLayout>
  );
};

export default CoursesPage;
