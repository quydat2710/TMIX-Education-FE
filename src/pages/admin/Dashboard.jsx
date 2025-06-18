import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
} from '@mui/material';
import {
  School as SchoolIcon,
  Person as PersonIcon,
  Class as ClassIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { COLORS } from '../../utils/colors';
import DashboardLayout from '../../components/layouts/DashboardLayout';

const Dashboard = () => {
  const stats = [
    {
      title: 'Tổng số học viên',
      value: '150',
      icon: <SchoolIcon sx={{ fontSize: 40, color: COLORS.primary.main }} />,
      color: COLORS.primary.light,
    },
    {
      title: 'Tổng số giáo viên',
      value: '12',
      icon: <PersonIcon sx={{ fontSize: 40, color: COLORS.secondary.main }} />,
      color: COLORS.secondary.light,
    },
    {
      title: 'Tổng số lớp học',
      value: '25',
      icon: <ClassIcon sx={{ fontSize: 40, color: COLORS.success.main }} />,
      color: COLORS.success.light,
    },
    {
      title: 'Doanh thu tháng',
      value: '50,000,000 VND',
      icon: <TrendingUpIcon sx={{ fontSize: 40, color: COLORS.warning.main }} />,
      color: COLORS.warning.light,
    },
  ];

  return (
    <DashboardLayout role="admin">
      <Box>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>

        <Grid container spacing={3}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  bgcolor: stat.color,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    transition: 'transform 0.2s',
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h6" color="text.secondary">
                        {stat.title}
                      </Typography>
                      <Typography variant="h4" sx={{ mt: 1 }}>
                        {stat.value}
                      </Typography>
                    </Box>
                    <IconButton
                      sx={{
                        bgcolor: 'white',
                        '&:hover': { bgcolor: 'white' },
                      }}
                    >
                      {stat.icon}
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </DashboardLayout>
  );
};

export default Dashboard;
