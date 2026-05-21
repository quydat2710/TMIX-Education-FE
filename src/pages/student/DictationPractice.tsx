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
    Dialog, DialogContent, DialogTitle,
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
    Close as CloseIcon,
    SignalCellularAlt1Bar as Level1Icon,
    SignalCellularAlt2Bar as Level2Icon,
    SignalCellularAlt as Level3Icon,
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
    { value: 'easy', label: 'Cơ bản', color: '#16a34a', desc: 'Câu ngắn, từ vựng đơn giản', icon: <Level1Icon sx={{ fontSize: 36 }} /> },
    { value: 'medium', label: 'Trung bình', color: '#d97706', desc: 'Câu dài hơn, từ vựng phong phú', icon: <Level2Icon sx={{ fontSize: 36 }} /> },
    { value: 'hard', label: 'Nâng cao', color: '#dc2626', desc: 'Câu phức tạp, chủ đề chuyên sâu', icon: <Level3Icon sx={{ fontSize: 36 }} /> },
];

const MAX_ATTEMPTS = 5;

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
    const [isResultModalOpen, setIsResultModalOpen] = useState(false);
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

            const nextAttempt = attempts + 1;
            const isLastAttempt = nextAttempt >= MAX_ATTEMPTS;

            const res = await axiosInstance.post('/tts/dictation/check', {
                id: sentenceId,
                answer: userAnswer.trim(),
                forceReveal: isLastAttempt,
            });

            const data = res?.data?.data || res?.data;
            setResult(data);
            setAttempts(nextAttempt);
            setIsResultModalOpen(true);
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
        setIsResultModalOpen(false);
    };

    return (
        <DashboardLayout>
            <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, md: 3 } }}>

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
                                        <CardContent sx={{ textAlign: 'center', py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <Box sx={{ color: lv.color, mb: 1.5, p: 2, borderRadius: '50%', bgcolor: lv.color + '15' }}>
                                                {lv.icon}
                                            </Box>
                                            <Chip
                                                label={lv.label}
                                                sx={{
                                                    bgcolor: lv.color + '15',
                                                    color: lv.color,
                                                    fontWeight: 800,
                                                    fontSize: '0.95rem',
                                                    mb: 1.5,
                                                }}
                                            />
                                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
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
                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between' }}>
                                    <Button
                                        variant="outlined"
                                        onClick={() => { setSentenceId(''); setResult(null); setUserAnswer(''); setAttempts(0); }}
                                        sx={{ borderRadius: 2 }}
                                    >
                                        Quay lại
                                    </Button>
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

                        {/* Results Modal */}
                        <Dialog
                            open={isResultModalOpen}
                            onClose={handleRetry}
                            maxWidth="md"
                            fullWidth
                            PaperProps={{ sx: { borderRadius: 4, overflow: 'hidden' } }}
                            scroll="paper"
                        >
                            {result && (
                                <>
                                    <DialogTitle sx={{ bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2.5 }}>
                                        <Typography variant="h6" fontWeight={800} color="#0f172a" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <TrophyIcon sx={{ color: '#2563eb' }} /> Báo cáo Chính tả
                                        </Typography>
                                        <IconButton onClick={handleRetry} size="small" sx={{ bgcolor: '#e2e8f0', '&:hover': { bgcolor: '#cbd5e1' } }}>
                                            <CloseIcon fontSize="small" />
                                        </IconButton>
                                    </DialogTitle>
                                    <DialogContent sx={{ p: { xs: 2, md: 4 } }}>
                                        {/* Score bar */}
                                        <Box sx={{
                                            p: 3, borderRadius: 3, mb: 4,
                                            bgcolor: result.isCorrect ? '#f0fdf4' : '#fef2f2',
                                            border: `2px dashed ${result.isCorrect ? '#86efac' : '#fca5a5'}`,
                                            display: 'flex', flexDirection: 'column', alignItems: 'center'
                                        }}>
                                            <Typography variant="h4" fontWeight={900} sx={{
                                                color: result.isCorrect ? '#16a34a' : '#dc2626', mb: 1,
                                                display: 'flex', alignItems: 'center', gap: 1,
                                            }}>
                                                {result.isCorrect ? <CheckIcon sx={{ fontSize: 32 }} /> : <WrongIcon sx={{ fontSize: 32 }} />}
                                                {result.score}%
                                            </Typography>
                                            <Typography variant="body1" fontWeight={600} color="text.secondary" sx={{ mb: 2 }}>
                                                {result.correctWords}/{result.totalWords} từ đúng
                                            </Typography>
                                            
                                            <LinearProgress
                                                variant="determinate"
                                                value={result.score}
                                                sx={{
                                                    width: '100%', height: 10, borderRadius: 5,
                                                    bgcolor: result.isCorrect ? '#dcfce7' : '#fee2e2',
                                                    '& .MuiLinearProgress-bar': {
                                                        bgcolor: result.isCorrect ? '#16a34a' : '#dc2626',
                                                        borderRadius: 5,
                                                    },
                                                }}
                                            />
                                        </Box>

                                        {/* Word-by-word result */}
                                        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 4, bgcolor: '#fafafa' }}>
                                            <Typography variant="subtitle1" fontWeight={800} gutterBottom color="#475569">
                                                <EditIcon sx={{ fontSize: 18, verticalAlign: 'middle', mr: 0.5 }} />
                                                Bài làm của bạn:
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                                                {result.wordResults.map((wr, i) => {
                                                    const isFinished = result.isCorrect || attempts >= MAX_ATTEMPTS;
                                                    return (
                                                        <Tooltip
                                                            key={i}
                                                            title={wr.correct ? 'Đúng' : (isFinished ? `Từ đúng: ${wr.expected}` : 'Chưa đúng')}
                                                            arrow
                                                        >
                                                            <Chip
                                                                label={wr.word}
                                                                sx={{
                                                                    bgcolor: wr.correct ? '#dcfce7' : '#fee2e2',
                                                                    color: wr.correct ? '#16a34a' : '#dc2626',
                                                                    fontWeight: 700,
                                                                    border: `1px solid ${wr.correct ? '#bbf7d0' : '#fecaca'}`,
                                                                    fontSize: '1rem', py: 2
                                                                }}
                                                            />
                                                        </Tooltip>
                                                    );
                                                })}
                                            </Box>
                                        </Paper>

                                        {/* Reveal sentence logic */}
                                        {(result.isCorrect || attempts >= MAX_ATTEMPTS) ? (
                                            <Paper variant="outlined" sx={{
                                                p: 3, borderRadius: 3, mb: 4,
                                                bgcolor: '#f0fdf4', borderColor: '#86efac',
                                            }}>
                                                <Typography variant="subtitle1" fontWeight={800} color="#16a34a" gutterBottom>
                                                    <CheckIcon sx={{ fontSize: 18, verticalAlign: 'middle', mr: 0.5 }} />
                                                    {result.isCorrect ? 'Hoàn hảo! Đây là câu gốc:' : 'Hết số lần thử. Đáp án đúng là:'}
                                                </Typography>
                                                <Typography variant="h6" sx={{ fontStyle: 'italic', color: '#064e3b', fontWeight: 700, mt: 1 }}>
                                                    "{result.originalSentence}"
                                                </Typography>
                                            </Paper>
                                        ) : (
                                            <Alert severity="warning" sx={{ mb: 4, borderRadius: 2, fontWeight: 600, fontSize: '1rem' }}>
                                                Chưa đúng rồi. Bạn còn {MAX_ATTEMPTS - attempts} lần thử. Hãy nghe thật kỹ lại nhé!
                                            </Alert>
                                        )}

                                        {/* Action buttons */}
                                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
                                            {(!result.isCorrect && attempts < MAX_ATTEMPTS) && (
                                                <Button
                                                    variant="contained"
                                                    onClick={handleRetry}
                                                    startIcon={<ReplayIcon />}
                                                    sx={{ bgcolor: '#2563eb', '&:hover': { bgcolor: '#1d4ed8' }, borderRadius: 3, px: 4, py: 1.5, fontWeight: 700 }}
                                                >
                                                    Đóng & Nghe lại
                                                </Button>
                                            )}
                                            {(result.isCorrect || attempts >= MAX_ATTEMPTS) && (
                                                <Button
                                                    variant="contained"
                                                    onClick={() => { setIsResultModalOpen(false); handleNext(); }}
                                                    startIcon={<NextIcon />}
                                                    sx={{ bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' }, borderRadius: 3, px: 4, py: 1.5, fontWeight: 700 }}
                                                >
                                                    Câu tiếp theo
                                                </Button>
                                            )}
                                        </Box>
                                    </DialogContent>
                                </>
                            )}
                        </Dialog>
                    </Paper>
                )}

                {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}
            </Box>
        </DashboardLayout>
    );
};

export default DictationPractice;
