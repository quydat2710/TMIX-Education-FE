import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, TextField, MenuItem, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, ComposedChart, Area, Legend,
} from 'recharts';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  PersonAdd as PersonAddIcon,
  PersonOff as PersonOffIcon,
  Groups as GroupsIcon,
  ShowChart as ShowChartIcon,
} from '@mui/icons-material';
import { commonStyles } from '../../utils/styles';
import { getMonthlyStudentChangeAPI } from '../../services/students';

// ─── Design tokens ───
const NAVY = '#1e3a8a';
const CHART_COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  slate: '#64748b',
};

interface MonthlyData {
  year: number;
  month: number;
  monthName: string;
  newStudents: number;
  leftStudents: number;
  netChange: number;
  students: number;
}

interface SummaryData {
  totalNewEnrollments: number;
  totalCompletions: number;
  netChange: number;
  period: { startDate: string; endDate: string };
}

interface ApiResponse {
  data?: {
    increase?: Array<{ year: number; month: number; count: number }>;
    decrease?: Array<{ year: number; month: number; count: number }>;
    summary?: {
      totalIncrease: number;
      totalDecrease: number;
      netChange: number;
      period: { startDate: string; endDate: string };
    };
  };
}

// ─── Accent KPI Card ───
const KpiCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  accent: string;
  subtitle?: string;
  loading?: boolean;
}> = ({ title, value, icon, accent, subtitle, loading }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2.5,
      borderRadius: 3,
      border: '1px solid rgba(0,0,0,0.04)',
      borderLeft: `4px solid ${accent}`,
      bgcolor: '#fff',
      height: '100%',
      transition: 'box-shadow 0.2s',
      '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.06)' },
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
      <Box sx={{ color: accent, display: 'flex', '& .MuiSvgIcon-root': { fontSize: 18 } }}>{icon}</Box>
      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.72rem', letterSpacing: '0.3px' }}>
        {title}
      </Typography>
    </Box>
    <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '1.5rem', lineHeight: 1.2 }}>
      {loading ? <CircularProgress size={20} /> : value}
    </Typography>
    {subtitle && (
      <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.72rem', mt: 0.5, display: 'block' }}>
        {subtitle}
      </Typography>
    )}
  </Paper>
);

// ─── Section Paper ───
const SectionPaper: React.FC<{ children: React.ReactNode; sx?: any }> = ({ children, sx }) => (
  <Paper
    elevation={0}
    sx={{
      p: { xs: 2, md: 3 },
      borderRadius: 3,
      border: '1px solid rgba(0,0,0,0.04)',
      bgcolor: '#fff',
      ...sx,
    }}
  >
    {children}
  </Paper>
);

// ─── Custom tooltip ───
const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{
      bgcolor: '#0f172a', borderRadius: 2, px: 2, py: 1.5, boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
    }}>
      <Typography sx={{ color: '#94a3b8', fontSize: '0.72rem', mb: 0.5 }}>{label}</Typography>
      {payload.map((p: any, i: number) => (
        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: p.color }} />
          <Typography sx={{ color: '#fff', fontSize: '0.8rem', fontWeight: 500 }}>
            {p.name}: {p.value}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

// ─── Pie tooltip ───
const CustomPieTooltip: React.FC<any> = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{ bgcolor: '#0f172a', borderRadius: 2, px: 2, py: 1, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
      <Typography sx={{ color: '#fff', fontSize: '0.8rem', fontWeight: 600 }}>
        {payload[0].name}: {payload[0].value}
      </Typography>
    </Box>
  );
};

const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

