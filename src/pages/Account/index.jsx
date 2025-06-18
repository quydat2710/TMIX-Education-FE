import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Alert,
} from '@mui/material';
import { COLORS } from '../../utils/colors';
import { commonStyles } from '../../utils/styles';
import DashboardLayout from '../../components/layouts/DashboardLayout';

const Account = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChangePassword = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu mới không khớp');
      return;
    }

    // TODO: Implement password change logic
    setSuccess('Đổi mật khẩu thành công');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <DashboardLayout>
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <Typography
            variant="h4"
            sx={{
              mb: 4,
              fontWeight: 'bold',
              color: COLORS.text,
            }}
          >
            Quản lý tài khoản
          </Typography>

          <Grid container spacing={4}>
            {/* Change Password Section */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 3,
                    fontWeight: 'bold',
                    color: COLORS.text,
                  }}
                >
                  Đổi mật khẩu
                </Typography>

                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}

                {success && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    {success}
                  </Alert>
                )}

                <form onSubmit={handleChangePassword}>
                  <TextField
                    fullWidth
                    label="Mật khẩu hiện tại"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    sx={commonStyles.formField}
                    required
                  />

                  <TextField
                    fullWidth
                    label="Mật khẩu mới"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    sx={commonStyles.formField}
                    required
                  />

                  <TextField
                    fullWidth
                    label="Xác nhận mật khẩu mới"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    sx={commonStyles.formField}
                    required
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    sx={commonStyles.primaryButton}
                  >
                    Đổi mật khẩu
                  </Button>
                </form>
              </Paper>
            </Grid>

            {/* Account Information Section */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 3,
                    fontWeight: 'bold',
                    color: COLORS.text,
                  }}
                >
                  Thông tin tài khoản
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ color: COLORS.textSecondary }}
                  >
                    Email
                  </Typography>
                  <Typography variant="body1">user@example.com</Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ color: COLORS.textSecondary }}
                  >
                    Vai trò
                  </Typography>
                  <Typography variant="body1">Admin</Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ color: COLORS.textSecondary }}
                  >
                    Trạng thái
                  </Typography>
                  <Typography variant="body1">Đang hoạt động</Typography>
                </Box>

                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ color: COLORS.textSecondary }}
                  >
                    Ngày tạo
                  </Typography>
                  <Typography variant="body1">01/01/2024</Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default Account;
