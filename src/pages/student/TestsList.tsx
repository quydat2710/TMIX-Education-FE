// Student Test List Page
// Displays available tests, past attempts, and statistics

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Typography,
    Box,
    Card,
    CardContent,
    Button,
    Tabs,
    Tab,
    Grid,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Alert,
    IconButton,
    Tooltip,
    LinearProgress,
} from '@mui/material';
import {
    Assignment as AssignmentIcon,
    PlayArrow as PlayArrowIcon,
    Visibility as VisibilityIcon,
    Schedule as ScheduleIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Quiz as QuizIcon,
    EmojiEvents as TrophyIcon,
    School as SchoolIcon,
    Person as PersonIcon,
    Star as StarIcon,
    BarChart as BarChartIcon,
    TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import {
    XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
    ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend,
    AreaChart, Area,
} from 'recharts';
import { getStudentAvailableTests, getStudentAttempts } from '../../services/tests';
import { StudentTestItem, TestAttempt } from '../../types/test';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { COLORS } from '../../utils/colors';

const SKILL_LABELS: Record<string, string> = {
    reading: 'Reading',
    listening: 'Listening',
    writing: 'Writing',
    speaking: 'Speaking',
};

const CHART_COLORS = ['#667eea', '#38bdf8', '#4ade80', '#fbbf24', '#f87171', '#f093fb'];

// 3D Bar Shape Component
const Bar3D = (props: any) => {
    const { x, y, width, height, fill } = props;
    if (!height || height <= 0) return null;
    const depth = 14;
    const topSkew = 12;
    // Front face base color
    const frontFill = fill || '#667eea';
    return (
        <g>
            {/* Right side face (Darkened) */}
            <path
                d={`M${x + width},${y} L${x + width + depth},${y - topSkew} L${x + width + depth},${y + height - topSkew} L${x + width},${y + height} Z`}
                fill={frontFill}
            />
            {/* Shadow overlay for right side */}
            <path
                d={`M${x + width},${y} L${x + width + depth},${y - topSkew} L${x + width + depth},${y + height - topSkew} L${x + width},${y + height} Z`}
                fill="#000"
                opacity={0.35}
            />
            {/* Top face (Lightened) */}
            <path
                d={`M${x},${y} L${x + depth},${y - topSkew} L${x + width + depth},${y - topSkew} L${x + width},${y} Z`}
                fill={frontFill}
            />
            {/* Highlight overlay for top side */}
            <path
                d={`M${x},${y} L${x + depth},${y - topSkew} L${x + width + depth},${y - topSkew} L${x + width},${y} Z`}
                fill="#fff"
                opacity={0.3}
            />
            {/* Front face */}
            <rect x={x} y={y} width={width} height={height} fill={frontFill} rx={2} ry={2} />
            {/* Gloss highlight on front face */}
            <rect x={x + 2} y={y + 2} width={width * 0.4} height={Math.min(height - 4, 60)} fill="rgba(255,255,255,0.2)" rx={2} ry={2} />
        </g>
    );
};

const TestsList: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(0);
    const [availableTests, setAvailableTests] = useState<StudentTestItem[]>([]);
    const [attempts, setAttempts] = useState<TestAttempt[]>([]);
    const [statsAttempts, setStatsAttempts] = useState<TestAttempt[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError('');

            if (activeTab === 0) {
                const response = await getStudentAvailableTests();
                setAvailableTests(response.data);
            } else if (activeTab === 1) {
                const response = await getStudentAttempts();
                setAttempts(response.data.result || []);
            } else if (activeTab === 2) {
                // Load all attempts for statistics (larger limit)
                const response = await getStudentAttempts({ limit: 100 } as any);
                setStatsAttempts(response.data.result || []);
            }
        } catch (err: any) {
            setError(err.message || 'Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const handleStartTest = (testId: string) => {
        navigate(`/student/tests/${testId}/take`);
    };

    const handleViewResult = (attemptId: string) => {
        navigate(`/student/tests/results/${attemptId}`);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('vi-VN');
    };

    // ============ Statistics Computed Data ============
    const scoreOverTime = useMemo(() => {
        if (!statsAttempts.length) return [];
        return [...statsAttempts]
            .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime())
            .map((a) => ({
                date: new Date(a.submittedAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
                percentage: Math.round(a.percentage * 10) / 10,
                testName: a.test?.title || 'Bài kiểm tra',
            }));
    }, [statsAttempts]);

    const avgBySkill = useMemo(() => {
        if (!statsAttempts.length) return [];
        const grouped: Record<string, { total: number; count: number }> = {};
        statsAttempts.forEach((a) => {
            const skill = (a.test as any)?.skillType || 'reading';
            if (!grouped[skill]) grouped[skill] = { total: 0, count: 0 };
            grouped[skill].total += a.percentage;
            grouped[skill].count += 1;
        });
        return Object.entries(grouped).map(([skill, { total, count }]) => ({
            skill: SKILL_LABELS[skill] || skill,
            avg: Math.round((total / count) * 10) / 10,
        }));
    }, [statsAttempts]);

    const passFailData = useMemo(() => {
        if (!statsAttempts.length) return [];
        const passed = statsAttempts.filter((a) => a.passed).length;
        const failed = statsAttempts.length - passed;
        return [
            { name: 'Đạt', value: passed },
            { name: 'Chưa đạt', value: failed },
        ];
    }, [statsAttempts]);

    const overallStats = useMemo(() => {
        if (!statsAttempts.length) return { avg: 0, highest: 0, total: 0, passRate: 0 };
        const percentages = statsAttempts.map((a) => a.percentage);
        const passed = statsAttempts.filter((a) => a.passed).length;
        return {
            avg: Math.round((percentages.reduce((s, p) => s + p, 0) / percentages.length) * 10) / 10,
            highest: Math.round(Math.max(...percentages) * 10) / 10,
            total: statsAttempts.length,
            passRate: Math.round((passed / statsAttempts.length) * 1000) / 10,
        };
    }, [statsAttempts]);

    return (
        <DashboardLayout role="student">
            <Box sx={{ p: { xs: 2, md: 3 } }}>
                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" sx={{
                        fontWeight: 700,
                        color: COLORS.primary.main,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                    }}>
                        <QuizIcon sx={{ fontSize: 36 }} />
                        Bài kiểm tra
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                        Làm bài kiểm tra và xem kết quả của bạn
                    </Typography>
                </Box>

                {/* Tabs */}
                <Paper sx={{
                    borderRadius: 3,
                    mb: 3,
                    overflow: 'hidden',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                }}>
                    <Tabs
                        value={activeTab}
                        onChange={(_, newValue) => setActiveTab(newValue)}
                        sx={{
                            px: 2,
                            '& .MuiTab-root': {
                                fontWeight: 600,
                                fontSize: '0.95rem',
                                textTransform: 'none',
                                minHeight: 56,
                            },
                            '& .MuiTabs-indicator': {
                                height: 3,
                                borderRadius: '3px 3px 0 0',
                            },
                        }}
                    >
                        <Tab
                            label="Bài kiểm tra"
                            icon={<AssignmentIcon sx={{ fontSize: 20 }} />}
                            iconPosition="start"
                        />
                        <Tab
                            label="Lịch sử làm bài"
                            icon={<TrophyIcon sx={{ fontSize: 20 }} />}
                            iconPosition="start"
                        />
                        <Tab
                            label="Thống kê"
                            icon={<BarChartIcon sx={{ fontSize: 20 }} />}
                            iconPosition="start"
                        />
                    </Tabs>
                </Paper>

                {/* Content */}
                {loading ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
                        <CircularProgress size={48} sx={{ color: COLORS.primary.main }} />
                        <Typography sx={{ mt: 2, color: 'text.secondary' }}>Đang tải dữ liệu...</Typography>
                    </Box>
                ) : error ? (
                    <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
                ) : (
                    <>
                        {/* Available Tests Tab */}
                        {activeTab === 0 && (
                            <Grid container spacing={3}>
                                {availableTests.length === 0 ? (
                                    <Grid item xs={12}>
                                        <Paper sx={{
                                            p: 6,
                                            textAlign: 'center',
                                            borderRadius: 3,
                                            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                                        }}>
                                            <QuizIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                                Chưa có bài kiểm tra nào
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Các bài kiểm tra sẽ xuất hiện ở đây khi giáo viên tạo mới
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                ) : (
                                    availableTests.map((test) => (
                                        <Grid item xs={12} sm={6} lg={4} key={test.id}>
                                            <Card sx={{
                                                height: '100%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                borderRadius: 3,
                                                overflow: 'hidden',
                                                transition: 'all 0.3s ease',
                                                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                                                border: '1px solid #f0f0f0',
                                                '&:hover': {
                                                    transform: 'translateY(-4px)',
                                                    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                                                    borderColor: COLORS.primary.main,
                                                },
                                            }}>
                                                {/* Card Header Gradient */}
                                                <Box sx={{
                                                    background: test.hasAttempted
                                                        ? 'linear-gradient(135deg, #1E3A5F 0%, #2d5a8e 100%)'
                                                        : `linear-gradient(135deg, ${COLORS.primary.main} 0%, #e74c3c 100%)`,
                                                    p: 2.5,
                                                    position: 'relative',
                                                    overflow: 'hidden',
                                                }}>
                                                    <Box sx={{
                                                        position: 'absolute',
                                                        top: -20,
                                                        right: -20,
                                                        width: 80,
                                                        height: 80,
                                                        borderRadius: '50%',
                                                        bgcolor: 'rgba(255,255,255,0.1)',
                                                    }} />
                                                    <Typography variant="h6" sx={{
                                                        color: 'white',
                                                        fontWeight: 700,
                                                        fontSize: '1.05rem',
                                                        lineHeight: 1.3,
                                                    }}>
                                                        {test.title}
                                                    </Typography>
                                                    {test.description && (
                                                        <Typography variant="body2" sx={{
                                                            color: 'rgba(255,255,255,0.8)',
                                                            mt: 0.5,
                                                            fontSize: '0.8rem',
                                                            lineHeight: 1.4,
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden',
                                                        }}>
                                                            {test.description}
                                                        </Typography>
                                                    )}
                                                </Box>

                                                <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                                                    {/* Stats Badges */}
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                                        <Chip
                                                            icon={<ScheduleIcon sx={{ fontSize: '16px !important' }} />}
                                                            label={`${test.duration} phút`}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: '#f0f7ff',
                                                                color: '#1565c0',
                                                                fontWeight: 600,
                                                                '& .MuiChip-icon': { color: '#1565c0' },
                                                            }}
                                                        />
                                                        <Chip
                                                            label={`${test.questionCount} câu`}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: '#f0fdf4',
                                                                color: '#16a34a',
                                                                fontWeight: 600,
                                                            }}
                                                        />
                                                        <Chip
                                                            icon={<StarIcon sx={{ fontSize: '14px !important' }} />}
                                                            label={`${test.totalPoints} điểm`}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: '#fffbeb',
                                                                color: '#d97706',
                                                                fontWeight: 600,
                                                                '& .MuiChip-icon': { color: '#d97706' },
                                                            }}
                                                        />
                                                    </Box>

                                                    {/* Info */}
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <SchoolIcon sx={{ fontSize: 16, color: '#888' }} />
                                                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.82rem' }}>
                                                                Lớp: <strong>{test.className}</strong>
                                                            </Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <PersonIcon sx={{ fontSize: 16, color: '#888' }} />
                                                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.82rem' }}>
                                                                GV: <strong>{test.teacherName}</strong>
                                                            </Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <CheckCircleIcon sx={{ fontSize: 16, color: '#888' }} />
                                                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.82rem' }}>
                                                                Điểm đạt: <strong>{test.passingScore}%</strong>
                                                            </Typography>
                                                        </Box>
                                                    </Box>

                                                    {/* Last Attempt Info */}
                                                    {test.hasAttempted && test.lastAttempt && (
                                                        <Box sx={{
                                                            mt: 2,
                                                            p: 1.5,
                                                            borderRadius: 2,
                                                            bgcolor: test.lastAttempt.passed ? '#f0fdf4' : '#fef2f2',
                                                            border: `1px solid ${test.lastAttempt.passed ? '#bbf7d0' : '#fecaca'}`,
                                                        }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                {test.lastAttempt.passed ? (
                                                                    <CheckCircleIcon sx={{ fontSize: 18, color: '#16a34a' }} />
                                                                ) : (
                                                                    <CancelIcon sx={{ fontSize: 18, color: '#dc2626' }} />
                                                                )}
                                                                <Typography variant="body2" sx={{
                                                                    fontWeight: 600,
                                                                    color: test.lastAttempt.passed ? '#16a34a' : '#dc2626',
                                                                    fontSize: '0.82rem',
                                                                }}>
                                                                    Lần thi gần nhất: {test.lastAttempt.percentage.toFixed(1)}% —{' '}
                                                                    {test.lastAttempt.passed ? 'Đạt' : 'Chưa đạt'}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    )}
                                                </CardContent>

                                                {/* Action Button */}
                                                <Box sx={{ p: 2, pt: 0 }}>
                                                    <Button
                                                        variant="contained"
                                                        startIcon={<PlayArrowIcon />}
                                                        onClick={() => handleStartTest(test.id)}
                                                        fullWidth
                                                        sx={{
                                                            borderRadius: 2,
                                                            py: 1.2,
                                                            fontWeight: 600,
                                                            textTransform: 'none',
                                                            fontSize: '0.95rem',
                                                            background: test.hasAttempted
                                                                ? 'linear-gradient(135deg, #1E3A5F 0%, #2d5a8e 100%)'
                                                                : `linear-gradient(135deg, ${COLORS.primary.main} 0%, #e74c3c 100%)`,
                                                            boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
                                                            '&:hover': {
                                                                boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
                                                                transform: 'translateY(-1px)',
                                                            },
                                                            transition: 'all 0.2s',
                                                        }}
                                                    >
                                                        {test.hasAttempted ? 'Làm lại bài' : 'Bắt đầu làm bài'}
                                                    </Button>
                                                </Box>
                                            </Card>
                                        </Grid>
                                    ))
                                )}
                            </Grid>
                        )}

                        {/* My Attempts Tab */}
                        {activeTab === 1 && (
                            <Paper sx={{
                                borderRadius: 3,
                                overflow: 'hidden',
                                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                            }}>
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow sx={{
                                                background: `linear-gradient(135deg, ${COLORS.primary.main} 0%, #1E3A5F 100%)`,
                                            }}>
                                                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Tên bài kiểm tra</TableCell>
                                                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Thời gian nộp</TableCell>
                                                <TableCell align="center" sx={{ color: 'white', fontWeight: 700 }}>Điểm</TableCell>
                                                <TableCell align="center" sx={{ color: 'white', fontWeight: 700 }}>Phần trăm</TableCell>
                                                <TableCell align="center" sx={{ color: 'white', fontWeight: 700 }}>Kết quả</TableCell>
                                                <TableCell align="center" sx={{ color: 'white', fontWeight: 700 }}>Thao tác</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {attempts.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} align="center">
                                                        <Box sx={{ py: 6 }}>
                                                            <TrophyIcon sx={{ fontSize: 56, color: '#ddd', mb: 1 }} />
                                                            <Typography color="text.secondary" variant="h6" sx={{ fontWeight: 500 }}>
                                                                Chưa có lần làm bài nào
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                                                Hãy bắt đầu làm bài kiểm tra để xem kết quả ở đây
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                attempts.map((attempt, index) => (
                                                    <TableRow
                                                        key={attempt.id}
                                                        hover
                                                        sx={{
                                                            bgcolor: index % 2 === 0 ? 'white' : '#fafbfc',
                                                            '&:hover': { bgcolor: '#f0f7ff' },
                                                            transition: 'background 0.2s',
                                                        }}
                                                    >
                                                        <TableCell>
                                                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                                                                {attempt.test?.title || 'Bài kiểm tra'}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {formatDate(attempt.submittedAt)}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                                {attempt.score} / {attempt.test?.totalPoints || 0}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                                                <Box sx={{ width: 60, mr: 1 }}>
                                                                    <LinearProgress
                                                                        variant="determinate"
                                                                        value={attempt.percentage}
                                                                        sx={{
                                                                            height: 6,
                                                                            borderRadius: 3,
                                                                            bgcolor: '#f0f0f0',
                                                                            '& .MuiLinearProgress-bar': {
                                                                                borderRadius: 3,
                                                                                bgcolor: attempt.passed ? '#16a34a' : '#dc2626',
                                                                            },
                                                                        }}
                                                                    />
                                                                </Box>
                                                                <Typography variant="body2" sx={{ fontWeight: 700, minWidth: 45 }}>
                                                                    {attempt.percentage.toFixed(1)}%
                                                                </Typography>
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Chip
                                                                icon={attempt.passed ? <CheckCircleIcon /> : <CancelIcon />}
                                                                label={attempt.passed ? 'Đạt' : 'Chưa đạt'}
                                                                color={attempt.passed ? 'success' : 'error'}
                                                                size="small"
                                                                sx={{ fontWeight: 600 }}
                                                            />
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Tooltip title="Xem kết quả">
                                                                <IconButton
                                                                    color="primary"
                                                                    onClick={() => handleViewResult(attempt.id)}
                                                                    sx={{
                                                                        bgcolor: '#f0f7ff',
                                                                        '&:hover': { bgcolor: '#dbeafe' },
                                                                    }}
                                                                >
                                                                    <VisibilityIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Paper>
                        )}
                        {/* Statistics Tab */}
                        {activeTab === 2 && (
                            <Box sx={{
                                position: 'relative',
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: -100,
                                    left: -100,
                                    right: -100,
                                    bottom: -100,
                                    background: 'radial-gradient(circle at 10% 20%, rgba(102, 126, 234, 0.08) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(240, 147, 251, 0.08) 0%, transparent 40%), radial-gradient(circle at 50% 50%, rgba(74, 222, 128, 0.05) 0%, transparent 60%)',
                                    zIndex: 0,
                                    pointerEvents: 'none',
                                }
                            }}>
                                {statsAttempts.length === 0 ? (
                                    <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                                        <BarChartIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                                        <Typography variant="h6" color="text.secondary" gutterBottom>
                                            Chưa có dữ liệu thống kê
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Hãy làm bài kiểm tra để xem thống kê ở đây
                                        </Typography>
                                    </Paper>
                                ) : (
                                    <>
                                        {/* Summary Cards - Clean Premium */}
                                        <Grid container spacing={2.5} sx={{ mb: 3 }}>
                                            {[
                                                { label: 'Tổng lần thi', value: overallStats.total, color: '#6366f1', icon: <QuizIcon /> },
                                                { label: 'Điểm TB', value: `${overallStats.avg}%`, color: '#ec4899', icon: <TrendingUpIcon /> },
                                                { label: 'Điểm cao nhất', value: `${overallStats.highest}%`, color: '#10b981', icon: <StarIcon /> },
                                                { label: 'Tỷ lệ đạt', value: `${overallStats.passRate}%`, color: '#f59e0b', icon: <CheckCircleIcon /> },
                                            ].map((item, i) => (
                                                <Grid item xs={6} md={3} key={i}>
                                                    <Paper sx={{
                                                        p: 2.5,
                                                        borderRadius: 4,
                                                        bgcolor: '#ffffff',
                                                        border: '1px solid #f1f5f9',
                                                        boxShadow: '0 4px 16px rgba(148, 163, 184, 0.08)',
                                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                        cursor: 'default',
                                                        position: 'relative',
                                                        overflow: 'hidden',
                                                        '&:hover': {
                                                            transform: 'translateY(-4px)',
                                                            boxShadow: '0 12px 24px rgba(148, 163, 184, 0.15)',
                                                            borderColor: `${item.color}40`,
                                                        },
                                                    }}>
                                                        {/* Subtle top accent line */}
                                                        <Box sx={{
                                                            position: 'absolute', top: 0, left: 0, right: 0,
                                                            height: 3,
                                                            bgcolor: item.color,
                                                            opacity: 0.9,
                                                        }} />
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mt: 0.5 }}>
                                                            <Box sx={{
                                                                p: 1.5,
                                                                borderRadius: '50%',
                                                                bgcolor: `${item.color}15`,
                                                                color: item.color,
                                                                display: 'flex',
                                                            }}>
                                                                {item.icon}
                                                            </Box>
                                                            <Box>
                                                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b', mb: 0.5 }}>
                                                                    {item.label}
                                                                </Typography>
                                                                <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
                                                                    {item.value}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </Paper>
                                                </Grid>
                                            ))}
                                        </Grid>

                                        {/* Charts Row */}
                                        <Grid container spacing={3}>
                                            {/* Area Chart - Score over time */}
                                            <Grid item xs={12} lg={8}>
                                                <Paper sx={{
                                                    p: 3,
                                                    borderRadius: 4,
                                                    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                                                    border: '1px solid rgba(102,126,234,0.08)',
                                                    background: 'linear-gradient(180deg, #fefefe 0%, #f8f9ff 100%)',
                                                }}>
                                                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#1e293b' }}>
                                                        📈 Tiến trình điểm theo thời gian
                                                    </Typography>
                                                    <ResponsiveContainer width="100%" height={300}>
                                                        <AreaChart data={scoreOverTime}>
                                                            <defs>
                                                                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                                                                    <stop offset="0%" stopColor="#667eea" stopOpacity={0.35} />
                                                                    <stop offset="95%" stopColor="#667eea" stopOpacity={0.02} />
                                                                </linearGradient>
                                                            </defs>
                                                            <CartesianGrid strokeDasharray="3 3" stroke="#e8ecf4" />
                                                            <XAxis dataKey="date" fontSize={12} tick={{ fill: '#94a3b8' }} axisLine={{ stroke: '#e2e8f0' }} />
                                                            <YAxis domain={[0, 100]} fontSize={12} tick={{ fill: '#94a3b8' }} axisLine={{ stroke: '#e2e8f0' }} />
                                                            <RechartsTooltip
                                                                contentStyle={{
                                                                    borderRadius: 14,
                                                                    border: 'none',
                                                                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                                                                    background: 'rgba(255,255,255,0.95)',
                                                                    backdropFilter: 'blur(8px)',
                                                                    padding: '12px 16px',
                                                                }}
                                                                formatter={(value: number) => [`${value}%`, 'Điểm']}
                                                            />
                                                            <Area
                                                                type="natural"
                                                                dataKey="percentage"
                                                                stroke="#667eea"
                                                                strokeWidth={4}
                                                                fill="url(#scoreGradient)"
                                                                style={{ filter: 'drop-shadow(0 8px 12px rgba(102,126,234,0.45))' }}
                                                                dot={{ fill: '#fff', stroke: '#667eea', strokeWidth: 2.5, r: 5 }}
                                                                activeDot={{ r: 8, fill: '#667eea', stroke: '#fff', strokeWidth: 3, filter: 'drop-shadow(0 2px 4px rgba(102,126,234,0.6))' }}
                                                            />
                                                        </AreaChart>
                                                    </ResponsiveContainer>
                                                </Paper>
                                            </Grid>

                                            {/* Pie Chart - Pass/Fail */}
                                            <Grid item xs={12} lg={4}>
                                                <Paper sx={{
                                                    p: 3,
                                                    borderRadius: 4,
                                                    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                                                    border: '1px solid rgba(74,222,128,0.1)',
                                                    height: '100%',
                                                    background: 'linear-gradient(180deg, #fefefe 0%, #f0fdf4 100%)',
                                                }}>
                                                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#1e293b' }}>
                                                        🎯 Tỷ lệ Đạt / Chưa đạt
                                                    </Typography>
                                                    <Box sx={{
                                                        overflow: 'visible',
                                                        '& .recharts-wrapper': {
                                                            overflow: 'visible !important',
                                                        },
                                                        '& .recharts-surface': {
                                                            overflow: 'visible',
                                                        },
                                                    }}>
                                                        <ResponsiveContainer width="100%" height={300}>
                                                            <PieChart>
                                                                <defs>
                                                                    <linearGradient id="piePass" x1="0" y1="0" x2="1" y2="1">
                                                                        <stop offset="0%" stopColor="#4ade80" />
                                                                        <stop offset="100%" stopColor="#22c55e" />
                                                                    </linearGradient>
                                                                    <linearGradient id="pieFail" x1="0" y1="0" x2="1" y2="1">
                                                                        <stop offset="0%" stopColor="#f87171" />
                                                                        <stop offset="100%" stopColor="#ef4444" />
                                                                    </linearGradient>
                                                                    <filter id="pieShadow" x="-20%" y="-20%" width="140%" height="140%">
                                                                        <feDropShadow dx="0" dy="6" stdDeviation="4" floodColor="#000" floodOpacity="0.15" />
                                                                    </filter>
                                                                </defs>
                                                                {/* Shadow layer for 3D depth */}
                                                                <Pie
                                                                    data={passFailData}
                                                                    cx="50%"
                                                                    cy="45%"
                                                                    innerRadius={45}
                                                                    outerRadius={80}
                                                                    paddingAngle={5}
                                                                    dataKey="value"
                                                                    isAnimationActive={false}
                                                                    style={{ filter: 'url(#pieShadow)', opacity: 0.3 }}
                                                                >
                                                                    <Cell fill="#166534" />
                                                                    <Cell fill="#991b1b" />
                                                                </Pie>
                                                                {/* Main pie */}
                                                                <Pie
                                                                    data={passFailData}
                                                                    cx="50%"
                                                                    cy="42%"
                                                                    innerRadius={45}
                                                                    outerRadius={80}
                                                                    paddingAngle={5}
                                                                    dataKey="value"
                                                                    label={({ name, percent, x, y, textAnchor }) => (
                                                                        <text
                                                                            x={x}
                                                                            y={y}
                                                                            textAnchor={textAnchor}
                                                                            dominantBaseline="central"
                                                                            fill="#334155"
                                                                            fontSize={12}
                                                                            fontWeight={600}
                                                                        >
                                                                            {`${name} ${(percent * 100).toFixed(0)}%`}
                                                                        </text>
                                                                    )}
                                                                    style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.15))' }}
                                                                >
                                                                    <Cell fill="url(#piePass)" />
                                                                    <Cell fill="url(#pieFail)" />
                                                                </Pie>
                                                                <Legend
                                                                    iconType="circle"
                                                                    wrapperStyle={{ paddingTop: 12 }}
                                                                    formatter={(value) => (
                                                                        <span style={{ marginRight: 24, color: '#475569', fontWeight: 500 }}>{value}</span>
                                                                    )}
                                                                    payload={
                                                                        passFailData.map((item, index) => ({
                                                                            id: item.name,
                                                                            type: 'circle',
                                                                            value: item.name,
                                                                            color: index === 0 ? '#22c55e' : '#ef4444',
                                                                        }))
                                                                    }
                                                                />
                                                            </PieChart>
                                                        </ResponsiveContainer>
                                                    </Box>
                                                </Paper>
                                            </Grid>

                                            {/* Bar Chart - Average by Skill */}
                                            <Grid item xs={12}>
                                                <Paper sx={{
                                                    p: 3,
                                                    borderRadius: 4,
                                                    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                                                    border: '1px solid rgba(248,113,251,0.08)',
                                                    background: 'linear-gradient(180deg, #fefefe 0%, #fdf4ff 100%)',
                                                }}>
                                                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#1e293b' }}>
                                                        📊 Điểm trung bình theo kỹ năng
                                                    </Typography>
                                                    <ResponsiveContainer width="100%" height={320}>
                                                        <BarChart data={avgBySkill} barSize={50} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                                            <defs>
                                                                {CHART_COLORS.map((color, i) => (
                                                                    <linearGradient key={`barGrad-${i}`} id={`barGrad-${i}`} x1="0" y1="0" x2="0" y2="1">
                                                                        <stop offset="0%" stopColor={color} stopOpacity={1} />
                                                                        <stop offset="100%" stopColor={color} stopOpacity={0.7} />
                                                                    </linearGradient>
                                                                ))}
                                                            </defs>
                                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0e8f8" />
                                                            <XAxis dataKey="skill" fontSize={13} tick={{ fill: '#475569', fontWeight: 600 }} axisLine={{ stroke: '#e2e8f0' }} />
                                                            <YAxis domain={[0, 100]} fontSize={12} tick={{ fill: '#94a3b8' }} axisLine={{ stroke: '#e2e8f0' }} />
                                                            <RechartsTooltip
                                                                contentStyle={{
                                                                    borderRadius: 14,
                                                                    border: 'none',
                                                                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                                                                    background: 'rgba(255,255,255,0.95)',
                                                                    backdropFilter: 'blur(8px)',
                                                                    padding: '12px 16px',
                                                                }}
                                                                formatter={(value: number) => [`${value}%`, 'Điểm TB']}
                                                            />
                                                            <Bar dataKey="avg" shape={<Bar3D />} isAnimationActive={true} animationDuration={1200} animationBegin={200} animationEasing="ease-out">
                                                                {avgBySkill.map((_, index) => (
                                                                    <Cell key={`bar-${index}`} fill={`url(#barGrad-${index % CHART_COLORS.length})`} />
                                                                ))}
                                                            </Bar>
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </Paper>
                                            </Grid>
                                        </Grid>
                                    </>
                                )}
                            </Box>
                        )}
                    </>
                )}
            </Box>
        </DashboardLayout>
    );
};

export default TestsList;
