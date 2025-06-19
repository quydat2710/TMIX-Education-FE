import React, { useState } from 'react';
import { AppBar, Toolbar, IconButton, Avatar, Box, Badge, Typography, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { COLORS } from '../../utils/colors';

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogoClick = () => {
    switch (user?.role) {
      case 'admin':
        navigate('/admin/dashboard');
        break;
      case 'teacher':
        navigate('/teacher/dashboard');
        break;
      case 'student':
        navigate('/student/dashboard');
        break;
      case 'parent':
        navigate('/parent/dashboard');
        break;
      default:
        navigate('/');
    }
  };

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const handleProfile = () => {
    navigate('/profile');
    handleMenuClose();
  };
  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  return (
    <AppBar position="fixed" elevation={0} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: '#fff', color: '#222', borderBottom: '1px solid #eee', boxShadow: 'none' }}>
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: 64, pl: 2, pr: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton color="default" edge="start" onClick={onMenuClick} sx={{ ml: 0, p: 1.2 }}>
            <MenuIcon fontSize="medium" />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', ml: 0.5 }} onClick={handleLogoClick}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#222', letterSpacing: 1, lineHeight: 1 }}>English Center</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton color="default" sx={{ p: 1.2 }}>
            <Badge badgeContent={3} color="error">
              <NotificationsIcon fontSize="medium" />
            </Badge>
          </IconButton>
          <IconButton onClick={handleAvatarClick} sx={{ p: 0.3 }}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: COLORS.secondary.main, color: '#fff', cursor: 'pointer', fontSize: 18 }}>
              {user?.name?.charAt(0) || user?.username?.charAt(0) || '?'}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            sx={{ mt: 1 }}
          >
            <Box sx={{ px: 2, py: 1, minWidth: 180 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, textAlign: 'center', mb: 1 }}>
                {user?.name || user?.username || 'User'}
              </Typography>
            </Box>
            <MenuItem onClick={handleProfile}>
              <AccountCircleIcon fontSize="small" sx={{ mr: 1 }} />
              Trang cá nhân
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
              Đăng xuất
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
