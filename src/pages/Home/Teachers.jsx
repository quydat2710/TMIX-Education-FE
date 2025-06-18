import React from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, CardMedia, Avatar } from '@mui/material';
import HomeHeader from './HomeHeader';
import Footer from './Footer';

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

const Teachers = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <HomeHeader />
      <Box sx={{ flex: 1, pt: 8 }}>
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Typography variant="h3" component="h1" gutterBottom align="center">
            Đội ngũ giảng viên
          </Typography>
          <Typography variant="h6" color="text.secondary" paragraph align="center" sx={{ mb: 6 }}>
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
                        objectFit: 'cover'
                      }}
                    />
                  </Box>
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="h2">
                      {teacher.name}
                    </Typography>
                    <Typography variant="subtitle1" color="primary" gutterBottom>
                      {teacher.role}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {teacher.experience}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {teacher.education}
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {teacher.description}
                    </Typography>
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

export default Teachers;
