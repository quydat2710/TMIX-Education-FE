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
import { commonStyles } from "../../utils/styles";
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { createStudentAPI, getAllStudentsAPI } from '../../services/api';
import { validateStudent } from '../../validations/studentValidation';

const StudentManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    dayOfBirth: '',
    phone: '',
    address: '',
    gender: 'female',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [students, setStudents] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingTable, setLoadingTable] = useState(false);
  const [parentDetails, setParentDetails] = useState({});
  const [classDetails, setClassDetails] = useState({});

  const handleOpenDialog = (student = null) => {
    setSelectedStudent(student);
    setForm({
      name: '',
      email: '',
      password: '',
      dayOfBirth: '',
      phone: '',
      address: '',
      gender: 'female',
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedStudent(null);
    setOpenDialog(false);
    setForm({
      name: '',
      email: '',
      password: '',
      dayOfBirth: '',
      phone: '',
      address: '',
      gender: 'female',
    });
    setError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const errors = validateStudent(form);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setLoading(true);
    setError('');
    try {
      await createStudentAPI(form);
      handleCloseDialog();
      fetchStudents(page);
    } catch (err) {
      setError(err?.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  // Fetch students from API
  const fetchStudents = async (pageNum = 1) => {
    setLoadingTable(true);
    try {
      const params = { page: pageNum, limit: 10 };
      const res = await getAllStudentsAPI(params);
      console.log('API getAllStudentsAPI response:', res);
      setStudents(res.data || []);
      setTotalPages(res.totalPages || 1);

      // Fetch parent and class details if needed
      await fetchParentAndClassDetails(res.data || []);
    } catch (err) {
      setStudents([]);
    } finally {
      setLoadingTable(false);
    }
  };

  // Fetch parent and class details
  const fetchParentAndClassDetails = async (studentsList) => {
    try {
      // Collect unique parent IDs and class IDs
      const parentIds = [...new Set(studentsList.map(s => s.parentId).filter(Boolean))];
      const classIds = [...new Set(
        studentsList.flatMap(s => s.classes?.map(c => c.classId) || []).filter(Boolean)
      )];

      // TODO: Fetch parent details from API
      // const parentRes = await getParentsByIdsAPI(parentIds);
      // setParentDetails(parentRes.data || {});

      // TODO: Fetch class details from API
      // const classRes = await getClassesByIdsAPI(classIds);
      // setClassDetails(classRes.data || {});

      // For now, create mock data
      const mockParentDetails = {};
      parentIds.forEach(id => {
        mockParentDetails[id] = { name: `Phụ huynh ${id}` };
      });
      setParentDetails(mockParentDetails);

      const mockClassDetails = {};
      classIds.forEach(id => {
        mockClassDetails[id] = { name: `Lớp ${id}` };
      });
      setClassDetails(mockClassDetails);
    } catch (err) {
      console.error('Error fetching parent and class details:', err);
    }
  };

  useEffect(() => {
    fetchStudents(page);
  }, [page]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Helper function to safely render text content
  const renderText = (text) => {
    if (text === null || text === undefined) return '-';
    if (typeof text === 'object') return '-';
    return String(text);
  };

  // Helper function to format parent display
  const renderParent = (parentId) => {
    if (!parentId) return '-';
    // Nếu có thông tin chi tiết phụ huynh, hiển thị tên
    if (parentDetails[parentId]) {
      return parentDetails[parentId].name || `Phụ huynh #${parentId}`;
    }
    // Nếu không, hiển thị ID với format rõ ràng hơn
    return `Phụ huynh #${parentId}`;
  };

  // Helper function to format class display
  const renderClasses = (classes) => {
    if (!classes || classes.length === 0) return '-';
    return classes.map(cls => {
      // Nếu có thông tin chi tiết lớp, hiển thị tên
      if (classDetails[cls.classId]) {
        return classDetails[cls.classId].name || `Lớp #${cls.classId}`;
      }
      // Nếu không, hiển thị ID với format rõ ràng hơn
      return cls.className || `Lớp #${cls.classId}`;
    }).join(', ');
  };

  return (
    <DashboardLayout role="admin">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <Box sx={commonStyles.pageHeader}>
            <Typography sx={commonStyles.pageTitle}>
              Quản lý học sinh
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

          <Paper sx={commonStyles.searchContainer}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Tìm kiếm học sinh..."
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
                  <InputLabel>Lớp học</InputLabel>
                  <Select
                    label="Lớp học"
                    value={classFilter}
                    onChange={(e) => setClassFilter(e.target.value)}
                    sx={commonStyles.filterSelect}
                  >
                    <MenuItem value="">Tất cả</MenuItem>
                    <MenuItem value="a1">A1</MenuItem>
                    <MenuItem value="a2">A2</MenuItem>
                    <MenuItem value="b1">B1</MenuItem>
                    <MenuItem value="b2">B2</MenuItem>
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
                    <MenuItem value="active">Đang học</MenuItem>
                    <MenuItem value="inactive">Nghỉ học</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>

          <TableContainer component={Paper} sx={commonStyles.tableContainer}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width="18%">Họ và tên</TableCell>
                  <TableCell width="18%">Email</TableCell>
                  <TableCell width="13%">Số điện thoại</TableCell>
                  <TableCell width="15%">Phụ huynh</TableCell>
                  <TableCell width="18%">Lớp học</TableCell>
                  <TableCell width="8%">Giới tính</TableCell>
                  <TableCell width="10%" align="center">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingTable ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">Đang tải...</TableCell>
                  </TableRow>
                ) : students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">Không có dữ liệu</TableCell>
                  </TableRow>
                ) : (
                  students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>{renderText(student.userId?.name)}</TableCell>
                      <TableCell>{renderText(student.userId?.email)}</TableCell>
                      <TableCell>{renderText(student.userId?.phone)}</TableCell>
                      <TableCell>{renderParent(student.parentId)}</TableCell>
                      <TableCell>{renderClasses(student.classes)}</TableCell>
                      <TableCell>
                        {student.userId?.gender === 'male' ? 'Nam' : 'Nữ'}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small">
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small">
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
            <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" />
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
              {selectedStudent ? 'Chỉnh sửa thông tin học sinh' : 'Thêm học sinh mới'}
            </DialogTitle>
            <DialogContent sx={commonStyles.dialogContent}>
              <Grid container spacing={2} sx={commonStyles.formGrid}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Họ và tên" name="name" value={form.name} onChange={handleChange} required sx={commonStyles.formField}
                    error={!!formErrors.name} helperText={formErrors.name} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Email" name="email" type="email" value={form.email} onChange={handleChange} required sx={commonStyles.formField}
                    error={!!formErrors.email} helperText={formErrors.email} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Mật khẩu" name="password" type="password" value={form.password} onChange={handleChange} required sx={commonStyles.formField}
                    error={!!formErrors.password} helperText={formErrors.password} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Ngày sinh"
                    name="dayOfBirth"
                    type="text"
                    value={form.dayOfBirth}
                    onChange={handleChange}
                    required
                    placeholder="12/03/2018"
                    sx={commonStyles.formField}
                    error={!!formErrors.dayOfBirth}
                    helperText={formErrors.dayOfBirth}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Số điện thoại" name="phone" value={form.phone} onChange={handleChange} required sx={commonStyles.formField}
                    error={!!formErrors.phone} helperText={formErrors.phone} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Địa chỉ" name="address" value={form.address} onChange={handleChange} required sx={commonStyles.formField} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth sx={commonStyles.formField}>
                    <InputLabel>Giới tính</InputLabel>
                    <Select label="Giới tính" name="gender" value={form.gender} onChange={handleChange} required>
                      <MenuItem value="male">Nam</MenuItem>
                      <MenuItem value="female">Nữ</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={commonStyles.formActions}>
              <Button onClick={handleCloseDialog} sx={commonStyles.secondaryButton}>
                Hủy
              </Button>
              <Button
                variant="contained"
                sx={commonStyles.primaryButton}
                onClick={handleSubmit}
                disabled={loading}
              >
                {selectedStudent ? 'Cập nhật' : loading ? 'Đang thêm...' : 'Thêm mới'}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default StudentManagement;
