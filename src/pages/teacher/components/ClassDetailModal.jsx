import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tabs,
  Tab,
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Avatar,
  IconButton,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import {
  School as SchoolIcon,
  Event as EventIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import {
  getClassByIdAPI,
  getStudentsInClassAPI,
  getTodayAttendanceAPI,
  getAttendanceListAPI,
  updateAttendanceAPI
} from '../../../services/api';
import AttendanceModal from './AttendanceModal';
import StudentHistoryModal from './StudentHistoryModal';

const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
};

const ClassDetailModal = ({
  open,
  onClose,
  classData
}) => {
  const [selectedClassDetail, setSelectedClassDetail] = useState(null);
  const [studentsDetail, setStudentsDetail] = useState([]);
  const [attendanceDetail, setAttendanceDetail] = useState({});
  const [attendanceNoteDetail, setAttendanceNoteDetail] = useState({});
  const [attendanceIdDetail, setAttendanceIdDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [detailTabValue, setDetailTabValue] = useState(0);
  const [studentHistoryModal, setStudentHistoryModal] = useState({ open: false, student: null, history: [] });
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);

  useEffect(() => {
    if (open && classData) {
      handleOpenDetail();
    }
  }, [open, classData]);

  const handleOpenDetail = async () => {
    if (!classData?.id) return;

    setLoadingDetail(true);
    try {
      // Lấy thông tin chi tiết lớp học
      const classRes = await getClassByIdAPI(classData.id);
      setSelectedClassDetail(classRes?.data);

      // Lấy danh sách học sinh
      setLoadingStudents(true);
      const allStudents = await fetchAllStudentsInClass(classData.id);
      setStudentsDetail(allStudents);

      // Lấy điểm danh hôm nay
      const attendanceRes = await getTodayAttendanceAPI(classData.id);
      const attData = attendanceRes?.data;
      setAttendanceIdDetail(attData?._id || attData?.id || null);

      const studentIds = allStudents.map(s => String(s.id));
      const { cleanAttendance, cleanNotes } = validateAndCleanAttendanceData(attData, studentIds);
      setAttendanceDetail(cleanAttendance);
      setAttendanceNoteDetail(cleanNotes);
    } catch (err) {
      console.error('Error loading class details:', err);
    } finally {
      setLoadingDetail(false);
      setLoadingStudents(false);
    }
  };

  const fetchAllStudentsInClass = async (classId) => {
    const allStudents = [];
    let page = 1;
    const limit = 50;

    console.log('Fetching students for class:', classId);

    while (true) {
      try {
        const res = await getStudentsInClassAPI(classId, { limit, page });
        console.log('API response for page', page, ':', res);
        const students = res?.data?.students || [];
        console.log('Students found:', students.length);

        if (students.length === 0) break;

        allStudents.push(...students);

        if (students.length < limit) break;

        page++;
      } catch (err) {
        console.error('Error fetching students:', err);
        break;
      }
    }

    console.log('Total students fetched:', allStudents.length);
    return allStudents;
  };

  const validateAndCleanAttendanceData = (attendanceData, studentIds) => {
    const cleanAttendance = {};
    const cleanNotes = {};

    if (attendanceData?.students && Array.isArray(attendanceData.students)) {
      attendanceData.students.forEach(student => {
        const studentId = String(student.studentId || student.id);
        if (studentIds.includes(studentId)) {
          cleanAttendance[studentId] = student.status || ATTENDANCE_STATUS.ABSENT;
          cleanNotes[studentId] = student.note || '';
        }
      });
    }

    // Đảm bảo tất cả học sinh đều có trạng thái mặc định
    studentIds.forEach(studentId => {
      if (!cleanAttendance[studentId]) {
        cleanAttendance[studentId] = ATTENDANCE_STATUS.ABSENT;
        cleanNotes[studentId] = '';
      }
    });

    return { cleanAttendance, cleanNotes };
  };

  const handleDetailTabChange = (event, newValue) => {
    setDetailTabValue(newValue);
  };

  const handleOpenStudentHistory = async (student) => {
    try {
      const res = await getAttendanceListAPI({
        classId: selectedClassDetail.id,
        limit: 50,
        page: 1,
        sortBy: 'date'
      });
      const history = res?.data?.attendances || [];
      setStudentHistoryModal({ open: true, student, history });
    } catch (err) {
      console.error('Error loading student history:', err);
    }
  };

  const handleCloseStudentHistory = () => {
    setStudentHistoryModal({ open: false, student: null, history: [] });
  };

  const handleOpenAttendance = () => {
    setAttendanceModalOpen(true);
  };

  const handleCloseAttendance = () => {
    setAttendanceModalOpen(false);
  };

  const formatSchedule = (schedule) => {
    if (!schedule) return '';
    const days = (schedule.dayOfWeeks || [])
      .map(d => ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d])
      .join(', ');
    const time = schedule.timeSlots
      ? `${schedule.timeSlots.startTime} - ${schedule.timeSlots.endTime}`
      : '';
    return `${days}${time ? ' | ' + time : ''}`;
  };

  const statusMap = {
    active: { label: 'Đang dạy', color: 'success' },
    upcoming: { label: 'Sắp diễn ra', color: 'warning' },
    closed: { label: 'Đã kết thúc', color: 'default' },
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
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
              {selectedClassDetail?.name}
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 0 }}>
          {loadingDetail ? (
            <Box sx={{ py: 4 }}>
              <LinearProgress />
              <Typography sx={{ textAlign: 'center', mt: 2 }}>Đang tải thông tin lớp học...</Typography>
            </Box>
          ) : selectedClassDetail ? (
            <>
              <Tabs value={detailTabValue} onChange={handleDetailTabChange} sx={{ mb: 3 }} variant="fullWidth">
                <Tab label="Thông tin lớp" />
                <Tab label="Danh sách học sinh" />
              </Tabs>

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
                  {console.log('Rendering students tab, studentsDetail:', studentsDetail)}
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
            onClick={onClose}
            variant="outlined"
            size="large"
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Attendance Modal */}
      <AttendanceModal
        open={attendanceModalOpen}
        onClose={handleCloseAttendance}
        classData={selectedClassDetail}
      />

      {/* Student History Modal */}
      <StudentHistoryModal
        open={studentHistoryModal.open}
        onClose={handleCloseStudentHistory}
        student={studentHistoryModal.student}
        history={studentHistoryModal.history}
      />
    </>
  );
};

export default ClassDetailModal;
