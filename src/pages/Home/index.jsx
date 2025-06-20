import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Paper,
  Avatar,
  TextField,
  Button,
} from '@mui/material';
import { commonStyles } from '../../utils/styles';
import HomeHeader from './HomeHeader';
import Footer from './Footer';
import Advertisement from '../../components/advertisement/Advertisement';
import AdvertisementSlider from '../../components/advertisement/AdvertisementSlider';
import WelcomeAdPopup from '../../components/advertisement/WelcomeAdPopup';
import { useAuth } from '../../contexts/AuthContext';
import { useState, useEffect } from 'react';

const courses = [
  {
    id: 1,
    title: 'Tiếng Anh Giao Tiếp',
    description: 'Khóa học giúp học viên tự tin giao tiếp tiếng Anh trong các tình huống hàng ngày',
    image: 'https://source.unsplash.com/random/400x300?english',
    level: 'Cơ bản đến Nâng cao',
    duration: '3 tháng',
    price: '2.500.000 VNĐ'
  },
  {
    id: 2,
    title: 'Luyện Thi IELTS',
    description: 'Chương trình luyện thi IELTS chuyên sâu với giáo viên bản ngữ',
    image: 'https://source.unsplash.com/random/400x300?ielts',
    level: 'Trung cấp',
    duration: '6 tháng',
    price: '5.000.000 VNĐ'
  },
  {
    id: 3,
    title: 'Tiếng Anh Doanh Nghiệp',
    description: 'Khóa học tiếng Anh chuyên ngành dành cho doanh nghiệp',
    image: 'https://source.unsplash.com/random/400x300?business',
    level: 'Trung cấp đến Nâng cao',
    duration: '4 tháng',
    price: '4.000.000 VNĐ'
  }
];

const teachers = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Giảng viên IELTS',
    experience: '8 năm kinh nghiệm',
    education: 'Thạc sĩ Ngôn ngữ học, Đại học Cambridge',
    image: 'https://source.unsplash.com/random/400x400?teacher1',
    description: 'Chuyên gia luyện thi IELTS với nhiều học viên đạt điểm cao'
  },
  {
    id: 2,
    name: 'Michael Brown',
    role: 'Giảng viên Giao tiếp',
    experience: '5 năm kinh nghiệm',
    education: 'Cử nhân Giáo dục, Đại học Oxford',
    image: 'https://source.unsplash.com/random/400x400?teacher2',
    description: 'Chuyên gia về phương pháp giảng dạy tiếng Anh giao tiếp'
  },
  {
    id: 3,
    name: 'Emma Wilson',
    role: 'Giảng viên Doanh nghiệp',
    experience: '6 năm kinh nghiệm',
    education: 'MBA, Đại học Harvard',
    image: 'https://source.unsplash.com/random/400x400?teacher3',
    description: 'Chuyên gia về tiếng Anh thương mại và đàm phán'
  }
];

