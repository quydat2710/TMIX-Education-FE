import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Add as AddIcon,
} from '@mui/icons-material';
import { COLORS } from "../../utils/colors";
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { commonStyles } from '../../utils/styles';
import StatCard from '../../components/common/StatCard';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import NotificationSnackbar from '../../components/common/NotificationSnackbar';

// Custom hooks
import { Teacher } from '../../types';
import { useTeacherManagement } from '../../hooks/features/useTeacherManagement';
import { useTeacherForm } from '../../hooks/features/useTeacherForm';
import { resetPasswordAPI } from '../../services/users';

// Components
import TeacherForm from '../../components/features/teacher/TeacherForm';
import TeacherTable from '../../components/features/teacher/TeacherTable';
import TeacherFilters from '../../components/features/teacher/TeacherFilters';
import TeacherViewDialog from '../../components/features/teacher/TeacherViewDialog';

// Utils


interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

interface Summary {
  totalTeachers: number;
  activeTeachers: number;
  inactiveTeachers: number;
  totalSalary: number;
}

const TeacherManagement: React.FC = () => {
  // Teacher management hook
  const {
    teachers,
    selectedTeacher: teacherDetail,
    loading,
    loadingDetail,
    page,
    totalPages,
    totalRecords,
    searchQuery,
    setSearchQuery,
    emailFilter,
    setEmailFilter,
    isActiveFilter,
    setIsActiveFilter,
    fetchTeachers,
    getTeacherById,
    deleteTeacher,
    handlePageChange,
  } = useTeacherManagement();

  // Teacher form hook
  const {
    loading: formLoading,
    setFormData,
    resetForm,
  } = useTeacherForm();

  // Local state
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [originalTeacherData, setOriginalTeacherData] = useState<any>(null);
  const [openViewDialog, setOpenViewDialog] = useState<boolean>(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: '', severity: 'success' });
  const [resetPasswordDialog, setResetPasswordDialog] = useState(false);
  const [resetPasswordTeacher, setResetPasswordTeacher] = useState<Teacher | null>(null);
  const [newPassword, setNewPassword] = useState('');

  // Dialog handlers
  const handleOpenDialog = async (teacher: Teacher | null = null): Promise<void> => {
    if (teacher) {
      // Gọi API để lấy thông tin chi tiết khi chỉnh sửa
      const detailData = await getTeacherById(teacher.id);
      setSelectedTeacher(teacher);

      // Sử dụng dữ liệu từ API response để set form
      if (detailData) {
        // Lưu originalData để so sánh sau này
        setOriginalTeacherData(detailData);

        // Map API response to form structure (sử dụng type assertion vì form cần structure cũ)
        const formData = {
          id: detailData.id,
          userId: {
            id: detailData.id,
            name: detailData.name,
            email: detailData.email,
            phone: detailData.phone,
            gender: detailData.gender,
            dayOfBirth: detailData.dayOfBirth,
            address: detailData.address,
            role: 'teacher' as const,
            avatar: detailData.avatar || undefined,
          },
          isActive: detailData.isActive,
          description: detailData.description,
          qualifications: detailData.qualifications,
          specializations: detailData.specializations,
          salaryPerLesson: detailData.salaryPerLesson,
          workExperience: detailData.workExperience,
          introduction: detailData.introduction,
          typical: detailData.typical,
        } as Teacher;
        setFormData(formData);
      } else {
        setFormData(teacher);
      }
    } else {
      // Tạo mới teacher
      setSelectedTeacher(null);
      setOriginalTeacherData(null);
      resetForm();
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = (): void => {
    setOpenDialog(false);
    setTimeout(() => {
      setSelectedTeacher(null);
      setOriginalTeacherData(null);
      resetForm();
    }, 100);
  };

  const handleOpenViewDialog = async (teacherData: Teacher): Promise<void> => {
    await getTeacherById(teacherData.id);
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = (): void => {
    setOpenViewDialog(false);
  };

  const handleCloseDeleteDialog = (): void => {
    setTeacherToDelete(null);
    setOpenDeleteDialog(false);
  };



  // Action handlers
  const handleFormSubmit = async (teacherData: Partial<Teacher>): Promise<void> => {
    try {
      if (selectedTeacher && originalTeacherData) {
        // Chỉnh sửa teacher - chỉ gửi field thay đổi
        const changedFields: any = {};

        // So sánh các field và chỉ lấy những field thay đổi
        if (teacherData.name !== originalTeacherData.name) {
          changedFields.name = teacherData.name;
        }
        if (teacherData.email !== originalTeacherData.email) {
          changedFields.email = teacherData.email;
        }
        if (teacherData.phone !== originalTeacherData.phone) {
          changedFields.phone = teacherData.phone;
        }
        if (teacherData.address !== originalTeacherData.address) {
          changedFields.address = teacherData.address;
        }
        if (teacherData.gender !== originalTeacherData.gender) {
          changedFields.gender = teacherData.gender;
        }
        // So sánh dayOfBirth (chuyển sang ISO date để so sánh)
        const newDate = teacherData.dayOfBirth ? new Date(teacherData.dayOfBirth as any).toISOString().split('T')[0] : null;
        const oldDate = originalTeacherData.dayOfBirth ? new Date(originalTeacherData.dayOfBirth).toISOString().split('T')[0] : null;
        if (newDate !== oldDate) {
          changedFields.dayOfBirth = teacherData.dayOfBirth;
        }
        if (teacherData.description !== originalTeacherData.description) {
          changedFields.description = teacherData.description;
        }
        if (JSON.stringify(teacherData.qualifications) !== JSON.stringify(originalTeacherData.qualifications)) {
          changedFields.qualifications = teacherData.qualifications;
        }
        if (JSON.stringify(teacherData.specializations) !== JSON.stringify(originalTeacherData.specializations)) {
          changedFields.specializations = teacherData.specializations;
        }
        if (teacherData.salaryPerLesson !== originalTeacherData.salaryPerLesson) {
          changedFields.salaryPerLesson = teacherData.salaryPerLesson;
        }
        if (teacherData.introduction !== originalTeacherData.introduction) {
          changedFields.introduction = teacherData.introduction;
        }
        if (teacherData.workExperience !== originalTeacherData.workExperience) {
          changedFields.workExperience = teacherData.workExperience;
        }
        if (teacherData.isActive !== originalTeacherData.isActive) {
          changedFields.isActive = teacherData.isActive;
        }
        if (teacherData.typical !== originalTeacherData.typical) {
          changedFields.typical = teacherData.typical;
        }

        console.log('🔄 Chỉ gửi các field thay đổi:', changedFields);

        // Gọi API update với chỉ các field thay đổi
        const { updateTeacherAPI } = await import('../../services/teachers');
        await updateTeacherAPI(selectedTeacher.id, changedFields);

        setSnackbar({ open: true, message: 'Cập nhật giáo viên thành công!', severity: 'success' });
      } else {
        // Tạo mới teacher - gửi tất cả data
        const { createTeacherAPI } = await import('../../services/teachers');
        const createData = {
          name: teacherData.name || '',
          email: teacherData.email || '',
          password: (teacherData as any).password || '',
          phone: teacherData.phone || '',
          address: teacherData.address || '',
          gender: teacherData.gender || '',
          dayOfBirth: teacherData.dayOfBirth || '',
          description: teacherData.description || '',
          qualifications: teacherData.qualifications || [],
          specializations: teacherData.specializations || [],
          salaryPerLesson: teacherData.salaryPerLesson || 0,
          introduction: teacherData.introduction || '',
          workExperience: teacherData.workExperience || '',
          isActive: teacherData.isActive ?? true,
          typical: teacherData.typical ?? false,
        };
        await createTeacherAPI(createData as any);

        setSnackbar({ open: true, message: 'Tạo giáo viên mới thành công!', severity: 'success' });
      }

      handleCloseDialog();
      if (fetchTeachers) {
        fetchTeachers();
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Có lỗi xảy ra';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const handleDeleteTeacher = async (): Promise<void> => {
    if (!teacherToDelete || !deleteTeacher) return;

    const result = await deleteTeacher(teacherToDelete.id);

    if (result.success) {
      setSnackbar({ open: true, message: result.message, severity: 'success' });
      handleCloseDeleteDialog();
    } else {
      setSnackbar({ open: true, message: result.message, severity: 'error' });
    }
  };

  // Calculate summary
  const summary: Summary = {
    totalTeachers: totalRecords,
    activeTeachers: teachers?.filter((t: any) => t.isActive).length || 0,
    inactiveTeachers: teachers?.filter((t: any) => !t.isActive).length || 0,
    totalSalary: teachers?.reduce((sum: number, t: any) => sum + (t.salaryPerLesson || 0), 0) || 0
  };

  const handleOpenResetPassword = (teacher: Teacher) => {
    setResetPasswordTeacher(teacher);
    setNewPassword('');
    setResetPasswordDialog(true);
  };

  const handleResetPassword = async () => {
    if (!resetPasswordTeacher || !newPassword) return;
    if (newPassword.length < 6) {
      setSnackbar({ open: true, message: 'Mật khẩu phải có ít nhất 6 ký tự', severity: 'error' });
      return;
    }
    try {
      await resetPasswordAPI(resetPasswordTeacher.id, newPassword);
      setSnackbar({ open: true, message: `Đặt lại mật khẩu cho ${resetPasswordTeacher.name || resetPasswordTeacher.userId?.name || 'giáo viên'} thành công!`, severity: 'success' });
      setResetPasswordDialog(false);
    } catch {
      setSnackbar({ open: true, message: 'Đặt lại mật khẩu thất bại', severity: 'error' });
    }
  };

  return (
    <DashboardLayout role="admin">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h5" component="h1">
                Quản lý giáo viên
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
                sx={{ bgcolor: COLORS.primary.main }}
              >
                Thêm giáo viên
              </Button>
            </Box>

            {/* Stat Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Tổng giáo viên"
                  value={summary.totalTeachers}
                  icon={<AddIcon sx={{ fontSize: 40 }} />}
                  color="primary"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Đang hoạt động"
                  value={summary.activeTeachers}
                  icon={<AddIcon sx={{ fontSize: 40 }} />}
                  color="success"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Ngừng hoạt động"
                  value={summary.inactiveTeachers}
                  icon={<AddIcon sx={{ fontSize: 40 }} />}
                  color="error"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Tổng lương"
                  value={new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(summary.totalSalary)}
                  icon={<AddIcon sx={{ fontSize: 40 }} />}
                  color="warning"
                />
              </Grid>
            </Grid>

            {/* Filters */}
            <TeacherFilters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              emailFilter={emailFilter}
              setEmailFilter={setEmailFilter}
              isActiveFilter={isActiveFilter || ''}
              setIsActiveFilter={setIsActiveFilter || (() => {})}
            />

            {/* Table */}
            <TeacherTable
              teachers={teachers}
              loading={loading}
              onEdit={handleOpenDialog}
              onDelete={handleDeleteTeacher}
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
                  color="primary"
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}

            {/* Dialogs */}
            <TeacherForm
              open={openDialog}
              onClose={handleCloseDialog}
              teacher={selectedTeacher}
              onSubmit={handleFormSubmit}
              loading={formLoading || loadingDetail}
            />

            <TeacherViewDialog
              open={openViewDialog}
              onClose={handleCloseViewDialog}
              teacher={teacherDetail}
              loading={loadingDetail}
            />

            <ConfirmDialog
              open={openDeleteDialog}
              onClose={handleCloseDeleteDialog}
              onConfirm={handleDeleteTeacher}
              title="Xác nhận xóa giáo viên"
              message={teacherToDelete ? `Bạn có chắc chắn muốn xóa giáo viên "${teacherToDelete.userId?.name}"? Hành động này không thể hoàn tác.` : ''}
              loading={loading}
            />

            <NotificationSnackbar
              open={snackbar.open}
              message={snackbar.message}
              severity={snackbar.severity}
              onClose={() => setSnackbar({ ...snackbar, open: false })}
            />

            <Dialog open={resetPasswordDialog} onClose={() => setResetPasswordDialog(false)} maxWidth="xs" fullWidth>
              <DialogTitle>Đặt lại mật khẩu</DialogTitle>
              <DialogContent>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Đặt mật khẩu mới cho: <strong>{resetPasswordTeacher?.name || resetPasswordTeacher?.userId?.name}</strong>
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
          </Box>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default TeacherManagement;
