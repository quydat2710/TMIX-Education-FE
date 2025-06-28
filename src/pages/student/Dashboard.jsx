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
  LinearProgress,
  Alert,
  Chip,
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
  getLoggedInStudentSchedule,
  getStudentAttendanceAPI,
  getPaymentsByStudentAPI,
} from '../../services/api';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalClasses: 0,
    activeClasses: 0,
    totalLessons: 0,
    attendedLessons: 0,
    attendanceRate: 0,
    upcomingClasses: 0,
    totalFees: 0,
    paidFees: 0,
  });
  const [schedule, setSchedule] = useState([]);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Get student ID from localStorage
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const studentId = userData.studentId || userData.id;

      if (!studentId) {
        setError('Không tìm thấy thông tin học sinh');
        return;
      }

      // Fetch data in parallel
      const [scheduleRes, attendanceRes, paymentsRes] = await Promise.all([
        getLoggedInStudentSchedule(),
        getStudentAttendanceAPI(studentId),
        getPaymentsByStudentAPI(studentId, { limit: 5, sortBy: 'date', sortOrder: 'desc' }),
      ]);

      const scheduleData = scheduleRes?.data || [];
      const attendanceData = attendanceRes?.data || [];
      const payments = paymentsRes?.data?.payments || [];

      // Calculate statistics
      const activeClasses = scheduleData.filter(c => c.status === 'active').length;
      const totalLessons = attendanceData.reduce((sum, a) => sum + (a.totalLessons || 0), 0);
      const attendedLessons = attendanceData.reduce((sum, a) => sum + (a.attendedLessons || 0), 0);
      const attendanceRate = totalLessons > 0 ? Math.round((attendedLessons / totalLessons) * 100) : 0;

      const totalFees = payments.reduce((sum, p) => sum + (p.finalAmount || 0), 0);
      const paidFees = payments.reduce((sum, p) => sum + (p.paidAmount || 0), 0);

      // Get upcoming classes for today and tomorrow
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const upcoming = scheduleData.filter(c => {
        if (c.status !== 'active') return false;
        const classDate = new Date(c.schedule?.startDate);
        return classDate >= today && classDate <= tomorrow;
      }).slice(0, 3);

      setStats({
        totalClasses: scheduleData.length,
        activeClasses,
        totalLessons,
        attendedLessons,
        attendanceRate,
        upcomingClasses: upcoming.length,
        totalFees,
        paidFees,
      });

      setSchedule(scheduleData);
      setUpcomingClasses(upcoming);
      setRecentPayments(payments.slice(0, 3));
    } catch (err) {
      console.error('Error fetching student dashboard data:', err);
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
      <DashboardLayout role="student">
        <Box sx={{ py: 4 }}>
          <LinearProgress />
          <Typography sx={{ textAlign: 'center', mt: 2 }}>Đang tải dữ liệu dashboard...</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student">
      <Box>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: COLORS.primary.main }}>
          Dashboard Học sinh
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
              title="Lớp đang học"
              value={stats.activeClasses}
              icon={<ClassIcon sx={{ fontSize: 40 }} />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Tỷ lệ tham gia"
              value={`${stats.attendanceRate}%`}
              icon={<SchoolIcon sx={{ fontSize: 40 }} />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Buổi học đã tham gia"
              value={`${stats.attendedLessons}/${stats.totalLessons}`}
              icon={<TimeIcon sx={{ fontSize: 40 }} />}
              color="info"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Học phí đã đóng"
              value={formatCurrency(stats.paidFees)}
              icon={<PaymentIcon sx={{ fontSize: 40 }} />}
              color="warning"
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
              title="Tổng học phí"
              value={formatCurrency(stats.totalFees)}
              icon={<PaymentIcon sx={{ fontSize: 40 }} />}
              color="error"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Còn thiếu"
              value={formatCurrency(stats.totalFees - stats.paidFees)}
              icon={<TrendingUpIcon sx={{ fontSize: 40 }} />}
              color="warning"
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
                                {classItem.teacherId?.userId?.name || classItem.teacherId?.name || 'N/A'} • Phòng {classItem.room}
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
                Thanh toán học phí gần đây
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
                                Số tiền: {formatCurrency(payment.finalAmount || 0)}
                              </Typography>
                              <Typography variant="body2" fontWeight="600" color="success.main">
                                Đã đóng: {formatCurrency(payment.paidAmount || 0)}
                              </Typography>
                            </Box>
                          }
                        />
                        <Chip
                          label={payment.status === 'paid' ? 'Đã thanh toán' : payment.status === 'partial' ? 'Thanh toán một phần' : 'Chưa thanh toán'}
                          color={payment.status === 'paid' ? 'success' : payment.status === 'partial' ? 'warning' : 'error'}
                          size="small"
                        />
                      </ListItem>
                      {index < recentPayments.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  Chưa có thanh toán nào
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
