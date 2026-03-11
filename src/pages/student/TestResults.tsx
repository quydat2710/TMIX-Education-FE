// Test Results Page
// Display AI grading results with detailed feedback

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Typography,
    Box,
    Button,
    Paper,
    Grid,
    Divider,
    CircularProgress,
    Alert,
    IconButton,
    Tooltip,
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Print as PrintIcon,
    EmojiEvents as TrophyIcon,
} from '@mui/icons-material';
import { getAttemptById } from '../../services/tests';
import { TestAttempt } from '../../types/test';
import { ScoreBadge, QuestionCard, FeedbackCard } from '../../components/features/test';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { COLORS } from '../../utils/colors';

const TestResults: React.FC = () => {
    const { attemptId } = useParams<{ attemptId: string }>();
    const navigate = useNavigate();

    const [attempt, setAttempt] = useState<TestAttempt | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadResults();
    }, [attemptId]);

    const loadResults = async () => {
        if (!attemptId) return;

        try {
            setLoading(true);
            const response = await getAttemptById(attemptId);
            setAttempt(response.data);
        } catch (err: any) {
            setError(err.message || 'Không thể tải kết quả');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('vi-VN');
    };

    if (loading) {
        return (
            <DashboardLayout role="student">
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
                    <CircularProgress size={48} style={{ color: COLORS.primary.main }} />
                    <Typography sx={{ mt: 2, color: 'text.secondary' }}>Đang tải kết quả...</Typography>
                </Box>
            </DashboardLayout>
        );
    }

    if (error || !attempt) {
        return (
            <DashboardLayout role="student">
                <Box sx={{ p: 3 }}>
                    <Alert severity="error" sx={{ borderRadius: 2, mb: 2 }}>{error || 'Không tìm thấy kết quả'}</Alert>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/student/tests')}
                        variant="outlined"
                        sx={{ borderRadius: 2, textTransform: 'none' }}
                    >
                        Quay lại danh sách
                    </Button>
                </Box>
            </DashboardLayout>
        );
    }

    const test = attempt.test;
    if (!test) {
        return (
            <DashboardLayout role="student">
                <Box sx={{ p: 3 }}>
                    <Alert severity="error" sx={{ borderRadius: 2 }}>Không có thông tin bài kiểm tra</Alert>
                </Box>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="student">
            <Box sx={{ p: { xs: 2, md: 3 } }}>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                    <Tooltip title="Quay lại">
                        <IconButton
                            onClick={() => navigate('/student/tests')}
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
                            <TrophyIcon sx={{ fontSize: 36 }} />
                            Kết quả bài kiểm tra
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {test.title} — Nộp lúc: {formatDate(attempt.submittedAt)}
                        </Typography>
                    </Box>
                </Box>

                <Grid container spacing={3}>
                    {/* Left Column - Score Overview */}
                    <Grid item xs={12} md={4}>
                        <Paper sx={{
                            p: 3,
                            position: 'sticky',
                            top: 20,
                            borderRadius: 3,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        }}>
                            <ScoreBadge
                                score={attempt.score}
                                totalPoints={test.totalPoints}
                                percentage={attempt.percentage}
                                passed={attempt.passed}
                                passingScore={test.passingScore}
                                size="medium"
                            />

                            <Divider sx={{ my: 3 }} />

                            {/* Statistics */}
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ fontWeight: 600 }}>
                                    Thống kê
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2">Tổng số câu hỏi:</Typography>
                                    <Typography variant="body2"><strong>{test.questions.length}</strong></Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2">Trả lời đúng:</Typography>
                                    <Typography variant="body2" color="success.main">
                                        <strong>{attempt.answers.filter((a, i) => a === test.questions[i].correctAnswer).length}</strong>
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2">Trả lời sai:</Typography>
                                    <Typography variant="body2" color="error.main">
                                        <strong>{attempt.answers.filter((a, i) => a !== test.questions[i].correctAnswer).length}</strong>
                                    </Typography>
                                </Box>
                            </Box>

                            <Divider sx={{ my: 3 }} />

                            {/* Actions */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Button
                                    variant="outlined"
                                    startIcon={<ArrowBackIcon />}
                                    onClick={() => navigate('/student/tests')}
                                    fullWidth
                                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                                >
                                    Quay lại danh sách
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<PrintIcon />}
                                    onClick={() => window.print()}
                                    fullWidth
                                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                                >
                                    In kết quả
                                </Button>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Right Column - Detailed Results */}
                    <Grid item xs={12} md={8}>
                        {/* Overall Feedback */}
                        {attempt.feedback && attempt.feedback.length > 0 && (
                            <Paper sx={{
                                p: 3,
                                mb: 3,
                                borderRadius: 3,
                                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                            }}>
                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: COLORS.primary.main as string }}>
                                    Nhận xét & Gợi ý
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {attempt.feedback.slice(0, 3).map((feedback, index) => (
                                        <FeedbackCard key={index} feedback={feedback} type="suggestion" />
                                    ))}
                                </Box>
                            </Paper>
                        )}

                        {/* Question Review */}
                        <Paper sx={{
                            p: 3,
                            borderRadius: 3,
                            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                        }}>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: COLORS.primary.main }}>
                                📝 Chi tiết câu trả lời
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                Xem lại các câu trả lời và đáp án đúng
                            </Typography>

                            {test.questions.map((question, index) => (
                                <QuestionCard
                                    key={question.id}
                                    question={question}
                                    questionNumber={index + 1}
                                    selectedAnswer={attempt.answers[index]}
                                    studentAnswer={attempt.answers[index]}
                                    showCorrectAnswer={true}
                                    showResult={true}
                                    feedback={attempt.feedback[index]}
                                    disabled={true}
                                />
                            ))}
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </DashboardLayout>
    );
};

export default TestResults;
