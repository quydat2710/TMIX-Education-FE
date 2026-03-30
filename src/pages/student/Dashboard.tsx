import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Alert,
  LinearProgress,
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
  Person as PersonIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import { getStudentDashboardAPI } from '../../services/dashboard';
import { commonStyles } from '../../utils/styles';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState<any>({
    totalClasses: 0,
    activeClasses: 0,
    completedClasses: 0,
    attendance: {
      totalSessions: 0,
      presentSessions: 0,
      absentSessions: 0,
      lateSessions: 0,
      attendanceRate: 0
    },
    classList: []
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
      const studentId = user?.studentId || user?.id;
      if (!studentId) {
        setError('Không tìm thấy thông tin học sinh');
        setLoading(false);
        return;
      }

      const response = await getStudentDashboardAPI(studentId);
      const data = response?.data?.data || response?.data || {};

      setDashboardData({
        totalClasses: data.totalClasses || 0,
        activeClasses: data.activeClasses || 0,
        completedClasses: data.completedClasses || 0,
        attendance: data.attendance || {
          totalSessions: 0,
          presentSessions: 0,
          absentSessions: 0,
          lateSessions: 0,
          attendanceRate: 0
        },
        classList: data.classList || []
      });

    } catch (err) {
      console.error('Error fetching student dashboard data:', err);
      setError('Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
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
        <Grid container spacing={3} sx={{ mb: 4 }} component={motion.div} initial="hidden" animate="visible" variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
        }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Tổng lớp học"
              value={dashboardData.totalClasses}
              icon={<ClassIcon sx={{ fontSize: 32 }} />}
              color="primary"
              index={0}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Lớp đang học"
              value={dashboardData.activeClasses}
              icon={<SchoolIcon sx={{ fontSize: 32 }} />}
              color="success"
              index={1}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Lớp hoàn thành"
              value={dashboardData.completedClasses}
              icon={<TrendingUpIcon sx={{ fontSize: 32 }} />}
              color="info"
              index={2}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Tỷ lệ tham gia"
              value={`${dashboardData.attendance.attendanceRate || 0}%`}
              icon={<ScheduleIcon sx={{ fontSize: 32 }} />}
              color="warning"
              index={3}
            />
          </Grid>
        </Grid>

          {/* Attendance Stats */}
          <Grid container spacing={3} sx={{ mb: 4 }} component={motion.div} initial="hidden" animate="visible" variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
          }}>
            <Grid item xs={12} sm={6} md={3}>
            <StatCard
                title="Tổng số buổi"
                value={dashboardData.attendance.totalSessions}
                icon={<TimeIcon sx={{ fontSize: 32 }} />}
                color="secondary"
                index={4}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Buổi có mặt"
                value={dashboardData.attendance.presentSessions}
                icon={<PersonIcon sx={{ fontSize: 32 }} />}
                color="success"
                index={5}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Buổi vắng"
                value={dashboardData.attendance.absentSessions}
                icon={<PersonIcon sx={{ fontSize: 32 }} />}
                color="error"
                index={6}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Buổi muộn"
                value={dashboardData.attendance.lateSessions}
                icon={<TimeIcon sx={{ fontSize: 32 }} />}
                color="warning"
                index={7}
              />
            </Grid>
          </Grid>

          {/* Class List */}
          <Grid container spacing={3} component={motion.div} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
          <Grid item xs={12}>
            <Paper sx={{ 
              p: { xs: 2, md: 4 }, 
              borderRadius: 4, 
              boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)', 
              border: '1px solid rgba(0,0,0,0.03)',
              background: '#ffffff',
              overflow: 'hidden',
              position: 'relative'
            }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <SchoolIcon color="primary" /> Danh sách lớp học
              </Typography>
                {dashboardData.classList.length > 0 ? (
                <Box mt={2} borderRadius={3} sx={{ 
                  background: 'linear-gradient(to bottom right, #f8fafc, #f1f5f9)',
                  border: '1px solid #e2e8f0', 
                  p: { xs: 1, sm: 2 } 
                }}>
                <TableContainer 
                  sx={{ 
                    ...commonStyles.tableContainer, 
                    borderRadius: 2, 
                    boxShadow: 'none', 
                    border: 'none',
                    bgcolor: 'transparent' 
                  }}
                >
                  <Table size="medium">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Lớp học</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Giáo viên</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Phòng học</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Lịch học</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Thời gian</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                          {dashboardData.classList.map((classItem: any, index: number) => {
                            const schedule = formatSchedule(classItem.schedule);
                            return (
                              <TableRow key={index} sx={commonStyles.tableRow}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                                    {classItem.className}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                                    {classItem.teacherName || 'Chưa phân công'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                                    {classItem.room || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                                    {schedule.days}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                                    {schedule.time}
                              </Typography>
                          </TableCell>
                          <TableCell>
                            {(() => {
                              const isActive = classItem.status === 'active';
                              const isCompleted = classItem.status === 'completed';
                              
                              const statusLabel = isActive ? 'Đang học' : isCompleted ? 'Hoàn thành' : (classItem.status || 'N/A');
                              const colorCode = isActive ? '#059669' : isCompleted ? '#2563eb' : '#64748b';
                              const bgCode = isActive ? 'rgba(16, 185, 129, 0.1)' : isCompleted ? 'rgba(59, 130, 246, 0.1)' : 'rgba(100, 116, 139, 0.1)';
                              const borderCode = isActive ? 'rgba(16, 185, 129, 0.2)' : isCompleted ? 'rgba(59, 130, 246, 0.2)' : 'rgba(100, 116, 139, 0.2)';

                              return (
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
                                    color: colorCode,
                                    background: bgCode,
                                    border: `1px solid ${borderCode}`,
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  {statusLabel}
                                </Box>
                              );
                            })()}
                          </TableCell>
                        </TableRow>
                            );
                          })}
                    </TableBody>
                  </Table>
                </TableContainer>
                </Box>
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
