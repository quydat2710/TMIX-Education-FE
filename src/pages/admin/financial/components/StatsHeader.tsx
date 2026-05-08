import React from 'react';
import { Box, Typography, Paper, TextField, MenuItem } from '@mui/material';
import { CalendarMonth as CalendarIcon } from '@mui/icons-material';
import type { GlobalTimeFilter } from '../../FinancialStatisticsPanel';

const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
const months = Array.from({ length: 12 }, (_, i) => i + 1);
const quarters = [1, 2, 3, 4];

interface StatsHeaderProps {
  timeFilter: GlobalTimeFilter;
  onTimeFilterChange: (key: keyof GlobalTimeFilter, value: any) => void;
}

const getPeriodLabel = (tf: GlobalTimeFilter) => {
  if (tf.periodType === 'year') return `Năm ${tf.selectedYear}`;
  if (tf.periodType === 'month') return `Tháng ${tf.selectedMonth}/${tf.selectedYear}`;
  if (tf.periodType === 'quarter') return `Quý ${tf.selectedQuarter}/${tf.selectedYear}`;
  if (tf.periodType === 'custom') return `${tf.customStart} → ${tf.customEnd}`;
  return '';
};

const StatsHeader: React.FC<StatsHeaderProps> = ({ timeFilter, onTimeFilterChange }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      mb: 3,
      flexWrap: 'wrap',
      gap: 2,
      position: 'sticky',
      top: 0,
      zIndex: 10,
      bgcolor: 'transparent',
      py: 1,
    }}
  >
    {/* ─── Title ─── */}
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a', letterSpacing: '-0.5px' }}>
        Thống kê tài chính
      </Typography>
      <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
        Tổng hợp doanh thu, chi phí & công nợ — {getPeriodLabel(timeFilter)}
      </Typography>
    </Box>

    {/* ─── GlobalFilterBar ─── */}
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        gap: 1.5,
        alignItems: 'center',
        p: 1.5,
        px: 2,
        borderRadius: 3,
        border: '1px solid rgba(0,0,0,0.06)',
        bgcolor: '#fafbfc',
        flexWrap: 'wrap',
      }}
    >
      <CalendarIcon sx={{ color: '#64748b', fontSize: 20 }} />
      <TextField
        select size="small" label="Thời gian"
        value={timeFilter.periodType}
        onChange={(e) => onTimeFilterChange('periodType', e.target.value)}
        sx={{ minWidth: 120, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
      >
        <MenuItem value="year">Năm</MenuItem>
        <MenuItem value="month">Tháng</MenuItem>
        <MenuItem value="quarter">Quý</MenuItem>
        <MenuItem value="custom">Tùy chọn</MenuItem>
      </TextField>

      {['year', 'month', 'quarter'].includes(timeFilter.periodType) && (
        <TextField
          select size="small" label="Năm"
          value={timeFilter.selectedYear}
          onChange={(e) => onTimeFilterChange('selectedYear', Number(e.target.value))}
          sx={{ minWidth: 100, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        >
          {years.map((y) => (<MenuItem key={y} value={y}>{y}</MenuItem>))}
        </TextField>
      )}

      {timeFilter.periodType === 'month' && (
        <TextField
          select size="small" label="Tháng"
          value={timeFilter.selectedMonth}
          onChange={(e) => onTimeFilterChange('selectedMonth', Number(e.target.value))}
          sx={{ minWidth: 90, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        >
          {months.map((m) => (<MenuItem key={m} value={m}>Tháng {m}</MenuItem>))}
        </TextField>
      )}

      {timeFilter.periodType === 'quarter' && (
        <TextField
          select size="small" label="Quý"
          value={timeFilter.selectedQuarter}
          onChange={(e) => onTimeFilterChange('selectedQuarter', Number(e.target.value))}
          sx={{ minWidth: 90, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        >
          {quarters.map((q) => (<MenuItem key={q} value={q}>Quý {q}</MenuItem>))}
        </TextField>
      )}

      {timeFilter.periodType === 'custom' && (
        <>
          <TextField
            size="small" label="Từ ngày" type="date"
            value={timeFilter.customStart}
            onChange={(e) => onTimeFilterChange('customStart', e.target.value)}
            sx={{ minWidth: 140, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            size="small" label="Đến ngày" type="date"
            value={timeFilter.customEnd}
            onChange={(e) => onTimeFilterChange('customEnd', e.target.value)}
            sx={{ minWidth: 140, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            InputLabelProps={{ shrink: true }}
          />
        </>
      )}
    </Paper>
  </Box>
);

export default StatsHeader;
