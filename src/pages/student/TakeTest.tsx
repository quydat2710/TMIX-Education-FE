// Take Test Page
// Student interface to take a multiple choice test

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Typography,
    Box,
    Button,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Alert,
    LinearProgress,
    IconButton,
    Tooltip,
    Chip,
    TextField,
} from '@mui/material';
import {
    Send as SendIcon,
    ArrowBack as ArrowBackIcon,
    Quiz as QuizIcon,
    Star as StarIcon,
    CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { getStudentTestById } from '../../services/tests';
import { submitTestForGrading, submitWritingTest } from '../../services/ai-grading';
import { Test } from '../../types/test';
import { QuestionCard, TestTimer } from '../../components/features/test';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { COLORS } from '../../utils/colors';

const TakeTest: React.FC = () => {
    const { testId } = useParams<{ testId: string }>();
    const navigate = useNavigate();

    const [test, setTest] = useState<Test | null>(null);
    const [answers, setAnswers] = useState<number[]>([]);
    const [writingResponse, setWritingResponse] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [timeUpTriggered, setTimeUpTriggered] = useState(false);

    useEffect(() => {
        loadTest();
    }, [testId]);

    const loadTest = async () => {
        if (!testId) return;

        try {
            setLoading(true);
            const response = await getStudentTestById(testId);
            setTest(response.data);
            setAnswers(new Array(response.data.questions.length).fill(-1));
        } catch (err: any) {
            setError(err.message || 'Không thể tải bài kiểm tra');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (questionIndex: number, answer: number) => {
        const newAnswers = [...answers];
        newAnswers[questionIndex] = answer;
        setAnswers(newAnswers);
    };

    const getAnsweredCount = (): number => {
        return answers.filter((a) => a !== -1).length;
    };

    const getProgressPercentage = (): number => {
        if (!test) return 0;
        return (getAnsweredCount() / test.questions.length) * 100;
    };

    const isWritingTest = test?.skillType === 'writing';

    const getWordCount = (): number => {
        return writingResponse.trim() ? writingResponse.trim().split(/\s+/).length : 0;
    };

    const handleSubmitClick = () => {
        if (isWritingTest) {
            if (getWordCount() < 10) {
                setError('Bài viết quá ngắn. Vui lòng viết ít nhất 10 từ.');
                return;
            }
        } else {
            const unanswered = test!.questions.length - getAnsweredCount();
            if (unanswered > 0) {
                if (!window.confirm(`Bạn còn ${unanswered} câu chưa trả lời. Vẫn nộp bài?`)) {
                    return;
                }
            }
        }
        setShowConfirmDialog(true);
    };

    const handleConfirmSubmit = async () => {
        if (!testId) return;

        setShowConfirmDialog(false);
        setSubmitting(true);

        try {
            let response;
            if (isWritingTest) {
                response = await submitWritingTest(testId, writingResponse);
            } else {
                response = await submitTestForGrading(testId, answers);
            }
            // Handle both wrapped {data: {id}} and direct {id} response
            const attemptData = response.data || response;
            navigate(`/student/tests/results/${attemptData.id}`);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Không thể nộp bài');
            setSubmitting(false);
        }
    };

    const handleTimeUp = () => {
        if (timeUpTriggered) return;
        setTimeUpTriggered(true);
        alert('Đã hết thời gian! Bài kiểm tra sẽ được nộp tự động.');
        handleConfirmSubmit();
    };

    if (loading) {
        return (
            <DashboardLayout role="student">
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
                    <CircularProgress size={48} sx={{ color: COLORS.primary.main }} />
                    <Typography sx={{ mt: 2, color: 'text.secondary' }}>Đang tải bài kiểm tra...</Typography>
                </Box>
            </DashboardLayout>
        );
    }

    if (error || !test) {
        return (
            <DashboardLayout role="student">
                <Box sx={{ p: 3 }}>
                    <Alert severity="error" sx={{ borderRadius: 2, mb: 2 }}>{error || 'Không tìm thấy bài kiểm tra'}</Alert>
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

    return (
        <DashboardLayout role="student">
            <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 900, mx: 'auto' }}>
                {/* Header */}
                <Paper sx={{
                    borderRadius: 3,
                    overflow: 'hidden',
                    mb: 3,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                }}>
                    {/* Title section with gradient */}
                    <Box sx={{
                        background: `linear-gradient(135deg, ${COLORS.primary.main} 0%, #1E3A5F 100%)`,
                        p: 3,
                        color: 'white',
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                            <Tooltip title="Quay lại (tiến trình sẽ bị mất)">
                                <IconButton
                                    onClick={() => {
                                        if (window.confirm('Bạn có chắc muốn rời khỏi? Tiến trình làm bài sẽ bị mất.')) {
                                            navigate('/student/tests');
                                        }
                                    }}
                                    disabled={submitting}
                                    sx={{
                                        color: 'white',
                                        bgcolor: 'rgba(255,255,255,0.15)',
                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
                                    }}
                                >
                                    <ArrowBackIcon />
                                </IconButton>
                            </Tooltip>
                            <Box>
                                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                    {test.title}
                                </Typography>
                                {test.description && (
                                    <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
                                        {test.description}
                                    </Typography>
                                )}
                            </Box>
                        </Box>

                        {/* Stats */}
                        <Box sx={{ display: 'flex', gap: 1.5, mt: 2, flexWrap: 'wrap' }}>
                            <Chip
                                icon={<QuizIcon sx={{ color: 'white !important', fontSize: '16px !important' }} />}
                                label={`${test.questions.length} câu hỏi`}
                                size="small"
                                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }}
                            />
                            <Chip
                                icon={<StarIcon sx={{ color: 'white !important', fontSize: '16px !important' }} />}
                                label={`${test.totalPoints} điểm`}
                                size="small"
                                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }}
                            />
                            <Chip
                                icon={<CheckCircleIcon sx={{ color: 'white !important', fontSize: '16px !important' }} />}
                                label={`Cần đạt: ${test.passingScore}%`}
                                size="small"
                                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }}
                            />
                        </Box>
                    </Box>

                    {/* Timer + Progress section */}
                    <Box sx={{ p: 2.5, bgcolor: '#fafbfc' }}>
                        <TestTimer durationMinutes={test.duration} onTimeUp={handleTimeUp} isPaused={submitting} />

                        <Box sx={{ mt: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#555' }}>
                                    {isWritingTest ? 'Số từ đã viết' : 'Tiến trình'}
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: COLORS.primary.main }}>
                                    {isWritingTest
                                        ? `${getWordCount()} từ`
                                        : `${getAnsweredCount()} / ${test.questions.length} câu`
                                    }
                                </Typography>
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={isWritingTest
                                    ? Math.min((getWordCount() / (test.questions[0]?.minWords || 100)) * 100, 100)
                                    : getProgressPercentage()
                                }
                                sx={{
                                    height: 8,
                                    borderRadius: 4,
                                    bgcolor: '#e8e8e8',
                                    '& .MuiLinearProgress-bar': {
                                        borderRadius: 4,
                                        background: `linear-gradient(90deg, ${COLORS.primary.main}, #e74c3c)`,
                                    },
                                }}
                            />
                        </Box>
                    </Box>
                </Paper>

                {/* Audio Player for Listening Tests */}
                {(test as any)?.skillType === 'listening' && (test as any)?.audioUrl && (
                    <Paper sx={{
                        p: 3, mb: 3, borderRadius: 3,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
                    }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            🎧 Bài nghe
                        </Typography>
                        <Box sx={{
                            p: 2, borderRadius: 2,
                            bgcolor: 'rgba(255,255,255,0.15)',
                            backdropFilter: 'blur(10px)',
                        }}>
                            <audio
                                controls
                                src={(test as any).audioUrl}
                                style={{ width: '100%' }}
                            />
                        </Box>
                        <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                            💡 Hãy nghe kỹ trước khi trả lời các câu hỏi bên dưới
                        </Typography>
                    </Paper>
                )}

                {/* Passage for Reading/Listening */}
                {(test as any)?.passage && (test as any)?.skillType !== 'writing' && (
                    <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: COLORS.primary.main }}>
                            {(test as any)?.skillType === 'listening' ? '📝 Transcript (tham khảo)' : '📖 Đoạn văn đọc hiểu'}
                        </Typography>
                        <Box sx={{
                            p: 2.5, borderRadius: 2,
                            bgcolor: '#fafafa', border: '1px solid #e5e5e5',
                            fontFamily: '"Georgia", serif',
                            fontSize: '1rem',
                            lineHeight: 1.8,
                            whiteSpace: 'pre-wrap',
                        }}>
                            {(test as any).passage}
                        </Box>
                    </Paper>
                )}

                {/* Questions - MC Mode */}
                {!isWritingTest && test.questions.map((question, index) => (
                    <QuestionCard
                        key={question.id}
                        question={question}
                        questionNumber={index + 1}
                        selectedAnswer={answers[index] === -1 ? undefined : answers[index]}
                        onAnswerChange={(answer) => handleAnswerChange(index, answer)}
                        disabled={submitting}
                    />
                ))}

                {/* Writing Mode */}
                {isWritingTest && (
                    <Paper sx={{ p: 3, borderRadius: 3, mb: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                        {/* Writing Prompt */}
                        {test.questions[0]?.prompt && (
                            <Box sx={{
                                p: 2.5, mb: 3, borderRadius: 2,
                                bgcolor: '#f0fdf4', border: '1px solid #bbf7d0',
                            }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#166534', mb: 1 }}>
                                    📝 Đề bài:
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#15803d', lineHeight: 1.7 }}>
                                    {test.questions[0].prompt}
                                </Typography>
                                {(test.questions[0].minWords || test.questions[0].maxWords) && (
                                    <Typography variant="body2" sx={{ mt: 1, color: '#166534', fontStyle: 'italic' }}>
                                        Yêu cầu: {test.questions[0].minWords && `tối thiểu ${test.questions[0].minWords} từ`}
                                        {test.questions[0].minWords && test.questions[0].maxWords && ' — '}
                                        {test.questions[0].maxWords && `tối đa ${test.questions[0].maxWords} từ`}
                                    </Typography>
                                )}
                            </Box>
                        )}

                        {/* Reading passage if available */}
                        {test.passage && (
                            <Box sx={{
                                p: 2.5, mb: 3, borderRadius: 2,
                                bgcolor: '#eff6ff', border: '1px solid #bfdbfe',
                            }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e40af', mb: 1 }}>
                                    📖 Đoạn văn tham khảo:
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#1e3a5a', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                                    {test.passage}
                                </Typography>
                            </Box>
                        )}

                        {/* Text Editor */}
                        <TextField
                            fullWidth multiline
                            minRows={12} maxRows={25}
                            placeholder="Nhập bài viết của bạn tại đây..."
                            value={writingResponse}
                            onChange={(e) => setWritingResponse(e.target.value)}
                            disabled={submitting}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    fontSize: '1.05rem',
                                    lineHeight: 1.8,
                                    fontFamily: '"Georgia", serif',
                                },
                            }}
                        />

                        {/* Word Counter */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.5, px: 0.5 }}>
                            <Typography variant="body2" sx={{
                                color: getWordCount() < (test.questions[0]?.minWords || 0) ? '#dc2626' : '#16a34a',
                                fontWeight: 600,
                            }}>
                                📊 Số từ: {getWordCount()}
                                {test.questions[0]?.minWords && ` / ${test.questions[0].minWords} (tối thiểu)`}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#888' }}>
                                {getWordCount() > 0 ? `~${Math.ceil(getWordCount() / 250)} trang` : ''}
                            </Typography>
                        </Box>
                    </Paper>
                )}

                {/* Action Buttons */}
                <Box sx={{
                    mt: 4,
                    mb: 2,
                    display: 'flex',
                    gap: 2,
                    position: 'sticky',
                    bottom: 16,
                    zIndex: 10,
                }}>
                    <Button
                        variant="outlined"
                        startIcon={<ArrowBackIcon />}
                        onClick={() => {
                            if (window.confirm('Bạn có chắc muốn rời khỏi? Tiến trình làm bài sẽ bị mất.')) {
                                navigate('/student/tests');
                            }
                        }}
                        disabled={submitting}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            bgcolor: 'white',
                            borderColor: '#ddd',
                            '&:hover': { bgcolor: '#f8f8f8', borderColor: '#bbb' },
                        }}
                    >
                        Hủy bỏ
                    </Button>
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<SendIcon />}
                        onClick={handleSubmitClick}
                        disabled={submitting || (isWritingTest ? getWordCount() < 5 : getAnsweredCount() === 0)}
                        sx={{
                            flex: 1,
                            borderRadius: 2,
                            py: 1.5,
                            fontWeight: 700,
                            fontSize: '1rem',
                            textTransform: 'none',
                            background: `linear-gradient(135deg, #16a34a 0%, #15803d 100%)`,
                            boxShadow: '0 4px 15px rgba(22,163,74,0.3)',
                            '&:hover': {
                                boxShadow: '0 6px 20px rgba(22,163,74,0.4)',
                                transform: 'translateY(-1px)',
                            },
                            '&:disabled': {
                                background: '#e0e0e0',
                            },
                            transition: 'all 0.2s',
                        }}
                    >
                        {submitting ? 'Đang nộp bài...' : 'Nộp bài kiểm tra'}
                    </Button>
                </Box>

                {/* Confirm Dialog */}
                <Dialog
                    open={showConfirmDialog}
                    onClose={() => setShowConfirmDialog(false)}
                    PaperProps={{ sx: { borderRadius: 3, minWidth: 400 } }}
                >
                    <DialogTitle sx={{
                        fontWeight: 700,
                        color: COLORS.primary.main,
                        pb: 1,
                    }}>
                        Xác nhận nộp bài
                    </DialogTitle>
                    <DialogContent>
                        <Typography sx={{ mb: 2 }}>
                            Bạn có chắc chắn muốn nộp bài? Sau khi nộp sẽ không thể thay đổi câu trả lời.
                        </Typography>
                        <Box sx={{
                            p: 2,
                            bgcolor: '#f8f9fa',
                            borderRadius: 2,
                            border: '1px solid #e9ecef',
                        }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                Đã trả lời: <strong style={{ color: '#16a34a' }}>{getAnsweredCount()}</strong> / {test.questions.length} câu
                            </Typography>
                        {!isWritingTest && test.questions.length - getAnsweredCount() > 0 && (
                            <Typography variant="body2" sx={{ color: '#dc2626', mt: 0.5 }}>
                                ⚠ Còn {test.questions.length - getAnsweredCount()} câu chưa trả lời
                            </Typography>
                        )}
                        {isWritingTest && (
                            <Typography variant="body2" sx={{ mt: 0.5, color: '#166534' }}>
                                ✍ Bài viết: {getWordCount()} từ — AI sẽ chấm điểm tự động
                            </Typography>
                        )}
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 2.5, pt: 1 }}>
                        <Button
                            onClick={() => setShowConfirmDialog(false)}
                            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                        >
                            Quay lại
                        </Button>
                        <Button
                            onClick={handleConfirmSubmit}
                            variant="contained"
                            color="primary"
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600,
                                background: `linear-gradient(135deg, #16a34a 0%, #15803d 100%)`,
                                px: 3,
                            }}
                        >
                            Xác nhận nộp bài
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </DashboardLayout>
    );
};

export default TakeTest;