const Home = () => {
  const { user } = useAuth();
  const [showWelcomeAd, setShowWelcomeAd] = useState(false);

  useEffect(() => {
    const adShown = sessionStorage.getItem('welcomeAdShown');
    if (!adShown) {
      const timer = setTimeout(() => {
        setShowWelcomeAd(true);
      }, 2000); // Hiển thị sau 2 giây
      return () => clearTimeout(timer);
    }
  }, []);

  const handleCloseWelcomeAd = () => {
    sessionStorage.setItem('welcomeAdShown', 'true');
    setShowWelcomeAd(false);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f7f9fb' }}>
      <WelcomeAdPopup
        open={showWelcomeAd}
        onClose={handleCloseWelcomeAd}
        userRole={user?.role}
      />
      <HomeHeader sx={{ bgcolor: '#fff', borderBottom: '1px solid #eee' }} />
      <Box sx={{ width: '100%' }}>
        <Box sx={commonStyles.contentContainer}>
          {/* Hero Section */}
          <Box id="hero-section"
            sx={{
              position: 'relative',
              height: '400px',
              borderRadius: 2,
              overflow: 'hidden',
              mb: 4,
            }}
          >
            <Box
              component="img"
              src="https://via.placeholder.com/1920x400"
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'white',
                textAlign: 'center',
                p: 3,
              }}
            >
              <Typography variant="h3" sx={{ mb: 2, fontWeight: 'bold' }}>
                Chào mừng đến với Trung tâm Anh ngữ
              </Typography>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Nơi ươm mầm tài năng, phát triển tương lai
              </Typography>
              <Button
                variant="contained"
                size="large"
                sx={{
                  ...commonStyles.primaryButton,
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                }}
              >
                Tìm hiểu thêm
              </Button>
            </Box>
          </Box>

          {/* Advertisement Banner */}
          <Box sx={{ mb: 6 }}>
            <AdvertisementSlider userRole={user?.role} />
          </Box>

          {/* Teachers Section */}
          <Box id="teachers-section" sx={{ mb: 6 }}>
            <Typography
              variant="h3"
              align="center"
              gutterBottom
              sx={{ fontWeight: 'bold' }}
            >
              Đội ngũ giảng viên
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              paragraph
              align="center"
              sx={{ mb: 6 }}
            >
              Gặp gỡ đội ngũ giảng viên chuyên nghiệp của chúng tôi
            </Typography>
            <Grid container spacing={4}>
              {teachers.map((teacher) => (
                <Grid item key={teacher.id} xs={12} md={4}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ position: 'relative', paddingTop: '100%' }}>
                      <CardMedia
                        component="img"
                        image={teacher.image}
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
                    </Box>
                    <CardContent>
                      <Typography
                        gutterBottom
                        variant="h5"
                        component="h2"
                      >
                        {teacher.name}
                      </Typography>
                      <Typography
                        variant="subtitle1"
                        color="primary"
                        gutterBottom
                      >
                        {teacher.role}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        paragraph
                      >
                        {teacher.experience}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        paragraph
                      >
                        {teacher.education}
                      </Typography>
                      <Typography variant="body1" paragraph>{teacher.description}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* About Section */}
          <Box id="about-section" sx={{ mb: 6 }}>
            <Typography
              variant="h3"
              align="center"
              gutterBottom
              sx={{ fontWeight: 'bold' }}
            >
              Về chúng tôi
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              paragraph
              align="center"
              sx={{ mb: 6 }}
            >
              Tìm hiểu thêm về English Center
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: 4, height: '100%' }}>
                  <Typography variant="h5" gutterBottom>Sứ mệnh</Typography>
                  <Typography paragraph>
                    Chúng tôi cam kết mang đến chất lượng đào tạo tiếng Anh tốt nhất, giúp học viên tự tin giao tiếp và đạt được mục tiêu học tập của mình.
                  </Typography>
                  <Typography variant="h5" gutterBottom>Tầm nhìn</Typography>
                  <Typography paragraph>
                    Trở thành trung tâm đào tạo tiếng Anh hàng đầu, được tin tưởng bởi học viên và đối tác.
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: 4, height: '100%' }}>
                  <Typography variant="h5" gutterBottom>Giá trị cốt lõi</Typography>
                  <Typography component="ul" sx={{ pl: 2 }}>
                    <li>Chất lượng đào tạo xuất sắc</li>
                    <li>Đội ngũ giảng viên chuyên nghiệp</li>
                    <li>Phương pháp giảng dạy hiện đại</li>
                    <li>Môi trường học tập thân thiện</li>
                    <li>Hỗ trợ học viên tận tâm</li>
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper elevation={3} sx={{ p: 4 }}>
                  <Typography variant="h5" gutterBottom>Lịch sử phát triển</Typography>
                  <Typography paragraph>
                    English Center được thành lập năm 2010 với sứ mệnh mang đến chất lượng đào tạo tiếng Anh tốt nhất cho học viên Việt Nam. Trải qua hơn 10 năm phát triển, chúng tôi đã đào tạo hơn 10,000 học viên và trở thành đối tác tin cậy của nhiều doanh nghiệp.
                  </Typography>
                  <Typography paragraph>
                    Với đội ngũ giảng viên giàu kinh nghiệm và phương pháp giảng dạy hiện đại, chúng tôi cam kết mang đến trải nghiệm học tập tốt nhất cho mọi học viên.
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Box>

        <Footer />
      </Box>
    </Box>
  );
};

export default Home;
