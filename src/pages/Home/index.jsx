import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
} from '@mui/material';
import { COLORS } from '../../utils/colors';
import { commonStyles } from '../../utils/styles';
import DashboardLayout from '../../components/layouts/DashboardLayout';

const Home = () => {
  const courses = [
    {
      id: 1,
      title: 'Khóa học A1',
      description: 'Khóa học tiếng Anh cơ bản cho người mới bắt đầu',
      image: 'https://via.placeholder.com/300x200',
      price: '2,000,000 VNĐ',
    },
    {
      id: 2,
      title: 'Khóa học A2',
      description: 'Khóa học tiếng Anh sơ cấp',
      image: 'https://via.placeholder.com/300x200',
      price: '2,500,000 VNĐ',
    },
    {
      id: 3,
      title: 'Khóa học B1',
      description: 'Khóa học tiếng Anh trung cấp',
      image: 'https://via.placeholder.com/300x200',
      price: '3,000,000 VNĐ',
    },
  ];

  return (
    <DashboardLayout>
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          {/* Hero Section */}
          <Box
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

          {/* Courses Section */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h4"
              sx={{
                mb: 3,
                fontWeight: 'bold',
                color: COLORS.text,
              }}
            >
              Khóa học nổi bật
            </Typography>
            <Grid container spacing={3}>
              {courses.map((course) => (
                <Grid item xs={12} md={4} key={course.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
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
                      <Typography
                        gutterBottom
                        variant="h5"
                        component="h2"
                        sx={{ fontWeight: 'bold' }}
                      >
                        {course.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        {course.description}
                      </Typography>
                      <Typography
                        variant="h6"
                        color="primary"
                        sx={{ fontWeight: 'bold' }}
                      >
                        {course.price}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Features Section */}
          <Box>
            <Typography
              variant="h4"
              sx={{
                mb: 3,
                fontWeight: 'bold',
                color: COLORS.text,
              }}
            >
              Tại sao chọn chúng tôi?
            </Typography>
            <Grid container spacing={3}>
              {[
                {
                  title: 'Giáo viên chất lượng',
                  description: 'Đội ngũ giảng viên giàu kinh nghiệm, nhiệt tình',
                },
                {
                  title: 'Phương pháp hiện đại',
                  description: 'Áp dụng công nghệ và phương pháp giảng dạy tiên tiến',
                },
                {
                  title: 'Môi trường học tập',
                  description: 'Cơ sở vật chất hiện đại, môi trường học tập thân thiện',
                },
              ].map((feature, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Card sx={{ height: '100%', p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{ mb: 2, fontWeight: 'bold' }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default Home;
