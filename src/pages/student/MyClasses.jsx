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
  Avatar,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  Assignment as AssignmentIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { COLORS } from "../../utils/colors";
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { commonStyles } from '../../utils/styles';

const MyClasses = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // TODO: Fetch classes data from API
    const fetchClasses = async () => {
      setLoading(true);
      try {
        // const response = await api.get('/student/classes');
        // setClasses(response.data);

        // Dữ liệu mẫu cho demo
        const mockData = [
          {
            id: 1,
            code: 'LOP001',
            name: 'Tiếng Anh Cơ Bản A1',
            teacher: 'Nguyễn Thị Hương',
            teacherAvatar: 'H',
            schedule: 'Thứ 2, 4, 6 - 18:00-19:30',
            status: 'ongoing',
            progress: 75,
            totalLessons: 24,
            attendedLessons: 18,
            missedLessons: 2,
            upcomingLessons: 4,
            room: 'Phòng 101',
            startDate: '2024-01-15',
            endDate: '2024-06-15',
            feePerLesson: 150000,
            description: 'Khóa học tiếng Anh cơ bản dành cho người mới bắt đầu',
            attendanceHistory: [
              { id: 1, date: '2024-03-18', dayOfWeek: 'Thứ 2', status: 'present', time: '18:00-19:30', note: '' },
              { id: 2, date: '2024-03-16', dayOfWeek: 'Thứ 7', status: 'absent', time: '18:00-19:30', note: 'Nghỉ ốm' },
              { id: 3, date: '2024-03-13', dayOfWeek: 'Thứ 4', status: 'present', time: '18:00-19:30', note: '' },
              { id: 4, date: '2024-03-11', dayOfWeek: 'Thứ 2', status: 'present', time: '18:00-19:30', note: '' },
              { id: 5, date: '2024-03-09', dayOfWeek: 'Thứ 7', status: 'present', time: '18:00-19:30', note: '' },
              { id: 6, date: '2024-03-06', dayOfWeek: 'Thứ 4', status: 'absent', time: '18:00-19:30', note: 'Có việc gia đình' },
              { id: 7, date: '2024-03-04', dayOfWeek: 'Thứ 2', status: 'present', time: '18:00-19:30', note: '' },
              { id: 8, date: '2024-03-02', dayOfWeek: 'Thứ 7', status: 'present', time: '18:00-19:30', note: '' },
            ]
          },
          {
            id: 2,
            code: 'LOP002',
            name: 'Tiếng Anh Giao Tiếp B1',
            teacher: 'Trần Văn Minh',
            teacherAvatar: 'M',
            schedule: 'Thứ 3, 5, 7 - 19:00-20:30',
            status: 'ongoing',
            progress: 45,
            totalLessons: 30,
            attendedLessons: 13,
            missedLessons: 1,
            upcomingLessons: 16,
            room: 'Phòng 203',
            startDate: '2024-02-01',
            endDate: '2024-08-01',
            feePerLesson: 180000,
            description: 'Khóa học tiếng Anh giao tiếp nâng cao',
            attendanceHistory: [
              { id: 9, date: '2024-03-19', dayOfWeek: 'Thứ 3', status: 'present', time: '19:00-20:30', note: '' },
              { id: 10, date: '2024-03-17', dayOfWeek: 'Chủ nhật', status: 'present', time: '19:00-20:30', note: '' },
              { id: 11, date: '2024-03-14', dayOfWeek: 'Thứ 5', status: 'present', time: '19:00-20:30', note: '' },
              { id: 12, date: '2024-03-12', dayOfWeek: 'Thứ 3', status: 'absent', time: '19:00-20:30', note: 'Nghỉ học' },
              { id: 13, date: '2024-03-10', dayOfWeek: 'Chủ nhật', status: 'present', time: '19:00-20:30', note: '' },
              { id: 14, date: '2024-03-07', dayOfWeek: 'Thứ 5', status: 'present', time: '19:00-20:30', note: '' },
            ]
          },
          {
            id: 3,
            code: 'LOP003',
            name: 'Tiếng Anh IELTS',
            teacher: 'Lê Thị Lan',
            teacherAvatar: 'L',
            schedule: 'Thứ 2, 4, 6 - 20:00-21:30',
            status: 'completed',
            progress: 100,
            totalLessons: 36,
            attendedLessons: 34,
            missedLessons: 2,
            upcomingLessons: 0,
            room: 'Phòng 305',
            startDate: '2023-09-01',
            endDate: '2024-02-28',
            feePerLesson: 200000,
            description: 'Khóa học luyện thi IELTS',
            attendanceHistory: [
              { id: 15, date: '2024-02-26', dayOfWeek: 'Thứ 2', status: 'present', time: '20:00-21:30', note: 'Buổi cuối' },
              { id: 16, date: '2024-02-24', dayOfWeek: 'Thứ 7', status: 'present', time: '20:00-21:30', note: '' },
              { id: 17, date: '2024-02-21', dayOfWeek: 'Thứ 4', status: 'present', time: '20:00-21:30', note: '' },
              { id: 18, date: '2024-02-19', dayOfWeek: 'Thứ 2', status: 'present', time: '20:00-21:30', note: '' },
              { id: 19, date: '2024-02-17', dayOfWeek: 'Thứ 7', status: 'absent', time: '20:00-21:30', note: 'Nghỉ ốm' },
              { id: 20, date: '2024-02-14', dayOfWeek: 'Thứ 4', status: 'present', time: '20:00-21:30', note: '' },
            ]
          }
        ];

        setClasses(mockData);
      } catch (error) {
        console.error('Error fetching classes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

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
    const matchesSearch = classItem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         classItem.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedTab === 0 ? classItem.status === 'ongoing' : classItem.status === 'completed';
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    return status === 'ongoing' ? 'success' : 'default';
  };

  const getStatusLabel = (status) => {
    return status === 'ongoing' ? 'Đang học' : 'Đã hoàn thành';
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
                    {classes.filter((c) => c.status === 'ongoing').length} lớp
                  </Typography>
                      </Box>
                </Grid>
                <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2" color="text.secondary">Đã hoàn thành:</Typography>
                        <Typography variant="h6" sx={{ color: 'info.main', fontWeight: 600 }}>
                    {classes.filter((c) => c.status === 'completed').length} lớp
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
            <Tab label="Đã hoàn thành" />
          </Tabs>

          {loading ? (
            <LinearProgress />
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                      <TableRow sx={{ backgroundColor: COLORS.primary }}>
                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Mã lớp</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Tên lớp</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Giáo viên</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Lịch học</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Thống kê tham gia</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Tiến độ</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredClasses.map((classItem) => (
                        <TableRow key={classItem.id} hover>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: COLORS.primary }}>
                              {classItem.code}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {classItem.name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: COLORS.primary }}>
                                {classItem.teacherAvatar}
                              </Avatar>
                              <Typography variant="body2">{classItem.teacher}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                              {classItem.schedule}
                            </Typography>
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
                        <Typography variant="subtitle2" color="text.secondary">Mã lớp:</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: COLORS.primary }}>
                          {selectedClass.code}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">Tên lớp:</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {selectedClass.name}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">Giáo viên:</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: COLORS.primary }}>
                            {selectedClass.teacherAvatar}
                          </Avatar>
                          <Typography variant="body1">{selectedClass.teacher}</Typography>
                        </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">Phòng học:</Typography>
                        <Typography variant="body1">{selectedClass.room}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">Lịch học:</Typography>
                        <Typography variant="body1">{selectedClass.schedule}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">Học phí/buổi:</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: COLORS.secondary }}>
                          {selectedClass.feePerLesson?.toLocaleString()} VNĐ
                        </Typography>
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
