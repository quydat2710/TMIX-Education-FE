import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress, Grid
} from '@mui/material';
import { getTeacherPaymentByIdAPI } from '../../services/api';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import PaymentIcon from '@mui/icons-material/Payment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import { useAuth } from '../../contexts/AuthContext';

const Salary = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPayments = async () => {
      const teacherId = user?.teacherId;
      if (!teacherId) return;
      setLoading(true);
      try {
        const res = await getTeacherPaymentByIdAPI(teacherId);
        console.log('API getTeacherPaymentByIdAPI response:', res);
        setPayments(Array.isArray(res) ? res : []);
      } catch (err) {
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, [user]);

  // Tính toán số liệu thống kê
  const totalSalary = payments.reduce((sum, p) => sum + ((p.totalLessons ?? 0) * (p.salaryPerLesson ?? 0)), 0);
  const totalPaid = payments.reduce((sum, p) => sum + (p.paidAmount ?? 0), 0);
  const totalUnpaid = totalSalary - totalPaid;

  // Log state payments để kiểm tra dữ liệu render
  console.log('Payments state:', payments);

  return (
    <DashboardLayout role="teacher">
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Lương của tôi
        </Typography>
        {/* Stat Cards */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Tổng khoản lương"
                value={payments.length}
                icon={<PaymentIcon sx={{ fontSize: 40 }} />}
                color="primary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Tổng lương"
                value={totalSalary.toLocaleString() + ' ₫'}
                icon={<PaymentIcon sx={{ fontSize: 40 }} />}
                color="success"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Đã nhận"
                value={totalPaid.toLocaleString() + ' ₫'}
                icon={<CheckCircleIcon sx={{ fontSize: 40 }} />}
                color="info"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Còn lại"
                value={totalUnpaid.toLocaleString() + ' ₫'}
                icon={<MoneyOffIcon sx={{ fontSize: 40 }} />}
                color="warning"
              />
            </Grid>
          </Grid>
        </Box>
        <Paper sx={{ p: 2 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Lớp</TableCell>
                    <TableCell align="center">Tháng/Năm</TableCell>
                    <TableCell align="right">Số buổi</TableCell>
                    <TableCell align="right">Lương/buổi</TableCell>
                    <TableCell align="right">Tổng lương</TableCell>
                    <TableCell align="right">Đã nhận</TableCell>
                    <TableCell align="center">Trạng thái</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">Không có dữ liệu lương</TableCell>
                    </TableRow>
                  ) : (
                    payments.map((p) => (
                      <TableRow key={p.id} hover>
                        <TableCell>{p.classId?.name || '-'}</TableCell>
                        <TableCell align="center">{p.month}/{p.year}</TableCell>
                        <TableCell align="right">{p.totalLessons || 0}</TableCell>
                        <TableCell align="right">{(p.salaryPerLesson ?? 0).toLocaleString()} ₫</TableCell>
                        <TableCell align="right">{((p.totalLessons ?? 0) * (p.salaryPerLesson ?? 0)).toLocaleString()} ₫</TableCell>
                        <TableCell align="right">{(p.paidAmount ?? 0).toLocaleString()} ₫</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={p.status === 'paid' ? 'Đã nhận' : p.status === 'pending' ? 'Chờ nhận' : 'Chưa nhận'}
                            color={p.status === 'paid' ? 'success' : p.status === 'pending' ? 'warning' : 'error'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>
    </DashboardLayout>
  );
};

export default Salary;
