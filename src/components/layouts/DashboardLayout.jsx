import React, { useState } from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  School,
  Person,
  Groups,
  FamilyRestroom,
  Assignment,
  Payment,
  Announcement,
  Analytics,
  Settings,
  AccountCircle,
  Logout
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { USER_ROLES } from '../../constants/userRoles';

const drawerWidth = 240;

const getMenuItems = (userRole) => {
  const commonItems = [
    { text: 'Trang chủ', icon: <Dashboard />, path: '/dashboard' }
  ];

  switch (userRole) {
    case USER_ROLES.ADMIN:
      return [
        ...commonItems,
        { text: 'Quản lý lớp học', icon: <School />, path: '/admin/classes' },
        { text: 'Quản lý giáo viên', icon: <Person />, path: '/admin/teachers' },
        { text: 'Quản lý học sinh', icon: <Groups />, path: '/admin/students' },
        { text: 'Quản lý phụ huynh', icon: <FamilyRestroom />, path: '/admin/parents' },
        { text: 'Điểm danh', icon: <Assignment />, path: '/admin/attendance' },
        { text: 'Quản lý học phí', icon: <Payment />, path: '/admin/fees' },
        { text: 'Thông báo', icon: <Announcement />, path: '/admin/announcements' },
        { text: 'Thống kê', icon: <Analytics />, path: '/admin/statistics' },
        { text: 'Cài đặt', icon: <Settings />, path: '/admin/settings' }
      ];
    
    case USER_ROLES.TEACHER:
      return [
        ...commonItems,
        { text: 'Lớp của tôi', icon: <School />, path: '/teacher/classes' },
        { text: 'Điểm danh', icon: <Assignment />, path: '/teacher/attendance' },
        { text: 'Lịch dạy', icon: <Analytics />, path: '/teacher/schedule' }
      ];
    
    case USER_ROLES.STUDENT:
      return [
        ...commonItems,
        { text: 'Lớp học', icon: <School />, path: '/student/class' },
        { text: 'Điểm danh', icon: <Assignment />, path: '/student/attendance' },
        { text: 'Lịch học', icon: <Analytics />, path: '/student/schedule' }
      ];
    
    case USER_ROLES.PARENT:
      return [
        ...commonItems,
        { text: 'Thông tin con em', icon: <Groups />, path: '/parent/children' },
        { text: 'Điểm danh', icon: <Assignment />, path: '/parent/attendance' },
        { text: 'Học phí', icon: <Payment />, path: '/parent/fees' },
        { text: 'Lịch học', icon: <Analytics />, path: '/parent/schedule' }
      ];
    
    default:
      return commonItems;
  }
};

const DashboardLayout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = getMenuItems(user?.role);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleMenuClose();
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Trung tâm tiếng Anh
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {menuItems.find(item => item.path === location.pathname)?.text || 'Dashboard'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ mr: 1 }}>
              {user?.name}
            </Typography>
            <IconButton
              onClick={handleMenuClick}
              size="small"
              sx={{ ml: 2 }}
              aria-controls={Boolean(anchorEl) ? 'account-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={Boolean(anchorEl) ? 'true' : undefined}
            >
              <Avatar sx={{ width: 32, height: 32 }}>
                <AccountCircle />
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
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
        <MenuItem onClick={() => navigate('/profile')}>
          <Avatar /> Hồ sơ cá nhân
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Đăng xuất
        </MenuItem>
      </Menu>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout;
