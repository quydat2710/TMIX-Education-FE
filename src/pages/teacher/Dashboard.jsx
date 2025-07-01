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
import {
  getTeacherScheduleAPI,
  getTeacherPaymentByIdAPI,
  getClassByIdAPI,
  getStudentsInClassAPI,
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
  const [activeClasses, setActiveClasses] = useState([]);

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

      // Fetch data in parallel - use correct API functions
      const [scheduleRes, paymentsRes] = await Promise.all([
        getTeacherScheduleAPI(teacherId),
        getTeacherPaymentByIdAPI(teacherId), // Use the correct API function
      ]);

      console.log('scheduleRes:', scheduleRes);
      console.log('paymentsRes:', paymentsRes);

      const scheduleData = scheduleRes?.data || {};
      const classes = scheduleData.classes || [];

      // Handle payments response - it's a single object, not an array
      let payments = [];
      if (paymentsRes && paymentsRes.data) {
        payments = [paymentsRes.data]; // Convert to array for consistency
      } else if (paymentsRes && !paymentsRes.data) {
        payments = [paymentsRes]; // If response is directly the data object
      }

      // Get detailed class information and student counts
      const detailedClasses = [];
      let totalStudentsCount = 0;

      for (const classItem of classes) {
        try {
          const classRes = await getClassByIdAPI(classItem.id);
          if (classRes?.data) {
            // Get student count for this class
            let studentCount = 0;
            try {
              const studentsRes = await getStudentsInClassAPI(classItem.id);
              if (studentsRes?.data?.students) {
                studentCount = studentsRes.data.students.length;
              }
            } catch (studentErr) {
              console.error(`Error fetching students for class ${classItem.id}:`, studentErr);
            }

            const classWithStudents = {
              ...classRes.data,
              studentCount: studentCount
            };

            detailedClasses.push(classWithStudents);
            totalStudentsCount += studentCount;
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
            studentCount: 0
          });
        }
      }

      // Get active classes
      const active = detailedClasses.filter(c => c.status === 'active').slice(0, 5);

      // Calculate statistics
      const activeClassesCount = detailedClasses.filter(c => c.status === 'active').length;

      // Calculate salary from payment data
      const totalSalary = payments.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
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
        activeClasses: activeClassesCount,
        totalStudents: totalStudentsCount,
        totalSalary,
        paidSalary,
        upcomingClasses: upcoming.length,
      });

      setMyClasses(detailedClasses);
      setRecentPayments(payments.slice(0, 3));
      setActiveClasses(active);
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
          {/* Active Classes */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ color: COLORS.primary.main, fontWeight: 600 }}>
                Lớp học đang dạy
              </Typography>
              {activeClasses.length > 0 ? (
                <TableContainer sx={commonStyles.tableContainer}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Tên lớp</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Lịch học</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Phòng</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {activeClasses.map((classItem) => (
                        <TableRow key={classItem.id} hover sx={commonStyles.tableRow}>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              {classItem.name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatSchedule(classItem.schedule).dayText}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatSchedule(classItem.schedule).timeText}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              Phòng {classItem.room}
                      </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={classItem.status === 'active' ? 'Đang hoạt động' : classItem.status}
                              color={classItem.status === 'active' ? 'success' : 'default'}
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
                  Không có lớp học đang dạy
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
                            <React.Fragment>
                              <Typography variant="body2" color="text.secondary">
                                {payment.totalLessons || 0} buổi × {formatCurrency(payment.salaryPerLesson || 0)}/buổi
                              </Typography>
                              <Typography variant="body2" fontWeight="600" color="success.main">
                                Đã nhận: {formatCurrency(payment.paidAmount || 0)}
                              </Typography>
                            </React.Fragment>
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
      </Box>
    </DashboardLayout>
  );
};

export default Dashboard;
