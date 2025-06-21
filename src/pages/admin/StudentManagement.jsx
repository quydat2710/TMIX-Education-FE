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
import { createStudentAPI, getAllStudentsAPI, getParentByIdAPI, getClassByIdAPI } from '../../services/api';
import { validateStudent } from '../../validations/studentValidation';

const StudentManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [students, setStudents] = useState([]);
  const [loadingTable, setLoadingTable] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [parentDetails, setParentDetails] = useState({});
  const [classDetails, setClassDetails] = useState({});
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    dayOfBirth: '',
    phone: '',
    address: '',
    gender: 'female',
  });

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

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = {
        page: page,
        limit: 10,
        ...(searchQuery && { search: searchQuery })
      };

      const response = await getAllStudentsAPI(params);
      console.log('Students API response:', response);

      if (response && response.data) {
        setStudents(response.data);
        setTotalPages(Math.ceil(response.total / 10));

        // Extract parent and class information directly from response
        const parentMap = {};
        const classMap = {};
        const classIds = new Set();

        response.data.forEach(student => {
          // Extract parent name directly from student object
          if (student.parentId && student.parentId.userId) {
            parentMap[student.id] = student.parentId.userId.name || 'Không có tên';
            console.log(`Student ${student.id}: Parent name = ${student.parentId.userId.name}`);
          } else {
            parentMap[student.id] = 'Không có phụ huynh';
            console.log(`Student ${student.id}: No parent found`);
          }

          // Collect all unique class IDs for API calls
          if (student.classes && student.classes.length > 0) {
            student.classes.forEach(cls => {
              classIds.add(cls.classId);
            });
            console.log(`Student ${student.id}: Classes = ${student.classes.map(c => c.classId).join(', ')}`);
          } else {
            console.log(`Student ${student.id}: No classes`);
          }
        });

        setParentDetails(parentMap);

        // Fetch class details from API
        const classDetailsMap = {};
        for (const classId of classIds) {
          try {
            console.log(`Fetching class with ID: ${classId}`);
            const classRes = await getClassByIdAPI(classId);
            console.log(`Class API response for ${classId}:`, classRes);
            if (classRes && classRes.data && classRes.data.name) {
              classDetailsMap[classId] = classRes.data.name;
              console.log(`Class name for ${classId}:`, classRes.data.name);
            } else {
              classDetailsMap[classId] = 'Không có tên';
              console.log(`No class name found for ${classId}`);
            }
          } catch (err) {
            console.error(`Error fetching class ${classId}:`, err);
            classDetailsMap[classId] = 'Không tìm thấy';
          }
        }
        setClassDetails(classDetailsMap);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents(page);
  }, [page, searchQuery]);

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
  const renderParent = (studentId) => {
    if (!studentId) return '-';
    // Lấy thông tin phụ huynh từ map đã được tạo
    const parentName = parentDetails[studentId];
    if (parentName) {
      return parentName;
    }
    return 'Không có phụ huynh';
  };

  // Helper function to format class display
  const renderClasses = (classes) => {
    if (!classes || classes.length === 0) return 'Chưa đăng ký lớp';

    return classes.map(cls => {
      // Lấy tên lớp từ classDetails map
      const className = classDetails[cls.classId] || `Lớp ${cls.classId}`;
      const status = cls.status === 'active' ? 'Đang học' : 'Đã nghỉ';
      const discount = cls.discountPercent ? ` (Giảm ${cls.discountPercent}%)` : '';
      return `${className}${discount} - ${status}`;
    }).join('\n');
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
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          variant="contained"
                          onClick={() => fetchStudents()}
                          sx={{ minWidth: 'auto', px: 2 }}
                        >
                          Tìm
                        </Button>
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
                    <MenuItem value="active">Đang học</MenuItem>
                    <MenuItem value="inactive">Đã nghỉ học</MenuItem>
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
                      <TableCell>{renderParent(student.id)}</TableCell>
                      <TableCell sx={{ whiteSpace: 'pre-line' }}>{renderClasses(student.classes)}</TableCell>
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
              {error && (
                <Typography color="error" sx={{ mb: 2 }}>
                  {error}
                </Typography>
              )}
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
