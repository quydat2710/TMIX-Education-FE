// Student Test List Page
// Displays available tests and past attempts

import React, { useState, useEffect } from 'react';
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
    ArrowBack as ArrowBackIcon,
    Quiz as QuizIcon,
    EmojiEvents as TrophyIcon,
    School as SchoolIcon,
    Person as PersonIcon,
    Star as StarIcon,
} from '@mui/icons-material';
import { getStudentAvailableTests, getStudentAttempts } from '../../services/tests';
import { StudentTestItem, TestAttempt } from '../../types/test';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { COLORS } from '../../utils/colors';

const TestsList: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(0);
    const [availableTests, setAvailableTests] = useState<StudentTestItem[]>([]);
    const [attempts, setAttempts] = useState<TestAttempt[]>([]);
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
            } else {
                const response = await getStudentAttempts();
                setAttempts(response.data.result || []);
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

    return (
        <DashboardLayout role="student">
            <Box sx={{ p: { xs: 2, md: 3 } }}>
                {/* Header */}
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    mb: 4,
                }}>
                    <Tooltip title="Quay lại">
                        <IconButton
                            onClick={() => navigate('/student')}
                            sx={{
                                bgcolor: 'white',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                '&:hover': { bgcolor: '#f5f5f5', transform: 'scale(1.05)' },
                                transition: 'all 0.2s',
                            }}
                        >
                            <ArrowBackIcon sx={{ color: COLORS.primary.main }} />
                        </IconButton>
                    </Tooltip>
                    <Box>
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
                    </>
                )}
            </Box>
        </DashboardLayout>
    );
};

export default TestsList;
