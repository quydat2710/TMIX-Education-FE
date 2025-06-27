import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, TextField, MenuItem, Card, CardContent, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Pagination
} from '@mui/material';
import dayjs from 'dayjs';
import { getPaymentsAPI, getTeacherPaymentsAPI } from '../../services/api';

const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
const months = Array.from({ length: 12 }, (_, i) => i + 1);
const quarters = [1, 2, 3, 4];

const FinancialStatisticsPanel = () => {
  const [periodType, setPeriodType] = useState('month');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedQuarter, setSelectedQuarter] = useState(1);
  const [tab, setTab] = useState(0);
  const [customStart, setCustomStart] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
  const [customEnd, setCustomEnd] = useState(dayjs().endOf('month').format('YYYY-MM-DD'));
  const [studentPayments, setStudentPayments] = useState([]);
  const [teacherPayments, setTeacherPayments] = useState([]);
  const [loadingStudent, setLoadingStudent] = useState(false);
  const [loadingTeacher, setLoadingTeacher] = useState(false);
  const [studentPagination, setStudentPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalResults: 0
  });
  const [totalStatistics, setTotalStatistics] = useState({
    totalStudentFees: 0,
    totalPaidAmount: 0,
    totalRemainingAmount: 0,
    totalTeacherSalary: 0
  });

  const fetchTotalStatistics = async () => {
    try {
      // Gọi API để lấy thống kê tổng quan từ tất cả các trang
      const res = await getPaymentsAPI({ page: 1, limit: 1000 }); // Lấy tất cả dữ liệu
      const allStudentPayments = res.data || [];

      const totalStudentFees = allStudentPayments.reduce((total, p) => total + (p.finalAmount ?? 0), 0);
      const totalPaidAmount = allStudentPayments.reduce((total, p) => total + (p.paidAmount ?? 0), 0);
      const totalRemainingAmount = allStudentPayments.reduce((total, p) => total + (p.remainingAmount ?? 0), 0);

      // Tính tổng lương giáo viên từ dữ liệu hiện tại
      const totalTeacherSalary = teacherPayments.reduce((total, p) => total + ((p.totalLessons ?? 0) * (p.salaryPerLesson ?? 0)), 0);

      setTotalStatistics({
        totalStudentFees,
        totalPaidAmount,
        totalRemainingAmount,
        totalTeacherSalary
      });
    } catch (err) {
      console.error('Error fetching total statistics:', err);
    }
  };

  const fetchStudentPayments = async (page = 1) => {
    setLoadingStudent(true);
    try {
      const res = await getPaymentsAPI({ page, limit: 10 });
      console.log('Student payments API response:', res.data);
      setStudentPayments(res.data || []);
      // Cập nhật thông tin phân trang từ response
      if (res.page && res.limit && res.totalPages && res.totalResults) {
        setStudentPagination({
          page: res.page,
          limit: res.limit,
          totalPages: res.totalPages,
          totalResults: res.totalResults
        });
      }
    } catch (err) {
      console.error('Error fetching student payments:', err);
      setStudentPayments([]);
    } finally {
      setLoadingStudent(false);
    }
  };

  const fetchTeacherPayments = async () => {
    setLoadingTeacher(true);
    try {
      const res = await getTeacherPaymentsAPI();
      console.log('Teacher payments API response:', res.data);
      setTeacherPayments(res.data || []);
    } catch (err) {
      console.error('Error fetching teacher payments:', err);
      setTeacherPayments([]);
    } finally {
      setLoadingTeacher(false);
    }
  };

  useEffect(() => {
    fetchStudentPayments();
    fetchTeacherPayments();
    fetchTotalStatistics();
  }, []);

  const handleStudentPageChange = (event, newPage) => {
    fetchStudentPayments(newPage); // API sử dụng page bắt đầu từ 1, giống ParentManagement
  };

  // Bộ lọc thời gian
  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Thống kê tài chính
      </Typography>
      <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField select fullWidth label="Loại thời gian" value={periodType} onChange={e => setPeriodType(e.target.value)}>
              <MenuItem value="month">Tháng</MenuItem>
              <MenuItem value="quarter">Quý</MenuItem>
              <MenuItem value="year">Năm</MenuItem>
              <MenuItem value="custom">Tùy chỉnh</MenuItem>
            </TextField>
          </Grid>
          {periodType !== 'custom' && (
            <Grid item xs={12} sm={3}>
              <TextField select fullWidth label="Năm" value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}>
                {years.map(year => <MenuItem key={year} value={year}>{year}</MenuItem>)}
              </TextField>
            </Grid>
          )}
          {periodType === 'month' && (
            <Grid item xs={12} sm={3}>
              <TextField select fullWidth label="Tháng" value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}>
                {months.map(month => <MenuItem key={month} value={month}>{month}</MenuItem>)}
              </TextField>
            </Grid>
          )}
          {periodType === 'quarter' && (
            <Grid item xs={12} sm={3}>
              <TextField select fullWidth label="Quý" value={selectedQuarter} onChange={e => setSelectedQuarter(Number(e.target.value))}>
                {quarters.map(q => <MenuItem key={q} value={q}>Quý {q}</MenuItem>)}
              </TextField>
            </Grid>
          )}
          {periodType === 'custom' && (
            <>
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Từ ngày"
                  type="date"
                  value={customStart}
                  onChange={e => setCustomStart(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Đến ngày"
                  type="date"
                  value={customEnd}
                  onChange={e => setCustomEnd(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>
            </>
          )}
        </Grid>
      </Paper>

      {/* Cards tổng quan */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Tổng lương giáo viên</Typography>
              <Typography variant="h5" color="error.main" fontWeight="bold">{totalStatistics.totalTeacherSalary.toLocaleString()} ₫</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Tổng học phí</Typography>
              <Typography variant="h5" color="info.main" fontWeight="bold">{totalStatistics.totalStudentFees.toLocaleString()} ₫</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Đã thu</Typography>
              <Typography variant="h5" color="success.main" fontWeight="bold">{totalStatistics.totalPaidAmount.toLocaleString()} ₫</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Còn thiếu</Typography>
              <Typography variant="h5" color="warning.main" fontWeight="bold">{totalStatistics.totalRemainingAmount.toLocaleString()} ₫</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs bảng chi tiết */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Chi tiết giáo viên" />
          <Tab label="Chi tiết học sinh" />
        </Tabs>
        <Box sx={{ p: 2 }}>
          {tab === 0 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Giáo viên</TableCell>
                    <TableCell>Lớp</TableCell>
                    <TableCell align="center">Tháng/Năm</TableCell>
                    <TableCell align="right">Lương/buổi</TableCell>
                    <TableCell align="right">Số buổi dạy</TableCell>
                    <TableCell align="right">Tổng lương</TableCell>
                    <TableCell align="right">Đã trả</TableCell>
                    <TableCell align="center">Trạng thái</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {teacherPayments.map((p) => (
                    <TableRow key={p.id} hover>
                      <TableCell>{p.teacherId?.userId?.name || p.teacherId?.name || 'Chưa có tên'}</TableCell>
                      <TableCell>{p.classId?.name || 'Chưa có tên lớp'}</TableCell>
                      <TableCell align="center">{p.month || 0}/{p.year || 0}</TableCell>
                      <TableCell align="right">{(p.salaryPerLesson ?? 0).toLocaleString()} ₫</TableCell>
                      <TableCell align="right">{p.totalLessons || 0}</TableCell>
                      <TableCell align="right">{((p.totalLessons ?? 0) * (p.salaryPerLesson ?? 0)).toLocaleString()} ₫</TableCell>
                      <TableCell align="right">{(p.paidAmount ?? 0).toLocaleString()} ₫</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={p.status === 'paid' ? 'Đã thanh toán' : p.status === 'pending' ? 'Chờ thanh toán' : 'Chưa thanh toán'}
                          color={p.status === 'paid' ? 'success' : p.status === 'pending' ? 'warning' : 'error'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {tab === 1 && (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Học sinh</TableCell>
                      <TableCell>Lớp</TableCell>
                      <TableCell align="center">Tháng/Năm</TableCell>
                      <TableCell align="center">Số buổi học</TableCell>
                      <TableCell align="center">Tổng học phí</TableCell>
                      <TableCell align="center">Đã đóng</TableCell>
                      <TableCell align="center">Còn thiếu</TableCell>
                      <TableCell align="center">Trạng thái</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {studentPayments.map((p) => (
                      <TableRow key={p.id} hover>
                        <TableCell>{p.studentId?.userId?.name || p.studentId?.name || 'Chưa có tên'}</TableCell>
                        <TableCell>{p.classId?.name || 'Chưa có tên lớp'}</TableCell>
                        <TableCell align="center">{p.month || 0}/{p.year || 0}</TableCell>
                        <TableCell align="center">{p.attendedLessons || 0}</TableCell>
                        <TableCell align="center">{(p.finalAmount ?? 0).toLocaleString()} ₫</TableCell>
                        <TableCell align="center">{(p.paidAmount ?? 0).toLocaleString()} ₫</TableCell>
                        <TableCell align="center">{(p.remainingAmount ?? 0).toLocaleString()} ₫</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={p.status === 'paid' ? 'Đã đóng đủ' : p.status === 'partial' ? 'Đóng một phần' : 'Chưa đóng'}
                            color={p.status === 'paid' ? 'success' : p.status === 'partial' ? 'warning' : 'error'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {/* Pagination */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Pagination
                  count={studentPagination.totalPages}
                  page={studentPagination.page}
                  onChange={handleStudentPageChange}
                  color="primary"
                />
              </Box>
              <Box sx={{ textAlign: 'center', mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Hiển thị {studentPayments.length} trong tổng số {studentPagination.totalResults} bản ghi
                </Typography>
              </Box>
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default FinancialStatisticsPanel;
