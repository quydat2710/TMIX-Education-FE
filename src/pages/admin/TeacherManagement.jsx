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
import { createTeacherAPI, getAllTeachersAPI } from '../../services/api';
import { validateTeacher } from '../../validations/teacherValidation';

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
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    dayOfBirth: '',
    address: '',
    gender: 'male',
    salaryPerLesson: '',
    qualifications: '',
    specialization: '',
    description: '',
    isActive: true,
  });

  const handleOpenDialog = (teacher = null) => {
    setSelectedTeacher(teacher);
    setForm({
      name: '',
      email: '',
      password: '',
      phone: '',
      dayOfBirth: '',
      address: '',
      gender: 'male',
      salaryPerLesson: '',
      qualifications: '',
      specialization: '',
      description: '',
      isActive: true,
    });
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
      password: '',
      phone: '',
      dayOfBirth: '',
      address: '',
      gender: 'male',
      salaryPerLesson: '',
      qualifications: '',
      specialization: '',
      description: '',
      isActive: true,
    });
    setError('');
    setFormErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async () => {
    // Validate form before submitting
    const errors = validateTeacher(form);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return; // Stop if there are validation errors
    }

    setLoading(true);
    setError('');

    try {
      const requestData = {
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

      console.log('Sending teacher data:', requestData);

      await createTeacherAPI(requestData);

      handleCloseDialog();
      setPage(1); // Go back to first page to see the new teacher
      fetchTeachers(1); // Refresh teacher list from first page
    } catch (err) {
      setError(err?.response?.data?.message || 'Có lỗi xảy ra khi thêm giáo viên');
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
                          <IconButton size="small" title="Xem chi tiết">
                            <ViewIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" title="Chỉnh sửa">
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" title="Xóa" color="error">
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

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
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
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Thông tin cá nhân
                    </Typography>
                  </Grid>
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
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      error={!!formErrors.password}
                      helperText={formErrors.password}
                      required
                    />
                  </Grid>
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

                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                      Thông tin giảng dạy
                    </Typography>
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
          </Box>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default TeacherManagement;
