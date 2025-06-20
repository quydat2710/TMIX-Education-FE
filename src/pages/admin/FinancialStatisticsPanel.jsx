import React, { useState } from 'react';
import {
  Box, Typography, Paper, Grid, TextField, MenuItem, Card, CardContent, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip
} from '@mui/material';
import dayjs from 'dayjs';

const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
const months = Array.from({ length: 12 }, (_, i) => i + 1);
const quarters = [1, 2, 3, 4];

const mockStats = {
  teacherStats: {
    totalAmount: 50000000,
    paidAmount: 40000000,
    pendingAmount: 10000000,
    teacherCount: 12,
    sessionCount: 120,
    payments: [
      { id: 1, teacherName: 'Nguyễn Văn A', teacherId: 'GV01', numberOfSessions: 10, amount: 10000000, status: 'paid', paidDate: '2024-05-01', classDetails: [{ classId: 'C01', className: 'Lớp 1', sessions: 5 }] },
      { id: 2, teacherName: 'Trần Thị B', teacherId: 'GV02', numberOfSessions: 8, amount: 8000000, status: 'pending', paidDate: null, classDetails: [{ classId: 'C02', className: 'Lớp 2', sessions: 8 }] },
    ]
  },
  studentStats: {
    expectedAmount: 60000000,
    paidAmount: 45000000,
    remainingAmount: 15000000,
    studentCount: 100,
    classCount: 10,
    payments: [
      { id: 1, studentName: 'Lê Văn C', studentId: 'HS01', className: 'Lớp 1', classId: 'C01', expectedAmount: 1000000, paidAmount: 1000000, remainingAmount: 0, status: 'paid', lastPaymentDate: '2024-05-10' },
      { id: 2, studentName: 'Phạm Thị D', studentId: 'HS02', className: 'Lớp 2', classId: 'C02', expectedAmount: 1200000, paidAmount: 800000, remainingAmount: 400000, status: 'partial', lastPaymentDate: '2024-05-12' },
    ]
  },
  profitStats: {
    expectedProfit: 10000000,
    actualProfit: 5000000
  }
};

const FinancialStatisticsPanel = () => {
  const [periodType, setPeriodType] = useState('month');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedQuarter, setSelectedQuarter] = useState(1);
  const [tab, setTab] = useState(0);
  const [customStart, setCustomStart] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
  const [customEnd, setCustomEnd] = useState(dayjs().endOf('month').format('YYYY-MM-DD'));

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
              <Typography color="textSecondary" gutterBottom>Đã trả giáo viên</Typography>
              <Typography variant="h5" color="error.main" fontWeight="bold">{mockStats.teacherStats.paidAmount.toLocaleString()} ₫</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Học phí dự kiến</Typography>
              <Typography variant="h5" color="info.main" fontWeight="bold">{mockStats.studentStats.expectedAmount.toLocaleString()} ₫</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Đã thu</Typography>
              <Typography variant="h5" color="success.main" fontWeight="bold">{mockStats.studentStats.paidAmount.toLocaleString()} ₫</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Còn thiếu</Typography>
              <Typography variant="h5" color="warning.main" fontWeight="bold">{mockStats.studentStats.remainingAmount.toLocaleString()} ₫</Typography>
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
                    <TableCell align="right">Số buổi dạy</TableCell>
                    <TableCell align="right">Tổng lương</TableCell>
                    <TableCell align="center">Trạng thái</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mockStats.teacherStats.payments.map((p) => (
                    <TableRow key={p.id} hover>
                      <TableCell>{p.teacherName}</TableCell>
                      <TableCell align="right">{p.numberOfSessions}</TableCell>
                      <TableCell align="right">{p.amount.toLocaleString()} ₫</TableCell>
                      <TableCell align="center">
                        <Chip label={p.status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'} color={p.status === 'paid' ? 'success' : 'warning'} size="small" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {tab === 1 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Học sinh</TableCell>
                    <TableCell>Lớp học</TableCell>
                    <TableCell align="right">Học phí dự kiến</TableCell>
                    <TableCell align="right">Đã đóng</TableCell>
                    <TableCell align="right">Còn thiếu</TableCell>
                    <TableCell align="center">Trạng thái</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mockStats.studentStats.payments.map((p) => (
                    <TableRow key={p.id} hover>
                      <TableCell>{p.studentName}</TableCell>
                      <TableCell>{p.className}</TableCell>
                      <TableCell align="right">{p.expectedAmount.toLocaleString()} ₫</TableCell>
                      <TableCell align="right">{p.paidAmount.toLocaleString()} ₫</TableCell>
                      <TableCell align="right">{p.remainingAmount.toLocaleString()} ₫</TableCell>
                      <TableCell align="center">
                        <Chip label={p.status === 'paid' ? 'Đã đóng đủ' : p.status === 'partial' ? 'Đóng một phần' : 'Chưa đóng'} color={p.status === 'paid' ? 'success' : p.status === 'partial' ? 'warning' : 'error'} size="small" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default FinancialStatisticsPanel;
