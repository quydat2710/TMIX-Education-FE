import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  IconButton
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { getTypicalTeachersAPI, getAllTeachersAPI } from '../../../services/teachers';
import { Teacher } from '../../../types';
import AnimatedSection from '../../common/AnimatedSection';

const FeaturedTeachersHome = () => {
  const navigate = useNavigate();
  const sliderRef = useRef<Slider>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true);
        setError(null);

        let teachersData: any[] = [];

        try {
          const response = await getTypicalTeachersAPI();
          if (response.data?.data?.result) {
            teachersData = response.data.data.result;
          } else if (response.data?.data && Array.isArray(response.data.data)) {
            teachersData = response.data.data;
          } else if (Array.isArray(response.data)) {
            teachersData = response.data;
          }
        } catch {
          // fallback below
        }

        let result = teachersData
          .filter((t: any) => t.isActive !== false)
          .filter((t: any) => t.typical === true);

        if (result.length === 0) {
          try {
            const allResponse = await getAllTeachersAPI({ page: 1, limit: 6 });
            let allData: any[] = [];
            if (allResponse.data?.data?.result) {
              allData = allResponse.data.data.result;
            } else if (allResponse.data?.data && Array.isArray(allResponse.data.data)) {
              allData = allResponse.data.data;
            } else if (Array.isArray(allResponse.data)) {
              allData = allResponse.data;
            }
            result = allData.filter((t: any) => t.isActive !== false).slice(0, 6);
          } catch {
            result = [];
          }
        }

        setTeachers(result);
      } catch (err) {
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
    navigate(`/gioi-thieu/doi-ngu-giang-vien/${slug}-${teacher.id}`, { state: { teacherId: teacher.id, isTypical: true } });
  };

  const formatSpecializations = (specializations: string[]) => {
    if (!specializations || specializations.length === 0) return 'Chưa có thông tin';
    return specializations.join(', ');
  };

  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2, slidesToScroll: 1 } },
      { breakpoint: 600, settings: { slidesToShow: 1, slidesToScroll: 1 } }
    ]
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || teachers.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          {error || 'Chưa có giáo viên nào'}
        </Typography>
      </Box>
    );
  }

  return (
    <AnimatedSection variant="fadeUp">
      <Box sx={{ position: 'relative', px: 4 }}>
        {/* Section Title */}
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography
            variant="overline"
            sx={{
              color: '#e53935',
              fontWeight: 700,
              letterSpacing: 3,
              fontSize: '0.85rem',
              mb: 1,
              display: 'block',
            }}
          >
            ĐỘI NGŨ GIẢNG VIÊN
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
            }}
          >
            <span style={{ color: '#333333', fontWeight: 600 }}>Giáo viên </span>
            <span style={{ color: '#D32F2F', fontWeight: 700 }}>tiêu biểu</span>
          </Typography>
        </Box>

        {/* Navigation Arrows */}
        <Box sx={{ position: 'relative' }}>
          <IconButton
            onClick={() => sliderRef.current?.slickPrev()}
            sx={{
              position: 'absolute',
              left: -20,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              bgcolor: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              width: 44,
              height: 44,
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: '#e53935',
                color: 'white',
                transform: 'translateY(-50%) scale(1.1)',
              },
              '@media (max-width: 600px)': { left: -10 }
            }}
          >
            <ChevronLeftIcon />
          </IconButton>

          <IconButton
            onClick={() => sliderRef.current?.slickNext()}
            sx={{
              position: 'absolute',
              right: -20,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              bgcolor: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              width: 44,
              height: 44,
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: '#e53935',
                color: 'white',
                transform: 'translateY(-50%) scale(1.1)',
              },
              '@media (max-width: 600px)': { right: -10 }
            }}
          >
            <ChevronRightIcon />
          </IconButton>

          {/* Slider */}
          <Box sx={{ px: 2 }}>
            <Slider ref={sliderRef} {...sliderSettings}>
              {teachers.map((teacher) => (
                <Box key={teacher.id} sx={{ px: 1.5 }}>
                  <Card
                    onClick={() => handleTeacherClick(teacher)}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 4,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: '1px solid rgba(0,0,0,0.06)',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                      transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                      '&:hover': {
                        transform: 'translateY(-12px) scale(1.02)',
                        boxShadow: '0 25px 50px rgba(229, 57, 53, 0.15), 0 10px 25px rgba(0,0,0,0.08)',
                        '& .teacher-overlay': {
                          opacity: 1,
                        },
                        '& .teacher-img': {
                          transform: 'scale(1.08)',
                        },
                      }
                    }}
                  >
                    {/* Image with gradient overlay */}
                    <Box sx={{ position: 'relative', paddingTop: '100%', overflow: 'hidden' }}>
                      {teacher.avatar ? (
                        <CardMedia
                          className="teacher-img"
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
                            transition: 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
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
                            background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
                            color: '#999',
                            fontSize: '4rem',
                            fontWeight: 'bold'
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
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: '50%',
                          background: 'linear-gradient(transparent, rgba(30, 58, 95, 0.85))',
                          opacity: 0,
                          transition: 'opacity 0.4s ease',
                          display: 'flex',
                          alignItems: 'flex-end',
                          p: 2,
                        }}
                      >
                        <Typography
                          sx={{
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                          }}
                        >
                          Xem chi tiết →
                        </Typography>
                      </Box>
                    </Box>

                    {/* Content */}
                    <CardContent sx={{ p: 2.5, flexGrow: 1 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          color: '#1E3A5F',
                          mb: 0.5,
                          fontSize: '1.1rem',
                        }}
                      >
                        {teacher.name}
                      </Typography>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: '#e53935',
                          fontWeight: 600,
                          mb: 1.5,
                          fontSize: '0.85rem',
                        }}
                      >
                        {formatSpecializations(teacher.specializations)}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#777',
                          lineHeight: 1.6,
                          fontSize: '0.85rem',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {teacher.description || 'Giảng viên giàu kinh nghiệm tại TMix Education'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Slider>
          </Box>
        </Box>
      </Box>
    </AnimatedSection>
  );
};

export default FeaturedTeachersHome;
