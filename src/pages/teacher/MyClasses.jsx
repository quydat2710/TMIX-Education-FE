import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  CardActions,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  ButtonGroup,
  Snackbar,
  Alert,
  Badge,
} from '@mui/material';
import {
  Search as SearchIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  Event as EventIcon,
  School as SchoolIcon,
  DoneAll as DoneAllIcon,
  HourglassEmpty as HourglassEmptyIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  WatchLater as WatchLaterIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import { commonStyles } from '../../utils/styles';
import { useNavigate } from 'react-router-dom';

// --- Dữ liệu giả (Mock Data) ---
const mockMyClasses = [
  { id: 'class-01', name: 'Lớp TOEIC 550+', studentCount: 25, status: 'ongoing', progress: 70, schedule: 'T2-T4-T6, 18:00-19:30' },
  { id: 'class-02', name: 'Tiếng Anh Giao Tiếp Cơ Bản', studentCount: 18, status: 'ongoing', progress: 45, schedule: 'T3-T5, 19:00-20:30' },
  { id: 'class-03', name: 'Luyện thi IELTS 6.5', studentCount: 15, status: 'upcoming', progress: 0, schedule: 'T7-CN, 09:00-11:00' },
  { id: 'class-04', name: 'Tiếng Anh cho người đi làm', studentCount: 22, status: 'completed', progress: 100, schedule: 'T2-T4, 20:00-21:30' },
  { id: 'class-05', name: 'Ngữ pháp Nâng cao', studentCount: 20, status: 'completed', progress: 100, schedule: 'T3-T5, 18:00-19:30' },
];

// Mock data cho danh sách học sinh
const mockStudents = {
  'class-01': [
    { studentId: 'stu-1', name: 'Nguyễn Văn An' },
    { studentId: 'stu-2', name: 'Trần Thị Bích' },
    { studentId: 'stu-3', name: 'Lê Hoàng Cường' },
    { studentId: 'stu-4', name: 'Phạm Thuỳ Dung' },
    { studentId: 'stu-5', name: 'Võ Minh Long' },
  ],
  'class-02': [
    { studentId: 'stu-6', name: 'Hoàng Thị Hương' },
    { studentId: 'stu-7', name: 'Đặng Văn Nam' },
    { studentId: 'stu-8', name: 'Lý Thị Oanh' },
  ],
};

// Mock data cho lịch sử điểm danh
const mockAttendanceHistory = {
  'class-01': [
    {
      date: '2024-01-15',
      session: 'Buổi 1',
      totalStudents: 25,
      present: 23,
      absent: 1,
      late: 1,
      attendanceRate: 92,
    },
    {
      date: '2024-01-17',
      session: 'Buổi 2',
      totalStudents: 25,
      present: 24,
      absent: 0,
      late: 1,
      attendanceRate: 96,
    },
    {
      date: '2024-01-19',
      session: 'Buổi 3',
      totalStudents: 25,
      present: 22,
      absent: 2,
      late: 1,
      attendanceRate: 88,
    },
    {
      date: '2024-01-22',
      session: 'Buổi 4',
      totalStudents: 25,
      present: 25,
      absent: 0,
      late: 0,
      attendanceRate: 100,
    },
  ],
  'class-02': [
    {
      date: '2024-01-16',
      session: 'Buổi 1',
      totalStudents: 18,
      present: 17,
      absent: 1,
      late: 0,
      attendanceRate: 94,
    },
    {
      date: '2024-01-18',
      session: 'Buổi 2',
      totalStudents: 18,
      present: 16,
      absent: 1,
      late: 1,
      attendanceRate: 89,
    },
  ],
};
// ------------------------------

const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
};

