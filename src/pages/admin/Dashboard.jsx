import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  School as SchoolIcon,
  Person as PersonIcon,
  Class as ClassIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Payment as PaymentIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { COLORS } from '../../utils/colors';
import { commonStyles } from '../../utils/styles';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import { getAdminDashboardAPI } from '../../services/api';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalStudent: 0,
    totalTeacher: 0,
    activeClasses: 0,
    upcomingClasses: 0,
    closedClasses: 0,
    totalRevenue: 0,
    totalPaidAmount: 0,
    totalUnPaidAmount: 0,
    teacherTotalSalary: 0,
    teacherPaidAmount: 0,
    teacherUnPaidAmount: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(''); // Clear any previous errors
    try {
      const res = await getAdminDashboardAPI();
      console.log('API response:', res.data);
      const d = res.data || {};
      console.log('d.totalStudent:', d.totalStudent);
      console.log('d.totalTeacher:', d.totalTeacher);
      console.log('d.activeClasses:', d.activeClasses);
      console.log('d.upcomingClasses:', d.upcomingClasses);
      console.log('d.closedClasses:', d.closedClasses);
      console.log('d.paymentInfo:', d.paymentInfo);
      console.log('d.paymentInfo[0]:', d.paymentInfo?.[0]);
      console.log('d.paymentInfo[0].totalRevenue:', d.paymentInfo?.[0]?.totalRevenue);
      console.log('d.teacherPaymentInfo:', d.teacherPaymentInfo);
      console.log('d.teacherPaymentInfo[0]:', d.teacherPaymentInfo?.[0]);
      console.log('d.teacherPaymentInfo[0].totalSalary:', d.teacherPaymentInfo?.[0]?.totalSalary);
      const newStats = {
        totalStudent: d.totalStudent,
        totalTeacher: d.totalTeacher,
        activeClasses: d.activeClasses,
        upcomingClasses: d.upcomingClasses,
        closedClasses: d.closedClasses,
        totalRevenue: d.paymentInfo?.[0]?.totalRevenue,
        totalPaidAmount: d.paymentInfo?.[0]?.totalPaidAmount,
        totalUnPaidAmount: d.paymentInfo?.[0]?.totalUnPaidAmount,
        teacherTotalSalary: d.teacherPaymentInfo?.[0]?.totalSalary,
        teacherPaidAmount: d.teacherPaymentInfo?.[0]?.totalPaidAmount,
        teacherUnPaidAmount: d.teacherPaymentInfo?.[0]?.totalUnPaidAmount,
      };
      console.log('Stats set:', newStats);
      setStats(newStats);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'paid': return 'Đã thanh toán';
      case 'pending': return 'Chờ thanh toán';
      case 'failed': return 'Thất bại';
      default: return status;
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="admin">
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
    <DashboardLayout role="admin">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <Box sx={commonStyles.pageHeader}>
            <Typography sx={commonStyles.pageTitle}>
              Dashboard Quản trị
            </Typography>
          </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Stat Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Tổng học viên"
              value={stats.totalStudent || 0}
              icon={<SchoolIcon sx={{ fontSize: 40 }} />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Tổng giáo viên"
              value={stats.totalTeacher || 0}
              icon={<PersonIcon sx={{ fontSize: 40 }} />}
              color="secondary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Lớp đang hoạt động"
              value={stats.activeClasses || 0}
              icon={<ClassIcon sx={{ fontSize: 40 }} />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Lớp sắp khai giảng"
              value={stats.upcomingClasses || 0}
              icon={<ClassIcon sx={{ fontSize: 40 }} />}
              color="info"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Lớp đã kết thúc"
              value={stats.closedClasses || 0}
              icon={<ClassIcon sx={{ fontSize: 40 }} />}
              color="warning"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Tổng doanh thu"
              value={formatCurrency(stats.totalRevenue || 0)}
              icon={<TrendingUpIcon sx={{ fontSize: 40 }} />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Đã thu"
              value={formatCurrency(stats.totalPaidAmount || 0)}
              icon={<TrendingUpIcon sx={{ fontSize: 40 }} />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Chưa thu"
              value={formatCurrency(stats.totalUnPaidAmount || 0)}
              icon={<WarningIcon sx={{ fontSize: 40 }} />}
              color="warning"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Tổng lương giáo viên"
              value={formatCurrency(stats.teacherTotalSalary || 0)}
              icon={<PaymentIcon sx={{ fontSize: 40 }} />}
              color="secondary"
            />
        </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Đã trả lương"
              value={formatCurrency(stats.teacherPaidAmount || 0)}
              icon={<TrendingUpIcon sx={{ fontSize: 40 }} />}
              color="success"
            />
            </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Chưa trả lương"
              value={formatCurrency(stats.teacherUnPaidAmount || 0)}
              icon={<WarningIcon sx={{ fontSize: 40 }} />}
              color="warning"
            />
          </Grid>
        </Grid>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default Dashboard;
