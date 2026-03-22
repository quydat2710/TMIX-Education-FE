import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import { Card, CardContent, Avatar, Typography, Box, Button, IconButton, CircularProgress } from '@mui/material';
import { ChevronLeft, ChevronRight, FormatQuote as QuoteIcon } from '@mui/icons-material';
import { getFeedbacksAPI } from '../../../services/feedback';
import { Feedback } from '../../../types';
import AnimatedSection from '../../common/AnimatedSection';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const AVATAR_SIZE = 80;
const AVATAR_BORDER = 3;

const getSocialIcon = (url: string) => {
  const domain = url.toLowerCase();
  if (domain.includes('facebook.com') || domain.includes('fb.com')) {
    return (
      <svg fill="#1877F2" strokeWidth="0" viewBox="0 0 16 16" style={{ width: 18, height: 18 }} xmlns="http://www.w3.org/2000/svg">
        <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z" />
      </svg>
    );
  }
  if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
    return (
      <svg fill="#FF0000" strokeWidth="0" viewBox="0 0 24 24" style={{ width: 18, height: 18 }} xmlns="http://www.w3.org/2000/svg">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    );
  }
  return null;
};

const FeedbackCard = ({ feedback }: { feedback: Feedback }) => (
  <Box sx={{ px: 1.5, pb: 3 }}>
    <Card
      sx={{
        borderRadius: 4,
        p: 3,
        minHeight: 300,
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        border: '1px solid rgba(0,0,0,0.05)',
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        position: 'relative',
        overflow: 'visible',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 20px 50px rgba(229, 57, 53, 0.1), 0 8px 20px rgba(0,0,0,0.06)',
        },
      }}
    >
      {/* Quote icon */}
      <QuoteIcon
        sx={{
          position: 'absolute',
          top: -10,
          right: 20,
          fontSize: 48,
          color: 'rgba(229, 57, 53, 0.12)',
          transform: 'rotate(180deg)',
        }}
      />

      <CardContent sx={{ p: 0 }}>
        {/* Avatar + Name */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
          <Avatar
            src={feedback.imageUrl}
            alt={feedback.name}
            sx={{
              width: AVATAR_SIZE,
              height: AVATAR_SIZE,
              border: `${AVATAR_BORDER}px solid`,
              borderColor: '#e53935',
              mr: 2,
              boxShadow: '0 4px 12px rgba(229, 57, 53, 0.2)',
            }}
          >
            {feedback.name?.charAt(0)?.toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E3A5F', fontSize: '1rem', lineHeight: 1.3 }}>
              {feedback.name}
            </Typography>
            {/* Star rating */}
            <Box sx={{ display: 'flex', gap: 0.3, mt: 0.5 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Box key={star} sx={{ color: '#FFB400', fontSize: '1rem' }}>⭐</Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Description */}
        <Typography
          variant="body1"
          sx={{
            color: '#555',
            lineHeight: 1.8,
            fontSize: '0.95rem',
            fontStyle: 'italic',
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 5,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          "{feedback.description}"
        </Typography>

        {/* Social link */}
        {feedback.socialUrl && (
          <Button
            href={feedback.socialUrl}
            target="_blank"
            size="small"
            sx={{
              color: '#888',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.8rem',
              '&:hover': { color: '#e53935' },
            }}
          >
            Xem bài viết {getSocialIcon(feedback.socialUrl)}
          </Button>
        )}
      </CardContent>
    </Card>
  </Box>
);

const FeedbackHome = () => {
  const navigate = useNavigate();
  const sliderRef = useRef<any>();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        setLoading(true);
        const response = await getFeedbacksAPI({ page: 1, limit: 100 });
        if (response.data?.data?.result) {
          setFeedbacks(response.data.data.result);
        } else {
          setFeedbacks([]);
        }
      } catch (err) {
        console.error('Error fetching feedbacks:', err);
        setError('Không thể tải dữ liệu đánh giá');
        setFeedbacks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedbacks();
  }, []);

  const settings = {
    dots: false,
    infinite: feedbacks.length > 3,
    speed: 500,
    slidesToShow: Math.min(3, feedbacks.length),
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 6000,
    pauseOnHover: true,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: Math.min(2, feedbacks.length) } },
      { breakpoint: 600, settings: { slidesToShow: 1 } },
    ],
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || feedbacks.length === 0) {
    return (
      <AnimatedSection variant="fadeUp">
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h1" sx={{ fontSize: '3rem', mb: 2 }}>💬</Typography>
          <Typography variant="h6" sx={{ color: '#999', fontWeight: 600 }}>
            {error || 'Đánh giá sẽ sớm được cập nhật'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#bbb', mt: 1 }}>
            Hãy là người đầu tiên chia sẻ trải nghiệm tại TMix Education!
          </Typography>
        </Box>
      </AnimatedSection>
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
            ĐÁNH GIÁ
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
            }}
          >
            <span style={{ color: '#333333', fontWeight: 600 }}>Phụ huynh và học sinh </span>
            <span style={{ color: '#D32F2F', fontWeight: 700 }}>nói gì</span>{' '}
            <span style={{ color: '#1E3A5F', fontWeight: 700 }}>sau khóa học</span>
          </Typography>
        </Box>

        {/* Navigation */}
        {feedbacks.length > 3 && (
          <>
            <IconButton
              onClick={() => sliderRef.current?.slickPrev()}
              sx={{
                position: 'absolute',
                left: 0,
                top: '55%',
                transform: 'translateY(-50%)',
                zIndex: 10,
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
              }}
            >
              <ChevronLeft />
            </IconButton>
            <IconButton
              onClick={() => sliderRef.current?.slickNext()}
              sx={{
                position: 'absolute',
                right: 0,
                top: '55%',
                transform: 'translateY(-50%)',
                zIndex: 10,
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
              }}
            >
              <ChevronRight />
            </IconButton>
          </>
        )}

        <Slider {...settings} ref={sliderRef}>
          {feedbacks.map((feedback) => (
            <FeedbackCard feedback={feedback} key={feedback.id} />
          ))}
        </Slider>

        {/* View all button */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/cam-nhan-hoc-vien')}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.95rem',
              borderColor: '#e53935',
              color: '#e53935',
              borderWidth: 2,
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: '#D32F2F',
                bgcolor: '#e53935',
                color: 'white',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 20px rgba(229, 57, 53, 0.25)',
              },
            }}
          >
            Xem tất cả đánh giá
          </Button>
        </Box>
      </Box>
    </AnimatedSection>
  );
};

export default FeedbackHome;
