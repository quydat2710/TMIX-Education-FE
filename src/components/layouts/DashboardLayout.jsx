import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  Class as ClassIcon,
  Person as PersonIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Group as GroupIcon,
  Campaign as CampaignIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { COLORS } from '../../utils/colors';

const drawerWidth = 240;

const DashboardLayout = ({ children, role }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    // TODO: Implement logout logic
    navigate('/login');
  };

  const getMenuItems = () => {
    const commonItems = [
      { text: 'Dashboard', icon: <DashboardIcon />, path: `/${role}/dashboard` },
    ];

    const roleSpecificItems = {
      admin: [
        { text: 'Quản lý học viên', icon: <SchoolIcon />, path: '/admin/students' },
        { text: 'Quản lý giáo viên', icon: <PersonIcon />, path: '/admin/teachers' },
        { text: 'Quản lý lớp học', icon: <ClassIcon />, path: '/admin/classes' },
        { text: 'Quản lý phụ huynh', icon: <GroupIcon />, path: '/admin/parents' },
        { text: 'Quản lý quảng cáo', icon: <CampaignIcon />, path: '/admin/advertisements' },
        { text: 'Thống kê', icon: <AssessmentIcon />, path: '/admin/statistics' },
      ],
      teacher: [
        { text: 'Lịch dạy', icon: <ClassIcon />, path: '/teacher/schedule' },
        { text: 'Lớp học của tôi', icon: <SchoolIcon />, path: '/teacher/classes' },
      ],
      student: [
        { text: 'Lịch học', icon: <ClassIcon />, path: '/student/schedule' },
        { text: 'Lớp học của tôi', icon: <SchoolIcon />, path: '/student/classes' },
      ],
    };

    return [...commonItems, ...(roleSpecificItems[role] || [])];
  };

  const menuItems = getMenuItems();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          width: '100%',
          bgcolor: COLORS.primary.main,
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            English Center
            </Typography>
            <IconButton
            onClick={handleProfileMenuOpen}
              size="small"
              sx={{ ml: 2 }}
            >
            <Avatar sx={{ width: 32, height: 32, bgcolor: COLORS.secondary.main }}>
              {role.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
      >
        <MenuItem onClick={() => { navigate('/account'); handleProfileMenuClose(); }}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Trang cá nhân</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Đăng xuất</ListItemText>
        </MenuItem>
      </Menu>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        <Drawer
          variant="temporary"
          open={open}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              bgcolor: COLORS.background.default,
              borderRight: `1px solid ${COLORS.border}`,
              mt: '64px', // Height of AppBar
            },
          }}
        >
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => {
                    navigate(item.path);
                    setOpen(false); // Close drawer after navigation
                  }}
          sx={{
                    '&.Mui-selected': {
                      bgcolor: COLORS.primary.light,
                      '&:hover': {
                        bgcolor: COLORS.primary.light,
                      },
                    },
          }}
                >
                  <ListItemIcon sx={{ color: location.pathname === item.path ? COLORS.primary.main : 'inherit' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
            width: '100%',
            bgcolor: COLORS.background.default,
            mt: '64px', // Height of AppBar
        }}
      >
        {children}
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
