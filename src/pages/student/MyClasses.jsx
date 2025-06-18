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
} from '@mui/icons-material';
import { COLORS } from "../../utils/colors";
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { commonStyles } from '../../utils/styles';

const MyClasses = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // TODO: Fetch classes data from API
    const fetchClasses = async () => {
      setLoading(true);
      try {
        // const response = await api.get('/student/classes');
        // setClasses(response.data);
      } catch (error) {
        console.error('Error fetching classes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
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

  const filteredClasses = classes.filter((classItem) => {
    const matchesSearch = classItem.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedTab === 0 ? classItem.status === 'ongoing' : classItem.status === 'completed';
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout role="student">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <Typography variant="h4" gutterBottom>
        Lớp học của tôi
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
                  <Typography>{classes.length} lớp</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Lớp đang học:</Typography>
                  <Typography>
                    {classes.filter((c) => c.status === 'ongoing').length} lớp
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Lớp đã hoàn thành:</Typography>
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
            <Tab label="Đang học" />
            <Tab label="Đã hoàn thành" />
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
                    <TableCell>Giáo viên</TableCell>
                    <TableCell>Lịch học</TableCell>
                    <TableCell>Tiến độ</TableCell>
                    <TableCell align="center">Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredClasses.map((classItem) => (
                    <TableRow key={classItem.id}>
                      <TableCell>{classItem.code}</TableCell>
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
                    <Typography variant="subtitle2">Giáo viên:</Typography>
                    <Typography>{selectedClass.teacher}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Lịch học:</Typography>
                    <Typography>{selectedClass.schedule}</Typography>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Tiến độ học tập
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ width: '100%', mr: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={selectedClass.progress}
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
                      {`${Math.round(selectedClass.progress)}%`}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Bài tập gần đây
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Ngày</TableCell>
                        <TableCell>Tên bài tập</TableCell>
                        <TableCell>Trạng thái</TableCell>
                        <TableCell>Điểm</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedClass.recentAssignments?.map((assignment) => (
                        <TableRow key={assignment.id}>
                          <TableCell>{assignment.date}</TableCell>
                          <TableCell>{assignment.name}</TableCell>
                          <TableCell>
                            <Chip
                              label={assignment.status}
                              color={assignment.status === 'completed' ? 'success' : 'warning'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{assignment.score}</TableCell>
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
            Xem bài tập
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
      </Box>
    </DashboardLayout>
  );
};

export default MyClasses;
