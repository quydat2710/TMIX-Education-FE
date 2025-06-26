import React, { useState, useMemo, useEffect } from 'react';
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
  Avatar,
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
import { useAuth } from '../../contexts/AuthContext';
import {
  getTeacherScheduleAPI,
  getClassByIdAPI,
  getStudentsInClassAPI,
  getTodayAttendanceAPI,
  getAttendanceListAPI,
  updateAttendanceAPI
} from '../../services/api';

const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
};

function formatSchedule(schedule) {
  if (!schedule) return '';
  const days = (schedule.dayOfWeeks || [])
    .map(d => ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d])
    .join(', ');
  const time = schedule.timeSlots
    ? `${schedule.timeSlots.startTime} - ${schedule.timeSlots.endTime}`
    : '';
  return `${days}${time ? ' | ' + time : ''}`;
}

const MyClasses = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [attendance, setAttendance] = useState({});
  const [attendanceNote, setAttendanceNote] = useState({});
  const [isChanged, setIsChanged] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [myClasses, setMyClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendanceId, setAttendanceId] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedClassDetail, setSelectedClassDetail] = useState(null);
  const [studentsDetail, setStudentsDetail] = useState([]);
  const [attendanceDetail, setAttendanceDetail] = useState({});
  const [attendanceNoteDetail, setAttendanceNoteDetail] = useState({});
  const [attendanceIdDetail, setAttendanceIdDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [detailTabValue, setDetailTabValue] = useState(0);
  const [studentHistoryModal, setStudentHistoryModal] = useState({ open: false, student: null, history: [] });
  const navigate = useNavigate();

  // Fetch danh sách lớp dạy
  useEffect(() => {
    const fetchClasses = async () => {
      if (!user?.teacherId) return;
      setLoading(true);
      try {
        const res = await getTeacherScheduleAPI(user.teacherId);
        setMyClasses(res?.data?.classes || []);
      } catch (err) {
        setNotification({ open: true, message: 'Không thể tải danh sách lớp dạy', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, [user?.teacherId]);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleDetailTabChange = (event, newValue) => {
    setDetailTabValue(newValue);
  };

  const handleOpenAttendance = async (classItem) => {
    setSelectedClass(classItem);
    setLoading(true);
    try {
      // Lấy danh sách học sinh
      const studentsRes = await getStudentsInClassAPI(classItem.id);
      setStudents(studentsRes?.data?.students || []);
      // Lấy điểm danh hôm nay
      const attendanceRes = await getTodayAttendanceAPI(classItem.id);
      const attData = attendanceRes?.data;
      setAttendanceId(attData?._id || attData?.id || null);
      // Map trạng thái điểm danh
      const attMap = {};
      const noteMap = {};
      (attData?.students || []).forEach(s => {
        attMap[s.studentId] = s.status;
        noteMap[s.studentId] = s.note || '';
      });
      // Nếu chưa có thì mặc định vắng mặt
      studentsRes?.data?.students?.forEach(s => {
        if (!attMap[s.id]) attMap[s.id] = ATTENDANCE_STATUS.ABSENT;
        if (!noteMap[s.id]) noteMap[s.id] = '';
      });
      setAttendance(attMap);
      setAttendanceNote(noteMap);
    setIsChanged(false);
    setAttendanceModalOpen(true);
    } catch (err) {
      setNotification({ open: true, message: 'Không thể tải dữ liệu điểm danh', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenHistory = async (classItem) => {
    setSelectedClass(classItem);
    setLoading(true);
    try {
      const res = await getAttendanceListAPI({ classId: classItem.id, limit: 20, page: 1, sortBy: 'date' });
      setAttendanceHistory(res?.data?.attendances || []);
    setHistoryModalOpen(true);
    } catch (err) {
      setNotification({ open: true, message: 'Không thể tải lịch sử điểm danh', severity: 'error' });
    } finally {
      setLoading(false);
    }
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
    if (!attendanceId) return;
    setLoading(true);
    try {
      const studentsArr = students.map(s => ({
        studentId: s.id,
        status: attendance[s.id],
        note: attendanceNote[s.id] || ''
      }));
      await updateAttendanceAPI(attendanceId, { students: studentsArr });
    setNotification({ open: true, message: 'Điểm danh đã được lưu thành công!', severity: 'success' });
    setIsChanged(false);
      setAttendanceModalOpen(false);
    } catch (err) {
      setNotification({ open: true, message: 'Lưu điểm danh thất bại', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceRateColor = (rate) => {
    if (rate >= 90) return 'success';
    if (rate >= 80) return 'warning';
    return 'error';
  };

  const filteredClasses = useMemo(() => {
    let source = [];
    if (selectedTab === 0) {
      source = myClasses.filter(c => c.status === 'active');
    } else if (selectedTab === 1) {
      source = myClasses.filter(c => c.status === 'upcoming');
    } else {
      source = myClasses.filter(c => c.status === 'closed');
    }
    return source.filter((classItem) =>
      classItem.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [myClasses, selectedTab, searchQuery]);

  const statusMap = {
    active: { label: 'Đang dạy', color: 'success' },
    upcoming: { label: 'Sắp diễn ra', color: 'primary' },
    closed: { label: 'Đã kết thúc', color: 'default' },
  };

  const handleOpenDetail = async (classItem) => {
    setOpenDetail(true);
    setLoadingDetail(true);
    setLoadingStudents(true);
    setSelectedClassDetail(null);
    setStudentsDetail([]);
    setDetailTabValue(0);
    try {
      // Fetch class details
      const classRes = await getClassByIdAPI(classItem.id);
      setSelectedClassDetail(classRes?.data);

      // Fetch students list
      const studentsRes = await getStudentsInClassAPI(classItem.id);
      setStudentsDetail(studentsRes?.data?.students || []);
    } catch (err) {
      setNotification({ open: true, message: 'Không thể tải chi tiết lớp học', severity: 'error' });
    } finally {
      setLoadingDetail(false);
      setLoadingStudents(false);
    }
  };

  const handleSaveAttendanceDetail = async () => {
    if (!attendanceIdDetail) return;
    setLoadingDetail(true);
    try {
      const studentsArr = studentsDetail.map(s => ({
        studentId: s.id,
        status: attendanceDetail[s.id],
        note: attendanceNoteDetail[s.id] || ''
      }));
      await updateAttendanceAPI(attendanceIdDetail, { students: studentsArr });
      setNotification({ open: true, message: 'Điểm danh đã được lưu thành công!', severity: 'success' });
    } catch (err) {
      setNotification({ open: true, message: 'Lưu điểm danh thất bại', severity: 'error' });
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleOpenStudentHistory = async (student) => {
    setStudentHistoryModal({ open: true, student, history: [] });
    try {
      const res = await getAttendanceListAPI({ studentId: student.id, limit: 20, page: 1, sortBy: 'date' });
      setStudentHistoryModal({ open: true, student, history: res?.data?.attendances || [] });
    } catch (err) {
      setStudentHistoryModal({ open: true, student, history: [] });
    }
  };

  const handleCloseStudentHistory = () => setStudentHistoryModal({ open: false, student: null, history: [] });

  return (
    <DashboardLayout role="teacher">
      <Box sx={commonStyles.pageContainer}>
          <Typography variant="h4" gutterBottom>
        Lớp học của tôi
      </Typography>

        {/* Stat Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Tổng số lớp"
              value={myClasses.length}
              icon={<SchoolIcon sx={{ fontSize: 40 }} />}
              color="primary"
            />
                </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Đang dạy"
              value={myClasses.filter(c => c.status === 'active').length}
              icon={<HourglassEmptyIcon sx={{ fontSize: 40 }} />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Sắp diễn ra"
              value={myClasses.filter(c => c.status === 'upcoming').length}
              icon={<WatchLaterIcon sx={{ fontSize: 40 }} />}
              color="warning"
            />
                </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Lớp đã kết thúc"
              value={myClasses.filter(c => c.status === 'closed').length}
              icon={<DoneAllIcon sx={{ fontSize: 40 }} />}
              color="primary"
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
          <Tab label="Đang dạy" />
          <Tab label="Sắp diễn ra" />
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
                    <Typography variant="body2">{formatSchedule(classItem.schedule)}</Typography>
                  </Box>
                  {classItem.status !== 'completed' && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">Tiến độ</Typography>
                      <LinearProgress variant="determinate" value={classItem.progress} sx={{ mt: 0.5 }} />
                    </Box>
                  )}
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => handleOpenDetail(classItem)}>Xem chi tiết</Button>
                  {classItem.status === 'active' && (
                      <Tooltip title="Điểm danh buổi học hôm nay">
                        <Button
                          size="small"
                          startIcon={<AssignmentIcon />}
                          onClick={() => handleOpenAttendance(classItem)}
                        >
                          Điểm danh
                        </Button>
                      </Tooltip>
                  )}
                  {classItem.status === 'closed' && (
                      <Tooltip title="Xem lịch sử điểm danh">
                        <Button
                          size="small"
                          startIcon={<HistoryIcon />}
                          onClick={() => handleOpenHistory(classItem)}
                        >
                          Lịch sử điểm danh
                        </Button>
                      </Tooltip>
                  )}
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
                  {students.map((student, index) => (
                    <TableRow key={student.id} sx={{ '&:hover': { bgcolor: '#fafafa' } }}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {student.name}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <input
                          type="radio"
                          id={`present-${student.id}`}
                          name={`attendance-${student.id}`}
                          checked={attendance[student.id] === ATTENDANCE_STATUS.PRESENT}
                          onChange={() => handleStatusChange(student.id, ATTENDANCE_STATUS.PRESENT)}
                          style={{
                            transform: 'scale(1.3)',
                            accentColor: '#2e7d32'
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <input
                          type="radio"
                          id={`late-${student.id}`}
                          name={`attendance-${student.id}`}
                          checked={attendance[student.id] === ATTENDANCE_STATUS.LATE}
                          onChange={() => handleStatusChange(student.id, ATTENDANCE_STATUS.LATE)}
                          style={{
                            transform: 'scale(1.3)',
                            accentColor: '#ed6c02'
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <input
                          type="radio"
                          id={`absent-${student.id}`}
                          name={`attendance-${student.id}`}
                          checked={attendance[student.id] === ATTENDANCE_STATUS.ABSENT}
                          onChange={() => handleStatusChange(student.id, ATTENDANCE_STATUS.ABSENT)}
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
                          value={attendanceNote[student.id] || ''}
                          onChange={(e) => setAttendanceNote(prev => ({ ...prev, [student.id]: e.target.value }))}
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
                  {attendanceHistory.map((record, index) => (
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
            {attendanceHistory.length === 0 && (
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

        {/* Detail Dialog */}
        <Dialog
          open={openDetail}
          onClose={() => setOpenDetail(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{
            borderBottom: '1px solid #e0e0e0',
            pb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <SchoolIcon color="primary" />
            <Box>
              <Typography variant="h6">Chi tiết lớp học</Typography>
              <Typography variant="body2" color="text.secondary">
                Thông tin chi tiết về lớp học
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            {loadingDetail ? (
              <Box sx={{ py: 4 }}>
                <LinearProgress />
                <Typography sx={{ textAlign: 'center', mt: 2 }}>Đang tải thông tin...</Typography>
              </Box>
            ) : selectedClassDetail ? (
              <>
                {/* Tabs */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                  <Tabs value={detailTabValue} onChange={handleDetailTabChange}>
                    <Tab label="Thông tin lớp" />
                    <Tab label={`Danh sách học sinh (${studentsDetail.length})`} />
                  </Tabs>
                </Box>

                {/* Tab 0: Thông tin lớp */}
                {detailTabValue === 0 && (
                  <Grid container spacing={3}>
                    {/* Thông tin cơ bản */}
                    <Grid item xs={12} md={6}>
                      <Paper sx={{ p: 3, height: '100%', bgcolor: '#f8f9fa' }}>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <SchoolIcon color="primary" />
                          Thông tin cơ bản
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Tên lớp
                            </Typography>
                            <Typography variant="body1">
                              {selectedClassDetail.name}
                            </Typography>
                          </Box>

                          <Box>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Khối lớp
                            </Typography>
                            <Typography variant="body1">
                              Khối {selectedClassDetail.grade} - Phần {selectedClassDetail.section}
                            </Typography>
                          </Box>

                          <Box>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Năm học
                            </Typography>
                            <Typography variant="body1">
                              {selectedClassDetail.year}
                            </Typography>
                          </Box>

                          <Box>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Trạng thái
                            </Typography>
                            <Chip
                              label={statusMap[selectedClassDetail.status]?.label || selectedClassDetail.status}
                              color={statusMap[selectedClassDetail.status]?.color || 'default'}
                              size="small"
                            />
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>

                    {/* Thông tin lịch học */}
                    <Grid item xs={12} md={6}>
                      <Paper sx={{ p: 3, height: '100%', bgcolor: '#f8f9fa' }}>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <EventIcon color="primary" />
                          Lịch học
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Ngày học trong tuần
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              {(selectedClassDetail.schedule?.dayOfWeeks || []).map((day, index) => (
                                <Chip
                                  key={index}
                                  label={['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][day]}
                                  color="primary"
                                  variant="outlined"
                                  size="small"
                                />
                              ))}
                            </Box>
                          </Box>

                          <Box>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Giờ học
                            </Typography>
                            <Typography variant="body1">
                              {selectedClassDetail.schedule?.timeSlots?.startTime} - {selectedClassDetail.schedule?.timeSlots?.endTime}
                            </Typography>
                          </Box>

                          <Box>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Thời gian khóa học
                            </Typography>
                            <Typography variant="body2">
                              Từ: {new Date(selectedClassDetail.schedule?.startDate).toLocaleDateString('vi-VN')}
                            </Typography>
                            <Typography variant="body2">
                              Đến: {new Date(selectedClassDetail.schedule?.endDate).toLocaleDateString('vi-VN')}
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>

                    {/* Thông tin phòng học và học phí */}
                    <Grid item xs={12} md={6}>
                      <Paper sx={{ p: 3, height: '100%', bgcolor: '#f8f9fa' }}>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <PeopleIcon color="primary" />
                          Thông tin lớp học
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Phòng học
                            </Typography>
                            <Typography variant="body1">
                              {selectedClassDetail.room}
                            </Typography>
                          </Box>

                          <Box>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Sĩ số tối đa
                            </Typography>
                            <Typography variant="body1">
                              {selectedClassDetail.maxStudents} học sinh
                            </Typography>
                          </Box>

                          <Box>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Học phí mỗi buổi
                            </Typography>
                            <Typography variant="h6" color="success.main" fontWeight="bold">
                              {selectedClassDetail.feePerLesson?.toLocaleString('vi-VN')} VNĐ
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>

                    {/* Mô tả */}
                    <Grid item xs={12} md={6}>
                      <Paper sx={{ p: 3, height: '100%', bgcolor: '#f8f9fa' }}>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <AssignmentIcon color="primary" />
                          Mô tả
                        </Typography>
                        <Box>
                          <Typography variant="body1" sx={{
                            bgcolor: 'white',
                            p: 2,
                            borderRadius: 1,
                            minHeight: 100,
                            border: '1px solid #e0e0e0'
                          }}>
                            {selectedClassDetail.description || 'Chưa có mô tả cho lớp học này.'}
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  </Grid>
                )}

                {/* Tab 1: Danh sách học sinh */}
                {detailTabValue === 1 && (
                  <Box>
                    {loadingStudents ? (
                      <Box sx={{ py: 4 }}>
                        <LinearProgress />
                        <Typography sx={{ textAlign: 'center', mt: 2 }}>Đang tải danh sách học sinh...</Typography>
                      </Box>
                    ) : studentsDetail.length > 0 ? (
                      <TableContainer component={Paper}>
                        <Table>
                          <TableHead>
                            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                              <TableCell sx={{ fontWeight: 'bold' }}>STT</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Họ và Tên</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Số điện thoại</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Thao tác</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {studentsDetail.map((student, index) => (
                              <TableRow key={student.id} hover>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                                      {student.name?.charAt(0)?.toUpperCase()}
                                    </Avatar>
                                    <Typography variant="body2" fontWeight="medium">
                                      {student.name}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>{student.email}</TableCell>
                                <TableCell>{student.phone || '---'}</TableCell>
                                <TableCell>
                                  <Tooltip title="Xem lịch sử điểm danh">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleOpenStudentHistory(student)}
                                      color="primary"
                                    >
                                      <HistoryIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <PeopleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                          Chưa có học sinh nào
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Lớp học này chưa có học sinh nào được đăng ký.
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}
              </>
            ) : (
              <Typography sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                Không thể tải thông tin lớp học
              </Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: '1px solid #e0e0e0' }}>
            <Button
              onClick={() => setOpenDetail(false)}
              variant="outlined"
              size="large"
            >
              Đóng
            </Button>
          </DialogActions>
        </Dialog>

        {/* Student History Dialog */}
        <Dialog
          open={studentHistoryModal.open}
          onClose={handleCloseStudentHistory}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Lịch sử điểm danh - {studentHistoryModal.student?.name}</DialogTitle>
          <DialogContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Ngày</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell>Ghi chú</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {studentHistoryModal.history.map((record, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{new Date(record.date).toLocaleDateString('vi-VN')}</TableCell>
                      <TableCell>{record.students?.find(s => s.studentId === studentHistoryModal.student.id)?.status || ''}</TableCell>
                      <TableCell>{record.students?.find(s => s.studentId === studentHistoryModal.student.id)?.note || ''}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {studentHistoryModal.history.length === 0 && <Typography align="center" sx={{ mt: 2 }}>Chưa có lịch sử điểm danh</Typography>}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseStudentHistory}>Đóng</Button>
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
