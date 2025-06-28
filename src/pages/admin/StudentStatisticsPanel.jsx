import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, TextField, MenuItem, Card, CardContent, CircularProgress } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { getMonthlyStudentChangeAPI } from '../../services/api';

const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

const StudentStatisticsPanel = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [monthlyData, setMonthlyData] = useState([]);
  const [summaryData, setSummaryData] = useState({
    totalNewEnrollments: 0,
    totalCompletions: 0,
    netChange: 0,
    period: { startDate: '', endDate: '' }
  });
  const [error, setError] = useState('');

  // Fetch monthly student change data
  const fetchMonthlyData = async (year) => {
    setLoading(true);
    setError('');
    try {
      const res = await getMonthlyStudentChangeAPI({ year });
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
    fetchMonthlyData(selectedYear);
  }, [selectedYear]);

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Thống kê học sinh
      </Typography>

      <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField
              select
              fullWidth
              label="Năm"
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
            >
              {years.map(year => <MenuItem key={year} value={year}>{year}</MenuItem>)}
            </TextField>
          </Grid>
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
