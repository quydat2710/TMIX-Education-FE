import React, { useState, useRef, useEffect } from 'react';
import {
    Box, Typography, TextField, IconButton, Paper, Avatar,
    CircularProgress, Chip,
} from '@mui/material';
import {
    Send as SendIcon,
    SmartToy as BotIcon,
    Person as PersonIcon,
    AutoAwesome as SparkleIcon,
} from '@mui/icons-material';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { COLORS } from '../../utils/colors';
import axiosInstance from '../../utils/axios.customize';

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

    return (
        <DashboardLayout>
            <Box sx={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <Paper sx={{
                    p: 2, mb: 2, borderRadius: 3,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 44, height: 44 }}>
                            <SparkleIcon />
                        </Avatar>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                TMix AI Assistant
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                Powered by Llama 3.3 • Hỗ trợ Tiếng Anh & Tiếng Việt
                            </Typography>
                        </Box>
                    </Box>
                </Paper>

                {/* Messages */}
                <Paper sx={{
                    flex: 1, p: 2, mb: 2, borderRadius: 3, overflow: 'auto',
                    bgcolor: '#f8fafc',
                }}>
                    {messages.map((msg, i) => (
                        <Box
                            key={i}
                            sx={{
                                display: 'flex',
                                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                mb: 2,
                            }}
                        >
                            <Box sx={{
                                display: 'flex',
                                gap: 1, maxWidth: '80%',
                                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                            }}>
                                <Avatar
                                    sx={{
                                        width: 36, height: 36,
                                        bgcolor: msg.role === 'user' ? COLORS.primary.main : '#7c3aed',
                                    }}
                                >
                                    {msg.role === 'user' ? <PersonIcon fontSize="small" /> : <BotIcon fontSize="small" />}
                                </Avatar>
                                <Paper
                                    sx={{
                                        p: 2, borderRadius: 2.5,
                                        bgcolor: msg.role === 'user' ? COLORS.primary.main : 'white',
                                        color: msg.role === 'user' ? 'white' : 'text.primary',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word',
                                        lineHeight: 1.7,
                                    }}
                                >
                                    <Typography variant="body1">{msg.content}</Typography>
                                    <Typography variant="caption" sx={{
                                        display: 'block', mt: 0.5, textAlign: 'right',
                                        opacity: 0.6, fontSize: '0.7rem',
                                    }}>
                                        {msg.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                    </Typography>
                                </Paper>
                            </Box>
                        </Box>
                    ))}

                    {loading && (
                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                            <Avatar sx={{ width: 36, height: 36, bgcolor: '#7c3aed' }}>
                                <BotIcon fontSize="small" />
                            </Avatar>
                            <Paper sx={{ p: 2, borderRadius: 2.5, bgcolor: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CircularProgress size={16} sx={{ color: '#7c3aed' }} />
                                <Typography variant="body2" color="text.secondary">Đang suy nghĩ...</Typography>
                            </Paper>
                        </Box>
                    )}

                    <div ref={messagesEndRef} />
                </Paper>

                {/* Quick prompts (only show when few messages) */}
                {messages.length <= 1 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                        {quickPrompts.map((prompt, i) => (
                            <Chip
                                key={i}
                                label={prompt}
                                variant="outlined"
                                onClick={() => { setInput(prompt); inputRef.current?.focus(); }}
                                sx={{
                                    cursor: 'pointer',
                                    '&:hover': { bgcolor: '#f0f0ff', borderColor: '#7c3aed' },
                                }}
                            />
                        ))}
                    </Box>
                )}

                {/* Input */}
                <Paper sx={{
                    p: 1.5, borderRadius: 3,
                    display: 'flex', alignItems: 'center', gap: 1,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                }}>
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
                                borderRadius: 2,
                                '& fieldset': { borderColor: '#e2e8f0' },
                            },
                        }}
                    />
                    <IconButton
                        onClick={sendMessage}
                        disabled={!input.trim() || loading}
                        sx={{
                            bgcolor: '#7c3aed',
                            color: 'white',
                            '&:hover': { bgcolor: '#6d28d9' },
                            '&:disabled': { bgcolor: '#e2e8f0' },
                            width: 44, height: 44,
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
