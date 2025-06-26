import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Tooltip,
  CardActions,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  Event as EventIcon,
  School as SchoolIcon,
  DoneAll as DoneAllIcon,
  HourglassEmpty as HourglassEmptyIcon,
  WatchLater as WatchLaterIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import { commonStyles } from '../../utils/styles';
import { useAuth } from '../../contexts/AuthContext';
import {
  getTeacherScheduleAPI,
  getClassByIdAPI,
  getStudentsInClassAPI,
} from '../../services/api';
import ClassDetailModal from './components/ClassDetailModal';
import AttendanceModal from './components/AttendanceModal';
import AttendanceHistoryModal from './components/AttendanceHistoryModal';

function formatSchedule(schedule) {
  if (!schedule) return '';
  const days = (schedule.dayOfWeeks || [])
    .map(d => ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d])
    .join(', ');
  const time = schedule.timeSlots
    ? `${schedule.timeSlots.startTime} - ${schedule.timeSlots.endTime}`
    : '';
  return `${days}${time ? ' | ' + time : ''}`;
}

const MyClasses = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [myClasses, setMyClasses] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [studentsList, setStudentsList] = useState([]);

  // Fetch danh sách lớp dạy
  useEffect(() => {
    const fetchClasses = async () => {
      if (!user?.teacherId) return;
      setLoading(true);
      try {
        const scheduleRes = await getTeacherScheduleAPI(user.teacherId);
        const classIds = scheduleRes?.data?.classes?.map(cls => cls.id) || [];

        const detailedClasses = [];
        for (const classId of classIds) {
          try {
            const classRes = await getClassByIdAPI(classId);
            if (classRes?.data) {
              detailedClasses.push(classRes.data);
            }
          } catch (err) {
            console.error(`Không thể tải thông tin lớp học ${classId}:`, err);
          }
        }

        setMyClasses(detailedClasses);
      } catch (err) {
        setNotification({ open: true, message: 'Không thể tải danh sách lớp dạy', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, [user?.teacherId]);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleOpenDetail = (classItem) => {
    setSelectedClass(classItem);
    setDetailModalOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailModalOpen(false);
    setSelectedClass(null);
  };

  const handleOpenAttendance = (classItem) => {
    setSelectedClass(classItem);
    setAttendanceModalOpen(true);
  };

  const handleCloseAttendance = () => {
    setAttendanceModalOpen(false);
    setSelectedClass(null);
  };

  const handleOpenHistory = async (classItem) => {
    setSelectedClass(classItem);
    // Lấy danh sách học sinh của lớp
    try {
      const res = await getStudentsInClassAPI(classItem.id, { limit: 100, page: 1 });
      setStudentsList(res?.data?.students || []);
      setHistoryModalOpen(true); // Chỉ mở modal sau khi đã có studentsList
    } catch (err) {
      setStudentsList([]);
      setHistoryModalOpen(true); // Vẫn mở modal nếu lỗi, nhưng studentsList rỗng
    }
  };

  const handleCloseHistory = () => {
    setHistoryModalOpen(false);
    setSelectedClass(null);
  };

  // Filter classes based on search and tab
  const filteredClasses = useMemo(() => {
    let filtered = myClasses.filter(classItem =>
      classItem.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const statusFilters = ['active', 'upcoming', 'closed'];
    if (selectedTab < statusFilters.length) {
      filtered = filtered.filter(classItem => classItem.status === statusFilters[selectedTab]);
    }

    return filtered;
  }, [myClasses, searchQuery, selectedTab]);

  const statusMap = {
    active: { label: 'Đang dạy', color: 'success' },
    upcoming: { label: 'Sắp diễn ra', color: 'warning' },
    closed: { label: 'Đã kết thúc', color: 'default' },
  };

  return (
    <DashboardLayout>
      <Box sx={commonStyles.container}>
        <Typography variant="h4" component="h1" gutterBottom sx={commonStyles.pageTitle}>
        Lớp học của tôi
      </Typography>

        {/* Stat Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Tổng số lớp"
              value={myClasses.length}
              icon={<SchoolIcon sx={{ fontSize: 40 }} />}
              color="primary"
            />
                </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Đang dạy"
              value={myClasses.filter(c => c.status === 'active').length}
              icon={<HourglassEmptyIcon sx={{ fontSize: 40 }} />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Sắp diễn ra"
              value={myClasses.filter(c => c.status === 'upcoming').length}
              icon={<WatchLaterIcon sx={{ fontSize: 40 }} />}
              color="warning"
            />
                </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Lớp đã kết thúc"
              value={myClasses.filter(c => c.status === 'closed').length}
              icon={<DoneAllIcon sx={{ fontSize: 40 }} />}
              color="primary"
            />
              </Grid>
        </Grid>

        {/* Search and Tabs */}
          <Paper sx={{ p: 2, mb: 3 }}>
                <TextField
                  fullWidth
            placeholder="Tìm kiếm theo tên lớp học..."
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

        <Tabs value={selectedTab} onChange={handleTabChange} sx={{ mb: 2 }} variant="fullWidth">
          <Tab label="Đang dạy" />
          <Tab label="Sắp diễn ra" />
            <Tab label="Đã kết thúc" />
          </Tabs>

        {/* Class Cards Grid */}
        <Grid container spacing={3}>
          {filteredClasses.map((classItem) => (
            <Grid item xs={12} sm={6} md={4} key={classItem.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Chip
                    label={statusMap[classItem.status]?.label || 'Không xác định'}
                    color={statusMap[classItem.status]?.color || 'default'}
                    size="small"
                    sx={{ mb: 1.5 }}
                  />
                  <Typography variant="h6" component="div" gutterBottom>
                    {classItem.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', mb: 1 }}>
                    <PeopleIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2">Khối {classItem.grade} - Phần {classItem.section}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', mb: 1 }}>
                    <EventIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2">{formatSchedule(classItem.schedule)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', mb: 2 }}>
                    <SchoolIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2">Phòng {classItem.room}</Typography>
                  </Box>
                    <Box>
                    <Typography variant="body2" color="text.secondary">Học phí: {classItem.feePerLesson?.toLocaleString('vi-VN')} VNĐ/buổi</Typography>
                    </Box>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => handleOpenDetail(classItem)}>Xem chi tiết</Button>
                  {classItem.status === 'active' && (
                      <Tooltip title="Điểm danh buổi học hôm nay">
                        <Button
                          size="small"
                          startIcon={<AssignmentIcon />}
                          onClick={() => handleOpenAttendance(classItem)}
                        >
                          Điểm danh
                        </Button>
                      </Tooltip>
                  )}
                  {(classItem.status === 'active' || classItem.status === 'closed') && (
                      <Tooltip title="Xem lịch sử điểm danh">
                        <Button
                          size="small"
                          startIcon={<HistoryIcon />}
                          onClick={() => handleOpenHistory(classItem)}
                        >
                          Lịch sử điểm danh
                        </Button>
                      </Tooltip>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {filteredClasses.length === 0 && (
          <Typography sx={{ textAlign: 'center', mt: 4 }}>
            Không tìm thấy lớp học nào.
          </Typography>
        )}

        {/* Modals */}
        <ClassDetailModal
          open={detailModalOpen}
          onClose={handleCloseDetail}
          classData={selectedClass}
        />

        <AttendanceModal
          open={attendanceModalOpen}
          onClose={handleCloseAttendance}
          classData={selectedClass}
        />

        <AttendanceHistoryModal
          open={historyModalOpen}
          onClose={handleCloseHistory}
          classData={selectedClass}
          studentsList={studentsList}
        />

        {/* Notification Snackbar */}
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={() => setNotification({ ...notification, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={() => setNotification({ ...notification, open: false })} severity={notification.severity} sx={{ width: '100%' }}>
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </DashboardLayout>
  );
};

export default MyClasses;
