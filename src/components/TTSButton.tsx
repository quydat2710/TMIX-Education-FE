import React, { useState, useCallback, useRef, useEffect } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { VolumeUp as SpeakIcon, Stop as StopIcon } from '@mui/icons-material';

/**
 * TTS Hook - uses Web Speech API (browser built-in, free)
 */
export function useTTS() {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    const speak = useCallback((text: string, lang: string = 'en-US') => {
        if (!text || !window.speechSynthesis) return;
        
        // Stop any current speech
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 0.9;
        utterance.pitch = 1;
        
        // Try to find a good voice
        const voices = window.speechSynthesis.getVoices();
        const preferred = voices.find(v => v.lang.startsWith(lang.split('-')[0]) && v.name.includes('Google'));
        if (preferred) utterance.voice = preferred;
        else {
            const fallback = voices.find(v => v.lang.startsWith(lang.split('-')[0]));
            if (fallback) utterance.voice = fallback;
        }
        
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        
        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    }, []);

    const stop = useCallback(() => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => { window.speechSynthesis.cancel(); };
    }, []);

    return { speak, stop, isSpeaking };
}

/**
 * TTS Button Component
 * 🔊 Click to read text aloud
 */
interface TTSButtonProps {
    text: string;
    lang?: string;
    size?: 'small' | 'medium' | 'large';
    tooltip?: string;
    color?: string;
}

const TTSButton: React.FC<TTSButtonProps> = ({
    text,
    lang = 'en-US',
    size = 'small',
    tooltip = 'Nghe phát âm',
    color = '#ea580c'
}) => {
    const { speak, stop, isSpeaking } = useTTS();

    return (
        <Tooltip title={isSpeaking ? 'Dừng' : tooltip}>
            <IconButton
                onClick={() => isSpeaking ? stop() : speak(text, lang)}
                size={size}
                sx={{
                    color: isSpeaking ? '#dc2626' : color,
                    '&:hover': { bgcolor: isSpeaking ? '#fef2f2' : '#fff7ed' },
                }}
            >
                {isSpeaking ? <StopIcon fontSize={size} /> : <SpeakIcon fontSize={size} />}
            </IconButton>
        </Tooltip>
    );
};

export default TTSButton;
