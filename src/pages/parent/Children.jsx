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
  MenuItem,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { COLORS } from "../../utils/colors";
import DashboardLayout from '../../components/layouts/DashboardLayout';

const Children = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // TODO: Fetch children data from API
    const fetchChildren = async () => {
      setLoading(true);
      try {
        // const response = await api.get('/parent/children');
        // setChildren(response.data);
      } catch (error) {
        console.error('Error fetching children:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChildren();
  }, []);

  const handleOpenDialog = (classData = null) => {
    setSelectedClass(classData);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedClass(null);
    setOpenDialog(false);
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const filteredChildren = children.filter((child) =>
    child.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout role="parent">
      <Box>
        <Typography variant="h4" gutterBottom>
          Quản lý thông tin con
        </Typography>
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        Quản lý con
      </Typography>

      <Grid container spacing={3}>
        {/* Card thông tin tổng quan */}
        <Grid item xs={12} md={4}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
                Thông tin học tập
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Tổng số lớp học:</Typography>
                  <Typography>
                    {children.reduce((total, child) => total + child.classes.length, 0)} lớp
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Điểm trung bình:</Typography>
                  <Typography>
                    {children.reduce((total, child) => total + child.averageScore, 0) / children.length || 0}
          </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Bài tập chưa hoàn thành:</Typography>
                  <Typography>
                    {children.reduce((total, child) => total + child.incompleteAssignments, 0)} bài
          </Typography>
                </Grid>
              </Grid>
        </CardContent>
      </Card>
        </Grid>

        {/* Danh sách con */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Tìm kiếm con..."
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

          {loading ? (
            <LinearProgress />
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Họ tên</TableCell>
                    <TableCell>Ngày sinh</TableCell>
                    <TableCell>Số lớp học</TableCell>
                    <TableCell>Điểm trung bình</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell align="center">Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredChildren.map((child) => (
                    <TableRow key={child.id}>
                      <TableCell>{child.name}</TableCell>
                      <TableCell>{child.dateOfBirth}</TableCell>
                      <TableCell>{child.classes.length}</TableCell>
                      <TableCell>{child.averageScore}</TableCell>
                      <TableCell>
                        <Chip
                          label={child.status}
                          color={child.status === 'active' ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          onClick={() => handleOpenDialog(child)}
                          color="primary"
                        >
                          <ViewIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Grid>
      </Grid>

      {/* Dialog xem chi tiết */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Chi tiết học tập
        </DialogTitle>
        <DialogContent>
          {selectedClass && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Thông tin học viên
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Họ tên:</Typography>
                    <Typography>{selectedClass.name}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Ngày sinh:</Typography>
                    <Typography>{selectedClass.dateOfBirth}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Điểm trung bình:</Typography>
                    <Typography>{selectedClass.averageScore}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Trạng thái:</Typography>
                    <Typography>{selectedClass.status}</Typography>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Danh sách lớp học
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Tên lớp</TableCell>
                        <TableCell>Giáo viên</TableCell>
                        <TableCell>Lịch học</TableCell>
                        <TableCell>Tiến độ</TableCell>
                        <TableCell align="center">Thao tác</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedClass.classes?.map((classItem) => (
                        <TableRow key={classItem.id}>
                          <TableCell>{classItem.name}</TableCell>
                          <TableCell>{classItem.teacher}</TableCell>
                          <TableCell>{classItem.schedule}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box sx={{ width: '100%', mr: 1 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={classItem.progress}
                                  sx={{
                                    height: 8,
                                    borderRadius: 5,
                                        bgcolor: COLORS.background,
                                    '& .MuiLinearProgress-bar': {
                                          bgcolor: COLORS.primary,
                                    },
                                  }}
                                />
                              </Box>
                              <Box sx={{ minWidth: 35 }}>
                                <Typography variant="body2" color="text.secondary">
                                  {`${Math.round(classItem.progress)}%`}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              onClick={() => handleOpenDialog(classItem)}
                              color="primary"
                            >
                              <ViewIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Điểm danh gần đây
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Ngày</TableCell>
                        <TableCell>Lớp</TableCell>
                        <TableCell>Trạng thái</TableCell>
                        <TableCell>Ghi chú</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedClass.attendance?.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{record.date}</TableCell>
                          <TableCell>{record.className}</TableCell>
                          <TableCell>
                            <Chip
                              label={record.status}
                              color={
                                record.status === 'present'
                                  ? 'success'
                                  : record.status === 'late'
                                  ? 'warning'
                                  : 'error'
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{record.note}</TableCell>
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
            startIcon={<ScheduleIcon />}
                sx={{ bgcolor: COLORS.primary }}
          >
            Xem lịch học
          </Button>
          <Button
            variant="contained"
            startIcon={<AssignmentIcon />}
                sx={{ bgcolor: COLORS.primary }}
          >
            Xem bài tập
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
      </Box>
    </DashboardLayout>
  );
};

export default Children;
