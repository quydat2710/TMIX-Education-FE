import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Pagination,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { COLORS } from "../../utils/colors";
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { commonStyles } from '../../utils/styles';
import { createTeacherAPI, getAllTeachersAPI, deleteTeacherAPI, updateTeacherAPI } from '../../services/api';
import { validateTeacher } from '../../validations/teacherValidation';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const TeacherManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [loadingTable, setLoadingTable] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedTeacherForView, setSelectedTeacherForView] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState(null);
  const [classEdits, setClassEdits] = useState([]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    gender: 'female',
    dayOfBirth: '',
    salaryPerLesson: '',
    qualifications: '',
    specialization: '',
    description: '',
    isActive: true,
  });

  const handleOpenDialog = (teacher = null) => {
    setSelectedTeacher(teacher);
    if (teacher) {
      setForm({
        name: teacher.userId?.name || '',
        email: teacher.userId?.email || '',
        phone: teacher.userId?.phone || '',
        address: teacher.userId?.address || '',
        gender: teacher.userId?.gender || 'female',
        dayOfBirth: teacher.userId?.dayOfBirth || '',
        salaryPerLesson: teacher.salaryPerLesson || '',
        qualifications: teacher.qualifications?.join(', ') || '',
        specialization: teacher.specialization?.join(', ') || '',
        description: teacher.description || '',
        isActive: teacher.isActive !== undefined ? teacher.isActive : true,
      });
      setClassEdits(
        (teacher.classes || []).map(cls => ({
          classId: cls.classId?._id || cls.classId,
          className: cls.classId?.name || '',
          discountPercent: cls.discountPercent || 0,
          status: cls.status || 'active',
        }))
      );
    } else {
    setForm({
      name: '',
      email: '',
      phone: '',
        address: '',
        gender: 'female',
      dayOfBirth: '',
      salaryPerLesson: '',
      qualifications: '',
      specialization: '',
      description: '',
      isActive: true,
    });
      setClassEdits([]);
    }
    setError('');
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedTeacher(null);
    setOpenDialog(false);
    setForm({
      name: '',
      email: '',
      phone: '',
      address: '',
      gender: 'female',
      dayOfBirth: '',
      salaryPerLesson: '',
      qualifications: '',
      specialization: '',
      description: '',
      isActive: true,
    });
    setClassEdits([]);
    setError('');
    setFormErrors({});
  };

  const handleOpenViewDialog = (teacherData) => {
    setSelectedTeacherForView(teacherData);
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setSelectedTeacherForView(null);
    setOpenViewDialog(false);
  };

  const handleOpenDeleteDialog = (teacher) => {
    setTeacherToDelete(teacher);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setTeacherToDelete(null);
    setOpenDeleteDialog(false);
  };

  const handleDeleteTeacher = async () => {
    if (!teacherToDelete) return;

    setLoading(true);
    setError('');
    try {
      await deleteTeacherAPI(teacherToDelete.id);
      handleCloseDeleteDialog();
      fetchTeachers(page); // Refresh teacher list
    } catch (err) {
      setError(err?.response?.data?.message || 'Có lỗi xảy ra khi xóa giáo viên');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleClassEditChange = (idx, field, value) => {
    setClassEdits(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const handleSubmit = async () => {
    // Validate form before submitting
    const errors = validateTeacher(form, !!selectedTeacher);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return; // Stop if there are validation errors
    }

    setLoading(true);
    setError('');

    try {
      if (selectedTeacher) {
        // UPDATE
        const body = {
          userData: {
            phone: form.phone,
            dayOfBirth: form.dayOfBirth,
            address: form.address,
            gender: form.gender,
          },
          teacherData: {
            salaryPerLesson: Number(form.salaryPerLesson),
            qualifications: form.qualifications.split(',').map(q => q.trim()).filter(q => q),
            specialization: form.specialization.split(',').map(s => s.trim()).filter(s => s),
            description: form.description,
          },
        };
        await updateTeacherAPI(selectedTeacher.id, body);
      } else {
        // CREATE (gửi đúng body backend yêu cầu)
        const body = {
        userData: {
          name: form.name,
          email: form.email,
            password: form.password,
          phone: form.phone,
            dayOfBirth: form.dayOfBirth,
          address: form.address,
          gender: form.gender,
        },
        teacherData: {
          salaryPerLesson: Number(form.salaryPerLesson),
          qualifications: form.qualifications.split(',').map(q => q.trim()).filter(q => q),
          specialization: form.specialization.split(',').map(s => s.trim()).filter(s => s),
          description: form.description,
          isActive: form.isActive,
        },
      };
        await createTeacherAPI(body);
      }

      handleCloseDialog();
      fetchTeachers(page);
    } catch (err) {
      setError(err?.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  // Fetch teachers from API
  const fetchTeachers = async (pageNum = 1) => {
    setLoadingTable(true);
    try {
      const params = { page: pageNum, limit: 10 };
      const res = await getAllTeachersAPI(params);
      console.log('API getAllTeachersAPI response:', res);
      setTeachers(res.data || []);
      setTotalPages(res.totalPages || 1);
      setTotalRecords(res.totalRecords || 0);
    } catch (err) {
      console.error('Error fetching teachers:', err);
      setTeachers([]);
    } finally {
      setLoadingTable(false);
    }
  };

  // Fetch teachers on component mount and when page changes
  useEffect(() => {
    fetchTeachers(page);
  }, [page]);

  const handlePageChange = (event, value) => {
    setPage(value);
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
                sx={{ bgcolor: COLORS.primary }}
        >
          Thêm giáo viên
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Tìm kiếm giáo viên..."
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

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
                    <TableCell width="15%">Họ và tên</TableCell>
                    <TableCell width="15%">Email</TableCell>
                    <TableCell width="12%">Số điện thoại</TableCell>
                    <TableCell width="10%">Lương/buổi</TableCell>
                    <TableCell width="15%">Bằng cấp</TableCell>
                    <TableCell width="13%">Chuyên môn</TableCell>
                    <TableCell width="8%">Trạng thái</TableCell>
                    <TableCell width="22%" align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
                  {loadingTable ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">Đang tải...</TableCell>
                    </TableRow>
                  ) : teachers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">Không có dữ liệu</TableCell>
                    </TableRow>
                  ) : (
                    teachers.map((teacher) => (
                      <TableRow key={teacher.id}>
                        <TableCell>{teacher.userId?.name || '-'}</TableCell>
                        <TableCell>{teacher.userId?.email || '-'}</TableCell>
                        <TableCell>{teacher.userId?.phone || '-'}</TableCell>
                        <TableCell>{teacher.salaryPerLesson ? `${teacher.salaryPerLesson.toLocaleString()} VNĐ` : '-'}</TableCell>
                        <TableCell>
                          {teacher.qualifications && teacher.qualifications.length > 0
                            ? teacher.qualifications.join(', ')
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {teacher.specialization && teacher.specialization.length > 0
                            ? teacher.specialization.join(', ')
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={teacher.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                            color={teacher.isActive ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton size="small" title="Xem chi tiết" onClick={() => handleOpenViewDialog(teacher)}>
                            <ViewIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" title="Chỉnh sửa" onClick={() => handleOpenDialog(teacher)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" title="Xóa" color="error" onClick={() => handleOpenDeleteDialog(teacher)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
          </TableBody>
        </Table>
      </TableContainer>

            {/* Pagination */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        PaperProps={{
          sx: { borderRadius: 2, width: '70%' }
        }}
      >
        <DialogTitle>
          {selectedTeacher ? 'Chỉnh sửa thông tin giáo viên' : 'Thêm giáo viên mới'}
        </DialogTitle>
        <DialogContent>
                {error && (
                  <Typography color="error" sx={{ mb: 2 }}>
                    {error}
                  </Typography>
                )}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Khi chỉnh sửa chỉ cho phép sửa các trường API yêu cầu */}
            {selectedTeacher == null ? (
              <React.Fragment>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Họ và tên"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      error={!!formErrors.name}
                      helperText={formErrors.name}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      error={!!formErrors.email}
                      helperText={formErrors.email}
                required
              />
            </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Mật khẩu"
                    name="password"
                    type="password"
                    value={form.password || ''}
                    onChange={handleChange}
                    required
                    error={!!formErrors.password}
                    helperText={formErrors.password}
                  />
                </Grid>
              </React.Fragment>
            ) : null}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Số điện thoại"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      error={!!formErrors.phone}
                      helperText={formErrors.phone}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Ngày sinh"
                      name="dayOfBirth"
                      value={form.dayOfBirth}
                      onChange={handleChange}
                      placeholder="15/03/1990"
                      error={!!formErrors.dayOfBirth}
                      helperText={formErrors.dayOfBirth}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                      <InputLabel>Giới tính</InputLabel>
                      <Select
                        label="Giới tính"
                        name="gender"
                        value={form.gender}
                        onChange={handleChange}
                        required
                      >
                        <MenuItem value="male">Nam</MenuItem>
                        <MenuItem value="female">Nữ</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Địa chỉ"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      error={!!formErrors.address}
                      helperText={formErrors.address}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Lương/buổi (nghìn VND)"
                      type="number"
                      name="salaryPerLesson"
                      value={form.salaryPerLesson}
                      onChange={handleChange}
                      error={!!formErrors.salaryPerLesson}
                      helperText={formErrors.salaryPerLesson}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Trạng thái</InputLabel>
                      <Select
                        label="Trạng thái"
                        name="isActive"
                        value={form.isActive}
                        onChange={handleChange}
                        required
                      >
                        <MenuItem value={true}>Đang hoạt động</MenuItem>
                        <MenuItem value={false}>Ngừng hoạt động</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Bằng cấp (phân tách bởi dấu phẩy)"
                      name="qualifications"
                      value={form.qualifications}
                      onChange={handleChange}
                      placeholder="Bachelor of Education, TESOL"
                      error={!!formErrors.qualifications}
                      helperText={formErrors.qualifications}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Chuyên môn (phân tách bởi dấu phẩy)"
                      name="specialization"
                      value={form.specialization}
                      onChange={handleChange}
                      placeholder="IELTS, TOEFL"
                      error={!!formErrors.specialization}
                      helperText={formErrors.specialization}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Mô tả"
                multiline
                      rows={3}
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Mô tả về kinh nghiệm giảng dạy..."
              />
            </Grid>
          </Grid>

          {selectedTeacher && classEdits.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Danh sách lớp đang dạy
              </Typography>
              <Grid container spacing={2}>
                {classEdits.map((cls, idx) => (
                  <React.Fragment key={cls.classId}>
                    <Grid item xs={12} sm={5}>
                      <TextField
                        label="Tên lớp"
                        value={cls.className}
                        InputProps={{ readOnly: true }}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        label="Giảm giá (%)"
                        type="number"
                        value={cls.discountPercent}
                        onChange={(e) => handleClassEditChange(idx, 'discountPercent', e.target.value)}
                        fullWidth
                        inputProps={{ min: 0, max: 100 }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth>
                        <InputLabel>Trạng thái</InputLabel>
                        <Select
                          label="Trạng thái"
                          value={cls.status}
                          onChange={(e) => handleClassEditChange(idx, 'status', e.target.value)}
                        >
                          <MenuItem value="active">Đang hoạt động</MenuItem>
                          <MenuItem value="inactive">Ngừng hoạt động</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </React.Fragment>
                ))}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                  sx={{ bgcolor: COLORS.primary }}
                >
                  {selectedTeacher ? 'Cập nhật' : loading ? 'Đang thêm...' : 'Thêm mới'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDeleteTeacher}
        title="Xác nhận xóa giáo viên"
        content={`Bạn có chắc chắn muốn xóa giáo viên "${teacherToDelete?.userId?.name}"? Hành động này không thể hoàn tác.`}
        loading={loading}
      />

      {/* View Teacher Details Dialog */}
      <Dialog
        open={openViewDialog}
        onClose={handleCloseViewDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            minHeight: '50vh'
          }
        }}
      >
        <DialogTitle sx={{
          ...commonStyles.dialogTitle,
          background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
          color: 'white',
          textAlign: 'center',
          py: 1
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Chi tiết giáo viên
          </Typography>
          {selectedTeacherForView && (
            <Typography sx={{ mt: 0.25, fontWeight: 'bold', fontSize: '1.3rem', color: 'black' }}>
              Thông tin giáo viên
            </Typography>
          )}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedTeacherForView && (
            <Box>

              {/* Main Information Grid */}
              <Grid container spacing={3}>
                {/* Left Column - Personal Info */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2.5, borderRadius: 1.5, height: '100%', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
                    <Typography variant="subtitle1" sx={{ mb: 2, color: COLORS.primary, fontWeight: 600, borderBottom: `1px solid ${COLORS.primary}`, pb: 0.5 }}>
                      Thông tin cá nhân
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Box>
                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.25 }}>
                          Họ và tên
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: COLORS.primary }}>
                          {selectedTeacherForView.userId?.name}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.25 }}>
                          Email
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {selectedTeacherForView.userId?.email}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.25 }}>
                          Số điện thoại
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {selectedTeacherForView.userId?.phone}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.25 }}>
                          Ngày sinh
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {selectedTeacherForView.userId?.dayOfBirth}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.25 }}>
                          Giới tính
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {selectedTeacherForView.userId?.gender === 'male' ? 'Nam' : 'Nữ'}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.25 }}>
                          Địa chỉ
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {selectedTeacherForView.userId?.address}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>

                {/* Right Column - Professional Info */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2.5, borderRadius: 1.5, height: '100%', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
                    <Typography variant="subtitle1" sx={{ mb: 2, color: COLORS.primary, fontWeight: 600, borderBottom: `1px solid ${COLORS.primary}`, pb: 0.5 }}>
                      Thông tin chuyên môn
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Box sx={{
                        p: 1.5,
                        borderRadius: 1.5,
                        background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                        border: '1px solid #2196f3'
                      }}>
                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.25 }}>
                          Lương mỗi buổi
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2' }}>
                          {selectedTeacherForView.salaryPerLesson ? `${selectedTeacherForView.salaryPerLesson.toLocaleString()} VNĐ` : 'Chưa có'}
                        </Typography>
                      </Box>

                      <Box sx={{
                        p: 1.5,
                        borderRadius: 1.5,
                        background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
                        border: '1px solid #9c27b0'
                      }}>
                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.25 }}>
                          Bằng cấp
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#7b1fa2' }}>
                          {selectedTeacherForView.qualifications && selectedTeacherForView.qualifications.length > 0
                            ? selectedTeacherForView.qualifications.join(', ')
                            : 'Chưa có'}
                        </Typography>
                      </Box>

                      <Box sx={{
                        p: 1.5,
                        borderRadius: 1.5,
                        background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
                        border: '1px solid #4caf50'
                      }}>
                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.25 }}>
                          Chuyên môn
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#2e7d32' }}>
                          {selectedTeacherForView.specialization && selectedTeacherForView.specialization.length > 0
                            ? selectedTeacherForView.specialization.join(', ')
                            : 'Chưa có'}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>

                {/* Status Banner */}
                <Grid item xs={12}>
                    <Box sx={{
                        p: 1.5,
                        borderRadius: 1.5,
                        background: `linear-gradient(90deg, ${selectedTeacherForView.isActive ? '#e8f5e8' : '#ffebee'}, transparent)`,
                        border: `1px solid ${selectedTeacherForView.isActive ? '#4caf50' : '#f44336'}`
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            Trạng thái giáo viên
                        </Typography>
                        <Chip
                            label={selectedTeacherForView.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                            color={selectedTeacherForView.isActive ? 'success' : 'error'}
                            size="small"
                            sx={{ fontWeight: 600 }}
                        />
                        </Box>
                    </Box>
                </Grid>

                {/* Description */}
                {selectedTeacherForView.description && (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2.5, borderRadius: 1.5, boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
                      <Typography variant="subtitle1" sx={{ mb: 2, color: COLORS.primary, fontWeight: 600, borderBottom: `1px solid ${COLORS.primary}`, pb: 0.5 }}>
                        Mô tả
                      </Typography>
                      <Typography variant="body2" sx={{ lineHeight: 1.5, color: 'text.primary' }}>
                        {selectedTeacherForView.description}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button
            onClick={handleCloseViewDialog}
            variant="contained"
            sx={{
              px: 3,
              py: 1,
              borderRadius: 1.5,
              background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
              '&:hover': {
                background: `linear-gradient(135deg, ${COLORS.secondary} 0%, ${COLORS.primary} 100%)`,
              }
            }}
          >
            Đóng
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
