/**
 * Pronunciation Practice Page
 * 
 * Students can:
 * 1. Choose from sample sentences or input custom text
 * 2. Listen to the reference pronunciation via Piper TTS
 * 3. Record their own voice
 * 4. Submit for AI evaluation (Whisper + Groq grading)
 * 5. View detailed feedback: score, mispronunciations, tips
 */
import React, { useState, useRef, useCallback } from 'react';
import {
    Box, Typography, Button, Paper, TextField, Grid,
    CircularProgress, Alert, Chip, LinearProgress,
    Card, CardContent, Tooltip, Divider,
} from '@mui/material';
import {
    Mic as MicIcon,
    Stop as StopIcon,
    VolumeUp as VolumeUpIcon,
    Refresh as RefreshIcon,
    CheckCircle as CheckIcon,
    Warning as WarningIcon,
    Info as InfoIcon,
    RecordVoiceOver as SpeakIcon,
    Speed as FluencyIcon,
    GpsFixed as AccuracyIcon,
    MenuBook as VocabIcon,
    Hearing as HearingIcon,
    EmojiEvents as TrophyIcon,
    TrendingUp as TrendingUpIcon,
    Edit as EditIcon,
    FitnessCenter as PracticeIcon,
    ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { useTTS } from '../../components/TTSButton';
import axiosInstance from '../../utils/axios.customize';

// ── Sample sentences for practice ──
const SAMPLE_SENTENCES = [
    { level: 'Easy', text: 'The weather is nice today.', category: 'Daily Life' },
    { level: 'Easy', text: 'I would like a cup of coffee, please.', category: 'Restaurant' },
    { level: 'Easy', text: 'What time does the bus arrive?', category: 'Travel' },
    { level: 'Medium', text: 'Could you please tell me where the nearest hospital is?', category: 'Direction' },
    { level: 'Medium', text: 'I have been studying English for three years now.', category: 'Education' },
    { level: 'Medium', text: 'The presentation was postponed until next Wednesday.', category: 'Business' },
    { level: 'Hard', text: 'Despite the challenging circumstances, the team managed to deliver the project on schedule.', category: 'Business' },
    { level: 'Hard', text: 'She thoroughly enjoyed the extraordinary performance at the prestigious theater.', category: 'Culture' },
    { level: 'Hard', text: 'The pharmaceutical company announced a breakthrough in vaccine development technology.', category: 'Science' },
];

const levelColors: Record<string, string> = {
    Easy: '#16a34a',
    Medium: '#d97706',
    Hard: '#dc2626',
};

interface GradingResult {
    overallScore: number;
    transcription: string;
    pronunciation: { score: number; feedback: string; mispronunciations?: { word: string; expected: string; actual: string; severity: string }[] };
    fluency: { score: number; feedback: string };
    vocabulary?: { score: number; feedback: string };
    grammar?: { score: number; feedback: string };
    accuracy: { score: number; matchPercentage: number; feedback: string; missedWords?: string[]; addedWords?: string[] };
    detailedFeedback: string;
}

const PronunciationPractice: React.FC = () => {
    const [referenceText, setReferenceText] = useState(SAMPLE_SENTENCES[0].text);
    const [customMode, setCustomMode] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState('');
    const [evaluating, setEvaluating] = useState(false);
    const [result, setResult] = useState<GradingResult | null>(null);
    const [error, setError] = useState('');

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const tts = useTTS();

    // ── Listen to reference pronunciation ──
    const handleListen = () => {
        if (tts.isSpeaking) {
            tts.stop();
        } else {
            tts.speak(referenceText);
        }
    };

    // ── Start recording ──
    const startRecording = useCallback(async () => {
        try {
            setError('');
            setResult(null);
            setAudioBlob(null);
            if (audioUrl) URL.revokeObjectURL(audioUrl);
            setAudioUrl('');

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                    ? 'audio/webm;codecs=opus'
                    : 'audio/webm',
            });

            chunksRef.current = [];
            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };
            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                setAudioUrl(URL.createObjectURL(blob));
                stream.getTracks().forEach(t => t.stop());
            };

            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start();
            setIsRecording(true);
        } catch (err: any) {
            setError('Không thể truy cập microphone. Vui lòng cho phép quyền ghi âm trong trình duyệt.');
        }
    }, [audioUrl]);

    // ── Stop recording ──
    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    }, [isRecording]);

    // ── Submit for evaluation ──
    const handleEvaluate = async () => {
        if (!audioBlob || !referenceText.trim()) return;

        try {
            setEvaluating(true);
            setError('');

            const formData = new FormData();
            formData.append('audio', audioBlob, 'recording.webm');
            formData.append('referenceText', referenceText.trim());

            const response = await axiosInstance.post('/tts/evaluate-pronunciation', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 60000,
            });

            const data = response?.data?.data || response?.data;
            if (data) {
                setResult(data);
            } else {
                setError('Không nhận được kết quả từ server.');
            }
        } catch (err: any) {
            console.error('Evaluation failed:', err);
            setError(
                err?.response?.status === 503
                    ? 'AI server chưa khởi động.'
                    : err?.response?.data?.message || 'Đánh giá phát âm thất bại. Vui lòng thử lại.'
            );
        } finally {
            setEvaluating(false);
        }
    };

    // ── Reset ──
    const handleReset = () => {
        setResult(null);
        setAudioBlob(null);
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl('');
        setError('');
    };

    // ── Score color ──
    const getScoreColor = (score: number) => {
        if (score >= 8) return '#16a34a';
        if (score >= 6) return '#d97706';
        if (score >= 4) return '#ea580c';
        return '#dc2626';
    };

    return (
        <DashboardLayout>
            <Box sx={{ maxWidth: 900, mx: 'auto', p: { xs: 2, md: 3 } }}>

                {/* ═══ Header ═══ */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 3, mb: 3, borderRadius: 4,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #a855f7 100%)',
                        color: 'white',
                        boxShadow: '0 8px 32px rgba(118,75,162,0.35)',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <MicIcon sx={{ fontSize: 36 }} />
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 800 }}>
                                Luyện Phát Âm
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                Nghe mẫu — Ghi âm — Nhận đánh giá phát âm
                            </Typography>
                        </Box>
                    </Box>
                </Paper>

                {/* ═══ Step 1: Choose reference text ═══ */}
                <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip label="1" size="small" sx={{ bgcolor: '#7c3aed', color: 'white', fontWeight: 700 }} />
                        Chọn câu luyện tập
                    </Typography>

                    {!customMode ? (
                        <>
                            <Grid container spacing={1.5} sx={{ mb: 2 }}>
                                {SAMPLE_SENTENCES.map((s, i) => (
                                    <Grid item xs={12} sm={6} key={i}>
                                        <Card
                                            variant="outlined"
                                            onClick={() => { setReferenceText(s.text); handleReset(); }}
                                            sx={{
                                                cursor: 'pointer',
                                                borderColor: referenceText === s.text ? '#7c3aed' : '#e5e7eb',
                                                bgcolor: referenceText === s.text ? '#f5f3ff' : 'white',
                                                transition: 'all 0.2s',
                                                '&:hover': { borderColor: '#7c3aed', boxShadow: '0 2px 8px rgba(124,58,237,0.15)' },
                                            }}
                                        >
                                            <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                                                <Box sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
                                                    <Chip label={s.level} size="small"
                                                        sx={{ bgcolor: levelColors[s.level] + '18', color: levelColors[s.level], fontWeight: 600, fontSize: '0.7rem' }}
                                                    />
                                                    <Chip label={s.category} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                                                </Box>
                                                <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#374151' }}>
                                                    "{s.text}"
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                            <Button size="small" onClick={() => setCustomMode(true)} sx={{ color: '#7c3aed' }}>
                                <EditIcon sx={{ fontSize: 14, mr: 0.5 }} /> Hoặc nhập câu tùy chỉnh
                            </Button>
                        </>
                    ) : (
                        <>
                            <TextField
                                fullWidth multiline rows={2}
                                label="Nhập câu bạn muốn luyện"
                                placeholder="Type any English sentence..."
                                value={referenceText}
                                onChange={(e) => { setReferenceText(e.target.value); handleReset(); }}
                                sx={{ mb: 1 }}
                            />
                            <Button size="small" onClick={() => setCustomMode(false)} sx={{ color: '#7c3aed' }}>
                                <ArrowBackIcon sx={{ fontSize: 14, mr: 0.5 }} /> Quay lại câu mẫu
                            </Button>
                        </>
                    )}
                </Paper>

                {/* ═══ Step 2: Listen + Record ═══ */}
                <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip label="2" size="small" sx={{ bgcolor: '#7c3aed', color: 'white', fontWeight: 700 }} />
                        Nghe mẫu & Ghi âm
                    </Typography>

                    {/* Reference text display */}
                    <Paper variant="outlined" sx={{ p: 2.5, mb: 3, borderRadius: 2, bgcolor: '#faf5ff', borderColor: '#ddd6fe' }}>
                        <Typography variant="h6" sx={{ fontStyle: 'italic', color: '#1f2937', lineHeight: 1.8, textAlign: 'center' }}>
                            "{referenceText}"
                        </Typography>
                    </Paper>

                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'center', alignItems: 'center' }}>
                        {/* Listen button */}
                        <Button
                            variant="outlined"
                            onClick={handleListen}
                            disabled={!referenceText.trim()}
                            startIcon={tts.isLoading ? <CircularProgress size={18} /> : <VolumeUpIcon />}
                            sx={{
                                borderColor: '#7c3aed', color: '#7c3aed',
                                '&:hover': { borderColor: '#6d28d9', bgcolor: '#f5f3ff' },
                                px: 3, py: 1.5, borderRadius: 3,
                                ...(tts.isSpeaking && {
                                    animation: 'pulse 1.5s ease-in-out infinite',
                                    '@keyframes pulse': { '0%,100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.03)' } },
                                }),
                            }}
                        >
                            {tts.isSpeaking ? 'Đang phát...' : 'Nghe mẫu'}
                        </Button>

                        {/* Record button */}
                        <Button
                            variant={isRecording ? 'contained' : 'outlined'}
                            onClick={isRecording ? stopRecording : startRecording}
                            startIcon={isRecording ? <StopIcon /> : <MicIcon />}
                            sx={{
                                px: 3, py: 1.5, borderRadius: 3,
                                ...(isRecording ? {
                                    bgcolor: '#dc2626', '&:hover': { bgcolor: '#b91c1c' },
                                    animation: 'pulse 1s ease-in-out infinite',
                                    '@keyframes pulse': { '0%,100%': { boxShadow: '0 0 0 0 rgba(220,38,38,0.4)' }, '70%': { boxShadow: '0 0 0 10px rgba(220,38,38,0)' } },
                                } : {
                                    borderColor: '#dc2626', color: '#dc2626',
                                    '&:hover': { borderColor: '#b91c1c', bgcolor: '#fef2f2' },
                                }),
                            }}
                        >
                            {isRecording ? 'Dừng ghi âm' : 'Bắt đầu ghi âm'}
                        </Button>
                    </Box>

                    {/* Playback */}
                    {audioUrl && (
                        <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                            <Typography variant="caption" fontWeight={600} color="#16a34a" sx={{ mb: 0.5, display: 'block' }}>
                                <CheckIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                                Đã ghi âm xong — Nghe lại:
                            </Typography>
                            <audio controls src={audioUrl} style={{ width: '100%' }} />
                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                <Button
                                    variant="contained"
                                    onClick={handleEvaluate}
                                    disabled={evaluating}
                                    startIcon={evaluating ? <CircularProgress size={18} color="inherit" /> : <CheckIcon />}
                                    sx={{ bgcolor: '#7c3aed', '&:hover': { bgcolor: '#6d28d9' }, borderRadius: 2 }}
                                >
                                    {evaluating ? 'Đang đánh giá...' : 'Đánh giá phát âm'}
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={handleReset}
                                    startIcon={<RefreshIcon />}
                                    sx={{ borderRadius: 2 }}
                                >
                                    Ghi lại
                                </Button>
                            </Box>
                        </Box>
                    )}
                </Paper>

                {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}

                {/* ═══ Loading indicator ═══ */}
                {evaluating && (
                    <Paper sx={{ p: 3, mb: 3, borderRadius: 3, textAlign: 'center' }}>
                        <CircularProgress sx={{ color: '#7c3aed', mb: 2 }} />
                        <Typography variant="body1" fontWeight={600}>
                            Đang phân tích phát âm của bạn...
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Whisper đang chuyển giọng nói thành text, sau đó AI sẽ so sánh với câu gốc
                        </Typography>
                    </Paper>
                )}

                {/* ═══ Step 3: Results ═══ */}
                {result && (
                    <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                        <Typography variant="h6" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip label="3" size="small" sx={{ bgcolor: '#7c3aed', color: 'white', fontWeight: 700 }} />
                            Kết quả đánh giá
                        </Typography>

                        {/* Overall score */}
                        <Box sx={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexDirection: 'column', py: 3, mb: 3,
                            borderRadius: 3, bgcolor: '#faf5ff', border: '2px solid #ddd6fe',
                        }}>
                            <Typography variant="h2" sx={{ fontWeight: 900, color: getScoreColor(result.overallScore) }}>
                                {result.overallScore.toFixed(1)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" fontWeight={600}>
                                / 10 điểm
                            </Typography>
                            <Chip
                                icon={
                                    result.overallScore >= 8 ? <TrophyIcon sx={{ fontSize: 16 }} /> :
                                        result.overallScore >= 6 ? <TrendingUpIcon sx={{ fontSize: 16 }} /> :
                                            result.overallScore >= 4 ? <EditIcon sx={{ fontSize: 16 }} /> : <PracticeIcon sx={{ fontSize: 16 }} />
                                }
                                label={
                                    result.overallScore >= 8 ? 'Xuất sắc' :
                                        result.overallScore >= 6 ? 'Khá tốt' :
                                            result.overallScore >= 4 ? 'Cần cải thiện' : 'Luyện thêm nhé'
                                }
                                sx={{ mt: 1, fontWeight: 700, bgcolor: getScoreColor(result.overallScore) + '18', color: getScoreColor(result.overallScore) }}
                            />
                        </Box>

                        {/* AI Transcription */}
                        {result.transcription && (
                            <Box sx={{ mb: 3, p: 2, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                <Typography variant="subtitle2" fontWeight={700} color="text.secondary" gutterBottom>
                                    <HearingIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                                    Hệ thống nghe được (Transcription):
                                </Typography>
                                <Typography variant="body1" sx={{ fontStyle: 'italic', color: '#374151' }}>
                                    "{result.transcription}"
                                </Typography>
                            </Box>
                        )}

                        {/* Score breakdown */}
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            {[
                                { label: 'Phát âm', icon: <SpeakIcon sx={{ fontSize: 16, color: '#7c3aed', mr: 0.5 }} />, score: result.pronunciation?.score, feedback: result.pronunciation?.feedback },
                                { label: 'Độ trôi chảy', icon: <FluencyIcon sx={{ fontSize: 16, color: '#2563eb', mr: 0.5 }} />, score: result.fluency?.score, feedback: result.fluency?.feedback },
                                { label: 'Độ chính xác', icon: <AccuracyIcon sx={{ fontSize: 16, color: '#059669', mr: 0.5 }} />, score: result.accuracy?.score, feedback: result.accuracy?.feedback },
                                ...(result.vocabulary ? [{ label: 'Từ vựng', icon: <VocabIcon sx={{ fontSize: 16, color: '#d97706', mr: 0.5 }} />, score: result.vocabulary?.score, feedback: result.vocabulary?.feedback }] : []),
                            ].map((item, i) => (
                                <Grid item xs={12} sm={6} key={i}>
                                    <Card variant="outlined" sx={{ borderRadius: 2 }}>
                                        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                                <Typography variant="subtitle2" fontWeight={700} sx={{ display: 'flex', alignItems: 'center' }}>
                                                    {(item as any).icon}{item.label}
                                                </Typography>
                                                <Typography variant="h6" fontWeight={800} sx={{ color: getScoreColor(item.score || 0) }}>
                                                    {item.score?.toFixed(1) || '0.0'}
                                                </Typography>
                                            </Box>
                                            <LinearProgress
                                                variant="determinate" value={(item.score || 0) * 10}
                                                sx={{ height: 6, borderRadius: 3, bgcolor: '#f1f5f9', '& .MuiLinearProgress-bar': { bgcolor: getScoreColor(item.score || 0), borderRadius: 3 } }}
                                            />
                                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                                {item.feedback}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>

                        {/* Mispronunciations */}
                        {result.pronunciation?.mispronunciations && result.pronunciation.mispronunciations.length > 0 && (
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle2" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <WarningIcon sx={{ fontSize: 18, color: '#d97706' }} />
                                    Từ phát âm sai:
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {result.pronunciation.mispronunciations.map((m, i) => (
                                        <Tooltip key={i} title={`Expected: ${m.expected} → Actual: ${m.actual}`}>
                                            <Chip
                                                label={m.word}
                                                size="small"
                                                variant="outlined"
                                                sx={{
                                                    borderColor: m.severity === 'major' ? '#dc2626' : '#d97706',
                                                    color: m.severity === 'major' ? '#dc2626' : '#d97706',
                                                    fontWeight: 600,
                                                }}
                                            />
                                        </Tooltip>
                                    ))}
                                </Box>
                            </Box>
                        )}

                        <Divider sx={{ my: 2 }} />

                        {/* Detailed feedback */}
                        <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#eff6ff', border: '1px solid #bfdbfe' }}>
                            <Typography variant="subtitle2" fontWeight={700} color="#1d4ed8" gutterBottom>
                                <InfoIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                                Nhận xét chi tiết:
                            </Typography>
                            <Typography variant="body2" color="#374151" sx={{ whiteSpace: 'pre-line' }}>
                                {result.detailedFeedback}
                            </Typography>
                        </Box>

                        {/* Try again */}
                        <Box sx={{ textAlign: 'center', mt: 3 }}>
                            <Button
                                variant="contained"
                                onClick={handleReset}
                                startIcon={<RefreshIcon />}
                                sx={{ bgcolor: '#7c3aed', '&:hover': { bgcolor: '#6d28d9' }, borderRadius: 3, px: 4, py: 1.5 }}
                            >
                                Luyện lại
                            </Button>
                        </Box>
                    </Paper>
                )}
            </Box>
        </DashboardLayout>
    );
};

export default PronunciationPractice;
