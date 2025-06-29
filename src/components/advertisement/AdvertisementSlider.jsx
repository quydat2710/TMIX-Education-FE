import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Card, CardMedia, IconButton, Fade, Slide } from '@mui/material';
import {
  ArrowBackIos,
  ArrowForwardIos
} from '@mui/icons-material';

const AdvertisementSlider = ({ autoPlay = true, interval = 8000, ads }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState('left');

  const advertisements = ads && ads.length > 0 ? ads : [];

  // Auto play functionality
  useEffect(() => {
    if (autoPlay && advertisements.length > 1) {
      const timer = setInterval(() => {
        setSlideDirection('left');
        setCurrentIndex((prevIndex) =>
          prevIndex === advertisements.length - 1 ? 0 : prevIndex + 1
        );
      }, interval);

      return () => clearInterval(timer);
    }
  }, [autoPlay, advertisements.length, interval]);

  const handleNext = () => {
    setSlideDirection('left');
    setCurrentIndex((prevIndex) =>
      prevIndex === advertisements.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrev = () => {
    setSlideDirection('right');
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? advertisements.length - 1 : prevIndex - 1
    );
  };

  const handleAdClick = (ad) => {
    console.log('Advertisement clicked:', ad);
    // Có thể thêm logic navigation ở đây
  };

  if (!advertisements || advertisements.length === 0) {
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
            height: 480,
            borderRadius: 3,
            overflow: 'hidden',
            bgcolor: 'grey.100'
          }}
        >
          <Slide direction={slideDirection} in={true} timeout={3000} key={currentIndex}>
            <Card
              sx={{
                height: '100%',
                position: 'relative',
                cursor: 'pointer',
                borderRadius: 3,
                overflow: 'hidden',
                transition: 'transform 0.6s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.02)'
                }
              }}
              onClick={() => handleAdClick(currentAd)}
            >
              {/* Badge */}
              {(currentAd.badge || currentAd.priority) && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    zIndex: 2,
                    bgcolor: `${currentAd.badgeColor || 'primary'}.main`,
                    color: 'white',
                    px: 2,
                    py: 0.5,
                    borderRadius: 2,
                    fontWeight: 'bold',
                    fontSize: '0.875rem',
                    animation: 'fadeIn 1s ease-in-out'
                  }}
                >
                  {currentAd.badge || currentAd.priority}
                </Box>
              )}

              <CardMedia
                component="img"
                height="100%"
                image={currentAd.imageUrl || currentAd.image}
                alt={currentAd.title}
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.6s ease-in-out'
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
                  p: 3,
                  animation: 'slideUp 1s ease-out'
                }}
              >
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  {currentAd.title}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                  {currentAd.content || currentAd.description}
                </Typography>
              </Box>
            </Card>
          </Slide>

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
                  bgcolor: 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,1)',
                    transform: 'translateY(-50%) scale(1.1)'
                  },
                  transition: 'all 0.6s ease-in-out',
                  zIndex: 3
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
                  bgcolor: 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,1)',
                    transform: 'translateY(-50%) scale(1.1)'
                  },
                  transition: 'all 0.6s ease-in-out',
                  zIndex: 3
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
                onClick={() => {
                  setSlideDirection(index > currentIndex ? 'left' : 'right');
                  setCurrentIndex(index);
                }}
                sx={{
                  width: index === currentIndex ? 24 : 12,
                  height: 12,
                  borderRadius: index === currentIndex ? 6 : '50%',
                  bgcolor: index === currentIndex ? 'primary.main' : 'grey.300',
                  cursor: 'pointer',
                  transition: 'all 0.6s ease-in-out',
                  '&:hover': {
                    bgcolor: index === currentIndex ? 'primary.dark' : 'grey.400',
                    transform: 'scale(1.2)'
                  }
                }}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </Box>
  );
};

export default AdvertisementSlider;
