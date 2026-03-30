import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
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
  TrendingUp as TrendingUpIcon,
  Payment as PaymentIcon,
  Schedule as ScheduleIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { commonStyles } from '../../utils/styles';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import { getTeacherDashboardAPI } from '../../services/dashboard';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState<any>({
    totalStudent: 0,
    teachingClasses: 0,
    closedClasses: 0,
    upcomingClasses: 0,
    paymentInfo: [],
    activeClasses: [],
    recentlySalary: {}
  });

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');

    try {
      const teacherId = user?.teacherId || user?.id;
      if (!teacherId) {
        setError('Không tìm thấy thông tin giáo viên');
        setLoading(false);
        return;
      }

      const response = await getTeacherDashboardAPI(teacherId);
      const data = response?.data?.data || response?.data || {};

      setDashboardData({
        totalStudent: data.totalStudent || 0,
        teachingClasses: data.teachingClasses || 0,
        closedClasses: data.closedClasses || 0,
        upcomingClasses: data.upcomingClasses || 0,
        paymentInfo: data.paymentInfo || [],
        activeClasses: data.activeClasses || [],
        recentlySalary: data.recentlySalary || {}
      });

    } catch (err) {
      console.error('Error fetching teacher dashboard data:', err);
      setError('Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: any) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  const formatTime = (timeString: any) => {
    if (!timeString) return '';
    return timeString.substring(0, 5); // Get HH:MM format
  };

  const formatDayOfWeek = (dayNumber: any) => {
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    return days[dayNumber] || '';
  };

  const formatSchedule = (schedule: any) => {
    if (!schedule) return { days: 'Chưa có lịch', time: '' };

    const days = schedule.days_of_week || [];
    const timeSlots = schedule.time_slots || {};

    const dayText = days.length > 0
      ? days.map((day: any) => formatDayOfWeek(day)).join(', ')
      : 'Chưa có lịch';

    const timeText = timeSlots.start_time && timeSlots.end_time
      ? `${formatTime(timeSlots.start_time)} - ${formatTime(timeSlots.end_time)}`
      : '';

    return { days: dayText, time: timeText };
  };

  const formatMonthYear = (month: any, year: any) => {
    const monthNames = [
      'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ];
    return `${monthNames[month - 1] || 'Tháng'} ${year}`;
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
            Xin chào <strong>{user?.name || 'Giáo viên'}</strong>, đây là thông tin giảng dạy của bạn
        </Typography>

        {/* Stat Cards - First Row */}
        <Grid container spacing={6} sx={{ mb: 4 }} component={motion.div} initial="hidden" animate="visible" variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
        }}>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Lớp đang dạy"
              value={dashboardData.teachingClasses}
              icon={<ClassIcon sx={{ fontSize: 32 }} />}
              color="success"
              index={0}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Lớp đã kết thúc"
              value={dashboardData.closedClasses}
              icon={<ClassIcon sx={{ fontSize: 32 }} />}
              color="warning"
              index={1}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Lớp sắp tới"
              value={dashboardData.upcomingClasses}
              icon={<ScheduleIcon sx={{ fontSize: 32 }} />}
              color="info"
              index={2}
            />
          </Grid>
        </Grid>

          {/* Salary Stats */}
        <Grid container spacing={6} sx={{ mb: 4 }} component={motion.div} initial="hidden" animate="visible" variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
        }}>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Tổng lương"
              value={formatCurrency(dashboardData.paymentInfo?.totalSalary)}
              icon={<PaymentIcon sx={{ fontSize: 32 }} />}
              color="secondary"
              index={3}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Lương đã nhận"
              value={formatCurrency(dashboardData.paymentInfo?.totalPaidAmount)}
              icon={<TrendingUpIcon sx={{ fontSize: 32 }} />}
              color="success"
              index={4}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Lương chưa nhận"
              value={formatCurrency(dashboardData.paymentInfo?.totalUnPaidAmount)}
              icon={<PaymentIcon sx={{ fontSize: 32 }} />}
              color="error"
              index={5}
            />
          </Grid>
        </Grid>

        {/* Content Sections */}
        <Grid container spacing={4} component={motion.div} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
          {/* Active Classes */}
          <Grid item xs={12} md={6}>
              <Paper sx={{ 
                p: { xs: 2, md: 3 }, 
                borderRadius: 4, 
                boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)', 
                background: '#ffffff', 
                border: '1px solid rgba(0,0,0,0.03)', 
                mb: 3,
                height: '100%'
              }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 3, display: 'flex', gap: 1.5, alignItems: 'center' }}>
                <SchoolIcon color="success" /> Lớp học đang dạy
              </Typography>
                <Box mt={2} borderRadius={3} sx={{ 
                  background: 'linear-gradient(to bottom right, #f8fafc, #f1f5f9)',
                  border: '1px solid #e2e8f0', 
                  p: { xs: 1, sm: 1.5 } 
                }}>
                  {dashboardData.activeClasses.length > 0 ? (
                    <TableContainer 
                      sx={{ 
                        ...commonStyles.tableContainer, 
                        borderRadius: 2, 
                        boxShadow: 'none', 
                        border: 'none',
                        bgcolor: 'transparent' 
                      }}
                    >
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Lớp</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Phòng</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Lịch</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Giờ</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {dashboardData.activeClasses.map((classItem: any, index: number) => {
                            const schedule = formatSchedule(classItem.schedule);
                            return (
                              <TableRow key={index} sx={{...commonStyles.tableRow, '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.5)' }}}>
                                <TableCell>
                                  <Typography variant="body2" fontWeight="700" color="primary.main">
                                    {classItem.name}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" fontWeight="500">
                                    {classItem.room || 'N/A'}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" color="text.secondary">
                                    {schedule.days}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" color="text.secondary">
                                    {schedule.time}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label="Đang dạy"
                                    color="success"
                                    size="small"
                                    sx={{ fontWeight: 600, px: 1 }}
                                  />
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4, fontWeight: 500 }}>
                      Chưa có lớp học nào đang dạy
                    </Typography>
                  )}
                </Box>
            </Paper>
            </Grid>

          {/* Recent Salary */}
          <Grid item xs={12} md={6}>
              <Paper sx={{ 
                p: { xs: 2, md: 4 }, 
                borderRadius: 4, 
                boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)', 
                background: '#ffffff', 
                border: '1px solid rgba(0,0,0,0.03)', 
                mb: 3,
                height: '100%'
              }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 3, display: 'flex', gap: 1.5, alignItems: 'center' }}>
                  <PaymentIcon color="secondary" /> Lương tháng gần đây
                </Typography>
                {dashboardData.recentlySalary && Object.keys(dashboardData.recentlySalary).length > 0 ? (
                  <Box mt={2} borderRadius={3} sx={{ 
                    background: 'linear-gradient(to bottom right, #f8fafc, #f1f5f9)',
                    border: '1px solid #e2e8f0', 
                    p: 3
                  }}>
                    <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={4} justifyContent="space-between" alignItems="flex-start">
                      <Box flex={1} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box>
                          <Typography variant="overline" color="text.secondary" fontWeight="600" letterSpacing={1}>Tháng / Năm</Typography>
                          <Typography variant="h6" color="primary.main" fontWeight="700">
                            {formatMonthYear(dashboardData.recentlySalary.month, dashboardData.recentlySalary.year)}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="overline" color="text.secondary" fontWeight="600" letterSpacing={1}>Tổng buổi dạy</Typography>
                          <Typography variant="h6" fontWeight="600">
                            {dashboardData.recentlySalary.totalLessons || 0} <Typography component="span" variant="body2" color="text.secondary">buổi</Typography>
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="overline" color="text.secondary" fontWeight="600" letterSpacing={1}>Lương mỗi buổi</Typography>
                          <Typography variant="subtitle1" fontWeight="600" color="text.secondary">
                            {formatCurrency(dashboardData.recentlySalary.salaryPerLesson)}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box flex={1} sx={{ 
                        display: 'flex', flexDirection: 'column', gap: 2, 
                        pl: { sm: 4 }, 
                        borderLeft: { sm: '1px dashed #cbd5e1' },
                        pt: { xs: 2, sm: 0 },
                        borderTop: { xs: '1px dashed #cbd5e1', sm: 'none' }
                      }}>
                        <Box>
                          <Typography variant="overline" color="text.secondary" fontWeight="600" letterSpacing={1}>Tổng lương</Typography>
                          <Typography variant="h5" color="success.main" fontWeight="800">
                            {formatCurrency((dashboardData.recentlySalary.totalLessons || 0) * (dashboardData.recentlySalary.salaryPerLesson || 0))}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ mt: 'auto', p: 2, bgcolor: 'rgba(16, 185, 129, 0.1)', borderRadius: 2 }}>
                          <Typography variant="caption" color="success.main" fontWeight="700" display="block" gutterBottom>ĐÃ THANH TOÁN</Typography>
                          <Typography variant="h6" color="success.dark" fontWeight="700">
                            {formatCurrency(dashboardData.recentlySalary.paidAmount)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                ) : (
                  <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4, fontWeight: 500 }}>
                    Chưa có thông tin lương gần đây
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
