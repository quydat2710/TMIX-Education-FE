import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
  Pagination,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import QuizIcon from '@mui/icons-material/Quiz';
import GradeIcon from '@mui/icons-material/Grade';
import PaymentIcon from '@mui/icons-material/Payment';
import EventIcon from '@mui/icons-material/Event';
import CampaignIcon from '@mui/icons-material/Campaign';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { useNavigate } from 'react-router-dom';
import {
  Notification,
  getNotificationsAPI,
  getUnreadCountAPI,
  markAsReadAPI,
  markAllAsReadAPI,
} from '../services/notifications';

const getNotificationIcon = (type: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    new_test: <QuizIcon sx={{ color: '#1976d2' }} />,
    test_result: <GradeIcon sx={{ color: '#2e7d32' }} />,
    payment_reminder: <PaymentIcon sx={{ color: '#ed6c02' }} />,
    payment_success: <PaymentIcon sx={{ color: '#2e7d32' }} />,
    new_registration: <PersonAddIcon sx={{ color: '#9c27b0' }} />,
    schedule_change: <EventIcon sx={{ color: '#d32f2f' }} />,
    general: <CampaignIcon sx={{ color: '#1976d2' }} />,
  };
  return iconMap[type] || iconMap.general;
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
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchData = useCallback(async (pageNum: number, readFilter: 'all' | 'unread') => {
    try {
      setLoading(true);
      const isRead = readFilter === 'unread' ? false : undefined;
      const res = await getNotificationsAPI(pageNum, 15, isRead);
      const data = res.data?.data || res.data;
      setNotifications(data.result || []);
      setTotalPages(data.meta?.totalPages || 1);

      const countRes = await getUnreadCountAPI();
      const countData = countRes.data?.data || countRes.data;
      setUnreadCount(countData.count ?? 0);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(page, filter);
  }, [page, filter, fetchData]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsReadAPI(notification.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllAsReadAPI();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleFilterChange = (_: any, newFilter: 'all' | 'unread' | null) => {
    if (newFilter !== null) {
      setFilter(newFilter);
      setPage(1);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <NotificationsIcon sx={{ fontSize: 32, color: '#1E3A5F' }} />
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1E3A5F' }}>
            Thông báo
          </Typography>
          {unreadCount > 0 && (
            <Chip
              label={`${unreadCount} chưa đọc`}
              size="small"
              color="error"
              sx={{ fontWeight: 600 }}
            />
          )}
        </Box>
        {unreadCount > 0 && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<DoneAllIcon />}
            onClick={handleMarkAllRead}
            sx={{ textTransform: 'none' }}
          >
            Đánh dấu tất cả đã đọc
          </Button>
        )}
      </Box>

      {/* Filter */}
      <Box sx={{ mb: 2 }}>
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={handleFilterChange}
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              textTransform: 'none',
              px: 2.5,
              fontWeight: 500,
            },
          }}
        >
          <ToggleButton value="all">Tất cả</ToggleButton>
          <ToggleButton value="unread">Chưa đọc</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Notification List */}
      <Paper elevation={1} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <NotificationsIcon sx={{ fontSize: 64, color: '#ddd', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              {filter === 'unread' ? 'Không có thông báo chưa đọc' : 'Chưa có thông báo nào'}
            </Typography>
          </Box>
        ) : (
          <List sx={{ py: 0 }}>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItemButton
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    px: 3,
                    py: 2,
                    bgcolor: notification.isRead ? 'transparent' : 'rgba(25, 118, 210, 0.04)',
                    '&:hover': {
                      bgcolor: notification.isRead
                        ? 'rgba(0, 0, 0, 0.04)'
                        : 'rgba(25, 118, 210, 0.08)',
                    },
                    alignItems: 'flex-start',
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 44, mt: 0.3 }}>
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: notification.isRead ? 400 : 600,
                          color: '#222',
                          mb: 0.3,
                        }}
                      >
                        {notification.title}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" sx={{ color: '#555', mb: 0.5, lineHeight: 1.5 }}>
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#999' }}>
                          {getTimeAgo(notification.createdAt)}
                        </Typography>
                      </Box>
                    }
                  />
                  {!notification.isRead && (
                    <FiberManualRecordIcon
                      sx={{ fontSize: 12, color: '#1976d2', mt: 1, ml: 1, flexShrink: 0 }}
                    />
                  )}
                </ListItemButton>
                {index < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}
    </Box>
  );
};

export default NotificationsPage;
