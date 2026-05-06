// Create / Edit Test Page
// Teacher interface to create and manage MC test questions

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box, Typography, Button, Paper, TextField, Grid,
    FormControl, InputLabel, Select, MenuItem, IconButton,
    Card, CardContent, Radio, RadioGroup, FormControlLabel,
    Alert, CircularProgress, Chip, Tooltip,
    Dialog, DialogTitle, DialogContent, DialogActions,
    ToggleButtonGroup, ToggleButton,
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Save as SaveIcon,
    Publish as PublishIcon,
    ArrowBack as BackIcon,
    DragIndicator as DragIcon,
    ContentCopy as CopyIcon,
    MenuBook as ReadingIcon,
    Headphones as ListeningIcon,
    Edit as WritingIcon,
    Mic as SpeakingIcon,
} from '@mui/icons-material';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { commonStyles } from '../../utils/styles';
import { createTest, getTestById, updateTest } from '../../services/tests';
import { uploadFileAPI } from '../../services/files';
import { MCQuestion, TestFormData, SkillType } from '../../types/test';
import { useAuth } from '../../contexts/AuthContext';
import { getTeacherScheduleAPI } from '../../services/teachers';
import axiosInstance from '../../utils/axios.customize';

const emptyMCQuestion = (): MCQuestion => ({
    id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    points: 1,
});

const emptyWritingQuestion = () => ({
    id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    prompt: '',
    minWords: 100,
    maxWords: 500,
    sampleAnswer: '',
    rubric: 'Grammar accuracy, Vocabulary range, Coherence and cohesion, Task achievement',
    points: 10,
});

const emptySpeakingQuestion = () => ({
    id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    prompt: '',
    referenceText: '',
    duration: 60,
    points: 10,
});

const getEmptyQuestion = (skillType: SkillType) => {
    switch (skillType) {
        case 'writing': return emptyWritingQuestion();
        case 'speaking': return emptySpeakingQuestion();
        default: return emptyMCQuestion();
    }
};

const skillLabels: Record<SkillType, { label: string; icon: any; color: string }> = {
    reading: { label: 'Đọc hiểu', icon: <ReadingIcon />, color: '#1976d2' },
    listening: { label: 'Nghe', icon: <ListeningIcon />, color: '#9c27b0' },
    writing: { label: 'Viết', icon: <WritingIcon />, color: '#2e7d32' },
    speaking: { label: 'Nói', icon: <SpeakingIcon />, color: '#ed6c02' },
};

