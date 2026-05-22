import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, Grid, Alert, Skeleton, Button, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  EmojiEvents as EmojiEventsIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import StatCard from '../../common/StatCard';
import { getStudentTestAttemptsAPI } from '../../../services/students';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar,
} from 'recharts';

// ─── Types ──────────────────────────────────────
interface TestAttemptItem {
  id: string;
  testTitle: string;
  testSkillType: string;
  className: string;
  score: number;
  percentage: number;
  passed: boolean;
  submittedAt: string;
}

interface SkillData {
  averageScore: number;
  count: number;
}

interface TestSummary {
  totalAttempts: number;
  averageScore: number;
  passRate: number;
  bestSkill: string;
  bySkillType: Record<string, SkillData>;
}

interface TrendPoint {
  percentage: number;
  submittedAt: string;
  skillType: string;
}

interface TestAttemptsResponse {
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  summary: TestSummary;
  charts: {
    trend: TrendPoint[];
    skillBreakdown: Record<string, SkillData>;
  };
  attempts: TestAttemptItem[];
}

// ─── Helpers ────────────────────────────────────
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

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const formatShortDate = (dateStr: string): string => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
  });
};

// ─── Component ──────────────────────────────────
interface Props {
  studentId: string;
}

const ChildTestResults: React.FC<Props> = ({ studentId }) => {
  const [data, setData] = useState<TestAttemptsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getStudentTestAttemptsAPI(studentId, 1, 50);
      const payload = (res as any)?.data?.data ?? (res as any)?.data ?? res?.data;
      setData(payload);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể tải dữ liệu kết quả học tập');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) fetchData();
  }, [studentId]);

  // Prepare chart data
  const trendChartData = useMemo(() => {
    if (!data?.charts?.trend) return [];
    return data.charts.trend.map((p) => ({
      ...p,
      date: formatShortDate(p.submittedAt),
      label: `${p.percentage}%`,
    }));
  }, [data]);

  const radarData = useMemo(() => {
    if (!data?.summary?.bySkillType) return [];
    const allSkills = ['reading', 'writing', 'speaking', 'listening'];
    return allSkills.map((skill) => ({
      skill: SKILL_LABELS[skill] || skill,
      score: data.summary.bySkillType[skill]?.averageScore || 0,
      fullMark: 100,
    }));
  }, [data]);

  // ─── Loading State ─────────────────────────────
  if (loading) {
    return (
      <Box>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[0, 1, 2, 3].map((i) => (
            <Grid item xs={6} sm={3} key={i}>
              <Skeleton variant="rounded" height={100} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
        <Skeleton variant="rounded" height={250} sx={{ borderRadius: 3, mb: 2 }} />
        <Skeleton variant="rounded" height={200} sx={{ borderRadius: 3 }} />
      </Box>
    );
  }

  // ─── Error State ───────────────────────────────
  if (error) {
    return (
      <Box textAlign="center" py={4}>
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchData}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Thử lại
        </Button>
      </Box>
    );
  }

  // ─── Empty State ───────────────────────────────
  if (!data || data.summary.totalAttempts === 0) {
    return (
      <Box textAlign="center" py={6}>
        <AssignmentIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Chưa có kết quả bài test
        </Typography>
        <Typography variant="body2" color="text.disabled">
          Con bạn chưa làm bài test nào. Kết quả sẽ hiển thị tại đây sau khi hoàn thành bài test.
        </Typography>
      </Box>
    );
  }

  const { summary, attempts } = data;

  return (
    <Box component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      {/* ═══════ Summary Cards ═══════ */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={3}>
          <StatCard
            title="Tổng bài test"
            value={summary.totalAttempts}
            icon={<AssignmentIcon sx={{ fontSize: 28 }} />}
            color="primary"
            index={0}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            title="Điểm trung bình"
            value={`${summary.averageScore}%`}
            icon={<TrendingUpIcon sx={{ fontSize: 28 }} />}
            color="info"
            index={1}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            title="Tỷ lệ đạt"
            value={`${summary.passRate}%`}
            icon={<EmojiEventsIcon sx={{ fontSize: 28 }} />}
            color="success"
            index={2}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            title="Kỹ năng tốt nhất"
            value={SKILL_LABELS[summary.bestSkill] || 'N/A'}
            icon={<StarIcon sx={{ fontSize: 28 }} />}
            color="warning"
            index={3}
          />
        </Grid>
      </Grid>

      {/* ═══════ Charts Row ═══════ */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Progress Line Chart */}
        {trendChartData.length > 1 && (
          <Grid item xs={12} md={radarData.some(d => d.score > 0) ? 7 : 12}>
            <Paper sx={{
              p: 3,
              borderRadius: 3,
              background: 'linear-gradient(to bottom right, #ffffff, #f8fafc)',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
            }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
                📈 Biểu đồ tiến bộ
              </Typography>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={trendChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    unit="%"
                  />
                  <RechartsTooltip
                    formatter={(value: number) => [`${value}%`, 'Điểm']}
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="percentage"
                    stroke="#3B82F6"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#3B82F6', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}

        {/* Radar Chart */}
        {radarData.some(d => d.score > 0) && (
          <Grid item xs={12} md={trendChartData.length > 1 ? 5 : 12}>
            <Paper sx={{
              p: 3,
              borderRadius: 3,
              background: 'linear-gradient(to bottom right, #ffffff, #f8fafc)',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
              height: '100%',
            }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
                🎯 Phân bố kỹ năng
              </Typography>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis
                    dataKey="skill"
                    tick={{ fontSize: 12, fontWeight: 600, fill: '#475569' }}
                  />
                  <PolarRadiusAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 10 }}
                    axisLine={false}
                  />
                  <Radar
                    dataKey="score"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* ═══════ Skill Breakdown Chips ═══════ */}
      {Object.keys(summary.bySkillType).length > 0 && (
        <Box sx={{ mb: 3, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          {Object.entries(summary.bySkillType).map(([skill, data]) => (
            <Chip
              key={skill}
              label={`${SKILL_LABELS[skill] || skill}: ${data.averageScore}% (${data.count} bài)`}
              sx={{
                fontWeight: 600,
                bgcolor: `${SKILL_COLORS[skill] || '#64748B'}15`,
                color: SKILL_COLORS[skill] || '#64748B',
                border: `1px solid ${SKILL_COLORS[skill] || '#64748B'}30`,
                '& .MuiChip-label': { px: 1.5 },
              }}
            />
          ))}
        </Box>
      )}

      {/* ═══════ Attempts Table ═══════ */}
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
          📋 Lịch sử bài test ({summary.totalAttempts} bài)
        </Typography>
        <Box sx={{
          background: 'linear-gradient(to bottom right, #f8fafc, #f1f5f9)',
          border: '1px solid #e2e8f0',
          borderRadius: 3,
          p: { xs: 1, sm: 2 },
        }}>
          <TableContainer sx={{ bgcolor: 'transparent', boxShadow: 'none' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', color: 'text.secondary', letterSpacing: '0.5px' }}>Bài test</TableCell>
                  <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', color: 'text.secondary', letterSpacing: '0.5px' }}>Lớp</TableCell>
                  <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', color: 'text.secondary', letterSpacing: '0.5px' }}>Loại</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', color: 'text.secondary', letterSpacing: '0.5px' }}>Điểm</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', color: 'text.secondary', letterSpacing: '0.5px' }}>Kết quả</TableCell>
                  <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', color: 'text.secondary', letterSpacing: '0.5px' }}>Ngày</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attempts.map((attempt) => (
                  <TableRow
                    key={attempt.id}
                    sx={{
                      transition: 'all 0.2s',
                      '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.6)' },
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        {attempt.testTitle}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {attempt.className}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{
                        display: 'inline-flex',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: '12px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        bgcolor: `${SKILL_COLORS[attempt.testSkillType] || '#64748B'}15`,
                        color: SKILL_COLORS[attempt.testSkillType] || '#64748B',
                        border: `1px solid ${SKILL_COLORS[attempt.testSkillType] || '#64748B'}25`,
                        textTransform: 'capitalize',
                      }}>
                        {SKILL_LABELS[attempt.testSkillType] || attempt.testSkillType}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          color: attempt.percentage >= 70 ? 'success.main' : attempt.percentage >= 50 ? 'warning.main' : 'error.main',
                        }}
                      >
                        {attempt.percentage}%
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {attempt.passed ? (
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, color: 'success.main' }}>
                          <CheckCircleIcon sx={{ fontSize: 16 }} />
                          <Typography variant="caption" sx={{ fontWeight: 700 }}>Đạt</Typography>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, color: 'error.main' }}>
                          <CancelIcon sx={{ fontSize: 16 }} />
                          <Typography variant="caption" sx={{ fontWeight: 700 }}>Chưa đạt</Typography>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                        {formatDate(attempt.submittedAt)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </Box>
  );
};

export default ChildTestResults;
