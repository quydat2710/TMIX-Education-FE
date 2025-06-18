import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
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
  Button,
  Chip,
  Card,
  CardContent,
  LinearProgress,
  Tabs,
  Tab,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Assignment as AssignmentIcon,
  Grade as GradeIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { COLORS } from "../../utils/colors";
import DashboardLayout from '../../components/layouts/DashboardLayout';

const MyClasses = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openAttendanceDialog, setOpenAttendanceDialog] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);

  useEffect(() => {
    // TODO: Fetch classes data from API
    const fetchClasses = async () => {
      setLoading(true);
      try {
        // const response = await api.get('/teacher/classes');
        // setClasses(response.data);
      } catch (error) {
        console.error('Error fetching classes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleOpenDialog = (classData = null) => {
    setSelectedClass(classData);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedClass(null);
    setOpenDialog(false);
  };

  const handleOpenAttendanceDialog = (classData) => {
    setSelectedClass(classData);
    // TODO: Fetch attendance data from API
    setAttendanceData([
      { id: 1, name: 'Nguyễn Văn A', status: 'present' },
      { id: 2, name: 'Trần Thị B', status: 'absent' },
      { id: 3, name: 'Lê Văn C', status: 'late' },
    ]);
    setOpenAttendanceDialog(true);
  };

  const handleCloseAttendanceDialog = () => {
    setSelectedClass(null);
    setAttendanceData([]);
    setOpenAttendanceDialog(false);
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceData(prev =>
      prev.map(student =>
        student.id === studentId ? { ...student, status } : student
      )
    );
  };

  const handleSaveAttendance = async () => {
    try {
      // TODO: Save attendance data to API
      // await api.post('/teacher/attendance', {
      //   classId: selectedClass.id,
      //   attendance: attendanceData,
      // });
      handleCloseAttendanceDialog();
    } catch (error) {
      console.error('Error saving attendance:', error);
    }
  };

  const filteredClasses = classes.filter((classItem) => {
    const matchesSearch = classItem.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedTab === 0 ? classItem.status === 'ongoing' : classItem.status === 'completed';
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout role="teacher">
      <Box>
        <Typography variant="h4" gutterBottom>
        Lớp học của tôi
      </Typography>
      <Grid container spacing={3}>
        {/* Card thông tin tổng quan */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Thông tin giảng dạy
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Tổng số lớp học:</Typography>
                  <Typography>{classes.length} lớp</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Lớp đang dạy:</Typography>
                  <Typography>
                    {classes.filter((c) => c.status === 'ongoing').length} lớp
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Lớp đã kết thúc:</Typography>
                  <Typography>
                    {classes.filter((c) => c.status === 'completed').length} lớp
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Danh sách lớp học */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Tìm kiếm lớp học..."
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
              </Grid>
            </Grid>
          </Paper>

          <Tabs value={selectedTab} onChange={handleTabChange} sx={{ mb: 2 }}>
            <Tab label="Đang dạy" />
            <Tab label="Đã kết thúc" />
          </Tabs>

          {loading ? (
            <LinearProgress />
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Mã lớp</TableCell>
                    <TableCell>Tên lớp</TableCell>
                    <TableCell>Trình độ</TableCell>
                    <TableCell>Lịch học</TableCell>
                    <TableCell>Số học viên</TableCell>
                    <TableCell align="center">Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredClasses.map((classItem) => (
                    <TableRow key={classItem.id}>
                      <TableCell>{classItem.code}</TableCell>
                      <TableCell>{classItem.name}</TableCell>
                      <TableCell>{classItem.level}</TableCell>
                      <TableCell>{classItem.schedule}</TableCell>
                      <TableCell>{classItem.studentCount}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          onClick={() => handleOpenDialog(classItem)}
                          color="primary"
                        >
                          <ViewIcon />
                        </IconButton>
                        {classItem.status === 'ongoing' && (
                          <IconButton
                            onClick={() => handleOpenAttendanceDialog(classItem)}
                            color="primary"
                          >
                            <CheckCircleIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Grid>
      </Grid>

      {/* Dialog xem chi tiết lớp học */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Chi tiết lớp học
        </DialogTitle>
        <DialogContent>
          {selectedClass && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Thông tin lớp học
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Mã lớp:</Typography>
                    <Typography>{selectedClass.code}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Tên lớp:</Typography>
                    <Typography>{selectedClass.name}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Trình độ:</Typography>
                    <Typography>{selectedClass.level}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Lịch học:</Typography>
                    <Typography>{selectedClass.schedule}</Typography>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Danh sách học viên
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Họ tên</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Số điện thoại</TableCell>
                        <TableCell>Trạng thái</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedClass.students?.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>{student.name}</TableCell>
                          <TableCell>{student.email}</TableCell>
                          <TableCell>{student.phone}</TableCell>
                          <TableCell>
                            <Chip
                              label={student.status}
                              color={student.status === 'active' ? 'success' : 'warning'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Đóng</Button>
          <Button
            variant="contained"
            startIcon={<AssignmentIcon />}
              sx={{ bgcolor: COLORS.primary }}
          >
            Quản lý bài tập
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog điểm danh */}
      <Dialog open={openAttendanceDialog} onClose={handleCloseAttendanceDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Điểm danh - {selectedClass?.name}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Danh sách học viên
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Họ tên</TableCell>
                      <TableCell>Trạng thái</TableCell>
                      <TableCell>Ghi chú</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {attendanceData.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>
                          <FormControl fullWidth size="small">
                            <Select
                              value={student.status}
                              onChange={(e) => handleAttendanceChange(student.id, e.target.value)}
                            >
                              <MenuItem value="present">
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <CheckCircleIcon sx={{ color: 'success.main', mr: 1 }} />
                                  Có mặt
                                </Box>
                              </MenuItem>
                              <MenuItem value="absent">
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <CancelIcon sx={{ color: 'error.main', mr: 1 }} />
                                  Vắng mặt
                                </Box>
                              </MenuItem>
                              <MenuItem value="late">
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <CheckCircleIcon sx={{ color: 'warning.main', mr: 1 }} />
                                  Đi muộn
                                </Box>
                              </MenuItem>
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            size="small"
                            placeholder="Ghi chú"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAttendanceDialog}>Hủy</Button>
          <Button
            variant="contained"
            onClick={handleSaveAttendance}
              sx={{ bgcolor: COLORS.primary }}
          >
            Lưu điểm danh
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
    </DashboardLayout>
  );
};

export default MyClasses;
