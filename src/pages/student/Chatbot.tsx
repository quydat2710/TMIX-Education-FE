import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Box, Typography, TextField, IconButton, Paper, Avatar,
    CircularProgress, Chip, Tooltip,
} from '@mui/material';
import {
    Send as SendIcon,
    Person as PersonIcon,
    FiberManualRecord as DotIcon,
    VolumeUp as VolumeUpIcon,
    StopCircle as StopIcon,
    RecordVoiceOver as AutoReadIcon,
    ChatBubbleOutline as GeneralIcon,
    MenuBook as GrammarIcon,
    EditNote as CorrectIcon,
    Quiz as QuizIcon,
    Forum as ConversationIcon,
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { COLORS } from '../../utils/colors';
import axiosInstance from '../../utils/axios.customize';
import AiSparkleIcon from '../../components/icons/AiSparkleIcon';
import { useAuth } from '../../contexts/AuthContext';

// ─── Keyframes tối giản cho Light Mode ───
const KEYFRAMES_STYLE = `
@keyframes pulseActiveLight {
  0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
  50% { opacity: 0.8; transform: scale(0.95); box-shadow: 0 0 0 4px rgba(16, 185, 129, 0); }
}
`;

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

type ChatMode = 'general' | 'grammar' | 'correct' | 'quiz' | 'conversation';

interface ChatModeConfig {
    key: ChatMode;
    label: string;
    icon: React.ReactNode;
    desc: string;
    color: string;
    quickPrompts: string[];
    welcomeMessage: string;
}

// ─── Markdown Renderer for AI messages ───
const MarkdownBubble: React.FC<{ content: string; isUser?: boolean }> = ({ content, isUser }) => {
    if (isUser) {
        return <Typography variant="body2" sx={{ fontSize: '0.95rem' }}>{content}</Typography>;
    }
    return (
        <Box sx={{
            '& p': { m: 0, mb: 1, '&:last-child': { mb: 0 } },
            '& h1, & h2, & h3': { mt: 1.5, mb: 0.5, fontWeight: 700, color: '#0f172a', lineHeight: 1.3 },
            '& h1': { fontSize: '1.1rem' }, '& h2': { fontSize: '1.05rem' }, '& h3': { fontSize: '1rem' },
            '& strong': { fontWeight: 700, color: '#1e293b' },
            '& em': { fontStyle: 'italic', color: '#475569' },
            '& ul, & ol': { pl: 2.5, my: 0.5 },
            '& li': { mb: 0.3, fontSize: '0.95rem', lineHeight: 1.6, '&::marker': { color: '#7c3aed' } },
            '& code': {
                bgcolor: '#f1f5f9', color: '#7c3aed', px: 0.8, py: 0.2,
                borderRadius: '4px', fontSize: '0.88rem', fontFamily: '"Fira Code", monospace',
            },
            '& pre': {
                bgcolor: '#1e293b', color: '#e2e8f0', p: 2, borderRadius: 2,
                overflow: 'auto', my: 1, '& code': { bgcolor: 'transparent', color: 'inherit', p: 0 },
            },
            '& table': {
                width: '100%', borderCollapse: 'collapse', my: 1, fontSize: '0.9rem',
                '& th': { bgcolor: '#f1f5f9', fontWeight: 700, p: 1, border: '1px solid #e2e8f0', textAlign: 'left' },
                '& td': { p: 1, border: '1px solid #e2e8f0' },
                '& tr:hover td': { bgcolor: '#f8fafc' },
            },
            '& blockquote': {
                borderLeft: '3px solid #7c3aed', bgcolor: '#f5f3ff', pl: 2, py: 0.5, my: 1,
                borderRadius: '0 8px 8px 0', '& p': { m: 0 },
            },
            '& hr': { border: 'none', borderTop: '1px solid #e2e8f0', my: 1.5 },
            '& a': { color: '#7c3aed', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } },
            fontSize: '0.95rem', lineHeight: 1.6,
        }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </Box>
    );
};

const CHAT_MODES: ChatModeConfig[] = [
    {
        key: 'general',
        label: 'Tổng quát',
        icon: <GeneralIcon sx={{ fontSize: 18 }} />,
        desc: 'Hỏi đáp tự do về tiếng Anh',
        color: '#6366f1',
        quickPrompts: [
            '📖 Giải thích Present Perfect',
            '🔄 Dịch: "Tôi rất vui được gặp bạn"',
            '✍️ Sửa lỗi: I have went to school yesterday',
            '💡 Mẹo luyện Speaking IELTS',
        ],
        welcomeMessage: 'Xin chào! Mình là **TMix AI Tutor**. Mình có thể giúp bạn:\n\n- Giải thích ngữ pháp tiếng Anh\n- Sửa lỗi câu, bài viết\n- Luyện hội thoại\n- Dịch Anh ↔ Việt\n- Mẹo thi IELTS, TOEIC\n\nChọn chế độ phía trên hoặc hỏi mình bất cứ điều gì!',
    },
    {
        key: 'grammar',
        label: 'Ngữ pháp',
        icon: <GrammarIcon sx={{ fontSize: 18 }} />,
        desc: 'Giải thích grammar chi tiết',
        color: '#0ea5e9',
        quickPrompts: [
            '📖 Present Perfect vs Past Simple',
            '📖 Cách dùng Since và For',
            '📖 Câu điều kiện loại 2',
            '📖 Passive Voice',
        ],
        welcomeMessage: '**Chế độ Ngữ pháp**\n\nMình sẽ giải thích grammar chi tiết với:\n\n- Quy tắc rõ ràng\n- Công thức + cấu trúc\n- Ví dụ đúng/sai\n- Mẹo ghi nhớ\n- Bài tập nhanh\n\nHỏi mình về bất kỳ điểm ngữ pháp nào nhé!',
    },
    {
        key: 'correct',
        label: 'Sửa bài',
        icon: <CorrectIcon sx={{ fontSize: 18 }} />,
        desc: 'Sửa lỗi câu & bài viết',
        color: '#f59e0b',
        quickPrompts: [
            '✍️ I have went to school yesterday',
            '✍️ She don\'t like coffee very much',
            '✍️ He is more taller than me',
            '✍️ Kiểm tra email tiếng Anh của tôi',
        ],
        welcomeMessage: '**Chế độ Sửa bài**\n\nGửi cho mình bất kỳ câu hoặc đoạn văn nào, mình sẽ:\n\n- Sửa lỗi chi tiết\n- Phân tích từng lỗi (bảng)\n- Chấm điểm /10\n- Gợi ý cải thiện\n\nPaste câu hoặc bài viết vào đây nhé!',
    },
    {
        key: 'quiz',
        label: 'Quiz',
        icon: <QuizIcon sx={{ fontSize: 18 }} />,
        desc: 'Luyện tập với câu hỏi',
        color: '#10b981',
        quickPrompts: [
            '🧠 Quiz về thì hiện tại hoàn thành',
            '🧠 5 câu hỏi về từ vựng IELTS',
            '🧠 Bài tập điền từ về giới từ',
            '🧠 Quiz phrasal verbs thông dụng',
        ],
        welcomeMessage: '**Chế độ Quiz**\n\nMình sẽ tạo bài tập tương tác cho bạn:\n\n- Điền từ vào chỗ trống\n- Chọn đáp án đúng\n- Tìm lỗi sai\n- Dịch câu\n\nBạn muốn luyện chủ đề gì? Nói mình biết nhé!',
    },
    {
        key: 'conversation',
        label: 'Hội thoại',
        icon: <ConversationIcon sx={{ fontSize: 18 }} />,
        desc: 'Luyện nói tiếng Anh',
        color: '#ec4899',
        quickPrompts: [
            '🗣️ Practice ordering at a restaurant',
            '🗣️ Luyện phỏng vấn xin việc bằng tiếng Anh',
            '🗣️ Let\'s talk about travel',
            '🗣️ Practice a phone call in English',
        ],
        welcomeMessage: '**Chế độ Hội thoại**\n\nMình sẽ role-play cùng bạn trong các tình huống thực tế:\n\n- Nhà hàng, quán cafe\n- Phỏng vấn xin việc\n- Du lịch, sân bay\n- Gọi điện thoại\n\nChọn tình huống hoặc gợi ý một scenario nhé!',
    },
];

/** Strip markdown & special characters for clean TTS reading */
const stripMarkdown = (text: string): string => {
    return text
        // Markdown syntax
        .replace(/#{1,6}\s?/g, '')           // Headers
        .replace(/\*\*(.+?)\*\*/g, '$1')      // Bold
        .replace(/\*(.+?)\*/g, '$1')          // Italic
        .replace(/`{1,3}[^`]*`{1,3}/g, '')   // Code blocks
        .replace(/\[(.+?)\]\(.+?\)/g, '$1')   // Links
        .replace(/^[-*+]\s/gm, '')            // List markers
        .replace(/^\d+\.\s/gm, '')            // Numbered lists
        .replace(/\|/g, ',')                  // Table pipes → comma pause
        .replace(/^---+$/gm, '')              // Horizontal rules
        .replace(/>/g, '')                    // Blockquotes
        // Quiz & special characters
        .replace(/_{2,}/g, ' chỗ trống ')     // ____ → "chỗ trống"
        .replace(/\(([^)]*)\)/g, ', $1,')     // (text) → pause, text, pause
        .replace(/✅/g, ' đúng ')              // ✅ → "đúng"
        .replace(/❌/g, ' sai ')               // ❌ → "sai"
        .replace(/⭐/g, '')                    // Remove decorative emoji
        .replace(/[📖📝📌📐🎯💡🔤🔍🔄🗣️✍️🧠📋📊🍽️💼✈️📞]/gu, '') // Remove emoji icons
        .replace(/→|➜|➡/g, ', ')              // Arrows → pause
        // Whitespace cleanup
        .replace(/\n{2,}/g, '. ')             // Multiple newlines → pause
        .replace(/\n/g, '. ')                 // Single newlines → pause
        .replace(/\s{2,}/g, ' ')              // Multiple spaces
        .replace(/\.{2,}/g, '.')              // Multiple dots
        .trim();
};

/** Browser-native TTS button with Vietnamese voice support */
const ChatTTSButton: React.FC<{ text: string }> = ({ text }) => {
    const [isSpeaking, setIsSpeaking] = useState(false);

    const handleSpeak = useCallback(() => {
        const synth = window.speechSynthesis;

        if (isSpeaking) {
            synth.cancel();
            setIsSpeaking(false);
            return;
        }

        const cleanText = stripMarkdown(text);
        const utterance = new SpeechSynthesisUtterance(cleanText);

        // Try to find a Vietnamese voice
        const voices = synth.getVoices();
        const viVoice = voices.find(v => v.lang.startsWith('vi')) ||
                        voices.find(v => v.name.toLowerCase().includes('viet'));

        if (viVoice) {
            utterance.voice = viVoice;
            utterance.lang = 'vi-VN';
        } else {
            utterance.lang = 'vi-VN'; // Fallback: let browser pick
        }

        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        setIsSpeaking(true);
        synth.speak(utterance);
    }, [text, isSpeaking]);

    // Cleanup on unmount
    useEffect(() => {
        return () => { window.speechSynthesis.cancel(); };
    }, []);

    return (
        <IconButton
            size="small"
            onClick={handleSpeak}
            sx={{
                color: isSpeaking ? COLORS.primary.main : '#94a3b8',
                '&:hover': { color: COLORS.primary.main, bgcolor: 'rgba(124,58,237,0.08)' },
                p: 0.5,
                transition: 'all 0.2s',
            }}
            title={isSpeaking ? 'Dừng đọc' : 'Nghe phản hồi'}
        >
            {isSpeaking ? (
                <StopIcon sx={{ fontSize: 18 }} />
            ) : (
                <VolumeUpIcon sx={{ fontSize: 18 }} />
            )}
        </IconButton>
    );
};

const STORAGE_KEY = 'chatbot_history';
const STORAGE_MODE_KEY = 'chatbot_mode';
const MAX_STORED_MESSAGES = 50;

const ChatbotPage: React.FC = () => {
    const { user } = useAuth();
    const userId = user?.id || user?.email || 'guest';

    const [activeMode, setActiveMode] = useState<ChatMode>(() => {
        try { return (localStorage.getItem(`${STORAGE_MODE_KEY}_${userId}`) || 'general') as ChatMode; } 
        catch { return 'general'; }
    });
    const activeModeConfig = CHAT_MODES.find(m => m.key === activeMode) || CHAT_MODES[0];

    const [messages, setMessages] = useState<ChatMessage[]>(() => {
        try {
            const savedMode = (localStorage.getItem(`${STORAGE_MODE_KEY}_${userId}`) || 'general') as ChatMode;
            const saved = localStorage.getItem(`${STORAGE_KEY}_${userId}_${savedMode}`);
            if (saved) {
                const parsed = JSON.parse(saved);
                return parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
            }
        } catch { }
        const modeConfig = CHAT_MODES.find(m => m.key === activeMode) || CHAT_MODES[0];
        return [{ role: 'assistant', content: modeConfig.welcomeMessage, timestamp: new Date() }];
    });
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [autoRead, setAutoRead] = useState(() => {
        try { return localStorage.getItem('chatbot_autoread') === 'true'; } catch { return false; }
    });
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const prevMsgCountRef = useRef(messages.length);

    // Preload browser voices
    useEffect(() => {
        window.speechSynthesis.getVoices();
    }, []);

    // Save messages to localStorage whenever they change
    useEffect(() => {
        try {
            const toSave = messages.slice(-MAX_STORED_MESSAGES);
            localStorage.setItem(`${STORAGE_KEY}_${userId}_${activeMode}`, JSON.stringify(toSave));
            localStorage.setItem(`${STORAGE_MODE_KEY}_${userId}`, activeMode);
        } catch { }
    }, [messages, activeMode, userId]);

    useEffect(() => {
        try { localStorage.setItem('chatbot_autoread', String(autoRead)); } catch { }
    }, [autoRead]);

    // Auto-read new AI messages using browser TTS
    useEffect(() => {
        if (!autoRead) return;
        if (messages.length > prevMsgCountRef.current) {
            const lastMsg = messages[messages.length - 1];
            if (lastMsg.role === 'assistant' && !lastMsg.content.startsWith('❌')) {
                const cleanText = stripMarkdown(lastMsg.content);
                const utterance = new SpeechSynthesisUtterance(cleanText);
                const voices = window.speechSynthesis.getVoices();
                const viVoice = voices.find(v => v.lang.startsWith('vi'));
                if (viVoice) { utterance.voice = viVoice; }
                utterance.lang = 'vi-VN';
                utterance.rate = 1.0;
                setTimeout(() => window.speechSynthesis.speak(utterance), 300);
            }
        }
        prevMsgCountRef.current = messages.length;
    }, [messages, autoRead]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Switch mode → load saved history or start fresh
    const handleModeChange = (mode: ChatMode) => {
        if (mode === activeMode) return;
        setActiveMode(mode);

        // Try to load saved history for the new mode
        try {
            const saved = localStorage.getItem(`${STORAGE_KEY}_${userId}_${mode}`);
            if (saved) {
                const parsed = JSON.parse(saved);
                setMessages(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
                return;
            }
        } catch { }

        // No saved history → start with welcome message
        const modeConfig = CHAT_MODES.find(m => m.key === mode)!;
        setMessages([{
            role: 'assistant',
            content: modeConfig.welcomeMessage,
            timestamp: new Date(),
        }]);
    };

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
                mode: activeMode,
                history: history.slice(-20),
            });

            if (res.data?.data?.reply || res.data?.reply) {
                setMessages(prev => [
                    ...prev,
                    { role: 'assistant', content: res.data?.data?.reply || res.data.reply, timestamp: new Date() },
                ]);
            } else {
                throw new Error('No reply');
            }
        } catch (err) {
            setMessages(prev => [
                ...prev,
                { role: 'assistant', content: '❌ Xin lỗi, kết nối bị gián đoạn. Hãy thử lại nhé!', timestamp: new Date() },
            ]);
        } finally {
            setLoading(false);
            inputRef.current?.focus();
        }
    };

    const hasInput = input.trim().length > 0;

    return (
        <DashboardLayout>
            <style>{KEYFRAMES_STYLE}</style>

            {/* Main Container - Clean Light Mode */}
            <Box sx={{
                height: 'calc(100vh - 120px)',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: '#f8fafc',
                borderRadius: 4,
                overflow: 'hidden',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
            }}>

                {/* ═══════ Header ═══════ */}
                <Box sx={{
                    p: 2, px: 3,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    bgcolor: '#ffffff',
                    borderBottom: '1px solid #f1f5f9',
                    zIndex: 10,
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{
                            width: 44, height: 44,
                            background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                            boxShadow: '0 2px 8px rgba(124,58,237,0.25)',
                        }}>
                            <AiSparkleIcon size={24} color="#fff" />
                        </Avatar>
                        <Box>
                            <Typography variant="subtitle1" sx={{ color: '#0f172a', fontWeight: 700, lineHeight: 1.2 }}>
                                TMix AI Tutor
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                                {activeModeConfig.icon} {activeModeConfig.desc}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Tools & Status */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Tooltip title={autoRead ? 'Tắt tự động đọc' : 'Bật tự động đọc'}>
                            <IconButton
                                onClick={() => {
                                    if (autoRead) window.speechSynthesis.cancel();
                                    setAutoRead(!autoRead);
                                }}
                                sx={{
                                    bgcolor: autoRead ? 'rgba(124,58,237,0.08)' : '#f8fafc',
                                    color: autoRead ? COLORS.primary.main : '#64748b',
                                    border: '1px solid',
                                    borderColor: autoRead ? 'rgba(124,58,237,0.2)' : '#e2e8f0',
                                    '&:hover': { bgcolor: autoRead ? 'rgba(124,58,237,0.12)' : '#f1f5f9' }
                                }}
                            >
                                <AutoReadIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>

                        <Box sx={{
                            display: 'flex', alignItems: 'center', gap: 1,
                            bgcolor: '#f0fdf4',
                            borderRadius: '12px', px: 1.5, py: 0.5,
                            border: '1px solid #bbf7d0',
                        }}>
                            <DotIcon sx={{ fontSize: 10, color: '#10b981', animation: 'pulseActiveLight 2s infinite' }} />
                            <Typography variant="caption" sx={{ color: '#059669', fontWeight: 600 }}>
                                Online
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* ═══════ Mode Selector ═══════ */}
                <Box sx={{
                    display: 'flex', gap: 1, px: 3, py: 1.5,
                    bgcolor: '#ffffff',
                    borderBottom: '1px solid #f1f5f9',
                    overflowX: 'auto',
                    '&::-webkit-scrollbar': { height: '0px' },
                }}>
                    {CHAT_MODES.map((mode) => {
                        const isActive = activeMode === mode.key;
                        return (
                            <Chip
                                key={mode.key}
                                icon={<Box sx={{ display: 'flex', color: 'inherit' }}>{mode.icon}</Box>}
                                label={mode.label}
                                onClick={() => handleModeChange(mode.key)}
                                sx={{
                                    bgcolor: isActive ? `${mode.color}14` : '#ffffff',
                                    color: isActive ? mode.color : '#64748b',
                                    border: '1px solid',
                                    borderColor: isActive ? `${mode.color}40` : '#e2e8f0',
                                    fontWeight: isActive ? 700 : 500,
                                    borderRadius: '10px',
                                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: isActive ? `0 2px 8px ${mode.color}20` : 'none',
                                    transform: isActive ? 'scale(1.02)' : 'scale(1)',
                                    '&:hover': {
                                        bgcolor: isActive ? `${mode.color}20` : '#f8fafc',
                                        borderColor: isActive ? `${mode.color}60` : '#cbd5e1',
                                        transform: 'scale(1.02)',
                                    },
                                }}
                            />
                        );
                    })}
                </Box>

                {/* ═══════ Messages Area ═══════ */}
                <Box sx={{
                    flex: 1, p: 3, overflowY: 'auto',
                    display: 'flex', flexDirection: 'column', gap: 3,
                    scrollBehavior: 'smooth',
                    '&::-webkit-scrollbar': { width: '6px' },
                    '&::-webkit-scrollbar-thumb': { bgcolor: '#cbd5e1', borderRadius: '4px' }
                }}>
                    {messages.map((msg, i) => (
                        <Box key={i} sx={{
                            display: 'flex', gap: 2, maxWidth: '85%',
                            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                            flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                        }}>
                            {/* Avatar */}
                            <Avatar sx={{
                                width: 32, height: 32, mt: 0.5,
                                bgcolor: msg.role === 'user' ? '#e2e8f0' : 'transparent',
                                color: '#64748b',
                                background: msg.role === 'assistant' ? 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)' : undefined,
                            }}>
                                {msg.role === 'user' ? <PersonIcon fontSize="small" /> : <AiSparkleIcon size={18} color="#fff" />}
                            </Avatar>

                            {/* Bubble */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                                <Paper elevation={0} sx={{
                                    p: 2, borderRadius: 3,
                                    bgcolor: msg.role === 'user' ? COLORS.primary.main : '#ffffff',
                                    color: msg.role === 'user' ? '#ffffff' : '#334155',
                                    border: msg.role === 'assistant' ? '1px solid #e2e8f0' : 'none',
                                    boxShadow: msg.role === 'assistant' ? '0 2px 10px rgba(0,0,0,0.03)' : '0 2px 10px rgba(124,58,237,0.15)',
                                    wordBreak: 'break-word',
                                    ...(msg.role === 'user' && { whiteSpace: 'pre-wrap', lineHeight: 1.6 }),
                                }}>
                                    <MarkdownBubble content={msg.content} isUser={msg.role === 'user'} />
                                </Paper>

                                {/* Footer of bubble */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1 }}>
                                    {msg.role === 'assistant' && <ChatTTSButton text={msg.content} />}
                                    <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem' }}>
                                        {msg.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    ))}

                    {loading && (
                        <Box sx={{ display: 'flex', gap: 2, alignSelf: 'flex-start' }}>
                            <Avatar sx={{ width: 32, height: 32, background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)' }}>
                                <AiSparkleIcon size={18} color="#fff" />
                            </Avatar>
                            <Paper elevation={0} sx={{
                                p: 1.5, px: 2, borderRadius: 3,
                                bgcolor: '#ffffff',
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                                display: 'flex', alignItems: 'center', gap: 1.5,
                            }}>
                                <CircularProgress size={14} sx={{ color: COLORS.primary.main }} />
                                <Typography variant="body2" sx={{ color: '#64748b' }}>Đang phản hồi...</Typography>
                            </Paper>
                        </Box>
                    )}
                    <div ref={messagesEndRef} />
                </Box>

                {/* ═══════ Quick Prompts ═══════ */}
                {messages.length <= 1 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, px: 3, pb: 2 }}>
                        {activeModeConfig.quickPrompts.map((prompt, i) => (
                            <Chip
                                key={i}
                                label={prompt}
                                onClick={() => { setInput(prompt); inputRef.current?.focus(); }}
                                sx={{
                                    bgcolor: '#ffffff',
                                    color: '#475569',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '8px',
                                    fontWeight: 500,
                                    transition: 'all 0.2s',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                                    '&:hover': {
                                        bgcolor: '#f1f5f9',
                                        borderColor: '#94a3b8',
                                        color: '#0f172a',
                                    }
                                }}
                            />
                        ))}
                    </Box>
                )}

                {/* ═══════ Input Area ═══════ */}
                <Box sx={{
                    p: 2, px: 3,
                    bgcolor: '#ffffff',
                    borderTop: '1px solid #f1f5f9',
                }}>
                    <Box sx={{
                        display: 'flex', alignItems: 'flex-end', gap: 1.5,
                        bgcolor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: 3, p: 1,
                        transition: 'border-color 0.3s, box-shadow 0.3s',
                        '&:focus-within': {
                            borderColor: COLORS.primary.main,
                            boxShadow: '0 0 0 3px rgba(124,58,237,0.1)'
                        }
                    }}>
                        <TextField
                            inputRef={inputRef}
                            fullWidth
                            variant="standard"
                            placeholder={
                                activeMode === 'correct' ? 'Paste câu hoặc bài viết cần sửa...'
                                    : activeMode === 'quiz' ? 'Nhập chủ đề muốn luyện tập...'
                                        : activeMode === 'conversation' ? 'Type in English to practice...'
                                            : 'Hỏi AI về tiếng Anh...'
                            }
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                            disabled={loading}
                            multiline
                            maxRows={4}
                            InputProps={{ disableUnderline: true }}
                            sx={{
                                px: 1, py: 0.5,
                                '& textarea': { color: '#0f172a', fontSize: '0.95rem', lineHeight: 1.5 },
                                '& textarea::placeholder': { color: '#94a3b8', opacity: 1 },
                            }}
                        />
                        <IconButton
                            onClick={sendMessage}
                            disabled={!hasInput || loading}
                            sx={{
                                bgcolor: hasInput ? COLORS.primary.main : '#f1f5f9',
                                color: hasInput ? '#fff' : '#94a3b8',
                                borderRadius: 2,
                                width: 40, height: 40,
                                transition: 'all 0.2s',
                                '&:hover': { bgcolor: hasInput ? '#6d28d9' : '#e2e8f0' },
                                '&.Mui-disabled': { bgcolor: '#f1f5f9', color: '#cbd5e1' }
                            }}
                        >
                            <SendIcon fontSize="small" />
                        </IconButton>
                    </Box>
                </Box>
            </Box>
        </DashboardLayout>
    );
};

export default ChatbotPage;