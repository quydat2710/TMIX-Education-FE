import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, CircularProgress, TextField, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, LinearProgress,
} from '@mui/material';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Cell, Legend,
} from 'recharts';
import {
  EmojiEvents as TrophyIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckIcon,
  Groups as GroupsIcon,
} from '@mui/icons-material';
import { getLearningAnalyticsAPI } from '../../services/dashboard';

// ─── Design tokens ───
const SKILL_COLORS: Record<string, string> = {
  reading: '#3B82F6',
  writing: '#10B981',
  speaking: '#F59E0B',
  listening: '#8B5CF6',
};

const SKILL_LABELS: Record<string, string> = {
  reading: 'Reading',
  writing: 'Writing',
  speaking: 'Speaking',
  listening: 'Listening',
};

const RANK_COLORS = ['#F59E0B', '#94A3B8', '#CD7F32', '#64748B', '#64748B'];

// ─── KPI Card ───
const KpiCard: React.FC<{
  title: string; value: string | number; icon: React.ReactNode;
  accent: string; subtitle?: string; loading?: boolean;
}> = ({ title, value, icon, accent, subtitle, loading }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2.5, borderRadius: 3, border: '1px solid rgba(0,0,0,0.04)',
      borderLeft: `4px solid ${accent}`, bgcolor: '#fff', height: '100%',
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
      p: { xs: 2, md: 3 }, borderRadius: 3, border: '1px solid rgba(0,0,0,0.04)', bgcolor: '#fff', ...sx,
    }}
  >
    {children}
  </Paper>
);

