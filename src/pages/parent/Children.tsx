import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Avatar,
  Chip, LinearProgress, Alert, Button,
  Dialog, DialogContent, Divider, Collapse, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
} from '@mui/material';
import {
  FamilyRestroom as FamilyIcon, School as SchoolIcon, Person as PersonIcon,
  TrendingUp as TrendingUpIcon, Class as ClassIcon,
      Schedule as ScheduleIcon, Description as DescriptionIcon,
    Percent as PercentIcon, CheckCircle as CheckCircleIcon, Cancel as CancelIcon,
    Close as CloseIcon, AttachMoney as AttachMoneyIcon, Event as EventIcon, AssignmentLate as AssignmentLateIcon,
    ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon, MeetingRoom as RoomIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { getParentByIdAPI } from '../../services/parents';
import { getClassByIdAPI } from '../../services/classes';
import { getStudentByIdAPI } from '../../services/students';
import { getSessionsByStudentAPI } from '../../services/sessions';
import { commonStyles } from '../../utils/styles';
import StatCard from '../../components/common/StatCard';
import { motion } from 'framer-motion';

interface ChildClass {
  id?: string;
  name: string;
  teacher?: string;
  schedule?: any;
  status: string;
  grade?: string;
  section?: string;
  attendanceRate?: number;
  progress?: number;
}

interface Child {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  grade?: string;
  section?: string;
  totalClasses: number;
  activeClasses: number;
  completedClasses: number;
  attendanceRate: number;
  classes: ChildClass[];
  attendanceStats?: {
    totalSessions: number;
    presentSessions: number;
    absentSessions: number;
    lateSessions: number;
  };
  detailedAttendance?: any[];
}

interface ChildrenData {
  children: Child[];
  totalChildren: number;
  totalClasses: number;
  activeClasses: number;
  completedClasses: number;
}

const Children: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [childrenData, setChildrenData] = useState<ChildrenData>({
    children: [],
    totalChildren: 0,
    totalClasses: 0,
    activeClasses: 0,
    completedClasses: 0
  });
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [childDetailsOpen, setChildDetailsOpen] = useState<boolean>(false);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const [classDetails, setClassDetails] = useState<Record<string, any>>({});
  const [attendanceData, setAttendanceData] = useState<any>({});
  const [expandedClasses, setExpandedClasses] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (user) {
      fetchChildrenData();
    }
  }, [user]);

  const fetchChildrenData = async (): Promise<void> => {
    try {
      setLoading(true);
      const parentId = (user as any)?.parentId || localStorage.getItem('parent_id') || user?.id || '';
      const res = await getParentByIdAPI(String(parentId));
      const parentPayload = (res as any)?.data?.data ?? (res as any)?.data;
      const students = Array.isArray(parentPayload?.students) ? parentPayload.students : [];
      // Fetch each student details to get academic info and class ids
      const detailed = await Promise.all(students.map(async (s: any) => {
        try {
          const det = await getStudentByIdAPI(String(s.id));
          // eslint-disable-next-line no-console
          console.log('[Children] GET /students/:id raw response for', s.id, det);
          const payload: any = (det as any)?.data?.data || (det as any)?.data || det || {};
          // eslint-disable-next-line no-console
          console.log('[Children] Parsed student payload for', s.id, payload);
          const rawClasses: any[] = Array.isArray(payload?.classes) ? payload.classes
            : Array.isArray(payload?.enrolledClasses) ? payload.enrolledClasses
            : Array.isArray(payload?.classIds) ? payload.classIds.map((id: any) => ({ classId: id }))
            : [];
          // Normalize class entries: API returns {discountPercent, class: {...}, isActive}
          const classes = rawClasses.map((c: any) => {
            // If class data is nested under 'class' property
            const classData = c.class || c;
            const rawStatus = String(classData.status || '').toLowerCase();
            const isExplicitlyInactive = ['closed', 'completed', 'đã kết thúc', 'hoàn thành', 'inactive', 'ngừng học'].includes(rawStatus);
            
            // Determine isActive boolean
            let finalIsActive = true;
            if (isExplicitlyInactive) {
              finalIsActive = false;
            } else if (c.isActive !== undefined) {
              finalIsActive = c.isActive;
            }

            return {
              id: String(classData.id || c.classId || ''),
              classId: classData.id || c.classId,
              name: classData.name,
              grade: classData.grade,
              section: classData.section,
              room: classData.room,
              feePerLesson: classData.feePerLesson,
              schedule: classData.schedule,
              description: classData.description,
              status: classData.status || (finalIsActive ? 'active' : 'inactive'),
              isActive: finalIsActive,
              discountPercent: c.discountPercent,
              enrollmentDate: c.enrollmentDate,
            };
          });
          // eslint-disable-next-line no-console
          console.log('[Children] Mapped classes for', s.id, classes);
          const classCount = classes.length;
          const activeCount = classes.filter((c: any) => c.isActive).length;
          const completedCount = classes.filter((c: any) => !c.isActive).length;

          // Fetch attendance/session data for this student
          let attendanceStats = {
            totalSessions: 0,
            presentSessions: 0,
            absentSessions: 0,
            lateSessions: 0,
          };
          let detailedAttendance: any[] = [];
          let attendanceRate = 0;

          try {
            const sessionRes = await getSessionsByStudentAPI(String(s.id));
            const sessionData: any = (sessionRes as any)?.data?.data || (sessionRes as any)?.data || sessionRes || {};

            // Extract attendance stats
            if (sessionData.attendanceStats) {
              attendanceStats = {
                totalSessions: sessionData.attendanceStats.totalSessions || 0,
                presentSessions: sessionData.attendanceStats.presentSessions || 0,
                absentSessions: sessionData.attendanceStats.absentSessions || 0,
                lateSessions: sessionData.attendanceStats.lateSessions || 0,
              };

              // Calculate attendance rate (present + late = participated, only absent = not participated)
              if (attendanceStats.totalSessions > 0) {
                attendanceRate = Math.round(((attendanceStats.presentSessions + attendanceStats.lateSessions) / attendanceStats.totalSessions) * 100);
              }
            }

            // Extract detailed attendance
            if (sessionData.detailedAttendance) {
              detailedAttendance = sessionData.detailedAttendance;
            }
          } catch (err) {
            // eslint-disable-next-line no-console
            console.warn('[Children] GET /sessions/:studentId failed for', s.id, err);
          }

          return {
            id: s.id,
            studentId: s.id,
            name: s.name || payload.name,
            email: s.email || payload.email,
            phone: s.phone || payload.phone,
            dateOfBirth: payload.dayOfBirth,
            totalClasses: classCount,
            activeClasses: activeCount,
            completedClasses: completedCount,
            attendanceRate: attendanceRate,
            classes: classes,
            attendanceStats: attendanceStats,
            detailedAttendance: detailedAttendance,
          } as Child;
        } catch {
          // eslint-disable-next-line no-console
          console.warn('[Children] GET /students/:id failed for', s.id);
          return {
            id: s.id,
            studentId: s.id,
            name: s.name,
            email: s.email,
            phone: s.phone,
            totalClasses: 0,
            activeClasses: 0,
            completedClasses: 0,
            attendanceRate: 0,
            classes: [],
          } as Child;
        }
      }));

      setChildrenData({
        children: detailed,
        totalChildren: detailed.length,
        totalClasses: detailed.reduce((sum, c) => sum + (c.totalClasses || 0), 0),
        activeClasses: detailed.reduce((sum, c) => sum + (c.activeClasses || 0), 0),
        completedClasses: detailed.reduce((sum, c) => sum + (c.completedClasses || 0), 0),
      });
    } catch (error: any) {
      setError(error?.response?.data?.message || 'Có lỗi xảy ra khi tải thông tin con');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getStatusColor = (status: any): 'success' | 'warning' | 'error' | 'default' => {
    if (!status) return 'default';
    const s = String(status).toLowerCase();
    switch (s) {
      case 'active':
      case 'đang học':
        return 'success';
      case 'upcoming':
      case 'sắp khai giảng':
        return 'warning';
      case 'closed':
      case 'đã kết thúc':
        return 'default';
      case 'completed':
      case 'hoàn thành':
        return 'default';
      case 'pending':
      case 'chờ':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: any): string => {
    if (!status) return 'Không rõ';
    const s = String(status).toLowerCase();
    switch (s) {
      case 'active':
      case 'đang học':
        return 'Đang học';
      case 'upcoming':
      case 'sắp khai giảng':
        return 'Sắp khai giảng';
      case 'closed':
      case 'đã kết thúc':
        return 'Đã kết thúc';
      case 'completed':
      case 'hoàn thành':
        return 'Hoàn thành';
      case 'pending':
      case 'chờ':
        return 'Chờ';
      default:
        return String(status);
    }
  };

  const handleViewChildDetails = async (child: Child): Promise<void> => {
    setSelectedChild(child);
    setChildDetailsOpen(true);
    setDetailLoading(true);
    try {
      // 1) Use pre-loaded attendance data from child object
      if (child.attendanceStats && child.detailedAttendance) {
        // Use existing attendance data
        const attendanceRate = child.attendanceRate || 0;
        setAttendanceData({
          totalSessions: child.attendanceStats.totalSessions,
          presentSessions: child.attendanceStats.presentSessions,
          absentSessions: child.attendanceStats.absentSessions,
          lateSessions: child.attendanceStats.lateSessions,
          attendanceRate: attendanceRate,
          sessions: child.detailedAttendance || []
        });
      } else {
        // Fallback: fetch if not available (shouldn't happen normally)
        try {
          const att = await getSessionsByStudentAPI(String((child as any).studentId || child.id));
          const payload: any = (att as any)?.data?.data || (att as any)?.data || att || {};
          const sessionsList: any[] = Array.isArray(payload?.detailedAttendance) ? payload.detailedAttendance
            : Array.isArray(payload?.result) ? payload.result
            : Array.isArray(payload) ? payload
            : Array.isArray(payload?.sessions) ? payload.sessions
            : [];

          const stats = payload.attendanceStats || {
            totalSessions: sessionsList.length,
            presentSessions: sessionsList.filter((s: any) => String(s?.status || '').toLowerCase() === 'present').length,
            absentSessions: sessionsList.filter((s: any) => String(s?.status || '').toLowerCase() === 'absent').length,
            lateSessions: sessionsList.filter((s: any) => String(s?.status || '').toLowerCase() === 'late').length,
          };

          // Calculate attendance rate (present + late = participated, only absent = not participated)
          const attendanceRate = stats.totalSessions > 0
            ? Math.round(((stats.presentSessions + stats.lateSessions) / stats.totalSessions) * 100)
            : 0;

          setAttendanceData({
            ...stats,
            attendanceRate,
            sessions: sessionsList
          });
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn('getSessionsByStudentAPI failed or returned no sessions', e);
          setAttendanceData({
            totalSessions: 0,
            presentSessions: 0,
            absentSessions: 0,
            lateSessions: 0,
            attendanceRate: 0,
            sessions: []
          });
        }
      }

      // 2) Use class IDs from student detail
      const classes: any[] = Array.isArray((child as any).classes) && (child as any).classes.length > 0
        ? (child as any).classes
        : [];
      // eslint-disable-next-line no-console
      console.log('Class IDs used for fetching details:', classes.map((c: any) => c.classId || c.id));

      // 3) Fetch class details for each class id
      const classPromises = classes.map(async (c: any) => {
        const classId = String(c.classId || c.id || '');
        if (!classId) return { classId, classData: null };
        try {
          const res = await getClassByIdAPI(classId);
          const classData = (res as any)?.data?.data || (res as any)?.data || res;
          return { classId, classData };
        } catch {
          return { classId, classData: null };
        }
      });
      const classResults = await Promise.all(classPromises);
      // eslint-disable-next-line no-console
      console.log('Fetched class details count:', classResults.filter(r => r.classData).length);
      const map: Record<string, any> = {};
      classResults.forEach((r) => { if (r.classId) map[r.classId] = r; });
      setClassDetails(map);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseChildDetails = (): void => {
    setChildDetailsOpen(false);
    setSelectedChild(null);
  };

  if (loading) {
    return (
      <DashboardLayout role="parent">
        <Box sx={commonStyles.container}>
          <LinearProgress />
        </Box>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="parent">
        <Box sx={commonStyles.container}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="parent">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">
            Quản lý con cái
          </Typography>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }} component={motion.div} initial="hidden" animate="visible" variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
        }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Tổng số con"
              value={childrenData.totalChildren}
              icon={<FamilyIcon sx={{ fontSize: 32 }} />}
              color="primary"
              index={0}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Tổng lớp học"
              value={childrenData.totalClasses}
              icon={<SchoolIcon sx={{ fontSize: 32 }} />}
              color="success"
              index={1}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Lớp đang học"
              value={childrenData.activeClasses}
              icon={<TrendingUpIcon sx={{ fontSize: 32 }} />}
              color="info"
              index={2}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Lớp đã kết thúc"
              value={childrenData.completedClasses}
              icon={<ClassIcon sx={{ fontSize: 32 }} />}
              color="error" // "completed" can be error (gray/red) or default. Let's use warning or error. I'll use default gray/secondary. StatCard doesn't support 'secondary' officially but 'error' is fine if it means done/closed. Wait, Admin uses 'warning' for completed? Let's use 'warning'.
              index={3}
            />
          </Grid>
        </Grid>

        {/* Children List */}
        <Grid container spacing={3}>
          {childrenData.children.map((child) => (
            <Grid item xs={12} md={6} key={child.id}>
              <Box sx={{
                background: 'linear-gradient(to bottom right, #ffffff, #f8fafc)',
                borderRadius: 4,
                boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
                p: { xs: 2, md: 3 },
                transition: 'all 0.3s ease',
                border: '1px solid #f1f5f9',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.08)'
                }
              }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ 
                        mr: 2, 
                        width: 64, 
                        height: 64,
                        bgcolor: 'rgba(211, 47, 47, 0.1)',
                        color: '#D32F2F',
                        border: '2px solid rgba(211, 47, 47, 0.2)'
                      }}>
                        <PersonIcon fontSize="large" />
                      </Avatar>
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>{child.name}</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>Học sinh</Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Grid container spacing={2} mb={3}>
                    <Grid item xs={4}>
                      <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, textAlign: 'center', border: '1px solid #f1f5f9' }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5, textTransform: 'uppercase' }}>
                          Lớp đang học
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main' }}>
                          {child.activeClasses}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, textAlign: 'center', border: '1px solid #f1f5f9' }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5, textTransform: 'uppercase' }}>
                          Tỷ lệ tham gia
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: 'success.main' }}>
                          {child.attendanceRate}%
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, textAlign: 'center', border: '1px solid #f1f5f9' }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5, textTransform: 'uppercase' }}>
                          Tổng lớp học
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
                          {child.totalClasses}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Box sx={{ mb: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>Tiến độ chuyên cần</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: child.attendanceRate >= 80 ? 'success.main' : 'warning.main' }}>{child.attendanceRate}%</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={child.attendanceRate}
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        bgcolor: 'background.default',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: child.attendanceRate >= 80 ? 'success.main' : 'warning.main',
                          borderRadius: 4
                        }
                      }}
                    />
                  </Box>

                  {child.attendanceStats && child.attendanceStats.totalSessions > 0 && (
                    <Box sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.5)',
                      p: 2,
                      borderRadius: 3,
                      border: '1px solid #e2e8f0',
                      mb: 3
                    }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: 'text.primary' }}>
                        Chi tiết điểm danh
                      </Typography>
                      <Grid container spacing={1}>
                        <Grid item xs={3}>
                          <Box textAlign="center">
                            <Typography variant="caption" color="text.secondary" display="block" gutterBottom sx={{ fontWeight: 600 }}>
                              Tổng
                            </Typography>
                            <Typography variant="h6" fontWeight={800} color="text.primary">
                              {child.attendanceStats.totalSessions}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={3}>
                          <Box textAlign="center">
                            <Typography variant="caption" color="text.secondary" display="block" gutterBottom sx={{ fontWeight: 600 }}>
                              Có mặt
                            </Typography>
                            <Typography variant="h6" fontWeight={800} color="success.main">
                              {child.attendanceStats.presentSessions}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={3}>
                          <Box textAlign="center">
                            <Typography variant="caption" color="text.secondary" display="block" gutterBottom sx={{ fontWeight: 600 }}>
                              Vắng
                            </Typography>
                            <Typography variant="h6" fontWeight={800} color="error.main">
                              {child.attendanceStats.absentSessions}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={3}>
                          <Box textAlign="center">
                            <Typography variant="caption" color="text.secondary" display="block" gutterBottom sx={{ fontWeight: 600 }}>
                              Muộn
                            </Typography>
                            <Typography variant="h6" fontWeight={800} color="warning.main">
                              {child.attendanceStats.lateSessions}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  <Box display="flex" justifyContent="flex-end" alignItems="center">
                    <Button
                      size="medium"
                      onClick={() => handleViewChildDetails(child)}
                      sx={{ 
                        fontWeight: 700, 
                        borderRadius: 2, 
                        textTransform: 'none',
                        px: 3,
                        bgcolor: 'rgba(211, 47, 47, 0.1)',
                        color: 'primary.main',
                        '&:hover': {
                          bgcolor: 'rgba(211, 47, 47, 0.2)'
                        }
                      }}
                    >
                      Xem chi tiết
                    </Button>
                  </Box>
              </Box>
            </Grid>
          ))}
        </Grid>

        {childrenData.children.length === 0 && (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="textSecondary">
              Chưa có thông tin con
            </Typography>
          </Box>
        )}

        {/* Child Details Dialog */}
        <Dialog
          open={childDetailsOpen}
          onClose={handleCloseChildDetails}
          maxWidth="md"
          fullWidth
        >
          <Box
            sx={{
              background: 'linear-gradient(135deg, #D32F2F 0%, #1E3A5F 100%)',
              color: 'white',
              p: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Typography variant="h6">
              Chi tiết học sinh: {selectedChild?.name}
            </Typography>
            <IconButton
              onClick={handleCloseChildDetails}
              sx={{ color: 'white' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          <DialogContent sx={{ p: 3 }}>
            {detailLoading && (
              <Box sx={{ py: 2 }}>
                <LinearProgress />
              </Box>
            )}

            {selectedChild && (
              <Box>
                {/* Danh sách lớp học */}
                <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 700 }}>
                  Danh sách lớp học
                </Typography>

                                <Grid container spacing={2}>
                  {Object.values(classDetails).map((classDetail: any) => {
                    if (!classDetail?.classData) return null;
                    const classData = classDetail.classData;
                    const classId = classDetail.classId;
                    const expanded = expandedClasses[classId] || false;

                    return (
                      <Grid item xs={12} key={classId}>
                        <Box sx={{ 
                          mb: 2,
                          background: 'linear-gradient(to bottom right, #ffffff, #f8fafc)',
                          borderRadius: 3,
                          boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
                          border: '1px solid #e2e8f0',
                          transition: 'all 0.2s',
                          overflow: 'hidden',
                          '&:hover': {
                            boxShadow: '0 6px 16px rgba(0,0,0,0.06)'
                          }
                        }}>
                          <Box sx={{ p: 2, px: 3 }}>
                            <Box
                              display="flex"
                              justifyContent="space-between"
                              alignItems="center"
                              sx={{ cursor: 'pointer' }}
                              onClick={() => setExpandedClasses(prev => ({
                                ...prev,
                                [classId]: !prev[classId]
                              }))}
                            >
                              <Box display="flex" alignItems="center" gap={2}>
                                <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
                                  Lớp {classData.name || 'Không xác định'}
                                </Typography>
                                <Box sx={{
                                  px: 1.5, py: 0.5,
                                  borderRadius: '12px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  bgcolor: String(classData.status || '').toLowerCase() === 'active' || String(classData.status || '').toLowerCase() === 'đang hoạt động' ? 'rgba(76, 175, 80, 0.1)' : 
                                          String(classData.status || '').toLowerCase() === 'completed' || String(classData.status || '').toLowerCase() === 'hoàn thành' ? 'rgba(33, 150, 243, 0.1)' : 'rgba(211, 47, 47, 0.1)',
                                  color: String(classData.status || '').toLowerCase() === 'active' || String(classData.status || '').toLowerCase() === 'đang hoạt động' ? 'success.dark' : 
                                         String(classData.status || '').toLowerCase() === 'completed' || String(classData.status || '').toLowerCase() === 'hoàn thành' ? 'info.dark' : 'error.dark',
                                  border: '1px solid',
                                  borderColor: String(classData.status || '').toLowerCase() === 'active' || String(classData.status || '').toLowerCase() === 'đang hoạt động' ? 'rgba(76, 175, 80, 0.2)' : 
                                              String(classData.status || '').toLowerCase() === 'completed' || String(classData.status || '').toLowerCase() === 'hoàn thành' ? 'rgba(33, 150, 243, 0.2)' : 'rgba(211, 47, 47, 0.2)'
                                }}>
                                  {getStatusLabel(classData.status)}
                                </Box>
                                <Chip
                                  label={`Khối ${classData.grade || 'N/A'}`}
                                  variant="outlined"
                                  size="small"
                                  sx={{ fontWeight: 600, color: 'text.secondary', borderColor: 'divider' }}
                                />
                              </Box>
                              <IconButton size="small" sx={{ color: 'text.secondary' }}>
                                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                              </IconButton>
                            </Box>

                            <Collapse in={expanded}>
                              <Divider sx={{ my: 2, borderColor: 'rgba(226, 232, 240, 0.8)' }} />

                              {/* Thông tin cơ bản */}
                              <Paper elevation={0} sx={{ p: 2.5, mb: 2, bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 2 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                                  Thông tin cơ bản
                                </Typography>
                                <Grid container spacing={3}>
                                  {/* Room */}
                                  <Grid item xs={12} sm={6} md={3}>
                                    <Box>
                                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                        <RoomIcon sx={{ fontSize: 18, mr: 0.5, color: 'text.secondary' }} />
                                        <Typography variant="caption" color="text.secondary">
                                          Phòng học
                                        </Typography>
                                      </Box>
                                      <Typography variant="body1" sx={{ fontWeight: 600, pl: 3 }}>
                                        {classData.room || 'Chưa xác định'}
                                      </Typography>
                                    </Box>
                                  </Grid>

                                  {/* Fee */}
                                  <Grid item xs={12} sm={6} md={3}>
                                    <Box>
                                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                        <AttachMoneyIcon sx={{ fontSize: 18, mr: 0.5, color: 'success.main' }} />
                                        <Typography variant="caption" color="text.secondary">
                                          Học phí / buổi
                                        </Typography>
                                      </Box>
                                      <Typography variant="body1" sx={{ fontWeight: 600, color: 'success.main', pl: 3 }}>
                                        {classData.feePerLesson
                                          ? `${classData.feePerLesson.toLocaleString('vi-VN')} ₫`
                                          : 'Chưa xác định'}
                                      </Typography>
                                    </Box>
                                  </Grid>

                                  {/* Discount */}
                                  <Grid item xs={12} sm={6} md={3}>
                                    <Box>
                                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                        <PercentIcon sx={{ fontSize: 18, mr: 0.5, color: 'warning.main' }} />
                                        <Typography variant="caption" color="text.secondary">
                                          Giảm giá
                                        </Typography>
                                      </Box>
                                      {(() => {
                                        const originalClass = (selectedChild as any)?.classes?.find((c: any) =>
                                          (c.id === classId || c.classId === classId)
                                        );
                                        const discountPercent = originalClass?.discountPercent;

                                        return (
                                          <Typography
                                            variant="body1"
                                            sx={{ fontWeight: 600, pl: 3 }}
                                            color={discountPercent ? "warning.main" : "text.secondary"}
                                          >
                                            {discountPercent ? `${discountPercent}%` : 'Không có'}
                                          </Typography>
                                        );
                                      })()}
                                    </Box>
                                  </Grid>

                                  {/* Teacher */}
                                  <Grid item xs={12} sm={6} md={3}>
                                    <Box>
                                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                        <PersonIcon sx={{ fontSize: 18, mr: 0.5, color: 'primary.main' }} />
                                        <Typography variant="caption" color="text.secondary">
                                          Giáo viên
                                        </Typography>
                                      </Box>
                                      <Typography variant="body1" sx={{ fontWeight: 600, pl: 3 }}>
                                        {classData.teacher?.name || 'Chưa phân công'}
                                      </Typography>
                                    </Box>
                                  </Grid>
                                </Grid>
                              </Paper>

                              {/* Lịch học */}
                              <Paper elevation={0} sx={{ p: 2.5, mb: 2, bgcolor: 'rgba(25, 118, 210, 0.05)', borderRadius: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                  <ScheduleIcon sx={{ fontSize: 20, mr: 1, color: 'info.main' }} />
                                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                    Lịch học
                                  </Typography>
                                </Box>
                                {classData.schedule ? (
                                  <Grid container spacing={2}>
                                    {/* Days of week */}
                                    <Grid item xs={12} md={4}>
                                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                                        Ngày học trong tuần
                                      </Typography>
                                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {(() => {
                                          const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
                                          const daysArr = classData.schedule.days_of_week || classData.schedule.dayOfWeeks || [];
                                          return Array.isArray(daysArr)
                                            ? daysArr.map((d: any) => dayNames[d] || '').filter(Boolean).join(', ') || '-'
                                            : '-';
                                        })()}
                                      </Typography>
                                    </Grid>

                                    {/* Time slots */}
                                    <Grid item xs={12} md={4}>
                                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                                        Giờ học
                                      </Typography>
                                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {(() => {
                                          const startTime = classData.schedule.time_slots?.start_time || classData.schedule.timeSlots?.startTime;
                                          const endTime = classData.schedule.time_slots?.end_time || classData.schedule.timeSlots?.endTime;
                                          return startTime && endTime ? `${startTime} - ${endTime}` : '-';
                                        })()}
                                      </Typography>
                                    </Grid>

                                    {/* Duration */}
                                    <Grid item xs={12} md={4}>
                                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                                        Thời gian học
                                      </Typography>
                                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {(() => {
                                          const startDate = classData.schedule.start_date || classData.schedule.startDate;
                                          const endDate = classData.schedule.end_date || classData.schedule.endDate;
                                          return startDate && endDate
                                            ? `${new Date(startDate).toLocaleDateString('vi-VN')} - ${new Date(endDate).toLocaleDateString('vi-VN')}`
                                            : '-';
                                        })()}
                                      </Typography>
                                    </Grid>
                                  </Grid>
                                ) : (
                                  <Typography variant="body2" color="text.secondary">
                                    Chưa có lịch học
                                  </Typography>
                                )}
                              </Paper>

                              {/* Description */}
                              {classData.description && (
                                <Paper elevation={0} sx={{ p: 2.5, mb: 2, bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 2 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                    <DescriptionIcon sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                      Mô tả lớp học
                                    </Typography>
                                  </Box>
                                  <Typography variant="body2" sx={{ lineHeight: 1.7, color: 'text.secondary' }}>
                                    {classData.description}
                                  </Typography>
                                </Paper>
                              )}

                               {/* Thông tin điểm danh cho lớp này */}
                               {attendanceData && attendanceData.sessions && (
                                 <>
                                   <Divider sx={{ my: 3 }} />
                                   <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 700 }}>
                                     Thông tin điểm danh
                                   </Typography>

                                   {(() => {
                                     // Calculate stats for this specific class
                                     const classSessions = (attendanceData.sessions || [])
                                       .filter((session: any) => {
                                         const sessionClassId = session?.class?.id || session?.classId;
                                         return sessionClassId === classId;
                                       });

                                     const totalSessions = classSessions.length;
                                     const presentSessions = classSessions.filter((s: any) =>
                                       String(s?.status || '').toLowerCase() === 'present'
                                     ).length;
                                     const absentSessions = classSessions.filter((s: any) =>
                                       String(s?.status || '').toLowerCase() === 'absent'
                                     ).length;
                                     const lateSessions = classSessions.filter((s: any) =>
                                       String(s?.status || '').toLowerCase() === 'late'
                                     ).length;
                                     const attendanceRate = totalSessions > 0
                                       ? Math.round(((presentSessions + lateSessions) / totalSessions) * 100)
                                       : 0;

                                     return (
                                       <Grid container spacing={2} sx={{ mb: 3 }}>
                                         <Grid item xs={12} sm={6} md={3}>
                                           <StatCard
                                             title="Tổng số buổi"
                                             value={totalSessions}
                                             icon={<EventIcon />}
                                             color="primary"
                                           />
                                         </Grid>
                                         <Grid item xs={12} sm={6} md={3}>
                                           <StatCard
                                             title="Có mặt"
                                             value={presentSessions}
                                             icon={<CheckCircleIcon />}
                                             color="success"
                                           />
                                         </Grid>
                                         <Grid item xs={12} sm={6} md={3}>
                                           <StatCard
                                             title="Vắng"
                                             value={absentSessions}
                                             icon={<CancelIcon />}
                                             color="error"
                                           />
                                         </Grid>
                                         {lateSessions > 0 && (
                                           <Grid item xs={12} sm={6} md={3}>
                                             <StatCard
                                               title="Đi muộn"
                                               value={lateSessions}
                                               icon={<AssignmentLateIcon />}
                                               color="warning"
                                             />
                                           </Grid>
                                         )}
                                         <Grid item xs={12} sm={6} md={3}>
                                           <StatCard
                                             title="Tỷ lệ tham gia"
                                             value={`${attendanceRate}%`}
                                             icon={<PercentIcon />}
                                             color="info"
                                           />
                                         </Grid>
                                       </Grid>
                                     );
                                   })()}

                                   <Card>
                                     <CardContent>
                                       <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
                                         Danh sách buổi học
                                       </Typography>
                                       <TableContainer component={Paper} variant="outlined">
                                         <Table>
                                           <TableHead>
                                             <TableRow sx={{ bgcolor: 'rgba(0, 0, 0, 0.04)' }}>
                                               <TableCell sx={{ fontWeight: 700 }}>Buổi học</TableCell>
                                               <TableCell sx={{ fontWeight: 700 }}>Thời gian</TableCell>
                                               <TableCell sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
                                               <TableCell sx={{ fontWeight: 700 }}>Ghi chú</TableCell>
                                             </TableRow>
                                           </TableHead>
                                           <TableBody>
                                             {(attendanceData.sessions || [])
                                               .filter((session: any) => {
                                                 // Filter sessions for this specific class
                                                 const sessionClassId = session?.class?.id || session?.classId;
                                                 return sessionClassId === classId;
                                               })
                                               .map((session: any, index: number) => {
                                               const getStatusConfig = (status: string) => {
                                                 switch (status?.toLowerCase()) {
                                                   case 'present':
                                                     return {
                                                       label: 'Có mặt',
                                                       color: 'success' as const,
                                                       icon: <CheckCircleIcon sx={{ fontSize: 18, mr: 0.5 }} />
                                                     };
                                                   case 'absent':
                                                     return {
                                                       label: 'Vắng mặt',
                                                       color: 'error' as const,
                                                       icon: <CancelIcon sx={{ fontSize: 18, mr: 0.5 }} />
                                                     };
                                                   case 'late':
                                                     return {
                                                       label: 'Đi muộn',
                                                       color: 'warning' as const,
                                                       icon: <AssignmentLateIcon sx={{ fontSize: 18, mr: 0.5 }} />
                                                     };
                                                   default:
                                                     return {
                                                       label: 'Chưa xác định',
                                                       color: 'default' as const,
                                                       icon: <EventIcon sx={{ fontSize: 18, mr: 0.5 }} />
                                                     };
                                                 }
                                               };

                                               const statusConfig = getStatusConfig(session.status);

                                               return (
                                                 <TableRow key={index} hover>
                                                   <TableCell>
                                                     <Typography variant="body2" fontWeight={600}>
                                                       Buổi {index + 1}
                                                     </Typography>
                                                   </TableCell>
                                                   <TableCell>
                                                     <Typography variant="body2">
                                                       {session.date ? formatDate(session.date) : '-'}
                                                     </Typography>
                                                   </TableCell>
                                                   <TableCell>
                                                     <Chip
                                                       icon={statusConfig.icon}
                                                       label={statusConfig.label}
                                                       color={statusConfig.color}
                                                       size="small"
                                                       sx={{ fontWeight: 600 }}
                                                     />
                                                   </TableCell>
                                                   <TableCell>
                                                     <Typography variant="body2" color="text.secondary">
                                                       {session.note || '-'}
                                                     </Typography>
                                                   </TableCell>
                                                 </TableRow>
                                               );
                                             })}
                                             {(() => {
                                               const filteredSessions = (attendanceData.sessions || [])
                                                 .filter((session: any) => {
                                                   const sessionClassId = session?.class?.id || session?.classId;
                                                   return sessionClassId === classId;
                                                 });

                                               if (filteredSessions.length === 0) {
                                                 return (
                                                   <TableRow>
                                                     <TableCell colSpan={4} align="center">
                                                       <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                                                         Chưa có buổi học nào cho lớp này
                                                       </Typography>
                                                     </TableCell>
                                                   </TableRow>
                                                 );
                                               }
                                               return null;
                                             })()}
                                           </TableBody>
                                         </Table>
                                       </TableContainer>
                                     </CardContent>
                                   </Card>
                                 </>
                               )}
                             </Collapse>
                           </Box>
                         </Box>
                       </Grid>
                     );
                   })}
                 </Grid>
              </Box>
            )}
          </DialogContent>
        </Dialog>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default Children;
