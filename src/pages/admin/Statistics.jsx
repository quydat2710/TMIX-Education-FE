import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  useTheme
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { COLORS } from '../../utils/colors';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { commonStyles } from '../../utils/styles';

const Statistics = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    totalRevenue: 0,
    studentDistribution: [],
    classDistribution: [],
    revenueData: []
  });

  useEffect(() => {
    // TODO: Fetch real data from API
    const mockData = {
      totalStudents: 150,
      totalTeachers: 12,
      totalClasses: 25,
      totalRevenue: 50000000,
      studentDistribution: [
        { name: 'Beginner', value: 45 },
        { name: 'Intermediate', value: 65 },
        { name: 'Advanced', value: 40 }
      ],
      classDistribution: [
        { name: 'Speaking', value: 8 },
        { name: 'Grammar', value: 6 },
        { name: 'Writing', value: 5 },
        { name: 'Reading', value: 6 }
      ],
      revenueData: [
        { month: 'Jan', revenue: 4000000 },
        { month: 'Feb', revenue: 4500000 },
        { month: 'Mar', revenue: 5000000 },
        { month: 'Apr', revenue: 4800000 },
        { month: 'May', revenue: 5200000 },
        { month: 'Jun', revenue: 5500000 }
      ]
    };

    setStats(mockData);
    setLoading(false);
  }, []);

  const COLORS_CHART = [
    COLORS.primary.main,
    COLORS.secondary.main,
    COLORS.success.main,
    COLORS.warning.main,
    COLORS.error.main
  ];

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading statistics...</Typography>
      </Box>
    );
  }

  return (
    <DashboardLayout role="admin">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <Typography variant="h4" gutterBottom>
            Thống kê
      </Typography>

          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Students
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalStudents}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Teachers
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalTeachers}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Classes
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalClasses}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Revenue
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalRevenue.toLocaleString('vi-VN')} VND
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Charts */}
          <Grid container spacing={3}>
            {/* Student Distribution */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Student Distribution by Level" />
                <Divider />
                <CardContent>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.studentDistribution}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label
                        >
                          {stats.studentDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS_CHART[index % COLORS_CHART.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Class Distribution */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Class Distribution by Type" />
                <Divider />
                <CardContent>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.classDistribution}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label
                        >
                          {stats.classDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS_CHART[index % COLORS_CHART.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Revenue Chart */}
            <Grid item xs={12}>
              <Card>
                <CardHeader title="Monthly Revenue" />
                <Divider />
                <CardContent>
                  <Box sx={{ height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={stats.revenueData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="revenue" name="Revenue (VND)" fill={COLORS.primary.main} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
    </Box>
    </DashboardLayout>
  );
};

export default Statistics;
