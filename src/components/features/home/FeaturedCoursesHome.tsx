import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  CircularProgress,
} from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
  CalendarMonth as CalendarIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Room as RoomIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getPublicClassesAPI } from '../../../services/classes';
import AnimatedSection, { AnimatedItem } from '../../common/AnimatedSection';
import ClassRegistrationModal from './ClassRegistrationModal';

const NAVY = '#1E3A5F';

interface ClassItem {
  id: string;
  name: string;
  grade: number;
  status: string;
  room?: string;
  teacher?: { id: string; name: string };
  description?: string;
  schedule?: {
    start_date: string;
    end_date: string;
    days_of_week: string[];
    time_slots: { start_time: string; end_time: string };
  };
  feePerLesson?: number;
}

// Unique accent per card
const accents = ['#4CAF50', '#FF9800', '#D32F2F'];

const FeaturedCoursesHome = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const response = await getPublicClassesAPI({ page: 1, limit: 100 });
        const data = response.data?.data?.result || response.data?.data || [];
        const sorted = data
          .filter((c: ClassItem) => c.status === 'upcoming' || c.status === 'active')
          .sort((a: ClassItem, b: ClassItem) => {
            if (a.status === 'upcoming' && b.status !== 'upcoming') return -1;
            if (a.status !== 'upcoming' && b.status === 'upcoming') return 1;
            return 0;
          });
        setClasses(sorted.slice(0, 3));
      } catch (err) {
        console.error('Error fetching featured courses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  const formatDays = (schedule: any): string => {
    if (!schedule?.days_of_week?.length) return 'Liên hệ';
    const days: Record<string, string> = { '0': 'CN', '1': 'T2', '2': 'T3', '3': 'T4', '4': 'T5', '5': 'T6', '6': 'T7' };
    return schedule.days_of_week.map((d: string) => days[d.toString()] || d).join(' - ');
  };

  const formatTime = (schedule: any): string => {
    if (!schedule?.time_slots?.start_time) return 'Liên hệ';
    return `${schedule.time_slots.start_time} - ${schedule.time_slots.end_time}`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress sx={{ color: NAVY }} />
      </Box>
    );
  }

  if (classes.length === 0) return null;

  return (
    <AnimatedSection variant="fadeUp">
      {/* Section Header */}
      <Box textAlign="center" mb={{ xs: 4, md: 6 }}>
        <Typography
          sx={{
            fontWeight: 800,
            color: NAVY,
            fontSize: { xs: '1.8rem', md: '2.5rem' },
            lineHeight: 1.2,
            mb: 0.5,
          }}
        >
          Khóa học nổi bật
        </Typography>
        <Typography
          sx={{
            fontWeight: 400,
            color: '#8892a4',
            fontSize: { xs: '1rem', md: '1.15rem' },
            letterSpacing: 0.5,
          }}
        >
          Bắt đầu hành trình của bạn
        </Typography>
      </Box>

      {/* Course Cards */}
      <AnimatedSection staggerChildren={0.12}>
        <Grid container spacing={4}>
          {classes.map((classItem, index) => {
            const accent = accents[index % accents.length];
            return (
              <Grid item xs={12} sm={6} md={4} key={classItem.id}>
                <AnimatedItem variant="fadeUp">
                  <Box
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: '24px',
                      bgcolor: '#fff',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: '0 8px 40px rgba(0,0,0,0.06)',
                      transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
                        '& .watermark-num': {
                          opacity: 0.07,
                          transform: 'scale(1.05)',
                        },
                      },
                    }}
                  >
                    {/* Watermark number */}
                    <Typography
                      className="watermark-num"
                      sx={{
                        position: 'absolute',
                        top: -10,
                        right: -5,
                        fontSize: '10rem',
                        fontWeight: 900,
                        color: NAVY,
                        opacity: 0.04,
                        lineHeight: 1,
                        pointerEvents: 'none',
                        userSelect: 'none',
                        transition: 'all 0.5s ease',
                      }}
                    >
                      {classItem.grade}
                    </Typography>

                    {/* Content */}
                    <Box sx={{ p: { xs: 3, md: 3.5 }, pb: 0, flexGrow: 1, position: 'relative', zIndex: 1 }}>
                      {/* Status tag */}
                      <Box
                        component="span"
                        sx={{
                          display: 'inline-block',
                          px: 2,
                          py: 0.6,
                          borderRadius: '12px',
                          bgcolor: classItem.status === 'upcoming' ? '#FFF1F0' : '#F0FFF4',
                          color: classItem.status === 'upcoming' ? '#E53935' : '#2E7D32',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          mb: 2.5,
                        }}
                      >
                        {classItem.status === 'upcoming' ? '🔥 Sắp khai giảng' : '✅ Đang học'}
                      </Box>

                      {/* Class name - large typography */}
                      <Typography
                        sx={{
                          fontWeight: 800,
                          color: NAVY,
                          fontSize: { xs: '1.4rem', md: '1.6rem' },
                          lineHeight: 1.2,
                          mb: 1,
                        }}
                      >
                        Lớp {classItem.name}
                      </Typography>

                      {/* Descriptive tagline */}
                      <Typography
                        sx={{
                          color: '#555555',
                          fontSize: '0.88rem',
                          mb: 3,
                          lineHeight: 1.5,
                        }}
                      >
                        {classItem.description
                          ? classItem.description.length > 60
                            ? classItem.description.substring(0, 60) + '...'
                            : classItem.description
                          : `Khối ${classItem.grade} • Chương trình chất lượng cao`}
                      </Typography>

                      {/* Info lines - minimal icons */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
                        <InfoLine icon={<CalendarIcon />} label="Lịch học" value={formatDays(classItem.schedule)} />
                        <InfoLine icon={<TimeIcon />} label="Giờ học" value={formatTime(classItem.schedule)} />
                        {classItem.teacher && (
                          <InfoLine icon={<PersonIcon />} label="Giáo viên" value={classItem.teacher.name} />
                        )}
                        {classItem.room && (
                          <InfoLine icon={<RoomIcon />} label="Phòng" value={classItem.room} />
                        )}
                      </Box>
                    </Box>

                    {/* CTA Button */}
                    <Box sx={{ px: { xs: 3, md: 3.5 }, pb: 3 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => {
                          setSelectedClassId(classItem.id);
                          setModalOpen(true);
                        }}
                        sx={{
                          background: 'linear-gradient(135deg, #E53935 0%, #FF6F00 100%)',
                          borderRadius: '14px',
                          py: 1.5,
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          fontSize: '1rem',
                          letterSpacing: 1.5,
                          boxShadow: '0 4px 20px rgba(229,57,53,0.3)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #C62828 0%, #E65100 100%)',
                            boxShadow: '0 8px 30px rgba(229,57,53,0.4)',
                            transform: 'translateY(-2px)',
                          },
                          transition: 'all 0.3s ease',
                        }}
                      >
                        Đăng ký ngay
                      </Button>
                    </Box>

                    {/* Bottom accent line */}
                    <Box
                      sx={{
                        height: 4,
                        background: accent,
                        borderRadius: '0 0 24px 24px',
                      }}
                    />
                  </Box>
                </AnimatedItem>
              </Grid>
            );
          })}
        </Grid>
      </AnimatedSection>

      {/* View All Link */}
      <Box textAlign="center" mt={5}>
        <Button
          variant="text"
          size="large"
          endIcon={<ArrowForwardIcon />}
          onClick={() => navigate('/cac-khoa-hoc')}
          sx={{
            color: NAVY,
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '1rem',
            '&:hover': {
              bgcolor: 'rgba(30,58,95,0.04)',
              '& .MuiSvgIcon-root': { transform: 'translateX(4px)' },
            },
            '& .MuiSvgIcon-root': { transition: 'transform 0.3s ease' },
          }}
        >
          Xem tất cả khóa học
        </Button>
      </Box>

      {/* Registration Modal */}
      <ClassRegistrationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        classId={selectedClassId}
        className={classes.find(c => c.id === selectedClassId)?.name || ''}
      />
    </AnimatedSection>
  );
};

/* Minimal info line with Navy icon */
const InfoLine = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <Box display="flex" alignItems="center" gap={1.5}>
    <Box sx={{ color: NAVY, display: 'flex', alignItems: 'center', '& .MuiSvgIcon-root': { fontSize: 19 } }}>
      {icon}
    </Box>
    <Typography sx={{ color: '#475569', fontSize: '0.88rem' }}>
      <Box component="span" sx={{ color: '#777', mr: 0.5 }}>{label}:</Box>
      <Box component="span" sx={{ fontWeight: 600, color: '#1e293b' }}>{value}</Box>
    </Typography>
  </Box>
);

export default FeaturedCoursesHome;
