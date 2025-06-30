import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, TextField, MenuItem, Card, CardContent, CircularProgress } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { getMonthlyStudentChangeAPI } from '../../services/api';

const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
const months = Array.from({ length: 12 }, (_, i) => i + 1);
const quarters = [1, 2, 3, 4];

const StudentStatisticsPanel = () => {
  const [periodType, setPeriodType] = useState('month');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedQuarter, setSelectedQuarter] = useState(1);
  const [customStart, setCustomStart] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-01-01`;
  });
  const [customEnd, setCustomEnd] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-12-31`;
  });
  const [loading, setLoading] = useState(false);
  const [monthlyData, setMonthlyData] = useState([]);
  const [summaryData, setSummaryData] = useState({
    totalNewEnrollments: 0,
    totalCompletions: 0,
    netChange: 0,
    period: { startDate: '', endDate: '' }
  });
  const [error, setError] = useState('');

  // Helper: get all {year, month} between two dates (inclusive)
  function getMonthsBetween(start, end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const months = [];
    let year = startDate.getFullYear();
    let month = startDate.getMonth() + 1;
    while (year < endDate.getFullYear() || (year === endDate.getFullYear() && month <= endDate.getMonth() + 1)) {
      months.push({ year, month });
      month++;
      if (month > 12) {
        month = 1;
        year++;
      }
    }
    return months;
  }

  // Fetch monthly student change data
  const fetchMonthlyData = async () => {
    setLoading(true);
    setError('');
    try {
      let params = {};
      let res;
      if (periodType === 'month') {
        params = { year: selectedYear, months: selectedMonth };
        res = await getMonthlyStudentChangeAPI(params);
      } else if (periodType === 'quarter') {
        // Xác định tháng bắt đầu và kết thúc của quý
        const quarterMonths = {
          1: { startDate: 1, endDate: 3 },
          2: { startDate: 4, endDate: 6 },
          3: { startDate: 7, endDate: 9 },
          4: { startDate: 10, endDate: 12 },
        };
        const { startDate, endDate } = quarterMonths[selectedQuarter];
        params = { year: selectedYear, startDate, endDate };
        res = await getMonthlyStudentChangeAPI(params);
      } else if (periodType === 'year') {
        params = { year: selectedYear };
        res = await getMonthlyStudentChangeAPI(params);
      } else if (periodType === 'custom') {
        // Lấy năm, tháng bắt đầu và tháng kết thúc
        const year = new Date(customStart).getFullYear();
        const startDate = new Date(customStart).getMonth() + 1;
        const endDate = new Date(customEnd).getMonth() + 1;
        params = { year, startDate, endDate };
        res = await getMonthlyStudentChangeAPI(params);
      }
      console.log('Monthly student change API response:', res.data);

      // Transform API data to chart format
      const transformedData = res.data?.monthlyData?.map(item => ({
        month: item.month,
        monthName: item.monthName,
        students: item.newEnrollments, // Using newEnrollments as total students for this month
        newStudents: item.newEnrollments || 0,
        leftStudents: item.completions || 0,
        netChange: item.netChange || 0
      })) || [];

      setMonthlyData(transformedData);

      // Set summary data
      if (res.data?.summary) {
        setSummaryData({
          totalNewEnrollments: res.data.summary.totalNewEnrollments || 0,
          totalCompletions: res.data.summary.totalCompletions || 0,
          netChange: res.data.summary.netChange || 0,
          period: res.data.summary.period || { startDate: '', endDate: '' }
        });
      }
    } catch (err) {
      console.error('Error fetching monthly data:', err);
      setError('Không thể tải dữ liệu thống kê');
      setMonthlyData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthlyData();
  }, [periodType, selectedYear, selectedMonth, selectedQuarter, customStart, customEnd]);

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Thống kê học sinh
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
          {(periodType === 'month' || periodType === 'quarter' || periodType === 'year') && (
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

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Đầu năm</Typography>
              <Typography variant="h5" color="info.main" fontWeight="bold">
                {loading ? <CircularProgress size={20} /> : summaryData.totalNewEnrollments - summaryData.netChange}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Cuối năm</Typography>
              <Typography variant="h5" color="success.main" fontWeight="bold">
                {loading ? <CircularProgress size={20} /> : summaryData.totalNewEnrollments}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                {summaryData.netChange >= 0 ? 'Tăng' : 'Giảm'}
              </Typography>
              <Typography
                variant="h5"
                color={summaryData.netChange >= 0 ? 'success.main' : 'error.main'}
                fontWeight="bold"
              >
                {loading ? <CircularProgress size={20} /> : `${summaryData.netChange >= 0 ? '+' : ''}${summaryData.netChange}`}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Tổng học sinh mới</Typography>
              <Typography variant="h5" color="primary.main" fontWeight="bold">
                {loading ? <CircularProgress size={20} /> : summaryData.totalNewEnrollments}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Tổng học sinh rời đi</Typography>
              <Typography variant="h5" color="warning.main" fontWeight="bold">
                {loading ? <CircularProgress size={20} /> : summaryData.totalCompletions}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Bar Chart - Total Students by Month */}
        <Grid item xs={12}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>Số lượng học sinh theo tháng</Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                <CircularProgress />
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={monthlyData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="monthName" label={{ value: 'Tháng', position: 'insideBottomRight', offset: -5 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
                  <Bar dataKey="students" name="Tổng học sinh" fill="#1976d2" />
          </BarChart>
        </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        {/* Line Chart - Monthly Changes */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Biến động học sinh theo tháng</Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                <CircularProgress />
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={monthlyData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="monthName" label={{ value: 'Tháng', position: 'insideBottomRight', offset: -5 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="newStudents"
                    name="Học sinh mới"
                    stroke="#4caf50"
                    strokeWidth={2}
                    dot={{ fill: '#4caf50', strokeWidth: 2, r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="leftStudents"
                    name="Học sinh rời đi"
                    stroke="#f44336"
                    strokeWidth={2}
                    dot={{ fill: '#f44336', strokeWidth: 2, r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="netChange"
                    name="Biến động"
                    stroke="#ff9800"
                    strokeWidth={2}
                    dot={{ fill: '#ff9800', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
      </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentStatisticsPanel;
