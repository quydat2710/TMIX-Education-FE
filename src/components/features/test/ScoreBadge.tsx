// Score Badge Component
// Display test score with color-coded badge

import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

interface ScoreBadgeProps {
    score: number;
    totalPoints: number;
    percentage: number;
    passed: boolean;
    passingScore?: number;
    size?: 'small' | 'medium' | 'large';
}

const ScoreBadge: React.FC<ScoreBadgeProps> = ({
    score,
    totalPoints,
    percentage,
    passed,
    passingScore = 70,
    size = 'medium',
}) => {
    const getScoreColor = (): string => {
        if (passed) return 'success.main';
        return 'error.main';
    };

    const getScoreBgColor = (): string => {
        if (passed) return 'success.light';
        return 'error.light';
    };

    const fontSize = {
        small: { score: '1.5rem', label: '0.875rem' },
        medium: { score: '2.5rem', label: '1rem' },
        large: { score: '3.5rem', label: '1.25rem' },
    };

    return (
        <Box
            sx={{
                textAlign: 'center',
                p: 3,
                borderRadius: 2,
                bgcolor: getScoreBgColor(),
                border: `2px solid`,
                borderColor: getScoreColor(),
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                {passed ? (
                    <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main', mr: 1 }} />
                ) : (
                    <CancelIcon sx={{ fontSize: 40, color: 'error.main', mr: 1 }} />
                )}
                <Chip
                    label={passed ? 'PASSED' : 'FAILED'}
                    color={passed ? 'success' : 'error'}
                    sx={{ fontWeight: 'bold', fontSize: '1rem' }}
                />
            </Box>

            <Typography variant="h3" sx={{ fontSize: fontSize[size].score, fontWeight: 'bold', color: getScoreColor() }}>
                {percentage.toFixed(1)}%
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mt: 1, fontSize: fontSize[size].label }}>
                {score} / {totalPoints} points
            </Typography>

            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Passing score: {passingScore}%
            </Typography>
        </Box>
    );
};

export default ScoreBadge;
