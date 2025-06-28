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
import DashboardLayout from '../../components/layouts/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import {
  getAllStudentsAPI,
  getAllTeachersAPI,
  getAllClassesAPI,
  getPaymentsAPI,
  getTeacherPaymentsAPI,
} from '../../services/api';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    totalRevenue: 0,
    totalExpenses: 0,
    activeClasses: 0,
    pendingPayments: 0,
  });
  const [recentPayments, setRecentPayments] = useState([]);
  const [recentTeacherPayments, setRecentTeacherPayments] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [
        studentsRes,
        teachersRes,
        classesRes,
        paymentsRes,
        teacherPaymentsRes,
      ] = await Promise.all([
        getAllStudentsAPI({ limit: 1000 }),
        getAllTeachersAPI({ limit: 1000 }),
        getAllClassesAPI({ limit: 1000 }),
        getPaymentsAPI({ limit: 10, sortBy: 'date', sortOrder: 'desc' }),
        getTeacherPaymentsAPI({ limit: 10, sortBy: 'date', sortOrder: 'desc' }),
      ]);

      const students = studentsRes?.data?.students || [];
      const teachers = teachersRes?.data?.teachers || [];
      const classes = classesRes?.data?.classes || [];
      const payments = paymentsRes?.data?.payments || [];
      const teacherPayments = teacherPaymentsRes?.data || [];

      // Calculate statistics
      const totalRevenue = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
      const totalExpenses = teacherPayments.reduce((sum, payment) => sum + (payment.paidAmount || 0), 0);
      const activeClasses = classes.filter(c => c.status === 'active').length;
      const pendingPayments = payments.filter(p => p.status !== 'paid').length;

      setStats({
        totalStudents: students.length,
        totalTeachers: teachers.length,
        totalClasses: classes.length,
        totalRevenue,
        totalExpenses,
        activeClasses,
        pendingPayments,
      });

      setRecentPayments(payments.slice(0, 5));
      setRecentTeacherPayments(teacherPayments.slice(0, 5));
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
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
        <Box sx={{ py: 4 }}>
          <LinearProgress />
          <Typography sx={{ textAlign: 'center', mt: 2 }}>Đang tải dữ liệu dashboard...</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <Box>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: COLORS.primary.main }}>
          Dashboard Quản trị
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
              title="Tổng học viên"
              value={stats.totalStudents}
              icon={<SchoolIcon sx={{ fontSize: 40 }} />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Tổng giáo viên"
              value={stats.totalTeachers}
              icon={<PersonIcon sx={{ fontSize: 40 }} />}
              color="secondary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Lớp đang hoạt động"
              value={stats.activeClasses}
              icon={<ClassIcon sx={{ fontSize: 40 }} />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Doanh thu tháng"
              value={formatCurrency(stats.totalRevenue)}
              icon={<TrendingUpIcon sx={{ fontSize: 40 }} />}
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
              icon={<PeopleIcon sx={{ fontSize: 40 }} />}
              color="info"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Chi phí lương"
              value={formatCurrency(stats.totalExpenses)}
              icon={<PaymentIcon sx={{ fontSize: 40 }} />}
              color="error"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Lợi nhuận"
              value={formatCurrency(stats.totalRevenue - stats.totalExpenses)}
              icon={<TrendingUpIcon sx={{ fontSize: 40 }} />}
              color={stats.totalRevenue - stats.totalExpenses >= 0 ? "success" : "error"}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Thanh toán chờ"
              value={stats.pendingPayments}
              icon={<WarningIcon sx={{ fontSize: 40 }} />}
              color="warning"
            />
          </Grid>
        </Grid>

        {/* Recent Activities */}
        <Grid container spacing={3}>
          {/* Recent Student Payments */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ color: COLORS.primary.main, fontWeight: 600 }}>
                Thanh toán học phí gần đây
              </Typography>
              {recentPayments.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Học sinh</TableCell>
                        <TableCell align="right">Số tiền</TableCell>
                        <TableCell align="center">Trạng thái</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentPayments.map((payment, index) => (
                        <TableRow key={payment.id || index} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {payment.studentId?.userId?.name || payment.studentId?.name || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="600" color="success.main">
                              {formatCurrency(payment.amount || 0)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={getStatusLabel(payment.status)}
                              color={getStatusColor(payment.status)}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  Chưa có thanh toán nào
                </Typography>
              )}
            </Paper>
          </Grid>

          {/* Recent Teacher Payments */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ color: COLORS.secondary.main, fontWeight: 600 }}>
                Thanh toán lương gần đây
              </Typography>
              {recentTeacherPayments.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Giáo viên</TableCell>
                        <TableCell align="right">Số tiền</TableCell>
                        <TableCell align="center">Trạng thái</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentTeacherPayments.map((payment, index) => (
                        <TableRow key={payment.id || index} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {payment.teacherId?.userId?.name || payment.teacherId?.name || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="600" color="error.main">
                              {formatCurrency(payment.paidAmount || 0)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={payment.status === 'paid' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                              color={payment.status === 'paid' ? 'success' : 'warning'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
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
