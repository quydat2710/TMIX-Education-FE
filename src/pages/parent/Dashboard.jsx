import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layouts/DashboardLayout';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout role="parent">
      <Box>
        <Typography variant="h4" gutterBottom>
          Tổng quan
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Đây là trang quản lý thông tin con của bạn
        </Typography>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Con của tôi
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Xem thông tin học tập và tiến độ của con
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Thanh toán
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Xem lịch sử thanh toán và hóa đơn học phí
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
};

export default Dashboard;
