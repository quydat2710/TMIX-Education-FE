import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import AddStudentToClassDialog from './AddStudentToClassDialog';
import { removeStudentFromClassAPI } from '../../services/api';
import NotificationSnackbar from '../../components/common/NotificationSnackbar';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const ClassStudentManagement = ({ classData, onUpdate }) => {
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const students = classData?.students || [];

  const handleOpenAddDialog = () => {
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
  };

  const handleOpenConfirmRemove = (student) => {
    setStudentToRemove(student);
  };

  const handleCloseConfirmRemove = () => {
    setStudentToRemove(null);
  };

  const handleRemoveStudent = async () => {
    if (!studentToRemove) return;
    setLoading(true);
    try {
      // Assuming the student object has a `userId` field which contains the actual student ID
      await removeStudentFromClassAPI(classData.id, studentToRemove.id);
      setNotification({ open: true, message: 'Xóa học sinh khỏi lớp thành công!', severity: 'success' });
      if (onUpdate) onUpdate();
    } catch (error) {
      setNotification({ open: true, message: error.response?.data?.message || 'Lỗi khi xóa học sinh.', severity: 'error' });
    } finally {
      setLoading(false);
      handleCloseConfirmRemove();
    }
  };

  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') return;
    setNotification({ ...notification, open: false });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Danh sách học sinh ({students.length} / {classData.maxStudents})
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
          disabled={students.length >= classData.maxStudents}
        >
          Thêm học sinh
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Họ và tên</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Số điện thoại</TableCell>
              <TableCell align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.length > 0 ? (
              students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{student.userId?.name || 'N/A'}</TableCell>
                  <TableCell>{student.userId?.email || 'N/A'}</TableCell>
                  <TableCell>{student.userId?.phone || 'N/A'}</TableCell>
                  <TableCell align="center">
                    <IconButton color="error" onClick={() => handleOpenConfirmRemove(student)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Chưa có học sinh nào trong lớp.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {openAddDialog && (
        <AddStudentToClassDialog
          open={openAddDialog}
          onClose={handleCloseAddDialog}
          classData={classData}
          onUpdate={onUpdate}
        />
      )}

      {studentToRemove && (
        <ConfirmDialog
          open={Boolean(studentToRemove)}
          onClose={handleCloseConfirmRemove}
          onConfirm={handleRemoveStudent}
          title="Xác nhận xóa học sinh"
          content={`Bạn có chắc chắn muốn xóa học sinh "${studentToRemove.userId?.name}" khỏi lớp này không?`}
          loading={loading}
        />
      )}

      <NotificationSnackbar
        open={notification.open}
        onClose={handleCloseNotification}
        message={notification.message}
        severity={notification.severity}
      />
    </Box>
  );
};

export default ClassStudentManagement;
