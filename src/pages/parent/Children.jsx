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
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  School as SchoolIcon,
  EmojiEvents as EmojiEventsIcon,
  AssignmentLate as AssignmentLateIcon,
  Person as PersonIcon,
  Event as EventIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AttachMoney as AttachMoneyIcon,
  Discount as DiscountIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { COLORS } from "../../utils/colors";
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { commonStyles } from '../../utils/styles';
import StatCard from '../../components/common/StatCard';

// Mock data cho phụ huynh (giống như Dashboard)
const mockParentData = {
  parentId: 'parent-001',
  name: 'Nguyễn Văn A',
  children: [
    {
      id: 'child-001',
      name: 'Nguyễn Thị B',
      age: 12,
      grade: 'Lớp 6',
      dateOfBirth: '15/03/2012',
      avatar: null,
      status: 'active',
      averageScore: 8.5,
      incompleteAssignments: 2,
      classes: [
        {
          classId: 'class-01',
          className: 'Lớp TOEIC 550+',
          teacher: 'Cô Trần Thị C',
          schedule: 'T2-T4-T6, 18:00-19:30',
          totalSessions: 24,
          attendedSessions: 22,
          absentSessions: 2,
          absentDetails: ['Buổi 5 (15/01/2024)', 'Buổi 12 (05/02/2024)'],
          monthlyFee: 1500000,
          discountPercent: 10,
          discountReason: 'Gia đình quen biết',
          paymentStatus: {
            totalOwed: 4500000,
            lastPaidMonth: 'Tháng 12/2023',
            unpaidMonths: ['Tháng 1/2024', 'Tháng 2/2024', 'Tháng 3/2024'],
            discountAmount: 450000,
            finalAmount: 4050000,
          },
          academicPerformance: {
            currentScore: 8.7,
            assignments: 15,
            completedAssignments: 13,
            tests: 5,
            averageTestScore: 8.4
          }
        },
        {
          classId: 'class-02',
          className: 'Tiếng Anh Giao Tiếp Cơ Bản',
          teacher: 'Thầy Lê Văn D',
          schedule: 'T3-T5, 19:00-20:30',
          totalSessions: 16,
          attendedSessions: 15,
          absentSessions: 1,
          absentDetails: ['Buổi 8 (20/01/2024)'],
          monthlyFee: 1200000,
          discountPercent: 0,
          discountReason: null,
          paymentStatus: {
            totalOwed: 2400000,
            lastPaidMonth: 'Tháng 1/2024',
            unpaidMonths: ['Tháng 2/2024', 'Tháng 3/2024'],
            discountAmount: 0,
            finalAmount: 2400000,
          },
          academicPerformance: {
            currentScore: 8.2,
            assignments: 12,
            completedAssignments: 11,
            tests: 3,
            averageTestScore: 8.0
          }
        }
      ]
    },
    {
      id: 'child-002',
      name: 'Nguyễn Văn E',
      age: 10,
      grade: 'Lớp 4',
      dateOfBirth: '22/07/2014',
      avatar: null,
      status: 'active',
      averageScore: 9.1,
      incompleteAssignments: 0,
      classes: [
        {
          classId: 'class-03',
          className: 'Tiếng Anh Thiếu Nhi',
          teacher: 'Cô Phạm Thị F',
          schedule: 'T7-CN, 09:00-11:00',
          totalSessions: 12,
          attendedSessions: 12,
          absentSessions: 0,
          absentDetails: [],
          monthlyFee: 800000,
          discountPercent: 15,
          discountReason: 'Học sinh xuất sắc',
          paymentStatus: {
            totalOwed: 800000,
            lastPaidMonth: 'Tháng 2/2024',
            unpaidMonths: ['Tháng 3/2024'],
            discountAmount: 120000,
            finalAmount: 680000,
          },
          academicPerformance: {
            currentScore: 9.3,
            assignments: 10,
            completedAssignments: 10,
            tests: 4,
            averageTestScore: 9.2
          }
        }
      ]
    }
  ]
};

