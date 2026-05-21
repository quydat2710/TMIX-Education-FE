// Feedback Card Component
// Display AI feedback in a modern, clean card

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

interface FeedbackCardProps {
    feedback: string;
    type?: 'success' | 'error' | 'info' | 'suggestion';
    icon?: React.ReactNode;
}

const FeedbackCard: React.FC<FeedbackCardProps> = ({ feedback, type = 'info', icon }) => {
    const config = {
        success: {
            icon: <CheckCircleIcon sx={{ fontSize: 20, color: '#16a34a' }} />,
            bg: '#f0fdf4',
            border: '#bbf7d0',
            leftBorder: '#22c55e',
        },
        error: {
            icon: <ErrorIcon sx={{ fontSize: 20, color: '#dc2626' }} />,
            bg: '#fef2f2',
            border: '#fecaca',
            leftBorder: '#ef4444',
        },
        suggestion: {
            icon: <LightbulbIcon sx={{ fontSize: 20, color: '#d97706' }} />,
            bg: '#fffbeb',
            border: '#fde68a',
            leftBorder: '#f59e0b',
        },
        info: {
            icon: <LightbulbIcon sx={{ fontSize: 20, color: '#2563eb' }} />,
            bg: '#eff6ff',
            border: '#bfdbfe',
            leftBorder: '#3b82f6',
        },
    };

    const c = config[type];

    return (
        <Paper
            elevation={0}
            sx={{
                p: 2,
                bgcolor: c.bg,
                border: `1px solid ${c.border}`,
                borderLeft: `4px solid ${c.leftBorder}`,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5,
                transition: 'transform 0.15s, box-shadow 0.15s',
                '&:hover': {
                    transform: 'translateX(2px)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                },
            }}
        >
            <Box sx={{ mt: 0.2, flexShrink: 0 }}>{icon || c.icon}</Box>
            <Typography variant="body2" sx={{ flex: 1, lineHeight: 1.7, color: '#374151' }}>
                {feedback}
            </Typography>
        </Paper>
    );
};

export default FeedbackCard;
