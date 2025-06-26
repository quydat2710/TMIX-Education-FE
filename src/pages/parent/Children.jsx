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
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { COLORS } from "../../utils/colors";
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { commonStyles } from '../../utils/styles';
import StatCard from '../../components/common/StatCard';
import { getParentByIdAPI, getClassByIdAPI, getStudentAttendanceAPI, getAttendanceListAPI, getTeacherByIdAPI } from '../../services/api';

const Children = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(false);
  const [classDetails, setClassDetails] = useState({});
  const [attendanceData, setAttendanceData] = useState({});
  const [detailLoading, setDetailLoading] = useState(false);
  const [teacherDetails, setTeacherDetails] = useState({});

  useEffect(() => {
    const fetchParent = async () => {
      setLoading(true);
      try {
        const parentId = localStorage.getItem('parent_id');
        if (parentId) {
          const res = await getParentByIdAPI(parentId);

          if (res) {
            const parentData = res;

            const parentInfo = parentData.userId;

            const childrenList = parentData.studentIds || [];

            // Chuyển đổi cấu trúc dữ liệu để phù hợp với mock data
            const formattedChildren = childrenList.map(child => ({
              id: child.userId.id, // userId
              studentId: child.id, // studentId thực tế
              name: child.userId.name,
              email: child.userId.email,
              age: 0, // Có thể tính từ ngày sinh nếu có
              grade: '', // Sẽ lấy từ API lớp học sau
              dateOfBirth: '',
              avatar: null,
              status: 'active',
              averageScore: 0,
              incompleteAssignments: 0,
              classes: child.classes || [], // Danh sách lớp của học sinh
              // Thông tin chi tiết lớp sẽ được lấy sau khi click vào từng con
            }));

            setChildren(formattedChildren);
          }
        }
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };
    fetchParent();
  }, []);

  const handleOpenDialog = async (childData = null) => {
    setSelectedChild(childData);
    setOpenDialog(true);

    if (childData) {
      setDetailLoading(true);
      try {
        // Lấy thông tin chi tiết lớp học
        const classPromises = childData.classes.map(async (classItem) => {
          try {
            const classRes = await getClassByIdAPI(classItem.classId);
            return {
              classId: classItem.classId,
              classData: classRes?.data || classRes,
              discountPercent: classItem.discountPercent,
              status: classItem.status,
              enrollmentDate: classItem.enrollmentDate
            };
          } catch (err) {
            return {
              classId: classItem.classId,
              classData: null,
              discountPercent: classItem.discountPercent,
              status: classItem.status,
              enrollmentDate: classItem.enrollmentDate
            };
          }
        });

        const classResults = await Promise.all(classPromises);
        const classDetailsMap = {};
        classResults.forEach(result => {
          classDetailsMap[result.classId] = result;
        });
        setClassDetails(classDetailsMap);

        // Lấy thông tin giáo viên cho từng lớp học
        const teacherPromises = classResults
          .filter(result => result.classData?.teacherId)
          .map(async (result) => {
            try {
              const teacherRes = await getTeacherByIdAPI(result.classData.teacherId);
              return {
                classId: result.classId,
                teacherData: teacherRes?.data || teacherRes
              };
            } catch (err) {
              return {
                classId: result.classId,
                teacherData: null
              };
            }
          });

        if (teacherPromises.length > 0) {
          const teacherResults = await Promise.all(teacherPromises);
          const teacherDetailsMap = {};
          teacherResults.forEach(result => {
            teacherDetailsMap[String(result.classId)] = result.teacherData;
          });
          setTeacherDetails(teacherDetailsMap);
        }

        // Lấy thông tin điểm danh của học sinh
        try {
          const attendanceRes = await getStudentAttendanceAPI(childData.studentId || childData.id);
          setAttendanceData(attendanceRes?.data || {});
        } catch (err) {
          setAttendanceData({});
        }

      } catch (err) {
      } finally {
        setDetailLoading(false);
      }
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedChild(null);
    setClassDetails({});
    setAttendanceData({});
    setTeacherDetails({});
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatSchedule = (schedule) => {
    if (!schedule) return 'N/A';

    // Xử lý ngày trong tuần
    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const days = (schedule.dayOfWeeks || [])
      .map(d => dayNames[d])
      .join(', ');

    // Xử lý thời gian
    let timeStr = '';
    if (schedule.timeSlots) {
      timeStr = `${schedule.timeSlots.startTime} - ${schedule.timeSlots.endTime}`;
    }

    // Xử lý ngày bắt đầu và kết thúc
    let dateStr = '';
    if (schedule.startDate && schedule.endDate) {
      const startDate = new Date(schedule.startDate).toLocaleDateString('vi-VN');
      const endDate = new Date(schedule.endDate).toLocaleDateString('vi-VN');
      dateStr = `(${startDate} - ${endDate})`;
    }

    return `${days}${timeStr ? ' | ' + timeStr : ''}${dateStr ? ' ' + dateStr : ''}`;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ p: 3 }}>
          <LinearProgress />
          <Typography sx={{ mt: 2 }}>Đang tải thông tin...</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          Quản lý con cái
        </Typography>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <StatCard
              title="Tổng số con"
              value={children.length}
              icon={<PersonIcon />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatCard
              title="Con đang học"
              value={children.filter(child => child.status === 'active').length}
              icon={<SchoolIcon />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatCard
              title="Tổng số lớp học"
              value={children.reduce((total, child) => total + child.classes.length, 0)}
              icon={<EventIcon />}
              color="info"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatCard
              title="Bài tập chưa hoàn thành"
              value={children.reduce((total, child) => total + child.incompleteAssignments, 0)}
              icon={<AssignmentLateIcon />}
              color="warning"
            />
          </Grid>
        </Grid>

        {/* Children List */}
        {children.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              Chưa có thông tin con cái
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {children.map((child) => (
              <Grid item xs={12} md={6} lg={4} key={child.id}>
                <Card sx={{ height: '100%', ...commonStyles.card }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                        <PersonIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {child.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {child.email}
                        </Typography>
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
                            Email
                          </Typography>
                          <Typography variant="body2" color="primary">
                            {child.email}
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
                            Trạng thái
                          </Typography>
                          <Typography variant="body2" color="success.main">
                            Đang học
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Ngày đăng ký
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {child.classes.length > 0 ?
                              new Date(child.classes[0].enrollmentDate).toLocaleDateString('vi-VN') :
                              'N/A'
                            }
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
                  {selectedChild?.email}
                </Typography>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent>
            {detailLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <Typography>Đang tải thông tin chi tiết...</Typography>
              </Box>
            ) : (
              selectedChild && (
                <Box>
                  {/* Classes Information */}
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Danh sách lớp học
                  </Typography>

                  {selectedChild.classes.map((cls, index) => {
                    const classDetail = classDetails[cls.classId];
                    const classData = classDetail?.classData;
                    const teacherData = teacherDetails[cls.classId]
                      || teacherDetails[cls.classId?.toString()]
                      || Object.values(teacherDetails).find(t => t && t.classes && t.classes.includes(cls.classId));

                    return (
                      <Card key={cls.classId} sx={{ mb: 2 }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {classData?.name || classData?.className || cls.className || `Lớp ${cls.classId}`}
                              </Typography>
                              {teacherData ? (
                                <Typography variant="body2" color="text.secondary">
                                  <strong>Giáo viên:</strong> {teacherData.userId?.name || teacherData.name || 'N/A'}
                                </Typography>
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  <strong>Giáo viên:</strong> Chưa có giáo viên
                                </Typography>
                              )}
                              <Typography variant="body2" color="text.secondary">
                                <strong>Khối:</strong> {classData?.grade || cls.grade || 'N/A'} - Phần {classData?.section || cls.section || 'N/A'} - Năm {classData?.year || 'N/A'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                <strong>Phòng học:</strong> {classData?.room || cls.room || 'N/A'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                <strong>Học phí/buổi:</strong> {classData?.feePerLesson ? formatCurrency(classData.feePerLesson) : cls.feePerLesson ? formatCurrency(cls.feePerLesson) : 'N/A'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                <strong>Số học sinh tối đa:</strong> {classData?.maxStudents || cls.maxStudents || 'N/A'}
                              </Typography>
                              {(classData?.description || cls.description) && (
                                <Typography variant="body2" color="text.secondary">
                                  <strong>Mô tả:</strong> {classData?.description || cls.description}
                                </Typography>
                              )}
                              {(classData?.schedule || cls.schedule) && (
                                <Typography variant="body2" color="text.secondary">
                                  <strong>Lịch học:</strong> {formatSchedule(classData?.schedule || cls.schedule)}
                                </Typography>
                              )}
                              <Typography variant="body2" color="text.secondary">
                                <strong>Ngày đăng ký:</strong> {new Date(cls.enrollmentDate).toLocaleDateString('vi-VN')}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                <strong>Giảm giá:</strong> {cls.discountPercent}%
                              </Typography>
                            </Box>
                            <Chip
                              label={classData?.status === 'active' ? 'Đang học' :
                                     classData?.status === 'upcoming' ? 'Sắp diễn ra' :
                                     classData?.status === 'closed' ? 'Đã kết thúc' :
                                     cls.status === 'active' ? 'Đang học' : 'Tạm nghỉ'}
                              color={classData?.status === 'active' ? 'success' :
                                     classData?.status === 'upcoming' ? 'warning' :
                                     classData?.status === 'closed' ? 'default' :
                                     cls.status === 'active' ? 'success' : 'warning'}
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    );
                  })}

                  {/* Attendance Information */}
                  {attendanceData && attendanceData.attendanceStats && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Thông tin điểm danh
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                          <StatCard
                            title="Tổng số buổi học"
                            value={attendanceData.attendanceStats.totalSessions || 0}
                            icon={<EventIcon />}
                            color="primary"
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <StatCard
                            title="Buổi có mặt"
                            value={attendanceData.attendanceStats.presentSessions || 0}
                            icon={<CheckCircleIcon />}
                            color="success"
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <StatCard
                            title="Buổi vắng"
                            value={attendanceData.attendanceStats.absentSessions || 0}
                            icon={<CancelIcon />}
                            color="error"
                          />
                        </Grid>
                      </Grid>
                      {attendanceData.attendanceStats.lateSessions > 0 && (
                        <Grid item xs={12} md={4} sx={{ mt: 2 }}>
                          <StatCard
                            title="Buổi đi muộn"
                            value={attendanceData.attendanceStats.lateSessions || 0}
                            icon={<ScheduleIcon />}
                            color="warning"
                          />
                        </Grid>
                      )}
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Tỷ lệ điểm danh: {attendanceData.attendanceStats.attendanceRate ?? 0}%
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
              )
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
