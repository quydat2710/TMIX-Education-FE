import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import SchoolIcon from '@mui/icons-material/School';
import PaymentIcon from '@mui/icons-material/Payment';
import { commonStyles } from '../../utils/styles';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <DashboardLayout role="parent">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <Box sx={commonStyles.pageHeader}>
            <Typography sx={commonStyles.pageTitle}>
              Tổng quan
            </Typography>
          </Box>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Đây là trang quản lý thông tin con của bạn
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SchoolIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Con của tôi
                    </Typography>
                  </Box>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    Xem thông tin học tập và tiến độ của con
                  </Typography>
                  <Button
                    variant="contained"
                    sx={commonStyles.primaryButton}
                    onClick={() => navigate('/parent/children')}
                  >
                    Xem chi tiết
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PaymentIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Thanh toán
                    </Typography>
                  </Box>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    Xem lịch sử thanh toán và hóa đơn học phí
                  </Typography>
                  <Button
                    variant="contained"
                    sx={commonStyles.primaryButton}
                    onClick={() => navigate('/parent/payments')}
                  >
                    Xem chi tiết
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default Dashboard;
