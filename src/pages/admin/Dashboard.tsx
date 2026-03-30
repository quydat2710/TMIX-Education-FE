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
  LinearProgress,
  Alert,
  TextField,
  MenuItem,
} from '@mui/material';
import {
  School as SchoolIcon,
  Person as PersonIcon,
  Class as ClassIcon,
  TrendingUp as TrendingUpIcon,
  Payment as PaymentIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { commonStyles } from '../../utils/styles';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import { getAdminDashboardAPI, getMonthlyRevenueAPI } from '../../services/dashboard';
import TuitionPaymentList from '../../components/features/dashboard/TuitionPaymentList';

interface PaymentInfo {
  totalRevenue: number;
  totalPaidAmount: number;
  totalUnPaidAmount: number;
}

interface TeacherPaymentInfo {
  totalSalary: number;
  totalPaidAmount: number;
  totalUnPaidAmount: number;
}

interface RecentPayment {
  id?: string;
  name: string;
  paidAmount: number;
  totalAmount?: number;
  status: string;
  month?: number;
  year?: number;
  totalLessons?: number;
  discountPercent?: number;
  className?: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  studentEmail?: string;
  studentPhone?: string;
}

interface RecentSalary {
  name: string;
  paidAmount: number;
  status: string;
}

interface DashboardData {
  totalStudent: number;
  totalTeacher: number;
  activeClasses: number;
  upcomingClasses: number;
  closedClasses: number;
  paymentInfo: PaymentInfo;
  teacherPaymentInfo: TeacherPaymentInfo;
  recentlyPayment: RecentPayment[];
  recentlySalary: RecentSalary[];
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [revenueYear, setRevenueYear] = useState<number>(new Date().getFullYear());
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [revenueSummary, setRevenueSummary] = useState<{ totalRevenue: number; totalExpense: number; profit: number }>({ totalRevenue: 0, totalExpense: 0, profit: 0 });
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalStudent: 0,
    totalTeacher: 0,
    activeClasses: 0,
    upcomingClasses: 0,
    closedClasses: 0,
    paymentInfo: {
      totalRevenue: 0,
      totalPaidAmount: 0,
      totalUnPaidAmount: 0
    },
    teacherPaymentInfo: {
      totalSalary: 0,
      totalPaidAmount: 0,
      totalUnPaidAmount: 0
    },
    recentlyPayment: [],
    recentlySalary: []
  });

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  useEffect(() => {
    fetchRevenueData();
  }, [revenueYear]);

  const fetchRevenueData = async () => {
    try {
      const res = await getMonthlyRevenueAPI({ year: revenueYear });
      const data = res?.data?.data || res?.data || {};
      setRevenueData(data.monthlyData || []);
      setRevenueSummary(data.summary || { totalRevenue: 0, totalExpense: 0, profit: 0 });
    } catch (err) {
      console.error('Error fetching revenue data:', err);
    }
  };

  const fetchDashboardData = async (): Promise<void> => {
    setLoading(true);
    setError('');

    try {
      const response = await getAdminDashboardAPI();


      const data = response?.data?.data || response?.data || {};

      setDashboardData({
        totalStudent: data.totalStudent || 0,
        totalTeacher: data.totalTeacher || 0,
        activeClasses: data.activeClasses || 0,
        upcomingClasses: data.upcomingClasses || 0,
        closedClasses: data.closedClasses || 0,
        paymentInfo: data.paymentInfo || {
          totalRevenue: 0,
          totalPaidAmount: 0,
          totalUnPaidAmount: 0
        },
        teacherPaymentInfo: data.teacherPaymentInfo || {
          totalSalary: 0,
          totalPaidAmount: 0,
          totalUnPaidAmount: 0
        },
        recentlyPayment: data.recentlyPayment || [],
        recentlySalary: data.recentlySalary || []
      });

    } catch (err: any) {
      console.error('Error fetching admin dashboard data:', err);
      setError('Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };


  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'paid': return 'Đã thanh toán';
      case 'partial': return 'Thanh toán một phần';
      case 'pending': return 'Chờ thanh toán';
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

          <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
            Xin chào <strong>{user?.name || 'Admin'}</strong>, đây là tổng quan hệ thống
          </Typography>



          {/* Stat Cards - First Row */}
          <Grid container spacing={3} sx={{ mb: 4 }} component={motion.div} initial="hidden" animate="visible" variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Tổng số lớp học"
                value={dashboardData.activeClasses + dashboardData.upcomingClasses + dashboardData.closedClasses}
                icon={<TrendingUpIcon sx={{ fontSize: 40 }} />}
                color="secondary"
                index={0}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Lớp đang hoạt động"
                value={dashboardData.activeClasses}
                icon={<ClassIcon sx={{ fontSize: 40 }} />}
                color="success"
                index={1}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Lớp sắp khai giảng"
                value={dashboardData.upcomingClasses}
                icon={<ClassIcon sx={{ fontSize: 40 }} />}
                color="info"
                index={2}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Lớp đã kết thúc"
                value={dashboardData.closedClasses}
                icon={<ClassIcon sx={{ fontSize: 40 }} />}
                color="warning"
                index={3}
              />
            </Grid>
          </Grid>

          {/* Stat Cards - Second Row */}
          <Grid container spacing={3} sx={{ mb: 4 }} component={motion.div} initial="hidden" animate="visible" variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
          }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Tổng giáo viên"
                value={dashboardData.totalTeacher}
                icon={<PersonIcon sx={{ fontSize: 40 }} />}
                color="secondary"
                index={4}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Tổng doanh thu"
                value={formatCurrency(dashboardData.paymentInfo.totalRevenue)}
                icon={<TrendingUpIcon sx={{ fontSize: 40 }} />}
                color="primary"
                index={5}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Đã thu"
                value={formatCurrency(dashboardData.paymentInfo.totalPaidAmount)}
                icon={<TrendingUpIcon sx={{ fontSize: 40 }} />}
                color="success"
                index={6}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Chưa thu"
                value={formatCurrency(dashboardData.paymentInfo.totalUnPaidAmount)}
                icon={<WarningIcon sx={{ fontSize: 40 }} />}
                color="warning"
                index={7}
              />
            </Grid>
          </Grid>

          {/* Stat Cards - Third Row */}
          <Grid container spacing={3} sx={{ mb: 4 }} component={motion.div} initial="hidden" animate="visible" variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.4 } }
          }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Tổng học viên"
                value={dashboardData.totalStudent}
                icon={<SchoolIcon sx={{ fontSize: 40 }} />}
                color="primary"
                index={8}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Tổng lương giáo viên"
                value={formatCurrency(dashboardData.teacherPaymentInfo.totalSalary)}
                icon={<PaymentIcon sx={{ fontSize: 40 }} />}
                color="secondary"
                index={9}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Đã trả lương"
                value={formatCurrency(dashboardData.teacherPaymentInfo.totalPaidAmount)}
                icon={<TrendingUpIcon sx={{ fontSize: 40 }} />}
                color="success"
                index={10}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Chưa trả lương"
                value={formatCurrency(dashboardData.teacherPaymentInfo.totalUnPaidAmount)}
                icon={<WarningIcon sx={{ fontSize: 40 }} />}
                color="warning"
                index={11}
              />
            </Grid>
          </Grid>

          {/* Revenue Chart */}
          <Paper component={motion.div} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }} sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  Biểu đồ doanh thu & chi phí theo tháng
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  So sánh học phí thu được và lương giáo viên đã trả
                </Typography>
              </Box>
              <TextField
                select
                label="Năm"
                value={revenueYear}
                onChange={(e) => setRevenueYear(Number(e.target.value))}
                sx={{ minWidth: 120 }}
                size="small"
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                  <MenuItem key={y} value={y}>{y}</MenuItem>
                ))}
              </TextField>
            </Box>

            {/* Summary mini cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={4}>
                <Box sx={{ p: 2, bgcolor: '#e8f5e9', borderRadius: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Tổng thu ({revenueYear})</Typography>
                  <Typography variant="h6" fontWeight={700} color="success.main">
                    {formatCurrency(revenueSummary.totalRevenue)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ p: 2, bgcolor: '#ffebee', borderRadius: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Tổng chi ({revenueYear})</Typography>
                  <Typography variant="h6" fontWeight={700} color="error.main">
                    {formatCurrency(revenueSummary.totalExpense)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ p: 2, bgcolor: revenueSummary.profit >= 0 ? '#e3f2fd' : '#fff3e0', borderRadius: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Lợi nhuận ({revenueYear})</Typography>
                  <Typography variant="h6" fontWeight={700} color={revenueSummary.profit >= 0 ? 'primary.main' : 'warning.main'}>
                    {formatCurrency(revenueSummary.profit)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Chart */}
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="monthName" />
                <YAxis
                  tickFormatter={(value) => value >= 1000000 ? `${(value / 1000000).toFixed(0)}tr` : value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value),
                    name
                  ]}
                />
                <Legend />
                <Bar dataKey="revenue" name="Doanh thu (học phí)" fill="#4caf50" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Chi phí (lương GV)" fill="#f44336" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>

          {/* Content Sections */}
          <Grid container spacing={3} component={motion.div} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.8 }}>
            {/* Tuition Payments - Full Width */}
            <Grid item xs={12}>
              <TuitionPaymentList />
            </Grid>

            {/* Recent Salary Payments */}
            <Grid item xs={12}>
              <Paper sx={{ 
                p: { xs: 2, md: 3 }, 
                borderRadius: 4, 
                boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)', 
                background: '#ffffff', 
                border: '1px solid rgba(0,0,0,0.03)', 
                mb: 3,
                overflow: 'hidden'
              }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <PaymentIcon color="secondary" /> Thanh toán lương gần đây
                </Typography>
                {dashboardData.recentlySalary.length > 0 ? (
                  <Box mt={1} borderRadius={3} sx={{ 
                    background: 'linear-gradient(to bottom right, #f8fafc, #f1f5f9)',
                    border: '1px solid #e2e8f0', 
                    p: { xs: 1, sm: 2 } 
                  }}>
                    <TableContainer 
                      sx={{ 
                        borderRadius: 2, 
                        boxShadow: 'none', 
                        border: 'none',
                        bgcolor: 'transparent',
                        '& .MuiTableCell-root': {
                          borderColor: 'rgba(226, 232, 240, 0.8)'
                        }
                      }}
                    >
                      <Table size="small" stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Giáo viên</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Số Đã Trả</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {dashboardData.recentlySalary.map((salary, index) => (
                            <TableRow 
                              key={index} 
                              sx={{
                                cursor: 'default',
                                transition: 'background-color 0.2s',
                                bgcolor: 'transparent',
                                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.5)' },
                              }}
                            >
                              <TableCell>
                                <Typography variant="body2" fontWeight={700} color="primary.main">
                                  {salary.name}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Typography variant="subtitle2" color="success.main" fontWeight={800}>
                                  {formatCurrency(salary.paidAmount)}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Box
                                  component="span"
                                  sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    px: 1.5,
                                    py: 0.5,
                                    borderRadius: 1.5,
                                    fontSize: '0.8125rem',
                                    fontWeight: 700,
                                    color: salary.status === 'paid' ? '#059669' : salary.status === 'partial' ? '#d97706' : salary.status === 'pending' ? '#2563eb' : '#dc2626',
                                    background: salary.status === 'paid' ? 'rgba(16, 185, 129, 0.1)' : salary.status === 'partial' ? 'rgba(245, 158, 11, 0.1)' : salary.status === 'pending' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                    border: `1px solid ${salary.status === 'paid' ? 'rgba(16, 185, 129, 0.2)' : salary.status === 'partial' ? 'rgba(245, 158, 11, 0.2)' : salary.status === 'pending' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  {getStatusLabel(salary.status)}
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                ) : (
                  <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4, fontWeight: 500 }}>
                    Chưa có thanh toán lương nào gần đây
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
