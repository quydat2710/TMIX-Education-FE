// Teacher Review Attempt Page
// Teacher can view student writing, see AI grading, and override scores

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box, Typography, Paper, TextField, Button, Slider, Switch,
    CircularProgress, Alert, IconButton, Snackbar, Divider, Chip,
    FormControlLabel,
} from '@mui/material';
import {
    ArrowBack as BackIcon,
    Save as SaveIcon,
    SmartToy as AiIcon,
    Edit as EditIcon,
} from '@mui/icons-material';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { commonStyles } from '../../utils/styles';
import { COLORS } from '../../utils/colors';
import { getAttemptById, reviewAttempt } from '../../services/tests';

const ReviewAttemptPage: React.FC = () => {
    const navigate = useNavigate();
    const { attemptId } = useParams<{ attemptId: string }>();
    const [attempt, setAttempt] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Editable fields
    const [score, setScore] = useState<number>(0);
    const [percentage, setPercentage] = useState<number>(0);
    const [passed, setPassed] = useState(false);
    const [teacherFeedback, setTeacherFeedback] = useState('');

    useEffect(() => {
        if (!attemptId) return;
        const load = async () => {
            try {
                setLoading(true);
                const response = await getAttemptById(attemptId);
                const data = response.data || response;
                setAttempt(data);
                setScore(data.score || 0);
                setPercentage(data.percentage || 0);
                setPassed(data.passed || false);
            } catch (err: any) {
                setError('Không thể tải bài làm');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [attemptId]);

    const handleSave = async () => {
        if (!attemptId) return;
        try {
            setSaving(true);
            await reviewAttempt(attemptId, {
                score,
                percentage,
                passed,
                ...(teacherFeedback.trim() ? { teacherFeedback: teacherFeedback.trim() } : {}),
            });
            setSuccess('Đã lưu thành công!');
            setTeacherFeedback('');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Lưu thất bại');
        } finally {
            setSaving(false);
        }
    };

    const handleScoreChange = (newScore: number) => {
        setScore(newScore);
        setPercentage(Math.round(newScore * 10));
        setPassed(newScore * 10 >= (attempt?.test?.passingScore || 50));
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

    const test = attempt?.test;
    const aiGrading = attempt?.aiGrading;
    const isWritingTest = test?.skillType === 'writing';

    return (
        <DashboardLayout>
            <Box sx={commonStyles.pageContainer}>
                {/* Header */}
                <Box sx={{ ...commonStyles.pageHeader, flexWrap: 'wrap', gap: 2, mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton onClick={() => navigate(-1)}>
                            <BackIcon />
                        </IconButton>
                        <Box>
                            <Typography variant="h5" sx={commonStyles.pageTitle}>
                                ✏️ Duyệt bài làm
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {test?.title} — Học sinh: {attempt?.student?.name || 'N/A'}
                            </Typography>
                        </Box>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={handleSave}
                        disabled={saving}
                        sx={{
                            bgcolor: COLORS.primary.main,
                            fontWeight: 600,
                            borderRadius: 2,
                            px: 3,
                        }}
                    >
                        {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </Button>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

                <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                    {/* Left: Student's writing + AI feedback */}
                    <Box sx={{ flex: 2 }}>
                        {/* Student Writing */}
                        {isWritingTest && attempt?.writingResponse && (
                            <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: COLORS.primary.main }}>
                                    ✍️ Bài viết của học sinh
                                </Typography>
                                <Box sx={{
                                    p: 2.5, borderRadius: 2,
                                    bgcolor: '#fafafa', border: '1px solid #e5e5e5',
                                    fontFamily: '"Georgia", serif',
                                    fontSize: '1rem',
                                    lineHeight: 1.8,
                                    whiteSpace: 'pre-wrap',
                                    maxHeight: 500,
                                    overflow: 'auto',
                                }}>
                                    {attempt.writingResponse}
                                </Box>
                                <Typography variant="body2" sx={{ mt: 1, color: '#888' }}>
                                    Số từ: {attempt.writingResponse?.trim().split(/\s+/).length || 0}
                                </Typography>
                            </Paper>
                        )}

                        {/* AI Grading Details */}
                        {aiGrading && (
                            <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <AiIcon sx={{ color: '#2e7d32' }} />
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#2e7d32' }}>
                                        Nhận xét AI
                                    </Typography>
                                    <Chip label={`${aiGrading.overallScore}/10`} color="primary" size="small" />
                                </Box>

                                {/* Score breakdown */}
                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 1.5, mb: 2 }}>
                                    {aiGrading.grammar && (
                                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                            <Typography variant="body2" color="text.secondary">Ngữ pháp</Typography>
                                            <Typography variant="h6" fontWeight={700}>{typeof aiGrading.grammar === 'object' ? aiGrading.grammar.score : aiGrading.grammar}/10</Typography>
                                        </Box>
                                    )}
                                    {aiGrading.vocabulary && (
                                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                            <Typography variant="body2" color="text.secondary">Từ vựng</Typography>
                                            <Typography variant="h6" fontWeight={700}>{typeof aiGrading.vocabulary === 'object' ? aiGrading.vocabulary.score : aiGrading.vocabulary}/10</Typography>
                                        </Box>
                                    )}
                                    {aiGrading.coherence && (
                                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                            <Typography variant="body2" color="text.secondary">Liên kết</Typography>
                                            <Typography variant="h6" fontWeight={700}>{typeof aiGrading.coherence === 'object' ? aiGrading.coherence.score : aiGrading.coherence}/10</Typography>
                                        </Box>
                                    )}
                                    {aiGrading.taskAchievement && (
                                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                            <Typography variant="body2" color="text.secondary">Hoàn thành</Typography>
                                            <Typography variant="h6" fontWeight={700}>{typeof aiGrading.taskAchievement === 'object' ? aiGrading.taskAchievement.score : aiGrading.taskAchievement}/10</Typography>
                                        </Box>
                                    )}
                                </Box>

                                {/* Detailed feedback */}
                                {aiGrading.detailedFeedback && (
                                    <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0', whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                                        <Typography variant="body2">{aiGrading.detailedFeedback}</Typography>
                                    </Box>
                                )}

                                {/* Grammar errors */}
                                {aiGrading.grammar?.errors?.length > 0 && (
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#dc2626' }}>
                                            ❌ Lỗi ngữ pháp ({aiGrading.grammar.errors.length}):
                                        </Typography>
                                        {aiGrading.grammar.errors.map((err: any, i: number) => (
                                            <Box key={i} sx={{ p: 1, mb: 0.5, borderRadius: 1, bgcolor: '#fef2f2', border: '1px solid #fecaca' }}>
                                                <Typography variant="body2" sx={{ color: '#dc2626' }}>
                                                    <strong>{err.rule || 'Lỗi'}:</strong> <span style={{ textDecoration: 'line-through' }}>{err.text}</span>
                                                    {err.correction && <span style={{ color: '#16a34a' }}> → {err.correction}</span>}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                )}
                            </Paper>
                        )}

                        {/* MC Answers for non-writing tests */}
                        {!isWritingTest && attempt?.answers && (
                            <Paper sx={{ p: 3, borderRadius: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: COLORS.primary.main }}>
                                    📝 Câu trả lời
                                </Typography>
                                {test?.questions?.map((q: any, i: number) => (
                                    <Box key={q.id || i} sx={{ p: 1.5, mb: 1, borderRadius: 1.5, bgcolor: attempt.answers[i] === q.correctAnswer ? '#f0fdf4' : '#fef2f2', border: `1px solid ${attempt.answers[i] === q.correctAnswer ? '#bbf7d0' : '#fecaca'}` }}>
                                        <Typography variant="body2" fontWeight={600}>
                                            Câu {i + 1}: {q.question}
                                        </Typography>
                                        <Typography variant="body2">
                                            Trả lời: <strong>{attempt.answers[i] || '—'}</strong>
                                            {attempt.answers[i] !== q.correctAnswer && (
                                                <span style={{ color: '#16a34a' }}> (Đáp án: {q.correctAnswer})</span>
                                            )}
                                        </Typography>
                                    </Box>
                                ))}
                            </Paper>
                        )}
                    </Box>

                    {/* Right: Score editor */}
                    <Box sx={{ flex: 1, minWidth: 300 }}>
                        <Paper sx={{ p: 3, borderRadius: 3, position: 'sticky', top: 20 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                                <EditIcon sx={{ color: COLORS.primary.main }} />
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    Chỉnh điểm
                                </Typography>
                            </Box>

                            {/* Score slider */}
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                    Điểm số: <strong style={{ color: COLORS.primary.main, fontSize: '1.3em' }}>{score}</strong>/10
                                </Typography>
                                <Slider
                                    value={score}
                                    onChange={(_, v) => handleScoreChange(v as number)}
                                    min={0}
                                    max={10}
                                    step={0.5}
                                    marks={[
                                        { value: 0, label: '0' },
                                        { value: 5, label: '5' },
                                        { value: 10, label: '10' },
                                    ]}
                                    sx={{ color: COLORS.primary.main }}
                                />
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            {/* Percentage */}
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                    Phần trăm: {percentage}%
                                </Typography>
                                <TextField
                                    type="number"
                                    size="small"
                                    fullWidth
                                    value={percentage}
                                    onChange={(e) => setPercentage(Number(e.target.value))}
                                    inputProps={{ min: 0, max: 100 }}
                                />
                            </Box>

                            {/* Pass/Fail toggle */}
                            <Box sx={{ mb: 3 }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={passed}
                                            onChange={(e) => setPassed(e.target.checked)}
                                            color="success"
                                        />
                                    }
                                    label={
                                        <Typography variant="body2" fontWeight={600}>
                                            {passed ? '✅ Đạt' : '❌ Chưa đạt'}
                                        </Typography>
                                    }
                                />
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            {/* Teacher feedback */}
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                    💬 Nhận xét của giáo viên:
                                </Typography>
                                <TextField
                                    multiline
                                    rows={4}
                                    fullWidth
                                    placeholder="Nhập nhận xét bổ sung cho học sinh..."
                                    value={teacherFeedback}
                                    onChange={(e) => setTeacherFeedback(e.target.value)}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                />
                            </Box>

                            {/* Existing feedback */}
                            {attempt?.feedback?.length > 0 && (
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#666' }}>
                                        Nhận xét trước đó:
                                    </Typography>
                                    {attempt.feedback.map((fb: string, i: number) => (
                                        <Box key={i} sx={{ p: 1.5, mb: 1, borderRadius: 1.5, bgcolor: '#f5f5f5', border: '1px solid #e5e5e5' }}>
                                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{fb}</Typography>
                                        </Box>
                                    ))}
                                </Box>
                            )}

                            {/* Save button */}
                            <Button
                                variant="contained"
                                fullWidth
                                size="large"
                                startIcon={<SaveIcon />}
                                onClick={handleSave}
                                disabled={saving}
                                sx={{
                                    bgcolor: COLORS.primary.main,
                                    fontWeight: 600,
                                    borderRadius: 2,
                                    py: 1.5,
                                }}
                            >
                                {saving ? 'Đang lưu...' : '💾 Lưu thay đổi'}
                            </Button>
                        </Paper>
                    </Box>
                </Box>

                {/* Success snackbar */}
                <Snackbar
                    open={!!success}
                    autoHideDuration={3000}
                    onClose={() => setSuccess('')}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert severity="success" onClose={() => setSuccess('')}>
                        {success}
                    </Alert>
                </Snackbar>
            </Box>
        </DashboardLayout>
    );
};

export default ReviewAttemptPage;
