import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Badge,
  Popover,
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Button,
  Divider,
  Chip,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import QuizIcon from '@mui/icons-material/Quiz';
import GradeIcon from '@mui/icons-material/Grade';
import PaymentIcon from '@mui/icons-material/Payment';
import EventIcon from '@mui/icons-material/Event';
import CampaignIcon from '@mui/icons-material/Campaign';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

import DoneAllIcon from '@mui/icons-material/DoneAll';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import { Notification } from '../../services/notifications';

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'new_test':
      return <QuizIcon sx={{ color: '#1976d2' }} />;
    case 'test_result':
      return <GradeIcon sx={{ color: '#2e7d32' }} />;
    case 'payment_reminder':
      return <PaymentIcon sx={{ color: '#ed6c02' }} />;
    case 'payment_success':
      return <PaymentIcon sx={{ color: '#2e7d32' }} />;
    case 'new_registration':
      return <PersonAddIcon sx={{ color: '#9c27b0' }} />;
    case 'schedule_change':
      return <EventIcon sx={{ color: '#d32f2f' }} />;
    case 'general':
    default:
      return <CampaignIcon sx={{ color: '#1976d2' }} />;
  }
};

const getTimeAgo = (dateStr: string): string => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Vừa xong';
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffHour < 24) return `${diffHour} giờ trước`;
  if (diffDay < 7) return `${diffDay} ngày trước`;
  return date.toLocaleDateString('vi-VN');
};

const NotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    latestNotification,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
  } = useNotifications();

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastNotification, setToastNotification] = useState<Notification | null>(null);

  // Show toast when new notification arrives
  useEffect(() => {
    if (latestNotification) {
      setToastNotification(latestNotification);
      setShowToast(true);
    }
  }, [latestNotification]);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    fetchNotifications(1);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
    handleClose();
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
  };

  const handleViewAll = () => {
    handleClose();
    navigate('/notifications');
  };

  const open = Boolean(anchorEl);
  const displayNotifications = notifications.slice(0, 8);

  return (
    <>
      <IconButton
        onClick={handleOpen}
        sx={{
          color: '#555',
          p: 1,
          '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
        }}
      >
        <Badge
          badgeContent={unreadCount}
          color="error"
          max={99}
          sx={{
            '& .MuiBadge-badge': {
              fontSize: '0.7rem',
              height: 18,
              minWidth: 18,
              fontWeight: 700,
            },
          }}
        >
          {unreadCount > 0 ? (
            <NotificationsActiveIcon
              sx={{
                fontSize: 24,
                animation: 'bell-shake 0.5s ease-in-out',
                '@keyframes bell-shake': {
                  '0%': { transform: 'rotate(0)' },
                  '15%': { transform: 'rotate(15deg)' },
                  '30%': { transform: 'rotate(-15deg)' },
                  '45%': { transform: 'rotate(10deg)' },
                  '60%': { transform: 'rotate(-5deg)' },
                  '75%': { transform: 'rotate(3deg)' },
                  '100%': { transform: 'rotate(0)' },
                },
              }}
            />
          ) : (
            <NotificationsIcon sx={{ fontSize: 24 }} />
          )}
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              width: { xs: 320, sm: 380 },
              maxHeight: 480,
              borderRadius: 4,
              mt: 1.5,
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
              border: '1px solid rgba(0,0,0,0.04)',
            },
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 2.5,
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
            background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <NotificationsIcon sx={{ color: '#1E3A5F', fontSize: 22 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1E3A5F' }}>
              Thông báo
            </Typography>
            {unreadCount > 0 && (
              <Chip
                label={unreadCount}
                size="small"
                color="error"
                sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }}
              />
            )}
          </Box>
          {unreadCount > 0 && (
            <Button
              size="small"
              startIcon={<DoneAllIcon sx={{ fontSize: 16 }} />}
              onClick={handleMarkAllRead}
              sx={{ textTransform: 'none', fontSize: '0.75rem', color: '#1976d2' }}
            >
              Đọc tất cả
            </Button>
          )}
        </Box>

        {/* Notification List */}
        <List
          sx={{
            maxHeight: 360,
            overflow: 'auto',
            py: 0,
            '&::-webkit-scrollbar': { width: 4 },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#ccc',
              borderRadius: 2,
            },
          }}
        >
          {loading && notifications.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={28} />
            </Box>
          ) : displayNotifications.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <NotificationsIcon sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Chưa có thông báo nào
              </Typography>
            </Box>
          ) : (
            displayNotifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItemButton
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    px: 2,
                    py: 1.5,
                    bgcolor: notification.isRead ? 'transparent' : 'rgba(25, 118, 210, 0.04)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: notification.isRead
                        ? '#f5f5ff'
                        : 'rgba(25, 118, 210, 0.08)',
                    },
                    alignItems: 'flex-start',
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: notification.isRead ? 400 : 600,
                          color: '#333',
                          lineHeight: 1.3,
                          mb: 0.3,
                        }}
                      >
                        {notification.title}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{
                            color: '#666',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            lineHeight: 1.4,
                          }}
                        >
                          {notification.message}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: '#999', display: 'block', mt: 0.5, fontSize: '0.7rem' }}
                        >
                          {getTimeAgo(notification.createdAt)}
                        </Typography>
                      </Box>
                    }
                  />
                  {!notification.isRead && (
                    <FiberManualRecordIcon
                      sx={{ fontSize: 10, color: '#1976d2', mt: 1, ml: 0.5, flexShrink: 0 }}
                    />
                  )}
                </ListItemButton>
                {index < displayNotifications.length - 1 && (
                  <Divider sx={{ mx: 2 }} />
                )}
              </React.Fragment>
            ))
          )}
        </List>

        {/* Footer */}
        {notifications.length > 0 && (
          <Box
            sx={{
              borderTop: '1px solid rgba(0,0,0,0.06)',
              textAlign: 'center',
              background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%)',
            }}
          >
            <Button
              fullWidth
              onClick={handleViewAll}
              endIcon={<ChevronRightIcon />}
              sx={{
                textTransform: 'none',
                py: 1.2,
                color: '#1976d2',
                fontWeight: 600,
                fontSize: '0.85rem',
              }}
            >
              Xem tất cả thông báo
            </Button>
          </Box>
        )}
      </Popover>

      {/* Toast notification */}
      <Snackbar
        open={showToast}
        autoHideDuration={4000}
        onClose={() => setShowToast(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setShowToast(false)}
          severity="info"
          variant="filled"
          sx={{
            width: '100%',
            borderRadius: 2,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
          }}
          onClick={() => {
            if (toastNotification?.link) {
              navigate(toastNotification.link);
            }
            setShowToast(false);
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {toastNotification?.title}
          </Typography>
          <Typography variant="caption">{toastNotification?.message}</Typography>
        </Alert>
      </Snackbar>
    </>
  );
};

export default NotificationBell;
