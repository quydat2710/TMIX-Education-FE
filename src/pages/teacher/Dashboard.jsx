import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Chip,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  Class as ClassIcon,
  AccessTime as TimeIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  Payment as PaymentIcon,
  Schedule as ScheduleIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { COLORS } from '../../utils/colors';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import {
  getMyClassesAPI,
  getTeacherPaymentsAPI,
  getTeacherScheduleAPI,
} from '../../services/api';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalClasses: 0,
    activeClasses: 0,
    totalStudents: 0,
    totalSalary: 0,
    paidSalary: 0,
    upcomingClasses: 0,
  });
  const [myClasses, setMyClasses] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [upcomingClasses, setUpcomingClasses] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Get teacher ID from localStorage
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const teacherId = userData.teacherId || userData.id;

      if (!teacherId) {
        setError('Không tìm thấy thông tin giáo viên');
        return;
      }

      // Fetch data in parallel
      const [classesRes, paymentsRes, scheduleRes] = await Promise.all([
        getMyClassesAPI(),
        getTeacherPaymentsAPI({ teacherId, limit: 5, sortBy: 'date', sortOrder: 'desc' }),
        getTeacherScheduleAPI(teacherId),
      ]);

      const classes = classesRes?.data || [];
      const payments = paymentsRes?.data || [];
      const schedule = scheduleRes?.data || [];

      // Calculate statistics
      const activeClasses = classes.filter(c => c.status === 'active').length;
      const totalStudents = classes.reduce((sum, c) => sum + (c.students?.length || 0), 0);
      const totalSalary = payments.reduce((sum, p) => sum + ((p.totalLessons || 0) * (p.salaryPerLesson || 0)), 0);
      const paidSalary = payments.reduce((sum, p) => sum + (p.paidAmount || 0), 0);

      // Get upcoming classes for today and tomorrow
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const upcoming = classes.filter(c => {
        if (c.status !== 'active') return false;
        const classDate = new Date(c.schedule?.startDate);
        return classDate >= today && classDate <= tomorrow;
      }).slice(0, 3);

      setStats({
        totalClasses: classes.length,
        activeClasses,
        totalStudents,
        totalSalary,
        paidSalary,
        upcomingClasses: upcoming.length,
      });

      setMyClasses(classes);
      setRecentPayments(payments.slice(0, 3));
      setUpcomingClasses(upcoming);
    } catch (err) {
      console.error('Error fetching teacher dashboard data:', err);
      setError('Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.substring(0, 5); // Get HH:MM format
  };

  if (loading) {
    return (
      <DashboardLayout role="teacher">
        <Box sx={{ py: 4 }}>
          <LinearProgress />
          <Typography sx={{ textAlign: 'center', mt: 2 }}>Đang tải dữ liệu dashboard...</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="teacher">
      <Box>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: COLORS.primary.main }}>
          Dashboard Giáo viên
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Stat Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Lớp đang dạy"
              value={stats.activeClasses}
              icon={<ClassIcon sx={{ fontSize: 40 }} />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Tổng học viên"
              value={stats.totalStudents}
              icon={<SchoolIcon sx={{ fontSize: 40 }} />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Tổng lương"
              value={formatCurrency(stats.totalSalary)}
              icon={<PaymentIcon sx={{ fontSize: 40 }} />}
              color="warning"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Đã nhận"
              value={formatCurrency(stats.paidSalary)}
              icon={<TrendingUpIcon sx={{ fontSize: 40 }} />}
              color="info"
            />
          </Grid>
        </Grid>

        {/* Additional Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Tổng lớp học"
              value={stats.totalClasses}
              icon={<ClassIcon sx={{ fontSize: 40 }} />}
              color="secondary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Lớp sắp tới"
              value={stats.upcomingClasses}
              icon={<ScheduleIcon sx={{ fontSize: 40 }} />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Còn lại"
              value={formatCurrency(stats.totalSalary - stats.paidSalary)}
              icon={<PaymentIcon sx={{ fontSize: 40 }} />}
              color="error"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Tỷ lệ nhận lương"
              value={`${stats.totalSalary > 0 ? Math.round((stats.paidSalary / stats.totalSalary) * 100) : 0}%`}
              icon={<TrendingUpIcon sx={{ fontSize: 40 }} />}
              color="success"
            />
          </Grid>
        </Grid>

        {/* Content Sections */}
        <Grid container spacing={3}>
          {/* Upcoming Classes */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ color: COLORS.primary.main, fontWeight: 600 }}>
                Lớp học sắp tới
              </Typography>
              {upcomingClasses.length > 0 ? (
                <List>
                  {upcomingClasses.map((classItem, index) => (
                    <React.Fragment key={classItem.id}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: COLORS.primary.main }}>
                            <ClassIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={classItem.name}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {formatDate(classItem.schedule?.startDate)} • {formatTime(classItem.schedule?.timeSlots?.startTime)} - {formatTime(classItem.schedule?.timeSlots?.endTime)}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {classItem.students?.length || 0} học viên • Phòng {classItem.room}
                              </Typography>
                            </Box>
                          }
                        />
                        <Chip
                          label={classItem.status === 'active' ? 'Đang hoạt động' : classItem.status}
                          color={classItem.status === 'active' ? 'success' : 'default'}
                          size="small"
                        />
                      </ListItem>
                      {index < upcomingClasses.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  Không có lớp học sắp tới
                </Typography>
              )}
            </Paper>
          </Grid>

          {/* Recent Payments */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ color: COLORS.secondary.main, fontWeight: 600 }}>
                Thanh toán lương gần đây
              </Typography>
              {recentPayments.length > 0 ? (
                <List>
                  {recentPayments.map((payment, index) => (
                    <React.Fragment key={payment.id || index}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: COLORS.secondary.main }}>
                            <PaymentIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`${payment.classId?.name || 'N/A'} - ${payment.month}/${payment.year}`}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {payment.totalLessons || 0} buổi × {formatCurrency(payment.salaryPerLesson || 0)}/buổi
                              </Typography>
                              <Typography variant="body2" fontWeight="600" color="success.main">
                                Đã nhận: {formatCurrency(payment.paidAmount || 0)}
                              </Typography>
                            </Box>
                          }
                        />
                        <Chip
                          label={payment.status === 'paid' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                          color={payment.status === 'paid' ? 'success' : 'warning'}
                          size="small"
                        />
                      </ListItem>
                      {index < recentPayments.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  Chưa có thanh toán lương nào
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
};

export default Dashboard;
