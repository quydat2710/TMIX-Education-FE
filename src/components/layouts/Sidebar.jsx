import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Collapse,
  Divider,
  Box,
  Typography
} from '@mui/material';
import {
  Dashboard,
  School,
  People,
  Person,
  FamilyRestroom,
  Assignment,
  Payment,
  Announcement,
  BarChart,
  ExpandLess,
  ExpandMore,
  Class,
  Schedule,
  MonetizationOn,
  Home
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { USER_ROLES, ROLE_PERMISSIONS } from '../../constants/userRoles';

const DRAWER_WIDTH = 280;

const menuItems = {
  [USER_ROLES.ADMIN]: [
    {
      text: 'Trang chủ',
      icon: <Home />,
      path: '/',
      permission: null
    },
    {
      text: 'Dashboard',
      icon: <Dashboard />,
      path: '/admin/dashboard',
      permission: 'view_statistics'
    },
    {
      text: 'Quản lý lớp học',
      icon: <School />,
      permission: 'manage_classes',
      children: [
        { text: 'Danh sách lớp', path: '/admin/classes', icon: <Class /> },
        { text: 'Tạo lớp mới', path: '/admin/classes/create', icon: <School /> },
        { text: 'Lịch học', path: '/admin/schedule', icon: <Schedule /> }
      ]
    },
    {
      text: 'Quản lý giáo viên',
      icon: <People />,
      permission: 'manage_teachers',
      children: [
        { text: 'Danh sách giáo viên', path: '/admin/teachers', icon: <People /> },
        { text: 'Thêm giáo viên', path: '/admin/teachers/create', icon: <Person /> }
      ]
    },
    {
      text: 'Quản lý học sinh',
      icon: <Person />,
      permission: 'manage_students',
      children: [
        { text: 'Danh sách học sinh', path: '/admin/students', icon: <Person /> },
        { text: 'Thêm học sinh', path: '/admin/students/create', icon: <Person /> },
        { text: 'Điểm danh', path: '/admin/attendance', icon: <Assignment /> }
      ]
    },
    {
      text: 'Quản lý phụ huynh',
      icon: <FamilyRestroom />,
      permission: 'manage_parents',
      children: [
        { text: 'Danh sách phụ huynh', path: '/admin/parents', icon: <FamilyRestroom /> },
        { text: 'Thêm phụ huynh', path: '/admin/parents/create', icon: <FamilyRestroom /> }
      ]
    },
    {
      text: 'Quản lý học phí',
      icon: <Payment />,
      permission: 'manage_fees',
      children: [
        { text: 'Học phí', path: '/admin/fees', icon: <MonetizationOn /> },
        { text: 'Thanh toán', path: '/admin/payments', icon: <Payment /> }
      ]
    },
    {
      text: 'Thông báo',
      icon: <Announcement />,
      path: '/admin/announcements',
      permission: 'manage_announcements'
    },
    {
      text: 'Thống kê',
      icon: <BarChart />,
      path: '/admin/statistics',
      permission: 'view_statistics'
    }
  ],
  [USER_ROLES.TEACHER]: [
    {
      text: 'Trang chủ',
      icon: <Home />,
      path: '/',
      permission: null
    },
    {
      text: 'Dashboard',
      icon: <Dashboard />,
      path: '/teacher/dashboard',
      permission: null
    },
    {
      text: 'Lớp của tôi',
      icon: <School />,
      path: '/teacher/classes',
      permission: 'view_my_classes'
    },
    {
      text: 'Điểm danh',
      icon: <Assignment />,
      path: '/teacher/attendance',
      permission: 'mark_attendance'
    },
    {
      text: 'Lịch dạy',
      icon: <Schedule />,
      path: '/teacher/schedule',
      permission: 'view_schedule'
    }
  ],
  [USER_ROLES.STUDENT]: [
    {
      text: 'Trang chủ',
      icon: <Home />,
      path: '/',
      permission: null
    },
    {
      text: 'Dashboard',
      icon: <Dashboard />,
      path: '/student/dashboard',
      permission: null
    },
    {
      text: 'Lớp học của tôi',
      icon: <School />,
      path: '/student/class',
      permission: 'view_my_class'
    },
    {
      text: 'Điểm danh',
      icon: <Assignment />,
      path: '/student/attendance',
      permission: 'view_attendance'
    },
    {
      text: 'Lịch học',
      icon: <Schedule />,
      path: '/student/schedule',
      permission: 'view_schedule'
    }
  ],
  [USER_ROLES.PARENT]: [
    {
      text: 'Trang chủ',
      icon: <Home />,
      path: '/',
      permission: null
    },
    {
      text: 'Dashboard',
      icon: <Dashboard />,
      path: '/parent/dashboard',
      permission: null
    },
    {
      text: 'Thông tin con em',
      icon: <Person />,
      path: '/parent/children',
      permission: 'view_child_info'
    },
    {
      text: 'Điểm danh',
      icon: <Assignment />,
      path: '/parent/attendance',
      permission: 'view_child_attendance'
    },
    {
      text: 'Học phí',
      icon: <Payment />,
      path: '/parent/fees',
      permission: 'view_fees'
    },
    {
      text: 'Lịch học',
      icon: <Schedule />,
      path: '/parent/schedule',
      permission: 'view_schedule'
    }
  ]
};

const Sidebar = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [openSubmenus, setOpenSubmenus] = useState({});

  const userRole = user?.role || USER_ROLES.ADMIN;
  const userMenuItems = menuItems[userRole] || [];

  const handleSubMenuToggle = (index) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  const hasPermission = (permission) => {
    if (!permission) return true;
    return ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
  };

  const isPathActive = (path) => {
    return location.pathname === path;
  };

  const isParentPathActive = (children) => {
    return children?.some(child => location.pathname === child.path);
  };

  const renderMenuItem = (item, index) => {
    if (!hasPermission(item.permission)) {
      return null;
    }

    const hasChildren = item.children && item.children.length > 0;
    const isActive = hasChildren ? isParentPathActive(item.children) : isPathActive(item.path);

    if (hasChildren) {
      return (
        <React.Fragment key={index}>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleSubMenuToggle(index)}
              selected={isActive}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '& .MuiListItemIcon-root': {
                    color: 'white'
                  }
                }
              }}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
              {openSubmenus[index] ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          <Collapse in={openSubmenus[index]} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children.map((child, childIndex) => (
                <ListItem key={childIndex} disablePadding>
                  <ListItemButton
                    sx={{ pl: 4 }}
                    onClick={() => handleNavigation(child.path)}
                    selected={isPathActive(child.path)}
                  >
                    <ListItemIcon>
                      {child.icon}
                    </ListItemIcon>
                    <ListItemText primary={child.text} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Collapse>
        </React.Fragment>
      );
    }

    return (
      <ListItem key={index} disablePadding>
        <ListItemButton
          onClick={() => handleNavigation(item.path)}
          selected={isActive}
          sx={{
            '&.Mui-selected': {
              backgroundColor: 'primary.main',
              color: 'white',
              '& .MuiListItemIcon-root': {
                color: 'white'
              }
            }
          }}
        >
          <ListItemIcon>
            {item.icon}
          </ListItemIcon>
          <ListItemText primary={item.text} />
        </ListItemButton>
      </ListItem>
    );
  };

  const drawerContent = (
    <Box>
      <Box sx={{ p: 2, mt: 8 }}>
        <Typography variant="h6" color="primary">
          {userRole === USER_ROLES.ADMIN && 'Quản trị viên'}
          {userRole === USER_ROLES.TEACHER && 'Giáo viên'}
          {userRole === USER_ROLES.STUDENT && 'Học sinh'}
          {userRole === USER_ROLES.PARENT && 'Phụ huynh'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {user?.name || user?.username}
        </Typography>
      </Box>
      <Divider />
      <List>
        {userMenuItems.map(renderMenuItem)}
      </List>
    </Box>
  );

  return (
    <>
      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Sidebar;
export { DRAWER_WIDTH };
