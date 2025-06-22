import React, { useState, useMemo } from 'react';
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

// Mock data cho phụ huynh
const mockParentData = {
  parentId: 'parent-001',
  name: 'Nguyễn Văn A',
  children: [
    {
      id: 'child-001',
      name: 'Nguyễn Thị B',
      age: 12,
      grade: 'Lớp 6',
      avatar: null,
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
          monthlyFee: 1500000, // 1.5 triệu VND
          discountPercent: 10, // Giảm 10%
          discountReason: 'Gia đình quen biết',
          paymentStatus: {
            totalOwed: 4500000, // 4.5 triệu VND (3 tháng chưa đóng)
            lastPaidMonth: 'Tháng 12/2023',
            unpaidMonths: ['Tháng 1/2024', 'Tháng 2/2024', 'Tháng 3/2024'],
            discountAmount: 450000, // 10% của 4.5 triệu
            finalAmount: 4050000, // 4.5 triệu - 450k
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
          monthlyFee: 1200000, // 1.2 triệu VND
          discountPercent: 0,
          discountReason: null,
          paymentStatus: {
            totalOwed: 2400000, // 2.4 triệu VND (2 tháng chưa đóng)
            lastPaidMonth: 'Tháng 1/2024',
            unpaidMonths: ['Tháng 2/2024', 'Tháng 3/2024'],
            discountAmount: 0,
            finalAmount: 2400000,
          }
        }
      ]
    },
    {
      id: 'child-002',
      name: 'Nguyễn Văn E',
      age: 10,
      grade: 'Lớp 4',
      avatar: null,
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
          monthlyFee: 800000, // 800k VND
          discountPercent: 15, // Giảm 15%
          discountReason: 'Học sinh xuất sắc',
          paymentStatus: {
            totalOwed: 800000, // 800k VND (1 tháng chưa đóng)
            lastPaidMonth: 'Tháng 2/2024',
            unpaidMonths: ['Tháng 3/2024'],
            discountAmount: 120000, // 15% của 800k
            finalAmount: 680000,
          }
        }
      ]
    }
  ]
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [parentData] = useState(mockParentData);

  // Tính toán tổng quan
  const summary = useMemo(() => {
    let totalClasses = 0;
    let totalSessions = 0;
    let totalAttended = 0;
    let totalAbsent = 0;
    let totalOwed = 0;
    let totalDiscount = 0;
    let totalFinalAmount = 0;

    parentData.children.forEach(child => {
      child.classes.forEach(cls => {
        totalClasses++;
        totalSessions += cls.totalSessions;
        totalAttended += cls.attendedSessions;
        totalAbsent += cls.absentSessions;
        totalOwed += cls.paymentStatus.totalOwed;
        totalDiscount += cls.paymentStatus.discountAmount;
        totalFinalAmount += cls.paymentStatus.finalAmount;
      });
    });

    return {
      totalClasses,
      totalSessions,
      totalAttended,
      totalAbsent,
      attendanceRate: totalSessions > 0 ? Math.round((totalAttended / totalSessions) * 100) : 0,
      totalOwed,
      totalDiscount,
      totalFinalAmount
    };
  }, [parentData]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <DashboardLayout role="parent">
      <Box sx={commonStyles.pageContainer}>
        <Typography variant="h4" gutterBottom>
          Tổng quan - Phụ huynh
            </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Xin chào {parentData.name}, đây là thông tin học tập và thanh toán của con bạn
        </Typography>

        {/* Stat Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Tổng số lớp"
              value={summary.totalClasses}
              icon={<SchoolIcon sx={{ fontSize: 40 }} />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Tỷ lệ điểm danh"
              value={`${summary.attendanceRate}%`}
              icon={<CheckCircleIcon sx={{ fontSize: 40 }} />}
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
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Sau khi giảm giá"
              value={formatCurrency(summary.totalFinalAmount)}
              icon={<DiscountIcon sx={{ fontSize: 40 }} />}
              color="warning"
            />
          </Grid>
        </Grid>

        {/* Children Information */}
        <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
          Thông tin con cái
          </Typography>

        {parentData.children.map((child, childIndex) => (
          <Card key={child.id} sx={{ mb: 3 }}>
                <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ width: 60, height: 60, mr: 2, bgcolor: 'primary.main' }}>
                  <PersonIcon sx={{ fontSize: 30 }} />
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {child.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {child.age} tuổi - {child.grade}
                  </Typography>
                </Box>
                <Chip
                  label={`${child.classes.length} lớp học`}
                  color="primary"
                  variant="outlined"
                />
              </Box>

              <Divider sx={{ mb: 2 }} />

              {/* Classes Information */}
              {child.classes.map((cls, classIndex) => (
                <Paper key={cls.classId} sx={{ p: 2, mb: 2, bgcolor: '#fafafa' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {cls.className}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        <strong>Giáo viên:</strong> {cls.teacher}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        <strong>Lịch học:</strong> {cls.schedule}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Học phí:</strong> {formatCurrency(cls.monthlyFee)}/tháng
                        {cls.discountPercent > 0 && (
                          <Chip
                            label={`Giảm ${cls.discountPercent}%`}
                            color="success"
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Chip
                        label={`${cls.attendedSessions}/${cls.totalSessions} buổi`}
                        color={cls.attendanceRate >= 90 ? 'success' : cls.attendanceRate >= 80 ? 'warning' : 'error'}
                        variant="outlined"
                      />
                    </Box>
                  </Box>

                  {/* Attendance Details */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Chi tiết điểm danh:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleIcon color="success" fontSize="small" />
                        <Typography variant="body2">
                          Có mặt: {cls.attendedSessions} buổi
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CancelIcon color="error" fontSize="small" />
                        <Typography variant="body2">
                          Vắng: {cls.absentSessions} buổi
                        </Typography>
                      </Box>
                    </Box>
                    {cls.absentDetails.length > 0 && (
                      <Typography variant="body2" color="error" sx={{ fontSize: '0.875rem' }}>
                        <strong>Buổi vắng:</strong> {cls.absentDetails.join(', ')}
                      </Typography>
                    )}
                  </Box>

                  {/* Payment Status */}
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Tình trạng thanh toán:
                  </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>Mô tả</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Số tiền</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell>Tổng nợ học phí</TableCell>
                            <TableCell align="right">{formatCurrency(cls.paymentStatus.totalOwed)}</TableCell>
                          </TableRow>
                          {cls.paymentStatus.discountAmount > 0 && (
                            <TableRow>
                              <TableCell>Giảm giá ({cls.discountPercent}%)</TableCell>
                              <TableCell align="right" sx={{ color: 'success.main' }}>
                                -{formatCurrency(cls.paymentStatus.discountAmount)}
                              </TableCell>
                            </TableRow>
                          )}
                          <TableRow sx={{ bgcolor: '#f0f8ff' }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>Số tiền cần thanh toán</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                              {formatCurrency(cls.paymentStatus.finalAmount)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      <strong>Tháng chưa đóng:</strong> {cls.paymentStatus.unpaidMonths.join(', ')}
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </CardContent>
          </Card>
        ))}

        {/* Summary Payment */}
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Tổng kết thanh toán
                  </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Mô tả</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Số tiền</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Tổng nợ học phí</TableCell>
                    <TableCell align="right">{formatCurrency(summary.totalOwed)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Tổng giảm giá</TableCell>
                    <TableCell align="right" sx={{ color: 'success.main' }}>
                      -{formatCurrency(summary.totalDiscount)}
                    </TableCell>
                  </TableRow>
                  <TableRow sx={{ bgcolor: '#f0f8ff' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Số tiền cần thanh toán</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                      {formatCurrency(summary.totalFinalAmount)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                  <Button
                    variant="contained"
            size="large"
            startIcon={<PaymentIcon />}
                    onClick={() => navigate('/parent/payments')}
                  >
            Thanh toán học phí
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<PersonIcon />}
            onClick={() => navigate('/parent/children')}
          >
            Xem chi tiết con cái
                  </Button>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default Dashboard;
