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
  Checkbox,
  FormControlLabel,
  Pagination,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { COLORS } from "../../utils/colors";
import { commonStyles } from "../../utils/styles";
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { validateParent } from '../../validations/parentValidation';
import { createParentAPI, getAllParentsAPI, getStudentByIdAPI } from '../../services/api';

const ParentManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [relationshipFilter, setRelationshipFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [parents, setParents] = useState([]);
  const [loadingTable, setLoadingTable] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [studentDetails, setStudentDetails] = useState({});
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    dayOfBirth: '',
    phone: '',
    address: '',
    gender: 'male',
    canSeeTeacherInfo: true,
  });

  const handleOpenDialog = (parent = null) => {
    setSelectedParent(parent);
    setForm({
      name: '',
      email: '',
      password: '',
      dayOfBirth: '',
      phone: '',
      address: '',
      gender: 'male',
      canSeeTeacherInfo: true,
    });
    setError('');
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedParent(null);
    setOpenDialog(false);
    setForm({
      name: '',
      email: '',
      password: '',
      dayOfBirth: '',
      phone: '',
      address: '',
      gender: 'male',
      canSeeTeacherInfo: true,
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
    const errors = validateParent(form);
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
          dayOfBirth: form.dayOfBirth,
          phone: form.phone,
          address: form.address,
          gender: form.gender,
        },
        parentData: {
          canSeeTeacherInfo: form.canSeeTeacherInfo,
        },
      };

      console.log('Sending parent data:', requestData);

      await createParentAPI(requestData);

      handleCloseDialog();
      setPage(1); // Go back to first page to see the new parent
      fetchParents(1); // Refresh parent list from first page
    } catch (err) {
      setError(err?.response?.data?.message || 'Có lỗi xảy ra khi thêm phụ huynh');
    } finally {
      setLoading(false);
    }
  };

  // Fetch parents from API
  const fetchParents = async (pageNum = 1) => {
    setLoadingTable(true);
    try {
      const params = { page: pageNum, limit: 10 };
      const res = await getAllParentsAPI(params);
      console.log('API getAllParentsAPI response:', res);
      console.log('Parents data:', res.data);
      if (res.data && res.data.length > 0) {
        console.log('First parent data structure:', res.data[0]);
      }
      setParents(res.data || []);
      setTotalPages(res.totalPages || 1);
      setTotalRecords(res.totalRecords || 0);

      // Fetch student details for all parents
      await fetchStudentDetails(res.data || []);
    } catch (err) {
      console.error('Error fetching parents:', err);
      setParents([]);
    } finally {
      setLoadingTable(false);
    }
  };

  // Fetch student details for all parents
  const fetchStudentDetails = async (parentsList) => {
    const studentDetailsMap = {};

    for (const parent of parentsList) {
      if (parent.studentIds && parent.studentIds.length > 0) {
        for (const studentId of parent.studentIds) {
          if (!studentDetailsMap[studentId]) {
            try {
              const studentRes = await getStudentByIdAPI(studentId);
              if (studentRes.data && studentRes.data.userId) {
                studentDetailsMap[studentId] = studentRes.data.userId.name;
              }
            } catch (err) {
              console.error(`Error fetching student ${studentId}:`, err);
              studentDetailsMap[studentId] = 'Không tìm thấy';
            }
          }
        }
      }
    }

    setStudentDetails(studentDetailsMap);
  };

  // Helper function to get student names for a parent
  const getStudentNames = (studentIds) => {
    if (!studentIds || studentIds.length === 0) {
      return 'Chưa có con';
    }

    const names = studentIds.map(id => studentDetails[id] || 'Đang tải...');
    return names.join(', ');
  };

  // Fetch parents on component mount and when page changes
  useEffect(() => {
    fetchParents(page);
  }, [page]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Helper function to get gender label
  const getGenderLabel = (gender) => {
    return gender === 'male' ? 'Nam' : 'Nữ';
  };

  // Helper function to get teacher info permission label
  const getTeacherInfoLabel = (canSeeTeacherInfo) => {
    return canSeeTeacherInfo ? 'Có' : 'Không';
  };

  // Helper function to get teacher info permission color
  const getTeacherInfoColor = (canSeeTeacherInfo) => {
    return canSeeTeacherInfo ? 'success' : 'default';
  };

  return (
    <DashboardLayout role="admin">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <Box sx={commonStyles.pageHeader}>
            <Typography sx={commonStyles.pageTitle}>
              Quản lý phụ huynh
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={commonStyles.primaryButton}
            >
              Thêm phụ huynh
            </Button>
          </Box>

          <Paper sx={commonStyles.searchContainer}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Tìm kiếm phụ huynh..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={commonStyles.searchField}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Quan hệ</InputLabel>
                  <Select
                    label="Quan hệ"
                    value={relationshipFilter}
                    onChange={(e) => setRelationshipFilter(e.target.value)}
                    sx={commonStyles.filterSelect}
                  >
                    <MenuItem value="">Tất cả</MenuItem>
                    <MenuItem value="father">Bố</MenuItem>
                    <MenuItem value="mother">Mẹ</MenuItem>
                    <MenuItem value="guardian">Người giám hộ</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    label="Trạng thái"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    sx={commonStyles.filterSelect}
                  >
                    <MenuItem value="">Tất cả</MenuItem>
                    <MenuItem value="active">Đang hoạt động</MenuItem>
                    <MenuItem value="inactive">Không hoạt động</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>

          <TableContainer component={Paper} sx={commonStyles.tableContainer}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width="20%">Họ và tên</TableCell>
                  <TableCell width="20%">Email</TableCell>
                  <TableCell width="15%">Số điện thoại</TableCell>
                  <TableCell width="10%">Con</TableCell>
                  <TableCell width="10%">Giới tính</TableCell>
                  <TableCell width="15%">Xem thông tin giáo viên</TableCell>
                  <TableCell width="10%" align="center">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingTable ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">Đang tải...</TableCell>
                  </TableRow>
                ) : parents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">Không có dữ liệu</TableCell>
                  </TableRow>
                ) : (
                  parents.map((parent) => (
                    <TableRow key={parent.id}>
                      <TableCell>{parent.userId?.name || '-'}</TableCell>
                      <TableCell>{parent.userId?.email || '-'}</TableCell>
                      <TableCell>{parent.userId?.phone || '-'}</TableCell>
                      <TableCell>{getStudentNames(parent.studentIds)}</TableCell>
                      <TableCell>{getGenderLabel(parent.userId?.gender)}</TableCell>
                      <TableCell>
                        <Chip
                          label={getTeacherInfoLabel(parent.canSeeTeacherInfo)}
                          color={getTeacherInfoColor(parent.canSeeTeacherInfo)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" title="Xem chi tiết">
                          <ViewIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" title="Chỉnh sửa" onClick={() => handleOpenDialog(parent)}>
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

          {/* Pagination Info */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Hiển thị {parents.length} trong tổng số {totalRecords} phụ huynh
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Trang {page} / {totalPages}
            </Typography>
          </Box>

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
            maxWidth="md"
            fullWidth
            PaperProps={{
              sx: { borderRadius: 2 }
            }}
          >
            <DialogTitle sx={commonStyles.dialogTitle}>
              {selectedParent ? 'Chỉnh sửa thông tin phụ huynh' : 'Thêm phụ huynh mới'}
            </DialogTitle>
            <DialogContent sx={commonStyles.dialogContent}>
              {error && (
                <Typography color="error" sx={{ mb: 2 }}>
                  {error}
                </Typography>
              )}
              <Grid container spacing={2} sx={commonStyles.formGrid}>
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
                    sx={commonStyles.formField}
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
                    sx={commonStyles.formField}
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
                    sx={commonStyles.formField}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Ngày sinh"
                    name="dayOfBirth"
                    value={form.dayOfBirth}
                    onChange={handleChange}
                    placeholder="15/06/1975"
                    error={!!formErrors.dayOfBirth}
                    helperText={formErrors.dayOfBirth}
                    required
                    sx={commonStyles.formField}
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
                    sx={commonStyles.formField}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Địa chỉ"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    error={!!formErrors.address}
                    helperText={formErrors.address}
                    required
                    sx={commonStyles.formField}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth sx={commonStyles.formField}>
                    <InputLabel>Giới tính</InputLabel>
                    <Select
                      label="Giới tính"
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      error={!!formErrors.gender}
                      required
                    >
                      <MenuItem value="male">Nam</MenuItem>
                      <MenuItem value="female">Nữ</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="canSeeTeacherInfo"
                        checked={form.canSeeTeacherInfo}
                        onChange={(e) => setForm(prev => ({ ...prev, canSeeTeacherInfo: e.target.checked }))}
                      />
                    }
                    label="Quyền xem thông tin giáo viên"
                    sx={commonStyles.formField}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={commonStyles.formActions}>
              <Button onClick={handleCloseDialog} sx={commonStyles.secondaryButton} disabled={loading}>
                Hủy
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                sx={commonStyles.primaryButton}
              >
                {loading ? 'Đang xử lý...' : (selectedParent ? 'Cập nhật' : 'Thêm mới')}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default ParentManagement;
