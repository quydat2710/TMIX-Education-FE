import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Card, CardMedia, IconButton, Fade } from '@mui/material';
import {
  ArrowBackIos,
  ArrowForwardIos
} from '@mui/icons-material';

const AdvertisementSlider = ({ autoPlay = true, interval = 4000, ads }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const advertisements = ads && ads.length > 0 ? ads : [];

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

  const handlePrev = () => {
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
                    fontSize: '0.875rem'
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
                  {currentAd.content || currentAd.description}
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
                  {currentAd.buttonText || 'Xem chi tiết'}
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
