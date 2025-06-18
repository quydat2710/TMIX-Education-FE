import React from 'react';
import { Box, Container, Typography, Grid, Paper, TextField, Button } from '@mui/material';
import HomeHeader from './HomeHeader';
import Footer from './Footer';

const Contact = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <HomeHeader />
      <Box sx={{ flex: 1, pt: 8 }}>
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Typography variant="h3" component="h1" gutterBottom align="center">
            Liên hệ
          </Typography>
          <Typography variant="h6" color="text.secondary" paragraph align="center" sx={{ mb: 6 }}>
            Hãy liên hệ với chúng tôi
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom>
                  Thông tin liên hệ
                </Typography>
                <Typography paragraph>
                  <strong>Địa chỉ:</strong> 123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh
                </Typography>
                <Typography paragraph>
                  <strong>Điện thoại:</strong> (028) 1234 5678
                </Typography>
                <Typography paragraph>
                  <strong>Email:</strong> info@englishcenter.com
                </Typography>
                <Typography paragraph>
                  <strong>Giờ làm việc:</strong><br />
                  Thứ 2 - Thứ 6: 8:00 - 21:00<br />
                  Thứ 7: 8:00 - 17:00<br />
                  Chủ nhật: 8:00 - 12:00
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom>
                  Gửi tin nhắn cho chúng tôi
                </Typography>
                <Box component="form" noValidate sx={{ mt: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        required
                        fullWidth
                        label="Họ và tên"
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        required
                        fullWidth
                        label="Email"
                        variant="outlined"
                        type="email"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        required
                        fullWidth
                        label="Số điện thoại"
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        required
                        fullWidth
                        label="Tiêu đề"
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        required
                        fullWidth
                        label="Nội dung"
                        variant="outlined"
                        multiline
                        rows={4}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        size="large"
                        fullWidth
                      >
                        Gửi tin nhắn
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
};

export default Contact;
