import React, { useState } from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, ListItemButton, Divider, Tooltip, Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ExploreIcon from '@mui/icons-material/Explore';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import HistoryIcon from '@mui/icons-material/History';
import SchoolIcon from '@mui/icons-material/School';
import ClassIcon from '@mui/icons-material/Class';
import CampaignIcon from '@mui/icons-material/Campaign';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PaymentIcon from '@mui/icons-material/Payment';
import PeopleIcon from '@mui/icons-material/People';
import MenuIcon from '@mui/icons-material/Menu';
import SecurityIcon from '@mui/icons-material/Security';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import AiSparkleIcon from '../icons/AiSparkleIcon';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSidebar } from '../../contexts/SidebarContext';
import { COLORS } from '../../utils/colors';

interface MenuItem {
  text: string;
  icon: React.ReactElement;
  path: string;
}

// ─── Icon color map: mỗi path có nền tròn + glow shadow riêng ───
const ICON_STYLE_MAP: Record<string, { bg: string; color: string; glow: string }> = {
  // Student
  '/student/dashboard': { bg: 'linear-gradient(135deg, #fee2e2, #fecaca)', color: '#dc2626', glow: '0 4px 14px rgba(220,38,38,0.30)' },
  '/student/schedule':  { bg: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', color: '#2563eb', glow: '0 4px 14px rgba(37,99,235,0.30)' },
  '/student/classes':   { bg: 'linear-gradient(135deg, #d1fae5, #a7f3d0)', color: '#059669', glow: '0 4px 14px rgba(5,150,105,0.30)' },
  '/student/tests':     { bg: 'linear-gradient(135deg, #fef3c7, #fde68a)', color: '#d97706', glow: '0 4px 14px rgba(217,119,6,0.30)' },
  '/student/chatbot':   { bg: 'linear-gradient(135deg, #ede9fe, #ddd6fe)', color: '#7c3aed', glow: '0 4px 14px rgba(124,58,237,0.35)' },
  '/student/materials': { bg: 'linear-gradient(135deg, #fce7f3, #fbcfe8)', color: '#db2777', glow: '0 4px 14px rgba(219,39,119,0.30)' },
  // Teacher
  '/teacher/dashboard': { bg: 'linear-gradient(135deg, #fee2e2, #fecaca)', color: '#dc2626', glow: '0 4px 14px rgba(220,38,38,0.30)' },
  '/teacher/schedule':  { bg: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', color: '#2563eb', glow: '0 4px 14px rgba(37,99,235,0.30)' },
  '/teacher/classes':   { bg: 'linear-gradient(135deg, #d1fae5, #a7f3d0)', color: '#059669', glow: '0 4px 14px rgba(5,150,105,0.30)' },
  '/teacher/tests':     { bg: 'linear-gradient(135deg, #fef3c7, #fde68a)', color: '#d97706', glow: '0 4px 14px rgba(217,119,6,0.30)' },
  '/teacher/materials': { bg: 'linear-gradient(135deg, #fce7f3, #fbcfe8)', color: '#db2777', glow: '0 4px 14px rgba(219,39,119,0.30)' },
  '/teacher/salary':    { bg: 'linear-gradient(135deg, #ccfbf1, #99f6e4)', color: '#0d9488', glow: '0 4px 14px rgba(13,148,136,0.30)' },
  // Admin
  '/admin/dashboard':      { bg: 'linear-gradient(135deg, #fee2e2, #fecaca)', color: '#dc2626', glow: '0 4px 14px rgba(220,38,38,0.30)' },
  '/admin/users':          { bg: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', color: '#2563eb', glow: '0 4px 14px rgba(37,99,235,0.30)' },
  '/admin/classes':        { bg: 'linear-gradient(135deg, #d1fae5, #a7f3d0)', color: '#059669', glow: '0 4px 14px rgba(5,150,105,0.30)' },
  '/admin/advertisements': { bg: 'linear-gradient(135deg, #fef3c7, #fde68a)', color: '#d97706', glow: '0 4px 14px rgba(217,119,6,0.30)' },
  '/admin/registrations':  { bg: 'linear-gradient(135deg, #ede9fe, #ddd6fe)', color: '#7c3aed', glow: '0 4px 14px rgba(124,58,237,0.35)' },
  '/admin/menu-management':{ bg: 'linear-gradient(135deg, #fce7f3, #fbcfe8)', color: '#db2777', glow: '0 4px 14px rgba(219,39,119,0.30)' },
  '/admin/roles-management':{ bg: 'linear-gradient(135deg, #ccfbf1, #99f6e4)', color: '#0d9488', glow: '0 4px 14px rgba(13,148,136,0.30)' },
  '/admin/statistics':     { bg: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)', color: '#4f46e5', glow: '0 4px 14px rgba(79,70,229,0.30)' },
  '/admin/testimonials':   { bg: 'linear-gradient(135deg, #fef3c7, #fde68a)', color: '#d97706', glow: '0 4px 14px rgba(217,119,6,0.30)' },
  '/admin/audit-log':      { bg: 'linear-gradient(135deg, #f3e8ff, #e9d5ff)', color: '#9333ea', glow: '0 4px 14px rgba(147,51,234,0.30)' },
  // Parent
  '/parent/dashboard':  { bg: 'linear-gradient(135deg, #fee2e2, #fecaca)', color: '#dc2626', glow: '0 4px 14px rgba(220,38,38,0.30)' },
  '/parent/children':   { bg: 'linear-gradient(135deg, #d1fae5, #a7f3d0)', color: '#059669', glow: '0 4px 14px rgba(5,150,105,0.30)' },
  '/parent/payments':   { bg: 'linear-gradient(135deg, #ccfbf1, #99f6e4)', color: '#0d9488', glow: '0 4px 14px rgba(13,148,136,0.30)' },
  // Default
  '/':            { bg: 'linear-gradient(135deg, #fee2e2, #fecaca)', color: '#dc2626', glow: '0 4px 14px rgba(220,38,38,0.30)' },
  '/explore':     { bg: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', color: '#2563eb', glow: '0 4px 14px rgba(37,99,235,0.30)' },
  '/subscriptions':{ bg: 'linear-gradient(135deg, #d1fae5, #a7f3d0)', color: '#059669', glow: '0 4px 14px rgba(5,150,105,0.30)' },
  '/library':     { bg: 'linear-gradient(135deg, #fef3c7, #fde68a)', color: '#d97706', glow: '0 4px 14px rgba(217,119,6,0.30)' },
  '/history':     { bg: 'linear-gradient(135deg, #ede9fe, #ddd6fe)', color: '#7c3aed', glow: '0 4px 14px rgba(124,58,237,0.35)' },
};

const DEFAULT_ICON_STYLE = { bg: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)', color: '#64748b', glow: '0 4px 14px rgba(100,116,139,0.20)' };

const getIconStyle = (path: string) => ICON_STYLE_MAP[path] || DEFAULT_ICON_STYLE;

const drawerWidth = 260;
const miniWidth = 72;

const getMenuItemsByRole = (role: string): MenuItem[] => {
  switch (role) {
    case 'admin':
      return [
        { text: 'Dashboard', icon: <HomeIcon />, path: '/admin/dashboard' },
        { text: 'Quản lý người dùng', icon: <PeopleIcon />, path: '/admin/users' },
        { text: 'Quản lý lớp học', icon: <ClassIcon />, path: '/admin/classes' },
        { text: 'Quản lý quảng cáo', icon: <CampaignIcon />, path: '/admin/advertisements' },
        { text: 'Đăng ký tư vấn', icon: <ListAltIcon />, path: '/admin/registrations' },
        { text: 'Quản lý Menu', icon: <MenuIcon />, path: '/admin/menu-management' },
        { text: 'Quản lý vai trò', icon: <SecurityIcon />, path: '/admin/roles-management' },
        { text: 'Thống kê', icon: <AssessmentIcon />, path: '/admin/statistics' },
        { text: 'Cảm nhận học viên', icon: <SchoolIcon />, path: '/admin/testimonials' },
        { text: 'Audit Logs', icon: <ListAltIcon />, path: '/admin/audit-log' },

      ];
    case 'teacher':
      return [
        { text: 'Dashboard', icon: <HomeIcon />, path: '/teacher/dashboard' },
        { text: 'Lịch dạy', icon: <ClassIcon />, path: '/teacher/schedule' },
        { text: 'Lớp học của tôi', icon: <SchoolIcon />, path: '/teacher/classes' },
        { text: 'Đề thi', icon: <ListAltIcon />, path: '/teacher/tests' },
        { text: 'Tài liệu', icon: <LibraryBooksIcon />, path: '/teacher/materials' },
        { text: 'Lương', icon: <PaymentIcon />, path: '/teacher/salary' },
      ];
    case 'student':
      return [
        { text: 'Dashboard', icon: <HomeIcon />, path: '/student/dashboard' },
        { text: 'Lịch học', icon: <ClassIcon />, path: '/student/schedule' },
        { text: 'Lớp học của tôi', icon: <SchoolIcon />, path: '/student/classes' },
        { text: 'Bài kiểm tra', icon: <ListAltIcon />, path: '/student/tests' },
        { text: 'Trợ lý AI', icon: <AiSparkleIcon size={22} />, path: '/student/chatbot' },
        { text: 'Tài liệu', icon: <LibraryBooksIcon />, path: '/student/materials' },
      ];
    case 'parent':
      return [
        { text: 'Dashboard', icon: <HomeIcon />, path: '/parent/dashboard' },
        { text: 'Con em', icon: <SchoolIcon />, path: '/parent/children' },
        { text: 'Thanh toán', icon: <PaymentIcon />, path: '/parent/payments' },
      ];
    default:
      return [
        { text: 'Trang chủ', icon: <HomeIcon />, path: '/' },
        { text: 'Khám phá', icon: <ExploreIcon />, path: '/explore' },
        { text: 'Kênh đăng ký', icon: <SubscriptionsIcon />, path: '/subscriptions' },
        { text: 'Thư viện', icon: <VideoLibraryIcon />, path: '/library' },
        { text: 'Lịch sử', icon: <HistoryIcon />, path: '/history' },
      ];
  }
};

// ─── Styled icon wrapper: chỉ active mới có nền màu + glow ───
const IconBubble: React.FC<{ path: string; isActive: boolean; children: React.ReactNode }> = ({ path, isActive, children }) => {
  const style = getIconStyle(path);
  return (
    <Box
      sx={{
        width: 38,
        height: 38,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // Active → nền màu gradient + glow | Inactive → nền xám nhạt
        background: isActive ? style.bg : 'linear-gradient(135deg, #f1f5f9, #e8ecf1)',
        boxShadow: isActive
          ? `${style.glow}, 0 2px 8px rgba(0,0,0,0.06)`
          : '0 1px 4px rgba(0,0,0,0.04)',
        color: isActive ? style.color : '#94a3b8',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isActive ? 'scale(1.08)' : 'scale(1)',
        '& .MuiSvgIcon-root': {
          fontSize: '1.2rem',
          color: isActive ? style.color : '#94a3b8',
          transition: 'color 0.3s ease',
        },
      }}
    >
      {children}
    </Box>
  );
};

interface SidebarProps {
  open: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ open }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { openSidebar, closeSidebar, isMobile } = useSidebar();
  const role = user?.role || 'student';
  const menuItems = getMenuItemsByRole(role);
  const [statsOpen, setStatsOpen] = useState<boolean>(location.pathname.startsWith('/admin/statistics'));
  const [usersOpen, setUsersOpen] = useState<boolean>(location.pathname.startsWith('/admin/users'));

  // Đóng sub-menu khi sidebar đóng
  React.useEffect(() => {
    if (!open) {
      setStatsOpen(false);
      setUsersOpen(false);
    }
  }, [open]);

  // Navigate and auto-close sidebar on mobile
  const handleNavigate = (path: string): void => {
    navigate(path);
    if (isMobile) {
      closeSidebar();
    }
  };

  // ─── Common menu-item button sx ───
  const getMenuButtonSx = () => ({
    minHeight: 48,
    justifyContent: open ? 'initial' : 'center',
    px: 2.5,
    borderRadius: 2.5,
    my: 0.5,
    mx: open ? 1 : 0.5,
    transition: 'all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1)',
    '&.Mui-selected': {
      background: 'linear-gradient(145deg, #f0f0ff, #e8e8f8)',
      boxShadow: '4px 4px 12px rgba(0,0,0,0.07), -2px -2px 8px rgba(255,255,255,0.9), inset 0 1px 0 rgba(255,255,255,0.6)',
      color: COLORS.primary.main,
      fontWeight: 600,
      '&:hover': {
        background: 'linear-gradient(145deg, #e6e6ff, #dcdcf5)',
        boxShadow: '5px 5px 15px rgba(0,0,0,0.09), -3px -3px 10px rgba(255,255,255,0.95)',
      },
    },
    '&:hover': {
      bgcolor: '#eef0ff',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 14px rgba(0,0,0,0.07)',
      '& .MuiListItemText-primary': {
        color: '#1e293b',
      },
    },
    '&:active': {
      transform: 'translateY(0px)',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    },
  });

  const drawerContent = (
    <Box sx={{ mt: 8 }}>
      <List>
        {menuItems.map((item) => {
          const isStatistics = item.path === '/admin/statistics';
          const isUsers = item.path === '/admin/users';

          if (!isStatistics && !isUsers) {
            const isSelected = location.pathname === item.path;
            return (
              <Tooltip key={item.text} title={!open ? item.text : ''} placement="right" arrow>
                <ListItem disablePadding sx={{ display: 'block' }}>
                  <ListItemButton
                    selected={isSelected}
                    onClick={() => handleNavigate(item.path)}
                    sx={getMenuButtonSx()}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: open ? 2 : 'auto',
                        justifyContent: 'center',
                      }}
                    >
                      <IconBubble path={item.path} isActive={isSelected}>
                        {item.icon}
                      </IconBubble>
                    </ListItemIcon>
                    {open && (
                      <ListItemText
                        primary={item.text}
                        sx={{
                          opacity: open ? 1 : 0,
                          '& .MuiListItemText-primary': {
                            fontWeight: isSelected ? 700 : 500,
                            fontSize: '0.9rem',
                            color: isSelected ? COLORS.primary.main : '#334155',
                          },
                        }}
                      />
                    )}
                  </ListItemButton>
                </ListItem>
              </Tooltip>
            );
          }

          // Users management item with expandable sub-menu
          if (isUsers) {
            const isSelected = location.pathname.startsWith('/admin/users');
            return (
              <Box key={item.text}>
                <ListItem disablePadding sx={{ display: 'block' }}>
                  <ListItemButton
                    selected={isSelected}
                    onClick={() => {
                      if (!open) {
                        openSidebar();
                      }
                      setUsersOpen((v) => !v);
                    }}
                    sx={getMenuButtonSx()}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: open ? 2 : 'auto',
                        justifyContent: 'center',
                      }}
                    >
                      <IconBubble path={item.path} isActive={isSelected}>
                        <PeopleIcon />
                      </IconBubble>
                    </ListItemIcon>
                    {open && (
                      <ListItemText
                        primary={item.text}
                        sx={{
                          opacity: open ? 1 : 0,
                          mr: 2,
                          '& .MuiListItemText-primary': {
                            fontWeight: isSelected ? 700 : 500,
                            fontSize: '0.9rem',
                            color: isSelected ? COLORS.primary.main : '#334155',
                          },
                        }}
                      />
                    )}
                    {open && (usersOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />)}
                  </ListItemButton>
                </ListItem>
                {usersOpen && (
                  <List component="div" disablePadding sx={{ pl: open ? 4 : 0 }}>
                    <ListItemButton
                      selected={location.pathname === '/admin/users/students'}
                      onClick={() => {
                        if (!open) { openSidebar(); }
                        handleNavigate('/admin/users/students');
                      }}
                      sx={{
                        minHeight: 40,
                        justifyContent: open ? 'initial' : 'center',
                        px: 2.5,
                        borderRadius: 2,
                        ml: open ? 2 : 0,
                        my: 0.25
                      }}
                    >
                      {open && <ListItemText primary="Học viên" />}
                    </ListItemButton>
                    <ListItemButton
                      selected={location.pathname === '/admin/users/teachers'}
                      onClick={() => {
                        if (!open) { openSidebar(); }
                        handleNavigate('/admin/users/teachers');
                      }}
                      sx={{
                        minHeight: 40,
                        justifyContent: open ? 'initial' : 'center',
                        px: 2.5,
                        borderRadius: 2,
                        ml: open ? 2 : 0,
                        my: 0.25
                      }}
                    >
                      {open && <ListItemText primary="Giáo viên" />}
                    </ListItemButton>
                    <ListItemButton
                      selected={location.pathname === '/admin/users/parents'}
                      onClick={() => {
                        if (!open) { openSidebar(); }
                        handleNavigate('/admin/users/parents');
                      }}
                      sx={{
                        minHeight: 40,
                        justifyContent: open ? 'initial' : 'center',
                        px: 2.5,
                        borderRadius: 2,
                        ml: open ? 2 : 0,
                        my: 0.25
                      }}
                    >
                      {open && <ListItemText primary="Phụ huynh" />}
                    </ListItemButton>
                  </List>
                )}
              </Box>
            );
          }

          // Statistics item with expandable sub-menu
          const isSelected = location.pathname.startsWith('/admin/statistics');
          return (
            <Box key={item.text}>
              <ListItem disablePadding sx={{ display: 'block' }}>
                <ListItemButton
                  selected={isSelected}
                  onClick={() => {
                    if (!open) {
                      openSidebar();
                    }
                    setStatsOpen((v) => !v);
                  }}
                  sx={getMenuButtonSx()}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 2 : 'auto',
                      justifyContent: 'center',
                    }}
                  >
                    <IconBubble path={item.path} isActive={isSelected}>
                      <AssessmentIcon />
                    </IconBubble>
                  </ListItemIcon>
                  {open && (
                    <ListItemText
                      primary={item.text}
                      sx={{
                        opacity: open ? 1 : 0,
                        mr: 2,
                        '& .MuiListItemText-primary': {
                          fontWeight: isSelected ? 700 : 500,
                          fontSize: '0.9rem',
                          color: isSelected ? COLORS.primary.main : '#334155',
                        },
                      }}
                    />
                  )}
                  {open && (statsOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />)}
                </ListItemButton>
              </ListItem>
              {statsOpen && (
                <List component="div" disablePadding sx={{ pl: open ? 4 : 0 }}>
                  <ListItemButton
                    selected={location.pathname === '/admin/statistics/financial'}
                    onClick={() => {
                      if (!open) { openSidebar(); }
                      handleNavigate('/admin/statistics/financial');
                    }}
                    sx={{
                      minHeight: 40,
                      justifyContent: open ? 'initial' : 'center',
                      px: 2.5,
                      borderRadius: 2,
                      ml: open ? 2 : 0,
                      my: 0.25
                    }}
                  >
                    {open && <ListItemText primary="Thống kê tài chính" />}
                  </ListItemButton>
                  <ListItemButton
                    selected={location.pathname === '/admin/statistics/students'}
                    onClick={() => {
                      if (!open) { openSidebar(); }
                      handleNavigate('/admin/statistics/students');
                    }}
                    sx={{
                      minHeight: 40,
                      justifyContent: open ? 'initial' : 'center',
                      px: 2.5,
                      borderRadius: 2,
                      ml: open ? 2 : 0,
                      my: 0.25
                    }}
                  >
                    {open && <ListItemText primary="Thống kê học sinh" />}
                  </ListItemButton>
                </List>
              )}
            </Box>
          );
        })}
      </List>
    </Box>
  );

  // Mobile: temporary drawer (overlay)
  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={open}
        onClose={closeSidebar}
        ModalProps={{ keepMounted: true }} // Better mobile performance
        sx={{
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            bgcolor: '#fff',
            borderRight: '1px solid #eee',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  // Desktop: permanent drawer (collapsible)
  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: open ? drawerWidth : miniWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '& .MuiDrawer-paper': {
          width: open ? drawerWidth : miniWidth,
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflowX: 'hidden',
          bgcolor: '#fff',
          borderRight: '1px solid #eee',
        },
      }}
    >
      {drawerContent}
      <Divider />
    </Drawer>
  );
};
export default Sidebar;
