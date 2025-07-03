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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
import { commonStyles } from '../../utils/styles';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import { getTeacherDashboardAPI } from '../../services/api';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalStudents: 0,
    teachingClasses: 0,
    closedClasses: 0,
    upcomingClasses: 0,
    totalSalary: 0,
    paidSalary: 0,
    unpaidSalary: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const teacherId = userData.teacherId || userData.id;
      if (!teacherId) {
        setError('Không tìm thấy thông tin giáo viên');
        setLoading(false);
        return;
      }
      const res = await getTeacherDashboardAPI(teacherId);
      const d = res.data?.data || res.data;
      setStats({
        totalStudents: d.totalStudent,
        teachingClasses: d.teachingClasses,
        closedClasses: d.closedClasses,
        upcomingClasses: d.upcomingClasses,
        totalSalary: d.paymentInfo?.[0]?.totalSalary,
        paidSalary: d.paymentInfo?.[0]?.totalPaidAmount,
        unpaidSalary: d.paymentInfo?.[0]?.totalUnPaidAmount,
      });
    } catch (err) {
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

  const formatSchedule = (schedule) => {
    if (!schedule) return { dayText: 'Chưa có lịch', timeText: '' };

    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const days = schedule.dayOfWeeks || [];
    const timeSlots = schedule.timeSlots || {};

    const dayText = days.length > 0
      ? days.map(day => dayNames[day] || `Thứ ${day}`).join(', ')
      : 'Chưa có lịch';

    const timeText = timeSlots.startTime && timeSlots.endTime
      ? `${formatTime(timeSlots.startTime)} - ${formatTime(timeSlots.endTime)}`
      : '';

    return { dayText, timeText };
  };

  if (loading) {
    return (
      <DashboardLayout role="teacher">
        <Box sx={commonStyles.pageContainer}>
          <Box sx={commonStyles.contentContainer}>
            <LinearProgress />
            <Typography sx={{ textAlign: 'center', mt: 2 }}>Đang tải dữ liệu dashboard...</Typography>
          </Box>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="teacher">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <Box sx={commonStyles.pageHeader}>
            <Typography sx={commonStyles.pageTitle}>
              Dashboard Giáo viên
            </Typography>
          </Box>

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
              title="Tổng học viên"
              value={stats.totalStudents}
              icon={<SchoolIcon sx={{ fontSize: 40 }} />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Lớp đang dạy"
              value={stats.teachingClasses}
              icon={<ClassIcon sx={{ fontSize: 40 }} />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Lớp đã kết thúc"
              value={stats.closedClasses}
              icon={<ClassIcon sx={{ fontSize: 40 }} />}
              color="warning"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Lớp sắp tới"
              value={stats.upcomingClasses}
              icon={<ScheduleIcon sx={{ fontSize: 40 }} />}
              color="info"
            />
          </Grid>
        </Grid>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Tổng lương"
              value={formatCurrency(stats.totalSalary)}
              icon={<PaymentIcon sx={{ fontSize: 40 }} />}
              color="secondary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Lương đã nhận"
              value={formatCurrency(stats.paidSalary)}
              icon={<TrendingUpIcon sx={{ fontSize: 40 }} />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Lương chưa nhận"
              value={formatCurrency(stats.unpaidSalary)}
              icon={<PaymentIcon sx={{ fontSize: 40 }} />}
              color="error"
            />
          </Grid>
        </Grid>

        {/* Content Sections */}
        <Grid container spacing={3}>
          {/* Active Classes */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ color: COLORS.primary.main, fontWeight: 600 }}>
                Lớp học đang dạy
              </Typography>
              {/* Active classes section content remains unchanged */}
            </Paper>
            </Grid>

          {/* Recent Payments */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ color: COLORS.secondary.main, fontWeight: 600 }}>
                Thanh toán lương gần đây
                </Typography>
              {/* Recent payments section content remains unchanged */}
            </Paper>
          </Grid>
        </Grid>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default Dashboard;
