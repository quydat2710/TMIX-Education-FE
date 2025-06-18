import React from 'react';
import {
  Dialog,
  DialogContent,
  IconButton,
  Box,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  CardActions
} from '@mui/material';
import { Close as CloseIcon, ArrowForward } from '@mui/icons-material';

const WelcomeAdPopup = ({ open, onClose, userRole }) => {
  // Quảng cáo chào mừng tùy theo role
  const getWelcomeAd = () => {
    const welcomeAds = {
      student: {
        title: 'Chào mừng học sinh mới! 🎓',
        description: 'Bắt đầu hành trình học tiếng Anh cùng chúng tôi. Nhận ngay voucher giảm 15% cho khóa học đầu tiên!',
        imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=300&fit=crop',
        buttonText: 'Nhận ưu đãi',
        offer: '15% OFF'
      },
      parent: {
        title: 'Chào mừng phụ huynh! 👨‍👩‍👧‍👦',
        description: 'Đăng ký cho con em học tiếng Anh chất lượng cao. Ưu đãi đặc biệt: Giảm 20% học phí khi đăng ký 2 khóa!',
        imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=300&fit=crop',
        buttonText: 'Tư vấn miễn phí',
        offer: '20% OFF'
      },
      teacher: {
        title: 'Chào mừng giáo viên! 👩‍🏫',
        description: 'Tham gia đội ngũ giáo viên chuyên nghiệp của chúng tôi. Cơ hội phát triển sự nghiệp và mức lương hấp dẫn!',
        imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=300&fit=crop',
        buttonText: 'Ứng tuyển ngay',
        offer: 'HOT'
      },
      default: {
        title: 'Chào mừng đến với English Center! 🏫',
        description: 'Khám phá các khóa học tiếng Anh chất lượng cao với đội ngũ giáo viên giàu kinh nghiệm. Đăng ký ngay!',
        imageUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600&h=300&fit=crop',
        buttonText: 'Khám phá ngay',
        offer: 'NEW'
      }
    };

    return welcomeAds[userRole] || welcomeAds.default;
  };

  const welcomeAd = getWelcomeAd();

  const handleAdClick = () => {
    // Xử lý khi click vào quảng cáo
    console.log('Welcome ad clicked for role:', userRole);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          bgcolor: 'transparent',
          boxShadow: 'none',
          overflow: 'visible',
        },
      }}
      sx={{
        '& .MuiBackdrop-root': {
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
        },
      }}
    >
      <Box 
        sx={{ 
          position: 'relative',
          animation: 'welcomeSlideIn 0.6s ease-out',
          '@keyframes welcomeSlideIn': {
            '0%': {
              opacity: 0,
              transform: 'scale(0.8) translateY(-50px)',
            },
            '100%': {
              opacity: 1,
              transform: 'scale(1) translateY(0)',
            },
          },
        }}
      >
        {/* Close Button */}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: -10,
            top: -10,
            zIndex: 10,
            bgcolor: 'error.main',
            color: 'white',
            width: 40,
            height: 40,
            '&:hover': { 
              bgcolor: 'error.dark',
              transform: 'scale(1.1)'
            },
            transition: 'all 0.3s'
          }}
        >
          <CloseIcon />
        </IconButton>

        {/* Offer Badge */}
        <Box
          sx={{
            position: 'absolute',
            top: -5,
            left: -5,
            zIndex: 5,
            bgcolor: 'secondary.main',
            color: 'white',
            px: 2,
            py: 1,
            borderRadius: 2,
            fontWeight: 'bold',
            fontSize: '0.875rem',
            transform: 'rotate(-10deg)',
            boxShadow: 2
          }}
        >
          {welcomeAd.offer}
        </Box>

        <Card
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: 8,
            border: '3px solid',
            borderColor: 'primary.main'
          }}
        >
          <CardMedia
            component="img"
            height="250"
            image={welcomeAd.imageUrl}
            alt={welcomeAd.title}
            sx={{
              filter: 'brightness(0.9)',
            }}
          />
          
          <CardContent sx={{ p: 3 }}>
            <Typography 
              variant="h5" 
              component="h2" 
              gutterBottom 
              fontWeight="bold"
              color="primary"
            >
              {welcomeAd.title}
            </Typography>
            
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ mb: 3, lineHeight: 1.6 }}
            >
              {welcomeAd.description}
            </Typography>

            <CardActions sx={{ p: 0, justifyContent: 'space-between' }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleAdClick}
                endIcon={<ArrowForward />}
                sx={{
                  flex: 1,
                  mr: 1,
                  py: 1.5,
                  fontWeight: 'bold',
                  background: 'linear-gradient(45deg, #1976d2 0%, #42a5f5 100%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1565c0 0%, #1976d2 100%)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s'
                }}
              >
                {welcomeAd.buttonText}
              </Button>
              
              <Button
                variant="outlined"
                onClick={onClose}
                sx={{ 
                  minWidth: 100,
                  py: 1.5
                }}
              >
                Bỏ qua
              </Button>
            </CardActions>
          </CardContent>
        </Card>

        {/* Decorative elements */}
        <Box
          sx={{
            position: 'absolute',
            bottom: -20,
            right: -20,
            width: 60,
            height: 60,
            borderRadius: '50%',
            bgcolor: 'primary.main',
            opacity: 0.1,
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
              '0%': { transform: 'scale(1)', opacity: 0.1 },
              '50%': { transform: 'scale(1.2)', opacity: 0.2 },
              '100%': { transform: 'scale(1)', opacity: 0.1 },
            },
          }}
        />
        
        <Box
          sx={{
            position: 'absolute',
            top: -15,
            right: 30,
            width: 30,
            height: 30,
            borderRadius: '50%',
            bgcolor: 'secondary.main',
            opacity: 0.2,
            animation: 'float 3s ease-in-out infinite',
            '@keyframes float': {
              '0%, 100%': { transform: 'translateY(0)' },
              '50%': { transform: 'translateY(-10px)' },
            },
          }}
        />
      </Box>
    </Dialog>
  );
};

export default WelcomeAdPopup;
