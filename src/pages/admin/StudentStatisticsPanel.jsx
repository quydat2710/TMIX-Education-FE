import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, TextField, MenuItem, Card, CardContent } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

// Dữ liệu mẫu: số lượng học sinh từng tháng
const mockData = [
  { month: '1', students: 120 },
  { month: '2', students: 125 },
  { month: '3', students: 130 },
  { month: '4', students: 128 },
  { month: '5', students: 140 },
  { month: '6', students: 138 },
  { month: '7', students: 145 },
  { month: '8', students: 150 },
  { month: '9', students: 148 },
  { month: '10', students: 155 },
  { month: '11', students: 160 },
  { month: '12', students: 158 },
];

const StudentStatisticsPanel = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Tính toán số liệu tổng quan
  const first = mockData[0].students;
  const last = mockData[mockData.length - 1].students;
  const diff = last - first;

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Thống kê học sinh
      </Typography>
      <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField select fullWidth label="Năm" value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}>
              {years.map(year => <MenuItem key={year} value={year}>{year}</MenuItem>)}
            </TextField>
          </Grid>
        </Grid>
      </Paper>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Đầu năm</Typography>
              <Typography variant="h5" color="info.main" fontWeight="bold">{first}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Cuối năm</Typography>
              <Typography variant="h5" color="success.main" fontWeight="bold">{last}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>{diff >= 0 ? 'Tăng' : 'Giảm'}</Typography>
              <Typography variant="h5" color={diff >= 0 ? 'success.main' : 'error.main'} fontWeight="bold">{diff >= 0 ? '+' : ''}{diff}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>Số lượng học sinh theo tháng</Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={mockData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" label={{ value: 'Tháng', position: 'insideBottomRight', offset: -5 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="students" name="Số học sinh" fill="#1976d2" />
          </BarChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
};

export default StudentStatisticsPanel;
