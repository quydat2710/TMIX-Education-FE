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
            // Handle both wrapped {data: attempt} and direct attempt response
            const attemptData = response.data || response;
            setAttempt(attemptData);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Không thể tải kết quả');
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
    const isWritingTest = (test as any)?.skillType === 'writing';
    const isSpeakingTest = (test as any)?.skillType === 'speaking';
    const aiGrading = (attempt as any)?.aiGrading;
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

                                {/* MC Stats */}
                                {!isWritingTest && !isSpeakingTest && (
                                    <>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2">Tổng số câu hỏi:</Typography>
                                            <Typography variant="body2"><strong>{test.questions.length}</strong></Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2">Trả lời đúng:</Typography>
                                            <Typography variant="body2" color="success.main">
                                                <strong>{attempt.answers?.filter((a: any, i: number) => a === test.questions[i]?.correctAnswer).length || 0}</strong>
                                            </Typography>
                                        </Box>
                                    </>
                                )}

                                {/* Speaking Stats */}
                                {isSpeakingTest && aiGrading && (
                                    <>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2">Loại bài:</Typography>
                                            <Typography variant="body2"><strong>🎤 Bài nói (AI chấm)</strong></Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2">Điểm tổng:</Typography>
                                            <Typography variant="body2" color="primary.main">
                                                <strong>{aiGrading.overallScore}/10</strong>
                                            </Typography>
                                        </Box>
                                        {aiGrading.pronunciation !== undefined && (
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Typography variant="body2">Phát âm:</Typography>
                                                <Typography variant="body2"><strong>{typeof aiGrading.pronunciation === 'object' ? aiGrading.pronunciation?.score : aiGrading.pronunciation}/10</strong></Typography>
                                            </Box>
                                        )}
                                        {aiGrading.fluency !== undefined && (
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Typography variant="body2">Độ trôi chảy:</Typography>
                                                <Typography variant="body2"><strong>{typeof aiGrading.fluency === 'object' ? aiGrading.fluency?.score : aiGrading.fluency}/10</strong></Typography>
                                            </Box>
                                        )}
                                        {aiGrading.accuracy !== undefined && (
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Typography variant="body2">Độ chính xác:</Typography>
                                                <Typography variant="body2"><strong>{typeof aiGrading.accuracy === 'object' ? aiGrading.accuracy?.score : aiGrading.accuracy}/10</strong></Typography>
                                            </Box>
                                        )}
                                        {aiGrading.grammar !== undefined && (
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Typography variant="body2">Ngữ pháp:</Typography>
                                                <Typography variant="body2"><strong>{typeof aiGrading.grammar === 'object' ? aiGrading.grammar?.score : aiGrading.grammar}/10</strong></Typography>
                                            </Box>
                                        )}
                                        {aiGrading.vocabulary !== undefined && (
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Typography variant="body2">Từ vựng:</Typography>
                                                <Typography variant="body2"><strong>{typeof aiGrading.vocabulary === 'object' ? aiGrading.vocabulary?.score : aiGrading.vocabulary}/10</strong></Typography>
                                            </Box>
                                        )}
                                    </>
                                )}

                                {/* Writing Stats */}
                                {isWritingTest && aiGrading && (
                                    <>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2">Loại bài:</Typography>
                                            <Typography variant="body2"><strong>✨ Bài viết (AI chấm)</strong></Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2">Điểm tổng:</Typography>
                                            <Typography variant="body2" color="primary.main">
                                                <strong>{aiGrading.overallScore}/10</strong>
                                            </Typography>
                                        </Box>
                                        {aiGrading.grammar !== undefined && (
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Typography variant="body2">Ngữ pháp:</Typography>
                                                <Typography variant="body2"><strong>{typeof aiGrading.grammar === 'object' ? aiGrading.grammar?.score : aiGrading.grammar}/10</strong></Typography>
                                            </Box>
                                        )}
                                        {aiGrading.vocabulary !== undefined && (
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Typography variant="body2">Từ vựng:</Typography>
                                                <Typography variant="body2"><strong>{typeof aiGrading.vocabulary === 'object' ? aiGrading.vocabulary?.score : aiGrading.vocabulary}/10</strong></Typography>
                                            </Box>
                                        )}
                                        {aiGrading.coherence !== undefined && (
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Typography variant="body2">Liên kết:</Typography>
                                                <Typography variant="body2"><strong>{typeof aiGrading.coherence === 'object' ? aiGrading.coherence?.score : aiGrading.coherence}/10</strong></Typography>
                                            </Box>
                                        )}
                                        {aiGrading.taskAchievement !== undefined && (
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Typography variant="body2">Hoàn thành yêu cầu:</Typography>
                                                <Typography variant="body2"><strong>{typeof aiGrading.taskAchievement === 'object' ? aiGrading.taskAchievement?.score : aiGrading.taskAchievement}/10</strong></Typography>
                                            </Box>
                                        )}
                                    </>
                                )}
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

                        {/* MC Question Review */}
                        {!isWritingTest && !isSpeakingTest && (
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
                                {test.questions.map((question: any, index: number) => (
                                    <QuestionCard
                                        key={question.id}
                                        question={question}
                                        questionNumber={index + 1}
                                        selectedAnswer={attempt.answers?.[index]}
                                        studentAnswer={attempt.answers?.[index]}
                                        showCorrectAnswer={true}
                                        showResult={true}
                                        feedback={attempt.feedback?.[index]}
                                        disabled={true}
                                    />
                                ))}
                            </Paper>
                        )}

                        {/* Speaking Results */}
                        {isSpeakingTest && (
                            <>
                                {/* Reference Text vs Transcription Comparison */}
                                {(() => {
                                    // Get reference text from test questions or speakingPrompt
                                    const referenceText = (test as any)?.questions?.[0]?.referenceText
                                        || (test as any)?.speakingPrompt || '';
                                    const transcription = (attempt as any)?.transcription
                                        || aiGrading?.transcription || '';

                                    // Word-level diff comparison
                                    const compareTexts = (ref: string, trans: string) => {
                                        const refWords = ref.toLowerCase().replace(/[.,!?;:'"()]/g, '').split(/\s+/).filter(Boolean);
                                        const transWords = trans.toLowerCase().replace(/[.,!?;:'"()]/g, '').split(/\s+/).filter(Boolean);
                                        const originalRefWords = ref.split(/\s+/).filter(Boolean);
                                        const originalTransWords = trans.split(/\s+/).filter(Boolean);

                                        // Mark each ref word as matched or missed
                                        const refResult: { word: string; status: 'correct' | 'missed' }[] = [];
                                        const transUsed = new Array(transWords.length).fill(false);

                                        // Simple sequential matching
                                        let tIdx = 0;
                                        for (let rIdx = 0; rIdx < refWords.length; rIdx++) {
                                            let found = false;
                                            // Look ahead in transcription for a match
                                            for (let search = tIdx; search < Math.min(tIdx + 3, transWords.length); search++) {
                                                if (refWords[rIdx] === transWords[search]) {
                                                    refResult.push({ word: originalRefWords[rIdx], status: 'correct' });
                                                    transUsed[search] = true;
                                                    tIdx = search + 1;
                                                    found = true;
                                                    break;
                                                }
                                            }
                                            if (!found) {
                                                refResult.push({ word: originalRefWords[rIdx], status: 'missed' });
                                            }
                                        }

                                        // Find added words (said but not in reference)
                                        const addedWords = originalTransWords.filter((_: string, i: number) => !transUsed[i]);

                                        const correctCount = refResult.filter(r => r.status === 'correct').length;
                                        const totalRef = refWords.length;
                                        const matchPct = totalRef > 0 ? Math.round((correctCount / totalRef) * 100) : 0;

                                        return { refResult, addedWords, matchPct, correctCount, totalRef };
                                    };

                                    const diff = referenceText && transcription
                                        ? compareTexts(referenceText, transcription) : null;

                                    return (
                                        <>
                                            {/* Side-by-side comparison */}
                                            <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: COLORS.primary.main }}>
                                                    📊 Đối chiếu văn bản
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                    So sánh văn bản gốc với kết quả AI nhận diện giọng nói
                                                </Typography>

                                                <Grid container spacing={2} sx={{ mb: 3 }}>
                                                    {/* Reference Text */}
                                                    <Grid item xs={12} md={6}>
                                                        <Box sx={{
                                                            p: 2.5, borderRadius: 2, height: '100%',
                                                            bgcolor: '#f0f9ff', border: '2px solid #bae6fd',
                                                        }}>
                                                            <Typography variant="subtitle2" sx={{
                                                                fontWeight: 700, color: '#0369a1', mb: 1.5,
                                                                display: 'flex', alignItems: 'center', gap: 0.5,
                                                            }}>
                                                                📖 Văn bản gốc (Reference)
                                                            </Typography>
                                                            <Typography variant="body1" sx={{
                                                                fontFamily: '"Georgia", serif',
                                                                lineHeight: 1.8, whiteSpace: 'pre-wrap',
                                                            }}>
                                                                {referenceText || 'Không có văn bản tham chiếu'}
                                                            </Typography>
                                                        </Box>
                                                    </Grid>

                                                    {/* Transcription */}
                                                    <Grid item xs={12} md={6}>
                                                        <Box sx={{
                                                            p: 2.5, borderRadius: 2, height: '100%',
                                                            bgcolor: '#fff7ed', border: '2px solid #fed7aa',
                                                        }}>
                                                            <Typography variant="subtitle2" sx={{
                                                                fontWeight: 700, color: '#c2410c', mb: 1.5,
                                                                display: 'flex', alignItems: 'center', gap: 0.5,
                                                            }}>
                                                                🎤 AI nhận diện (Transcription)
                                                            </Typography>
                                                            <Typography variant="body1" sx={{
                                                                fontFamily: '"Georgia", serif',
                                                                lineHeight: 1.8, whiteSpace: 'pre-wrap',
                                                            }}>
                                                                {transcription || 'Không có kết quả nhận diện'}
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                </Grid>

                                                {/* Word-by-word diff */}
                                                {diff && (
                                                    <Box>
                                                        <Typography variant="subtitle2" sx={{
                                                            fontWeight: 700, color: '#374151', mb: 1,
                                                            display: 'flex', alignItems: 'center', gap: 0.5,
                                                        }}>
                                                            🔍 Phân tích từng từ
                                                        </Typography>

                                                        {/* Stats bar */}
                                                        <Box sx={{
                                                            display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap',
                                                            p: 1.5, borderRadius: 2, bgcolor: '#f9fafb', border: '1px solid #e5e7eb',
                                                        }}>
                                                            <Typography variant="body2">
                                                                Độ khớp: <strong style={{ color: diff.matchPct >= 80 ? '#16a34a' : diff.matchPct >= 50 ? '#ca8a04' : '#dc2626' }}>
                                                                    {diff.matchPct}%
                                                                </strong>
                                                            </Typography>
                                                            <Typography variant="body2">
                                                                Đúng: <strong style={{ color: '#16a34a' }}>{diff.correctCount}</strong>/{diff.totalRef} từ
                                                            </Typography>
                                                            {diff.addedWords.length > 0 && (
                                                                <Typography variant="body2">
                                                                    Từ thêm: <strong style={{ color: '#2563eb' }}>{diff.addedWords.length}</strong>
                                                                </Typography>
                                                            )}
                                                        </Box>

                                                        {/* Diff visualization */}
                                                        <Box sx={{
                                                            p: 2, borderRadius: 2, bgcolor: '#ffffff',
                                                            border: '1px solid #e5e7eb', lineHeight: 2.2,
                                                            display: 'flex', flexWrap: 'wrap', gap: 0.5,
                                                            alignItems: 'center', overflow: 'hidden',
                                                        }}>
                                                            {diff.refResult.map((item, idx) => (
                                                                <Box
                                                                    component="span"
                                                                    key={idx}
                                                                    sx={{
                                                                        display: 'inline',
                                                                        px: 0.5, py: 0.3, mx: 0.3,
                                                                        borderRadius: 1,
                                                                        fontSize: '0.95rem',
                                                                        fontFamily: '"Georgia", serif',
                                                                        ...(item.status === 'correct'
                                                                            ? { bgcolor: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' }
                                                                            : { bgcolor: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', textDecoration: 'line-through' }
                                                                        ),
                                                                    }}
                                                                >
                                                                    {item.word}
                                                                </Box>
                                                            ))}
                                                            {diff.addedWords.length > 0 && (
                                                                <>
                                                                    <Box component="span" sx={{ mx: 1, color: '#9ca3af' }}>|</Box>
                                                                    {diff.addedWords.map((word: string, idx: number) => (
                                                                        <Box
                                                                            component="span"
                                                                            key={`added-${idx}`}
                                                                            sx={{
                                                                                display: 'inline',
                                                                                px: 0.5, py: 0.3, mx: 0.3,
                                                                                borderRadius: 1,
                                                                                fontSize: '0.95rem',
                                                                                fontFamily: '"Georgia", serif',
                                                                                bgcolor: '#dbeafe', color: '#1e40af', border: '1px solid #bfdbfe',
                                                                                fontStyle: 'italic',
                                                                            }}
                                                                        >
                                                                            +{word}
                                                                        </Box>
                                                                    ))}
                                                                </>
                                                            )}
                                                        </Box>

                                                        {/* Legend */}
                                                        <Box sx={{ display: 'flex', gap: 3, mt: 1.5, flexWrap: 'wrap' }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                <Box sx={{ width: 12, height: 12, borderRadius: 0.5, bgcolor: '#dcfce7', border: '1px solid #bbf7d0' }} />
                                                                <Typography variant="caption" color="text.secondary">Đúng</Typography>
                                                            </Box>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                <Box sx={{ width: 12, height: 12, borderRadius: 0.5, bgcolor: '#fee2e2', border: '1px solid #fecaca' }} />
                                                                <Typography variant="caption" color="text.secondary">Thiếu / Sai</Typography>
                                                            </Box>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                <Box sx={{ width: 12, height: 12, borderRadius: 0.5, bgcolor: '#dbeafe', border: '1px solid #bfdbfe' }} />
                                                                <Typography variant="caption" color="text.secondary">Từ nói thêm</Typography>
                                                            </Box>
                                                        </Box>
                                                    </Box>
                                                )}
                                            </Paper>

                                            {/* AI Grading Feedback */}
                                            {aiGrading && (
                                                <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                                                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: '#2e7d32' }}>
                                                        🤖 Nhận xét từ AI
                                                    </Typography>

                                                    {/* Scoring Breakdown */}
                                                    {aiGrading.scoringBreakdown && (
                                                        <Box sx={{
                                                            p: 2, mb: 2, borderRadius: 2,
                                                            bgcolor: '#fefce8', border: '1px solid #fde68a',
                                                        }}>
                                                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#92400e', mb: 1 }}>
                                                                📐 Công thức chấm điểm:
                                                            </Typography>
                                                            <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 0.5 }}>
                                                                {aiGrading.scoringBreakdown.formula}
                                                            </Typography>
                                                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                                                                = {aiGrading.scoringBreakdown.calculation}
                                                            </Typography>
                                                            {aiGrading.scoringBreakdown.penaltiesApplied?.length > 0 && (
                                                                <Box sx={{ mt: 1 }}>
                                                                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#dc2626' }}>
                                                                        Penalties:
                                                                    </Typography>
                                                                    {aiGrading.scoringBreakdown.penaltiesApplied.map((p: string, i: number) => (
                                                                        <Typography key={i} variant="caption" sx={{ display: 'block', color: '#6b7280', ml: 1 }}>
                                                                            • {p}
                                                                        </Typography>
                                                                    ))}
                                                                </Box>
                                                            )}
                                                        </Box>
                                                    )}

                                                    {aiGrading.detailedFeedback && (
                                                        <Box sx={{
                                                            p: 2.5, mb: 2, borderRadius: 2,
                                                            bgcolor: '#f0fdf4', border: '1px solid #bbf7d0',
                                                            whiteSpace: 'pre-wrap', lineHeight: 1.8,
                                                        }}>
                                                            <Typography variant="body1">{aiGrading.detailedFeedback}</Typography>
                                                        </Box>
                                                    )}
                                                </Paper>
                                            )}
                                        </>
                                    );
                                })()}
                            </>
                        )}

                        {/* Writing AI Grading Detail */}
                        {isWritingTest && (
                            <>
                                {/* Student's Writing */}
                                {(attempt as any)?.writingResponse && (
                                    <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: COLORS.primary.main }}>
                                            ✍️ Bài viết của bạn
                                        </Typography>
                                        <Box sx={{
                                            p: 2.5, borderRadius: 2,
                                            bgcolor: '#fafafa', border: '1px solid #e5e5e5',
                                            fontFamily: '"Georgia", serif',
                                            fontSize: '1rem',
                                            lineHeight: 1.8,
                                            whiteSpace: 'pre-wrap',
                                        }}>
                                            {(attempt as any).writingResponse}
                                        </Box>
                                        <Typography variant="body2" sx={{ mt: 1, color: '#888' }}>
                                            Số từ: {(attempt as any).writingResponse?.trim().split(/\s+/).length || 0}
                                        </Typography>
                                    </Paper>
                                )}

                                {/* AI Grading Feedback */}
                                {aiGrading && (
                                    <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: '#2e7d32' }}>
                                            🤖 Nhận xét từ AI
                                        </Typography>

                                        {/* Scoring Breakdown */}
                                        {aiGrading.scoringBreakdown && (
                                            <Box sx={{
                                                p: 2, mb: 2, borderRadius: 2,
                                                bgcolor: '#fefce8', border: '1px solid #fde68a',
                                            }}>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#92400e', mb: 1 }}>
                                                    📐 Công thức chấm điểm (IELTS-based):
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 0.5 }}>
                                                    {aiGrading.scoringBreakdown.formula}
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                                                    = {aiGrading.scoringBreakdown.calculation}
                                                </Typography>
                                                {aiGrading.scoringBreakdown.penaltiesApplied?.length > 0 && (
                                                    <Box sx={{ mt: 1 }}>
                                                        <Typography variant="caption" sx={{ fontWeight: 600, color: '#dc2626' }}>
                                                            Các hình phạt đã áp dụng:
                                                        </Typography>
                                                        {aiGrading.scoringBreakdown.penaltiesApplied.map((p: string, i: number) => (
                                                            <Typography key={i} variant="caption" sx={{ display: 'block', color: '#6b7280', ml: 1 }}>
                                                                • {p}
                                                            </Typography>
                                                        ))}
                                                    </Box>
                                                )}
                                            </Box>
                                        )}

                                        {/* Detailed Feedback */}
                                        {aiGrading.detailedFeedback && (
                                            <Box sx={{
                                                p: 2.5, mb: 2, borderRadius: 2,
                                                bgcolor: '#f0fdf4', border: '1px solid #bbf7d0',
                                                whiteSpace: 'pre-wrap',
                                                lineHeight: 1.8,
                                            }}>
                                                <Typography variant="body1">
                                                    {aiGrading.detailedFeedback}
                                                </Typography>
                                            </Box>
                                        )}

                                        {/* Error Highlights from grammar */}
                                        {aiGrading.grammar?.errors && aiGrading.grammar.errors.length > 0 && (
                                            <Box sx={{ mb: 2 }}>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#dc2626' }}>
                                                    ❌ Lỗi ngữ pháp ({aiGrading.grammar.errors.length}):
                                                </Typography>
                                                {aiGrading.grammar.errors.map((err: any, i: number) => (
                                                    <Box key={i} sx={{
                                                        p: 1.5, mb: 1, borderRadius: 1.5,
                                                        bgcolor: '#fef2f2', border: '1px solid #fecaca',
                                                    }}>
                                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#dc2626' }}>
                                                            {err.rule || err.type || 'Lỗi'}: <span style={{ textDecoration: 'line-through' }}>{err.text || err.original}</span>
                                                        </Typography>
                                                        {err.correction && (
                                                            <Typography variant="body2" sx={{ color: '#16a34a', mt: 0.5 }}>
                                                                → Sửa: {err.correction}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                ))}
                                            </Box>
                                        )}

                                        {/* Vocabulary suggestions */}
                                        {aiGrading.vocabulary?.suggestions && aiGrading.vocabulary.suggestions.length > 0 && (
                                            <Box sx={{ mb: 2 }}>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#1976d2' }}>
                                                    📚 Gợi ý từ vựng:
                                                </Typography>
                                                {aiGrading.vocabulary.suggestions.map((s: string, i: number) => (
                                                    <Box key={i} sx={{
                                                        p: 1.5, mb: 1, borderRadius: 1.5,
                                                        bgcolor: '#eff6ff', border: '1px solid #bfdbfe',
                                                    }}>
                                                        <Typography variant="body2">{s}</Typography>
                                                    </Box>
                                                ))}
                                            </Box>
                                        )}

                                        {/* Coherence feedback */}
                                        {aiGrading.coherence?.feedback && (
                                            <Box sx={{ mb: 2 }}>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#7c3aed' }}>
                                                    🔗 Nhận xét liên kết:
                                                </Typography>
                                                <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: '#f5f3ff', border: '1px solid #ddd6fe' }}>
                                                    <Typography variant="body2">{aiGrading.coherence.feedback}</Typography>
                                                </Box>
                                            </Box>
                                        )}

                                        {/* Task achievement feedback */}
                                        {aiGrading.taskAchievement?.feedback && (
                                            <Box sx={{ mb: 2 }}>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#ea580c' }}>
                                                    🎯 Hoàn thành yêu cầu:
                                                </Typography>
                                                <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: '#fff7ed', border: '1px solid #fed7aa' }}>
                                                    <Typography variant="body2">{aiGrading.taskAchievement.feedback}</Typography>
                                                </Box>
                                            </Box>
                                        )}
                                    </Paper>
                                )}
                            </>
                        )}
                    </Grid>
                </Grid>
            </Box>
        </DashboardLayout>
    );
};

export default TestResults;
