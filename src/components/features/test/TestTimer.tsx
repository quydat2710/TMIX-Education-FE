// Test Timer Component
// Countdown timer that triggers auto-submit when time runs out

import React, { useState, useEffect } from 'react';
import { Box, Typography, Chip, LinearProgress } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface TestTimerProps {
    durationMinutes: number;
    onTimeUp: () => void;
    isPaused?: boolean;
    onTimeUpdate?: (seconds: number) => void;
}

const TestTimer: React.FC<TestTimerProps> = ({ durationMinutes, onTimeUp, isPaused = false, onTimeUpdate }) => {
    const [timeRemaining, setTimeRemaining] = useState(durationMinutes * 60); // in seconds
    const totalSeconds = durationMinutes * 60;

    useEffect(() => {
        if (isPaused || timeRemaining <= 0) return;

        const timer = setInterval(() => {
            setTimeRemaining((prev) => {
                const next = prev <= 1 ? 0 : prev - 1;
                onTimeUpdate?.(next);
                if (next === 0) {
                    clearInterval(timer);
                    onTimeUp();
                }
                return next;
            });
        }, 1000);

        // Fire immediately on mount so floating pill has initial value
        onTimeUpdate?.(timeRemaining);

        return () => clearInterval(timer);
    }, [isPaused]);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const getTimeColor = (): 'error' | 'warning' | 'success' => {
        const percentage = (timeRemaining / totalSeconds) * 100;
        if (percentage <= 10) return 'error';
        if (percentage <= 30) return 'warning';
        return 'success';
    };

    const getProgressPercentage = (): number => {
        return ((totalSeconds - timeRemaining) / totalSeconds) * 100;
    };

    return (
        <Box sx={{ width: '100%', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTimeIcon color={getTimeColor()} />
                    <Typography variant="h6" color={`${getTimeColor()}.main`}>
                        Thời gian còn lại:
                    </Typography>
                </Box>
                <Chip
                    label={formatTime(timeRemaining)}
                    color={getTimeColor()}
                    size="medium"
                    sx={{ fontSize: '1.1rem', fontWeight: 'bold', px: 2 }}
                />
            </Box>
            <LinearProgress
                variant="determinate"
                value={getProgressPercentage()}
                color={getTimeColor()}
                sx={{ height: 8, borderRadius: 1 }}
            />
            {timeRemaining <= 60 && timeRemaining > 0 && (
                <Typography variant="caption" color="error.main" sx={{ mt: 1, display: 'block' }}>
                    ⚠️ Còn dưới 1 phút! Bài kiểm tra sẽ được nộp tự động khi hết giờ.
                </Typography>
            )}
        </Box>
    );
};

export default TestTimer;
