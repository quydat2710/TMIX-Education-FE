import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Tooltip as MuiTooltip,
} from '@mui/material';
import {
  Person as PersonIcon,
  Class as ClassIcon,
  TrendingUp as TrendingUpIcon,
  Payment as PaymentIcon,
  Warning as WarningIcon,
  AccountBalance as AccountBalanceIcon,
  Groups as GroupsIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
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
  totalAmount: number;
  month: number;
  year: number;
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

// Chart color constants
const CHART_COLORS = {
  navy: '#1e3a8a',
  navyLight: '#3b82f6',
  red: '#dc2626',
  redLight: '#f87171',
  green: '#059669',
  greenLight: '#34d399',
  amber: '#d97706',
  amberLight: '#fbbf24',
  slate: '#64748b',
};

const PIE_COLORS_PAYMENT = ['#10b981', '#ea580c'];
const PIE_COLORS_CLASS = ['#6366f1', '#f59e0b', '#94a3b8'];

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
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
    paymentInfo: { totalRevenue: 0, totalPaidAmount: 0, totalUnPaidAmount: 0 },
    teacherPaymentInfo: { totalSalary: 0, totalPaidAmount: 0, totalUnPaidAmount: 0 },
    recentlyPayment: [],
    recentlySalary: []
  });

  useEffect(() => {
    if (user) fetchDashboardData();
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
        paymentInfo: data.paymentInfo || { totalRevenue: 0, totalPaidAmount: 0, totalUnPaidAmount: 0 },
        teacherPaymentInfo: data.teacherPaymentInfo || { totalSalary: 0, totalPaidAmount: 0, totalUnPaidAmount: 0 },
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
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  const formatShortCurrency = (amount: number): string => {
    if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)}tỷ`;
    if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(0)}tr`;
    if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}k`;
    return amount.toString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return { color: '#059669', bg: 'rgba(5, 150, 105, 0.08)' };
      case 'partial': return { color: '#d97706', bg: 'rgba(217, 119, 6, 0.08)' };
      case 'pending': return { color: '#dc2626', bg: 'rgba(220, 38, 38, 0.08)' };
      default: return { color: '#64748b', bg: 'rgba(100, 116, 139, 0.08)' };
    }
  };

  // Pie chart data
  const paymentPieData = [
    { name: 'Đã thu', value: dashboardData.paymentInfo.totalPaidAmount },
    { name: 'Chưa thu', value: dashboardData.paymentInfo.totalUnPaidAmount },
  ].filter(d => d.value > 0);

  const classPieData = [
    { name: 'Đang hoạt động', value: dashboardData.activeClasses },
    { name: 'Sắp khai giảng', value: dashboardData.upcomingClasses },
    { name: 'Đã kết thúc', value: dashboardData.closedClasses },
  ].filter(d => d.value > 0);

  const totalClasses = dashboardData.activeClasses + dashboardData.upcomingClasses + dashboardData.closedClasses;

  // Custom tooltip for pie
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box sx={{ bgcolor: '#fff', p: 1.5, borderRadius: 1.5, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', border: '1px solid rgba(0,0,0,0.06)' }}>
          <Typography variant="body2" fontWeight={600}>{payload[0].name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {typeof payload[0].value === 'number' && payload[0].value >= 1000
              ? formatCurrency(payload[0].value)
              : payload[0].value}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <Box sx={{ py: 4 }}>
          <LinearProgress sx={{ borderRadius: 2 }} />
          <Typography sx={{ textAlign: 'center', mt: 2, color: 'text.secondary' }}>Đang tải dữ liệu...</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  // Section wrapper component
  const SectionPaper = ({ children, ...props }: any) => (
    <Paper
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      {...props}
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 2.5,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)',
        border: '1px solid rgba(0,0,0,0.06)',
        background: '#ffffff',
        ...props.sx,
      }}
    >
      {children}
    </Paper>
  );

  return (
    <DashboardLayout role="admin">
      <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 }, maxWidth: 1400, mx: 'auto' }}>
        {/* Page Header */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h5"
            sx={{ fontWeight: 700, color: '#0f172a', letterSpacing: '-0.3px' }}
          >
            Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Xin chào <strong>{user?.name || 'Admin'}</strong> — Tổng quan hệ thống TMix Education
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>
        )}

        {/* ═══ ROW 1: 4 KPI Cards ═══ */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Lớp đang hoạt động"
              value={dashboardData.activeClasses}
              subtitle={`${totalClasses} lớp tổng cộng`}
              icon={<ClassIcon />}
              color="primary"
              index={0}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Tổng học viên"
              value={dashboardData.totalStudent}
              subtitle={`${dashboardData.totalTeacher} giáo viên đang dạy`}
              icon={<GroupsIcon />}
              color="info"
              index={1}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Doanh thu"
              value={formatCurrency(dashboardData.paymentInfo.totalRevenue)}
              subtitle={`Đã thu: ${formatShortCurrency(dashboardData.paymentInfo.totalPaidAmount)}`}
              icon={<AccountBalanceIcon />}
              color="success"
              index={2}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Công nợ học phí"
              value={formatCurrency(dashboardData.paymentInfo.totalUnPaidAmount)}
              subtitle={`Tỷ lệ chưa thu: ${dashboardData.paymentInfo.totalRevenue > 0 ? Math.round((dashboardData.paymentInfo.totalUnPaidAmount / dashboardData.paymentInfo.totalRevenue) * 100) : 0}%`}
              icon={<WarningIcon />}
              color="warning"
              index={3}
            />
          </Grid>
        </Grid>

        {/* ═══ ROW 2: Revenue Chart + Payment Pie ═══ */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* Revenue Bar Chart — 8 cols */}
          <Grid item xs={12} lg={8}>
            <SectionPaper transition={{ delay: 0.3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} color="#0f172a">
                    Doanh thu & Chi phí
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Theo tháng — năm {revenueYear}
                  </Typography>
                </Box>
                <TextField
                  select
                  value={revenueYear}
                  onChange={(e) => setRevenueYear(Number(e.target.value))}
                  size="small"
                  sx={{ minWidth: 100, '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.85rem' } }}
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                    <MenuItem key={y} value={y}>{y}</MenuItem>
                  ))}
                </TextField>
              </Box>

              {/* Summary chips */}
              <Box sx={{ display: 'flex', gap: 1.5, mb: 2.5, flexWrap: 'wrap' }}>
                <Box sx={{ px: 2, py: 1, bgcolor: 'rgba(5, 150, 105, 0.06)', borderRadius: 2, border: '1px solid rgba(5, 150, 105, 0.12)' }}>
                  <Typography variant="caption" color="text.secondary" display="block">Thu</Typography>
                  <Typography variant="subtitle2" fontWeight={700} color="#059669">
                    {formatShortCurrency(revenueSummary.totalRevenue)}
                  </Typography>
                </Box>
                <Box sx={{ px: 2, py: 1, bgcolor: 'rgba(220, 38, 38, 0.06)', borderRadius: 2, border: '1px solid rgba(220, 38, 38, 0.12)' }}>
                  <Typography variant="caption" color="text.secondary" display="block">Chi</Typography>
                  <Typography variant="subtitle2" fontWeight={700} color="#dc2626">
                    {formatShortCurrency(revenueSummary.totalExpense)}
                  </Typography>
                </Box>
                <Box sx={{ px: 2, py: 1, bgcolor: revenueSummary.profit >= 0 ? 'rgba(30, 58, 138, 0.06)' : 'rgba(217, 119, 6, 0.06)', borderRadius: 2, border: `1px solid ${revenueSummary.profit >= 0 ? 'rgba(30, 58, 138, 0.12)' : 'rgba(217, 119, 6, 0.12)'}` }}>
                  <Typography variant="caption" color="text.secondary" display="block">Lợi nhuận</Typography>
                  <Typography variant="subtitle2" fontWeight={700} color={revenueSummary.profit >= 0 ? '#1e3a8a' : '#d97706'}>
                    {formatShortCurrency(revenueSummary.profit)}
                  </Typography>
                </Box>
              </Box>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                  <XAxis dataKey="monthName" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis
                    tickFormatter={(v) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(0)}tr` : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [formatCurrency(value), name]}
                    contentStyle={{ borderRadius: 8, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                  <Bar dataKey="revenue" name="Doanh thu" fill={CHART_COLORS.green} radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="expense" name="Chi phí" fill={CHART_COLORS.red} radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </SectionPaper>
          </Grid>

          {/* Right column — Pie charts */}
          <Grid item xs={12} lg={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
              {/* Payment Pie */}
              <SectionPaper transition={{ delay: 0.4 }} sx={{ flex: 1 }}>
                <Typography variant="subtitle2" fontWeight={700} color="#0f172a" sx={{ mb: 1 }}>
                  Tỷ lệ thu học phí
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie
                        data={paymentPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                      >
                        {paymentPieData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS_PAYMENT[index % PIE_COLORS_PAYMENT.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 0.5 }}>
                  {paymentPieData.map((entry, i) => (
                    <Box key={entry.name} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: PIE_COLORS_PAYMENT[i] }} />
                      <Typography variant="caption" color="text.secondary">{entry.name}</Typography>
                    </Box>
                  ))}
                </Box>
              </SectionPaper>

              {/* Class Distribution Pie */}
              <SectionPaper transition={{ delay: 0.5 }} sx={{ flex: 1 }}>
                <Typography variant="subtitle2" fontWeight={700} color="#0f172a" sx={{ mb: 1 }}>
                  Phân bố lớp học
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie
                        data={classPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                      >
                        {classPieData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS_CLASS[index % PIE_COLORS_CLASS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 0.5, flexWrap: 'wrap' }}>
                  {classPieData.map((entry, i) => (
                    <Box key={entry.name} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: PIE_COLORS_CLASS[i] }} />
                      <Typography variant="caption" color="text.secondary">{entry.name} ({entry.value})</Typography>
                    </Box>
                  ))}
                </Box>
              </SectionPaper>
            </Box>
          </Grid>
        </Grid>

        {/* ═══ ROW 3: Secondary metrics (compact cards) ═══ */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={4} md={2}>
            <StatCard title="Giáo viên" value={dashboardData.totalTeacher} icon={<PersonIcon />} color="secondary" index={4} compact />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <StatCard title="Lớp sắp mở" value={dashboardData.upcomingClasses} icon={<ClassIcon />} color="info" index={5} compact />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <StatCard title="Lớp đã đóng" value={dashboardData.closedClasses} icon={<ClassIcon />} color="secondary" index={6} compact />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <StatCard title="Tổng lương GV" value={formatShortCurrency(dashboardData.teacherPaymentInfo.totalSalary)} icon={<PaymentIcon />} color="secondary" index={7} compact />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <StatCard title="Đã trả lương" value={formatShortCurrency(dashboardData.teacherPaymentInfo.totalPaidAmount)} icon={<TrendingUpIcon />} color="success" index={8} compact />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <StatCard title="Nợ lương" value={formatShortCurrency(dashboardData.teacherPaymentInfo.totalUnPaidAmount)} icon={<WarningIcon />} color="warning" index={9} compact />
          </Grid>
        </Grid>

        {/* ═══ ROW 4: Tables ═══ */}
        <Grid container spacing={2}>
          {/* Tuition Payments */}
          <Grid item xs={12} lg={7}>
            <TuitionPaymentList />
          </Grid>

          {/* Salary Payments */}
          <Grid item xs={12} lg={5}>
            <SectionPaper transition={{ delay: 0.7 }}>
              <Typography variant="subtitle1" fontWeight={700} color="#0f172a" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PaymentIcon sx={{ fontSize: 20, color: '#64748b' }} /> Lương giáo viên gần đây
              </Typography>
              {dashboardData.recentlySalary.length > 0 ? (
                <TableContainer sx={{ '& .MuiTableCell-root': { borderColor: 'rgba(0,0,0,0.04)', py: 1.5, px: 1.5 } }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.78rem', color: '#64748b' }}>Giáo viên</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.78rem', color: '#64748b' }}>Tháng</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.78rem', color: '#64748b' }}>Tổng lương</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.78rem', color: '#64748b' }}>Đã trả</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.78rem', color: '#64748b' }}>Còn nợ</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.78rem', color: '#64748b' }}></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dashboardData.recentlySalary.map((salary, index) => {
                        const statusStyle = getStatusColor(salary.status);
                        const remaining = (salary.totalAmount || 0) - (salary.paidAmount || 0);
                        return (
                          <MuiTooltip title="Nhấp để xem trang quản lý lương" placement="top" arrow key={index}>
                            <TableRow
                              onClick={() => navigate('/admin/statistics/financial', { state: { tab: 'teacher' } })}
                              sx={{
                                cursor: 'pointer',
                                '&:last-child td': { borderBottom: 0 },
                                '&:hover': {
                                  bgcolor: 'rgba(30, 58, 138, 0.03)',
                                  '& td': { color: '#1e3a8a' },
                                },
                                transition: 'background 0.15s',
                              }}
                            >
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Typography variant="body2" fontWeight={600} color="#1e293b" sx={{ fontSize: '0.82rem' }}>
                                    {salary.name}
                                  </Typography>
                                  <OpenInNewIcon sx={{ fontSize: 11, color: '#94a3b8', opacity: 0, '.MuiTableRow-root:hover &': { opacity: 1 } }} />
                                </Box>
                              </TableCell>
                              <TableCell align="center">
                                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                  {salary.month}/{salary.year}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ fontSize: '0.82rem' }}>
                                  {formatShortCurrency(salary.totalAmount || 0)}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" fontWeight={600} color="#059669" sx={{ fontSize: '0.82rem' }}>
                                  {formatShortCurrency(salary.paidAmount)}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" fontWeight={600} color={remaining > 0 ? '#dc2626' : '#64748b'} sx={{ fontSize: '0.82rem' }}>
                                  {remaining > 0 ? formatShortCurrency(remaining) : '—'}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Box
                                  sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    bgcolor: statusStyle.color,
                                    display: 'inline-block',
                                  }}
                                />
                              </TableCell>
                            </TableRow>
                          </MuiTooltip>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4, fontSize: '0.85rem' }}>
                  Chưa có dữ liệu lương
                </Typography>
              )}
            </SectionPaper>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
};

export default Dashboard;
