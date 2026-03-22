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

  // ✅ Fetch teachers trực tiếp từ DB
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getAllTeachersAPI({
          page: 1,
          limit: 100,
        });

        let teachersData = [];
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

  // Function to convert name to URL-friendly slug
  const createSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();
  };

  const handleTeacherClick = (teacher: Teacher) => {
    const slug = createSlug(teacher.name);
    navigate(`/gioi-thieu/doi-ngu-giang-vien/${slug}-${teacher.id}`, { state: { teacherId: teacher.id } });
  };

  // Helper function to format qualifications
  const formatQualifications = (qualifications: string[]) => {
    if (!qualifications || qualifications.length === 0) return 'Chưa có thông tin';
    return qualifications.join(', ');
  };

  // Helper function to format specializations
  const formatSpecializations = (specializations: string[]) => {
    if (!specializations || specializations.length === 0) return 'Chưa có thông tin';
    return specializations.join(', ');
  };

  // Determine which teachers to display
  const displayedTeachers = showAll ? teachers : teachers.slice(0, INITIAL_DISPLAY_COUNT);
  const hasMore = teachers.length > INITIAL_DISPLAY_COUNT;

  if (loading) {
    return (
      <PublicLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </PublicLayout>
    );
  }

  if (error) {
    return (
      <PublicLayout>
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography color="error" variant="h6">
              {error}
            </Typography>
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
            <Typography variant="h6" color="text.secondary">
              Chưa có giáo viên nào
            </Typography>
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
          <Typography
            variant="h3"
            fontWeight={800}
            gutterBottom
            sx={{
              fontSize: { xs: '2rem', md: '3rem' },
              letterSpacing: '-0.5px',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            }}
          >
            Đội Ngũ Giáo Viên
          </Typography>
          <Box sx={{ width: 60, height: 4, bgcolor: RED, mx: 'auto', mb: 2, borderRadius: 2 }} />
          <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400, lineHeight: 1.7, maxWidth: 600, mx: 'auto' }}>
            Những giáo viên tâm huyết, giàu kinh nghiệm của TMix Education
          </Typography>
        </Container>
      </Box>

      <Box sx={{ bgcolor: '#fafafa', minHeight: '60vh' }}>
        <Container maxWidth="lg" sx={{ py: 6 }}>
          {/* Grid hiển thị giáo viên */}
          <Grid container spacing={3}>
            {displayedTeachers.map((teacher) => (
              <Grid item xs={12} sm={6} md={3} key={teacher.id}>
                <Card
                  onClick={() => handleTeacherClick(teacher)}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
                    }
                  }}
                >
                  {/* Avatar */}
                  <Box sx={{ position: 'relative', paddingTop: '100%' }}>
                    {teacher.avatar ? (
                      <CardMedia
                        component="img"
                        image={teacher.avatar}
                        alt={teacher.name}
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'grey.100',
                          color: 'grey.500',
                          fontSize: '3rem',
                          fontWeight: 'bold'
                        }}
                      >
                        {teacher.name.charAt(0).toUpperCase()}
                      </Box>
                    )}
                  </Box>

                  {/* Content */}
                  <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography
                      gutterBottom
                      variant="h6"
                      component="h3"
                      sx={{
                        fontWeight: 'bold',
                        color: '#000',
                        fontSize: '1.1rem',
                        mb: 1
                      }}
                    >
                      {teacher.name}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="primary"
                      gutterBottom
                      sx={{ fontWeight: 600, mb: 1.5 }}
                    >
                      {formatSpecializations(teacher.specializations)}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1, fontSize: '0.85rem' }}
                    >
                      <strong>Bằng cấp:</strong> {formatQualifications(teacher.qualifications)}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        fontSize: '0.85rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
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
                        '&:hover': {
                          backgroundColor: 'primary.main',
                          color: 'white'
                        }
                      }}
                    >
                      Xem chi tiết
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Nút "Xem thêm" hoặc "Thu gọn" */}
          {hasMore && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => setShowAll(!showAll)}
                sx={{
                  px: 5,
                  py: 1.5,
                  borderRadius: 3,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  '&:hover': {
                    boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                  }
                }}
              >
                {showAll ? 'Thu gọn' : `Xem thêm (${teachers.length - INITIAL_DISPLAY_COUNT} giáo viên)`}
              </Button>
            </Box>
          )}
        </Container>
      </Box>
    </PublicLayout>
  );
};

export default AllTeachersPage;
