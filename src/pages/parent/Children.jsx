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
  Avatar,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  School as SchoolIcon,
  EmojiEvents as EmojiEventsIcon,
  AssignmentLate as AssignmentLateIcon,
} from '@mui/icons-material';
import { COLORS } from "../../utils/colors";
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { commonStyles } from '../../utils/styles';

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
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <Box sx={commonStyles.pageHeader}>
            <Typography sx={commonStyles.pageTitle}>
              Quản lý thông tin con
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {/* Card thông tin tổng quan */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Thông tin học tập
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SchoolIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Tổng số lớp học
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        {children.reduce((total, child) => total + child.classes.length, 0)} lớp
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <EmojiEventsIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Điểm trung bình
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        {children.reduce((total, child) => total + child.averageScore, 0) / children.length || 0}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AssignmentLateIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Bài tập chưa hoàn thành
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        {children.reduce((total, child) => total + child.incompleteAssignments, 0)} bài
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Danh sách con */}
            <Grid item xs={12} md={8}>
              <Box sx={commonStyles.searchContainer}>
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
                  sx={commonStyles.searchField}
                />
              </Box>

              {loading ? (
                <LinearProgress />
              ) : (
                <TableContainer component={Paper} sx={commonStyles.tableContainer}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Họ tên</TableCell>
                        <TableCell>Ngày sinh</TableCell>
                        <TableCell>Số lớp học</TableCell>
                        <TableCell>Điểm trung bình</TableCell>
                        <TableCell>Trạng thái</TableCell>
                        <TableCell align="center" sx={commonStyles.actionCell}>Thao tác</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredChildren.map((child) => (
                        <TableRow key={child.id} sx={commonStyles.tableRow}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                                {child.name.charAt(0)}
                              </Avatar>
                              {child.name}
                            </Box>
                          </TableCell>
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
          <Dialog
            open={openDialog}
            onClose={handleCloseDialog}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle sx={commonStyles.dialogTitle}>
              Chi tiết học tập
            </DialogTitle>
            <DialogContent sx={commonStyles.dialogContent}>
              {selectedClass && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Thông tin học viên
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">Họ tên:</Typography>
                        <Typography>{selectedClass.name}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">Ngày sinh:</Typography>
                        <Typography>{selectedClass.dateOfBirth}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">Điểm trung bình:</Typography>
                        <Typography>{selectedClass.averageScore}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">Trạng thái:</Typography>
                        <Chip
                          label={selectedClass.status}
                          color={selectedClass.status === 'active' ? 'success' : 'warning'}
                          size="small"
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Danh sách lớp học
                    </Typography>
                    <TableContainer component={Paper} sx={commonStyles.tableContainer}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Tên lớp</TableCell>
                            <TableCell>Giáo viên</TableCell>
                            <TableCell>Lịch học</TableCell>
                            <TableCell>Tiến độ</TableCell>
                            <TableCell align="center" sx={commonStyles.actionCell}>Thao tác</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedClass.classes?.map((classItem) => (
                            <TableRow key={classItem.id} sx={commonStyles.tableRow}>
                              <TableCell>{classItem.name}</TableCell>
                              <TableCell>{classItem.teacher}</TableCell>
                              <TableCell>{classItem.schedule}</TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <LinearProgress
                                    variant="determinate"
                                    value={classItem.progress}
                                    sx={{
                                      width: '100%',
                                      mr: 1,
                                      height: 8,
                                      borderRadius: 4,
                                    }}
                                  />
                                  <Typography variant="body2" color="text.secondary">
                                    {classItem.progress}%
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell align="center">
                                <IconButton
                                  size="small"
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
                </Grid>
              )}
            </DialogContent>
            <DialogActions sx={commonStyles.formActions}>
              <Button onClick={handleCloseDialog} sx={commonStyles.secondaryButton}>
                Đóng
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default Children;
