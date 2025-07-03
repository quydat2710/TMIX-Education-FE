import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  IconButton,
  Tooltip,
  Badge,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import SchoolIcon from '@mui/icons-material/School';
import PaymentIcon from '@mui/icons-material/Payment';
import PersonIcon from '@mui/icons-material/Person';
import EventIcon from '@mui/icons-material/Event';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import WarningIcon from '@mui/icons-material/Warning';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DiscountIcon from '@mui/icons-material/Discount';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { commonStyles } from '../../utils/styles';
import StatCard from '../../components/common/StatCard';
import {
  getParentByIdAPI,
  getClassByIdAPI,
  getTeacherByIdAPI,
  getParentDashboardAPI,
} from '../../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [parentData, setParentData] = useState(null);
  const [childrenData, setChildrenData] = useState([]);
  const [stats, setStats] = useState({
    totalChildren: 0,
    totalClasses: 0,
    totalFees: 0,
    paidFees: 0,
    pendingPayments: 0,
    attendanceRate: 0,
  });

  useEffect(() => {
    if (user) {
      console.log('User data loaded, fetching parent data');
      fetchParentData();
    } else {
      console.log('User data not yet loaded');
    }
  }, [user]);

  const fetchParentData = async () => {
    setLoading(true);
    setError(''); // Clear any previous errors

    console.log('Starting fetchParentData, user:', user);

    try {
      // Get parent ID from user data
      const parentId = user?.parentId || user?.id || localStorage.getItem('parent_id');
      console.log('Parent ID:', parentId);

      if (!parentId) {
        console.error('No parent ID found in user data or localStorage');
        setError('Không tìm thấy thông tin phụ huynh');
        setLoading(false);
        return;
      }

      // Call new dashboard API
      let parentDashboard = {};
      try {
        const parentDashboardRes = await getParentDashboardAPI(parentId);
        parentDashboard = parentDashboardRes?.data?.data || parentDashboardRes?.data || {};
      } catch (err) {
        console.error('Error fetching parent dashboard API:', err);
      }

      console.log('Fetching parent data for ID:', parentId);

      // Fetch parent data
      const parentRes = await getParentByIdAPI(parentId);
      console.log('Parent API response:', parentRes);
      console.log('Parent API response type:', typeof parentRes);
      console.log('Parent API response keys:', Object.keys(parentRes || {}));

      // Handle different possible response structures
      const parent = parentRes?.data || parentRes;
      console.log('Parent data:', parent);
      console.log('Parent data type:', typeof parent);
      console.log('Parent data keys:', Object.keys(parent || {}));
      console.log('Parent studentIds:', parent?.studentIds);
      console.log('Parent studentIds length:', parent?.studentIds?.length);
      console.log('Parent studentIds type:', typeof parent?.studentIds);
      setParentData(parent);

      // Fetch children data (without payment aggregation)
      // Use studentIds from parent response instead of children property
      const children = parent?.studentIds || [];
      const childrenWithClasses = await Promise.all(
        children.map(async (child) => {
          try {
            // Fetch detailed class information for each class
            const classesWithDetails = await Promise.all(
              (child.classes || []).map(async (classItem) => {
                try {
                  const classRes = await getClassByIdAPI(classItem.classId || classItem.id);
                  const classData = classRes?.data || classRes;
                  return {
                    ...classItem,
                    id: classItem.classId || classItem.id,
                    name: classData?.name || classItem.name || 'N/A',
                    teacherId: classData?.teacherId || classItem.teacherId,
                    schedule: classData?.schedule || classItem.schedule,
                    feePerLesson: classData?.feePerLesson || classItem.feePerLesson || 0,
                    room: classData?.room || classData?.classroom || classItem.room || classItem.classroom,
                    status: classItem.status || 'active',
                  };
                } catch (err) {
                  return {
                    ...classItem,
                    id: classItem.classId || classItem.id,
                    name: classItem.name || 'N/A',
                    teacherId: classItem.teacherId,
                    schedule: classItem.schedule,
                    feePerLesson: classItem.feePerLesson || 0,
                    room: classItem.room || classItem.classroom,
                    status: classItem.status || 'active',
                  };
                }
              })
            );
            // Fetch teacher information for each class
            const classesWithTeachers = await Promise.all(
              classesWithDetails.map(async (classItem) => {
                if (classItem.teacherId) {
                  try {
                    const teacherRes = await getTeacherByIdAPI(classItem.teacherId);
                    const teacherData = teacherRes?.data || teacherRes;
                    return {
                      ...classItem,
                      teacherName: teacherData?.userId?.name || teacherData?.name || 'Chưa phân công',
                    };
                  } catch (err) {
                    return {
                      ...classItem,
                      teacherName: 'Chưa phân công',
                    };
                  }
                } else {
                  return {
                    ...classItem,
                    teacherName: 'Chưa phân công',
                  };
                }
              })
            );
            // Format child data to match expected structure (no payment fields)
            const formattedChild = {
              id: child.id,
              studentId: child.id,
              name: child.userId?.name || child.name || 'N/A',
              email: child.userId?.email || child.email || 'N/A',
              age: child.userId?.age || child.age || 0,
              grade: child.userId?.grade || child.grade || 'N/A',
              dateOfBirth: child.userId?.dayOfBirth || child.dateOfBirth || 'N/A',
              avatar: child.userId?.avatar || child.avatar || null,
              status: child.status || 'active',
              classes: classesWithTeachers,
            };
            return formattedChild;
          } catch (err) {
            return {
              id: child.id,
              studentId: child.id,
              name: child.userId?.name || child.name || 'N/A',
              email: child.userId?.email || child.email || 'N/A',
              age: child.userId?.age || child.age || 0,
              grade: child.userId?.grade || child.grade || 'N/A',
              dateOfBirth: child.userId?.dayOfBirth || child.dateOfBirth || 'N/A',
              avatar: child.userId?.avatar || child.avatar || null,
              status: child.status || 'active',
              classes: child.classes || [],
            };
          }
        })
      );
      setChildrenData(childrenWithClasses);
      // Calculate overall statistics using only parentDashboard API data
      const calculatedStats = {
        totalChildren: parentDashboard.totalChildren ?? 0,
        totalClasses: parentDashboard.totalClasses ?? 0,
        totalFees: parentDashboard.paymentInfo?.[0]?.totalRevenue ?? 0,
        paidFees: parentDashboard.paymentInfo?.[0]?.totalPaidAmount ?? 0,
        pendingPayments: parentDashboard.paymentInfo?.[0]?.totalUnPaidAmount ?? 0,
        attendanceRate: parentDashboard.attendanceRate ?? 0,
      };
      setStats(calculatedStats);

    } catch (err) {
      console.error('Error fetching parent dashboard data:', err);
      setError('Không thể tải dữ liệu dashboard');

      // Set fallback data to show something
      setStats({
        totalChildren: 0,
        totalClasses: 0,
        totalFees: 0,
        paidFees: 0,
        pendingPayments: 0,
        attendanceRate: 0,
      });
      setChildrenData([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <DashboardLayout role="parent">
        <Box sx={{ py: 4 }}>
          <LinearProgress />
          <Typography sx={{ textAlign: 'center', mt: 2 }}>Đang tải dữ liệu dashboard...</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="parent">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <Box sx={commonStyles.pageHeader}>
            <Typography sx={commonStyles.pageTitle}>
              Dashboard Phụ huynh
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
            Xin chào {parentData?.userId?.name || parentData?.name || 'Phụ huynh'}, đây là thông tin học tập và thanh toán của con bạn
          </Typography>

        {/* Stat Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Số con đang học"
              value={stats.totalChildren || 0}
              icon={<PersonIcon sx={{ fontSize: 40 }} />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Tổng số lớp"
              value={stats.totalClasses || 0}
              icon={<SchoolIcon sx={{ fontSize: 40 }} />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Tổng học phí"
              value={formatCurrency(stats.totalFees || 0)}
              icon={<PaymentIcon sx={{ fontSize: 40 }} />}
              color="warning"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Đã thanh toán"
              value={formatCurrency(stats.paidFees || 0)}
              icon={<CheckCircleIcon sx={{ fontSize: 40 }} />}
              color="info"
            />
          </Grid>
        </Grid>

        {/* Additional Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Còn thiếu"
              value={formatCurrency((stats.totalFees || 0) - (stats.paidFees || 0))}
              icon={<WarningIcon sx={{ fontSize: 40 }} />}
              color="error"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Thanh toán chờ"
              value={stats.pendingPayments || 0}
              icon={<AttachMoneyIcon sx={{ fontSize: 40 }} />}
              color="warning"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Tỷ lệ thanh toán"
              value={`${(stats.totalFees || 0) > 0 ? Math.round(((stats.paidFees || 0) / (stats.totalFees || 0)) * 100) : 0}%`}
              icon={<TrendingUpIcon sx={{ fontSize: 40 }} />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Tỷ lệ tham gia"
              value={`${stats.attendanceRate || 0}%`}
              icon={<EventIcon sx={{ fontSize: 40 }} />}
              color="secondary"
            />
          </Grid>
        </Grid>

        {/* Children Information */}
        <Grid container spacing={3}>
          {childrenData.map((child, childIndex) => (
            <Grid item xs={12} key={child.id}>
              <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    {child.name?.charAt(0)?.toUpperCase() || 'N'}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {child.name || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {child.email || 'N/A'}
                    </Typography>
                  </Box>
                </Box>

                {/* Child's Classes */}
                {child.classes && child.classes.length > 0 ? (
                  <TableContainer sx={commonStyles.tableContainer}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Lớp học</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Giáo viên</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Phòng học</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Lịch học</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Học phí</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {child.classes.map((classItem, classIndex) => (
                          <TableRow key={classItem.id || classItem.classId || classIndex} sx={commonStyles.tableRow}>
                            <TableCell>
                              <Typography variant="body2" fontWeight="medium">
                                {classItem.name || classItem.className || 'N/A'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {classItem.teacherName || 'Chưa phân công'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {classItem.room || classItem.classroom || 'N/A'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {classItem.schedule?.dayOfWeeks?.map(d => ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d]).join(', ')} • {classItem.schedule?.timeSlots?.startTime} - {classItem.schedule?.timeSlots?.endTime}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight="600">
                                {formatCurrency(classItem.feePerLesson || classItem.fee || 0)}/buổi
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={
                                  classItem.status === 'active'
                                    ? 'Đang học'
                                    : classItem.status === 'completed'
                                    ? 'Đã hoàn thành'
                                    : classItem.status || 'N/A'
                                }
                                color={
                                  classItem.status === 'active'
                                    ? 'success'
                                    : classItem.status === 'completed'
                                    ? 'default'
                                    : 'default'
                                }
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    Chưa có lớp học nào
                  </Typography>
                )}

                {/* Payment Summary */}
                <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Tóm tắt thanh toán
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" color="text.secondary">
                        Tổng học phí: <strong>{formatCurrency(child.totalFees || 0)}</strong>
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" color="text.secondary">
                        Đã thanh toán: <strong style={{ color: 'green' }}>{formatCurrency(child.paidFees || 0)}</strong>
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" color="text.secondary">
                        Còn thiếu: <strong style={{ color: 'red' }}>{formatCurrency((child.totalFees || 0) - (child.paidFees || 0))}</strong>
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {childrenData.length === 0 && (
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Chưa có con nào được đăng ký
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Vui lòng liên hệ admin để thêm con vào hệ thống.
            </Typography>
          </Paper>
        )}
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default Dashboard;
