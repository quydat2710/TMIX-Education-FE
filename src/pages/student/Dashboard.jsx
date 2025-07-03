import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Alert,
  LinearProgress,
  Avatar,
  Chip,
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
  Schedule as ScheduleIcon,
  AccessTime as TimeIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { COLORS } from '../../utils/colors';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import { getStudentDashboardAPI } from '../../services/api';
import { commonStyles } from '../../utils/styles';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalClasses: 0,
    activeClasses: 0,
    completedClasses: 0,
    totalLessons: 0,
    attendedLessons: 0,
    attendanceRate: 0,
    absentSessions: 0,
    lateSessions: 0,
  });
  const [schedule, setSchedule] = useState([]);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user data from localStorage first
    const userDataFromStorage = JSON.parse(localStorage.getItem('userData') || '{}');
    setUser(userDataFromStorage);

    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(''); // Reset error at the start
    try {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const studentId = userData.studentId || userData.id;
      if (!studentId) {
        setError('Không tìm thấy thông tin học sinh');
        setLoading(false);
        return;
      }
      const res = await getStudentDashboardAPI(studentId);
      const d = res.data?.data || res.data;
      setStats({
        totalClasses: d.totalClasses,
        activeClasses: d.activeClasses,
        completedClasses: d.completedClasses,
        totalLessons: d.attendance?.totalSessions,
        attendedLessons: d.attendance?.presentSessions,
        attendanceRate: d.attendance?.attendanceRate,
        absentSessions: d.attendance?.absentSessions,
        lateSessions: d.attendance?.lateSessions,
      });

      // Get upcoming classes for today and tomorrow
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const upcoming = d.schedules.filter(c => {
        const classData = c.class || c;
        if (classData.status !== 'active') return false;
        const classDate = new Date(c.schedule?.startDate);
        return classDate >= today && classDate <= tomorrow;
      }).slice(0, 3);

      // Get all classes for display
      const allClasses = d.schedules.map(c => {
        const classData = c.class || c;
        return {
          id: classData.id,
          name: classData.name,
          teacher: c.teacher?.name || classData.teacher?.name || 'Chưa phân công',
          schedule: c.schedule || null,
          status: classData.status || 'active',
          room: classData.room || 'Chưa phân phòng',
          startDate: c.schedule?.startDate || classData.startDate,
          endDate: c.schedule?.endDate || classData.endDate,
          feePerLesson: classData.feePerLesson || 0,
          description: classData.description || ''
        };
      });

      setSchedule(allClasses);
      setUpcomingClasses(upcoming);
    } catch (err) {
      console.error('Error fetching student dashboard data:', err);
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
    if (!schedule) return { days: 'Chưa có lịch', time: '' };

    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const days = schedule.dayOfWeeks || [];
    const timeSlots = schedule.timeSlots || {};

    const dayText = days.length > 0
      ? days.map(day => dayNames[day] || `T${day}`).join(', ')
      : 'Chưa có lịch';

    const timeText = timeSlots.startTime && timeSlots.endTime
      ? `${formatTime(timeSlots.startTime)} - ${formatTime(timeSlots.endTime)}`
      : '';

    return { days: dayText, time: timeText };
  };

  if (loading) {
    return (
      <DashboardLayout role="student">
        <Box sx={{ py: 4 }}>
          <LinearProgress />
          <Typography sx={{ textAlign: 'center', mt: 2 }}>Đang tải dữ liệu dashboard...</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <Box sx={commonStyles.pageHeader}>
            <Typography sx={commonStyles.pageTitle}>
              Dashboard Học sinh
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
            Xin chào <strong>{user?.name || 'Học sinh'}</strong>, đây là thông tin học tập của bạn
          </Typography>

        {/* Stat Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Tổng lớp học"
              value={stats.totalClasses}
              icon={<ClassIcon sx={{ fontSize: 40 }} />}
              color="secondary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Lớp đang học"
              value={stats.activeClasses}
              icon={<ClassIcon sx={{ fontSize: 40 }} />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Lớp hoàn thành"
              value={stats.completedClasses}
              icon={<TrendingUpIcon sx={{ fontSize: 40 }} />}
              color="success"
            />
          </Grid>
        </Grid>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Tổng số buổi"
              value={stats.totalLessons}
              icon={<ScheduleIcon sx={{ fontSize: 40 }} />}
              color="info"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Buổi đã tham gia"
              value={stats.attendedLessons}
              icon={<TimeIcon sx={{ fontSize: 40 }} />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Tỷ lệ tham gia"
              value={`${stats.attendanceRate || 0}%`}
              icon={<SchoolIcon sx={{ fontSize: 40 }} />}
              color="primary"
            />
          </Grid>
        </Grid>

        {/* Content Sections */}
        <Grid container spacing={3}>
          {/* Class List */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <Typography variant="h6" gutterBottom sx={{ color: COLORS.primary.main, fontWeight: 600 }}>
                Danh sách lớp học
              </Typography>
              {schedule.length > 0 ? (
                <TableContainer sx={commonStyles.tableContainer}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Lớp học</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Giáo viên</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Phòng học</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Lịch học</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Ngày bắt đầu</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {schedule.map((classItem) => (
                        <TableRow key={classItem.id} sx={commonStyles.tableRow}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {classItem.name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {classItem.teacher}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {classItem.room}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatSchedule(classItem.schedule).days}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatSchedule(classItem.schedule).time}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(classItem.startDate)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={classItem.status === 'active' ? 'Đang học' : classItem.status === 'completed' ? 'Hoàn thành' : classItem.status}
                              color={classItem.status === 'active' ? 'success' : classItem.status === 'completed' ? 'primary' : 'default'}
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
                  Chưa có lớp học nào
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
