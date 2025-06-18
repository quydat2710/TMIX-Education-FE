import React from 'react';
import { Box, Container, Typography, Grid, Paper } from '@mui/material';
import HomeHeader from './HomeHeader';
import Footer from './Footer';

const About = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <HomeHeader />
      <Box sx={{ flex: 1, pt: 8 }}>
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Typography variant="h3" component="h1" gutterBottom align="center">
            Về chúng tôi
          </Typography>
          <Typography variant="h6" color="text.secondary" paragraph align="center" sx={{ mb: 6 }}>
            Tìm hiểu thêm về English Center
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 4, height: '100%' }}>
                <Typography variant="h5" gutterBottom>
                  Sứ mệnh
                </Typography>
                <Typography paragraph>
                  Chúng tôi cam kết mang đến chất lượng đào tạo tiếng Anh tốt nhất, giúp học viên tự tin giao tiếp và đạt được mục tiêu học tập của mình.
                </Typography>
                <Typography variant="h5" gutterBottom>
                  Tầm nhìn
                </Typography>
                <Typography paragraph>
                  Trở thành trung tâm đào tạo tiếng Anh hàng đầu, được tin tưởng bởi học viên và đối tác.
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 4, height: '100%' }}>
                <Typography variant="h5" gutterBottom>
                  Giá trị cốt lõi
                </Typography>
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
                <Typography variant="h5" gutterBottom>
                  Lịch sử phát triển
                </Typography>
                <Typography paragraph>
                  English Center được thành lập năm 2010 với sứ mệnh mang đến chất lượng đào tạo tiếng Anh tốt nhất cho học viên Việt Nam.
                  Trải qua hơn 10 năm phát triển, chúng tôi đã đào tạo hơn 10,000 học viên và trở thành đối tác tin cậy của nhiều doanh nghiệp.
                </Typography>
                <Typography paragraph>
                  Với đội ngũ giảng viên giàu kinh nghiệm và phương pháp giảng dạy hiện đại, chúng tôi cam kết mang đến trải nghiệm học tập tốt nhất cho mọi học viên.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
};

export default About;
