import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Button,
  Chip,
  Card,
  CardContent,
  LinearProgress,
  Tabs,
  Tab,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { COLORS } from "../../utils/colors";
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { commonStyles } from '../../utils/styles';
import { useAuth } from '../../contexts/AuthContext';
import { getStudentScheduleAPI, getClassByIdAPI, getStudentAttendanceAPI } from '../../services/api';
import dayjs from 'dayjs';

const MyClasses = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true);
      try {
        let studentId = user?.id;
        if (user?.role === 'student' && user?.studentId) {
          studentId = user.studentId;
        }
        if (!studentId) throw new Error('Không tìm thấy thông tin học sinh');

        // 1. Lấy lịch học
        const scheduleRes = await getStudentScheduleAPI(studentId);
        console.log('scheduleRes:', scheduleRes);
        const schedules = scheduleRes.data.schedules;
        console.log('Schedules lấy trực tiếp:', schedules, Array.isArray(schedules));

        if (!Array.isArray(schedules) || schedules.length === 0) {
          console.log('Không có lịch học nào');
          setClasses([]);
          return;
        }

        const classIds = Array.from(new Set(schedules.map(item => item.class?.id).filter(Boolean)));
        console.log('classIds to fetch:', classIds);

        // 2. Lấy thông tin từng lớp
        const classPromises = classIds.map(async (classId) => {
          console.log('Fetching class info for classId:', classId);
          const classRes = await getClassByIdAPI(classId);
          console.log('classRes for classId', classId, ':', classRes);
          return classRes?.data || {};
        });

        const classList = await Promise.all(classPromises);
        console.log('classList:', classList);

        // 3. Lấy toàn bộ điểm danh của học sinh
        const attendanceRes = await getStudentAttendanceAPI(studentId);
        console.log('attendanceRes:', attendanceRes);

        // Sử dụng detailedAttendance thay vì attendanceRecords
        const attendanceList = attendanceRes?.data?.detailedAttendance || [];
        console.log('attendanceList:', attendanceList);

        // Lấy thống kê điểm danh
        const attendanceStats = attendanceRes?.data?.attendanceStats || {
          presentSessions: 0,
          absentSessions: 0,
          lateSessions: 0,
          totalSessions: 0,
          attendanceRate: 0
        };
        console.log('attendanceStats:', attendanceStats);

        // 4. Gộp dữ liệu lại
        const realClasses = classList.map(classData => {
          console.log('Processing classData:', classData);

          // Tìm thông tin schedule, teacher từ schedules
          const scheduleInfo = schedules.find(s => s.class?.id === classData.id);
          console.log('Found scheduleInfo for class', classData.id, ':', scheduleInfo);

          // Lọc điểm danh cho đúng class
          const classAttendance = attendanceList.filter(a => a.class?.id === classData.id);
          console.log('Class attendance for', classData.id, ':', classAttendance);
          console.log('All attendance records:', attendanceList.map(a => ({ classId: a.class?.id, status: a.status })));

          const attendedLessons = classAttendance.filter(a => a.status === 'present').length;
          const missedLessons = classAttendance.filter(a => a.status === 'absent').length;
          const totalLessons = classAttendance.length;
          const progress = totalLessons > 0 ? Math.round((attendedLessons / totalLessons) * 100) : 0;

          const processedClass = {
            id: classData.id,
            name: classData.name,
            teacher: scheduleInfo?.teacher?.name || 'Chưa phân công',
            schedule: scheduleInfo ? `${scheduleInfo.schedule?.dayOfWeeks?.join(', ')} - ${scheduleInfo.schedule?.timeSlots?.startTime || ''}-${scheduleInfo.schedule?.timeSlots?.endTime || ''}` : 'Chưa có lịch',
            status: classData.status || 'active',
            progress,
            totalLessons,
            attendedLessons,
            missedLessons,
            upcomingLessons: 0, // Có thể tính thêm nếu muốn
            room: classData.room || 'Chưa phân phòng',
            startDate: classData.startDate,
            endDate: classData.endDate,
            feePerLesson: classData.feePerLesson || 0,
            description: classData.description || '',
            attendanceHistory: classAttendance.map(a => ({
              id: a.checkedAt || a.date,
              date: a.date,
              dayOfWeek: dayjs(a.date).format('dddd'),
              status: a.status,
              time: dayjs(a.date).format('HH:mm'),
              note: a.note || ''
            }))
          };

          console.log('Processed class:', processedClass);
          return processedClass;
        });

        console.log('Final realClasses:', realClasses);
        setClasses(realClasses);
      } catch (error) {
        console.error('Error fetching classes:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, [user]);

  const handleOpenDialog = (classData = null) => {
    setSelectedClass(classData);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedClass(null);
    setOpenDialog(false);
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const filteredClasses = classes.filter((classItem) => {
    const name = classItem.name || '';
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());

    // Lọc theo tab và trạng thái
    let matchesStatus = true;
    if (selectedTab === 0) {
      // Tab "Đang học" - hiển thị các lớp active
      matchesStatus = classItem.status === 'active';
    } else if (selectedTab === 1) {
      // Tab "Đã kết thúc" - hiển thị các lớp closed
      matchesStatus = classItem.status === 'closed';
    } else if (selectedTab === 2) {
      // Tab "Sắp khai giảng" - hiển thị các lớp upcoming
      matchesStatus = classItem.status === 'upcoming';
    }

    return matchesSearch && matchesStatus;
  });

  // Debug log
  console.log('Current classes state:', classes);
  console.log('Filtered classes:', filteredClasses);
  console.log('Search query:', searchQuery);

  // Debug trạng thái lớp học
  console.log('Class statuses:', classes.map(c => ({ id: c.id, name: c.name, status: c.status })));
  console.log('Active classes:', classes.filter(c => c.status === 'active').length);
  console.log('Closed classes:', classes.filter(c => c.status === 'closed').length);
  console.log('Upcoming classes:', classes.filter(c => c.status === 'upcoming').length);

  const getStatusColor = (status) => {
    if (status === 'active') return 'success';
    if (status === 'closed') return 'info';
    if (status === 'upcoming') return 'warning';
    return 'default';
  };

  const getStatusLabel = (status) => {
    if (status === 'active') return 'Đang học';
    if (status === 'closed') return 'Đã kết thúc';
    if (status === 'upcoming') return 'Sắp khai giảng';
    return 'Không xác định';
  };

  const calculateAttendanceRate = (attended, total) => {
    return total > 0 ? Math.round((attended / total) * 100) : 0;
  };

  return (
    <DashboardLayout role="student">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3, color: COLORS.primary, fontWeight: 600 }}>
        Lớp học của tôi
      </Typography>

      <Grid container spacing={3}>
        {/* Card thông tin tổng quan */}
        <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', boxShadow: 3 }}>
            <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: COLORS.primary, fontWeight: 600 }}>
                    <SchoolIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Thống kê học tập
              </Typography>
                  <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2" color="text.secondary">Tổng số lớp:</Typography>
                        <Typography variant="h6" sx={{ color: COLORS.primary, fontWeight: 600 }}>
                          {classes.length} lớp
                        </Typography>
                      </Box>
                </Grid>
                <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2" color="text.secondary">Đang học:</Typography>
                        <Typography variant="h6" sx={{ color: 'success.main', fontWeight: 600 }}>
                          {classes.filter((c) => c.status === 'active').length} lớp
                  </Typography>
                      </Box>
                </Grid>
                <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2" color="text.secondary">Đã kết thúc:</Typography>
                        <Typography variant="h6" sx={{ color: 'info.main', fontWeight: 600 }}>
                          {classes.filter((c) => c.status === 'closed').length} lớp
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2" color="text.secondary">Sắp khai giảng:</Typography>
                        <Typography variant="h6" sx={{ color: 'warning.main', fontWeight: 600 }}>
                          {classes.filter((c) => c.status === 'upcoming').length} lớp
                  </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2" color="text.secondary">Tổng buổi học:</Typography>
                        <Typography variant="h6" sx={{ color: COLORS.secondary, fontWeight: 600 }}>
                          {classes.reduce((sum, c) => sum + c.totalLessons, 0)} buổi
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2" color="text.secondary">Đã tham gia:</Typography>
                        <Typography variant="h6" sx={{ color: 'success.main', fontWeight: 600 }}>
                          {classes.reduce((sum, c) => sum + c.attendedLessons, 0)} buổi
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2" color="text.secondary">Đã nghỉ:</Typography>
                        <Typography variant="h6" sx={{ color: 'error.main', fontWeight: 600 }}>
                          {classes.reduce((sum, c) => sum + c.missedLessons, 0)} buổi
                        </Typography>
                      </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Danh sách lớp học */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Tìm kiếm lớp học..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </Paper>

          <Tabs value={selectedTab} onChange={handleTabChange} sx={{ mb: 2 }}>
            <Tab label="Đang học" />
            <Tab label="Đã kết thúc" />
            <Tab label="Sắp khai giảng" />
          </Tabs>

          {loading ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
            <LinearProgress />
              <Typography variant="body1" sx={{ mt: 2 }}>
                Đang tải dữ liệu lớp học...
              </Typography>
            </Box>
          ) : filteredClasses.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {searchQuery ? 'Không tìm thấy lớp học phù hợp' :
                 selectedTab === 0 ? 'Chưa có lớp học nào đang diễn ra' :
                 selectedTab === 1 ? 'Chưa có lớp học nào đã kết thúc' :
                 'Chưa có lớp học nào sắp khai giảng'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchQuery ? 'Hãy thử tìm kiếm với từ khóa khác' : 'Vui lòng liên hệ admin để được phân lớp'}
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                      <TableRow sx={{ backgroundColor: COLORS.primary }}>
                        <TableCell sx={{ color: 'black', fontWeight: 600 }}>Tên lớp</TableCell>
                        <TableCell sx={{ color: 'black', fontWeight: 600 }}>Giáo viên</TableCell>
                        <TableCell sx={{ color: 'black', fontWeight: 600 }}>Lịch học</TableCell>
                        <TableCell sx={{ color: 'black', fontWeight: 600 }}>Trạng thái</TableCell>
                        <TableCell sx={{ color: 'black', fontWeight: 600 }}>Thống kê tham gia</TableCell>
                        <TableCell sx={{ color: 'black', fontWeight: 600 }}>Tiến độ</TableCell>
                        <TableCell sx={{ color: 'black', fontWeight: 600 }} align="center">Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredClasses.map((classItem) => (
                        <TableRow key={classItem.id} hover>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: COLORS.primary }}>
                              {classItem.name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                              <Typography variant="body2">{classItem.teacher}</Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: COLORS.primary }}>
                                {classItem.schedule?.split(' - ')[0] || 'Chưa có lịch'}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {classItem.schedule?.split(' - ')[1] || ''}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getStatusLabel(classItem.status)}
                              color={getStatusColor(classItem.status)}
                              size="small"
                              sx={{
                                fontWeight: 600,
                                '& .MuiChip-icon': {
                                  fontSize: '16px'
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                                <Typography variant="caption" sx={{ color: 'success.main' }}>
                                  Đã học: {classItem.attendedLessons}/{classItem.totalLessons}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CancelIcon sx={{ fontSize: 16, color: 'error.main' }} />
                                <Typography variant="caption" sx={{ color: 'error.main' }}>
                                  Đã nghỉ: {classItem.missedLessons} buổi
                                </Typography>
                              </Box>
                              {classItem.upcomingLessons > 0 && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <ScheduleIcon sx={{ fontSize: 16, color: 'info.main' }} />
                                  <Typography variant="caption" sx={{ color: 'info.main' }}>
                                    Sắp tới: {classItem.upcomingLessons} buổi
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ width: '100%', mr: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={classItem.progress}
                              sx={{
                                height: 8,
                                borderRadius: 5,
                                    bgcolor: COLORS.background,
                                '& .MuiLinearProgress-bar': {
                                      bgcolor: COLORS.primary,
                                },
                              }}
                            />
                          </Box>
                          <Box sx={{ minWidth: 35 }}>
                            <Typography variant="body2" color="text.secondary">
                              {`${Math.round(classItem.progress)}%`}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          onClick={() => handleOpenDialog(classItem)}
                          color="primary"
                              title="Xem chi tiết"
                        >
                          <ViewIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Grid>
      </Grid>

      {/* Dialog xem chi tiết lớp học */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
            <DialogTitle sx={{
              background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
              color: 'white',
              textAlign: 'center'
            }}>
          Chi tiết lớp học
        </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
          {selectedClass && (
                <Grid container spacing={3}>
                  {/* Thông tin cơ bản */}
              <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ color: COLORS.primary, fontWeight: 600 }}>
                  Thông tin lớp học
                </Typography>
                <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">Tên lớp:</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {selectedClass.name}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">Giáo viên:</Typography>
                          <Typography variant="body1">{selectedClass.teacher}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">Phòng học:</Typography>
                        <Typography variant="body1">{selectedClass.room}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">Lịch học:</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: COLORS.primary }}>
                            {selectedClass.schedule?.split(' - ')[0] || 'Chưa có lịch'}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {selectedClass.schedule?.split(' - ')[1] || ''}
                          </Typography>
                        </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">Học phí/buổi:</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: COLORS.secondary }}>
                          {selectedClass.feePerLesson?.toLocaleString()} VNĐ
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">Trạng thái:</Typography>
                        <Chip
                          label={getStatusLabel(selectedClass.status)}
                          color={getStatusColor(selectedClass.status)}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            mt: 0.5,
                            '& .MuiChip-icon': {
                              fontSize: '16px'
                            }
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  {/* Thống kê tham gia */}
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ color: COLORS.primary, fontWeight: 600 }}>
                      Thống kê tham gia học tập
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={3}>
                        <Card sx={{ textAlign: 'center', bgcolor: 'success.light' }}>
                          <CardContent>
                            <Typography variant="h4" sx={{ color: 'success.dark', fontWeight: 600 }}>
                              {selectedClass.attendedLessons}
                            </Typography>
                            <Typography variant="body2" color="success.dark">
                              Buổi đã học
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <Card sx={{ textAlign: 'center', bgcolor: 'error.light' }}>
                          <CardContent>
                            <Typography variant="h4" sx={{ color: 'error.dark', fontWeight: 600 }}>
                              {selectedClass.missedLessons}
                            </Typography>
                            <Typography variant="body2" color="error.dark">
                              Buổi đã nghỉ
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <Card sx={{ textAlign: 'center', bgcolor: 'info.light' }}>
                          <CardContent>
                            <Typography variant="h4" sx={{ color: 'info.dark', fontWeight: 600 }}>
                              {selectedClass.upcomingLessons}
                            </Typography>
                            <Typography variant="body2" color="info.dark">
                              Buổi sắp tới
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <Card sx={{ textAlign: 'center', bgcolor: 'warning.light' }}>
                          <CardContent>
                            <Typography variant="h4" sx={{ color: 'warning.dark', fontWeight: 600 }}>
                              {calculateAttendanceRate(selectedClass.attendedLessons, selectedClass.totalLessons)}%
                            </Typography>
                            <Typography variant="body2" color="warning.dark">
                              Tỷ lệ tham gia
                            </Typography>
                          </CardContent>
                        </Card>
                  </Grid>
                </Grid>
              </Grid>

                  {/* Tiến độ học tập */}
              <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ color: COLORS.primary, fontWeight: 600 }}>
                  Tiến độ học tập
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ width: '100%', mr: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={selectedClass.progress}
                      sx={{
                            height: 12,
                            borderRadius: 6,
                            bgcolor: COLORS.background,
                        '& .MuiLinearProgress-bar': {
                              bgcolor: COLORS.primary,
                        },
                      }}
                    />
                  </Box>
                      <Box sx={{ minWidth: 50 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: COLORS.primary }}>
                      {`${Math.round(selectedClass.progress)}%`}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

                  {/* Lịch sử điểm danh */}
              <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ color: COLORS.primary, fontWeight: 600 }}>
                      Lịch sử điểm danh
                </Typography>
                    <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                          <TableRow sx={{ backgroundColor: COLORS.background }}>
                            <TableCell sx={{ fontWeight: 600 }}>Ngày</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Thứ</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Giờ học</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Ghi chú</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                          {selectedClass.attendanceHistory?.map((attendance) => (
                            <TableRow key={attendance.id} hover>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {new Date(attendance.date).toLocaleDateString('vi-VN')}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" color="text.secondary">
                                  {attendance.dayOfWeek}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" color="text.secondary">
                                  {attendance.time}
                                </Typography>
                              </TableCell>
                          <TableCell>
                            <Chip
                                  label={attendance.status === 'present' ? 'Có mặt' : 'Vắng'}
                                  color={attendance.status === 'present' ? 'success' : 'error'}
                              size="small"
                                  icon={attendance.status === 'present' ? <CheckCircleIcon /> : <CancelIcon />}
                                  sx={{
                                    fontWeight: 600,
                                    '& .MuiChip-icon': {
                                      fontSize: '16px'
                                    }
                                  }}
                            />
                          </TableCell>
                              <TableCell>
                                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                  {attendance.note || '-'}
                                </Typography>
                              </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          )}
        </DialogContent>
            <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
              <Button onClick={handleCloseDialog} variant="outlined">
                Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
      </Box>
    </DashboardLayout>
  );
};

export default MyClasses;
