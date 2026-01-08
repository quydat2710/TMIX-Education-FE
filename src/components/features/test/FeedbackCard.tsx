// Feedback Card Component
// Display AI feedback in a styled card

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
    const getIconByType = () => {
        if (icon) return icon;

        switch (type) {
            case 'success':
                return <CheckCircleIcon sx={{ color: 'success.main' }} />;
            case 'error':
                return <ErrorIcon sx={{ color: 'error.main' }} />;
            case 'suggestion':
                return <LightbulbIcon sx={{ color: 'warning.main' }} />;
            default:
                return <LightbulbIcon sx={{ color: 'info.main' }} />;
        }
    };

    const getBgColor = () => {
        switch (type) {
            case 'success':
                return 'success.light';
            case 'error':
                return 'error.light';
            case 'suggestion':
                return 'warning.light';
            default:
                return 'info.light';
        }
    };

    const getBorderColor = () => {
        switch (type) {
            case 'success':
                return 'success.main';
            case 'error':
                return 'error.main';
            case 'suggestion':
                return 'warning.main';
            default:
                return 'info.main';
        }
    };

    return (
        <Paper
            elevation={0}
            sx={{
                p: 2,
                bgcolor: getBgColor(),
                border: '1px solid',
                borderColor: getBorderColor(),
                borderRadius: 1,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 2,
            }}
        >
            <Box sx={{ mt: 0.5 }}>{getIconByType()}</Box>
            <Typography variant="body2" sx={{ flex: 1, lineHeight: 1.6 }}>
                {feedback}
            </Typography>
        </Paper>
    );
};

export default FeedbackCard;
