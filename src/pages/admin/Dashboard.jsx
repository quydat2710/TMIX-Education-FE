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
import {
  getAllStudentsAPI,
  getAllTeachersAPI,
  getAllClassesAPI,
  getPaymentsAPI,
  getTeacherPaymentsAPI,
  getTotalPaymentsAPI,
} from '../../services/api';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    totalRevenue: 0,
    totalPaidAmount: 0,
    totalUnpaidAmount: 0,
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
    setError(''); // Clear any previous errors
    try {
      const [
        studentsRes,
        teachersRes,
        classesRes,
        paymentsRes,
        teacherPaymentsRes,
        totalPaymentsRes,
      ] = await Promise.all([
        getAllStudentsAPI(),
        getAllTeachersAPI(),
        getAllClassesAPI(),
        getPaymentsAPI({ limit: 1000 }),
        getTeacherPaymentsAPI({ limit: 1000 }),
        getTotalPaymentsAPI(),
      ]);



      const students = studentsRes?.data?.students || studentsRes?.data || [];
      const teachers = teachersRes?.data?.teachers || teachersRes?.data || [];
      const classes = classesRes?.data?.classes || classesRes?.data || [];

      const payments = paymentsRes?.data?.payments ||
                      paymentsRes?.data ||
                      paymentsRes?.payments ||
                      [];

      const teacherPayments = teacherPaymentsRes?.data?.teacherPayments ||
                             teacherPaymentsRes?.data ||
                             teacherPaymentsRes?.teacherPayments ||
                             [];

      const totalStudents = studentsRes?.data?.totalResults || studentsRes?.totalResults || students.length || 0;
      const totalTeachers = teachersRes?.data?.totalResults || teachersRes?.totalResults || teachers.length || 0;
      const totalClasses = classesRes?.data?.totalResults || classesRes?.totalResults || classes.length || 0;





      const totalPaymentsData = totalPaymentsRes?.data || {};
      const totalRevenue = totalPaymentsData.total || 0;
      const totalPaidAmount = totalPaymentsData.paid || 0;
      const totalUnpaidAmount = totalRevenue - totalPaidAmount; // Tính số tiền chưa thu



      const totalExpenses = teacherPayments.reduce((sum, payment) => {
        const amount = Number(payment.paidAmount) || Number(payment.amount) || 0;
        return sum + amount;
      }, 0);

      const activeClasses = classes.filter(c => c.status === 'active' || c.isActive).length;
      const pendingPayments = payments.filter(p => p.status === 'pending' || p.status === 'unpaid' || p.status === 'pending').length;



      const calculatedStats = {
        totalStudents,
        totalTeachers,
        totalClasses,
        totalRevenue: totalRevenue || 0,
        totalPaidAmount: totalPaidAmount || 0,
        totalUnpaidAmount: totalUnpaidAmount || 0,
        totalExpenses: totalExpenses || 0,
        activeClasses: activeClasses || 0,
        pendingPayments: pendingPayments || 0,
      };



      setStats(calculatedStats);

      const sortedPayments = payments.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.date || 0);
        const dateB = new Date(b.createdAt || b.date || 0);
        return dateB - dateA;
      });

      const sortedTeacherPayments = teacherPayments.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.date || 0);
        const dateB = new Date(b.createdAt || b.date || 0);
        return dateB - dateA;
      });

      setRecentPayments(sortedPayments.slice(0, 5));
      setRecentTeacherPayments(sortedTeacherPayments.slice(0, 5));
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Không thể tải dữ liệu dashboard');
      setStats({
        totalStudents: 0,
        totalTeachers: 0,
        totalClasses: 0,
        totalRevenue: 0,
        totalPaidAmount: 0,
        totalUnpaidAmount: 0,
        totalExpenses: 0,
        activeClasses: 0,
        pendingPayments: 0,
      });
      setRecentPayments([]);
      setRecentTeacherPayments([]);
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
              value={stats.totalStudents || 0}
              icon={<SchoolIcon sx={{ fontSize: 40 }} />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Tổng giáo viên"
              value={stats.totalTeachers || 0}
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
              title="Tổng doanh thu"
              value={formatCurrency(stats.totalRevenue || 0)}
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
              value={stats.totalClasses || 0}
              icon={<PeopleIcon sx={{ fontSize: 40 }} />}
              color="info"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Chi phí lương"
              value={formatCurrency(stats.totalExpenses || 0)}
              icon={<PaymentIcon sx={{ fontSize: 40 }} />}
              color="error"
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
              title="Tổng chưa thu"
              value={formatCurrency(stats.totalUnpaidAmount || 0)}
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
                <TableContainer sx={commonStyles.tableContainer}>
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
                          <TableRow key={payment.id || index} hover sx={commonStyles.tableRow}>
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
                <TableContainer sx={commonStyles.tableContainer}>
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
                          <TableRow key={payment.id || index} hover sx={commonStyles.tableRow}>
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
      </Box>
    </DashboardLayout>
  );
};

export default Dashboard;
