import React, { useState, useCallback, useRef, useEffect } from 'react';
import { IconButton, Tooltip, CircularProgress, Menu, Box, Slider, Typography } from '@mui/material';
import { VolumeUp as SpeakIcon, Stop as StopIcon, Speed as SpeedIcon } from '@mui/icons-material';
import axiosInstance from '../utils/axios.customize';

/**
 * TTS Hook — Server-side Piper TTS (VITS model) with browser fallback.
 * 
 * Priority:
 *   1. Server TTS (Piper/VITS) → High quality neural voice
 *   2. Browser TTS (Web Speech API) → Fallback if server unavailable
 */
export function useTTS() {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    /**
     * Speak text using server-side Piper TTS (VITS model).
     * Falls back to browser Web Speech API if server is unavailable.
     */
    const speak = useCallback(async (text: string, lang: string = 'en-US', speed: number = 1.0) => {
        if (!text) return;

        // Stop any current playback
        stop();
        setIsLoading(true);

        try {
            // Try server-side TTS first (Piper/VITS)
            abortRef.current = new AbortController();
            const response = await axiosInstance.post('/tts/synthesize', 
                { text, speed },
                { 
                    responseType: 'blob',
                    signal: abortRef.current.signal,
                    timeout: 30000,
                }
            );

            // Server returned audio successfully
            const audioBlob = new Blob([response.data], { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(audioBlob);
            
            const audio = new Audio(audioUrl);
            audioRef.current = audio;
            
            audio.onplay = () => { setIsSpeaking(true); setIsLoading(false); };
            audio.onended = () => { setIsSpeaking(false); URL.revokeObjectURL(audioUrl); };
            audio.onerror = () => { setIsSpeaking(false); setIsLoading(false); URL.revokeObjectURL(audioUrl); };
            
            await audio.play();
        } catch (err: any) {
            // If aborted, don't fallback
            if (err?.name === 'CanceledError' || err?.name === 'AbortError') {
                setIsLoading(false);
                return;
            }

            console.warn('Server TTS unavailable, falling back to browser TTS:', err?.message);
            
            // Fallback to browser Web Speech API
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
                
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = lang;
                utterance.rate = speed * 0.9; // Slightly slower for browser TTS
                utterance.pitch = 1;
                
                const voices = window.speechSynthesis.getVoices();
                const preferred = voices.find(v => v.lang.startsWith(lang.split('-')[0]) && v.name.includes('Google'));
                if (preferred) utterance.voice = preferred;
                else {
                    const fallback = voices.find(v => v.lang.startsWith(lang.split('-')[0]));
                    if (fallback) utterance.voice = fallback;
                }
                
                utterance.onstart = () => { setIsSpeaking(true); setIsLoading(false); };
                utterance.onend = () => setIsSpeaking(false);
                utterance.onerror = () => { setIsSpeaking(false); setIsLoading(false); };
                
                utteranceRef.current = utterance;
                window.speechSynthesis.speak(utterance);
            } else {
                setIsLoading(false);
            }
        }
    }, []);

    const stop = useCallback(() => {
        // Stop server audio
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current = null;
        }
        // Abort pending request
        if (abortRef.current) {
            abortRef.current.abort();
            abortRef.current = null;
        }
        // Stop browser TTS
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        setIsSpeaking(false);
        setIsLoading(false);
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
            }
            if (abortRef.current) {
                abortRef.current.abort();
            }
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    return { speak, stop, isSpeaking, isLoading };
}

/**
 * TTS Button Component — Server-side TTS with speed control
 * 🔊 Click to read text aloud using Piper TTS (VITS neural model)
 */
interface TTSButtonProps {
    text: string;
    lang?: string;
    size?: 'small' | 'medium' | 'large';
    tooltip?: string;
    color?: string;
    showSpeedControl?: boolean;
}

const TTSButton: React.FC<TTSButtonProps> = ({
    text,
    lang = 'en-US',
    size = 'small',
    tooltip = 'Nghe phát âm (Piper TTS)',
    color = '#ea580c',
    showSpeedControl = false
}) => {
    const { speak, stop, isSpeaking, isLoading } = useTTS();
    const [speed, setSpeed] = useState(1.0);
    const [speedAnchor, setSpeedAnchor] = useState<HTMLElement | null>(null);

    const handleClick = () => {
        if (isSpeaking) {
            stop();
        } else {
            speak(text, lang, speed);
        }
    };

    return (
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0 }}>
            <Tooltip title={isLoading ? 'Đang tải...' : isSpeaking ? 'Dừng' : tooltip}>
                <span>
                    <IconButton
                        onClick={handleClick}
                        disabled={isLoading && !isSpeaking}
                        size={size}
                        sx={{
                            color: isSpeaking ? '#dc2626' : isLoading ? '#9ca3af' : color,
                            '&:hover': { bgcolor: isSpeaking ? '#fef2f2' : '#fff7ed' },
                            transition: 'all 0.2s ease',
                            ...(isSpeaking && {
                                animation: 'pulse 1.5s ease-in-out infinite',
                                '@keyframes pulse': {
                                    '0%, 100%': { transform: 'scale(1)' },
                                    '50%': { transform: 'scale(1.15)' },
                                },
                            }),
                        }}
                    >
                        {isLoading ? (
                            <CircularProgress size={size === 'small' ? 18 : 24} sx={{ color }} />
                        ) : isSpeaking ? (
                            <StopIcon fontSize={size} />
                        ) : (
                            <SpeakIcon fontSize={size} />
                        )}
                    </IconButton>
                </span>
            </Tooltip>

            {showSpeedControl && (
                <>
                    <Tooltip title={`Tốc độ: ${speed}x`}>
                        <IconButton
                            size="small"
                            onClick={(e) => setSpeedAnchor(e.currentTarget)}
                            sx={{ color: '#9ca3af', fontSize: '0.7rem', ml: -0.5 }}
                        >
                            <SpeedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                    </Tooltip>
                    <Menu
                        anchorEl={speedAnchor}
                        open={Boolean(speedAnchor)}
                        onClose={() => setSpeedAnchor(null)}
                    >
                        <Box sx={{ px: 2, py: 1, width: 180 }}>
                            <Typography variant="caption" color="text.secondary">
                                Tốc độ đọc: {speed}x
                            </Typography>
                            <Slider
                                value={speed}
                                onChange={(_, v) => setSpeed(v as number)}
                                min={0.5}
                                max={2.0}
                                step={0.25}
                                marks={[
                                    { value: 0.5, label: '0.5x' },
                                    { value: 1.0, label: '1x' },
                                    { value: 1.5, label: '1.5x' },
                                    { value: 2.0, label: '2x' },
                                ]}
                                size="small"
                                sx={{ color: '#7c3aed' }}
                            />
                        </Box>
                    </Menu>
                </>
            )}
        </Box>
    );
};

export default TTSButton;
