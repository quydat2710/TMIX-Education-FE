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
import { commonStyles } from '../../utils/styles';
import StatCard from '../../components/common/StatCard';
import {
  getParentByIdAPI,
  getPaymentsByStudentAPI,
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
    fetchParentData();
  }, []);

  const fetchParentData = async () => {
    setLoading(true);
    try {
      // Get parent ID from user data
      const parentId = user?.parentId || user?.id;
      if (!parentId) {
        setError('Không tìm thấy thông tin phụ huynh');
        return;
      }

      // Fetch parent data
      const parentRes = await getParentByIdAPI(parentId);
      const parent = parentRes?.data;
      setParentData(parent);

      // Fetch children data and their payments
      const children = parent?.children || [];
      const childrenWithPayments = await Promise.all(
        children.map(async (child) => {
          try {
            const paymentsRes = await getPaymentsByStudentAPI(child.id, { limit: 100 });
            const payments = paymentsRes?.data?.payments || [];

            return {
              ...child,
              payments,
              totalFees: payments.reduce((sum, p) => sum + (p.finalAmount || 0), 0),
              paidFees: payments.reduce((sum, p) => sum + (p.paidAmount || 0), 0),
              pendingPayments: payments.filter(p => p.status !== 'paid').length,
            };
          } catch (err) {
            console.error(`Error fetching payments for child ${child.id}:`, err);
            return {
              ...child,
              payments: [],
              totalFees: 0,
              paidFees: 0,
              pendingPayments: 0,
            };
          }
        })
      );

      setChildrenData(childrenWithPayments);

      // Calculate overall statistics
      const totalChildren = childrenWithPayments.length;
      const totalClasses = childrenWithPayments.reduce((sum, child) => sum + (child.classes?.length || 0), 0);
      const totalFees = childrenWithPayments.reduce((sum, child) => sum + child.totalFees, 0);
      const paidFees = childrenWithPayments.reduce((sum, child) => sum + child.paidFees, 0);
      const pendingPayments = childrenWithPayments.reduce((sum, child) => sum + child.pendingPayments, 0);

      setStats({
        totalChildren,
        totalClasses,
        totalFees,
        paidFees,
        pendingPayments,
        attendanceRate: 85, // Mock attendance rate for now
      });
    } catch (err) {
      console.error('Error fetching parent dashboard data:', err);
      setError('Không thể tải dữ liệu dashboard');
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
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Dashboard Phụ huynh
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Xin chào {parentData?.userId?.name || parentData?.name || 'Phụ huynh'}, đây là thông tin học tập và thanh toán của con bạn
        </Typography>

        {/* Stat Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Số con đang học"
              value={stats.totalChildren}
              icon={<PersonIcon sx={{ fontSize: 40 }} />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Tổng số lớp"
              value={stats.totalClasses}
              icon={<SchoolIcon sx={{ fontSize: 40 }} />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Tổng học phí"
              value={formatCurrency(stats.totalFees)}
              icon={<PaymentIcon sx={{ fontSize: 40 }} />}
              color="warning"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Đã thanh toán"
              value={formatCurrency(stats.paidFees)}
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
              value={formatCurrency(stats.totalFees - stats.paidFees)}
              icon={<WarningIcon sx={{ fontSize: 40 }} />}
              color="error"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Thanh toán chờ"
              value={stats.pendingPayments}
              icon={<AttachMoneyIcon sx={{ fontSize: 40 }} />}
              color="warning"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Tỷ lệ thanh toán"
              value={`${stats.totalFees > 0 ? Math.round((stats.paidFees / stats.totalFees) * 100) : 0}%`}
              icon={<TrendingUpIcon sx={{ fontSize: 40 }} />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Tỷ lệ tham gia"
              value={`${stats.attendanceRate}%`}
              icon={<EventIcon sx={{ fontSize: 40 }} />}
              color="secondary"
            />
          </Grid>
        </Grid>

        {/* Children Information */}
        <Grid container spacing={3}>
          {childrenData.map((child, childIndex) => (
            <Grid item xs={12} key={child.id}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    {child.name?.charAt(0)?.toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {child.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {child.grade || 'N/A'} • {child.age || 'N/A'} tuổi
                    </Typography>
                  </Box>
                  <Box sx={{ ml: 'auto' }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => navigate(`/parent/children/${child.id}`)}
                    >
                      Xem chi tiết
                    </Button>
                  </Box>
                </Box>

                {/* Child's Classes */}
                {child.classes && child.classes.length > 0 ? (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Lớp học</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Giáo viên</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Lịch học</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Học phí</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {child.classes.map((classItem, classIndex) => (
                          <TableRow key={classItem.id || classIndex} hover>
                            <TableCell>
                              <Typography variant="body2" fontWeight="medium">
                                {classItem.name}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {classItem.teacherId?.userId?.name || classItem.teacherId?.name || 'N/A'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {classItem.schedule?.dayOfWeeks?.map(d => ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d]).join(', ')} • {classItem.schedule?.timeSlots?.startTime} - {classItem.schedule?.timeSlots?.endTime}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight="600">
                                {formatCurrency(classItem.feePerLesson || 0)}/buổi
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={classItem.status === 'active' ? 'Đang học' : classItem.status}
                                color={classItem.status === 'active' ? 'success' : 'default'}
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
                        Tổng học phí: <strong>{formatCurrency(child.totalFees)}</strong>
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" color="text.secondary">
                        Đã thanh toán: <strong style={{ color: 'green' }}>{formatCurrency(child.paidFees)}</strong>
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" color="text.secondary">
                        Còn thiếu: <strong style={{ color: 'red' }}>{formatCurrency(child.totalFees - child.paidFees)}</strong>
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {childrenData.length === 0 && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Chưa có con nào được đăng ký
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Vui lòng liên hệ admin để thêm con vào hệ thống.
            </Typography>
          </Paper>
        )}
      </Box>
    </DashboardLayout>
  );
};

export default Dashboard;
