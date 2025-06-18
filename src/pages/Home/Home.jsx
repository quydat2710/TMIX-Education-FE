import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  ArrowForward as ArrowForwardIcon,
  School as SchoolIcon,
  Group as GroupIcon,
  EmojiEvents as EmojiEventsIcon,
  Support as SupportIcon,
} from '@mui/icons-material';
import { COLORS } from '../../utils/colors';
import { useNavigate } from 'react-router-dom';
import HomeHeader from './HomeHeader';
import Footer from './Footer';
import Advertisement from '../../components/advertisement/Advertisement';
import WelcomeAdPopup from '../../components/advertisement/WelcomeAdPopup';

const Home = () => {
  const navigate = useNavigate();
  const [showWelcomeAd, setShowWelcomeAd] = useState(false);

  useEffect(() => {
    // Hiển thị popup quảng cáo sau 2 giây
    const timer = setTimeout(() => {
      setShowWelcomeAd(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    // Xử lý tìm kiếm
  };

  const handleGetStarted = () => {
    navigate('/login');
  };

  const features = [
    {
      icon: <SchoolIcon sx={{ fontSize: 40, color: COLORS.primary }} />,
      title: 'Chương trình học chất lượng',
      description: 'Giáo trình được thiết kế bởi đội ngũ chuyên gia hàng đầu',
    },
    {
      icon: <GroupIcon sx={{ fontSize: 40, color: COLORS.primary }} />,
      title: 'Giáo viên bản xứ',
      description: 'Đội ngũ giảng viên giàu kinh nghiệm, nhiệt tình',
    },
    {
      icon: <EmojiEventsIcon sx={{ fontSize: 40, color: COLORS.primary }} />,
      title: 'Chứng chỉ quốc tế',
      description: 'Cấp chứng chỉ được công nhận toàn cầu',
    },
    {
      icon: <SupportIcon sx={{ fontSize: 40, color: COLORS.primary }} />,
      title: 'Hỗ trợ 24/7',
      description: 'Đội ngũ tư vấn viên luôn sẵn sàng hỗ trợ',
    },
  ];

  const courses = [
    {
      id: 1,
      title: 'Tiếng Anh Giao Tiếp',
      description: 'Khóa học giúp bạn tự tin giao tiếp tiếng Anh trong mọi tình huống',
      image: 'https://source.unsplash.com/random/300x200?english',
      level: 'Cơ bản - Nâng cao',
      duration: '3 tháng',
    },
    {
      id: 2,
      title: 'Luyện Thi IELTS',
      description: 'Chương trình luyện thi IELTS chuyên sâu với giáo viên bản xứ',
      image: 'https://source.unsplash.com/random/300x200?ielts',
      level: 'Trung cấp - Nâng cao',
      duration: '6 tháng',
    },
    {
      id: 3,
      title: 'Tiếng Anh Doanh Nghiệp',
      description: 'Khóa học tiếng Anh chuyên ngành cho doanh nghiệp',
      image: 'https://source.unsplash.com/random/300x200?business',
      level: 'Trung cấp',
      duration: '4 tháng',
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <HomeHeader />
      <WelcomeAdPopup
        open={showWelcomeAd}
        onClose={() => setShowWelcomeAd(false)}
        userRole="default"
      />

      {/* Main Content */}
      <Box sx={{ flex: 1, pt: 8 }}>
        {/* Hero Section */}
        <Box
          sx={{
            bgcolor: COLORS.primary,
            color: 'white',
            py: 8,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Container maxWidth="lg">
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography variant="h2" component="h1" gutterBottom>
                  Học Tiếng Anh
                  <br />
                  Thật Dễ Dàng
                </Typography>
                <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
                  Khám phá phương pháp học tiếng Anh hiệu quả cùng đội ngũ giảng viên chuyên nghiệp
                </Typography>
                <Box component="form" onSubmit={handleSearch} sx={{ mb: 4 }}>
                  <TextField
                    fullWidth
                    placeholder="Tìm kiếm khóa học..."
                    variant="outlined"
                    sx={{
                      bgcolor: 'white',
                      borderRadius: 2,
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: 'transparent',
                        },
                        '&:hover fieldset': {
                          borderColor: 'transparent',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'transparent',
                        },
                      },
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton type="submit" color="primary">
                            <SearchIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  onClick={handleGetStarted}
                  sx={{
                    bgcolor: 'white',
                    color: COLORS.primary,
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                    },
                  }}
                >
                  Bắt đầu ngay
                </Button>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box
                  component="img"
                  src="https://source.unsplash.com/random/600x400?education"
                  alt="Hero"
                  sx={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: 4,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  }}
                />
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Advertisement Banner */}
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Advertisement mode="banner" />
        </Container>

        {/* Features Section */}
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Typography variant="h3" component="h2" align="center" gutterBottom>
            Tại sao chọn chúng tôi?
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 6 }}>
            Những lý do khiến chúng tôi trở thành lựa chọn hàng đầu
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    p: 3,
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                    },
                  }}
                >
                  <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography color="text.secondary">{feature.description}</Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>

        {/* Courses Section */}
        <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
          <Container maxWidth="lg">
            <Typography variant="h3" component="h2" align="center" gutterBottom>
              Khóa học nổi bật
            </Typography>
            <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 6 }}>
              Khám phá các khóa học chất lượng của chúng tôi
            </Typography>
            <Grid container spacing={4}>
              {courses.map((course) => (
                <Grid item xs={12} md={4} key={course.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                      },
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={course.image}
                      alt={course.title}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h5" component="h3">
                        {course.title}
                      </Typography>
                      <Typography color="text.secondary" paragraph>
                        {course.description}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Trình độ: {course.level}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Thời lượng: {course.duration}
                        </Typography>
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        color="primary"
                        onClick={() => navigate(`/courses/${course.id}`)}
                      >
                        Xem chi tiết
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      </Box>

      <Footer />
    </Box>
  );
};

export default Home;