// ─── Custom Tooltip ───
const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{ bgcolor: '#0f172a', borderRadius: 2, px: 2, py: 1.5, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
      <Typography sx={{ color: '#94a3b8', fontSize: '0.72rem', mb: 0.5 }}>{label}</Typography>
      {payload.map((p: any, i: number) => (
        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: p.color }} />
          <Typography sx={{ color: '#fff', fontSize: '0.8rem', fontWeight: 500 }}>
            {p.name}: {typeof p.value === 'number' ? `${p.value}%` : p.value}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

// ═══════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════
const LearningStatisticsPanel: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<any>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  useEffect(() => {
    fetchData();
  }, [selectedYear]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getLearningAnalyticsAPI({ year: selectedYear });
      const apiData = (res as any)?.data?.data || (res as any)?.data || {};
      setData(apiData);
    } catch (err) {
      console.error('Error fetching learning analytics:', err);
      setError('Không thể tải dữ liệu thống kê học tập');
    } finally {
      setLoading(false);
    }
  };

  const testPerformance = data?.testPerformance || [];
  const summary = data?.summary || {};
  const classRanking = data?.classRanking || [];

  // Radar chart data
  const radarData = ['reading', 'listening', 'speaking', 'writing'].map(skill => {
    const found = testPerformance.find((p: any) => p.skillType === skill);
    return {
      skill: SKILL_LABELS[skill],
      avgScore: found?.avgScore || 0,
      passRate: found?.passRate || 0,
      fullMark: 100,
    };
  });

  // Bar chart data for skills
  const skillBarData = testPerformance.map((p: any) => ({
    name: SKILL_LABELS[p.skillType] || p.skillType,
    'Điểm TB': p.avgScore,
    'Tỷ lệ đạt': p.passRate,
    color: SKILL_COLORS[p.skillType] || '#64748b',
  }));

  return (
    <Box>
      {/* ═══ Header ═══ */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a', letterSpacing: '-0.5px' }}>
            Thống kê học tập
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
            Phân tích hiệu suất bài kiểm tra theo kỹ năng và xếp hạng lớp học — Năm {selectedYear}
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

      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

      {/* ═══ KPI Cards ═══ */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <KpiCard
            title="TỔNG BÀI THI"
            value={summary.totalAttempts || 0}
            icon={<AssignmentIcon />}
            accent="#3B82F6"
            subtitle="Lượt làm bài"
            loading={loading}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <KpiCard
            title="ĐIỂM TRUNG BÌNH"
            value={summary.overallAvgScore ? `${summary.overallAvgScore}%` : 'N/A'}
            icon={<TrendingUpIcon />}
            accent="#8B5CF6"
            subtitle="Toàn hệ thống"
            loading={loading}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <KpiCard
            title="TỶ LỆ ĐẠT"
            value={summary.overallPassRate ? `${summary.overallPassRate}%` : 'N/A'}
            icon={<CheckIcon />}
            accent="#10B981"
            subtitle="Trung bình các kỹ năng"
            loading={loading}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <KpiCard
            title="HỌC SINH ĐÃ THI"
            value={summary.totalStudentsTested || 0}
            icon={<GroupsIcon />}
            accent="#F59E0B"
            subtitle="Học viên tham gia"
            loading={loading}
          />
        </Grid>
      </Grid>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* ═══ Charts: Radar + Skill Bars ═══ */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {/* Radar Chart */}
            <Grid item xs={12} lg={5}>
              <SectionPaper sx={{ height: '100%' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', mb: 0.5 }}>
                  Phân bố kỹ năng
                </Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 2 }}>
                  Điểm trung bình theo 4 kỹ năng
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(0,0,0,0.08)" />
                    <PolarAngleAxis
                      dataKey="skill"
                      tick={{ fontSize: 13, fontWeight: 600, fill: '#475569' }}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 100]}
                      tick={{ fontSize: 10, fill: '#94a3b8' }}
                    />
                    <Radar
                      name="Điểm TB"
                      dataKey="avgScore"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                    <Radar
                      name="Tỷ lệ đạt"
                      dataKey="passRate"
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.1}
                      strokeWidth={2}
                      strokeDasharray="5 3"
                    />
                    <Legend
                      wrapperStyle={{ fontSize: '0.78rem', paddingTop: 8 }}
                      iconType="circle"
                      iconSize={8}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </SectionPaper>
            </Grid>

            {/* Skill Bar Chart */}
            <Grid item xs={12} lg={7}>
              <SectionPaper sx={{ height: '100%' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', mb: 0.5 }}>
                  Hiệu suất theo kỹ năng
                </Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 2 }}>
                  So sánh điểm trung bình và tỷ lệ đạt
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={skillBarData} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="4 4" stroke="rgba(0,0,0,0.05)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 13, fill: '#475569', fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '0.78rem', paddingTop: 8 }} iconType="circle" iconSize={8} />
                    <Bar dataKey="Điểm TB" radius={[4, 4, 0, 0]} maxBarSize={40}>
                      {skillBarData.map((entry: any, index: number) => (
                        <Cell key={index} fill={entry.color} fillOpacity={0.85} />
                      ))}
                    </Bar>
                    <Bar dataKey="Tỷ lệ đạt" radius={[4, 4, 0, 0]} maxBarSize={40}>
                      {skillBarData.map((entry: any, index: number) => (
                        <Cell key={index} fill={entry.color} fillOpacity={0.45} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                {/* Skill detail cards */}
                <Box sx={{ display: 'flex', gap: 1.5, mt: 2, flexWrap: 'wrap' }}>
                  {testPerformance.map((p: any) => (
                    <Box
                      key={p.skillType}
                      sx={{
                        flex: '1 1 120px', p: 1.5, borderRadius: 2,
                        bgcolor: `${SKILL_COLORS[p.skillType]}08`,
                        border: `1px solid ${SKILL_COLORS[p.skillType]}20`,
                      }}
                    >
                      <Typography variant="caption" sx={{ color: SKILL_COLORS[p.skillType], fontWeight: 700, fontSize: '0.7rem' }}>
                        {SKILL_LABELS[p.skillType]}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a', mt: 0.3 }}>
                        {p.avgScore}% <span style={{ fontWeight: 400, color: '#94a3b8', fontSize: '0.72rem' }}>({p.totalAttempts} lượt)</span>
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </SectionPaper>
            </Grid>
          </Grid>

          {/* ═══ Class Ranking Table ═══ */}
          {classRanking.length > 0 && (
            <SectionPaper>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrophyIcon sx={{ fontSize: 20, color: '#F59E0B' }} />
                Xếp hạng lớp học
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 2 }}>
                Tổng hợp điểm thi (60%) + chuyên cần (40%) — Chỉ tính lớp đang hoạt động
              </Typography>
              <TableContainer sx={{ '& .MuiTableCell-root': { borderColor: 'rgba(0,0,0,0.04)' } }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ '& th': { fontWeight: 600, fontSize: '0.78rem', color: '#64748b', py: 1.5 } }}>
                      <TableCell width={60}>#</TableCell>
                      <TableCell>Lớp học</TableCell>
                      <TableCell align="center">Điểm TB</TableCell>
                      <TableCell align="center">Tỷ lệ đạt</TableCell>
                      <TableCell align="center">Chuyên cần</TableCell>
                      <TableCell align="center">Số lượt thi</TableCell>
                      <TableCell align="center">Điểm tổng hợp</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {classRanking.map((cls: any, idx: number) => (
                      <TableRow
                        key={cls.classId}
                        sx={{
                          '&:hover': { bgcolor: 'rgba(0,0,0,0.015)' },
                          '&:last-child td': { borderBottom: 0 },
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {idx < 3 ? (
                              <TrophyIcon sx={{ fontSize: 18, color: RANK_COLORS[idx] }} />
                            ) : (
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#94a3b8', pl: 0.5 }}>
                                {idx + 1}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600} color="#1e293b" sx={{ fontSize: '0.85rem' }}>
                            {cls.className}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={`${cls.avgTestScore}%`}
                            size="small"
                            sx={{
                              fontWeight: 700, fontSize: '0.78rem',
                              bgcolor: cls.avgTestScore >= 70 ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                              color: cls.avgTestScore >= 70 ? '#059669' : '#dc2626',
                              border: `1px solid ${cls.avgTestScore >= 70 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'}`,
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" fontWeight={600} color={cls.passRate >= 70 ? '#059669' : '#dc2626'} sx={{ fontSize: '0.85rem' }}>
                            {cls.passRate}%
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                            <Box sx={{ flex: 1, maxWidth: 60 }}>
                              <LinearProgress
                                variant="determinate"
                                value={cls.attendanceRate}
                                sx={{
                                  height: 6, borderRadius: 3,
                                  bgcolor: 'rgba(0,0,0,0.06)',
                                  '& .MuiLinearProgress-bar': {
                                    borderRadius: 3,
                                    bgcolor: cls.attendanceRate >= 80 ? '#059669' : cls.attendanceRate >= 60 ? '#d97706' : '#dc2626',
                                  },
                                }}
                              />
                            </Box>
                            <Typography variant="caption" fontWeight={600} color="#475569">
                              {cls.attendanceRate}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" color="#64748b" sx={{ fontSize: '0.85rem' }}>
                            {cls.totalAttempts}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            icon={<SchoolIcon sx={{ fontSize: '14px !important' }} />}
                            label={cls.compositeScore}
                            size="small"
                            sx={{
                              fontWeight: 700, fontSize: '0.82rem',
                              bgcolor: idx === 0 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(30, 58, 138, 0.06)',
                              color: idx === 0 ? '#d97706' : '#1e3a8a',
                              border: `1px solid ${idx === 0 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(30, 58, 138, 0.1)'}`,
                              '& .MuiChip-icon': { color: 'inherit' },
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </SectionPaper>
          )}
        </>
      )}
    </Box>
  );
};

export default LearningStatisticsPanel;
