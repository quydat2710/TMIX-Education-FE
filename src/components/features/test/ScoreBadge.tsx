// Score Badge Component
// Display test score with modern, premium design

import React from 'react';
import { Box, Typography, Chip, LinearProgress } from '@mui/material';
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
    const scoreColor = passed ? '#16a34a' : '#dc2626';
    const scoreBg = passed
        ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)'
        : 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)';

    const fontSize = {
        small: { score: '2rem', label: '0.85rem' },
        medium: { score: '3rem', label: '1rem' },
        large: { score: '4rem', label: '1.25rem' },
    };

    return (
        <Box sx={{ textAlign: 'center' }}>
            {/* Status Chip */}
            <Box sx={{ mb: 2 }}>
                <Chip
                    icon={passed
                        ? <CheckCircleIcon sx={{ color: 'white !important', fontSize: 18 }} />
                        : <CancelIcon sx={{ color: 'white !important', fontSize: 18 }} />
                    }
                    label={passed ? 'ĐẠT' : 'CHƯA ĐẠT'}
                    sx={{
                        bgcolor: scoreColor,
                        color: 'white',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        px: 1,
                        height: 32,
                        letterSpacing: '0.05em',
                    }}
                />
            </Box>

            {/* Score Circle */}
            <Box sx={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: size === 'large' ? 160 : size === 'medium' ? 130 : 100,
                height: size === 'large' ? 160 : size === 'medium' ? 130 : 100,
                borderRadius: '50%',
                background: scoreBg,
                border: `3px solid ${scoreColor}20`,
                mb: 2,
            }}>
                <Box sx={{ textAlign: 'center' }}>
                    <Typography sx={{
                        fontSize: fontSize[size].score,
                        fontWeight: 900,
                        color: scoreColor,
                        lineHeight: 1,
                        fontVariantNumeric: 'tabular-nums',
                    }}>
                        {percentage.toFixed(1)}%
                    </Typography>
                </Box>
            </Box>

            {/* Score text */}
            <Typography variant="body1" sx={{
                fontSize: fontSize[size].label,
                color: '#555',
                fontWeight: 600,
            }}>
                {score} / {totalPoints} điểm
            </Typography>

            {/* Progress bar */}
            <Box sx={{ mt: 2, px: 1 }}>
                <LinearProgress
                    variant="determinate"
                    value={Math.min(percentage, 100)}
                    sx={{
                        height: 8, borderRadius: 4, bgcolor: '#e5e7eb',
                        '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                            bgcolor: scoreColor,
                        },
                    }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                    <Typography variant="caption" sx={{ color: '#999' }}>0%</Typography>
                    <Typography variant="caption" sx={{ color: '#999', fontWeight: 600 }}>
                        Đạt: {passingScore}%
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#999' }}>100%</Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default ScoreBadge;
