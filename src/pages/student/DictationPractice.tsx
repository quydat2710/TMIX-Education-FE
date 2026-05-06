/**
 * Dictation Practice Page
 * 
 * Flow:
 * 1. Student picks a difficulty level (Easy / Medium / Hard)
 * 2. System fetches a random sentence (text is hidden!)
 * 3. TTS reads the sentence aloud — student can replay & adjust speed
 * 4. Student types what they hear
 * 5. Submit → word-by-word comparison (case-insensitive)
 *    - Wrong → highlight correct/wrong words, do NOT reveal original
 *    - 100% correct → reveal original sentence + congrats
 */
import React, { useState, useRef } from 'react';
import {
    Box, Typography, Button, Paper, TextField, Grid,
    CircularProgress, Alert, Chip, LinearProgress,
    Card, CardContent, Slider, IconButton, Tooltip,
} from '@mui/material';
import {
    Hearing as HearingIcon,
    VolumeUp as VolumeUpIcon,
    Replay as ReplayIcon,
    Send as SendIcon,
    CheckCircle as CheckIcon,
    Cancel as WrongIcon,
    Speed as SpeedIcon,
    EmojiEvents as TrophyIcon,
    NavigateNext as NextIcon,
    Edit as EditIcon,
} from '@mui/icons-material';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import axiosInstance from '../../utils/axios.customize';

interface WordResult {
    word: string;
    correct: boolean;
    expected?: string;
}

interface DictationResult {
    isCorrect: boolean;
    score: number;
    totalWords: number;
    correctWords: number;
    wordResults: WordResult[];
    originalSentence?: string;
}

const LEVELS = [
    { value: 'easy', label: 'Cơ bản', color: '#16a34a', desc: 'Câu ngắn, từ vựng đơn giản' },
    { value: 'medium', label: 'Trung bình', color: '#d97706', desc: 'Câu dài hơn, từ vựng phong phú' },
    { value: 'hard', label: 'Nâng cao', color: '#dc2626', desc: 'Câu phức tạp, chủ đề chuyên sâu' },
];

