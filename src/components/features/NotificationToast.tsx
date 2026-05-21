/**
 * NotificationToast — Premium floating toast notification
 *
 * Features:
 * - Renders via Portal (outside Header DOM) for correct positioning
 * - Slides in from the right with smooth animation
 * - Countdown progress bar (auto-dismiss after 6s)
 * - Click to navigate to notification link
 * - X button to dismiss immediately
 * - Pauses countdown on hover
 * - Icon + color based on notification type
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import QuizIcon from '@mui/icons-material/Quiz';
import GradeIcon from '@mui/icons-material/Grade';
import PaymentIcon from '@mui/icons-material/Payment';
import EventIcon from '@mui/icons-material/Event';
import CampaignIcon from '@mui/icons-material/Campaign';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import UploadFileIcon from '@mui/icons-material/UploadFile';

import { useNavigate } from 'react-router-dom';
import { Notification } from '../../services/notifications';

const TOAST_DURATION = 6000;

const getTypeConfig = (type: string) => {
    switch (type) {
        case 'new_test':
            return { icon: <QuizIcon />, color: '#3b82f6', bg: '#eff6ff', label: 'Bài test mới' };
        case 'test_result':
            return { icon: <GradeIcon />, color: '#16a34a', bg: '#f0fdf4', label: 'Kết quả bài thi' };
        case 'payment_reminder':
            return { icon: <PaymentIcon />, color: '#ea580c', bg: '#fff7ed', label: 'Nhắc thanh toán' };
        case 'payment_success':
            return { icon: <PaymentIcon />, color: '#16a34a', bg: '#f0fdf4', label: 'Thanh toán' };
        case 'new_registration':
            return { icon: <PersonAddIcon />, color: '#7c3aed', bg: '#faf5ff', label: 'Đăng ký mới' };
        case 'schedule_change':
            return { icon: <EventIcon />, color: '#dc2626', bg: '#fef2f2', label: 'Thay đổi lịch' };
        case 'new_material':
            return { icon: <UploadFileIcon />, color: '#0891b2', bg: '#ecfeff', label: 'Tài liệu mới' };
        case 'general':
        default:
            return { icon: <CampaignIcon />, color: '#1e3a8a', bg: '#eff6ff', label: 'Thông báo' };
    }
};

interface NotificationToastProps {
    notification: Notification | null;
    onDismiss: () => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onDismiss }) => {
    const navigate = useNavigate();
    const [visible, setVisible] = useState(false);
    const [exiting, setExiting] = useState(false);
    const [progress, setProgress] = useState(100);
    const [paused, setPaused] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const startTimeRef = useRef(0);
    const remainingRef = useRef(TOAST_DURATION);

    const dismiss = useCallback(() => {
        setExiting(true);
        setTimeout(() => {
            setVisible(false);
            setExiting(false);
            onDismiss();
        }, 350);
    }, [onDismiss]);

    const startTimer = useCallback(() => {
        startTimeRef.current = Date.now();
        timerRef.current = setInterval(() => {
            const elapsed = Date.now() - startTimeRef.current;
            const newRemaining = remainingRef.current - elapsed;
            if (newRemaining <= 0) {
                if (timerRef.current) clearInterval(timerRef.current);
                dismiss();
            } else {
                setProgress((newRemaining / TOAST_DURATION) * 100);
            }
        }, 30);
    }, [dismiss]);

    const pauseTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            const elapsed = Date.now() - startTimeRef.current;
            remainingRef.current = remainingRef.current - elapsed;
        }
    }, []);

    useEffect(() => {
        if (notification) {
            setProgress(100);
            setExiting(false);
            setPaused(false);
            remainingRef.current = TOAST_DURATION;
            setVisible(true);
            startTimer();
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [notification]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (paused) {
            pauseTimer();
        } else if (visible && !exiting) {
            startTimer();
        }
    }, [paused]); // eslint-disable-line react-hooks/exhaustive-deps

    if (!visible || !notification) return null;

    const config = getTypeConfig(notification.type);

    const handleClick = () => {
        if (notification.link) {
            navigate(notification.link);
        }
        dismiss();
    };

    // Use Portal to render directly into document.body
    // This prevents position:fixed from being affected by parent CSS transforms in Header
    return createPortal(
        <Box
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            sx={{
                position: 'fixed',
                bottom: 24,
                right: 24,
                zIndex: 9999,
                width: { xs: 'calc(100% - 48px)', sm: 360 },
                maxWidth: 400,
                borderRadius: 3,
                overflow: 'hidden',
                bgcolor: 'white',
                boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.08)',
                border: '1px solid rgba(0,0,0,0.06)',
                cursor: notification.link ? 'pointer' : 'default',
                transform: exiting ? 'translateX(120%)' : 'translateX(0)',
                opacity: exiting ? 0 : 1,
                animation: !exiting ? 'toastSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
                transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.35s ease',
                '@keyframes toastSlideIn': {
                    '0%': { transform: 'translateX(120%)', opacity: 0 },
                    '100%': { transform: 'translateX(0)', opacity: 1 },
                },
                '&:hover': {
                    boxShadow: '0 24px 64px rgba(0,0,0,0.18), 0 6px 20px rgba(0,0,0,0.1)',
                },
            }}
        >
            {/* Top accent bar */}
            <Box sx={{ height: 3, bgcolor: config.color }} />

            {/* Content */}
            <Box
                onClick={handleClick}
                sx={{ display: 'flex', gap: 1.5, p: 2, alignItems: 'flex-start' }}
            >
                {/* Icon */}
                <Box
                    sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        bgcolor: config.bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        color: config.color,
                        '& .MuiSvgIcon-root': { fontSize: 20 },
                    }}
                >
                    {config.icon}
                </Box>

                {/* Text */}
                <Box sx={{ flex: 1, minWidth: 0, pr: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.3 }}>
                        <Typography
                            variant="caption"
                            sx={{
                                color: config.color,
                                fontWeight: 700,
                                fontSize: '0.65rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                            }}
                        >
                            {config.label}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.65rem' }}>
                            Vừa xong
                        </Typography>
                    </Box>
                    <Typography
                        variant="body2"
                        sx={{
                            fontWeight: 700,
                            color: '#0f172a',
                            lineHeight: 1.3,
                            mb: 0.3,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {notification.title}
                    </Typography>
                    <Typography
                        variant="caption"
                        sx={{
                            color: '#64748b',
                            lineHeight: 1.4,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                        }}
                    >
                        {notification.message}
                    </Typography>
                </Box>

                {/* Close button */}
                <IconButton
                    size="small"
                    onClick={(e) => {
                        e.stopPropagation();
                        dismiss();
                    }}
                    sx={{
                        position: 'absolute',
                        top: 10,
                        right: 8,
                        width: 24,
                        height: 24,
                        color: '#94a3b8',
                        '&:hover': { color: '#475569', bgcolor: '#f1f5f9' },
                    }}
                >
                    <CloseIcon sx={{ fontSize: 16 }} />
                </IconButton>
            </Box>

            {/* Progress bar countdown */}
            <Box sx={{ height: 3, bgcolor: '#f1f5f9', position: 'relative' }}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        height: '100%',
                        width: `${progress}%`,
                        bgcolor: config.color,
                        opacity: 0.6,
                        borderRadius: '0 2px 2px 0',
                        transition: paused ? 'none' : 'width 0.05s linear',
                    }}
                />
            </Box>
        </Box>,
        document.body
    );
};

export default NotificationToast;
