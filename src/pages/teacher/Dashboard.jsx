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
  getTeacherScheduleAPI,
  getTeacherPaymentsAPI,
  getClassByIdAPI,
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
      const [scheduleRes, paymentsRes] = await Promise.all([
        getTeacherScheduleAPI(teacherId),
        getTeacherPaymentsAPI({ teacherId, limit: 5 }),
      ]);

      console.log('scheduleRes:', scheduleRes);
      console.log('paymentsRes:', paymentsRes);

      const scheduleData = scheduleRes?.data || {};
      const classes = scheduleData.classes || [];
      const payments = paymentsRes?.data || [];

      // Get detailed class information
      const detailedClasses = [];
      for (const classItem of classes) {
        try {
          const classRes = await getClassByIdAPI(classItem.id);
          if (classRes?.data) {
            detailedClasses.push(classRes.data);
          }
        } catch (err) {
          console.error(`Error fetching class details for ${classItem.id}:`, err);
          // Add basic class info if detailed fetch fails
          detailedClasses.push({
            id: classItem.id,
            name: classItem.name,
            status: classItem.status || 'active',
            students: classItem.students || [],
            schedule: classItem.schedule,
            room: classItem.room,
          });
        }
      }

      // Calculate statistics
      const activeClasses = detailedClasses.filter(c => c.status === 'active').length;
      const totalStudents = detailedClasses.reduce((sum, c) => sum + (c.students?.length || 0), 0);
      const totalSalary = payments.reduce((sum, p) => sum + ((p.totalLessons || 0) * (p.salaryPerLesson || 0)), 0);
      const paidSalary = payments.reduce((sum, p) => sum + (p.paidAmount || 0), 0);

      // Get upcoming classes for today and tomorrow
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const upcoming = detailedClasses.filter(c => {
        if (c.status !== 'active') return false;
        const classDate = new Date(c.schedule?.startDate);
        return classDate >= today && classDate <= tomorrow;
      }).slice(0, 3);

      setStats({
        totalClasses: detailedClasses.length,
        activeClasses,
        totalStudents,
        totalSalary,
        paidSalary,
        upcomingClasses: upcoming.length,
      });

      setMyClasses(detailedClasses);
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

        <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
          Xin chào <strong>{JSON.parse(localStorage.getItem('userData') || '{}').name || 'Giáo viên'}</strong>, đây là thông tin giảng dạy của bạn
        </Typography>

        {/* Stat Cards - First Row */}
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
              title="Tổng học viên"
              value={stats.totalStudents}
              icon={<SchoolIcon sx={{ fontSize: 40 }} />}
              color="success"
            />
          </Grid>
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
              title="Lớp đã dạy"
              value={stats.totalClasses - stats.activeClasses}
              icon={<ClassIcon sx={{ fontSize: 40 }} />}
              color="success"
            />
          </Grid>
        </Grid>

        {/* Stat Cards - Second Row */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
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
              title="Tổng lương"
              value={formatCurrency(stats.totalSalary)}
              icon={<PaymentIcon sx={{ fontSize: 40 }} />}
              color="warning"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Lương đã nhận"
              value={formatCurrency(stats.paidSalary)}
              icon={<TrendingUpIcon sx={{ fontSize: 40 }} />}
              color="info"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Lương chưa nhận"
              value={formatCurrency(stats.totalSalary - stats.paidSalary)}
              icon={<PaymentIcon sx={{ fontSize: 40 }} />}
              color="error"
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
