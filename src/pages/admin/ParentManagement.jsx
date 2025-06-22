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
  Tabs,
  Tab,
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
import { createParentAPI, getAllParentsAPI, deleteParentAPI, updateParentAPI, addChildAPI, removeChildAPI, getAllStudentsAPI } from '../../services/api';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const ParentManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
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
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedParentForView, setSelectedParentForView] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [parentToDelete, setParentToDelete] = useState(null);
  const [classEdits, setClassEdits] = useState([]);
  const [newChildId, setNewChildId] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchingStudents, setSearchingStudents] = useState(false);
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
    if (parent) {
      setForm({
        name: parent.userId?.name || '',
        email: parent.userId?.email || '',
        password: '',
        dayOfBirth: parent.userId?.dayOfBirth || '',
        phone: parent.userId?.phone || '',
        address: parent.userId?.address || '',
        gender: parent.userId?.gender || 'male',
        canSeeTeacherInfo: parent.canSeeTeacherInfo !== undefined ? parent.canSeeTeacherInfo : true,
      });
      setClassEdits(
        (parent.classes || []).map(cls => ({
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
        password: '',
        dayOfBirth: '',
        phone: '',
        address: '',
        gender: 'male',
        canSeeTeacherInfo: true,
      });
      setClassEdits([]);
    }
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
    setClassEdits([]);
    setNewChildId('');
    setTabValue(0);
    setStudentSearchQuery('');
    setSearchResults([]);
    setError('');
    setFormErrors({});
  };

  const handleOpenViewDialog = (parentData) => {
    setSelectedParentForView(parentData);
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setSelectedParentForView(null);
    setOpenViewDialog(false);
  };

  const handleOpenDeleteDialog = (parent) => {
    setParentToDelete(parent);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setParentToDelete(null);
    setOpenDeleteDialog(false);
  };

  const handleDeleteParent = async () => {
    if (!parentToDelete) return;

    setLoading(true);
    setError('');
    try {
      await deleteParentAPI(parentToDelete.id);
      handleCloseDeleteDialog();
      fetchParents(page); // Refresh parent list
    } catch (err) {
      setError(err?.response?.data?.message || 'Có lỗi xảy ra khi xóa phụ huynh');
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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const searchStudents = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchingStudents(true);
    try {
      const params = {
        page: 1,
        limit: 10,
        search: query.trim()
      };
      const res = await getAllStudentsAPI(params);
      setSearchResults(res.data || []);
    } catch (err) {
      console.error('Error searching students:', err);
      setSearchResults([]);
    } finally {
      setSearchingStudents(false);
    }
  };

  const handleStudentSearchChange = (e) => {
    const query = e.target.value;
    setStudentSearchQuery(query);
    if (query.trim()) {
      searchStudents(query);
    } else {
      setSearchResults([]);
    }
  };

  const handleAddChild = async (studentId, parentId) => {
    try {
      await addChildAPI(studentId, parentId);
      setStudentSearchQuery(''); // Clear the search input
      setSearchResults([]); // Clear search results
      fetchParents(page); // Refresh parent list
    } catch (err) {
      setError(err?.response?.data?.message || 'Có lỗi xảy ra khi thêm con');
    }
  };

  const handleRemoveChild = async (studentId, parentId) => {
    try {
      await removeChildAPI(studentId, parentId);
      fetchParents(page); // Refresh parent list
    } catch (err) {
      setError(err?.response?.data?.message || 'Có lỗi xảy ra khi xóa con');
    }
  };

  const handleSubmit = async () => {
    // Validate form before submitting
    const errors = validateParent(form, !!selectedParent);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return; // Stop if there are validation errors
    }

    setLoading(true);
    setError('');

    try {
      if (selectedParent) {
        // UPDATE
        const body = {
          userData: {
            name: form.name,
            email: form.email,
            dayOfBirth: form.dayOfBirth,
            phone: form.phone,
            address: form.address,
            gender: form.gender,
          },
          studentData: classEdits.map(cls => ({
            classId: cls.classId,
            discountPercent: Number(cls.discountPercent),
            status: cls.status,
          })),
        };
        await updateParentAPI(selectedParent.id, body);
      } else {
        // CREATE
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
        await createParentAPI(requestData);
      }

      handleCloseDialog();
      fetchParents(page);
    } catch (err) {
      setError(err?.response?.data?.message || 'Có lỗi xảy ra');
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
    } catch (err) {
      console.error('Error fetching parents:', err);
      setParents([]);
    } finally {
      setLoadingTable(false);
    }
  };

  // Helper function to get student names for a parent
  const getStudentNames = (studentIds) => {
    if (!studentIds || studentIds.length === 0) {
      return 'Chưa có con';
    }

    const names = studentIds.map(student => student.userId?.name || 'Không có tên');
    return names.join('\n');
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
              <Grid item xs={12} md={6}>
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
                  <TableCell width="15%">Họ và tên</TableCell>
                  <TableCell width="20%">Email</TableCell>
                  <TableCell width="15%">Số điện thoại</TableCell>
                  <TableCell width="15%">Con</TableCell>
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
                      <TableCell sx={{ whiteSpace: 'pre-line' }}>{getStudentNames(parent.studentIds)}</TableCell>
                      <TableCell>{getGenderLabel(parent.userId?.gender)}</TableCell>
                      <TableCell>
                        <Chip
                          label={getTeacherInfoLabel(parent.canSeeTeacherInfo)}
                          color={getTeacherInfoColor(parent.canSeeTeacherInfo)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" title="Xem chi tiết" onClick={() => handleOpenViewDialog(parent)}>
                          <ViewIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" title="Chỉnh sửa" onClick={() => handleOpenDialog(parent)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" title="Xóa" color="error" onClick={() => handleOpenDeleteDialog(parent)}>
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
            fullWidth
            PaperProps={{
              sx: { borderRadius: 2 }
            }}
          >
            <DialogTitle sx={commonStyles.dialogTitle}>
          {selectedParent ? 'Chỉnh sửa thông tin phụ huynh' : 'Thêm phụ huynh mới'}
        </DialogTitle>
            <DialogContent sx={{ p: 2 }}>
              {error && (
                <Typography color="error" sx={{ mb: 2 }}>
                  {error}
                </Typography>
              )}

              {selectedParent ? (
                // Tabs for editing parent
                <Box>
                  <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
                    <Tab label="Thông tin cơ bản" />
                    <Tab label="Quản lý con cái" />
                  </Tabs>

                  {tabValue === 0 && (
                    // Tab 1: Basic Information
                    <Box>
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

                      {classEdits.length > 0 && (
                        <Box sx={{ mt: 3 }}>
                          <Typography variant="h6" gutterBottom>
                            Danh sách lớp đang học
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
                    </Box>
                  )}

                  {tabValue === 1 && (
                    // Tab 2: Children Management
                    <Box>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                          Danh sách con hiện tại
                        </Typography>
                        {selectedParent.studentIds && selectedParent.studentIds.length > 0 ? (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {selectedParent.studentIds.map((student, idx) => (
                              <Box key={student.id || idx} sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                p: 2,
                                border: '1px solid #e0e0e0',
                                borderRadius: 1,
                                bgcolor: '#fafafa'
                              }}>
                                <Box>
                                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                    {student.userId?.name || 'Không có tên'}
                                  </Typography>
                                  <Typography variant="body2" color="textSecondary">
                                    ID: {student.id}
                                  </Typography>
                                </Box>
                                <Button
                                  size="small"
                                  color="error"
                                  variant="outlined"
                                  onClick={() => handleRemoveChild(student.id, selectedParent.id)}
                                >
                                  Xóa
                                </Button>
                              </Box>
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="textSecondary" sx={{ p: 2, textAlign: 'center' }}>
                            Chưa có con nào
                          </Typography>
                        )}
                      </Box>

                      <Box>
                        <Typography variant="h6" gutterBottom>
                          Thêm con mới
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <TextField
                            fullWidth
                            label="Tìm kiếm học sinh"
                            placeholder="Nhập tên hoặc email học sinh"
                            value={studentSearchQuery}
                            onChange={handleStudentSearchChange}
                            InputProps={{
                              endAdornment: searchingStudents && (
                                <Box sx={{ display: 'flex', alignItems: 'center', pr: 1 }}>
                                  <Typography variant="caption" color="textSecondary">
                                    Đang tìm...
                                  </Typography>
                                </Box>
                              ),
                            }}
                          />
                        </Box>

                        {searchResults.length > 0 && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                              Kết quả tìm kiếm:
                            </Typography>
                            <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                              {searchResults.map((student) => (
                                <Box
                                  key={student.id}
                                  sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    p: 1.5,
                                    border: '1px solid #e0e0e0',
                                    borderRadius: 1,
                                    mb: 1,
                                    bgcolor: '#fafafa',
                                    '&:hover': { bgcolor: '#f0f0f0' }
                                  }}
                                >
                                  <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                      {student.userId?.name || 'Không có tên'}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                      {student.userId?.email} • ID: {student.id}
                                    </Typography>
                                  </Box>
                                  <Button
                                    size="small"
                                    variant="contained"
                                    onClick={() => handleAddChild(student.id, selectedParent.id)}
                                  >
                                    Thêm
                                  </Button>
                                </Box>
                              ))}
                            </Box>
                          </Box>
                        )}

                        {studentSearchQuery && searchResults.length === 0 && !searchingStudents && (
                          <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
                            Không tìm thấy học sinh nào
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  )}
                </Box>
              ) : (
                // Create new parent form (no tabs)
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
              )}
            </DialogContent>
            <DialogActions sx={commonStyles.formActions}>
              <Button onClick={handleCloseDialog} sx={commonStyles.secondaryButton} disabled={loading}>
                Hủy
              </Button>
              {selectedParent && tabValue === 1 ? (
                // Tab 2: Children Management - no update button needed
                <Button
                  variant="contained"
                  onClick={handleCloseDialog}
                  sx={commonStyles.primaryButton}
                >
                  Đóng
                </Button>
              ) : (
                // Tab 1 or Create new - show update/create button
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                  sx={commonStyles.primaryButton}
                >
                  {loading ? 'Đang xử lý...' : (selectedParent ? 'Cập nhật' : 'Thêm mới')}
                </Button>
              )}
            </DialogActions>
          </Dialog>

          <ConfirmDialog
            open={openDeleteDialog}
            onClose={handleCloseDeleteDialog}
            onConfirm={handleDeleteParent}
            title="Xác nhận xóa phụ huynh"
            content={`Bạn có chắc chắn muốn xóa phụ huynh "${parentToDelete?.userId?.name}"? Hành động này không thể hoàn tác.`}
            loading={loading}
          />

          {/* View Parent Details Dialog */}
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
                Chi tiết phụ huynh
              </Typography>
              {selectedParentForView && (
                <Typography sx={{ mt: 0.25, fontWeight: 'bold', fontSize: '1.3rem', color: 'black' }}>
                  Thông tin phụ huynh
                </Typography>
              )}
            </DialogTitle>
            <DialogContent sx={{ padding: '8px 16px 16px 16px' }}>
              {selectedParentForView && (
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
                              {selectedParentForView.userId?.name}
                            </Typography>
                          </Box>

                          <Box>
                            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.25 }}>
                              Email
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {selectedParentForView.userId?.email}
                            </Typography>
                          </Box>

                          <Box>
                            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.25 }}>
                              Số điện thoại
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {selectedParentForView.userId?.phone}
                            </Typography>
                          </Box>

                          <Box>
                            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.25 }}>
                              Ngày sinh
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {selectedParentForView.userId?.dayOfBirth}
                            </Typography>
                          </Box>

                          <Box>
                            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.25 }}>
                              Giới tính
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {getGenderLabel(selectedParentForView.userId?.gender)}
                            </Typography>
                          </Box>

                          <Box>
                            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.25 }}>
                              Địa chỉ
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {selectedParentForView.userId?.address}
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>

                    {/* Right Column - Children Info */}
                    <Grid item xs={12} md={6}>
                      <Paper sx={{ p: 2.5, borderRadius: 1.5, height: '100%', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
                        <Typography variant="subtitle1" sx={{ mb: 2, color: COLORS.primary, fontWeight: 600, borderBottom: `1px solid ${COLORS.primary}`, pb: 0.5 }}>
                          Thông tin con cái
                        </Typography>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                          <Box sx={{
                            p: 1.5,
                            borderRadius: 1.5,
                            background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                            border: '1px solid #2196f3'
                          }}>
                            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.25 }}>
                              Số lượng con
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2' }}>
                              {selectedParentForView.studentIds ? selectedParentForView.studentIds.length : 0}
                            </Typography>
                          </Box>

                          <Box sx={{
                            p: 1.5,
                            borderRadius: 1.5,
                            background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
                            border: '1px solid #9c27b0'
                          }}>
                            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.25 }}>
                              Trạng thái
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500, color: '#7b1fa2' }}>
                              {selectedParentForView.studentIds && selectedParentForView.studentIds.length > 0 ? 'Có con đang học' : 'Chưa có con'}
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>

                    <Grid item xs={12}>
                      {/* Permission Banner */}
                      <Box sx={{
                        p: 1.5,
                        borderRadius: 1.5,
                        background: `linear-gradient(90deg, ${selectedParentForView.canSeeTeacherInfo ? '#e8f5e8' : '#fff3e0'}, transparent)`,
                        border: `1px solid ${selectedParentForView.canSeeTeacherInfo ? '#4caf50' : '#ff9800'}`
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            Quyền xem thông tin giáo viên
                          </Typography>
                          <Chip
                            label={getTeacherInfoLabel(selectedParentForView.canSeeTeacherInfo)}
                            color={getTeacherInfoColor(selectedParentForView.canSeeTeacherInfo)}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </Box>
                      </Box>
                    </Grid>

                    {/* Full Width - Children List */}
                    {selectedParentForView.studentIds && selectedParentForView.studentIds.length > 0 && (
                      <Grid item xs={12}>
                        <Paper sx={{ p: 2.5, borderRadius: 1.5, boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
                          <Typography variant="subtitle1" sx={{ mb: 2, color: COLORS.primary, fontWeight: 600, borderBottom: `1px solid ${COLORS.primary}`, pb: 0.5 }}>
                            Danh sách con
                          </Typography>

                          <Grid container spacing={2}>
                            {selectedParentForView.studentIds.map((student, index) => (
                              <Grid item xs={12} md={4} key={student.id}>
                                <Box sx={{
                                  p: 1.5,
                                  borderRadius: 1.5,
                                  bgcolor: '#e8f5e8',
                                  border: '1px solid #4caf50'
                                }}>
                                  <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                                    Con thứ {index + 1}
                                  </Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#2e7d32' }}>
                                    {student.userId?.name || 'Không có tên'}
                                  </Typography>
                                </Box>
                              </Grid>
                            ))}
                          </Grid>
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
    </DashboardLayout>
  );
};

export default ParentManagement;
