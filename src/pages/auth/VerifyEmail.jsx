import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, CircularProgress, Alert, Paper } from '@mui/material';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import { verifyEmailAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const getProfilePath = (role) => {
  switch (role) {
    case 'admin': return '/admin/profile';
    case 'teacher': return '/teacher/profile';
    case 'student': return '/student/profile';
    case 'parent': return '/parent/profile';
    default: return '/';
  }
};

const VerifyEmail = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    let timer;
    if (success) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 1) {
            clearInterval(timer);
            // Điều hướng về trang cá nhân và truyền state để reload dữ liệu
            navigate(getProfilePath(user?.role), { state: { reload: true } });
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [success, navigate, user]);

  const handleVerify = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);
    setCountdown(5);
    try {
      // Giả sử token xác thực lấy từ query string hoặc localStorage tuỳ backend
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token') || localStorage.getItem('verify_email_token');
      if (!token) {
        setError('Không tìm thấy mã xác thực email.');
        setLoading(false);
        return;
      }
      await verifyEmailAPI(token);
      setSuccess(true);
    } catch (err) {
      setError(err?.response?.data?.message || 'Xác thực email thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" bgcolor="#f5f6fa">
      <Paper elevation={3} sx={{ p: 5, maxWidth: 400, width: '100%', textAlign: 'center' }}>
        <MarkEmailReadIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        <Typography variant="h5" fontWeight={600} mb={1}>
          Xác thực email
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={3}>
          Vui lòng nhấn nút bên dưới để xác thực email của bạn.
        </Typography>
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Xác thực email thành công!<br />
            Đang chuyển về trang cá nhân sau {countdown} giây...
          </Alert>
        )}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleVerify}
          disabled={loading || success}
          sx={{ minWidth: 180, fontWeight: 600 }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Xác thực email'}
        </Button>
      </Paper>
    </Box>
  );
};

export default VerifyEmail;