const DictationPractice: React.FC = () => {
    const [level, setLevel] = useState('');
    const [sentenceId, setSentenceId] = useState('');
    const [sentenceCategory, setSentenceCategory] = useState('');
    const [audioUrl, setAudioUrl] = useState('');
    const [audioLoading, setAudioLoading] = useState(false);
    const [speed, setSpeed] = useState(1.0);
    const [userAnswer, setUserAnswer] = useState('');
    const [checking, setChecking] = useState(false);
    const [result, setResult] = useState<DictationResult | null>(null);
    const [error, setError] = useState('');
    const [attempts, setAttempts] = useState(0);
    const [stats, setStats] = useState({ total: 0, correct: 0 });

    const audioRef = useRef<HTMLAudioElement | null>(null);

    // ── Step 1: Pick level → fetch random sentence + audio ──
    const handleSelectLevel = async (selectedLevel: string) => {
        setLevel(selectedLevel);
        setResult(null);
        setUserAnswer('');
        setError('');
        setAttempts(0);

        try {
            setAudioLoading(true);

            // Get random sentence metadata (no text!)
            const metaRes = await axiosInstance.get(`/tts/dictation/random?level=${selectedLevel}`);
            const { id, category } = metaRes?.data?.data || metaRes?.data;
            setSentenceId(id);
            setSentenceCategory(category);

            // Fetch audio
            await fetchAudio(id, 1.0);
        } catch (err: any) {
            setError('Không thể tải bài nghe. Vui lòng thử lại.');
            console.error(err);
        } finally {
            setAudioLoading(false);
        }
    };

    // ── Fetch audio for sentence ──
    const fetchAudio = async (id: string, spd: number) => {
        try {
            if (audioUrl) URL.revokeObjectURL(audioUrl);

            const res = await axiosInstance.post('/tts/dictation/audio', { id, speed: spd }, {
                responseType: 'blob',
                timeout: 30000,
            });

            const blob = new Blob([res.data], { type: 'audio/wav' });
            const url = URL.createObjectURL(blob);
            setAudioUrl(url);
        } catch {
            setError('Không thể tạo audio. TTS server có thể chưa khởi động.');
        }
    };

    // ── Replay with new speed ──
    const handleSpeedChange = async (newSpeed: number) => {
        setSpeed(newSpeed);
        if (sentenceId) {
            setAudioLoading(true);
            await fetchAudio(sentenceId, newSpeed);
            setAudioLoading(false);
        }
    };

    // ── Play audio ──
    const playAudio = () => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
        }
    };

    // ── Submit answer ──
    const handleCheck = async () => {
        if (!userAnswer.trim() || !sentenceId) return;

        try {
            setChecking(true);
            setError('');

            const res = await axiosInstance.post('/tts/dictation/check', {
                id: sentenceId,
                answer: userAnswer.trim(),
            });

            const data = res?.data?.data || res?.data;
            setResult(data);
            setAttempts(prev => prev + 1);
            setStats(prev => ({
                total: prev.total + 1,
                correct: prev.correct + (data.isCorrect ? 1 : 0),
            }));
        } catch (err: any) {
            setError('Kiểm tra thất bại. Vui lòng thử lại.');
        } finally {
            setChecking(false);
        }
    };

    // ── Next sentence ──
    const handleNext = () => {
        handleSelectLevel(level);
    };

    // ── Try again (same sentence) ──
    const handleRetry = () => {
        setResult(null);
        setUserAnswer('');
    };

    return (
        <DashboardLayout>
            <Box sx={{ maxWidth: 800, mx: 'auto', p: { xs: 2, md: 3 } }}>

                {/* Header */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 3, mb: 3, borderRadius: 4,
                        background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 50%, #7c3aed 100%)',
                        color: 'white',
                        boxShadow: '0 8px 32px rgba(37,99,235,0.35)',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <HearingIcon sx={{ fontSize: 36 }} />
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 800 }}>
                                Luyện Chính Tả
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                Nghe audio, viết lại chính xác nội dung nghe được
                            </Typography>
                        </Box>
                        {stats.total > 0 && (
                            <Chip
                                label={`${stats.correct}/${stats.total} đúng`}
                                sx={{ ml: 'auto', bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 700 }}
                            />
                        )}
                    </Box>
                </Paper>

                {/* Level Selection */}
                {!sentenceId && (
                    <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                            Chọn mức độ
                        </Typography>
                        <Grid container spacing={2}>
                            {LEVELS.map(lv => (
                                <Grid item xs={12} sm={4} key={lv.value} sx={{ display: 'flex' }}>
                                    <Card
                                        variant="outlined"
                                        onClick={() => handleSelectLevel(lv.value)}
                                        sx={{
                                            width: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            borderColor: '#e5e7eb',
                                            transition: 'all 0.2s',
                                            '&:hover': {
                                                borderColor: lv.color,
                                                boxShadow: `0 4px 16px ${lv.color}25`,
                                                transform: 'translateY(-2px)',
                                            },
                                        }}
                                    >
                                        <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                            <Chip
                                                label={lv.label}
                                                sx={{
                                                    bgcolor: lv.color + '15',
                                                    color: lv.color,
                                                    fontWeight: 700,
                                                    fontSize: '0.85rem',
                                                    mb: 1,
                                                }}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                {lv.desc}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>
                )}

                {/* Loading */}
                {audioLoading && (
                    <Paper sx={{ p: 4, mb: 3, borderRadius: 3, textAlign: 'center' }}>
                        <CircularProgress sx={{ color: '#2563eb', mb: 2 }} />
                        <Typography fontWeight={600}>Đang chuẩn bị bài nghe...</Typography>
                    </Paper>
                )}

                {/* Dictation Area */}
                {sentenceId && !audioLoading && (
                    <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                        {/* Level badge */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <Chip
                                label={LEVELS.find(l => l.value === level)?.label}
                                size="small"
                                sx={{
                                    bgcolor: (LEVELS.find(l => l.value === level)?.color || '#666') + '15',
                                    color: LEVELS.find(l => l.value === level)?.color,
                                    fontWeight: 700,
                                }}
                            />
                            <Chip label={sentenceCategory} size="small" variant="outlined" />
                            {attempts > 0 && (
                                <Chip
                                    label={`Lần thử: ${attempts}`}
                                    size="small"
                                    variant="outlined"
                                    sx={{ ml: 'auto' }}
                                />
                            )}
                        </Box>

                        {/* Audio Player */}
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2.5, mb: 2, borderRadius: 2,
                                bgcolor: '#f0f9ff', borderColor: '#bae6fd',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                            }}
                        >
                            <Typography variant="subtitle2" fontWeight={700} color="#0369a1">
                                <VolumeUpIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                                Nhấn nút nghe để bắt đầu
                            </Typography>

                            <audio ref={audioRef} src={audioUrl} />

                            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                                <Button
                                    variant="contained"
                                    onClick={playAudio}
                                    startIcon={<VolumeUpIcon />}
                                    sx={{
                                        bgcolor: '#2563eb', '&:hover': { bgcolor: '#1d4ed8' },
                                        borderRadius: 3, px: 3, py: 1,
                                    }}
                                >
                                    Nghe
                                </Button>
                                <Tooltip title="Nghe lại">
                                    <IconButton onClick={playAudio} sx={{ color: '#2563eb' }}>
                                        <ReplayIcon />
                                    </IconButton>
                                </Tooltip>
                            </Box>

                            {/* Speed control */}
                            <Box sx={{ width: '100%', maxWidth: 300 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <SpeedIcon sx={{ fontSize: 14 }} />
                                    Tốc độ: {speed.toFixed(1)}x
                                </Typography>
                                <Slider
                                    value={speed}
                                    min={0.5}
                                    max={1.5}
                                    step={0.1}
                                    onChange={(_, v) => setSpeed(v as number)}
                                    onChangeCommitted={(_, v) => handleSpeedChange(v as number)}
                                    sx={{
                                        color: '#2563eb',
                                        '& .MuiSlider-thumb': { width: 16, height: 16 },
                                    }}
                                />
                            </Box>
                        </Paper>

                        {/* Answer input */}
                        {!result && (
                            <>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    label="Viết lại những gì bạn nghe được"
                                    placeholder="Type what you hear..."
                                    value={userAnswer}
                                    onChange={(e) => setUserAnswer(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleCheck();
                                        }
                                    }}
                                    sx={{ mb: 2 }}
                                />
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button
                                        variant="contained"
                                        onClick={handleCheck}
                                        disabled={!userAnswer.trim() || checking}
                                        startIcon={checking ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
                                        sx={{ bgcolor: '#2563eb', '&:hover': { bgcolor: '#1d4ed8' }, borderRadius: 2 }}
                                    >
                                        {checking ? 'Đang kiểm tra...' : 'Kiểm tra'}
                                    </Button>
                                </Box>
                            </>
                        )}

                        {/* Results */}
                        {result && (
                            <Box sx={{ mt: 2 }}>
                                {/* Score bar */}
                                <Box sx={{
                                    p: 2, borderRadius: 2, mb: 2,
                                    bgcolor: result.isCorrect ? '#f0fdf4' : '#fef2f2',
                                    border: `1px solid ${result.isCorrect ? '#bbf7d0' : '#fecaca'}`,
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="subtitle1" fontWeight={700} sx={{
                                            color: result.isCorrect ? '#16a34a' : '#dc2626',
                                            display: 'flex', alignItems: 'center', gap: 0.5,
                                        }}>
                                            {result.isCorrect
                                                ? <><TrophyIcon sx={{ fontSize: 20 }} /> Chính xác!</>
                                                : <><WrongIcon sx={{ fontSize: 20 }} /> Chưa đúng</>
                                            }
                                        </Typography>
                                        <Typography variant="h5" fontWeight={800} sx={{
                                            color: result.isCorrect ? '#16a34a' : '#dc2626',
                                        }}>
                                            {result.score}%
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={result.score}
                                        sx={{
                                            height: 8, borderRadius: 4,
                                            bgcolor: result.isCorrect ? '#dcfce7' : '#fee2e2',
                                            '& .MuiLinearProgress-bar': {
                                                bgcolor: result.isCorrect ? '#16a34a' : '#dc2626',
                                                borderRadius: 4,
                                            },
                                        }}
                                    />
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                        {result.correctWords}/{result.totalWords} từ đúng
                                    </Typography>
                                </Box>

                                {/* Word-by-word result */}
                                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2, bgcolor: '#fafafa' }}>
                                    <Typography variant="subtitle2" fontWeight={700} gutterBottom color="text.secondary">
                                        <EditIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                                        Kết quả chi tiết:
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, lineHeight: 2.2 }}>
                                        {result.wordResults.map((wr, i) => (
                                            <Tooltip
                                                key={i}
                                                title={wr.correct ? 'Đúng' : `Từ đúng: ${wr.expected}`}
                                                arrow
                                            >
                                                <Chip
                                                    label={wr.word}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: wr.correct ? '#dcfce7' : '#fee2e2',
                                                        color: wr.correct ? '#16a34a' : '#dc2626',
                                                        fontWeight: 600,
                                                        border: `1px solid ${wr.correct ? '#bbf7d0' : '#fecaca'}`,
                                                        fontSize: '0.85rem',
                                                    }}
                                                />
                                            </Tooltip>
                                        ))}
                                    </Box>
                                </Paper>

                                {/* Reveal sentence only when 100% correct */}
                                {result.isCorrect && result.originalSentence && (
                                    <Paper variant="outlined" sx={{
                                        p: 2, borderRadius: 2, mb: 2,
                                        bgcolor: '#f0fdf4', borderColor: '#86efac',
                                    }}>
                                        <Typography variant="subtitle2" fontWeight={700} color="#16a34a" gutterBottom>
                                            <CheckIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                                            Câu gốc:
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontStyle: 'italic', color: '#374151', fontWeight: 500 }}>
                                            "{result.originalSentence}"
                                        </Typography>
                                    </Paper>
                                )}

                                {!result.isCorrect && (
                                    <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                                        Nghe lại và thử lần nữa! Câu gốc chỉ hiện khi bạn viết đúng 100%.
                                    </Alert>
                                )}

                                {/* Action buttons */}
                                <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', mt: 2 }}>
                                    {!result.isCorrect && (
                                        <Button
                                            variant="contained"
                                            onClick={handleRetry}
                                            startIcon={<ReplayIcon />}
                                            sx={{ bgcolor: '#2563eb', '&:hover': { bgcolor: '#1d4ed8' }, borderRadius: 3 }}
                                        >
                                            Thử lại
                                        </Button>
                                    )}
                                    <Button
                                        variant={result.isCorrect ? 'contained' : 'outlined'}
                                        onClick={handleNext}
                                        startIcon={<NextIcon />}
                                        sx={{
                                            borderRadius: 3,
                                            ...(result.isCorrect && {
                                                bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' },
                                            }),
                                        }}
                                    >
                                        Câu tiếp theo
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        onClick={() => { setSentenceId(''); setResult(null); setUserAnswer(''); }}
                                        sx={{ borderRadius: 3 }}
                                    >
                                        Đổi level
                                    </Button>
                                </Box>
                            </Box>
                        )}
                    </Paper>
                )}

                {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}
            </Box>
        </DashboardLayout>
    );
};

export default DictationPractice;
