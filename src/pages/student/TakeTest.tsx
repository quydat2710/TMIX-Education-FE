// Take Test Page
// Student interface to take a multiple choice test

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
    Mic as MicIcon,
    Stop as StopIcon,
    PlayArrow as PlayIcon,
} from '@mui/icons-material';
import { getStudentTestById } from '../../services/tests';
import { submitTestForGrading, submitWritingTest, submitSpeakingTest } from '../../services/ai-grading';
import { Test } from '../../types/test';
import { QuestionCard, TestTimer } from '../../components/features/test';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import TTSButton from '../../components/TTSButton';
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

    // Speaking recording state
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Sidebar timer state
    const [floatingTimeRemaining, setFloatingTimeRemaining] = useState<number | null>(null);
    const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);

    const isWritingTest = test?.skillType === 'writing';
    const isSpeakingTest = test?.skillType === 'speaking';

    useEffect(() => {
        loadTest();

        // Warn before closing tab or refreshing
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (submitting) return; // Don't warn if already submitting
            e.preventDefault();
            e.returnValue = '';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [testId, submitting]);

    // IntersectionObserver: track which question is currently in view
    useEffect(() => {
        if (!test || isWritingTest || isSpeakingTest) return;
        const observers: IntersectionObserver[] = [];
        test.questions.forEach((_, idx) => {
            const el = document.getElementById(`question-${idx}`);
            if (!el) return;
            const obs = new IntersectionObserver(
                ([entry]) => { if (entry.isIntersecting) setActiveQuestionIndex(idx); },
                { threshold: 0.4, rootMargin: '-80px 0px -40% 0px' }
            );
            obs.observe(el);
            observers.push(obs);
        });
        return () => observers.forEach(o => o.disconnect());
    }, [test, isWritingTest, isSpeakingTest]);

    // Callback to receive live time from TestTimer
    const handleTimeUpdate = useCallback((seconds: number) => {
        setFloatingTimeRemaining(seconds);
    }, []);

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



    const getWordCount = (): number => {
        return writingResponse.trim() ? writingResponse.trim().split(/\s+/).length : 0;
    };

    // Helper: timer color based on absolute time remaining (not just percentage)
    const getTimerColor = (): string => {
        if (floatingTimeRemaining === null) return COLORS.primary.main;
        if (floatingTimeRemaining <= 120) return '#dc2626'; // < 2 min = red
        if (floatingTimeRemaining <= 300) return '#d97706'; // < 5 min = orange
        return COLORS.primary.main; // default = primary blue
    };
    const isTimerUrgent = floatingTimeRemaining !== null && floatingTimeRemaining <= 60;

    // Recording functions
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                setAudioUrl(URL.createObjectURL(blob));
                stream.getTracks().forEach(t => t.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (err) {
            setError('Không thể truy cập microphone. Vui lòng cho phép quyền sử dụng micro.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const resetRecording = () => {
        setAudioBlob(null);
        setAudioUrl(null);
        setRecordingTime(0);
    };

    // Tự động dừng ghi âm khi đạt giới hạn thời gian
    useEffect(() => {
        const limit = test?.questions?.[0]?.duration || 60;
        if (isRecording && recordingTime >= limit) {
            stopRecording();
        }
    }, [recordingTime, isRecording, test]);

    const handleSubmitClick = () => {
        if (isWritingTest) {
            if (getWordCount() < 10) {
                setError('Bài viết quá ngắn. Vui lòng viết ít nhất 10 từ.');
                return;
            }
        } else if (isSpeakingTest) {
            if (!audioBlob) {
                setError('Vui lòng ghi âm trước khi nộp bài.');
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
            } else if (isSpeakingTest && audioBlob) {
                response = await submitSpeakingTest(testId, audioBlob);
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

    // Scroll to a specific question (with offset for fixed header)
    const scrollToQuestion = (index: number) => {
        const el = document.getElementById(`question-${index}`);
        if (el) {
            const y = el.getBoundingClientRect().top + window.scrollY - 90;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    return (
        <DashboardLayout role="student">
            <Box sx={{ p: { xs: 1.5, md: 2 }, maxWidth: 1400, mx: 'auto' }}>
                {/* Compact Header */}
                <Paper sx={{ borderRadius: 3, mb: 2, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                    <Box sx={{ background: `linear-gradient(135deg, ${COLORS.primary.main} 0%, #1E3A5F 100%)`, p: { xs: 2, md: 2.5 }, color: 'white' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Tooltip title="Thoát bài thi">
                                <IconButton
                                    onClick={() => { if (window.confirm('Bạn có chắc muốn rời khỏi? Tiến trình làm bài sẽ bị mất.')) navigate('/student/tests'); }}
                                    disabled={submitting}
                                    sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.15)', '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' }, width: 36, height: 36 }}
                                >
                                    <ArrowBackIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>{test.title}</Typography>
                                {test.description && <Typography variant="body2" sx={{ opacity: 0.85 }}>{test.description}</Typography>}
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <Chip icon={<QuizIcon sx={{ color: 'white !important', fontSize: '14px !important' }} />} label={`${test.questions.length} câu`} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600, fontSize: '0.75rem' }} />
                                <Chip icon={<StarIcon sx={{ color: 'white !important', fontSize: '14px !important' }} />} label={`${test.totalPoints} điểm`} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600, fontSize: '0.75rem' }} />
                                <Chip icon={<CheckCircleIcon sx={{ color: 'white !important', fontSize: '14px !important' }} />} label={`Đạt: ${test.passingScore}%`} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600, fontSize: '0.75rem' }} />
                            </Box>
                        </Box>
                    </Box>
                </Paper>

                {/* 2-Column Layout */}
                <Box sx={{ display: 'flex', gap: 2.5 }}>

                    {/* ===== LEFT COLUMN: Questions ===== */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>

                {/* Audio Player for Listening */}
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

                {/* Passage for Reading — only when NO sections */}
                {(test as any)?.passage && (test as any)?.skillType !== 'writing' && (test as any)?.skillType !== 'listening' && !((test as any)?.sections?.length > 0) && (
                    <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: COLORS.primary.main, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {(test as any)?.skillType === 'listening' ? '📝 Transcript (tham khảo)' : '📖 Đoạn văn đọc hiểu'}
                            <TTSButton text={(test as any).passage} tooltip="🔊 Nghe đoạn văn" color={COLORS.primary.main} />
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

                {/* ===== SECTION-GROUPED MODE ===== */}
                {!isWritingTest && !isSpeakingTest && (test as any)?.sections?.length > 0 && (
                    <>
                        {((test as any).sections as any[]).map((section: any, sIdx: number) => {
                            const sectionQuestions = section.questionIds
                                .map((qId: string) => {
                                    const qIndex = test.questions.findIndex((q: any) => q.id === qId);
                                    return qIndex >= 0 ? { question: test.questions[qIndex], index: qIndex } : null;
                                })
                                .filter(Boolean) as { question: any; index: number }[];

                            return (
                                <Paper key={section.id} sx={{
                                    mb: 3, borderRadius: 3, overflow: 'hidden',
                                    border: '1px solid #e5e7eb',
                                }}>
                                    {/* Section Header */}
                                    <Box sx={{
                                        p: 2.5,
                                        background: (test as any)?.skillType === 'listening'
                                            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                            : 'linear-gradient(135deg, #1E3A5F 0%, #2c5282 100%)',
                                        color: 'white',
                                    }}>
                                        <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {(test as any)?.skillType === 'listening' ? '🎧' : '📖'} {section.title || `Part ${sIdx + 1}`}
                                        </Typography>
                                        {section.instruction && (
                                            <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.85 }}>
                                                {section.instruction}
                                            </Typography>
                                        )}
                                    </Box>

                                    {/* Section Audio (listening) */}
                                    {section.audioUrl && (
                                        <Box sx={{ p: 2, bgcolor: '#f5f3ff', borderBottom: '1px solid #e5e7eb' }}>
                                            <audio controls src={section.audioUrl} style={{ width: '100%' }} />
                                        </Box>
                                    )}

                                    {/* Section Passage (reading) */}
                                    {section.passage && (
                                        <Box sx={{ p: 2.5, bgcolor: '#fafafa', borderBottom: '1px solid #e5e7eb' }}>
                                            <Box sx={{
                                                fontFamily: '"Georgia", serif',
                                                fontSize: '1rem', lineHeight: 1.8,
                                                whiteSpace: 'pre-wrap',
                                            }}>
                                                {section.passage}
                                            </Box>
                                        </Box>
                                    )}

                                    {/* Questions in this section */}
                                    <Box sx={{ p: 2 }}>
                                        {sectionQuestions.map(({ question, index }) => (
                                            <Box key={question.id} id={`question-${index}`}>
                                                <QuestionCard
                                                    question={question}
                                                    questionNumber={index + 1}
                                                    selectedAnswer={answers[index] === -1 ? undefined : answers[index]}
                                                    onAnswerChange={(answer) => handleAnswerChange(index, answer)}
                                                    disabled={submitting}
                                                    isActive={activeQuestionIndex === index}
                                                />
                                            </Box>
                                        ))}
                                    </Box>
                                </Paper>
                            );
                        })}
                    </>
                )}

                {/* ===== FLAT MODE (backward compatible) ===== */}
                {!isWritingTest && !isSpeakingTest && !((test as any)?.sections?.length > 0) && test.questions.map((question, index) => (
                    <Box key={question.id} id={`question-${index}`}>
                        <QuestionCard
                            question={question}
                            questionNumber={index + 1}
                            selectedAnswer={answers[index] === -1 ? undefined : answers[index]}
                            onAnswerChange={(answer) => handleAnswerChange(index, answer)}
                            disabled={submitting}
                            isActive={activeQuestionIndex === index}
                        />
                    </Box>
                ))}

                {/* Speaking Recording Mode */}
                {isSpeakingTest && (
                    <Paper sx={{ p: 3, borderRadius: 3, mb: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                        {/* Speaking Prompt */}
                        {test.questions[0]?.prompt && (
                            <Box sx={{
                                p: 2.5, mb: 3, borderRadius: 2,
                                bgcolor: '#fff7ed', border: '1px solid #fed7aa',
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#9a3412', mb: 1 }}>
                                        🎤 Đề bài:
                                    </Typography>
                                    <TTSButton text={test.questions[0].prompt || ''} tooltip="🔊 Nghe đề bài" />
                                </Box>
                                <Typography variant="body1" sx={{ color: '#c2410c', lineHeight: 1.7 }}>
                                    {test.questions[0].prompt}
                                </Typography>
                                {test.questions[0]?.referenceText && (
                                    <Box sx={{ mt: 2, p: 2, borderRadius: 1.5, bgcolor: '#fef3c7', border: '1px solid #fde68a' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#92400e', mb: 0.5 }}>
                                                📖 Đoạn văn tham khảo:
                                            </Typography>
                                            <TTSButton text={test.questions[0].referenceText || ''} tooltip="🔊 Nghe đoạn văn" color="#92400e" />
                                        </Box>
                                        <Typography variant="body1" sx={{ color: '#78350f', fontFamily: '"Georgia", serif', lineHeight: 1.8 }}>
                                            {test.questions[0].referenceText}
                                        </Typography>
                                    </Box>
                                )}
                                {test.questions[0]?.duration && (
                                    <Typography variant="body2" sx={{ mt: 1, color: '#9a3412', fontStyle: 'italic' }}>
                                        ⏱ Thời gian ghi âm tối đa: {test.questions[0].duration} giây
                                    </Typography>
                                )}
                            </Box>
                        )}

                        {/* Recording Controls */}
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            {!audioBlob ? (
                                <>
                                    {/* Record Button */}
                                    <Box
                                        onClick={isRecording ? stopRecording : startRecording}
                                        sx={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: 120, height: 120,
                                            borderRadius: '50%',
                                            bgcolor: isRecording ? '#dc2626' : '#ea580c',
                                            color: 'white',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s',
                                            boxShadow: isRecording
                                                ? '0 0 0 12px rgba(220,38,38,0.15), 0 8px 30px rgba(220,38,38,0.3)'
                                                : '0 8px 30px rgba(234,88,12,0.3)',
                                            animation: isRecording ? 'pulse 1.5s infinite' : 'none',
                                            '@keyframes pulse': {
                                                '0%': { boxShadow: '0 0 0 0 rgba(220,38,38,0.4)' },
                                                '70%': { boxShadow: '0 0 0 20px rgba(220,38,38,0)' },
                                                '100%': { boxShadow: '0 0 0 0 rgba(220,38,38,0)' },
                                            },
                                            '&:hover': {
                                                transform: 'scale(1.05)',
                                            },
                                        }}
                                    >
                                        {isRecording ? <StopIcon sx={{ fontSize: 48 }} /> : <MicIcon sx={{ fontSize: 48 }} />}
                                    </Box>

                                    {/* Status Text */}
                                    <Typography variant="h6" sx={{ mt: 2, fontWeight: 700, color: isRecording ? '#dc2626' : '#555' }}>
                                        {isRecording
                                            ? `🔴 Đang ghi âm... ${Math.floor(recordingTime / 60)}:${(recordingTime % 60).toString().padStart(2, '0')}`
                                            : '🎤 Nhấn để bắt đầu ghi âm'}
                                    </Typography>
                                    {isRecording && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                            Nhấn nút đỏ để dừng ghi âm
                                        </Typography>
                                    )}
                                </>
                            ) : (
                                <>
                                    {/* Audio Preview */}
                                    <Box sx={{ mb: 3 }}>
                                        <PlayIcon sx={{ fontSize: 48, color: '#16a34a', mb: 1 }} />
                                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#16a34a', mb: 2 }}>
                                            ✅ Đã ghi âm xong!
                                        </Typography>
                                        <Box sx={{
                                            display: 'inline-flex',
                                            p: 2,
                                            borderRadius: 2,
                                            bgcolor: '#f0fdf4',
                                            border: '1px solid #bbf7d0',
                                        }}>
                                            {audioUrl && <audio controls src={audioUrl} style={{ minWidth: 300 }} />}
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                            Thời lượng: {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                                        </Typography>
                                    </Box>

                                    {/* Re-record Button */}
                                    <Button
                                        variant="outlined"
                                        color="warning"
                                        startIcon={<MicIcon />}
                                        onClick={resetRecording}
                                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                                    >
                                        🔄 Ghi âm lại
                                    </Button>
                                </>
                            )}
                        </Box>
                    </Paper>
                )}

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

                    </Box>{/* End Left Column */}

                    {/* ===== RIGHT COLUMN: Sticky Sidebar ===== */}
                    <Box sx={{ width: { xs: '100%', md: 280 }, flexShrink: 0, display: { xs: 'none', md: 'block' } }}>
                        <Box sx={{ position: 'sticky', top: 80 }}>
                            <Box sx={{ display: 'none' }}>
                                <TestTimer durationMinutes={test.duration} onTimeUp={handleTimeUp} isPaused={submitting} onTimeUpdate={handleTimeUpdate} />
                            </Box>
                            {/* Timer */}
                            <Paper sx={{ p: 2.5, mb: 2, borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#888', mb: 0.5, textAlign: 'center', letterSpacing: '0.05em' }}>
                                    ⏱ Thời gian còn lại
                                </Typography>
                                <Typography variant="h3" sx={{ fontWeight: 800, textAlign: 'center', fontVariantNumeric: 'tabular-nums', color: getTimerColor(), lineHeight: 1.2, ...(isTimerUrgent ? { animation: 'pulse-text 1s ease-in-out infinite', '@keyframes pulse-text': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.4 } } } : {}) }}>
                                    {floatingTimeRemaining !== null ? `${String(Math.floor(floatingTimeRemaining / 60)).padStart(2, '0')}:${String(floatingTimeRemaining % 60).padStart(2, '0')}` : '--:--'}
                                </Typography>
                            </Paper>
                            {/* Submit */}
                            <Button fullWidth variant="contained" startIcon={<SendIcon />} onClick={handleSubmitClick}
                                disabled={submitting || (isWritingTest ? getWordCount() < 5 : isSpeakingTest ? !audioBlob : getAnsweredCount() === 0)}
                                sx={{ mb: 0.5, borderRadius: 2.5, py: 1.5, fontSize: '1rem', fontWeight: 700, textTransform: 'none', backgroundColor: '#1E3A5F', boxShadow: '0 4px 12px rgba(30,58,95,0.3)', '&:hover': { backgroundColor: '#152d4a' }, '&:disabled': { bgcolor: '#e5e7eb', color: '#9ca3af' } }}
                            >
                                {submitting ? 'Đang nộp...' : 'NỘP BÀI'}
                            </Button>
                            {!isWritingTest && !isSpeakingTest && getAnsweredCount() === 0 && (
                                <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: '#9ca3af', mt: 0.5, mb: 1.5 }}>
                                    Trả lời ít nhất 1 câu để nộp bài
                                </Typography>
                            )}
                            {(isWritingTest || isSpeakingTest || getAnsweredCount() > 0) && <Box sx={{ mb: 2 }} />}
                            {/* Question Grid */}
                            {!isWritingTest && !isSpeakingTest && (
                                <Paper sx={{ p: 2, borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#555' }}>Tiến độ làm bài</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 700, color: COLORS.primary.main }}>{getAnsweredCount()}/{test.questions.length}</Typography>
                                    </Box>
                                    <LinearProgress variant="determinate" value={(getAnsweredCount() / test.questions.length) * 100}
                                        sx={{ height: 6, borderRadius: 3, mb: 2, bgcolor: '#e5e7eb', '& .MuiLinearProgress-bar': { borderRadius: 3, background: 'linear-gradient(90deg, #3b82f6, #22c55e)' } }} />
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#555', mb: 1 }}>Danh sách câu hỏi</Typography>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0.8 }}>
                                        {test.questions.map((_, idx) => {
                                            const answered = answers[idx] !== -1;
                                            const active = activeQuestionIndex === idx;
                                            return (
                                                <Box key={idx} onClick={() => scrollToQuestion(idx)} sx={{
                                                    width: '100%', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    borderRadius: 1.5, fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
                                                    border: active ? '2px solid #3b82f6' : '1.5px solid',
                                                    borderColor: active ? '#3b82f6' : answered ? '#22c55e' : '#e5e7eb',
                                                    bgcolor: answered ? '#dcfce7' : active ? '#eff6ff' : '#fff',
                                                    color: answered ? '#166534' : active ? '#1d4ed8' : '#6b7280',
                                                    transition: 'all 0.15s', transform: active ? 'scale(1.08)' : 'none',
                                                    boxShadow: active ? '0 0 0 3px rgba(59,130,246,0.15)' : 'none',
                                                    '&:hover': { transform: 'scale(1.08)', borderColor: COLORS.primary.main },
                                                }}>{idx + 1}</Box>
                                            );
                                        })}
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 1.5, mt: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#dcfce7', border: '1.5px solid #22c55e' }} />
                                            <Typography variant="caption" sx={{ color: '#666' }}>Đã làm</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#eff6ff', border: '2px solid #3b82f6' }} />
                                            <Typography variant="caption" sx={{ color: '#666' }}>Hiện tại</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', border: '1.5px solid #d1d5db' }} />
                                            <Typography variant="caption" sx={{ color: '#666' }}>Chưa làm</Typography>
                                        </Box>
                                    </Box>
                                </Paper>
                            )}
                        </Box>
                    </Box>
                </Box>{/* End 2-Column */}

                {/* MOBILE BOTTOM BAR */}
                <Box sx={{ display: { xs: 'block', md: 'none' }, position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1200, bgcolor: 'white', borderTop: '1px solid #e5e7eb', boxShadow: '0 -4px 20px rgba(0,0,0,0.08)' }}>
                    {!isWritingTest && !isSpeakingTest && (
                        <LinearProgress variant="determinate" value={(getAnsweredCount() / test.questions.length) * 100}
                            sx={{ height: 3, '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #3b82f6, #22c55e)' } }} />
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.2, gap: 2 }}>
                        <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', fontVariantNumeric: 'tabular-nums', color: getTimerColor(), minWidth: 55 }}>
                            ⏱ {floatingTimeRemaining !== null ? `${String(Math.floor(floatingTimeRemaining / 60)).padStart(2, '0')}:${String(floatingTimeRemaining % 60).padStart(2, '0')}` : '--:--'}
                        </Typography>
                        {!isWritingTest && !isSpeakingTest && (
                            <Typography variant="body2" sx={{ color: '#666', fontWeight: 600 }}>{getAnsweredCount()}/{test.questions.length} câu</Typography>
                        )}
                        <Box sx={{ flex: 1 }} />
                        <Button variant="contained" size="small" startIcon={<SendIcon />} onClick={handleSubmitClick}
                            disabled={submitting || (isWritingTest ? getWordCount() < 5 : isSpeakingTest ? !audioBlob : getAnsweredCount() === 0)}
                            sx={{ borderRadius: 2, py: 0.8, px: 2.5, fontWeight: 700, textTransform: 'none', backgroundColor: '#1E3A5F', fontSize: '0.85rem', '&:disabled': { bgcolor: '#e5e7eb' } }}
                        >NỘP BÀI</Button>
                    </Box>
                </Box>
                <Box sx={{ display: { xs: 'block', md: 'none' }, height: 70 }} />

                {/* Confirm Dialog */}
                <Dialog open={showConfirmDialog} onClose={() => setShowConfirmDialog(false)} PaperProps={{ sx: { borderRadius: 3, minWidth: 400 } }}>
                    <DialogTitle sx={{ fontWeight: 700, color: COLORS.primary.main, pb: 1 }}>Xác nhận nộp bài</DialogTitle>
                    <DialogContent>
                        <Typography sx={{ mb: 2 }}>Bạn có chắc chắn muốn nộp bài? Sau khi nộp sẽ không thể thay đổi câu trả lời.</Typography>
                        <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #e9ecef' }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {isSpeakingTest ? '🎤 Đã ghi âm xong' : <>Đã trả lời: <strong style={{ color: '#16a34a' }}>{isWritingTest ? '✍' : getAnsweredCount()}</strong> {isWritingTest ? '' : `/ ${test.questions.length} câu`}</>}
                            </Typography>
                            {!isWritingTest && !isSpeakingTest && test.questions.length - getAnsweredCount() > 0 && (
                                <Typography variant="body2" sx={{ color: '#dc2626', mt: 0.5 }}>⚠ Còn {test.questions.length - getAnsweredCount()} câu chưa trả lời</Typography>
                            )}
                            {isWritingTest && <Typography variant="body2" sx={{ mt: 0.5, color: '#166534' }}>✍ Bài viết: {getWordCount()} từ — AI sẽ chấm điểm tự động</Typography>}
                            {isSpeakingTest && <Typography variant="body2" sx={{ mt: 0.5, color: '#9a3412' }}>🎙 Thời lượng: {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')} — AI sẽ chấm điểm tự động</Typography>}
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 2.5, pt: 1 }}>
                        <Button onClick={() => setShowConfirmDialog(false)} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>Quay lại</Button>
                        <Button onClick={handleConfirmSubmit} variant="contained" sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', px: 3 }}>Xác nhận nộp bài</Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </DashboardLayout>
    );
};

export default TakeTest;
