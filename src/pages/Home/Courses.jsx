import React from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, CardMedia, Button } from '@mui/material';
import HomeHeader from './HomeHeader';
import Footer from './Footer';

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

const Courses = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <HomeHeader />
      <Box sx={{ flex: 1, pt: 8 }}>
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Typography variant="h3" component="h1" gutterBottom align="center">
            Khóa học
          </Typography>
          <Typography variant="h6" color="text.secondary" paragraph align="center" sx={{ mb: 6 }}>
            Khám phá các khóa học chất lượng của chúng tôi
          </Typography>

          <Grid container spacing={4}>
            {courses.map((course) => (
              <Grid item key={course.id} xs={12} md={4}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={course.image}
                    alt={course.title}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="h2">
                      {course.title}
                    </Typography>
                    <Typography paragraph>
                      {course.description}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Trình độ: {course.level}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Thời lượng: {course.duration}
                    </Typography>
                    <Typography variant="h6" color="primary" paragraph>
                      {course.price}
                    </Typography>
                    <Button variant="contained" color="primary" fullWidth>
                      Đăng ký ngay
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
};

export default Courses;
