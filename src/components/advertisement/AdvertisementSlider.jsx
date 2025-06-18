import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Card, CardMedia, IconButton, Fade } from '@mui/material';
import {
  ArrowBackIos,
  ArrowForwardIos
} from '@mui/icons-material';

const AdvertisementSlider = ({ userRole, autoPlay = true, interval = 4000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const getAdvertisements = () => {
    const baseAds = [
      {
        id: 1,
        title: 'Khóa học IELTS chất lượng cao',
        description: 'Cam kết đầu ra 6.5+ với đội ngũ giáo viên kinh nghiệm. Đăng ký ngay để nhận ưu đãi 20% học phí!',
        imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=400&fit=crop',
        link: '/courses/ielts',
        buttonText: 'Đăng ký ngay',
        badge: '20% OFF',
        badgeColor: 'error'
      },
      {
        id: 2,
        title: 'Lớp Tiếng Anh Giao Tiếp',
        description: 'Phát triển kỹ năng giao tiếp tự tin với phương pháp hiện đại. Khai giảng lớp mới - Số lượng có hạn!',
        imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=400&fit=crop',
        link: '/courses/speaking',
        buttonText: 'Tìm hiểu thêm',
        badge: 'HOT',
        badgeColor: 'warning'
      },
      {
        id: 3,
        title: 'Chương trình học thiếu nhi',
        description: 'Khóa học Tiếng Anh dành cho trẻ em với phương pháp vui nhộn, hiệu quả. Ưu đãi đặc biệt cho học sinh mới!',
        imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=400&fit=crop',
        link: '/courses/kids',
        buttonText: 'Xem chi tiết',
        badge: 'NEW',
        badgeColor: 'success'
      },
      {
        id: 4,
        title: 'Luyện thi TOEIC 990',
        description: 'Chương trình luyện thi TOEIC chuyên sâu với tỷ lệ đậu cao. Cam kết điểm số hoặc học lại miễn phí!',
        imageUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=400&fit=crop',
        link: '/courses/toeic',
        buttonText: 'Đăng ký tư vấn',
        badge: 'BEST',
        badgeColor: 'primary'
      },
      {
        id: 5,
        title: 'Tiếng Anh Doanh Nghiệp',
        description: 'Chương trình tiếng Anh chuyên ngành cho các chuyên gia và doanh nhân. Nâng cao khả năng giao tiếp công việc.',
        imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop',
        link: '/courses/business',
        buttonText: 'Khám phá ngay',
        badge: 'PRO',
        badgeColor: 'info'
      }
    ];

    // Tùy chỉnh quảng cáo theo userRole
    if (userRole === 'parent') {
      return baseAds.map(ad => {
        if (ad.id === 3) {
          return {
            ...ad,
            title: 'Đăng ký con em học Tiếng Anh',
            description: 'Cho con cơ hội phát triển với chương trình Tiếng Anh chất lượng cao. Ưu đãi đặc biệt cho phụ huynh mới!',
          };
        }
        return ad;
      });
    } else if (userRole === 'student') {
      return baseAds.filter(ad => ![3, 5].includes(ad.id)); // Loại bỏ thiếu nhi và doanh nghiệp
    } else if (userRole === 'teacher') {
      return baseAds.slice(0, 3); // Chỉ hiển thị 3 quảng cáo đầu
    }

    return baseAds;
  };

  const advertisements = getAdvertisements();
  // Auto play functionality
  useEffect(() => {
    if (autoPlay && advertisements.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex((prevIndex) =>
          prevIndex === advertisements.length - 1 ? 0 : prevIndex + 1
        );
      }, interval);

      return () => clearInterval(timer);
    }
  }, [autoPlay, advertisements.length, interval]);

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === advertisements.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrev = () => {    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? advertisements.length - 1 : prevIndex - 1
    );
  };

  const handleAdClick = (ad) => {
    console.log('Advertisement clicked:', ad);
    // Có thể thêm logic navigation ở đây
  };

  if (advertisements.length === 0) {
    return null;
  }

  const currentAd = advertisements[currentIndex];

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',        alignItems: 'center',
        mb: 3
      }}>
        <Typography variant="h5" fontWeight="bold">
          🎯 Khóa học nổi bật
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" color="textSecondary">
            {currentIndex + 1} / {advertisements.length}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ position: 'relative' }}>
        {/* Main slider container */}
        <Box
          sx={{
            position: 'relative',
            height: 350,
            borderRadius: 3,
            overflow: 'hidden',
            bgcolor: 'grey.100'
          }}
        >
          <Fade in={true} timeout={500} key={currentIndex}>
            <Card
              sx={{
                height: '100%',
                position: 'relative',
                cursor: 'pointer',
                borderRadius: 3,
                overflow: 'hidden'
              }}
              onClick={() => handleAdClick(currentAd)}
            >
              {/* Badge */}
              {currentAd.badge && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    zIndex: 2,
                    bgcolor: `${currentAd.badgeColor}.main`,
                    color: 'white',
                    px: 2,
                    py: 0.5,
                    borderRadius: 2,
                    fontWeight: 'bold',
                    fontSize: '0.875rem'
                  }}
                >
                  {currentAd.badge}
                </Box>
              )}

              <CardMedia
                component="img"
                height="100%"
                image={currentAd.imageUrl}
                alt={currentAd.title}
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />

              {/* Overlay */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                  color: 'white',
                  p: 3
                }}
              >
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  {currentAd.title}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                  {currentAd.description}
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    fontWeight: 'bold',
                    '&:hover': {
                      bgcolor: 'grey.100',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s'
                  }}
                >
                  {currentAd.buttonText}
                </Button>
              </Box>
            </Card>
          </Fade>

          {/* Navigation buttons */}
          {advertisements.length > 1 && (
            <>
              <IconButton
                onClick={handlePrev}
                sx={{
                  position: 'absolute',
                  left: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'rgba(255,255,255,0.8)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
                }}
              >
                <ArrowBackIos />
              </IconButton>

              <IconButton
                onClick={handleNext}
                sx={{
                  position: 'absolute',
                  right: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'rgba(255,255,255,0.8)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
                }}
              >
                <ArrowForwardIos />
              </IconButton>
            </>
          )}
        </Box>

        {/* Dots indicator */}
        {advertisements.length > 1 && (
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 1,
            mt: 2
          }}>
            {advertisements.map((_, index) => (
              <Box
                key={index}
                onClick={() => setCurrentIndex(index)}
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: index === currentIndex ? 'primary.main' : 'grey.300',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': {
                    bgcolor: index === currentIndex ? 'primary.dark' : 'grey.400'
                  }
                }}
              />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default AdvertisementSlider;
