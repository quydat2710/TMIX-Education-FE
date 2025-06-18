import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  IconButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Divider,
  useTheme,
  Menu,
  MenuItem,
  Button,
  Chip,
} from '@mui/material';
import {
  School as SchoolIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  ExitToApp as LogoutIcon,
  Payment as PaymentIcon,
  Home as HomeIcon,
  CalendarMonth as CalendarMonthIcon,
  Assessment as AssessmentIcon,
  Campaign as CampaignIcon,
  AccountCircle as AccountCircleIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import NotificationBell from '../common/NotificationBell';

const Layout = ({ children }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleUserMenuClose();
    logout();
  };

  const handleTitleClick = () => {
    if (user) {
      navigate('/home');
    } else {
      navigate('/');
    }
  };

  const getMenuItems = () => {
    switch (user?.role) {
      case 'admin':
        return [
          { text: 'Trang chủ', icon: <HomeIcon />, path: '/home', color: '#3B82F6' },
          { text: 'Quản lý lớp học', icon: <SchoolIcon />, path: '/admin/classes', color: '#10B981' },
          { text: 'Quản lý giáo viên', icon: <PeopleIcon />, path: '/admin/teachers', color: '#8B5CF6' },
          { text: 'Quản lý học sinh', icon: <PersonIcon />, path: '/admin/students', color: '#F59E0B' },
          { text: 'Quản lý phụ huynh', icon: <PeopleIcon />, path: '/admin/parents', color: '#EC4899' },
          { text: 'Thống kê tài chính', icon: <AssessmentIcon />, path: '/admin/financial-statistics', color: '#06B6D4' },
          { text: 'Quản lý quảng cáo', icon: <CampaignIcon />, path: '/admin/advertisements', color: '#F97316' },
          { text: 'Quản lý tài khoản', icon: <AccountCircleIcon />, path: '/account', color: '#6B7280' },
        ];
      case 'teacher':
        return [
          { text: 'Trang chủ', icon: <HomeIcon />, path: '/home', color: '#3B82F6' },
          { text: 'Lớp của tôi', icon: <SchoolIcon />, path: '/teacher/my-classes', color: '#10B981' },
          { text: 'Lịch làm việc', icon: <CalendarMonthIcon />, path: '/teacher/schedule', color: '#8B5CF6' },
          { text: 'Quản lý tài khoản', icon: <AccountCircleIcon />, path: '/account', color: '#6B7280' },
        ];
      case 'parent':
        return [
          { text: 'Trang chủ', icon: <HomeIcon />, path: '/home', color: '#3B82F6' },
          { text: 'Quản lý con em', icon: <PeopleIcon />, path: '/parent/children', color: '#10B981' },
          { text: 'Thanh toán', icon: <PaymentIcon />, path: '/parent/payments', color: '#8B5CF6' },
          { text: 'Quản lý tài khoản', icon: <AccountCircleIcon />, path: '/account', color: '#6B7280' },
        ];
      case 'student':
        return [
          { text: 'Trang chủ', icon: <HomeIcon />, path: '/home', color: '#3B82F6' },
          { text: 'Lớp học của tôi', icon: <SchoolIcon />, path: '/student/my-classes', color: '#10B981' },
          { text: 'Thời khóa biểu', icon: <CalendarMonthIcon />, path: '/student/schedule', color: '#8B5CF6' },
          { text: 'Quản lý tài khoản', icon: <AccountCircleIcon />, path: '/account', color: '#6B7280' },
        ];
      default:
        return [];
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'admin':
        return 'Quản trị viên';
      case 'teacher':
        return 'Giáo viên';
      case 'parent':
        return 'Phụ huynh';
      case 'student':
        return 'Học sinh';
      default:
        return role.charAt(0).toUpperCase() + role.slice(1);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return '#EF4444';
      case 'teacher':
        return '#10B981';
      case 'parent':
        return '#8B5CF6';
      case 'student':
        return '#3B82F6';
      default:
        return '#6B7280';
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: '100%',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ px: 3 }}>
          <Typography 
            variant="h5" 
            noWrap 
            component="div" 
            sx={{ 
              background: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'scale(1.05)',
              },
            }}
            onClick={handleTitleClick}
          >
            English Center
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <NotificationBell />
            
            <Chip
              label={getRoleDisplayName(user?.role)}
              size="small"
              sx={{
                backgroundColor: getRoleColor(user?.role),
                color: 'white',
                fontWeight: 500,
              }}
            />

            <IconButton
              onClick={handleUserMenuOpen}
              size="small"
              sx={{ ml: 2 }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: getRoleColor(user?.role),
                }}
              >
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleUserMenuClose}
              PaperProps={{
                elevation: 0,
                sx: {
                  overflow: 'visible',
                  filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                  mt: 1.5,
                  '& .MuiAvatar-root': {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                  },
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              {getMenuItems().map((item) => (
                <MenuItem
                  key={item.path}
                  onClick={() => {
                    handleUserMenuClose();
                    navigate(item.path);
                  }}
                  sx={{
                    color: location.pathname === item.path ? item.color : 'inherit',
                    '&:hover': {
                      backgroundColor: `${item.color}10`,
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: 'inherit' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText>{item.text}</ListItemText>
                </MenuItem>
              ))}
              
              <Divider />
              
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText>Đăng xuất</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: '100%',
          mt: '64px',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
