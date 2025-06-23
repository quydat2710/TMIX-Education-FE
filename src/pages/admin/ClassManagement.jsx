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
import AddClassForm from './AddClassForm';
import { createClassAPI, getAllClassesAPI, updateClassAPI, getClassByIdAPI, getStudentsInClassAPI } from '../../services/api';
import ClassTeacherManagement from './ClassTeacherManagement';
import ClassStudentManagement from './ClassStudentManagement';

const CustomTabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const ClassManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [classes, setClasses] = useState([]);
  const [loadingTable, setLoadingTable] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedClassForView, setSelectedClassForView] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [classStudents, setClassStudents] = useState([]);
  const [classStudentsLoading, setClassStudentsLoading] = useState(false);
  const [classStudentsError, setClassStudentsError] = useState('');
  const [classStudentCounts, setClassStudentCounts] = useState({});

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleOpenDialog = (classData = null) => {
    setSelectedClass(classData);
    setOpenDialog(true);
    setError('');
    setCurrentTab(0); // Reset to the first tab whenever dialog opens
  };

  const handleCloseDialog = () => {
    setSelectedClass(null);
    setOpenDialog(false);
    setError('');
  };

  const handleOpenViewDialog = (classData) => {
    setSelectedClassForView(classData);
    setOpenViewDialog(true);
    // Fetch students for this class
    fetchClassStudents(classData.id);
  };

  const handleCloseViewDialog = () => {
    setSelectedClassForView(null);
    setOpenViewDialog(false);
    setClassStudents([]);
    setClassStudentsError('');
  };

  const handleAddClass = async (data) => {
    setLoading(true);
    setError('');

    try {
      console.log('Dữ liệu gửi lên API:', data);
      await createClassAPI(data);
      handleCloseDialog();
      setPage(1); // Go back to first page to see the new class
      fetchClasses(1); // Refresh class list from first page
    } catch (err) {
      setError(err?.response?.data?.message || 'Có lỗi xảy ra khi thêm lớp học');
    } finally {
      setLoading(false);
    }
  };

  const handleForceRefresh = async () => {
    if (!selectedClass) return;
    try {
      const res = await getClassByIdAPI(selectedClass.id);
      setSelectedClass(res.data); // Update the state with the latest class data
    } catch (error) {
      console.error("Failed to refresh class data:", error);
    }
  };

  const fetchClassStudents = async (classId) => {
    setClassStudentsLoading(true);
    setClassStudentsError('');
    try {
      const params = { page: 1, limit: 100 }; // Get all students
      const res = await getStudentsInClassAPI(classId, params);
      console.log('Class students response:', res);

      if (res.data && res.data.students) {
        setClassStudents(res.data.students);
      } else {
        setClassStudents([]);
      }
    } catch (err) {
      console.error('Error fetching class students:', err);
      setClassStudentsError(err?.response?.data?.message || 'Có lỗi xảy ra khi tải danh sách học sinh');
      setClassStudents([]);
    } finally {
      setClassStudentsLoading(false);
    }
  };

  const fetchAllClassStudentCounts = async (classList) => {
    const counts = {};
    for (const cls of classList) {
      try {
        const params = { page: 1, limit: 1 }; // Just get count
        const res = await getStudentsInClassAPI(cls.id, params);
        if (res.data && res.data.pagination) {
          counts[cls.id] = res.data.pagination.totalResults;
        } else {
          counts[cls.id] = 0;
        }
      } catch (err) {
        console.error(`Error fetching student count for class ${cls.id}:`, err);
        counts[cls.id] = 0;
      }
    }
    setClassStudentCounts(counts);
  };

  const handleUpdateClass = async (data) => {
    if (!selectedClass) return;
    setLoading(true);
    setError('');
    try {
      await updateClassAPI(selectedClass.id, data);
      handleCloseDialog();
      fetchClasses(page); // Refresh class list
    } catch (err) {
      setError(err?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật lớp học');
    } finally {
      setLoading(false);
    }
  };

  // Fetch classes from API
  const fetchClasses = async (pageNum = 1) => {
    setLoadingTable(true);
    try {
      const params = { page: pageNum, limit: 10 };
      const res = await getAllClassesAPI(params);
      console.log('API getAllClassesAPI response:', res);
      console.log('Classes data:', res.data);
      if (res.data && res.data.length > 0) {
        console.log('First class data structure:', res.data[0]);
      }
      setClasses(res.data || []);
      setTotalPages(res.totalPages || 1);
      setTotalRecords(res.totalRecords || 0);

      // Fetch student counts for all classes
      if (res.data && res.data.length > 0) {
        fetchAllClassStudentCounts(res.data);
      }
    } catch (err) {
      console.error('Error fetching classes:', err);
      setClasses([]);
    } finally {
      setLoadingTable(false);
    }
  };

  // Fetch classes on component mount and when page changes
  useEffect(() => {
    fetchClasses(page);
  }, [page]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Helper function to format schedule display
  const formatSchedule = (schedule) => {
    if (!schedule) return '-';

    const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const selectedDays = schedule.dayOfWeeks?.map(day => daysOfWeek[day]).join(', ') || '';
    const timeSlot = schedule.timeSlots ?
      `${schedule.timeSlots.startTime} - ${schedule.timeSlots.endTime}` : '';

    return `${selectedDays} | ${timeSlot}`;
  };

  // Helper function to get status label
  const getStatusLabel = (status) => {
    const statusMap = {
      'active': 'Đang hoạt động',
      'upcoming': 'Sắp khai giảng',
      'closed': 'Đã đóng'
    };
    return statusMap[status] || status;
  };

  // Helper function to get status color
  const getStatusColor = (status) => {
    const colorMap = {
      'active': 'success',
      'upcoming': 'warning',
      'closed': 'error'
    };
    return colorMap[status] || 'default';
  };

  return (
    <DashboardLayout role="admin">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <Box sx={commonStyles.pageHeader}>
            <Typography sx={commonStyles.pageTitle}>
          Quản lý lớp học
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
              sx={commonStyles.primaryButton}
        >
          Thêm lớp học
        </Button>
      </Box>

          <Paper sx={commonStyles.searchContainer}>
        <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm lớp học..."
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
                <MenuItem value="upcoming">Sắp khai giảng</MenuItem>
                <MenuItem value="closed">Đã đóng</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

          <TableContainer component={Paper} sx={commonStyles.tableContainer}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width="10%">Tên lớp</TableCell>
              <TableCell width="15%">Giáo viên</TableCell>
              <TableCell width="10%">Năm học</TableCell>
              <TableCell width="10%">Học phí mỗi buổi</TableCell>
              <TableCell width="20%">Thời gian học</TableCell>
              <TableCell width="10%">Phòng học</TableCell>
              <TableCell width="10%">Trạng thái</TableCell>
              <TableCell width="15%" align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loadingTable ? (
              <TableRow>
                <TableCell colSpan={8} align="center">Đang tải...</TableCell>
              </TableRow>
            ) : classes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">Không có dữ liệu</TableCell>
              </TableRow>
            ) : (
              classes.map((cls) => (
                <TableRow key={cls.id}>
                  <TableCell>{cls.name}</TableCell>
                  <TableCell>
                    {cls.teacherId?.name || cls.teacher?.name || cls.teacherName || 'Chưa gán giáo viên'}
                  </TableCell>
                  <TableCell>{cls.year}</TableCell>
                  <TableCell>
                    {cls.feePerLesson ? `${cls.feePerLesson.toLocaleString('vi-VN')} VNĐ` : 'Chưa cập nhật'}
                  </TableCell>
                  <TableCell>{formatSchedule(cls.schedule)}</TableCell>
                  <TableCell>{cls.room || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(cls.status)}
                      color={getStatusColor(cls.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" title="Xem chi tiết" onClick={() => handleOpenViewDialog(cls)}>
                      <ViewIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" title="Chỉnh sửa" onClick={() => handleOpenDialog(cls)}>
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

          <Dialog
            open={openDialog}
            onClose={handleCloseDialog}
            maxWidth="sm"
            PaperProps={{
              sx: { borderRadius: 2, width: '70%' }
            }}
          >
            <DialogTitle sx={{ ...commonStyles.dialogTitle, textAlign: 'center' }}>
          {selectedClass ? 'Chỉnh sửa thông tin lớp học' : 'Thêm lớp học mới'}
        </DialogTitle>

            {selectedClass ? (
              // EDIT MODE: Show Tabs
              <>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs value={currentTab} onChange={handleTabChange} aria-label="class details tabs" centered>
                    <Tab label="Thông tin chung" />
                    <Tab label="Giáo viên" />
                    <Tab label="Học sinh" />
                  </Tabs>
                </Box>
                <DialogContent sx={{ p: 3, overflow: 'auto' }}>
                  {error && (
                    <Typography color="error" sx={{ mb: 2, p: 2, pb: 0 }}>
                      {error}
                    </Typography>
                  )}
                  <CustomTabPanel value={currentTab} index={0}>
                    <AddClassForm
                      classData={selectedClass}
                      onSubmit={handleUpdateClass}
                      loading={loading}
                    />
                  </CustomTabPanel>
                  <CustomTabPanel value={currentTab} index={1}>
                    <ClassTeacherManagement
                      classData={selectedClass}
                      onUpdate={handleForceRefresh}
                    />
                  </CustomTabPanel>
                  <CustomTabPanel value={currentTab} index={2}>
                    <ClassStudentManagement
                      classData={selectedClass}
                      onUpdate={handleForceRefresh}
                    />
                  </CustomTabPanel>
                </DialogContent>
              </>
            ) : (
              // ADD MODE: Show only the form
              <DialogContent>
              {error && (
                <Typography color="error" sx={{ mb: 2 }}>
                  {error}
                </Typography>
              )}
                <AddClassForm
                  classData={null}
                  onSubmit={handleAddClass}
                  loading={loading}
                />
        </DialogContent>
            )}

            <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
                <Button onClick={handleCloseDialog} color="secondary" variant="outlined">
                    Hủy
                </Button>
                {/* Show button only for General Info tab in Edit mode, or always in Add mode */}
                {(currentTab === 0 || !selectedClass) && (
                    <Button
                    type="submit"
                    form="class-form"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    >
                    {loading ? 'Đang xử lý...' : (selectedClass ? 'Lưu thay đổi' : 'Thêm mới')}
                    </Button>
                )}
            </DialogActions>
      </Dialog>

      {/* View Class Details Dialog */}
      <Dialog
        open={openViewDialog}
        onClose={handleCloseViewDialog}
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: '90vh'
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
            Chi tiết lớp học
          </Typography>
              <Typography sx={{ mt: 0.25, fontWeight: 'bold', fontSize: '1.3rem', color: 'black' }}>
                Thông tin lớp học
            </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3, overflow: 'auto' }}>
          {selectedClassForView && (
              <Grid container spacing={3}>
                {/* Left Column - Basic Info */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2.5, borderRadius: 1.5, height: '100%', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
                    <Typography variant="subtitle1" sx={{ mb: 2, color: COLORS.primary, fontWeight: 600, borderBottom: `1px solid ${COLORS.primary}`, pb: 0.5 }}>
                      Thông tin cơ bản
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Box>
                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.25 }}>
                          Tên lớp
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: COLORS.primary }}>
                          {selectedClassForView.name}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.25 }}>
                          Giáo viên phụ trách
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {selectedClassForView.teacherId?.name || selectedClassForView.teacher?.name || selectedClassForView.teacherName || 'Chưa gán giáo viên'}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.25 }}>
                          Năm học
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {selectedClassForView.year}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.25 }}>
                          Khối
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          Khối {selectedClassForView.grade}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.25 }}>
                          Phòng học
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {selectedClassForView.room || 'Chưa có'}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>

                {/* Right Column - Statistics */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2.5, borderRadius: 1.5, height: '100%', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
                    <Typography variant="subtitle1" sx={{ mb: 2, color: COLORS.primary, fontWeight: 600, borderBottom: `1px solid ${COLORS.primary}`, pb: 0.5 }}>
                      Thống kê lớp học
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Box sx={{
                        p: 1.5,
                        borderRadius: 1.5,
                        background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                        border: '1px solid #2196f3'
                      }}>
                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.25 }}>
                          Số lượng học sinh
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2' }}>
                          {classStudentsLoading ? 'Đang tải...' : classStudents.length}/{selectedClassForView.maxStudents || 30}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Tối đa {selectedClassForView.maxStudents || 30} học sinh
                        </Typography>
                      </Box>

                      <Box sx={{
                        p: 1.5,
                        borderRadius: 1.5,
                        background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
                        border: '1px solid #9c27b0'
                      }}>
                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.25 }}>
                          Học phí mỗi buổi
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#7b1fa2' }}>
                          {selectedClassForView.feePerLesson ? `${selectedClassForView.feePerLesson.toLocaleString('vi-VN')} VNĐ` : 'Chưa cập nhật'}
                        </Typography>
                      </Box>

                      <Box sx={{
                        p: 1.5,
                        borderRadius: 1.5,
                        background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
                        border: '1px solid #4caf50'
                      }}>
                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.25 }}>
                          Thời gian học
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#2e7d32' }}>
                          {formatSchedule(selectedClassForView.schedule)}
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
                    background: `linear-gradient(90deg, ${getStatusColor(selectedClassForView.status) === 'success' ? '#e8f5e8' : getStatusColor(selectedClassForView.status) === 'warning' ? '#fff3e0' : '#ffebee'}, transparent)`,
                    border: `1px solid ${getStatusColor(selectedClassForView.status) === 'success' ? '#4caf50' : getStatusColor(selectedClassForView.status) === 'warning' ? '#ff9800' : '#f44336'}`
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Trạng thái lớp học
                      </Typography>
                      <Chip
                        label={getStatusLabel(selectedClassForView.status)}
                        color={getStatusColor(selectedClassForView.status)}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                  </Box>
                </Grid>

                {/* Full Width - Schedule Details */}
                {selectedClassForView.schedule && (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 1, borderRadius: 1.5, boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
                      <Typography variant="subtitle1" sx={{ mb: 2, color: COLORS.primary, fontWeight: 600, borderBottom: `1px solid ${COLORS.primary}`, pb: 0.5 }}>
                        Lịch học chi tiết
                      </Typography>

                      <Grid container spacing={2}>
                        <Grid item xs={12} md={2.8}>
                          <Box sx={{ textAlign: 'center', p: 1, borderRadius: 1.5, bgcolor: '#fff3e0', border: '1px solid #ff9800' }}>
                            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                              Ngày bắt đầu
                            </Typography>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#e65100' }}>
                              {selectedClassForView.schedule.startDate ? new Date(selectedClassForView.schedule.startDate).toLocaleDateString('vi-VN') : 'Chưa có'}
                            </Typography>
                          </Box>
            </Grid>

                        <Grid item xs={12} md={2.8}>
                          <Box sx={{ textAlign: 'center', p: 1, borderRadius: 1.5, bgcolor: '#e8f5e8', border: '1px solid #4caf50' }}>
                            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                              Ngày kết thúc
                            </Typography>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#2e7d32' }}>
                              {selectedClassForView.schedule.endDate ? new Date(selectedClassForView.schedule.endDate).toLocaleDateString('vi-VN') : 'Chưa có'}
                            </Typography>
                          </Box>
            </Grid>

                        <Grid item xs={12} md={3.4}>
                          <Box sx={{ textAlign: 'center', p: 1, borderRadius: 1.5, bgcolor: '#e3f2fd', border: '1px solid #2196f3' }}>
                            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                              Thời gian
                            </Typography>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1976d2' }}>
                              {selectedClassForView.schedule.timeSlots ? `${selectedClassForView.schedule.timeSlots.startTime} - ${selectedClassForView.schedule.timeSlots.endTime}` : 'Chưa có'}
                            </Typography>
                          </Box>
            </Grid>

                        <Grid item xs={12} md={3}>
                          <Box sx={{ textAlign: 'center', p: 1, borderRadius: 1.5, bgcolor: '#f3e5f5', border: '1px solid #9c27b0' }}>
                            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                              Ngày trong tuần
                            </Typography>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#7b1fa2' }}>
                              {selectedClassForView.schedule.dayOfWeeks ? selectedClassForView.schedule.dayOfWeeks.map(day => ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][day]).join(', ') : 'Chưa có'}
                            </Typography>
                          </Box>
            </Grid>
            </Grid>
                    </Paper>
            </Grid>
                )}

                {/* Description */}
                {selectedClassForView.description && (
            <Grid item xs={12}>
                    <Paper sx={{ p: 2.5, borderRadius: 1.5, boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
                      <Typography variant="subtitle1" sx={{ mb: 2, color: COLORS.primary, fontWeight: 600, borderBottom: `1px solid ${COLORS.primary}`, pb: 0.5 }}>
                        Mô tả lớp học
                      </Typography>
                      <Typography variant="body2" sx={{ lineHeight: 1.5, color: 'text.primary' }}>
                        {selectedClassForView.description}
                      </Typography>
                    </Paper>
            </Grid>
                )}

                {/* Students List */}
                <Grid item xs={12}>
                  <Paper sx={{ p: 2.5, borderRadius: 1.5, boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
                    <Typography variant="subtitle1" sx={{ mb: 2, color: COLORS.primary, fontWeight: 600, borderBottom: `1px solid ${COLORS.primary}`, pb: 0.5 }}>
                      Danh sách học sinh ({classStudents.length})
                    </Typography>

                    {classStudentsLoading ? (
                      <Box sx={{ textAlign: 'center', py: 3 }}>
                        <Typography variant="body2" color="textSecondary">
                          Đang tải danh sách học sinh...
                        </Typography>
                      </Box>
                    ) : classStudentsError ? (
                      <Box sx={{ textAlign: 'center', py: 3 }}>
                        <Typography variant="body2" color="error">
                          {classStudentsError}
                        </Typography>
                      </Box>
                    ) : classStudents.length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 3 }}>
                        <Typography variant="body2" color="textSecondary">
                          Chưa có học sinh nào trong lớp này
                        </Typography>
                      </Box>
                    ) : (
                      <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                        <Grid container spacing={1}>
                          {classStudents.map((student, index) => (
                            <Grid item xs={12} sm={6} md={4} key={student.id}>
                              <Box sx={{
                                p: 1.5,
                                borderRadius: 1,
                                border: '1px solid #e0e0e0',
                                background: 'linear-gradient(135deg, #f5f5f5 0%, #eeeeee 100%)',
                                '&:hover': {
                                  background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                                  borderColor: '#2196f3'
                                }
                              }}>
                                <Typography variant="body2" sx={{ fontWeight: 500, color: '#1976d2' }}>
                                  {index + 1}. {student.name}
                                </Typography>
                              </Box>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}
                  </Paper>
                </Grid>
          </Grid>
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

export default ClassManagement;
