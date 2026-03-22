import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  CircularProgress,
  Container,
  Grid,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getAllTeachersAPI } from '../services/teachers';
import { Teacher } from '../types';
import PublicLayout from '../components/layouts/PublicLayout';
import AnimatedSection, { AnimatedItem } from '../components/common/AnimatedSection';

// TMix brand colors
const NAVY = '#1E3A5F';
const NAVY_DARK = '#0F1F33';
const RED = '#D32F2F';

const AllTeachersPage = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const INITIAL_DISPLAY_COUNT = 8;

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getAllTeachersAPI({ page: 1, limit: 100 });

        let teachersData: any[] = [];
        if (response.data?.data?.result) {
          teachersData = response.data.data.result;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          teachersData = response.data.data;
        } else if (Array.isArray(response.data)) {
          teachersData = response.data;
        }

        const activeTeachers = teachersData.filter((teacher: any) => teacher.isActive !== false);
        setTeachers(activeTeachers);
      } catch (err: any) {
        console.error('Error fetching teachers:', err);
        setError('Không thể tải dữ liệu giáo viên');
        setTeachers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  const createSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTeacherClick = (teacher: Teacher) => {
    const slug = createSlug(teacher.name);
    navigate(`/gioi-thieu/doi-ngu-giang-vien/${slug}-${teacher.id}`, { state: { teacherId: teacher.id } });
  };

  const formatQualifications = (qualifications: string[]) => {
    if (!qualifications || qualifications.length === 0) return 'Chưa có thông tin';
    return qualifications.join(', ');
  };

  const formatSpecializations = (specializations: string[]) => {
    if (!specializations || specializations.length === 0) return [];
    return specializations;
  };

  const displayedTeachers = showAll ? teachers : teachers.slice(0, INITIAL_DISPLAY_COUNT);
  const hasMore = teachers.length > INITIAL_DISPLAY_COUNT;

  if (loading) {
    return (
      <PublicLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress sx={{ color: NAVY }} />
        </Box>
      </PublicLayout>
    );
  }

  if (error) {
    return (
      <PublicLayout>
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography color="error" variant="h6">{error}</Typography>
          </Box>
        </Container>
      </PublicLayout>
    );
  }

  if (teachers.length === 0) {
    return (
      <PublicLayout>
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h1" sx={{ fontSize: '3rem', mb: 2 }}>👨‍🏫</Typography>
            <Typography variant="h6" color="text.secondary">Chưa có giáo viên nào</Typography>
          </Box>
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
            background: 'radial-gradient(circle at 20% 80%, rgba(211,47,47,0.15) 0%, transparent 50%)',
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
              <span style={{ fontWeight: 600 }}>Đội Ngũ </span>
              <span style={{ fontWeight: 800, color: '#FF6659' }}>Giáo Viên</span>
            </Typography>
            <Box sx={{ width: 60, height: 4, bgcolor: RED, mx: 'auto', mb: 2, borderRadius: 2 }} />
            <Typography variant="h6" sx={{ opacity: 0.85, fontWeight: 400, lineHeight: 1.7, maxWidth: 600, mx: 'auto' }}>
              Những giáo viên tâm huyết, giàu kinh nghiệm của TMix Education
            </Typography>
          </AnimatedSection>
        </Container>
      </Box>

      <Box sx={{ background: 'linear-gradient(180deg, #f8f9ff 0%, #ffffff 100%)', minHeight: '60vh' }}>
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <AnimatedSection staggerChildren={0.08}>
            <Grid container spacing={3}>
              {displayedTeachers.map((teacher) => (
                <Grid item xs={12} sm={6} md={3} key={teacher.id}>
                  <AnimatedItem variant="fadeUp">
                    <Card
                      onClick={() => handleTeacherClick(teacher)}
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 4,
                        overflow: 'hidden',
                        border: '1px solid rgba(0,0,0,0.06)',
                        transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                        cursor: 'pointer',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                        '&:hover': {
                          transform: 'translateY(-10px)',
                          boxShadow: '0 20px 50px rgba(30,58,95,0.15)',
                          '& .teacher-image': {
                            transform: 'scale(1.08)',
                          },
                          '& .teacher-overlay': {
                            opacity: 1,
                          },
                        },
                      }}
                    >
                      {/* Avatar — fixed height for equal cards */}
                      <Box sx={{ position: 'relative', height: 280, overflow: 'hidden' }}>
                        {teacher.avatar ? (
                          <CardMedia
                            className="teacher-image"
                            component="img"
                            image={teacher.avatar}
                            alt={teacher.name}
                            sx={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              objectPosition: 'top',
                              transition: 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: '100%',
                              height: '100%',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              background: `linear-gradient(135deg, ${NAVY} 0%, #2c5282 100%)`,
                              color: '#fff', fontSize: '3rem', fontWeight: 'bold',
                            }}
                          >
                            {teacher.name.charAt(0).toUpperCase()}
                          </Box>
                        )}
                        {/* Gradient overlay on hover */}
                        <Box
                          className="teacher-overlay"
                          sx={{
                            position: 'absolute',
                            bottom: 0, left: 0, right: 0,
                            height: '50%',
                            background: `linear-gradient(transparent, rgba(15, 31, 51, 0.7))`,
                            opacity: 0,
                            transition: 'opacity 0.4s ease',
                            display: 'flex',
                            alignItems: 'flex-end',
                            p: 2,
                          }}
                        >
                          <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '0.85rem' }}>
                            Xem chi tiết →
                          </Typography>
                        </Box>
                      </Box>

                      {/* Content */}
                      <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                        <Typography
                          gutterBottom variant="h6" component="h3"
                          sx={{ fontWeight: 700, color: NAVY, fontSize: '1.05rem', mb: 0.5 }}
                        >
                          {teacher.name}
                        </Typography>

                        {/* Specializations as chips — max 3 */}
                        <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: 0.5, mb: 1.5, overflow: 'hidden', minHeight: 24 }}>
                          {formatSpecializations(teacher.specializations).slice(0, 3).map((spec, i) => (
                            <Box
                              key={i}
                              sx={{
                                px: 1,
                                py: 0.25,
                                borderRadius: 1,
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                color: RED,
                                bgcolor: 'rgba(211, 47, 47, 0.08)',
                                whiteSpace: 'nowrap',
                                flexShrink: 0,
                              }}
                            >
                              {spec}
                            </Box>
                          ))}
                          {formatSpecializations(teacher.specializations).length > 3 && (
                            <Box sx={{ px: 0.5, py: 0.25, fontSize: '0.72rem', fontWeight: 600, color: '#999' }}>
                              +{formatSpecializations(teacher.specializations).length - 3}
                            </Box>
                          )}
                        </Box>

                        <Typography
                          variant="body2" color="text.secondary"
                          sx={{
                            mb: 1, fontSize: '0.8rem', lineHeight: 1.5,
                            overflow: 'hidden', textOverflow: 'ellipsis',
                            display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
                          }}
                        >
                          <strong style={{ color: NAVY }}>Bằng cấp:</strong> {formatQualifications(teacher.qualifications)}
                        </Typography>

                        <Typography
                          variant="body2" color="text.secondary"
                          sx={{
                            mb: 1.5, fontSize: '0.8rem',
                            overflow: 'hidden', textOverflow: 'ellipsis',
                            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {teacher.description || 'Chưa có mô tả'}
                        </Typography>

                        <Button
                          variant="outlined"
                          size="small"
                          sx={{
                            mt: 'auto',
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            borderColor: NAVY,
                            color: NAVY,
                            fontSize: '0.8rem',
                            '&:hover': {
                              backgroundColor: NAVY,
                              color: 'white',
                              borderColor: NAVY,
                            },
                            transition: 'all 0.3s ease',
                          }}
                        >
                          Xem chi tiết
                        </Button>
                      </CardContent>
                    </Card>
                  </AnimatedItem>
                </Grid>
              ))}
            </Grid>
          </AnimatedSection>

          {/* Show more button */}
          {hasMore && (
            <AnimatedSection variant="fadeUp">
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => setShowAll(!showAll)}
                  sx={{
                    px: 5, py: 1.5,
                    borderRadius: 3,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '1rem',
                    bgcolor: NAVY,
                    boxShadow: '0 4px 20px rgba(30,58,95,0.25)',
                    '&:hover': {
                      bgcolor: NAVY_DARK,
                      boxShadow: '0 8px 30px rgba(30,58,95,0.35)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  {showAll ? 'Thu gọn' : `Xem thêm (${teachers.length - INITIAL_DISPLAY_COUNT} giáo viên)`}
                </Button>
              </Box>
            </AnimatedSection>
          )}
        </Container>
      </Box>
    </PublicLayout>
  );
};

export default AllTeachersPage;