const MyClasses = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [attendance, setAttendance] = useState({});
  const [isChanged, setIsChanged] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  const myClasses = useMemo(() => mockMyClasses, []);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleOpenAttendance = (classItem) => {
    setSelectedClass(classItem);

    // Khởi tạo trạng thái điểm danh ban đầu là vắng mặt cho tất cả
    const students = mockStudents[classItem.id] || [];
    const initialAttendance = students.reduce((acc, student) => {
      acc[student.studentId] = ATTENDANCE_STATUS.ABSENT;
      return acc;
    }, {});
    setAttendance(initialAttendance);
    setIsChanged(false);
    setAttendanceModalOpen(true);
  };

  const handleOpenHistory = (classItem) => {
    setSelectedClass(classItem);
    setHistoryModalOpen(true);
  };

  const handleCloseAttendance = () => {
    setAttendanceModalOpen(false);
    setSelectedClass(null);
    setAttendance({});
    setIsChanged(false);
  };

  const handleCloseHistory = () => {
    setHistoryModalOpen(false);
    setSelectedClass(null);
  };

  const handleStatusChange = (studentId, status) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: status,
    }));
    setIsChanged(true);
  };

  const handleSaveAttendance = async () => {
    console.log('Đang lưu điểm danh (demo):', attendance);
    setNotification({ open: true, message: 'Điểm danh đã được lưu thành công!', severity: 'success' });
    setIsChanged(false);
    handleCloseAttendance();
  };

  const getAttendanceRateColor = (rate) => {
    if (rate >= 90) return 'success';
    if (rate >= 80) return 'warning';
    return 'error';
  };

  const filteredClasses = useMemo(() => {
    const ongoing = myClasses.filter(c => c.status !== 'completed');
    const completed = myClasses.filter(c => c.status === 'completed');
    const source = selectedTab === 0 ? ongoing : completed;
    return source.filter((classItem) =>
      classItem.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [myClasses, selectedTab, searchQuery]);

  const statusMap = {
    ongoing: { label: 'Đang diễn ra', color: 'success' },
    upcoming: { label: 'Sắp diễn ra', color: 'primary' },
    completed: { label: 'Đã kết thúc', color: 'default' },
  };

  return (
    <DashboardLayout role="teacher">
      <Box sx={commonStyles.pageContainer}>
          <Typography variant="h4" gutterBottom>
        Lớp học của tôi
      </Typography>

        {/* Stat Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Tổng số lớp"
              value={myClasses.length}
              icon={<SchoolIcon sx={{ fontSize: 40 }} />}
              color="primary"
            />
                </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Đang & Sắp dạy"
              value={myClasses.filter(c => c.status !== 'completed').length}
              icon={<HourglassEmptyIcon sx={{ fontSize: 40 }} />}
              color="warning"
            />
                </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Lớp đã hoàn thành"
              value={myClasses.filter(c => c.status === 'completed').length}
              icon={<DoneAllIcon sx={{ fontSize: 40 }} />}
              color="success"
            />
              </Grid>
        </Grid>

        {/* Search and Tabs */}
          <Paper sx={{ p: 2, mb: 3 }}>
                <TextField
                  fullWidth
            placeholder="Tìm kiếm theo tên lớp học..."
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
          </Paper>

        <Tabs value={selectedTab} onChange={handleTabChange} sx={{ mb: 2 }} variant="fullWidth">
          <Tab label="Đang & Sắp dạy" />
            <Tab label="Đã kết thúc" />
          </Tabs>

        {/* Class Cards Grid */}
        <Grid container spacing={3}>
          {filteredClasses.map((classItem) => (
            <Grid item xs={12} sm={6} md={4} key={classItem.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Chip
                    label={statusMap[classItem.status]?.label || 'Không xác định'}
                    color={statusMap[classItem.status]?.color || 'default'}
                    size="small"
                    sx={{ mb: 1.5 }}
                  />
                  <Typography variant="h6" component="div" gutterBottom>
                    {classItem.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', mb: 1 }}>
                    <PeopleIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2">{classItem.studentCount} học viên</Typography>
                  </Box>
                   <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', mb: 2 }}>
                    <EventIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2">{classItem.schedule}</Typography>
                  </Box>
                  {classItem.status !== 'completed' && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">Tiến độ</Typography>
                      <LinearProgress variant="determinate" value={classItem.progress} sx={{ mt: 0.5 }} />
                    </Box>
                  )}
                </CardContent>
                <CardActions>
                  {classItem.status === 'ongoing' && (
                    <>
                      <Tooltip title="Điểm danh buổi học hôm nay">
                        <Button
                          size="small"
                          startIcon={<AssignmentIcon />}
                          onClick={() => handleOpenAttendance(classItem)}
                        >
                          Điểm danh
                        </Button>
                      </Tooltip>
                      <Tooltip title="Xem lịch sử điểm danh">
                        <Button
                          size="small"
                          startIcon={<HistoryIcon />}
                          onClick={() => handleOpenHistory(classItem)}
                        >
                          Lịch sử điểm danh
                        </Button>
                      </Tooltip>
                    </>
                  )}
                  <Button size="small">Xem chi tiết</Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {filteredClasses.length === 0 && (
          <Typography sx={{ textAlign: 'center', mt: 4 }}>
            Không tìm thấy lớp học nào.
          </Typography>
        )}

        {/* Attendance Modal */}
        <Dialog
          open={attendanceModalOpen}
          onClose={handleCloseAttendance}
          maxWidth="md"
          //fullWidth
        >
          <DialogTitle sx={{
            borderBottom: '1px solid #e0e0e0',
            pb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <AssignmentIcon color="primary" />
            <Box>
              <Typography variant="h6">Điểm danh lớp học</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedClass?.name}
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ pt: 0, px: 1 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>STT</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Họ và Tên</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Có mặt</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Đi muộn</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Vắng</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Ghi chú</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(mockStudents[selectedClass?.id] || []).map((student, index) => (
                    <TableRow key={student.studentId} sx={{ '&:hover': { bgcolor: '#fafafa' } }}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {student.name}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <input
                          type="radio"
                          id={`present-${student.studentId}`}
                          name={`attendance-${student.studentId}`}
                          checked={attendance[student.studentId] === ATTENDANCE_STATUS.PRESENT}
                          onChange={() => handleStatusChange(student.studentId, ATTENDANCE_STATUS.PRESENT)}
                          style={{
                            transform: 'scale(1.3)',
                            accentColor: '#2e7d32'
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <input
                          type="radio"
                          id={`late-${student.studentId}`}
                          name={`attendance-${student.studentId}`}
                          checked={attendance[student.studentId] === ATTENDANCE_STATUS.LATE}
                          onChange={() => handleStatusChange(student.studentId, ATTENDANCE_STATUS.LATE)}
                          style={{
                            transform: 'scale(1.3)',
                            accentColor: '#ed6c02'
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <input
                          type="radio"
                          id={`absent-${student.studentId}`}
                          name={`attendance-${student.studentId}`}
                          checked={attendance[student.studentId] === ATTENDANCE_STATUS.ABSENT}
                          onChange={() => handleStatusChange(student.studentId, ATTENDANCE_STATUS.ABSENT)}
                          style={{
                            transform: 'scale(1.3)',
                            accentColor: '#d32f2f'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          placeholder="Ghi chú..."
                          variant="outlined"
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              fontSize: '0.875rem'
                            }
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Summary */}
            <Paper sx={{ p: 2, mt: 3, bgcolor: '#f5f5f5' }}>
              <Typography variant="subtitle2" gutterBottom>
                Tóm tắt điểm danh:
              </Typography>
              <Box sx={{ display: 'flex', gap: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon color="success" fontSize="small" />
                  <Typography variant="body2">
                    Có mặt: {Object.values(attendance).filter(status => status === ATTENDANCE_STATUS.PRESENT).length}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WatchLaterIcon color="warning" fontSize="small" />
                  <Typography variant="body2">
                    Đi muộn: {Object.values(attendance).filter(status => status === ATTENDANCE_STATUS.LATE).length}
                </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CancelIcon color="error" fontSize="small" />
                  <Typography variant="body2">
                    Vắng: {Object.values(attendance).filter(status => status === ATTENDANCE_STATUS.ABSENT).length}
                </Typography>
                </Box>
              </Box>
            </Paper>
        </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: '1px solid #e0e0e0' }}>
            <Button
              onClick={handleCloseAttendance}
              variant="outlined"
              size="large"
            >
              Hủy
            </Button>
          <Button
            variant="contained"
              onClick={handleSaveAttendance}
              disabled={!isChanged}
              size="large"
            startIcon={<AssignmentIcon />}
          >
              Lưu điểm danh
          </Button>
        </DialogActions>
      </Dialog>

        {/* History Modal */}
        <Dialog
          open={historyModalOpen}
          onClose={handleCloseHistory}
          maxWidth="lg"
          fullWidth
        >
        <DialogTitle>
            Lịch sử điểm danh - {selectedClass?.name}
        </DialogTitle>
        <DialogContent>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                    <TableCell>Ngày</TableCell>
                    <TableCell>Buổi học</TableCell>
                    <TableCell align="center">Tổng số</TableCell>
                    <TableCell align="center">Có mặt</TableCell>
                    <TableCell align="center">Vắng</TableCell>
                    <TableCell align="center">Đi muộn</TableCell>
                    <TableCell align="center">Tỷ lệ</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                  {(mockAttendanceHistory[selectedClass?.id] || []).map((record, index) => (
                    <TableRow key={index}>
                      <TableCell>{new Date(record.date).toLocaleDateString('vi-VN')}</TableCell>
                      <TableCell>{record.session}</TableCell>
                      <TableCell align="center">{record.totalStudents}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={record.present}
                          color="success"
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={record.absent}
                          color="error"
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={record.late}
                          color="warning"
                          size="small"
                          variant="outlined"
                        />
                        </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={`${record.attendanceRate}%`}
                          color={getAttendanceRateColor(record.attendanceRate)}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            {(mockAttendanceHistory[selectedClass?.id] || []).length === 0 && (
              <Typography sx={{ textAlign: 'center', mt: 2, color: 'text.secondary' }}>
                Chưa có lịch sử điểm danh cho lớp này.
                </Typography>
          )}
        </DialogContent>
        <DialogActions>
            <Button onClick={handleCloseHistory}>
              Đóng
          </Button>
        </DialogActions>
      </Dialog>

        {/* Notification Snackbar */}
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={() => setNotification({ ...notification, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={() => setNotification({ ...notification, open: false })} severity={notification.severity} sx={{ width: '100%' }}>
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </DashboardLayout>
  );
};

export default MyClasses;
