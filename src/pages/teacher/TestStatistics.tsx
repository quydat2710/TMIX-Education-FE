// Test Statistics Page
// Teacher can view student results and test statistics

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box, Typography, Paper, Grid, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, IconButton,
    CircularProgress, Alert, LinearProgress, Button,
} from '@mui/material';
import {
    ArrowBack as BackIcon,
    CheckCircle as PassIcon,
    Cancel as FailIcon,
    Visibility as ViewIcon,
} from '@mui/icons-material';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { commonStyles } from '../../utils/styles';
import { COLORS } from '../../utils/colors';
import { getTestById, getTestStatistics } from '../../services/tests';
import { Test } from '../../types/test';

const StatCard: React.FC<{ label: string; value: string | number; color?: string }> = ({ label, value, color }) => (
    <Paper sx={{ p: 2.5, textAlign: 'center', borderTop: `3px solid ${color || COLORS.primary.main}` }}>
        <Typography variant="h4" fontWeight={700} sx={{ color: color || COLORS.primary.main }}>
            {value}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {label}
        </Typography>
    </Paper>
);

const TestStatisticsPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [test, setTest] = useState<Test | null>(null);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!id) return;
        const loadData = async () => {
            try {
                setLoading(true);
                const [testResponse, statsResponse] = await Promise.all([
                    getTestById(id),
                    getTestStatistics(id),
                ]);
                setTest(testResponse.data);
                setStats(statsResponse.data || statsResponse);
            } catch (err: any) {
                setError(err.message || 'Không thể tải thống kê');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    const formatDate = (dateString: string) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <DashboardLayout>
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <Box sx={commonStyles.pageContainer}>
                {/* Header */}
                <Box sx={{ ...commonStyles.pageHeader, flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton onClick={() => navigate('/teacher/tests')}>
                            <BackIcon />
                        </IconButton>
                        <Box>
                            <Typography variant="h5" sx={commonStyles.pageTitle}>
                                📊 Thống kê kết quả
                            </Typography>
                            {test && (
                                <Typography variant="body2" color="text.secondary">
                                    {test.title} — {test.className || 'N/A'}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {stats && (
                    <>
                        {/* Summary cards */}
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={6} md={2.4}>
                                <StatCard label="Lượt làm bài" value={stats.totalAttempts || 0} color="#1976d2" />
                            </Grid>
                            <Grid item xs={6} md={2.4}>
                                <StatCard label="Điểm TB" value={stats.averageScore || 0} color="#f57c00" />
                            </Grid>
                            <Grid item xs={6} md={2.4}>
                                <StatCard label="% TB" value={`${stats.averagePercentage || 0}%`} color="#7b1fa2" />
                            </Grid>
                            <Grid item xs={6} md={2.4}>
                                <StatCard label="Tỉ lệ đạt" value={`${stats.passRate || 0}%`} color="#388e3c" />
                            </Grid>
                            <Grid item xs={6} md={2.4}>
                                <StatCard label="Điểm cao nhất" value={stats.highestScore || 0} color="#d32f2f" />
                            </Grid>
                        </Grid>

                        {/* Pass rate progress bar */}
                        <Paper sx={{ p: 2, mb: 3 }}>
                            <Typography variant="subtitle2" gutterBottom>Tỉ lệ đạt/không đạt</Typography>
                            <LinearProgress
                                variant="determinate"
                                value={stats.passRate || 0}
                                sx={{
                                    height: 12,
                                    borderRadius: 6,
                                    bgcolor: '#ffcdd2',
                                    '& .MuiLinearProgress-bar': { bgcolor: '#4caf50', borderRadius: 6 },
                                }}
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                                <Typography variant="body2" color="success.main">
                                    Đạt: {stats.passRate || 0}%
                                </Typography>
                                <Typography variant="body2" color="error.main">
                                    Không đạt: {(100 - (stats.passRate || 0)).toFixed(1)}%
                                </Typography>
                            </Box>
                        </Paper>

                        {/* Student attempt table */}
                        <Paper>
                            <Typography variant="h6" sx={{ p: 2, fontWeight: 600 }}>
                                Chi tiết bài làm ({stats.attempts?.length || 0} lượt)
                            </Typography>
                            {stats.attempts?.length > 0 ? (
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>STT</TableCell>
                                                <TableCell>Học sinh</TableCell>
                                                <TableCell align="center">Điểm</TableCell>
                                                <TableCell align="center">Phần trăm</TableCell>
                                                <TableCell align="center">Kết quả</TableCell>
                                                <TableCell>Thời gian nộp</TableCell>
                                                <TableCell align="center">Thao tác</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {stats.attempts.map((attempt: any, index: number) => (
                                                <TableRow key={attempt.id} sx={commonStyles.tableRow}>
                                                    <TableCell>{index + 1}</TableCell>
                                                    <TableCell>
                                                        <Typography fontWeight={500}>
                                                            {attempt.studentName || 'Học sinh'}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Typography fontWeight={600}>
                                                            {attempt.score}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        {attempt.percentage}%
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        {attempt.passed ? (
                                                            <Chip label="Đạt" color="success" size="small" icon={<PassIcon />} />
                                                        ) : (
                                                            <Chip label="Chưa đạt" color="error" size="small" icon={<FailIcon />} />
                                                        )}
                                                    </TableCell>
                                                    <TableCell>{formatDate(attempt.submittedAt)}</TableCell>
                                                    <TableCell align="center">
                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            startIcon={<ViewIcon />}
                                                            onClick={() => navigate(`/teacher/tests/attempts/${attempt.id}/review`)}
                                                            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                                                        >
                                                            Xem bài
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Box sx={{ p: 4, textAlign: 'center' }}>
                                    <Typography color="text.secondary">
                                        Chưa có học sinh nào làm bài
                                    </Typography>
                                </Box>
                            )}
                        </Paper>
                    </>
                )}
            </Box>
        </DashboardLayout>
    );
};

export default TestStatisticsPage;
