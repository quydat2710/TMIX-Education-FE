import React, { useState } from 'react';
import { Badge, IconButton, Menu, MenuItem, Typography, Box, Divider } from '@mui/material';
import { Notifications as NotificationsIcon } from '@mui/icons-material';

const NotificationBell = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications] = useState([
    {
      id: 1,
      title: 'Thông báo mới',
      message: 'Bạn có một thông báo mới',
      time: '5 phút trước',
      read: false,
    },
    // Thêm các thông báo khác ở đây
  ]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{
          color: 'text.secondary',
          '&:hover': {
            color: 'primary.main',
          },
        }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            width: 320,
            maxHeight: 400,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6">Thông báo</Typography>
        </Box>
        <Divider />

        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={handleClose}
              sx={{
                whiteSpace: 'normal',
                py: 1.5,
                px: 2,
                backgroundColor: notification.read ? 'inherit' : 'action.hover',
              }}
            >
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: notification.read ? 400 : 600 }}>
                  {notification.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {notification.message}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  {notification.time}
                </Typography>
              </Box>
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              Không có thông báo mới
            </Typography>
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

export default NotificationBell;
