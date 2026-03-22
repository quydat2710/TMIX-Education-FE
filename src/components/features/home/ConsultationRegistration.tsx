import React, { useState } from 'react';
import { Box, Grid, Typography, TextField, Button, Paper, MenuItem } from '@mui/material';
import { createRegistrationAPI } from '../../../services/registrations';
import NotificationSnackbar from '../../common/NotificationSnackbar';
import AnimatedSection from '../../common/AnimatedSection';

const ConsultationRegistration: React.FC = () => {
  const [form, setForm] = useState({ name: '', phone: '', email: '', gender: 'male' as 'male' | 'female', address: '', note: '' });
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const handleChange = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [key]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      setNotification({ open: true, message: 'Vui lòng nhập đầy đủ Họ tên và Email', severity: 'error' });
      return;
    }
    try {
      setSubmitting(true);
      await createRegistrationAPI({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        gender: form.gender,
        address: form.address.trim(),
        note: form.note.trim(),
        processed: false,
        classId: '00000000-0000-0000-0000-000000000000'
      });
      setNotification({ open: true, message: 'Đăng ký tư vấn thành công! Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.', severity: 'success' });
      setForm({ name: '', phone: '', email: '', gender: 'male', address: '', note: '' });
    } catch (e) {
      setNotification({ open: true, message: 'Đăng ký thất bại. Vui lòng thử lại sau.', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        py: { xs: 6, md: 8 },
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #0F1F33 0%, #1E3A5F 50%, #2D4A6F 100%)',
      }}
    >
      {/* Floating decorative shapes */}
      <Box
        className="float-shape"
        sx={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(211,47,47,0.15) 0%, transparent 70%)',
          filter: 'blur(20px)',
        }}
      />
      <Box
        className="float-shape"
        sx={{
          position: 'absolute',
          bottom: '15%',
          right: '8%',
          width: 180,
          height: 180,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(25,118,210,0.12) 0%, transparent 70%)',
          filter: 'blur(30px)',
          animationDelay: '2s',
        }}
      />
      <Box
        className="float-shape"
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
          filter: 'blur(15px)',
          animationDelay: '4s',
        }}
      />

      <Grid container maxWidth="lg" sx={{ mx: 'auto', position: 'relative', zIndex: 1 }} spacing={4} alignItems="center">
        {/* Left side — info */}
        <Grid item xs={12} md={7}>
          <AnimatedSection variant="fadeLeft">
            <Box sx={{
              display: { xs: 'none', md: 'flex' },
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 5,
              minHeight: 340,
            }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  variant="overline"
                  sx={{
                    color: 'rgba(255,255,255,0.6)',
                    fontWeight: 600,
                    letterSpacing: 3,
                    fontSize: '0.8rem',
                    mb: 2,
                    display: 'block',
                  }}
                >
                  BẮT ĐẦU HÀNH TRÌNH
                </Typography>
                <Typography
                  variant="h3"
                  fontWeight={800}
                  gutterBottom
                  sx={{
                    color: '#fff',
                    letterSpacing: '-0.5px',
                    fontSize: { xs: '2rem', md: '2.5rem' },
                  }}
                >
                  TMix{' '}
                  <Box
                    component="span"
                    sx={{
                      background: 'linear-gradient(135deg, #FF6659, #D32F2F)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Education
                  </Box>
                </Typography>
                <Box sx={{ width: 60, height: 4, background: 'linear-gradient(90deg, #D32F2F, #FF6659)', mx: 'auto', mb: 3, borderRadius: 2 }} />
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.75)', maxWidth: 420, mx: 'auto', lineHeight: 1.9 }}>
                  Đăng ký tư vấn để được hỗ trợ tìm khóa học phù hợp nhất với trình độ và mục tiêu của bạn.
                </Typography>

                {/* Feature pills */}
                <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', mt: 3, flexWrap: 'wrap' }}>
                  {['Miễn phí tư vấn', 'Hỗ trợ 24/7', 'Cam kết đầu ra'].map((text) => (
                    <Box
                      key={text}
                      sx={{
                        px: 2,
                        py: 0.8,
                        borderRadius: 3,
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: 'rgba(255,255,255,0.85)',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                      }}
                    >
                      ✓ {text}
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </AnimatedSection>
        </Grid>

        {/* Right side — form */}
        <Grid item xs={12} md={5}>
          <AnimatedSection variant="fadeRight" delay={0.2}>
            <Paper
              elevation={0}
              sx={{
                p: 3.5,
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                border: '1px solid rgba(255,255,255,0.5)',
              }}
            >
              <Typography
                variant="h5"
                fontWeight={800}
                sx={{
                  mb: 0.5,
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #D32F2F, #1E3A5F)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                ĐĂNG KÝ NHẬN TƯ VẤN
              </Typography>
              <Typography
                variant="body2"
                sx={{ textAlign: 'center', color: '#888', mb: 2.5, fontSize: '0.85rem' }}
              >
                Điền thông tin để được tư vấn miễn phí
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField placeholder="Họ Tên *" value={form.name} onChange={handleChange('name')} fullWidth size="small" />
                <TextField placeholder="Email *" type="email" value={form.email} onChange={handleChange('email')} fullWidth size="small" />
                <TextField placeholder="Số điện thoại" value={form.phone} onChange={handleChange('phone')} fullWidth size="small" />
                <TextField select placeholder="Giới tính" value={form.gender} onChange={handleChange('gender')} fullWidth size="small">
                  <MenuItem value="male">Nam</MenuItem>
                  <MenuItem value="female">Nữ</MenuItem>
                </TextField>
                <TextField placeholder="Địa chỉ" value={form.address} onChange={handleChange('address')} fullWidth size="small" />
                <TextField placeholder="Ghi chú (nếu có)" value={form.note} onChange={handleChange('note')} fullWidth multiline rows={2} size="small" />

                {/* Glow CTA Button */}
                <Button
                  className="glow-btn"
                  variant="contained"
                  size="large"
                  onClick={handleSubmit}
                  disabled={submitting}
                  sx={{
                    mt: 1,
                    py: 1.5,
                    borderRadius: 3,
                    fontWeight: 700,
                    fontSize: '1rem',
                    letterSpacing: 1,
                    background: 'linear-gradient(135deg, #D32F2F 0%, #e53935 50%, #FF6659 100%)',
                    border: 'none',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      background: 'linear-gradient(135deg, #c62828 0%, #D32F2F 50%, #e53935 100%)',
                    },
                    '&:disabled': {
                      animation: 'none',
                    },
                  }}
                >
                  🚀 ĐĂNG KÝ NGAY
                </Button>
              </Box>
            </Paper>
          </AnimatedSection>
        </Grid>
      </Grid>

      <NotificationSnackbar
        open={notification.open}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
        message={notification.message}
        severity={notification.severity}
        title={notification.severity === 'success' ? 'Thành công' : 'Lỗi'}
        autoHideDuration={4000}
      />
    </Box>
  );
};

export default ConsultationRegistration;
