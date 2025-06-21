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
import { commonStyles } from "../../utils/styles";
import DashboardLayout from '../../components/layouts/DashboardLayout';
import AddClassForm from './AddClassForm';
import { createClassAPI, getAllClassesAPI } from '../../services/api';

const ClassManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
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

  const handleOpenDialog = (classData = null) => {
    setSelectedClass(classData);
    setOpenDialog(true);
    setError('');
  };

  const handleCloseDialog = () => {
    setSelectedClass(null);
    setOpenDialog(false);
    setError('');
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
      'inactive': 'Ngừng hoạt động',
      'upcoming': 'Sắp khai giảng',
      'finished': 'Đã kết thúc'
    };
    return statusMap[status] || status;
  };

  // Helper function to get status color
  const getStatusColor = (status) => {
    const colorMap = {
      'active': 'success',
      'inactive': 'default',
      'upcoming': 'warning',
      'finished': 'default'
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
              <Grid item xs={12} md={4}>
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
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Trình độ</InputLabel>
                  <Select
                    label="Trình độ"
                    value={levelFilter}
                    onChange={(e) => setLevelFilter(e.target.value)}
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
              <Grid item xs={12} md={4}>
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
                    <MenuItem value="inactive">Đã kết thúc</MenuItem>
                    <MenuItem value="pending">Chưa khai giảng</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>

          <TableContainer component={Paper} sx={commonStyles.tableContainer}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width="20%">Tên lớp</TableCell>
                  <TableCell width="15%">Giáo viên</TableCell>
                  <TableCell width="10%">Năm học</TableCell>
                  <TableCell width="10%">Số lượng học sinh</TableCell>
                  <TableCell width="15%">Thời gian học</TableCell>
                  <TableCell width="15%">Trạng thái</TableCell>
                  <TableCell width="15%" align="center">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingTable ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">Đang tải...</TableCell>
                  </TableRow>
                ) : classes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">Không có dữ liệu</TableCell>
                  </TableRow>
                ) : (
                  classes.map((cls) => (
                    <TableRow key={cls.id}>
                      <TableCell>{cls.name}</TableCell>
                      <TableCell>
                        {cls.teacherId?.name || cls.teacher?.name || cls.teacherName || 'Chưa gán giáo viên'}
                      </TableCell>
                      <TableCell>{cls.year}</TableCell>
                      <TableCell>{cls.studentCount || 0}/{cls.maxStudents}</TableCell>
                      <TableCell>{formatSchedule(cls.schedule)}</TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(cls.status)}
                          color={getStatusColor(cls.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" title="Xem chi tiết">
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

          {/* Pagination Info */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Hiển thị {classes.length} trong tổng số {totalRecords} lớp học
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
              {selectedClass ? 'Chỉnh sửa thông tin lớp học' : 'Thêm lớp học mới'}
            </DialogTitle>
            <DialogContent sx={commonStyles.dialogContent}>
              {error && (
                <Typography color="error" sx={{ mb: 2 }}>
                  {error}
                </Typography>
              )}
              <AddClassForm onSubmit={handleAddClass} onCancel={handleCloseDialog} />
            </DialogContent>
          </Dialog>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default ClassManagement;
