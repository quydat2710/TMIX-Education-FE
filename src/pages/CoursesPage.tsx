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
  CalendarMonth as CalendarIcon,
  AccessTime as TimeIcon,
  MeetingRoom as RoomIcon,
  Groups as GroupsIcon,
  AttachMoney as MoneyIcon,
  Person as PersonIcon,
  DateRange as DateRangeIcon,
} from '@mui/icons-material';
import PublicLayout from '../components/layouts/PublicLayout';
import { getPublicClassesAPI } from '../services/classes';
import ClassRegistrationModal from '../components/features/home/ClassRegistrationModal';
import AnimatedSection, { AnimatedItem } from '../components/common/AnimatedSection';

// TMix brand colors
const NAVY = '#1E3A5F';
const NAVY_DARK = '#0F1F33';
const RED = '#D32F2F';

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

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getPublicClassesAPI({ page: 1, limit: 100 });
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
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Chưa xác định';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getDateRange = (classItem: ClassItem): string => {
    if (!classItem.schedule) return '';
    return `${formatDate(classItem.schedule.start_date)} - ${formatDate(classItem.schedule.end_date)}`;
  };

  const formatDaysOfWeek = (schedule: any): string => {
    if (!schedule || !schedule.days_of_week || !Array.isArray(schedule.days_of_week)) return 'Liên hệ';
    const daysMap: { [key: string]: string } = { '0': 'CN', '1': 'T2', '2': 'T3', '3': 'T4', '4': 'T5', '5': 'T6', '6': 'T7' };
    return schedule.days_of_week.map((day: string) => daysMap[day.toString()] || day).join(', ');
  };

  const formatTimeSlots = (schedule: any): string => {
    if (!schedule || !schedule.time_slots) return 'Liên hệ';
    if (typeof schedule.time_slots === 'object' && schedule.time_slots.start_time && schedule.time_slots.end_time) {
      return `${schedule.time_slots.start_time} - ${schedule.time_slots.end_time}`;
    }
    return 'Liên hệ';
  };

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'ongoing':
        return { label: 'Đang học', bgcolor: 'rgba(46, 125, 50, 0.1)', color: '#2e7d32', borderColor: 'rgba(46, 125, 50, 0.3)' };
      case 'upcoming':
        return { label: 'Sắp khai giảng', bgcolor: 'rgba(25, 118, 210, 0.1)', color: '#1976d2', borderColor: 'rgba(25, 118, 210, 0.3)' };
      case 'closed':
        return { label: 'Đã kết thúc', bgcolor: 'rgba(0,0,0,0.05)', color: '#757575', borderColor: 'rgba(0,0,0,0.1)' };
      default:
        return { label: status, bgcolor: 'rgba(0,0,0,0.05)', color: '#757575', borderColor: 'rgba(0,0,0,0.1)' };
    }
  };

  // Info row component
  const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.2 }}>
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 30, height: 30, borderRadius: 1.5,
        bgcolor: 'rgba(30, 58, 95, 0.06)',
        color: NAVY, flexShrink: 0,
      }}>
        {icon}
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.82rem' }}>
        <strong style={{ color: '#444' }}>{label}</strong> {value}
      </Typography>
    </Box>
  );

  if (loading) {
    return (
      <PublicLayout>
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress size={60} sx={{ color: NAVY }} />
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
      {/* Hero Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_DARK} 100%)`,
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
          <AnimatedSection variant="fadeUp">
            <Typography
              variant="h3"
              gutterBottom
              sx={{
                fontSize: { xs: '2rem', md: '3rem' },
                letterSpacing: '-0.5px',
                textShadow: '0 2px 8px rgba(0,0,0,0.4)',
              }}
            >
              <span style={{ fontWeight: 600 }}>Các </span>
              <span style={{ fontWeight: 800, color: '#FF6659' }}>Khóa Học</span>
            </Typography>
            <Box sx={{ width: 60, height: 4, bgcolor: RED, mx: 'auto', mb: 2, borderRadius: 2 }} />
            <Typography variant="h6" sx={{ opacity: 0.85, fontWeight: 400 }}>
              Chương trình đào tạo tiếng Anh chất lượng cho mọi cấp độ
            </Typography>
          </AnimatedSection>
        </Container>
      </Box>

      <Box sx={{ background: 'linear-gradient(180deg, #f8f9ff 0%, #ffffff 100%)', minHeight: '60vh' }}>
        <Container maxWidth="lg" sx={{ py: 6 }}>
          {classes.length === 0 ? (
            <Box textAlign="center" py={8}>
              <SchoolIcon sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Chưa có khóa học nào
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Vui lòng quay lại sau hoặc liên hệ với chúng tôi.
              </Typography>
            </Box>
          ) : (
            <>
              <AnimatedSection staggerChildren={0.08}>
                <Grid container spacing={3}>
                  {(showAll ? classes : classes.slice(0, 6)).map((classItem) => {
                    const statusConfig = getStatusConfig(classItem.status);
                    return (
                      <Grid item xs={12} sm={6} md={4} key={classItem.id}>
                        <AnimatedItem variant="fadeUp">
                          <Card
                            sx={{
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              borderRadius: 4,
                              border: '1px solid rgba(0,0,0,0.06)',
                              overflow: 'hidden',
                              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                              transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                              '&:hover': {
                                transform: 'translateY(-8px)',
                                boxShadow: '0 16px 40px rgba(30,58,95,0.12)',
                                borderColor: NAVY,
                              },
                            }}
                          >
                            {/* Card Header */}
                            <Box
                              sx={{
                                background: `linear-gradient(135deg, ${NAVY} 0%, #2c5282 100%)`,
                                p: 2.5,
                                color: '#fff',
                              }}
                            >
                              <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Box display="flex" alignItems="center" gap={1.5}>
                                  <Typography variant="h6" fontWeight={700} sx={{ color: '#fff' }}>
                                    Lớp {classItem.name}
                                  </Typography>
                                  <Chip
                                    label={`Khối ${classItem.grade}`}
                                    size="small"
                                    sx={{
                                      bgcolor: 'rgba(255,255,255,0.2)',
                                      color: '#fff',
                                      fontWeight: 600,
                                      backdropFilter: 'blur(4px)',
                                      fontSize: '0.7rem',
                                    }}
                                  />
                                </Box>
                                <Chip
                                  label={statusConfig.label}
                                  size="small"
                                  sx={{
                                    bgcolor: statusConfig.bgcolor,
                                    color: statusConfig.color,
                                    border: `1px solid ${statusConfig.borderColor}`,
                                    fontWeight: 600,
                                    fontSize: '0.7rem',
                                  }}
                                />
                              </Box>
                            </Box>

                            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2.5 }}>
                              <Box sx={{ flexGrow: 1 }}>
                                <InfoRow icon={<CalendarIcon sx={{ fontSize: 16 }} />} label="Lịch học:" value={formatDaysOfWeek(classItem.schedule)} />
                                <InfoRow icon={<TimeIcon sx={{ fontSize: 16 }} />} label="Giờ học:" value={formatTimeSlots(classItem.schedule)} />
                                {classItem.room && (
                                  <InfoRow icon={<RoomIcon sx={{ fontSize: 16 }} />} label="Phòng:" value={classItem.room} />
                                )}
                                <InfoRow icon={<GroupsIcon sx={{ fontSize: 16 }} />} label="Sĩ số:" value={`${classItem.max_student || 'N/A'} học sinh`} />
                                <InfoRow icon={<MoneyIcon sx={{ fontSize: 16 }} />} label="Học phí:" value={`${formatCurrency(classItem.feePerLesson)}/buổi`} />
                                {classItem.teacher && (
                                  <InfoRow icon={<PersonIcon sx={{ fontSize: 16 }} />} label="Giáo viên:" value={classItem.teacher.name} />
                                )}
                                {classItem.schedule && (
                                  <InfoRow icon={<DateRangeIcon sx={{ fontSize: 16 }} />} label="Thời gian:" value={getDateRange(classItem)} />
                                )}

                                {classItem.description && (
                                  <Typography
                                    variant="body2" color="text.secondary"
                                    sx={{
                                      mt: 1.5, p: 1.5,
                                      bgcolor: 'rgba(30, 58, 95, 0.03)',
                                      borderRadius: 2,
                                      borderLeft: `3px solid ${NAVY}`,
                                      lineHeight: 1.6,
                                      fontSize: '0.8rem',
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
                                  mt: 2,
                                  bgcolor: RED,
                                  borderRadius: 2,
                                  py: 1.2,
                                  fontWeight: 700,
                                  textTransform: 'none',
                                  fontSize: '0.9rem',
                                  boxShadow: '0 4px 15px rgba(211, 47, 47, 0.3)',
                                  '&:hover': {
                                    bgcolor: '#b71c1c',
                                    boxShadow: '0 6px 20px rgba(211, 47, 47, 0.45)',
                                    transform: 'translateY(-2px)',
                                  },
                                  transition: 'all 0.3s ease',
                                }}
                              >
                                Đăng ký ngay
                              </Button>
                            </CardContent>
                          </Card>
                        </AnimatedItem>
                      </Grid>
                    );
                  })}
                </Grid>
              </AnimatedSection>

              {/* Show More / Show Less */}
              {classes.length > 6 && (
                <AnimatedSection variant="fadeUp">
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                    <Button
                      variant="outlined"
                      onClick={() => setShowAll(!showAll)}
                      endIcon={showAll ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      sx={{
                        px: 4, py: 1.5,
                        borderRadius: 3,
                        textTransform: 'none',
                        fontWeight: 600,
                        borderColor: NAVY,
                        color: NAVY,
                        '&:hover': {
                          borderColor: NAVY_DARK,
                          bgcolor: 'rgba(30, 58, 95, 0.04)',
                        },
                      }}
                    >
                      {showAll ? 'Thu gọn' : `Xem thêm ${classes.length - 6} khóa học`}
                    </Button>
                  </Box>
                </AnimatedSection>
              )}
            </>
          )}
        </Container>
      </Box>

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