const CreateEditTest: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const isEditing = !!id;

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [classes, setClasses] = useState<any[]>([]);
    const [publishDialogOpen, setPublishDialogOpen] = useState(false);
    const [audioUploading, setAudioUploading] = useState(false);
    const [audioMode, setAudioMode] = useState<'upload' | 'tts'>('tts'); // Default to TTS mode
    const [ttsTranscript, setTtsTranscript] = useState('');
    const [ttsSpeed, setTtsSpeed] = useState(1.0);
    const [ttsPause, setTtsPause] = useState(0.8);
    const [ttsPreviewUrl, setTtsPreviewUrl] = useState('');
    const [ttsGenerating, setTtsGenerating] = useState(false);

    const [formData, setFormData] = useState<TestFormData>({
        title: '',
        description: '',
        skillType: 'reading',
        classId: '',
        duration: 30,
        passingScore: 70,
        questions: [emptyMCQuestion()],
        status: 'draft',
    });

    // Load teacher's classes (same API as MyClasses page)
    useEffect(() => {
        const loadClasses = async () => {
            try {
                const teacherId = (user as any)?.teacherId || (user as any)?.teacher?.teacher_id || user?.id;
                if (!teacherId) return;

                const response = await getTeacherScheduleAPI(String(teacherId));
                const classData = response?.data?.classes || response?.data?.data || response?.data || [];
                const mapped = classData.map((item: any) => ({
                    id: String(item?.id || item?.classId || item?._id),
                    name: item?.name || 'Lớp chưa đặt tên',
                }));
                setClasses(mapped);
            } catch (err) {
                console.error('Failed to load classes', err);
            }
        };
        loadClasses();
    }, [user]);

    // Load existing test if editing
    useEffect(() => {
        if (isEditing && id) {
            const loadTest = async () => {
                try {
                    setLoading(true);
                    const response = await getTestById(id);
                    const test = response.data;
                    if (test) {
                        setFormData({
                            title: test.title,
                            description: test.description || '',
                            skillType: test.skillType || 'reading',
                            classId: String(test.classId || ''),
                            duration: test.duration,
                            passingScore: test.passingScore,
                            questions: test.questions || [emptyMCQuestion()],
                            passage: test.passage,
                            speakingPrompt: test.speakingPrompt,
                            audioUrl: test.audioUrl,
                            status: test.status as 'draft' | 'published',
                        });
                    }
                } catch (err: any) {
                    setError('Không thể tải thông tin đề thi');
                } finally {
                    setLoading(false);
                }
            };
            loadTest();
        }
    }, [id, isEditing]);

    const handleFieldChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleQuestionChange = (index: number, field: string, value: any) => {
        setFormData(prev => {
            const questions = [...prev.questions];
            (questions[index] as any)[field] = value;
            return { ...prev, questions };
        });
    };

    const handleOptionChange = (qIndex: number, optIndex: number, value: string) => {
        setFormData(prev => {
            const questions = [...prev.questions];
            questions[qIndex].options[optIndex] = value;
            return { ...prev, questions };
        });
    };

    const addQuestion = () => {
        setFormData(prev => ({
            ...prev,
            questions: [...prev.questions, getEmptyQuestion(prev.skillType)],
        }));
    };

    const handleSkillTypeChange = (_: any, newSkill: SkillType | null) => {
        if (!newSkill || newSkill === formData.skillType) return;
        setFormData(prev => ({
            ...prev,
            skillType: newSkill,
            questions: [getEmptyQuestion(newSkill)],
            passage: '',
            speakingPrompt: '',
        }));
    };

    const removeQuestion = (index: number) => {
        if (formData.questions.length <= 1) return;
        setFormData(prev => ({
            ...prev,
            questions: prev.questions.filter((_, i) => i !== index),
        }));
    };

    const duplicateQuestion = (index: number) => {
        setFormData(prev => {
            const copied = { ...prev.questions[index], id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 5)}` };
            const questions = [...prev.questions];
            questions.splice(index + 1, 0, copied);
            return { ...prev, questions };
        });
    };

    const validateForm = (): string | null => {
        if (!formData.title.trim()) return 'Vui lòng nhập tiêu đề đề thi';
        if (!formData.classId) return 'Vui lòng chọn lớp';
        if (formData.duration < 1) return 'Thời gian phải lớn hơn 0';
        if (formData.questions.length === 0) return 'Đề thi phải có ít nhất 1 câu hỏi';

        if (formData.skillType === 'reading' || formData.skillType === 'listening') {
            for (let i = 0; i < formData.questions.length; i++) {
                const q = formData.questions[i];
                if (!q.question?.trim()) return `Câu ${i + 1}: Chưa nhập nội dung câu hỏi`;
                const emptyOptions = q.options?.filter((o: string) => !o.trim()) || [];
                if (emptyOptions.length > 0) return `Câu ${i + 1}: Phải điền đủ 4 đáp án`;
            }
        } else if (formData.skillType === 'writing') {
            for (let i = 0; i < formData.questions.length; i++) {
                const q = formData.questions[i];
                if (!q.prompt?.trim()) return `Câu ${i + 1}: Chưa nhập đề bài viết`;
            }
        } else if (formData.skillType === 'speaking') {
            for (let i = 0; i < formData.questions.length; i++) {
                const q = formData.questions[i];
                if (!q.prompt?.trim()) return `Câu ${i + 1}: Chưa nhập yêu cầu nói`;
                if (!q.referenceText?.trim()) return `Câu ${i + 1}: Chưa nhập văn bản tham chiếu`;
            }
        }
        return null;
    };

    const handleSave = async (asDraft = true) => {
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setSaving(true);
            setError('');
            const payload = {
                ...formData,
                status: (asDraft ? 'draft' : 'published') as 'draft' | 'published',
            };

            if (isEditing && id) {
                await updateTest(id, payload);
                setSuccess('Cập nhật đề thi thành công!');
            } else {
                await createTest(payload);
                setSuccess(asDraft ? 'Lưu nháp thành công!' : 'Tạo và đăng đề thi thành công!');
            }

            setTimeout(() => navigate('/teacher/tests'), 1500);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Lưu đề thi thất bại');
        } finally {
            setSaving(false);
        }
    };

    const handlePublishAndSave = async () => {
        setPublishDialogOpen(false);
        await handleSave(false);
    };

    // ── TTS Audio Generation Handlers ──

    /** Preview audio from transcript (streams directly, not saved) */
    const handleTtsPreview = async () => {
        if (!ttsTranscript.trim()) return;
        try {
            setTtsGenerating(true);
            setError('');
            // Revoke old preview URL
            if (ttsPreviewUrl) URL.revokeObjectURL(ttsPreviewUrl);

            const response = await axiosInstance.post('/tts/preview-audio',
                { transcript: ttsTranscript, speed: ttsSpeed, pauseBetweenLines: ttsPause },
                { responseType: 'blob', timeout: 120000 },
            );

            const audioBlob = new Blob([response.data], { type: 'audio/wav' });
            const url = URL.createObjectURL(audioBlob);
            setTtsPreviewUrl(url);
            setSuccess('Preview audio đã sẵn sàng! Bấm Play để nghe.');
        } catch (err: any) {
            console.error('TTS preview failed:', err);
            setError(err?.response?.status === 503
                ? 'TTS Server chưa khởi động. Hãy chạy TMix-TTS-Server trước.'
                : 'Tạo preview audio thất bại. Vui lòng thử lại.');
        } finally {
            setTtsGenerating(false);
        }
    };

    /** Generate audio, save to server, and set audioUrl in form */
    const handleTtsGenerate = async () => {
        if (!ttsTranscript.trim()) return;
        try {
            setTtsGenerating(true);
            setError('');

            const response = await axiosInstance.post('/tts/generate-audio',
                { transcript: ttsTranscript, speed: ttsSpeed, pauseBetweenLines: ttsPause },
                { timeout: 120000 },
            );

            const data = response?.data?.data || response?.data;
            if (data?.url) {
                // Build full URL for audio playback
                const backendUrl = axiosInstance.defaults.baseURL?.replace('/api/v1', '') || '';
                const fullUrl = backendUrl + data.url;
                handleFieldChange('audioUrl', fullUrl);
                // Also save transcript to passage field for reference
                handleFieldChange('passage', ttsTranscript);
                setSuccess(`✅ Audio đã tạo thành công! (${data.sizeFormatted}, ${data.durationEstimate})`);
            } else {
                setError('Phản hồi không hợp lệ từ server.');
            }
        } catch (err: any) {
            console.error('TTS generate failed:', err);
            setError(err?.response?.status === 503
                ? 'TTS Server chưa khởi động. Hãy chạy TMix-TTS-Server trước.'
                : 'Tạo audio thất bại. Vui lòng thử lại.');
        } finally {
            setTtsGenerating(false);
        }
    };

    const totalPoints = formData.questions.reduce((sum, q) => sum + (q.points || 1), 0);

    if (loading) {
        return (
            <DashboardLayout>
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <Box sx={commonStyles.pageContainer}>
                {/* Header */}
                <Box sx={{ ...commonStyles.pageHeader, flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton onClick={() => navigate('/teacher/tests')}>
                            <BackIcon />
                        </IconButton>
                        <Typography variant="h5" sx={commonStyles.pageTitle}>
                            {isEditing ? '✏️ Chỉnh sửa đề thi' : '📝 Tạo đề thi mới'}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant="outlined"
                            startIcon={<SaveIcon />}
                            onClick={() => handleSave(true)}
                            disabled={saving}
                        >
                            Lưu nháp
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<PublishIcon />}
                            onClick={() => setPublishDialogOpen(true)}
                            disabled={saving}
                            sx={commonStyles.primaryButton}
                        >
                            {saving ? <CircularProgress size={20} /> : 'Đăng đề'}
                        </Button>
                    </Box>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

                {/* Test info form */}
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom fontWeight={600}>
                        Thông tin đề thi
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={8}>
                            <TextField
                                fullWidth
                                label="Tiêu đề đề thi *"
                                placeholder="VD: Kiểm tra giữa kỳ IELTS Foundation"
                                value={formData.title}
                                onChange={(e) => handleFieldChange('title', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
                                <InputLabel>Lớp *</InputLabel>
                                <Select
                                    value={formData.classId}
                                    label="Lớp *"
                                    onChange={(e) => handleFieldChange('classId', e.target.value)}
                                >
                                    {classes.map((cls: any) => (
                                        <MenuItem key={cls.id} value={cls.id}>
                                            {cls.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={2}
                                label="Mô tả (tùy chọn)"
                                placeholder="Mô tả ngắn về nội dung bài kiểm tra..."
                                value={formData.description}
                                onChange={(e) => handleFieldChange('description', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Thời gian (phút)"
                                value={formData.duration}
                                onChange={(e) => handleFieldChange('duration', parseInt(e.target.value) || 0)}
                                inputProps={{ min: 1 }}
                            />
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Điểm đạt (%)"
                                value={formData.passingScore}
                                onChange={(e) => handleFieldChange('passingScore', parseInt(e.target.value) || 0)}
                                inputProps={{ min: 0, max: 100 }}
                            />
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <TextField
                                fullWidth
                                label="Tổng điểm"
                                value={totalPoints}
                                disabled
                                InputProps={{ readOnly: true }}
                            />
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <TextField
                                fullWidth
                                label="Số câu hỏi"
                                value={formData.questions.length}
                                disabled
                                InputProps={{ readOnly: true }}
                            />
                        </Grid>
                    </Grid>
                </Paper>

                {/* Skill Type Selector */}
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom fontWeight={600}>
                        Loại kỹ năng
                    </Typography>
                    <ToggleButtonGroup
                        value={formData.skillType}
                        exclusive
                        onChange={handleSkillTypeChange}
                        sx={{ mb: 2, flexWrap: 'wrap' }}
                    >
                        {(Object.keys(skillLabels) as SkillType[]).map(skill => (
                            <ToggleButton
                                key={skill}
                                value={skill}
                                sx={{
                                    px: 3, py: 1.5, gap: 1,
                                    '&.Mui-selected': {
                                        bgcolor: `${skillLabels[skill].color}15`,
                                        color: skillLabels[skill].color,
                                        borderColor: skillLabels[skill].color,
                                    }
                                }}
                            >
                                {skillLabels[skill].icon}
                                {skillLabels[skill].label}
                            </ToggleButton>
                        ))}
                    </ToggleButtonGroup>
                    <Typography variant="body2" color="text.secondary">
                        {formData.skillType === 'reading' && 'Đọc hiểu: Học viên đọc đoạn văn và trả lời trắc nghiệm'}
                        {formData.skillType === 'listening' && 'Nghe: Học viên nghe audio và trả lời trắc nghiệm'}
                        {formData.skillType === 'writing' && 'Viết: Học viên viết bài tự luận, AI chấm điểm ngữ pháp + từ vựng'}
                        {formData.skillType === 'speaking' && 'Nói: Học viên ghi âm, AI đánh giá phát âm + độ chính xác'}
                    </Typography>

                    {/* Passage for Reading */}
                    {formData.skillType === 'reading' && (
                        <TextField
                            fullWidth multiline rows={4}
                            label="Đoạn văn đọc hiểu (tùy chọn)"
                            placeholder="Dán đoạn văn để học viên đọc và trả lời câu hỏi..."
                            value={formData.passage || ''}
                            onChange={(e) => handleFieldChange('passage', e.target.value)}
                            sx={{ mt: 2 }}
                        />
                    )}

                    {/* Audio for Listening — Upload OR TTS Generate */}
                    {formData.skillType === 'listening' && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                🎧 Nguồn âm thanh bài nghe
                            </Typography>

                            {/* Tab: Upload vs TTS Generate */}
                            <ToggleButtonGroup
                                value={audioMode}
                                exclusive
                                onChange={(_, v) => v && setAudioMode(v)}
                                sx={{ mb: 2 }}
                                size="small"
                            >
                                <ToggleButton value="upload" sx={{ px: 3, gap: 1 }}>
                                    📁 Upload file
                                </ToggleButton>
                                <ToggleButton value="tts" sx={{ px: 3, gap: 1 }}>
                                    🤖 Tạo bằng AI (VITS)
                                </ToggleButton>
                            </ToggleButtonGroup>

                            {/* ── Current audio player ── */}
                            {formData.audioUrl && (
                                <Box sx={{ p: 2, mb: 2, borderRadius: 2, bgcolor: '#f5f3ff', border: '1px solid #ddd6fe' }}>
                                    <audio controls src={formData.audioUrl} style={{ width: '100%', marginBottom: 8 }} />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body2" color="text.secondary">
                                            ✅ Audio sẵn sàng
                                        </Typography>
                                        <Button
                                            size="small" color="error" variant="outlined"
                                            onClick={() => handleFieldChange('audioUrl', '')}
                                        >
                                            Xóa audio
                                        </Button>
                                    </Box>
                                </Box>
                            )}

                            {/* ── Mode: Upload file ── */}
                            {audioMode === 'upload' && !formData.audioUrl && (
                                <Button
                                    variant="outlined"
                                    component="label"
                                    disabled={audioUploading}
                                    startIcon={audioUploading ? <CircularProgress size={18} /> : <ListeningIcon />}
                                    sx={{ borderRadius: 2, borderStyle: 'dashed', py: 2, px: 4, mb: 2 }}
                                >
                                    {audioUploading ? 'Đang tải lên...' : 'Chọn file MP3/WAV'}
                                    <input
                                        type="file"
                                        hidden
                                        accept="audio/*"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            try {
                                                setAudioUploading(true);
                                                const res = await uploadFileAPI(file);
                                                const url = res?.data?.data?.url || res?.data?.url || '';
                                                handleFieldChange('audioUrl', url);
                                                setSuccess('Upload audio thành công!');
                                            } catch (err) {
                                                setError('Upload audio thất bại');
                                            } finally {
                                                setAudioUploading(false);
                                            }
                                        }}
                                    />
                                </Button>
                            )}

                            {/* ── Mode: TTS Generate from Transcript ── */}
                            {audioMode === 'tts' && (
                                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, bgcolor: '#faf5ff', borderColor: '#ddd6fe' }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: '#7c3aed' }}>
                                        🎙️ Tạo audio bằng VITS Neural TTS
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                                        Nhập transcript bài nghe. Hỗ trợ cả dạng plain text và hội thoại [A]: ... [B]: ...
                                    </Typography>

                                    <TextField
                                        fullWidth multiline rows={6}
                                        label="Transcript bài nghe"
                                        placeholder={`Dạng đoạn văn:\nGood morning class. Today we will learn about present perfect tense.\n\nDạng hội thoại:\n[A]: Good morning. Can I help you?\n[B]: Yes, I'd like to book a room please.\n[A]: Sure. For how many nights?\n[C]: Excuse me, is this the reception?`}
                                        value={ttsTranscript}
                                        onChange={(e) => setTtsTranscript(e.target.value)}
                                        sx={{ mb: 2, bgcolor: 'white', borderRadius: 1 }}
                                    />

                                    <Grid container spacing={2} sx={{ mb: 2 }}>
                                        <Grid item xs={6} md={3}>
                                            <TextField
                                                fullWidth size="small" type="number"
                                                label="Tốc độ đọc"
                                                value={ttsSpeed}
                                                onChange={(e) => setTtsSpeed(Math.max(0.5, Math.min(2.0, parseFloat(e.target.value) || 1.0)))}
                                                inputProps={{ min: 0.5, max: 2.0, step: 0.1 }}
                                                helperText="0.5x - 2.0x"
                                            />
                                        </Grid>
                                        <Grid item xs={6} md={3}>
                                            <TextField
                                                fullWidth size="small" type="number"
                                                label="Ngắt nghỉ giữa câu (s)"
                                                value={ttsPause}
                                                onChange={(e) => setTtsPause(Math.max(0.3, Math.min(3.0, parseFloat(e.target.value) || 0.8)))}
                                                inputProps={{ min: 0.3, max: 3.0, step: 0.1 }}
                                                helperText="0.3s - 3.0s"
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                            <Button
                                                variant="outlined"
                                                onClick={handleTtsPreview}
                                                disabled={ttsGenerating || !ttsTranscript.trim()}
                                                startIcon={ttsGenerating ? <CircularProgress size={18} /> : <ListeningIcon />}
                                                sx={{ borderColor: '#7c3aed', color: '#7c3aed', '&:hover': { borderColor: '#6d28d9', bgcolor: '#f5f3ff' } }}
                                            >
                                                {ttsGenerating ? 'Đang tạo...' : ' Nghe thử'}
                                            </Button>
                                            <Button
                                                variant="contained"
                                                onClick={handleTtsGenerate}
                                                disabled={ttsGenerating || !ttsTranscript.trim()}
                                                startIcon={ttsGenerating ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                                                sx={{ bgcolor: '#7c3aed', '&:hover': { bgcolor: '#6d28d9' } }}
                                            >
                                                {ttsGenerating ? 'Đang tạo...' : 'Tạo & lưu audio'}
                                            </Button>
                                        </Grid>
                                    </Grid>

                                    {/* Preview audio player */}
                                    {ttsPreviewUrl && (
                                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#e8f5e9', border: '1px solid #a5d6a7' }}>
                                            <Typography variant="caption" fontWeight={600} color="#2e7d32" sx={{ mb: 0.5, display: 'block' }}>
                                                🔊 Preview Audio
                                            </Typography>
                                            <audio controls src={ttsPreviewUrl} style={{ width: '100%' }} />
                                        </Box>
                                    )}
                                </Paper>
                            )}

                            <TextField
                                fullWidth multiline rows={3}
                                label="Bài nghe script (tùy chọn - dùng để tham khảo)"
                                placeholder="Nhập nội dung bài nghe (transcript)..."
                                value={formData.passage || ''}
                                onChange={(e) => handleFieldChange('passage', e.target.value)}
                                sx={{ mt: 2 }}
                            />
                        </Box>
                    )}
                </Paper>

                {/* ============ QUESTIONS SECTION ============ */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" fontWeight={600}>
                        {formData.skillType === 'writing' ? 'Đề bài viết' : formData.skillType === 'speaking' ? 'Bài nói' : `Câu hỏi (${formData.questions.length})`}
                    </Typography>
                    <Button variant="outlined" startIcon={<AddIcon />} onClick={addQuestion}>
                        + Thêm {formData.skillType === 'writing' ? 'đề viết' : formData.skillType === 'speaking' ? 'bài nói' : 'câu hỏi'}
                    </Button>
                </Box>

                {formData.questions.map((question, qIndex) => (
                    <Card key={question.id || qIndex} sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
                        <CardContent>
                            {/* Question header */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <DragIcon sx={{ color: 'text.disabled' }} />
                                    <Chip
                                        label={`${formData.skillType === 'writing' ? 'Đề' : formData.skillType === 'speaking' ? 'Bài' : 'Câu'} ${qIndex + 1}`}
                                        color="primary"
                                        size="small"
                                    />
                                    <TextField
                                        size="small" type="number" label="Điểm"
                                        value={question.points}
                                        onChange={(e) => handleQuestionChange(qIndex, 'points', parseInt(e.target.value) || 1)}
                                        sx={{ width: 80 }}
                                        inputProps={{ min: 1 }}
                                    />
                                </Box>
                                <Box>
                                    {(formData.skillType === 'reading' || formData.skillType === 'listening') && (
                                        <Tooltip title="Nhân bản">
                                            <IconButton size="small" onClick={() => duplicateQuestion(qIndex)}>
                                                <CopyIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                    <Tooltip title="Xóa">
                                        <IconButton size="small" color="error" onClick={() => removeQuestion(qIndex)}
                                            disabled={formData.questions.length <= 1}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </Box>

                            {/* ========== MC QUESTION (Reading / Listening) ========== */}
                            {(formData.skillType === 'reading' || formData.skillType === 'listening') && (
                                <>
                                    <TextField
                                        fullWidth multiline rows={2}
                                        label={`Nội dung câu hỏi ${qIndex + 1} *`}
                                        placeholder="Nhập câu hỏi..."
                                        value={question.question || ''}
                                        onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                                        sx={{ mb: 2 }}
                                    />
                                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                                        Đáp án (chọn đáp án đúng):
                                    </Typography>
                                    <RadioGroup
                                        value={question.correctAnswer}
                                        onChange={(e) => handleQuestionChange(qIndex, 'correctAnswer', parseInt(e.target.value))}
                                    >
                                        <Grid container spacing={1}>
                                            {(question.options || ['','','','']).map((option: string, optIndex: number) => (
                                                <Grid item xs={12} md={6} key={optIndex}>
                                                    <Box sx={{
                                                        display: 'flex', alignItems: 'center', gap: 1, p: 1,
                                                        borderRadius: 1,
                                                        bgcolor: question.correctAnswer === optIndex ? '#e8f5e9' : 'transparent',
                                                        border: question.correctAnswer === optIndex ? '2px solid #4caf50' : '1px solid #e0e0e0',
                                                    }}>
                                                        <FormControlLabel value={optIndex} control={<Radio size="small" />} label="" sx={{ m: 0, mr: -1 }} />
                                                        <Chip label={String.fromCharCode(65 + optIndex)} size="small"
                                                            variant={question.correctAnswer === optIndex ? 'filled' : 'outlined'}
                                                            color={question.correctAnswer === optIndex ? 'success' : 'default'}
                                                        />
                                                        <TextField fullWidth size="small" variant="standard"
                                                            placeholder={`Đáp án ${String.fromCharCode(65 + optIndex)}`}
                                                            value={option}
                                                            onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                                                        />
                                                    </Box>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </RadioGroup>
                                    <TextField fullWidth size="small"
                                        label="Giải thích (tùy chọn)" placeholder="Giải thích cho đáp án đúng..."
                                        value={question.explanation || ''}
                                        onChange={(e) => handleQuestionChange(qIndex, 'explanation', e.target.value)}
                                        sx={{ mt: 2 }}
                                    />
                                </>
                            )}

                            {/* ========== WRITING QUESTION ========== */}
                            {formData.skillType === 'writing' && (
                                <>
                                    <TextField fullWidth multiline rows={3}
                                        label={`Đề bài viết ${qIndex + 1} *`}
                                        placeholder="VD: Write an essay about the advantages and disadvantages of social media..."
                                        value={question.prompt || ''}
                                        onChange={(e) => handleQuestionChange(qIndex, 'prompt', e.target.value)}
                                        sx={{ mb: 2 }}
                                    />
                                    <Grid container spacing={2} sx={{ mb: 2 }}>
                                        <Grid item xs={6} md={3}>
                                            <TextField fullWidth size="small" type="number" label="Số từ tối thiểu"
                                                value={question.minWords || 100}
                                                onChange={(e) => handleQuestionChange(qIndex, 'minWords', parseInt(e.target.value) || 0)}
                                            />
                                        </Grid>
                                        <Grid item xs={6} md={3}>
                                            <TextField fullWidth size="small" type="number" label="Số từ tối đa"
                                                value={question.maxWords || 500}
                                                onChange={(e) => handleQuestionChange(qIndex, 'maxWords', parseInt(e.target.value) || 0)}
                                            />
                                        </Grid>
                                    </Grid>
                                    <TextField fullWidth multiline rows={2} size="small"
                                        label="Tiêu chí chấm điểm (Rubric cho AI)"
                                        placeholder="VD: Grammar accuracy, Vocabulary range, Coherence..."
                                        value={question.rubric || ''}
                                        onChange={(e) => handleQuestionChange(qIndex, 'rubric', e.target.value)}
                                        sx={{ mb: 2 }}
                                    />
                                    <TextField fullWidth multiline rows={3} size="small"
                                        label="Bài mẫu (tùy chọn — tham khảo)"
                                        placeholder="Bài viết mẫu để giáo viên tham khảo..."
                                        value={question.sampleAnswer || ''}
                                        onChange={(e) => handleQuestionChange(qIndex, 'sampleAnswer', e.target.value)}
                                    />
                                </>
                            )}

                            {/* ========== SPEAKING QUESTION ========== */}
                            {formData.skillType === 'speaking' && (
                                <>
                                    <TextField fullWidth multiline rows={2}
                                        label={`Yêu cầu nói ${qIndex + 1} *`}
                                        placeholder="VD: Read the following passage aloud..."
                                        value={question.prompt || ''}
                                        onChange={(e) => handleQuestionChange(qIndex, 'prompt', e.target.value)}
                                        sx={{ mb: 2 }}
                                    />
                                    <TextField fullWidth multiline rows={3}
                                        label="Văn bản tham chiếu (reference text) *"
                                        placeholder="Đoạn văn mà học viên cần đọc/nói — AI sẽ so sánh với kết quả ghi âm"
                                        value={question.referenceText || ''}
                                        onChange={(e) => handleQuestionChange(qIndex, 'referenceText', e.target.value)}
                                        sx={{ mb: 2 }}
                                    />
                                    <TextField fullWidth size="small" type="number"
                                        label="Thời gian ghi âm tối đa (giây)"
                                        value={question.duration || 60}
                                        onChange={(e) => handleQuestionChange(qIndex, 'duration', parseInt(e.target.value) || 60)}
                                        sx={{ width: 250 }}
                                    />
                                </>
                            )}
                        </CardContent>
                    </Card>
                ))}

                {/* Add more button at bottom */}
                <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Button variant="outlined" startIcon={<AddIcon />} onClick={addQuestion} size="large">
                        + Thêm {formData.skillType === 'writing' ? 'đề viết' : formData.skillType === 'speaking' ? 'bài nói' : 'câu hỏi mới'}
                    </Button>
                </Box>

                {/* Publish confirmation dialog */}
                <Dialog open={publishDialogOpen} onClose={() => setPublishDialogOpen(false)}>
                    <DialogTitle>Xác nhận đăng đề</DialogTitle>
                    <DialogContent>
                        <Typography gutterBottom>
                            Bạn có chắc muốn đăng đề thi này? Học sinh trong lớp sẽ có thể thấy và làm bài ngay.
                        </Typography>
                        <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                            <Typography variant="body2"><strong>Tiêu đề:</strong> {formData.title}</Typography>
                            <Typography variant="body2"><strong>Số câu:</strong> {formData.questions.length}</Typography>
                            <Typography variant="body2"><strong>Thời gian:</strong> {formData.duration} phút</Typography>
                            <Typography variant="body2"><strong>Tổng điểm:</strong> {totalPoints}</Typography>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setPublishDialogOpen(false)}>Hủy</Button>
                        <Button variant="contained" color="success" onClick={handlePublishAndSave}>
                            Đăng đề
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </DashboardLayout>
    );
};

export default CreateEditTest;
