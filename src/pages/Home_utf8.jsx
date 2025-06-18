import React from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  AppBar,
  Toolbar,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  Menu,
  MenuItem,
  CardMedia,
  Stack,
  IconButton,
  useTheme,
  useMediaQuery,
  Paper,
  Divider
} from '@mui/material';
import {
  School,
  Star,
  People,
  EmojiEvents,
  AccountCircle,
  Logout,
  Dashboard as DashboardIcon,
  PlayArrow,
  CheckCircle,
  Language,
  Timer,
  Group,
  TrendingUp,
  Phone,
  Email,
  LocationOn,
  Facebook,
  Instagram,
  YouTube
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';

// Import utilities and constants
import { COLORS, GRADIENTS } from '../utils/colors';
import { USER_ROLES, ROLE_LABELS, APP_NAME } from '../utils/constants';
import { getRoleColor } from '../utils/helpers';

// Import advertisement components
import Advertisement from '../components/advertisement/Advertisement';
import AdvertisementSlider from '../components/advertisement/AdvertisementSlider';
import WelcomeAdPopup from '../components/advertisement/WelcomeAdPopup';

const Home = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [showWelcomeAd, setShowWelcomeAd] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Hiển thị popup chào mừng sau 3 giây khi chưa đăng nhập
  useEffect(() => {
    if (!user) {
      const timer = setTimeout(() => {
        setShowWelcomeAd(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleDashboardClick = () => {
    // Chuyển đến dashboard tương ứng với role
    switch (user?.role) {
      case USER_ROLES.ADMIN:
        navigate('/admin/dashboard');
        break;
      case USER_ROLES.TEACHER:
        navigate('/teacher/dashboard');
        break;
      case USER_ROLES.STUDENT:
        navigate('/student/dashboard');
        break;
      case USER_ROLES.PARENT:
        navigate('/parent/dashboard');
        break;
      default:
        navigate('/login');
    }
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
  };

  const handleAdClick = (ad) => {
    console.log('Advertisement clicked:', ad);
    if (ad.link) {
      // navigate(ad.link);
    }
  };

  const getRoleLabel = (role) => {
    return ROLE_LABELS[role] || role;
  };

  // Dữ liệu về trung tâm
  const centerInfo = {
    name: "English Center Excellence",
    established: "2014",
    students: "2000+",
    teachers: "80+",
    courses: "20+",
    satisfaction: "98%",
    description: "Trung tâm tiếng Anh hàng đầu với hơn 10 năm kinh nghiệm, cam kết mang đến chất lượng giáo dục tốt nhất cho học viên.",
    achievements: [
      "Giải thưởng Trung tâm Anh ngữ xuất sắc 2023",
      "Top 5 trung tâm được yêu thích nhất",
      "Chứng nhận ISO 9001:2015",
      "Đối tác chiến lược với British Council"
    ]
  };

  const features = [
    {
      icon: <School sx={{ fontSize: 40 }} />,
      title: 'Giáo viên chất lượng',
      description: '100% giáo viên có chứng chỉ quốc tế TESOL/CELTA',
      stats: '80+ giáo viên'
    },
    {
      icon: <Language sx={{ fontSize: 40 }} />,
      title: 'Phương pháp hiện đại',
      description: 'Áp dụng công nghệ AI và phương pháp Communicative Language Teaching',
      stats: 'Công nghệ 4.0'
    },
    {
      icon: <Group sx={{ fontSize: 40 }} />,
      title: 'Lớp học nhỏ',
      description: 'Tối đa 12 học viên/lớp đảm bảo chất lượng và sự chú ý cá nhân',
      stats: 'Max 12 học viên'
    },
    {
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      title: 'Cam kết kết quả',
      description: 'Cam kết đầu ra rõ ràng, hoàn tiền 100% nếu không đạt mục tiêu',
      stats: '98% thành công'
    }
  ];

  const courses = [
    {
      name: 'IELTS Preparation',
      level: 'Intermediate - Advanced',
      duration: '3-6 tháng',
      image: '/images/courses/ielts.jpg',
      target: '6.5+ IELTS',
      price: '3.000.000đ'
    },
    {
      name: 'General English',
      level: 'Beginner - Advanced',
      duration: '6-12 tháng',
      image: '/images/courses/general.jpg',
      target: 'Giao tiếp thành thạo',
      price: '2.500.000đ'
    },
    {
      name: 'Business English',
      level: 'Intermediate+',
      duration: '4-8 tháng',
      image: '/images/courses/business.jpg',
      target: 'Tiếng Anh công sở',
      price: '3.500.000đ'
    },
    {
      name: 'Kids English',
      level: '6-12 tuổi',
      duration: '12 tháng',
      image: '/images/courses/kids.jpg',
      target: 'Nền tảng vững chắc',
      price: '2.000.000đ'
    }
  ];

  const testimonials = [
    {
      name: 'Nguyễn Thị Mai',
      role: 'Học viên IELTS',
      avatar: '/images/avatars/student1.jpg',
      rating: 5,
      comment: 'Tôi đã đạt 7.5 IELTS sau 4 tháng học tại đây. Giáo viên rất tận tâm và phương pháp giảng dạy hiệu quả.',
      achievement: 'IELTS 7.5'
    },
    {
      name: 'Trần Văn Nam',
      role: 'Nhân viên văn phòng',
      avatar: '/images/avatars/student2.jpg',
      rating: 5,
      comment: 'Khóa Business English giúp tôi tự tin giao tiếp với đối tác quốc tế. Môi trường học tập chuyên nghiệp.',
      achievement: 'Thăng tiến công việc'
    },
    {
      name: 'Lê Thị Hoa',
      role: 'Phụ huynh',
      avatar: '/images/avatars/parent1.jpg',
      rating: 5,
      comment: 'Con tôi rất thích học ở đây. Từ khi học, con tự tin hơn và thành tích học tập cải thiện rõ rệt.',
      achievement: 'Con đạt giải English Olympic'
    }
  ];

  const stats = [
    { number: centerInfo.students, label: 'Học viên', icon: <People /> },
    { number: centerInfo.teachers, label: 'Giáo viên', icon: <School /> },
    { number: centerInfo.courses, label: 'Khóa học', icon: <Language /> },
    { number: centerInfo.satisfaction, label: 'Hài lòng', icon: <Star /> }
  ];

  return (
    <Box>
      {/* Header */}
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        }}
      >
        <Toolbar sx={{ px: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <School sx={{ mr: 1, color: 'primary.main', fontSize: 32 }} />
            <Typography variant="h5" component="div" color="primary" fontWeight="bold">
              {APP_NAME}
            </Typography>
          </Box>
          
          {/* Navigation Menu for non-logged users */}
          {!user && (
            <Box sx={{ display: { xs: 'none', md: 'flex' }, mr: 3 }}>
              <Button color="inherit" sx={{ mx: 1, color: 'text.primary' }}>Trang chủ</Button>
              <Button color="inherit" sx={{ mx: 1, color: 'text.primary' }}>Khóa học</Button>
              <Button color="inherit" sx={{ mx: 1, color: 'text.primary' }}>Về chúng tôi</Button>
              <Button color="inherit" sx={{ mx: 1, color: 'text.primary' }}>Liên hệ</Button>
            </Box>
          )}
          
          {/* User section */}
          {user ? (
            <>
              <Button
                variant="contained"
                startIcon={<DashboardIcon />}
                onClick={handleDashboardClick}
                sx={{ 
                  mr: 2,
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                Dashboard
              </Button>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ 
                  display: { xs: 'none', md: 'flex' }, 
                  flexDirection: 'column', 
                  alignItems: 'flex-end' 
                }}>
                  <Typography variant="subtitle2" sx={{ 
                    fontWeight: 600, 
                    color: 'text.primary',
                    lineHeight: 1.2
                  }}>
                    {user.name || 'User'}
                  </Typography>
                  <Chip
                    label={getRoleLabel(user.role)}
                    size="small"
                    sx={{
                      bgcolor: `${getRoleColor(user.role)}15`,
                      color: getRoleColor(user.role),
                      fontWeight: 500,
                      fontSize: '0.75rem',
                      height: 20,
                      mt: 0.5
                    }}
                  />
                </Box>

                <Button
                  onClick={handleMenu}
                  sx={{ 
                    minWidth: 'auto', 
                    p: 0,
                    borderRadius: '50%',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'scale(1.05)',
                    },
                  }}
                >
                  <Avatar sx={{ 
                    bgcolor: getRoleColor(user.role),
                    color: '#FFFFFF',
                    width: 40, 
                    height: 40,
                    fontWeight: 600,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  }}>
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </Avatar>
                </Button>
              </Box>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                PaperProps={{
                  sx: {
                    minWidth: 280,
                    mt: 1.5,
                    background: 'rgba(255, 255, 255, 0.98)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(226, 232, 240, 0.8)',
                    borderRadius: 3,
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    overflow: 'visible',
                  }
                }}
              >
                <Box sx={{ px: 3, py: 2 }}>
                  <Typography variant="h6" sx={{ 
                    color: 'text.primary', 
                    fontWeight: 600, 
                    mb: 0.5 
                  }}>
                    {user.name || 'User'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      bgcolor: getRoleColor(user.role) 
                    }} />
                    <Typography variant="body2" sx={{ 
                      color: 'text.secondary', 
                      fontWeight: 500 
                    }}>
                      {getRoleLabel(user.role)}
                    </Typography>
                  </Box>
                </Box>
                
                <MenuItem 
                  onClick={handleClose}
                  sx={{
                    mx: 1,
                    borderRadius: 2,
                    color: 'text.primary',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: `${getRoleColor(user.role)}15`,
                      transform: 'translateX(4px)',
                    },
                  }}
                >
                  <AccountCircle sx={{ 
                    mr: 2, 
                    color: 'text.secondary',
                    fontSize: 20
                  }} />
                  Thông tin cá nhân
                </MenuItem>
                
                <MenuItem 
                  onClick={handleLogout}
                  sx={{
                    mx: 1,
                    borderRadius: 2,
                    color: 'text.primary',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: 'rgba(244, 67, 54, 0.1)',
                      color: 'error.main',
                      transform: 'translateX(4px)',
                    },
                  }}
                >
                  <Logout sx={{ 
                    mr: 2, 
                    color: 'text.secondary',
                    fontSize: 20
                  }} />
                  Đăng xuất
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleLoginClick}
              sx={{ borderRadius: 2 }}
            >
              Đăng nhập
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box sx={{ 
        background: GRADIENTS.primary,
        color: 'white',
        py: { xs: 8, md: 12 },
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background decoration */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '50%',
          height: '100%',
          background: 'url(/images/hero-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.1,
          zIndex: 0
        }} />
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '2rem', md: '3rem' } }}>
                Khám phá tiềm năng với
                <Typography component="span" variant="h2" sx={{ color: 'secondary.main', display: 'block', fontSize: { xs: '2rem', md: '3rem' } }}>
                  English Excellence
                </Typography>
              </Typography>
              
              {user ? (
                <Box>
                  <Typography variant="h5" sx={{ mb: 2, opacity: 0.9 }}>
                    Chào mừng trở lại, {user.name}! 👋
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 4, opacity: 0.8 }}>
                    Tiếp tục hành trình học tập của bạn
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={handleDashboardClick}
                      sx={{ 
                        px: 4, 
                        py: 1.5,
                        bgcolor: 'white',
                        color: 'primary.main',
                        fontWeight: 'bold',
                        '&:hover': { bgcolor: 'grey.100' }
                      }}
                    >
                      🚀 Truy cập Dashboard
                    </Button>
                  </Stack>
                </Box>
              ) : (
                <Box>
                  <Typography variant="h5" sx={{ mb: 4, opacity: 0.9, lineHeight: 1.4 }}>
                    Nơi ước mơ chinh phục tiếng Anh trở thành hiện thực với phương pháp giảng dạy hiện đại nhất
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={handleLoginClick}
                      sx={{ 
                        px: 4, 
                        py: 1.5,
                        bgcolor: 'white',
                        color: 'primary.main',
                        fontWeight: 'bold',
                        '&:hover': { bgcolor: 'grey.100' }
                      }}
                    >
                      🚀 Bắt đầu ngay
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={<PlayArrow />}
                      sx={{ 
                        px: 4, 
                        py: 1.5,
                        borderColor: 'white',
                        color: 'white',
                        '&:hover': { 
                          borderColor: 'white',
                          bgcolor: 'rgba(255,255,255,0.1)'
                        }
                      }}
                    >
                      Xem video
                    </Button>
                  </Stack>
                </Box>
              )}
            </Grid>
            
            <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box sx={{ 
                textAlign: 'center',
                '& img': { 
                  maxWidth: '100%', 
                  height: 'auto',
                  borderRadius: 3,
                  boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                }
              }}>
                <img src="/images/hero-image.jpg" alt="English Learning" />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ py: 6, bgcolor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 3, height: '100%' }}>
                  <Box sx={{ color: 'primary.main', mb: 2 }}>
                    {React.cloneElement(stat.icon, { sx: { fontSize: 40 } })}
                  </Box>
                  <Typography variant="h3" color="primary" fontWeight="bold" gutterBottom>
                    {stat.number}
                  </Typography>
                  <Typography variant="h6" color="textSecondary">
                    {stat.label}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Advertisement Slider - hiển thị cho tất cả */}
      <Box sx={{ py: 6 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" textAlign="center" fontWeight="bold" gutterBottom sx={{ mb: 4 }}>
            🎯 Khuyến mãi đặc biệt
          </Typography>
          <AdvertisementSlider 
            userRole={user?.role} 
            autoPlay={true}
            interval={5000}
          />
        </Container>
      </Box>

      {/* About Section */}
      <Box sx={{ py: 8, bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                🏫 Về {centerInfo.name}
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7, fontSize: '1.1rem' }}>
                {centerInfo.description}
              </Typography>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: 'primary.main' }}>
                🏆 Thành tựu nổi bật:
              </Typography>
              <Stack spacing={1}>
                {centerInfo.achievements.map((achievement, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircle sx={{ color: 'success.main', mr: 1, fontSize: 20 }} />
                    <Typography variant="body2">{achievement}</Typography>
                  </Box>
                ))}
              </Stack>
              <Button 
                variant="contained" 
                sx={{ mt: 3 }}
                onClick={() => navigate('/about')}
              >
                Tìm hiểu thêm
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ 
                position: 'relative',
                '& img': { 
                  width: '100%', 
                  height: 'auto',
                  borderRadius: 3,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                }
              }}>
                <img src="/images/about-center.jpg" alt="Về trung tâm" />
                <Paper sx={{ 
                  position: 'absolute',
                  bottom: 20,
                  right: 20,
                  p: 2,
                  bgcolor: 'primary.main',
                  color: 'white',
                  borderRadius: 2
                }}>
                  <Typography variant="h6" fontWeight="bold">
                    {centerInfo.established}
                  </Typography>
                  <Typography variant="body2">
                    Năm thành lập
                  </Typography>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 8, bgcolor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Typography variant="h4" textAlign="center" fontWeight="bold" gutterBottom>
            🌟 Tại sao chọn chúng tôi?
          </Typography>
          <Typography variant="body1" textAlign="center" color="textSecondary" sx={{ mb: 6, maxWidth: 600, mx: 'auto' }}>
            Chúng tôi cam kết mang đến chương trình học tiếng Anh chất lượng cao với những ưu điểm vượt trội
          </Typography>
          
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card sx={{ 
                  height: '100%', 
                  textAlign: 'center', 
                  p: 3, 
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                  }
                }}>
                  <CardContent>
                    <Box sx={{ color: 'primary.main', mb: 2 }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                      {feature.description}
                    </Typography>
                    <Chip 
                      label={feature.stats} 
                      color="primary" 
                      variant="outlined"
                      size="small"
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Courses Section */}
      <Box sx={{ py: 8, bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <Typography variant="h4" textAlign="center" fontWeight="bold" gutterBottom>
            📚 Khóa học nổi bật
          </Typography>
          <Typography variant="body1" textAlign="center" color="textSecondary" sx={{ mb: 6, maxWidth: 600, mx: 'auto' }}>
            Chương trình học đa dạng phù hợp với mọi đối tượng và mục tiêu học tập
          </Typography>
          
          <Grid container spacing={4}>
            {courses.map((course, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card sx={{ 
                  height: '100%',
                  borderRadius: 3,
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 15px 35px rgba(0,0,0,0.1)'
                  }
                }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={course.image}
                    alt={course.name}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {course.name}
                    </Typography>
                    <Stack spacing={1} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Timer sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="textSecondary">
                          {course.duration}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <TrendingUp sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="textSecondary">
                          {course.level}
                        </Typography>
                      </Box>
                    </Stack>
                    <Chip 
                      label={course.target} 
                      color="primary" 
                      variant="outlined"
                      size="small"
                      sx={{ mb: 2 }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6" color="primary" fontWeight="bold">
                        {course.price}
                      </Typography>
                      <Button size="small" variant="outlined">
                        Chi tiết
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Advertisement Cards - Chỉ hiển thị khi đã đăng nhập */}
      {user && (
        <Box sx={{ py: 6, bgcolor: 'grey.50' }}>
          <Container maxWidth="lg">
            <Typography variant="h4" textAlign="center" fontWeight="bold" gutterBottom sx={{ mb: 4 }}>
              🎁 Ưu đãi dành riêng cho bạn
            </Typography>
            <Advertisement 
              mode="slider"
              userRole={user.role}
              onAdClick={handleAdClick}
            />
          </Container>
        </Box>
      )}

      {/* Testimonials Section */}
      <Box sx={{ py: 8, bgcolor: 'primary.main', color: 'white' }}>
        <Container maxWidth="lg">
          <Typography variant="h4" textAlign="center" fontWeight="bold" gutterBottom>
            💬 Học viên nói gì về chúng tôi
          </Typography>
          <Typography variant="body1" textAlign="center" sx={{ mb: 6, opacity: 0.9, maxWidth: 600, mx: 'auto' }}>
            Những câu chuyện thành công thực tế từ học viên tại English Center
          </Typography>
          
          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Paper sx={{ 
                  p: 4, 
                  borderRadius: 3, 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar 
                      src={testimonial.avatar} 
                      sx={{ width: 50, height: 50, mr: 2 }}
                    />
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {testimonial.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {testimonial.role}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', mb: 2 }}>
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} sx={{ color: 'warning.main', fontSize: 20 }} />
                    ))}
                  </Box>
                  <Typography variant="body2" sx={{ mb: 2, flexGrow: 1, fontStyle: 'italic' }}>
                    "{testimonial.comment}"
                  </Typography>
                  <Chip 
                    label={testimonial.achievement}
                    color="success"
                    size="small"
                    sx={{ alignSelf: 'flex-start' }}
                  />
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Contact Section */}
      <Box sx={{ py: 8, bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <Grid container spacing={6}>
            <Grid item xs={12} md={6}>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                📞 Liên hệ với chúng tôi
              </Typography>
              <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
                Sẵn sàng hỗ trợ bạn 24/7. Hãy liên hệ để được tư vấn miễn phí!
              </Typography>
              
              <Stack spacing={3}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Phone sx={{ color: 'primary.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h6" fontWeight="bold">Hotline</Typography>
                    <Typography color="textSecondary">1900 123 456</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Email sx={{ color: 'primary.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h6" fontWeight="bold">Email</Typography>
                    <Typography color="textSecondary">info@englishcenter.edu.vn</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationOn sx={{ color: 'primary.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h6" fontWeight="bold">Địa chỉ</Typography>
                    <Typography color="textSecondary">123 ABC Street, District 1, Ho Chi Minh City</Typography>
                  </Box>
                </Box>
              </Stack>

              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Theo dõi chúng tôi
                </Typography>
                <Stack direction="row" spacing={1}>
                  <IconButton color="primary">
                    <Facebook />
                  </IconButton>
                  <IconButton color="primary">
                    <Instagram />
                  </IconButton>
                  <IconButton color="primary">
                    <YouTube />
                  </IconButton>
                </Stack>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 4, borderRadius: 3 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Đăng ký tư vấn miễn phí
                </Typography>
                <Box component="form" sx={{ mt: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="textSecondary">
                        Họ và tên *
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="textSecondary">
                        Số điện thoại *
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="textSecondary">
                        Email
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="textSecondary">
                        Khóa học quan tâm
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Button 
                        variant="contained" 
                        fullWidth 
                        size="large"
                        sx={{ mt: 2 }}
                      >
                        Đăng ký ngay
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 6, bgcolor: 'grey.900', color: 'white' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <School sx={{ mr: 1, fontSize: 32 }} />
                <Typography variant="h5" fontWeight="bold">
                  {centerInfo.name}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.8, lineHeight: 1.6 }}>
                Trung tâm tiếng Anh hàng đầu với hơn {centerInfo.established} năm kinh nghiệm, 
                cam kết mang đến chất lượng giáo dục tốt nhất.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Liên kết nhanh
              </Typography>
              <Stack spacing={1}>
                <Button color="inherit" sx={{ justifyContent: 'flex-start', p: 0 }}>
                  Về chúng tôi
                </Button>
                <Button color="inherit" sx={{ justifyContent: 'flex-start', p: 0 }}>
                  Khóa học
                </Button>
                <Button color="inherit" sx={{ justifyContent: 'flex-start', p: 0 }}>
                  Giáo viên
                </Button>
                <Button color="inherit" sx={{ justifyContent: 'flex-start', p: 0 }}>
                  Liên hệ
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Thông tin liên hệ
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                📧 Email: info@englishcenter.edu.vn<br/>
                📞 Phone: 1900 123 456<br/>
                📍 Address: 123 ABC Street, District 1, HCM City
              </Typography>
            </Grid>
          </Grid>
          <Divider sx={{ my: 4, borderColor: 'grey.700' }} />
          <Typography variant="body2" textAlign="center" sx={{ opacity: 0.8 }}>
            © 2024 {centerInfo.name}. All rights reserved.
          </Typography>
        </Container>
      </Box>

      {/* Welcome Ad Popup - chỉ hiển thị khi chưa đăng nhập */}
      <WelcomeAdPopup
        open={showWelcomeAd}
        onClose={() => setShowWelcomeAd(false)}
        userRole={user?.role}
      />
    </Box>
  );
};

export default Home;