const Children = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Sử dụng mock data thay vì API
      setLoading(true);
    setTimeout(() => {
      setChildren(mockParentData.children);
        setLoading(false);
    }, 1000);
  }, []);

  const handleOpenDialog = (childData = null) => {
    setSelectedChild(childData);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedChild(null);
    setOpenDialog(false);
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const filteredChildren = children.filter((child) =>
    child.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Tính toán tổng quan
  const summary = {
    totalChildren: children.length,
    totalClasses: children.reduce((total, child) => total + child.classes.length, 0),
    averageScore: children.length > 0 ?
      (children.reduce((total, child) => total + child.averageScore, 0) / children.length).toFixed(1) : 0,
    totalIncompleteAssignments: children.reduce((total, child) => total + child.incompleteAssignments, 0),
    totalOwed: children.reduce((total, child) =>
      total + child.classes.reduce((classTotal, cls) => classTotal + cls.paymentStatus.totalOwed, 0), 0
    ),
  };

  return (
    <DashboardLayout role="parent">
      <Box sx={commonStyles.pageContainer}>
        <Typography variant="h4" gutterBottom>
              Quản lý thông tin con
            </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Xem chi tiết thông tin học tập và tiến độ của con bạn
                  </Typography>

        {/* Stat Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Tổng số con"
              value={summary.totalChildren}
              icon={<PersonIcon sx={{ fontSize: 40 }} />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Tổng số lớp"
              value={summary.totalClasses}
              icon={<SchoolIcon sx={{ fontSize: 40 }} />}
              color="info"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Điểm trung bình"
              value={summary.averageScore}
              icon={<EmojiEventsIcon sx={{ fontSize: 40 }} />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Tổng nợ học phí"
              value={formatCurrency(summary.totalOwed)}
              icon={<AttachMoneyIcon sx={{ fontSize: 40 }} />}
              color="error"
            />
          </Grid>
            </Grid>

        {/* Search */}
        <Paper sx={{ p: 2, mb: 3 }}>
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
        </Paper>

        {/* Children List */}
              {loading ? (
                <LinearProgress />
              ) : (
          <Grid container spacing={3}>
                      {filteredChildren.map((child) => (
              <Grid item xs={12} md={6} key={child.id}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ width: 60, height: 60, mr: 2, bgcolor: 'primary.main' }}>
                        <PersonIcon sx={{ fontSize: 30 }} />
                              </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {child.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {child.age} tuổi - {child.grade} - Sinh ngày: {child.dateOfBirth}
                        </Typography>
                            <Chip
                          label={child.status === 'active' ? 'Đang học' : 'Tạm nghỉ'}
                              color={child.status === 'active' ? 'success' : 'warning'}
                              size="small"
                          sx={{ mt: 1 }}
                        />
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Academic Summary */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Thông tin học tập:
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Điểm trung bình
                          </Typography>
                          <Typography variant="h6" color="primary">
                            {child.averageScore}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Số lớp học
                          </Typography>
                          <Typography variant="h6" color="primary">
                            {child.classes.length}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Bài tập chưa hoàn thành
                          </Typography>
                          <Typography variant="h6" color={child.incompleteAssignments > 0 ? 'error' : 'success'}>
                            {child.incompleteAssignments}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Tổng nợ học phí
                          </Typography>
                          <Typography variant="h6" color="error">
                            {formatCurrency(child.classes.reduce((total, cls) => total + cls.paymentStatus.totalOwed, 0))}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>

                    <Button
                      variant="contained"
                      fullWidth
                              onClick={() => handleOpenDialog(child)}
                      startIcon={<ViewIcon />}
                    >
                      Xem chi tiết
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Detail Dialog */}
          <Dialog
            open={openDialog}
            onClose={handleCloseDialog}
          maxWidth="lg"
            fullWidth
          >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <PersonIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">
                  {selectedChild?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedChild?.age} tuổi - {selectedChild?.grade}
                </Typography>
              </Box>
            </Box>
            </DialogTitle>
          <DialogContent>
            {selectedChild && (
              <Box>
                {/* Classes Information */}
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Danh sách lớp học
                </Typography>

                {selectedChild.classes.map((cls, index) => (
                  <Card key={cls.classId} sx={{ mb: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {cls.className}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Giáo viên:</strong> {cls.teacher}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Lịch học:</strong> {cls.schedule}
                    </Typography>
                        </Box>
                        <Chip
                          label={`${cls.attendedSessions}/${cls.totalSessions} buổi`}
                          color={cls.attendedSessions/cls.totalSessions >= 0.9 ? 'success' : 'warning'}
                        />
                      </Box>

                      <Grid container spacing={2}>
                        {/* Academic Performance */}
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" gutterBottom>
                            Kết quả học tập:
                          </Typography>
                          <List dense>
                            <ListItem>
                              <ListItemIcon>
                                <EmojiEventsIcon color="primary" />
                              </ListItemIcon>
                              <ListItemText
                                primary="Điểm hiện tại"
                                secondary={`${cls.academicPerformance.currentScore}/10`}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemIcon>
                                <SchoolIcon color="primary" />
                              </ListItemIcon>
                              <ListItemText
                                primary="Bài tập"
                                secondary={`${cls.academicPerformance.completedAssignments}/${cls.academicPerformance.assignments} hoàn thành`}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemIcon>
                                <EventIcon color="primary" />
                              </ListItemIcon>
                              <ListItemText
                                primary="Điểm kiểm tra trung bình"
                                secondary={`${cls.academicPerformance.averageTestScore}/10`}
                              />
                            </ListItem>
                          </List>
                      </Grid>

                        {/* Payment Status */}
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" gutterBottom>
                            Tình trạng thanh toán:
                          </Typography>
                          <List dense>
                            <ListItem>
                              <ListItemIcon>
                                <AttachMoneyIcon color="error" />
                              </ListItemIcon>
                              <ListItemText
                                primary="Tổng nợ"
                                secondary={formatCurrency(cls.paymentStatus.totalOwed)}
                              />
                            </ListItem>
                            {cls.paymentStatus.discountAmount > 0 && (
                              <ListItem>
                                <ListItemIcon>
                                  <DiscountIcon color="success" />
                                </ListItemIcon>
                                <ListItemText
                                  primary={`Giảm giá (${cls.discountPercent}%)`}
                                  secondary={`-${formatCurrency(cls.paymentStatus.discountAmount)}`}
                                />
                              </ListItem>
                            )}
                            <ListItem>
                              <ListItemIcon>
                                <AttachMoneyIcon color="primary" />
                              </ListItemIcon>
                              <ListItemText
                                primary="Cần thanh toán"
                                secondary={formatCurrency(cls.paymentStatus.finalAmount)}
                              />
                            </ListItem>
                          </List>
                    </Grid>
                  </Grid>

                      {/* Absent Details */}
                      {cls.absentDetails.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" gutterBottom color="error">
                            Buổi học vắng:
                    </Typography>
                          <List dense>
                            {cls.absentDetails.map((detail, idx) => (
                              <ListItem key={idx}>
                                <ListItemIcon>
                                  <CancelIcon color="error" />
                                </ListItemIcon>
                                <ListItemText primary={detail} />
                              </ListItem>
                            ))}
                          </List>
                                </Box>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Box>
              )}
            </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>
                Đóng
              </Button>
            </DialogActions>
          </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default Children;
