import React, { useState } from 'react';
import { AppBar, Toolbar, IconButton, Avatar, Box, Typography, Menu, MenuItem, useMediaQuery, useTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { COLORS } from '../../utils/colors';
import logoTMix from '../../assets/logo_tmix.png';

import NotificationBell from '../features/NotificationBell';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm')); // <600px
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleLogoClick = (): void => {
    navigate('/');
  };

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (): void => {
    setAnchorEl(null);
  };

  const handleProfile = (): void => {
    // Navigate to profile based on user role
    switch (user?.role) {
      case 'admin':
        navigate('/admin/profile');
        break;
      case 'teacher':
        navigate('/teacher/profile');
        break;
      case 'student':
        navigate('/student/profile');
        break;
      case 'parent':
        navigate('/parent/profile');
        break;
      default:
        navigate('/profile'); // Fallback to general profile
    }
    handleMenuClose();
  };

  const handleLogout = (): void => {
    logout();
    navigate('/');
    handleMenuClose();
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: 'rgba(255,255,255,0.6)',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.75) 0%, rgba(240,242,255,0.7) 50%, rgba(255,255,255,0.75) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.5)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        // Gradient accent line at bottom
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #D32F2F 0%, #ff6b6b 25%, #1E3A5F 50%, #667eea 75%, #a855f7 100%)',
          opacity: 0.85,
        },
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: 64, pl: { xs: 1, sm: 2 }, pr: { xs: 1.5, sm: 4 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
          <IconButton
            color="default"
            edge="start"
            onClick={onMenuClick}
            sx={{
              p: 1.2,
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: '#f0f0ff',
                transform: 'scale(1.05)',
              },
            }}
          >
            <MenuIcon fontSize="medium" />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', transition: 'opacity 0.3s', '&:hover': { opacity: 0.8 } }} onClick={handleLogoClick}>
            <Box
              component="img"
              src={logoTMix}
              alt="TMix Education"
              sx={{ height: { xs: 32, sm: 40 }, width: 'auto', mr: 1 }}
            />
            {/* Hide text on very small screens, show on sm+ */}
            {!isSmallMobile && (
              <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.25rem' }}>
                <span style={{ color: '#D32F2F' }}>TMix</span> <span style={{ color: '#1E3A5F' }}>Education</span>
              </Typography>
            )}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {user && <NotificationBell />}
          <Box
            onClick={handleAvatarClick}
            sx={{
              position: 'relative',
              cursor: 'pointer',
              // Gradient ring container
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #D32F2F, #ff6b6b, #1E3A5F, #667eea)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 10px rgba(211,47,47,0.25)',
              transition: 'all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1)',
              '&:hover': {
                transform: 'scale(1.1)',
                boxShadow: '0 4px 18px rgba(211,47,47,0.35), 0 0 12px rgba(102,126,234,0.2)',
              },
            }}
          >
            <Avatar
              sx={{
                width: 38,
                height: 38,
                bgcolor: COLORS.secondary.main,
                color: '#fff',
                fontSize: 16,
                fontWeight: 700,
                border: '2.5px solid #fff',
              }}
              src={user?.avatar}
              alt={user?.name || user?.username || 'User'}
            >
              {user?.avatar ? null : (user?.name?.charAt(0) || user?.username?.charAt(0) || '?')}
            </Avatar>
          </Box>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            sx={{
              mt: 1,
              '& .MuiPaper-root': {
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1), 0 1px 4px rgba(0,0,0,0.05)',
                minWidth: 200,
                overflow: 'visible',
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, textAlign: 'center' }}>
                {user?.name || user?.username || 'User'}
              </Typography>
            </Box>
            <MenuItem
              onClick={handleProfile}
              sx={{
                mx: 1, borderRadius: 2, transition: 'all 0.2s ease',
                '&:hover': { bgcolor: '#f0f0ff' },
              }}
            >
              <AccountCircleIcon fontSize="small" sx={{ mr: 1.2, color: '#64748b' }} />
              Trang cá nhân
            </MenuItem>
            <MenuItem
              onClick={handleLogout}
              sx={{
                mx: 1, mb: 0.5, borderRadius: 2, color: '#e53e3e',
                transition: 'all 0.2s ease',
                '&:hover': { bgcolor: '#fef2f2', color: '#c53030' },
              }}
            >
              <LogoutIcon fontSize="small" sx={{ mr: 1.2 }} />
              Đăng xuất
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
