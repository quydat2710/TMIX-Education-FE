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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Divider,
  TextField,
  MenuItem,
} from '@mui/material';
import {
  Close as CloseIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Class as ClassIcon,
  TrendingUp as TrendingUpIcon,
  Payment as PaymentIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { commonStyles } from '../../utils/styles';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import { getAdminDashboardAPI, getMonthlyRevenueAPI } from '../../services/dashboard';

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
  const [selectedPayment, setSelectedPayment] = useState<RecentPayment | null>(null);
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

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case 'paid': return 'success';
      case 'partial': return 'warning';
      case 'pending': return 'error';
      default: return 'default';
    }
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
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Tổng số lớp học"
                value={dashboardData.activeClasses + dashboardData.upcomingClasses + dashboardData.closedClasses}
                icon={<TrendingUpIcon sx={{ fontSize: 40 }} />}
                color="secondary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Lớp đang hoạt động"
                value={dashboardData.activeClasses}
                icon={<ClassIcon sx={{ fontSize: 40 }} />}
                color="success"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Lớp sắp khai giảng"
                value={dashboardData.upcomingClasses}
                icon={<ClassIcon sx={{ fontSize: 40 }} />}
                color="info"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Lớp đã kết thúc"
                value={dashboardData.closedClasses}
                icon={<ClassIcon sx={{ fontSize: 40 }} />}
                color="warning"
              />
            </Grid>
          </Grid>

          {/* Stat Cards - Second Row */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Tổng giáo viên"
                value={dashboardData.totalTeacher}
                icon={<PersonIcon sx={{ fontSize: 40 }} />}
                color="secondary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Tổng doanh thu"
                value={formatCurrency(dashboardData.paymentInfo.totalRevenue)}
                icon={<TrendingUpIcon sx={{ fontSize: 40 }} />}
                color="primary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Đã thu"
                value={formatCurrency(dashboardData.paymentInfo.totalPaidAmount)}
                icon={<TrendingUpIcon sx={{ fontSize: 40 }} />}
                color="success"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Chưa thu"
                value={formatCurrency(dashboardData.paymentInfo.totalUnPaidAmount)}
                icon={<WarningIcon sx={{ fontSize: 40 }} />}
                color="warning"
              />
            </Grid>
          </Grid>

          {/* Stat Cards - Third Row */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Tổng học viên"
                value={dashboardData.totalStudent}
                icon={<SchoolIcon sx={{ fontSize: 40 }} />}
                color="primary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Tổng lương giáo viên"
                value={formatCurrency(dashboardData.teacherPaymentInfo.totalSalary)}
                icon={<PaymentIcon sx={{ fontSize: 40 }} />}
                color="secondary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Đã trả lương"
                value={formatCurrency(dashboardData.teacherPaymentInfo.totalPaidAmount)}
                icon={<TrendingUpIcon sx={{ fontSize: 40 }} />}
                color="success"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Chưa trả lương"
                value={formatCurrency(dashboardData.teacherPaymentInfo.totalUnPaidAmount)}
                icon={<WarningIcon sx={{ fontSize: 40 }} />}
                color="warning"
              />
            </Grid>
          </Grid>

          {/* Revenue Chart */}
          <Paper sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
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
          <Grid container spacing={3}>
            {/* Recent Payments */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                  Thanh toán học phí
                </Typography>
                {dashboardData.recentlyPayment.length > 0 ? (
                  <TableContainer sx={commonStyles.tableContainer}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Học viên</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Số tiền đã thanh toán</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {dashboardData.recentlyPayment.map((payment, index) => (
                          <TableRow
                            key={index}
                            sx={{ ...commonStyles.tableRow, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                            onClick={() => setSelectedPayment(payment)}
                          >
                            <TableCell>
                              <Typography variant="body2" fontWeight="medium">
                                {payment.name}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" align="center">
                                {formatCurrency(payment.paidAmount)}
                              </Typography>
                            </TableCell>
                            <TableCell>
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
                    Chưa có thanh toán nào gần đây
                  </Typography>
                )}
              </Paper>
            </Grid>

            {/* Recent Salary Payments */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                  Thanh toán lương
                </Typography>
                {dashboardData.recentlySalary.length > 0 ? (
                  <TableContainer sx={commonStyles.tableContainer}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Giáo viên</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Số tiền đã thanh toán</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {dashboardData.recentlySalary.map((salary, index) => (
                          <TableRow key={index} sx={commonStyles.tableRow}>
                            <TableCell>
                              <Typography variant="body2" fontWeight="medium">
                                {salary.name}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" align="center">
                                {formatCurrency(salary.paidAmount)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={getStatusLabel(salary.status)}
                                color={getStatusColor(salary.status)}
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
                    Chưa có thanh toán lương nào gần đây
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>

          {/* Payment Detail Dialog */}
          <Dialog
            open={!!selectedPayment}
            onClose={() => setSelectedPayment(null)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle sx={{
              background: 'linear-gradient(135deg, #D32F2F 0%, #1E3A5F 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              py: 2
            }}>
              <Typography variant="h6" fontWeight={700}>Chi tiết thanh toán</Typography>
              <IconButton onClick={() => setSelectedPayment(null)} sx={{ color: 'white' }}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 3, mt: 1 }}>
              {selectedPayment && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* Học viên */}
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>👨‍🎓 Thông tin học viên</Typography>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Typography variant="body1" fontWeight={600}>{selectedPayment.name}</Typography>
                      {selectedPayment.studentEmail && selectedPayment.studentEmail !== 'N/A' && (
                        <Typography variant="body2" color="text.secondary">Email: {selectedPayment.studentEmail}</Typography>
                      )}
                      {selectedPayment.studentPhone && selectedPayment.studentPhone !== 'N/A' && (
                        <Typography variant="body2" color="text.secondary">SĐT: {selectedPayment.studentPhone}</Typography>
                      )}
                    </Paper>
                  </Box>

                  {/* Phụ huynh */}
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>👪 Thông tin phụ huynh</Typography>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Typography variant="body1" fontWeight={600}>{selectedPayment.parentName || 'Chưa có'}</Typography>
                      {selectedPayment.parentEmail && selectedPayment.parentEmail !== 'N/A' && (
                        <Typography variant="body2" color="text.secondary">Email: {selectedPayment.parentEmail}</Typography>
                      )}
                      {selectedPayment.parentPhone && selectedPayment.parentPhone !== 'N/A' && (
                        <Typography variant="body2" color="text.secondary">SĐT: {selectedPayment.parentPhone}</Typography>
                      )}
                    </Paper>
                  </Box>

                  {/* Lớp học */}
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>📚 Lớp học</Typography>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Typography variant="body1" fontWeight={600}>Lớp {selectedPayment.className || 'N/A'}</Typography>
                      {selectedPayment.month && selectedPayment.year && (
                        <Typography variant="body2" color="text.secondary">Tháng {selectedPayment.month}/{selectedPayment.year}</Typography>
                      )}
                      {selectedPayment.totalLessons !== undefined && (
                        <Typography variant="body2" color="text.secondary">Số buổi học: {selectedPayment.totalLessons}</Typography>
                      )}
                    </Paper>
                  </Box>

                  {/* Thanh toán */}
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>💰 Chi tiết thanh toán</Typography>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Tổng học phí:</Typography>
                        <Typography variant="body2" fontWeight={600}>{formatCurrency(selectedPayment.totalAmount || 0)}</Typography>
                      </Box>
                      {(selectedPayment.discountPercent || 0) > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Giảm giá:</Typography>
                          <Typography variant="body2" fontWeight={600} color="success.main">{selectedPayment.discountPercent}%</Typography>
                        </Box>
                      )}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Đã thanh toán:</Typography>
                        <Typography variant="body2" fontWeight={600} color="primary.main">{formatCurrency(selectedPayment.paidAmount)}</Typography>
                      </Box>
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" fontWeight={600}>Còn lại:</Typography>
                        <Typography variant="body2" fontWeight={700} color="error.main">
                          {formatCurrency((selectedPayment.totalAmount || 0) - selectedPayment.paidAmount)}
                        </Typography>
                      </Box>
                      <Box sx={{ mt: 1.5 }}>
                        <Chip
                          label={getStatusLabel(selectedPayment.status)}
                          color={getStatusColor(selectedPayment.status)}
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>
                    </Paper>
                  </Box>
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
              <Button onClick={() => setSelectedPayment(null)} variant="contained">Đóng</Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default Dashboard;
