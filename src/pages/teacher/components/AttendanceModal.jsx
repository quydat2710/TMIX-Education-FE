import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
  Box,
  LinearProgress,
  TextField,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import {
  getTodayAttendanceAPI,
  updateAttendanceAPI
} from '../../../services/api';

const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
};

const AttendanceModal = ({
  open,
  onClose,
  classData,
}) => {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [attendanceNote, setAttendanceNote] = useState({});
  const [isChanged, setIsChanged] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [attendanceId, setAttendanceId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && classData) {
      handleOpenAttendance();
    }
  }, [open, classData]);

  const handleOpenAttendance = async () => {
    if (!classData?.id) return;
    setLoading(true);
    try {
      const res = await getTodayAttendanceAPI(classData.id);
      const attData = res?.data;

      setAttendanceId(attData?.attendanceId);

      const studentsList = (attData?.students || []).map(s => ({
        id: typeof s.studentId === 'object' ? s.studentId.id : s.studentId,
        name: typeof s.studentId === 'object' ? s.studentId.name : '',
        status: s.status,
        note: s.note || ''
      }));
      // Sắp xếp theo tên riêng (từ cuối cùng)
      studentsList.sort((a, b) => {
        const lastA = a.name.trim().split(' ').pop();
        const lastB = b.name.trim().split(' ').pop();
        return lastA.localeCompare(lastB, 'vi');
      });
      setStudents(studentsList);

      // Khởi tạo trạng thái điểm danh
      const att = {};
      const notes = {};
      studentsList.forEach(s => {
        att[s.id] = s.status || ATTENDANCE_STATUS.ABSENT;
        notes[s.id] = s.note || '';
      });
      setAttendance(att);
      setAttendanceNote(notes);
      setIsChanged(false);
    } catch (err) {
      setNotification({ open: true, message: 'Không thể tải dữ liệu điểm danh', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
    setIsChanged(true);
  };

  const handleNoteChange = (studentId, note) => {
    setAttendanceNote(prev => ({
      ...prev,
      [studentId]: note
    }));
    setIsChanged(true);
  };

  const handleSaveAttendance = async () => {
    if (!isChanged) return;
    if (!attendanceId) {
      setNotification({ open: true, message: 'Không tìm thấy attendanceId', severity: 'error' });
      return;
    }
    setLoading(true);
    try {
      const studentsBody = students.map(student => ({
        studentId: student.id,
        status: attendance[student.id] || ATTENDANCE_STATUS.ABSENT,
        note: attendanceNote[student.id] || ''
      }));
      await updateAttendanceAPI(attendanceId, { students: studentsBody });
      setNotification({ open: true, message: 'Lưu điểm danh thành công', severity: 'success' });
      setIsChanged(false);
      onClose();
    } catch (err) {
      setNotification({ open: true, message: 'Không thể lưu điểm danh', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceSummary = () => {
    const present = Object.values(attendance).filter(status => status === ATTENDANCE_STATUS.PRESENT).length;
    const absent = Object.values(attendance).filter(status => status === ATTENDANCE_STATUS.ABSENT).length;
    const late = Object.values(attendance).filter(status => status === ATTENDANCE_STATUS.LATE).length;
    const total = students.length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;

    return { present, absent, late, total, rate };
  };

  const summary = getAttendanceSummary();

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
          <AssignmentIcon color="primary" />
          <Box>
            <Typography variant="h6">Điểm danh lớp học</Typography>
            <Typography variant="body2" color="text.secondary">
              {classData?.name}
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 0, px: 1 }}>
          {loading ? (
            <Box sx={{ py: 4 }}>
              <LinearProgress />
              <Typography sx={{ textAlign: 'center', mt: 2 }}>Đang tải dữ liệu...</Typography>
            </Box>
          ) : (
            <>
              {/* Summary */}
              <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="h6" gutterBottom>Tổng quan điểm danh</Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Typography variant="body2">
                    <strong>Có mặt:</strong> {summary.present} ({summary.rate}%)
                  </Typography>
                  <Typography variant="body2">
                    <strong>Vắng:</strong> {summary.absent}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Đi muộn:</strong> {summary.late}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Tổng:</strong> {summary.total}
                  </Typography>
                </Box>
              </Box>

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
                            value={attendanceNote[student.id] || ''}
                            onChange={(e) => handleNoteChange(student.id, e.target.value)}
                            fullWidth
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, borderTop: '1px solid #e0e0e0' }}>
          <Button
            onClick={onClose}
            variant="outlined"
            size="large"
          >
            Hủy
          </Button>
          <Button
            onClick={handleSaveAttendance}
            variant="contained"
            startIcon={<SaveIcon />}
            size="large"
            disabled={!isChanged || loading}
          >
            Lưu điểm danh
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
    </>
  );
};

export default AttendanceModal;
