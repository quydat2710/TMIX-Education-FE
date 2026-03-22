import React, { useState } from 'react';
import { Box, Typography, Button, Pagination, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { commonStyles } from '../../utils/styles';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import NotificationSnackbar from '../../components/common/NotificationSnackbar';
import { useStudentManagement } from '../../hooks/features/useStudentManagement';
import { useStudentForm } from '../../hooks/features/useStudentForm';
import { StudentForm, StudentTable, StudentFilters, StudentViewDialog } from '../../components/features/student';
import { Student } from '../../types';
import { getStudentByIdAPI } from '../../services/students';
import { resetPasswordAPI } from '../../services/users';

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

const StudentManagement: React.FC = () => {
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [openViewDialog, setOpenViewDialog] = useState<boolean>(false);
  const [selectedStudentForView, setSelectedStudentForView] = useState<Student | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: '', severity: 'success' });
  const [resetPasswordDialog, setResetPasswordDialog] = useState(false);
  const [resetPasswordStudent, setResetPasswordStudent] = useState<Student | null>(null);
  const [newPassword, setNewPassword] = useState('');

  // Custom hooks
  const {
    students,
    loading,
    loadingTable,
    page,
    totalPages,
    searchQuery,
    setSearchQuery,
    fetchStudents,
    deleteStudent,
    handlePageChange,
  } = useStudentManagement();

  const {
    // form,
    // classEdits,
    // formErrors,
    // formLoading,
    // formError,
    // handleChange,
    // handleClassEditChange,
    setFormData,
    resetForm,
    // handleSubmit,
  } = useStudentForm();

  // Dialog handlers
  const handleOpenDialog = async (student: Student | null = null): Promise<void> => {
    setOpenDialog(true);
    if (student?.id) {
      try {
        const res = await getStudentByIdAPI(student.id);
        const payload: any = (res as any)?.data?.data ?? (res as any)?.data ?? res;
        setSelectedStudent(payload);
        setFormData(payload || undefined);
      } catch (e) {
        // Fallback to existing row data if API fails
        setSelectedStudent(student);
        setFormData(student || undefined);
      }
    } else {
      setSelectedStudent(null);
      setFormData(undefined);
    }
  };

  const handleCloseDialog = (): void => {
    setOpenDialog(false);
    setTimeout(() => {
      setSelectedStudent(null);
      resetForm();
    }, 100);
  };

  const handleOpenDeleteDialog = (student: Student): void => {
    setStudentToDelete(student);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = (): void => {
    setStudentToDelete(null);
    setOpenDeleteDialog(false);
  };

  const handleDeleteStudent = async (): Promise<void> => {
    if (!studentToDelete) return;

    const result = await deleteStudent(studentToDelete.id);

    if (result.success) {
      setSnackbar({ open: true, message: result.message, severity: 'success' });
      handleCloseDeleteDialog();
    } else {
      setSnackbar({ open: true, message: result.message, severity: 'error' });
    }
  };

  const handleOpenViewDialog = (studentData: Student): void => {
    // Chỉ cần truyền ID và thông tin cơ bản để hiển thị loading
    setSelectedStudentForView({
      id: studentData.id,
      name: studentData.name,
      email: studentData.email,
      phone: studentData.phone,
      gender: studentData.gender,
      dayOfBirth: studentData.dayOfBirth,
      address: studentData.address,
      userId: studentData.userId,
      parentId: studentData.parentId,
      classes: studentData.classes,
      role: studentData.role as any,
    } as unknown as Student);
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = (): void => {
    setSelectedStudentForView(null);
    setOpenViewDialog(false);
  };

  const handleCloseNotification = (): void => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpenResetPassword = (student: Student) => {
    setResetPasswordStudent(student);
    setNewPassword('');
    setResetPasswordDialog(true);
  };

  const handleResetPassword = async () => {
    if (!resetPasswordStudent || !newPassword) return;
    if (newPassword.length < 6) {
      setSnackbar({ open: true, message: 'Mật khẩu phải có ít nhất 6 ký tự', severity: 'error' });
      return;
    }
    try {
      await resetPasswordAPI(resetPasswordStudent.id, newPassword);
      setSnackbar({ open: true, message: `Đặt lại mật khẩu cho ${resetPasswordStudent.name || 'học sinh'} thành công!`, severity: 'success' });
      setResetPasswordDialog(false);
    } catch {
      setSnackbar({ open: true, message: 'Đặt lại mật khẩu thất bại', severity: 'error' });
    }
  };

  return (
    <DashboardLayout role="admin">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <Box sx={commonStyles.pageHeader}>
            <Typography sx={commonStyles.pageTitle}>
              Học viên
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={commonStyles.primaryButton}
            >
              Thêm học sinh
            </Button>
          </Box>

          <StudentFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          <StudentTable
            students={students}
            loading={loadingTable}
            onEdit={(student: Student) => handleOpenDialog(student)}
            onDelete={(studentId: string) => {
              const student = students.find(s => s.id === studentId);
              if (student) handleOpenDeleteDialog(student);
            }}
            onViewDetails={handleOpenViewDialog}
            onResetPassword={handleOpenResetPassword}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_event, value) => handlePageChange(_event as React.SyntheticEvent, value)}
                size="large"
              />
            </Box>
          )}
        </Box>
      </Box>

      <StudentForm
        open={openDialog}
        onClose={handleCloseDialog}
        student={selectedStudent}
        onSubmit={(result) => {
          // Refresh student list
          fetchStudents();

          // Show notification
          setSnackbar({
            open: true,
            message: result.message || (result.success ? 'Thành công!' : 'Có lỗi xảy ra'),
            severity: result.success ? 'success' : 'error'
          });
        }}
      />

      <ConfirmDialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDeleteStudent}
        title="Xác nhận xóa học sinh"
        message={studentToDelete ? `Bạn có chắc chắn muốn xóa học sinh "${studentToDelete.userId?.name}"? Hành động này không thể hoàn tác.` : ''}
        loading={loading}
      />

      <StudentViewDialog
        open={openViewDialog}
        onClose={handleCloseViewDialog}
        selectedStudent={selectedStudentForView as any}
      />

      <NotificationSnackbar
        open={snackbar.open}
        onClose={handleCloseNotification}
        message={snackbar.message}
        severity={snackbar.severity}
      />

      <Dialog open={resetPasswordDialog} onClose={() => setResetPasswordDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Đặt lại mật khẩu</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Đặt mật khẩu mới cho: <strong>{resetPasswordStudent?.name || resetPasswordStudent?.userId?.name}</strong>
          </Typography>
          <TextField
            autoFocus
            fullWidth
            label="Mật khẩu mới"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            helperText="Tối thiểu 6 ký tự"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetPasswordDialog(false)}>Hủy</Button>
          <Button onClick={handleResetPassword} variant="contained" disabled={!newPassword || newPassword.length < 6}>
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
};

export default StudentManagement;
