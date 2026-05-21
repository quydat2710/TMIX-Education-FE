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
    Dialog, DialogContent, DialogTitle, IconButton,
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
    Home as HomeIcon,
    Restaurant as RestaurantIcon,
    FlightTakeoff as FlightIcon,
    Map as MapIcon,
    School as SchoolIcon,
    BusinessCenter as BusinessIcon,
    Biotech as ScienceIcon,
    TheaterComedy as CultureIcon,
    FilterList as FilterListIcon,
    GraphicEq as GraphicEqIcon,
    Close as CloseIcon,
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

const getCategoryIcon = (category: string) => {
    switch (category) {
        case 'Daily Life': return <HomeIcon sx={{ fontSize: 16 }} />;
        case 'Restaurant': return <RestaurantIcon sx={{ fontSize: 16 }} />;
        case 'Travel': return <FlightIcon sx={{ fontSize: 16 }} />;
        case 'Direction': return <MapIcon sx={{ fontSize: 16 }} />;
        case 'Education': return <SchoolIcon sx={{ fontSize: 16 }} />;
        case 'Business': return <BusinessIcon sx={{ fontSize: 16 }} />;
        case 'Culture': return <CultureIcon sx={{ fontSize: 16 }} />;
        case 'Science': return <ScienceIcon sx={{ fontSize: 16 }} />;
        default: return <InfoIcon sx={{ fontSize: 16 }} />;
    }
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
    const [filterCategory, setFilterCategory] = useState<string>('All');
    const [filterLevel, setFilterLevel] = useState<string>('All');
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState('');
    const [evaluating, setEvaluating] = useState(false);
    const [result, setResult] = useState<GradingResult | null>(null);
    const [isResultModalOpen, setIsResultModalOpen] = useState(false);
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
                setIsResultModalOpen(true);
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

    const handleReset = () => {
        setResult(null);
        setIsResultModalOpen(false);
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

    const filteredSentences = SAMPLE_SENTENCES.filter(s => {
        const matchCategory = filterCategory === 'All' || s.category === filterCategory;
        const matchLevel = filterLevel === 'All' || s.level === filterLevel;
        return matchCategory && matchLevel;
    });

    const categories = ['All', ...Array.from(new Set(SAMPLE_SENTENCES.map(s => s.category)))];
    const levels = ['All', 'Easy', 'Medium', 'Hard'];

    // ── Helper: Render Audio Controls ──
    const renderAudioControls = () => (
        <Box>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: 'center' }}>
                <Button
                    variant="outlined"
                    onClick={handleListen}
                    disabled={!referenceText.trim()}
                    startIcon={tts.isLoading ? <CircularProgress size={18} /> : <VolumeUpIcon />}
                    sx={{
                        borderColor: '#7c3aed', color: '#7c3aed',
                        '&:hover': { borderColor: '#6d28d9', bgcolor: '#f5f3ff' },
                        px: 3, py: 1.5, borderRadius: 3, minWidth: 160,
                        ...(tts.isSpeaking && {
                            animation: 'pulse 1.5s ease-in-out infinite',
                            '@keyframes pulse': { '0%,100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.03)' } },
                        }),
                    }}
                >
                    {tts.isSpeaking ? 'Đang phát...' : 'Nghe mẫu'}
                </Button>

                <Button
                    variant={isRecording ? 'contained' : 'outlined'}
                    onClick={isRecording ? stopRecording : startRecording}
                    startIcon={isRecording ? <StopIcon /> : <MicIcon />}
                    sx={{
                        px: 3, py: 1.5, borderRadius: 3, minWidth: 180,
                        ...(isRecording ? {
                            bgcolor: '#dc2626', '&:hover': { bgcolor: '#b91c1c' },
                            boxShadow: '0 0 15px rgba(220,38,38,0.5)',
                        } : {
                            borderColor: '#dc2626', color: '#dc2626',
                            '&:hover': { borderColor: '#b91c1c', bgcolor: '#fef2f2' },
                        }),
                    }}
                >
                    {isRecording ? 'Dừng ghi âm' : 'Bắt đầu ghi âm'}
                </Button>

                {/* Simulated Waveform while recording */}
                {isRecording && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 2, color: '#dc2626' }}>
                        <GraphicEqIcon sx={{ animation: 'bounce 0.8s infinite alternate', '@keyframes bounce': { '0%': { transform: 'scaleY(0.5)' }, '100%': { transform: 'scaleY(1.5)' } } }} />
                        <GraphicEqIcon sx={{ animation: 'bounce 0.8s infinite alternate-reverse 0.2s' }} />
                        <GraphicEqIcon sx={{ animation: 'bounce 0.8s infinite alternate 0.4s' }} />
                        <Typography variant="caption" sx={{ ml: 1, fontWeight: 600 }}>Đang thu âm...</Typography>
                    </Box>
                )}
            </Box>

            {/* Playback & Submit */}
            {audioUrl && !isRecording && (
                <Box sx={{ mt: 3, p: 2.5, borderRadius: 3, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                    <Typography variant="body2" fontWeight={700} color="#16a34a" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CheckIcon sx={{ fontSize: 18 }} /> Đã thu âm xong
                    </Typography>
                    <audio controls src={audioUrl} style={{ width: '100%', height: 40, marginBottom: 12 }} />
                    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                        <Button
                            variant="contained"
                            onClick={handleEvaluate}
                            disabled={evaluating}
                            startIcon={evaluating ? <CircularProgress size={18} color="inherit" /> : <SpeakIcon />}
                            sx={{ bgcolor: '#7c3aed', '&:hover': { bgcolor: '#6d28d9' }, borderRadius: 2, px: 3 }}
                        >
                            {evaluating ? 'Đang phân tích AI...' : 'Chấm điểm phát âm'}
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={handleReset}
                            startIcon={<RefreshIcon />}
                            sx={{ borderRadius: 2, color: '#64748b', borderColor: '#cbd5e1' }}
                        >
                            Thu âm lại
                        </Button>
                    </Box>
                </Box>
            )}
        </Box>
    );

    return (
        <DashboardLayout>
            <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, md: 3 } }}>

                {/* ═══ Header ═══ */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 3, mb: 4, borderRadius: 4,
                        background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                        color: 'white',
                        boxShadow: '0 10px 30px -5px rgba(124,58,237,0.4)',
                        position: 'relative', overflow: 'hidden'
                    }}
                >
                    <Box sx={{ position: 'absolute', right: -20, top: -20, opacity: 0.1, transform: 'rotate(15deg)' }}>
                        <MicIcon sx={{ fontSize: 180 }} />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, position: 'relative', zIndex: 1 }}>
                        <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', p: 1.5, borderRadius: 3, backdropFilter: 'blur(10px)' }}>
                            <SpeakIcon sx={{ fontSize: 32 }} />
                        </Box>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5, letterSpacing: '-0.5px' }}>
                                Luyện Phát Âm AI
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                                Nghe mẫu chuẩn xác — Thu âm trực tiếp — AI phân tích từng âm tiết
                            </Typography>
                        </Box>
                    </Box>
                </Paper>

                {/* ═══ Main Practice Area ═══ */}
                <Paper sx={{ p: { xs: 2, md: 4 }, mb: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                    
                    {!customMode ? (
                        <>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                                <Typography variant="h6" fontWeight={800} color="#0f172a" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <PracticeIcon sx={{ color: '#7c3aed' }} /> Chọn câu luyện tập
                                </Typography>
                                <Button size="small" variant="outlined" onClick={() => { setCustomMode(true); handleReset(); setReferenceText(''); }} sx={{ borderRadius: 2, borderColor: '#e2e8f0', color: '#475569', fontWeight: 600 }}>
                                    <EditIcon sx={{ fontSize: 16, mr: 0.5 }} /> Tự nhập câu
                                </Button>
                            </Box>

                            {/* Filters */}
                            <Box sx={{ display: 'flex', gap: 1, mb: 4, flexWrap: 'wrap', alignItems: 'center', bgcolor: '#f8fafc', p: 1.5, borderRadius: 3 }}>
                                <FilterListIcon sx={{ color: '#64748b', mx: 1 }} />
                                {levels.map(level => (
                                    <Chip 
                                        key={level} label={level === 'All' ? 'Tất cả' : level}
                                        onClick={() => setFilterLevel(level)}
                                        sx={{ 
                                            bgcolor: filterLevel === level ? (level === 'All' ? '#1e293b' : levelColors[level]) : 'white',
                                            color: filterLevel === level ? 'white' : '#64748b',
                                            fontWeight: filterLevel === level ? 700 : 500,
                                            boxShadow: filterLevel === level ? '0 2px 8px rgba(0,0,0,0.1)' : '0 1px 2px rgba(0,0,0,0.05)',
                                            '&:hover': { bgcolor: filterLevel === level ? undefined : '#f1f5f9' }
                                        }}
                                    />
                                ))}
                                <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                                {categories.filter(c => c !== 'All').map(cat => (
                                    <Chip 
                                        key={cat} icon={getCategoryIcon(cat)} label={cat}
                                        onClick={() => setFilterCategory(filterCategory === cat ? 'All' : cat)}
                                        variant={filterCategory === cat ? 'filled' : 'outlined'}
                                        sx={{ 
                                            borderColor: filterCategory === cat ? '#7c3aed' : '#e2e8f0',
                                            bgcolor: filterCategory === cat ? '#f5f3ff' : 'white',
                                            color: filterCategory === cat ? '#7c3aed' : '#64748b',
                                            fontWeight: filterCategory === cat ? 600 : 500,
                                            '& .MuiChip-icon': { color: 'inherit' }
                                        }}
                                    />
                                ))}
                            </Box>

                            {/* Sentences List */}
                            <Grid container spacing={2}>
                                {filteredSentences.map((s, i) => {
                                    const isSelected = referenceText === s.text && !customMode;
                                    return (
                                        <Grid item xs={12} md={isSelected ? 12 : 6} key={i} sx={{ transition: 'all 0.3s ease-in-out' }}>
                                            <Card
                                                variant="outlined"
                                                onClick={() => { if (!isSelected) { setReferenceText(s.text); handleReset(); } }}
                                                sx={{
                                                    cursor: isSelected ? 'default' : 'pointer',
                                                    borderColor: isSelected ? '#7c3aed' : '#e2e8f0',
                                                    bgcolor: isSelected ? '#faf5ff' : 'white',
                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    transform: isSelected ? 'scale(1.005)' : 'translateY(0)',
                                                    boxShadow: isSelected ? '0 12px 24px -8px rgba(124, 58, 237, 0.25)' : '0 1px 3px rgba(0,0,0,0.02)',
                                                    '&:hover': { 
                                                        transform: isSelected ? 'scale(1.005)' : 'translateY(-2px)', 
                                                        boxShadow: isSelected ? undefined : '0 6px 16px rgba(0,0,0,0.06)',
                                                        borderColor: isSelected ? '#7c3aed' : '#cbd5e1'
                                                    },
                                                }}
                                            >
                                                <CardContent sx={{ p: { xs: 2.5, md: 3 }, '&:last-child': { pb: { xs: 2.5, md: 3 } } }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                                                        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                                                            <Chip label={s.level} size="small"
                                                                sx={{ bgcolor: levelColors[s.level] + '18', color: levelColors[s.level], fontWeight: 800, fontSize: '0.7rem', px: 0.5, borderRadius: 1.5 }}
                                                            />
                                                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                {getCategoryIcon(s.category)} {s.category}
                                                            </Typography>
                                                        </Box>
                                                        {isSelected && <CheckIcon sx={{ color: '#7c3aed', fontSize: 28 }} />}
                                                    </Box>
                                                    
                                                    <Typography variant="body1" sx={{ 
                                                        fontWeight: 600, 
                                                        color: isSelected ? '#1e293b' : '#334155', 
                                                        fontSize: isSelected ? '1.25rem' : '1.1rem', 
                                                        mb: isSelected ? 3 : 0,
                                                        transition: 'all 0.3s'
                                                    }}>
                                                        "{s.text}"
                                                    </Typography>
                                                    
                                                    {/* Audio Controls Expanded */}
                                                    {isSelected && (
                                                        <Box sx={{ pt: 3, borderTop: '1px dashed #c4b5fd', animation: 'fadeIn 0.5s', '@keyframes fadeIn': { from: { opacity: 0, transform: 'translateY(-10px)' }, to: { opacity: 1, transform: 'translateY(0)' } } }}>
                                                            {renderAudioControls()}
                                                        </Box>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    );
                                })}
                                {filteredSentences.length === 0 && (
                                    <Grid item xs={12}>
                                        <Typography color="text.secondary" textAlign="center" py={4}>Không tìm thấy câu phù hợp. Vui lòng chọn bộ lọc khác.</Typography>
                                    </Grid>
                                )}
                            </Grid>
                        </>
                    ) : (
                        // Custom Mode
                        <Box sx={{ animation: 'fadeIn 0.3s' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography variant="h6" fontWeight={800} color="#0f172a" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <EditIcon sx={{ color: '#7c3aed' }} /> Luyện câu tùy chỉnh
                                </Typography>
                                <Button size="small" onClick={() => { setCustomMode(false); setReferenceText(SAMPLE_SENTENCES[0].text); handleReset(); }} sx={{ color: '#64748b' }}>
                                    <ArrowBackIcon sx={{ fontSize: 16, mr: 0.5 }} /> Quay lại kho câu mẫu
                                </Button>
                            </Box>
                            
                            <TextField
                                fullWidth multiline rows={3}
                                placeholder="Ví dụ: Hello, I am learning English today."
                                value={referenceText}
                                onChange={(e) => { setReferenceText(e.target.value); handleReset(); }}
                                sx={{ 
                                    mb: 4, 
                                    '& .MuiOutlinedInput-root': { 
                                        borderRadius: 3, bgcolor: '#f8fafc', fontSize: '1.2rem', fontWeight: 500, p: 2.5,
                                        '&.Mui-focused': { bgcolor: 'white' }
                                    } 
                                }}
                            />
                            
                            {/* Render controls directly for custom mode */}
                            <Box sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: 'white' }}>
                                {renderAudioControls()}
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

                {/* ═══ Step 3: Results Modal ═══ */}
                <Dialog 
                    open={isResultModalOpen} 
                    onClose={() => setIsResultModalOpen(false)}
                    maxWidth="md"
                    fullWidth
                    PaperProps={{ sx: { borderRadius: 4, overflow: 'hidden' } }}
                    scroll="paper"
                >
                    <DialogTitle sx={{ bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2.5 }}>
                        <Typography variant="h6" fontWeight={800} color="#0f172a" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TrophyIcon sx={{ color: '#7c3aed' }} /> Báo cáo Phát âm
                        </Typography>
                        <IconButton onClick={() => setIsResultModalOpen(false)} size="small" sx={{ bgcolor: '#e2e8f0', '&:hover': { bgcolor: '#cbd5e1' } }}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent sx={{ p: { xs: 2, md: 4 } }}>
                        {result && (
                            <Box>
                                {/* Overall score */}
                                <Box sx={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexDirection: 'column', py: 4, mb: 4,
                                    borderRadius: 3, bgcolor: '#faf5ff', border: '2px dashed #c4b5fd',
                                }}>
                                    <Typography variant="h1" sx={{ fontWeight: 900, color: getScoreColor(result.overallScore) }}>
                                        {result.overallScore.toFixed(1)}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary" fontWeight={600}>
                                        / 10 điểm
                                    </Typography>
                                    <Chip
                                        icon={
                                            result.overallScore >= 8 ? <TrophyIcon sx={{ fontSize: 18 }} /> :
                                                result.overallScore >= 6 ? <TrendingUpIcon sx={{ fontSize: 18 }} /> :
                                                    result.overallScore >= 4 ? <EditIcon sx={{ fontSize: 18 }} /> : <PracticeIcon sx={{ fontSize: 18 }} />
                                        }
                                        label={
                                            result.overallScore >= 8 ? 'Xuất sắc' :
                                                result.overallScore >= 6 ? 'Khá tốt' :
                                                    result.overallScore >= 4 ? 'Cần cải thiện' : 'Luyện thêm nhé'
                                        }
                                        sx={{ mt: 2, fontWeight: 800, fontSize: '0.9rem', py: 2.5, px: 1, bgcolor: getScoreColor(result.overallScore) + '18', color: getScoreColor(result.overallScore) }}
                                    />
                                </Box>

                                {/* AI Transcription */}
                                {result.transcription && (
                                    <Box sx={{ mb: 4, p: 3, borderRadius: 3, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                        <Typography variant="subtitle2" fontWeight={800} color="#475569" gutterBottom>
                                            <HearingIcon sx={{ fontSize: 18, verticalAlign: 'middle', mr: 0.5 }} />
                                            Hệ thống nghe được (Transcription):
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontStyle: 'italic', color: '#1e293b', fontSize: '1.1rem' }}>
                                            "{result.transcription}"
                                        </Typography>
                                    </Box>
                                )}

                                {/* Score breakdown */}
                                <Grid container spacing={2} sx={{ mb: 4 }}>
                                    {[
                                        { label: 'Phát âm', icon: <SpeakIcon sx={{ fontSize: 18, color: '#7c3aed', mr: 0.5 }} />, score: result.pronunciation?.score, feedback: result.pronunciation?.feedback },
                                        { label: 'Độ trôi chảy', icon: <FluencyIcon sx={{ fontSize: 18, color: '#2563eb', mr: 0.5 }} />, score: result.fluency?.score, feedback: result.fluency?.feedback },
                                        { label: 'Độ chính xác', icon: <AccuracyIcon sx={{ fontSize: 18, color: '#059669', mr: 0.5 }} />, score: result.accuracy?.score, feedback: result.accuracy?.feedback },
                                        ...(result.vocabulary ? [{ label: 'Từ vựng', icon: <VocabIcon sx={{ fontSize: 18, color: '#d97706', mr: 0.5 }} />, score: result.vocabulary?.score, feedback: result.vocabulary?.feedback }] : []),
                                    ].map((item, i) => (
                                        <Grid item xs={12} sm={6} key={i}>
                                            <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
                                                <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                        <Typography variant="subtitle1" fontWeight={800} sx={{ display: 'flex', alignItems: 'center' }}>
                                                            {(item as any).icon}{item.label}
                                                        </Typography>
                                                        <Typography variant="h6" fontWeight={900} sx={{ color: getScoreColor(item.score || 0) }}>
                                                            {item.score?.toFixed(1) || '0.0'}
                                                        </Typography>
                                                    </Box>
                                                    <LinearProgress
                                                        variant="determinate" value={(item.score || 0) * 10}
                                                        sx={{ height: 8, borderRadius: 4, bgcolor: '#f1f5f9', mb: 1, '& .MuiLinearProgress-bar': { bgcolor: getScoreColor(item.score || 0), borderRadius: 4 } }}
                                                    />
                                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, display: 'block', lineHeight: 1.5 }}>
                                                        {item.feedback}
                                                    </Typography>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>

                                {/* Mispronunciations */}
                                {result.pronunciation?.mispronunciations && result.pronunciation.mispronunciations.length > 0 && (
                                    <Box sx={{ mb: 4 }}>
                                        <Typography variant="subtitle1" fontWeight={800} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <WarningIcon sx={{ fontSize: 20, color: '#d97706' }} />
                                            Từ phát âm sai:
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 1 }}>
                                            {result.pronunciation.mispronunciations.map((m, i) => (
                                                <Tooltip key={i} title={`Chuẩn: ${m.expected} → Bạn đọc: ${m.actual}`}>
                                                    <Chip
                                                        label={m.word}
                                                        variant="outlined"
                                                        sx={{
                                                            borderColor: m.severity === 'major' ? '#dc2626' : '#d97706',
                                                            color: m.severity === 'major' ? '#dc2626' : '#d97706',
                                                            fontWeight: 700, fontSize: '0.9rem', py: 2
                                                        }}
                                                    />
                                                </Tooltip>
                                            ))}
                                        </Box>
                                    </Box>
                                )}

                                {/* Detailed feedback */}
                                <Box sx={{ p: 3, borderRadius: 3, bgcolor: '#eff6ff', border: '1px solid #bfdbfe' }}>
                                    <Typography variant="subtitle1" fontWeight={800} color="#1d4ed8" gutterBottom>
                                        <InfoIcon sx={{ fontSize: 20, mr: 0.5, verticalAlign: 'middle' }} />
                                        Nhận xét chi tiết của AI:
                                    </Typography>
                                    <Typography variant="body1" color="#1e293b" sx={{ whiteSpace: 'pre-line', lineHeight: 1.7 }}>
                                        {result.detailedFeedback}
                                    </Typography>
                                </Box>

                                {/* Actions */}
                                <Box sx={{ textAlign: 'center', mt: 4 }}>
                                    <Button
                                        variant="contained"
                                        onClick={() => { setIsResultModalOpen(false); handleReset(); }}
                                        startIcon={<RefreshIcon />}
                                        sx={{ bgcolor: '#7c3aed', '&:hover': { bgcolor: '#6d28d9' }, borderRadius: 3, px: 4, py: 1.5, fontWeight: 700, fontSize: '1.05rem' }}
                                    >
                                        Luyện lại câu này
                                    </Button>
                                    <Button
                                        variant="text"
                                        onClick={() => setIsResultModalOpen(false)}
                                        sx={{ ml: 2, color: '#64748b', fontWeight: 600, py: 1.5 }}
                                    >
                                        Đóng
                                    </Button>
                                </Box>
                            </Box>
                        )}
                    </DialogContent>
                </Dialog>
            </Box>
        </DashboardLayout>
    );
};

export default PronunciationPractice;