const StudentStatisticsPanel: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [loading, setLoading] = useState<boolean>(false);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [summaryData, setSummaryData] = useState<SummaryData>({
    totalNewEnrollments: 0, totalCompletions: 0, netChange: 0,
    period: { startDate: '', endDate: '' },
  });
  const [error, setError] = useState<string>('');

  const fetchMonthlyData = async (): Promise<void> => {
    setLoading(true);
    setError('');
    try {
      const res: ApiResponse = await getMonthlyStudentChangeAPI({ year: selectedYear });
      const apiData = (res as any).data?.data || (res as any).data || {};

      const months: MonthlyData[] = [];
      (apiData.increase || []).forEach((item: { year: number; month: number; count: number }) => {
        months.push({
          year: item.year, month: item.month, monthName: `Th${item.month}`,
          newStudents: item.count, leftStudents: 0, netChange: item.count, students: item.count,
        });
      });
      (apiData.decrease || []).forEach((item: { year: number; month: number; count: number }) => {
        const idx = months.findIndex(m => m.year === item.year && m.month === item.month);
        if (idx !== -1) {
          months[idx].leftStudents = item.count;
          months[idx].netChange = (months[idx].newStudents || 0) - item.count;
        } else {
          months.push({
            year: item.year, month: item.month, monthName: `Th${item.month}`,
            newStudents: 0, leftStudents: item.count, netChange: -item.count, students: 0,
          });
        }
      });

      months.sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month);

      const now = new Date();
      const isCurrentYear = selectedYear === now.getFullYear();
      const currentMonth = isCurrentYear ? now.getMonth() + 1 : 12;

      const fullMonths: MonthlyData[] = Array.from({ length: 12 }, (_, i) => {
        const monthNum = i + 1;
        const found = months.find(m => m.month === monthNum && m.year === selectedYear);
        if (monthNum > currentMonth) {
          return { year: selectedYear, month: monthNum, monthName: `Th${monthNum}`, newStudents: 0, leftStudents: 0, netChange: 0, students: 0 };
        }
        return found || { year: selectedYear, month: monthNum, monthName: `Th${monthNum}`, newStudents: 0, leftStudents: 0, netChange: 0, students: 0 };
      });

      for (let i = 0; i < 12; i++) {
        if (i === 0) {
          fullMonths[i].students = fullMonths[i].newStudents;
        } else {
          fullMonths[i].students = fullMonths[i - 1].students + fullMonths[i].newStudents - fullMonths[i].leftStudents;
        }
        if (i + 1 > currentMonth) {
          fullMonths[i].students = 0;
          fullMonths[i].newStudents = 0;
          fullMonths[i].leftStudents = 0;
          fullMonths[i].netChange = 0;
        }
      }

      setMonthlyData(fullMonths);
      setSummaryData({
        totalNewEnrollments: apiData.summary?.totalIncrease || 0,
        totalCompletions: apiData.summary?.totalDecrease || 0,
        netChange: apiData.summary?.netChange || 0,
        period: apiData.summary?.period || { startDate: '', endDate: '' },
      });
    } catch (err) {
      console.error('Error fetching monthly data:', err);
      setError('Không thể tải dữ liệu thống kê');
      setMonthlyData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMonthlyData(); }, [selectedYear]);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentMonthData = monthlyData.find(m => m.month === currentMonth && m.year === selectedYear);
  const prevMonthData = monthlyData.find(m => m.month === currentMonth - 1 && m.year === selectedYear);
  let growthPercent: number | null = null;
  if (currentMonth > 1 && currentMonthData && prevMonthData) {
    const prev = prevMonthData.students || 0;
    const curr = currentMonthData.students || 0;
    growthPercent = prev > 0 ? ((curr - prev) / prev) * 100 : curr > 0 ? 100 : 0;
  }

  // Pie data: new vs retained
  const totalStudents = currentMonthData?.students || summaryData.totalNewEnrollments;
  const newStudents = summaryData.totalNewEnrollments;
  const retainedStudents = Math.max(totalStudents - newStudents, 0);
  const pieData = [
    { name: 'Học viên mới', value: newStudents },
    { name: 'Học viên cũ', value: retainedStudents },
  ].filter(d => d.value > 0);
  const PIE_COLORS = [CHART_COLORS.primary, CHART_COLORS.success];

  // Active months for table (only months with data)
  const activeMonths = monthlyData.filter(m => m.students > 0 || m.newStudents > 0 || m.leftStudents > 0);

  return (
    <Box>
      {/* ═══ Header ═══ */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a', letterSpacing: '-0.5px' }}>
            Thống kê học sinh
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
            Phân tích biến động học viên — Năm {selectedYear}
          </Typography>
        </Box>
        <TextField
          select
          size="small"
          value={selectedYear}
          onChange={e => setSelectedYear(Number(e.target.value))}
          sx={{
            minWidth: 120,
            '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fff' },
          }}
        >
          {years.map(year => <MenuItem key={year} value={year}>{year}</MenuItem>)}
        </TextField>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
      )}

      {/* ═══ KPI Cards ═══ */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <KpiCard
            title="TỔNG HS MỚI"
            value={summaryData.totalNewEnrollments}
            icon={<PersonAddIcon />}
            accent={CHART_COLORS.primary}
            subtitle={`Năm ${selectedYear}`}
            loading={loading}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <KpiCard
            title="HS RỜI ĐI"
            value={summaryData.totalCompletions}
            icon={<PersonOffIcon />}
            accent={CHART_COLORS.warning}
            subtitle="Hoàn thành / nghỉ học"
            loading={loading}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <KpiCard
            title={summaryData.netChange >= 0 ? 'TĂNG RÒNG' : 'GIẢM RÒNG'}
            value={`${summaryData.netChange >= 0 ? '+' : ''}${summaryData.netChange}`}
            icon={summaryData.netChange >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
            accent={summaryData.netChange >= 0 ? CHART_COLORS.success : CHART_COLORS.danger}
            loading={loading}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <KpiCard
            title="TĂNG TRƯỞNG"
            value={growthPercent === null ? 'N/A' : `${growthPercent > 0 ? '+' : ''}${growthPercent.toFixed(1)}%`}
            icon={<ShowChartIcon />}
            accent={CHART_COLORS.purple}
            subtitle={`So với tháng ${currentMonth - 1}`}
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* ═══ Charts Row: Mixed Chart + Pie ═══ */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Mixed Chart */}
        <Grid item xs={12} lg={pieData.length > 0 ? 8 : 12}>
          <SectionPaper>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', mb: 0.5 }}>
              Biến động học sinh theo tháng
            </Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 2 }}>
              Tổng số học sinh (cột) & Thay đổi ròng (đường)
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={340}>
                <ComposedChart data={monthlyData} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHART_COLORS.primary} stopOpacity={0.85} />
                      <stop offset="100%" stopColor={CHART_COLORS.primary} stopOpacity={0.45} />
                    </linearGradient>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHART_COLORS.success} stopOpacity={0.15} />
                      <stop offset="100%" stopColor={CHART_COLORS.success} stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="rgba(0,0,0,0.05)" vertical={false} />
                  <XAxis
                    dataKey="monthName"
                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                    axisLine={{ stroke: 'rgba(0,0,0,0.06)' }}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: '0.78rem', paddingTop: 8 }}
                    iconType="circle"
                    iconSize={8}
                  />
                  <Bar
                    dataKey="students"
                    name="Tổng học sinh"
                    fill="url(#barGrad)"
                    radius={[4, 4, 0, 0]}
                    barSize={28}
                  />
                  <Area
                    type="monotone"
                    dataKey="newStudents"
                    name="HS mới"
                    fill="url(#areaGrad)"
                    stroke={CHART_COLORS.success}
                    strokeWidth={2.5}
                    dot={{ fill: CHART_COLORS.success, strokeWidth: 0, r: 3 }}
                    activeDot={{ r: 5, fill: CHART_COLORS.success }}
                  />
                  <Line
                    type="monotone"
                    dataKey="leftStudents"
                    name="HS rời đi"
                    stroke={CHART_COLORS.danger}
                    strokeWidth={2}
                    strokeDasharray="5 3"
                    dot={{ fill: CHART_COLORS.danger, strokeWidth: 0, r: 3 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </SectionPaper>
        </Grid>

        {/* Pie Chart */}
        {pieData.length > 0 && (
          <Grid item xs={12} lg={4}>
            <SectionPaper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', mb: 0.5 }}>
                Cơ cấu học viên
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 2 }}>
                Phân loại theo trạng thái tuyển sinh
              </Typography>
              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 220 }}>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              {/* Legend */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 1, flexWrap: 'wrap' }}>
                {pieData.map((entry, i) => (
                  <Box key={entry.name} sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: PIE_COLORS[i] }} />
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                      {entry.name} ({entry.value})
                    </Typography>
                  </Box>
                ))}
              </Box>
            </SectionPaper>
          </Grid>
        )}
      </Grid>

      {/* ═══ Data Table ═══ */}
      {activeMonths.length > 0 && (
        <SectionPaper>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <GroupsIcon sx={{ fontSize: 20, color: '#64748b' }} />
            Chi tiết theo tháng
          </Typography>
          <TableContainer sx={{ '& .MuiTableCell-root': { borderColor: 'rgba(0,0,0,0.04)' } }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ '& th': { fontWeight: 600, fontSize: '0.78rem', color: '#64748b', py: 1.5 } }}>
                  <TableCell>Tháng</TableCell>
                  <TableCell align="right">HS mới</TableCell>
                  <TableCell align="right">HS rời đi</TableCell>
                  <TableCell align="right">Biến động</TableCell>
                  <TableCell align="right">Tổng HS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activeMonths.map((m) => (
                  <TableRow key={m.month} sx={{ '&:hover': { bgcolor: 'rgba(0,0,0,0.015)' }, '&:last-child td': { borderBottom: 0 } }}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} color="#1e293b" sx={{ fontSize: '0.85rem' }}>
                        Tháng {m.month}/{m.year}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600} color={CHART_COLORS.success} sx={{ fontSize: '0.85rem' }}>
                        {m.newStudents > 0 ? `+${m.newStudents}` : '0'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600} color={m.leftStudents > 0 ? CHART_COLORS.danger : '#94a3b8'} sx={{ fontSize: '0.85rem' }}>
                        {m.leftStudents > 0 ? `-${m.leftStudents}` : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        color={m.netChange > 0 ? CHART_COLORS.success : m.netChange < 0 ? CHART_COLORS.danger : '#94a3b8'}
                        sx={{ fontSize: '0.85rem' }}
                      >
                        {m.netChange > 0 ? `+${m.netChange}` : m.netChange < 0 ? m.netChange : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={700} color="#0f172a" sx={{ fontSize: '0.9rem' }}>
                        {m.students}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </SectionPaper>
      )}
    </Box>
  );
};

export default StudentStatisticsPanel;
