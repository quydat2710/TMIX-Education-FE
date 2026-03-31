import React, { useState, useRef, useEffect } from 'react';
import {
    Box, Typography, TextField, IconButton, Paper, Avatar,
    CircularProgress, Chip,
} from '@mui/material';
import {
    Send as SendIcon,
    Person as PersonIcon,
    FiberManualRecord as DotIcon,
} from '@mui/icons-material';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { COLORS } from '../../utils/colors';
import axiosInstance from '../../utils/axios.customize';
import AiSparkleIcon from '../../components/icons/AiSparkleIcon';

// ─── Keyframes injected once ───
const KEYFRAMES_STYLE = `
@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 0 16px rgba(124,58,237,0.4), 0 0 32px rgba(124,58,237,0.15); }
  50% { box-shadow: 0 0 24px rgba(124,58,237,0.6), 0 0 48px rgba(124,58,237,0.25); }
}
@keyframes sendBtnGlow {
  0%, 100% { box-shadow: 0 4px 14px rgba(124,58,237,0.40); }
  50% { box-shadow: 0 4px 24px rgba(124,58,237,0.65), 0 0 8px rgba(124,58,237,0.3); }
}
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
`;

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

const ChatbotPage: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            role: 'assistant',
            content: 'Xin chào! 👋 Mình là trợ lý AI của TMix Education. Mình có thể giúp bạn:\n\n• 📖 Giải thích ngữ pháp tiếng Anh\n• 📝 Sửa lỗi câu, bài viết\n• 🗣️ Luyện hội thoại\n• 🔄 Dịch Anh ↔ Việt\n• 💡 Mẹo thi IELTS, TOEIC\n\nHãy hỏi mình bất cứ điều gì về tiếng Anh nhé! 😊',
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async () => {
        const text = input.trim();
        if (!text || loading) return;

        const userMsg: ChatMessage = { role: 'user', content: text, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const history = messages
                .filter(m => m.role === 'user' || m.role === 'assistant')
                .map(m => ({ role: m.role, content: m.content }));

            const res = await axiosInstance.post('/chatbot/send', {
                message: text,
                history: history.slice(-20),
            });

            if (res.data?.data?.reply) {
                setMessages(prev => [
                    ...prev,
                    { role: 'assistant', content: res.data.data.reply, timestamp: new Date() },
                ]);
            } else if (res.data?.reply) {
                setMessages(prev => [
                    ...prev,
                    { role: 'assistant', content: res.data.reply, timestamp: new Date() },
                ]);
            } else {
                setMessages(prev => [
                    ...prev,
                    { role: 'assistant', content: '❌ Xin lỗi, mình chưa thể trả lời lúc này. Hãy thử lại nhé!', timestamp: new Date() },
                ]);
            }
        } catch (err) {
            setMessages(prev => [
                ...prev,
                { role: 'assistant', content: '❌ Lỗi kết nối. Vui lòng thử lại sau.', timestamp: new Date() },
            ]);
        } finally {
            setLoading(false);
            inputRef.current?.focus();
        }
    };

    const quickPrompts = [
        '📖 Giải thích Present Perfect',
        '🔄 Dịch: "Tôi rất vui được gặp bạn"',
        '✍️ Sửa lỗi: I have went to school yesterday',
        '💡 Mẹo luyện Speaking IELTS',
    ];

    const hasInput = input.trim().length > 0;

    return (
        <DashboardLayout>
            {/* Inject keyframes */}
            <style>{KEYFRAMES_STYLE}</style>

            <Box sx={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}>

                {/* ═══════ Header Banner — Glassmorphism 3D ═══════ */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 2.5, mb: 2,
                        borderRadius: 4,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #a855f7 100%)',
                        color: 'white',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 8px 32px rgba(118,75,162,0.35), 0 2px 8px rgba(102,126,234,0.20)',
                        // shimmer overlay
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0, left: 0, right: 0, bottom: 0,
                            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)',
                            backgroundSize: '200% 100%',
                            animation: 'shimmer 4s ease-in-out infinite',
                            pointerEvents: 'none',
                        },
                        // glass inner glow
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(255,255,255,0.06)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: 'inherit',
                            pointerEvents: 'none',
                        },
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar
                                sx={{
                                    width: 50, height: 50,
                                    bgcolor: 'rgba(255,255,255,0.18)',
                                    backdropFilter: 'blur(8px)',
                                    border: '2px solid rgba(255,255,255,0.25)',
                                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                                    animation: 'float 3s ease-in-out infinite',
                                }}
                            >
                                <AiSparkleIcon size={28} />
                            </Avatar>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.02em', textShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                                    TMix AI Assistant
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.92, fontWeight: 500 }}>
                                    Hỗ trợ Tiếng Anh & Tiếng Việt
                                </Typography>
                            </Box>
                        </Box>
                        {/* ─── Status badge ─── */}
                        <Box sx={{
                            display: 'flex', alignItems: 'center', gap: 0.7,
                            bgcolor: 'rgba(255,255,255,0.15)',
                            backdropFilter: 'blur(8px)',
                            borderRadius: '20px',
                            px: 1.5, py: 0.5,
                            border: '1px solid rgba(255,255,255,0.2)',
                        }}>
                            <DotIcon sx={{
                                fontSize: 12,
                                color: '#4ade80',
                                filter: 'drop-shadow(0 0 4px rgba(74,222,128,0.6))',
                                animation: 'pulseGlow 2s ease-in-out infinite',
                            }} />
                            <Typography variant="caption" sx={{ color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>
                                Đang hoạt động
                            </Typography>
                        </Box>
                    </Box>
                </Paper>

                {/* ═══════ Messages Area ═══════ */}
                <Paper sx={{
                    flex: 1, p: 2, mb: 2, borderRadius: 4, overflow: 'auto',
                    bgcolor: '#f8fafc',
                    boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.03)',
                }}>
                    {messages.map((msg, i) => (
                        <Box
                            key={i}
                            sx={{
                                display: 'flex',
                                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                mb: 2.5,
                            }}
                        >
                            <Box sx={{
                                display: 'flex',
                                gap: 1.5, maxWidth: '80%',
                                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                            }}>
                                {/* ─── Avatar with glow ─── */}
                                <Avatar
                                    sx={{
                                        width: 38, height: 38,
                                        bgcolor: msg.role === 'user' ? COLORS.primary.main : '#7c3aed',
                                        boxShadow: msg.role === 'user'
                                            ? '0 4px 14px rgba(211,47,47,0.30)'
                                            : '0 0 16px rgba(124,58,237,0.45), 0 0 32px rgba(124,58,237,0.15)',
                                        border: msg.role === 'user'
                                            ? '2px solid rgba(211,47,47,0.2)'
                                            : '2px solid rgba(124,58,237,0.25)',
                                        animation: msg.role === 'assistant' ? 'pulseGlow 3s ease-in-out infinite' : 'none',
                                        transition: 'all 0.3s ease',
                                    }}
                                >
                                    {msg.role === 'user' ? <PersonIcon fontSize="small" /> : <AiSparkleIcon size={20} />}
                                </Avatar>

                                {/* ─── Chat Bubble with drop-shadow ─── */}
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 2, borderRadius: 3,
                                        bgcolor: msg.role === 'user' ? COLORS.primary.main : 'white',
                                        color: msg.role === 'user' ? 'white' : 'text.primary',
                                        boxShadow: msg.role === 'user'
                                            ? '0 4px 18px rgba(211,47,47,0.18), 0 2px 6px rgba(0,0,0,0.05)'
                                            : '0 4px 18px rgba(124,58,237,0.10), 0 2px 6px rgba(0,0,0,0.04)',
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word',
                                        lineHeight: 1.7,
                                        transition: 'box-shadow 0.3s ease, transform 0.3s ease',
                                        '&:hover': {
                                            boxShadow: msg.role === 'user'
                                                ? '0 6px 24px rgba(211,47,47,0.25), 0 3px 10px rgba(0,0,0,0.08)'
                                                : '0 6px 24px rgba(124,58,237,0.16), 0 3px 10px rgba(0,0,0,0.06)',
                                            transform: 'translateY(-1px)',
                                        },
                                    }}
                                >
                                    <Typography variant="body1">{msg.content}</Typography>
                                    <Typography variant="caption" sx={{
                                        display: 'block', mt: 0.5, textAlign: 'right',
                                        opacity: 0.5, fontSize: '0.7rem',
                                    }}>
                                        {msg.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                    </Typography>
                                </Paper>
                            </Box>
                        </Box>
                    ))}

                    {loading && (
                        <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                            <Avatar sx={{
                                width: 38, height: 38, bgcolor: '#7c3aed',
                                boxShadow: '0 0 16px rgba(124,58,237,0.45)',
                                animation: 'pulseGlow 2s ease-in-out infinite',
                            }}>
                                <AiSparkleIcon size={20} />
                            </Avatar>
                            <Paper elevation={0} sx={{
                                p: 2, borderRadius: 3, bgcolor: 'white',
                                display: 'flex', alignItems: 'center', gap: 1,
                                boxShadow: '0 4px 18px rgba(124,58,237,0.10), 0 2px 6px rgba(0,0,0,0.04)',
                            }}>
                                <CircularProgress size={16} sx={{ color: '#7c3aed' }} />
                                <Typography variant="body2" color="text.secondary">Đang suy nghĩ...</Typography>
                            </Paper>
                        </Box>
                    )}

                    <div ref={messagesEndRef} />
                </Paper>

                {/* ═══════ Quick Prompts — 3D Pill Chips ═══════ */}
                {messages.length <= 1 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                        {quickPrompts.map((prompt, i) => (
                            <Chip
                                key={i}
                                label={prompt}
                                onClick={() => { setInput(prompt); inputRef.current?.focus(); }}
                                sx={{
                                    cursor: 'pointer',
                                    borderRadius: '24px',
                                    fontWeight: 600,
                                    fontSize: '0.82rem',
                                    px: 1,
                                    py: 2.5,
                                    background: 'linear-gradient(145deg, #f8f9ff, #eef0ff)',
                                    border: '1px solid rgba(124,58,237,0.12)',
                                    boxShadow: '3px 3px 8px rgba(0,0,0,0.06), -2px -2px 6px rgba(255,255,255,0.9)',
                                    color: '#4c1d95',
                                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': {
                                        background: 'linear-gradient(145deg, #eef0ff, #e0e4ff)',
                                        boxShadow: '4px 4px 12px rgba(0,0,0,0.09), -3px -3px 8px rgba(255,255,255,0.95)',
                                        transform: 'translateY(-2px)',
                                        borderColor: 'rgba(124,58,237,0.25)',
                                    },
                                    '&:active': {
                                        transform: 'scale(0.96)',
                                        boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.06), inset -1px -1px 3px rgba(255,255,255,0.7)',
                                    },
                                }}
                            />
                        ))}
                    </Box>
                )}

                {/* ═══════ Chat Input — Floating 3D ═══════ */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 1.5, borderRadius: 4,
                        display: 'flex', alignItems: 'center', gap: 1,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
                        border: '1px solid rgba(0,0,0,0.04)',
                        transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
                        ...(hasInput && {
                            boxShadow: '0 8px 32px rgba(124,58,237,0.12), 0 2px 8px rgba(124,58,237,0.06)',
                            borderColor: 'rgba(124,58,237,0.15)',
                        }),
                    }}
                >
                    <TextField
                        inputRef={inputRef}
                        fullWidth
                        variant="outlined"
                        placeholder="Nhập câu hỏi tiếng Anh..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                        disabled={loading}
                        multiline
                        maxRows={3}
                        size="small"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 3,
                                bgcolor: '#f8fafc',
                                boxShadow: 'inset 2px 2px 6px rgba(0,0,0,0.04), inset -2px -2px 6px rgba(255,255,255,0.8)',
                                transition: 'all 0.3s ease',
                                '& fieldset': { borderColor: 'transparent' },
                                '&:hover fieldset': { borderColor: 'rgba(124,58,237,0.2)' },
                                '&.Mui-focused fieldset': { borderColor: 'rgba(124,58,237,0.4)', borderWidth: '1.5px' },
                                '&.Mui-focused': {
                                    bgcolor: '#fff',
                                    boxShadow: 'inset 1px 1px 4px rgba(0,0,0,0.03)',
                                },
                            },
                        }}
                    />
                    <IconButton
                        onClick={sendMessage}
                        disabled={!input.trim() || loading}
                        sx={{
                            width: 46, height: 46,
                            borderRadius: '50%',
                            bgcolor: '#7c3aed',
                            color: 'white',
                            boxShadow: hasInput
                                ? '0 4px 14px rgba(124,58,237,0.40)'
                                : '0 2px 8px rgba(0,0,0,0.08)',
                            animation: hasInput ? 'sendBtnGlow 2s ease-in-out infinite' : 'none',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            transform: hasInput ? 'scale(1.05)' : 'scale(1)',
                            '&:hover': {
                                bgcolor: '#6d28d9',
                                transform: 'translateY(-2px) scale(1.08)',
                                boxShadow: '0 6px 20px rgba(124,58,237,0.50)',
                            },
                            '&:active': {
                                transform: 'translateY(0px) scale(0.97)',
                                boxShadow: '0 2px 8px rgba(124,58,237,0.30)',
                            },
                            '&:disabled': {
                                bgcolor: '#e2e8f0',
                                boxShadow: 'none',
                                animation: 'none',
                                transform: 'scale(1)',
                            },
                        }}
                    >
                        <SendIcon />
                    </IconButton>
                </Paper>
            </Box>
        </DashboardLayout>
    );
};

export default ChatbotPage;
