import React, { useState } from 'react';
import { Box, Grid, Typography, TextField, Button, Paper, MenuItem } from '@mui/material';
import { createRegistrationAPI } from '../../../services/registrations';
import NotificationSnackbar from '../../common/NotificationSnackbar';

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
        classId: '00000000-0000-0000-0000-000000000000' // UUID mặc định cho tư vấn chung
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
    <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: '#fff' }}>
      <Grid container maxWidth="lg" sx={{ mx: 'auto' }} spacing={4} alignItems="center">
        <Grid item xs={12} md={7}>
          <Box sx={{
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1E3A5F 0%, #0F1F33 100%)',
            borderRadius: 3,
            p: 5,
            minHeight: 340,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'radial-gradient(circle at 30% 70%, rgba(211,47,47,0.15) 0%, transparent 60%)',
            },
          }}>
            <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
              <Typography variant="h3" fontWeight={800} gutterBottom sx={{ color: '#fff', letterSpacing: '-0.5px' }}>
                TMix Education
              </Typography>
              <Box sx={{ width: 50, height: 4, bgcolor: '#D32F2F', mx: 'auto', mb: 2, borderRadius: 2 }} />
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.85)', maxWidth: 420, mx: 'auto', lineHeight: 1.9 }}>
                Đăng ký tư vấn để được hỗ trợ tìm khóa học phù hợp nhất với trình độ và mục tiêu của bạn.
              </Typography>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper elevation={4} sx={{ p: 3, borderRadius: 3, borderTop: '4px solid #D32F2F' }}>
            <Typography variant="h5" fontWeight={800} sx={{ mb: 2, textAlign: 'center', color: '#D32F2F' }}>
              ĐĂNG KÝ NHẬN TƯ VẤN
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField placeholder="Họ Tên *" value={form.name} onChange={handleChange('name')} fullWidth />
              <TextField placeholder="Email *" type="email" value={form.email} onChange={handleChange('email')} fullWidth />
              <TextField placeholder="Số điện thoại" value={form.phone} onChange={handleChange('phone')} fullWidth />
              <TextField select placeholder="Giới tính" value={form.gender} onChange={handleChange('gender')} fullWidth>
                <MenuItem value="male">Nam</MenuItem>
                <MenuItem value="female">Nữ</MenuItem>
              </TextField>
              <TextField placeholder="Địa chỉ" value={form.address} onChange={handleChange('address')} fullWidth />
              <TextField placeholder="Ghi chú (nếu có)" value={form.note} onChange={handleChange('note')} fullWidth multiline rows={2} />
              <Button variant="contained" color="error" size="large" onClick={handleSubmit} disabled={submitting} sx={{ mt: 1 }}>
                ĐĂNG KÝ NGAY
              </Button>
            </Box>
          </Paper>
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
