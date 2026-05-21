import React, { useState } from 'react';
import {
  Drawer, List, ListItem, ListItemIcon, ListItemText, ListItemButton,
  Divider, Tooltip, Box, Typography, Collapse,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ExploreIcon from '@mui/icons-material/Explore';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import HistoryIcon from '@mui/icons-material/History';
import SchoolIcon from '@mui/icons-material/School';
import ClassIcon from '@mui/icons-material/Class';
import CampaignIcon from '@mui/icons-material/Campaign';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PaymentIcon from '@mui/icons-material/Payment';
import PeopleIcon from '@mui/icons-material/People';
import MenuIcon from '@mui/icons-material/Menu';
import SecurityIcon from '@mui/icons-material/Security';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import MicIcon from '@mui/icons-material/Mic';
import HearingIcon from '@mui/icons-material/Hearing';
import AiSparkleIcon from '../icons/AiSparkleIcon';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSidebar } from '../../contexts/SidebarContext';

// ─── Design Tokens ───
const NAVY = '#1e3a8a';
const NAVY_LIGHT = '#3b82f6';

interface MenuItem {
  text: string;
  icon: React.ReactElement;
  path: string;
  group?: string;
}

const drawerWidth = 264;
const miniWidth = 72;

// ─── Menu items by role ───
const getMenuItemsByRole = (role: string): MenuItem[] => {
  switch (role) {
    case 'admin':
      return [
        { text: 'Dashboard', icon: <HomeIcon />, path: '/admin/dashboard', group: 'TỔNG QUAN' },
        { text: 'Quản lý người dùng', icon: <PeopleIcon />, path: '/admin/users', group: 'QUẢN LÝ' },
        { text: 'Quản lý lớp học', icon: <ClassIcon />, path: '/admin/classes' },
        { text: 'Điểm danh', icon: <FactCheckIcon />, path: '/admin/attendance' },
        { text: 'Quản lý quảng cáo', icon: <CampaignIcon />, path: '/admin/advertisements' },
        { text: 'Đăng ký tư vấn', icon: <ListAltIcon />, path: '/admin/registrations' },
        { text: 'Quản lý Menu', icon: <MenuIcon />, path: '/admin/menu-management', group: 'HỆ THỐNG' },
        { text: 'Quản lý vai trò', icon: <SecurityIcon />, path: '/admin/roles-management' },
        { text: 'Thống kê', icon: <AssessmentIcon />, path: '/admin/statistics', group: 'BÁO CÁO' },
        { text: 'Cảm nhận học viên', icon: <SchoolIcon />, path: '/admin/testimonials' },
        { text: 'Audit Logs', icon: <ListAltIcon />, path: '/admin/audit-log' },
      ];
    case 'teacher':
      return [
        { text: 'Dashboard', icon: <HomeIcon />, path: '/teacher/dashboard', group: 'TỔNG QUAN' },
        { text: 'Lịch dạy', icon: <ClassIcon />, path: '/teacher/schedule', group: 'GIẢNG DẠY' },
        { text: 'Lớp học của tôi', icon: <SchoolIcon />, path: '/teacher/classes' },
        { text: 'Đề thi', icon: <ListAltIcon />, path: '/teacher/tests' },
        { text: 'Tài liệu', icon: <LibraryBooksIcon />, path: '/teacher/materials' },
        { text: 'Lương', icon: <PaymentIcon />, path: '/teacher/salary', group: 'CÁ NHÂN' },
      ];
    case 'student':
      return [
        { text: 'Dashboard', icon: <HomeIcon />, path: '/student/dashboard', group: 'TỔNG QUAN' },
        { text: 'Lịch học', icon: <ClassIcon />, path: '/student/schedule', group: 'HỌC TẬP' },
        { text: 'Lớp học của tôi', icon: <SchoolIcon />, path: '/student/classes' },
        { text: 'Bài kiểm tra', icon: <ListAltIcon />, path: '/student/tests' },
        { text: 'Trợ lý AI', icon: <AiSparkleIcon size={20} />, path: '/student/chatbot', group: 'LUYỆN TẬP' },
        { text: 'Luyện phát âm', icon: <MicIcon />, path: '/student/pronunciation' },
        { text: 'Luyện chính tả', icon: <HearingIcon />, path: '/student/dictation' },
        { text: 'Tài liệu', icon: <LibraryBooksIcon />, path: '/student/materials', group: 'TÀI NGUYÊN' },
      ];
    case 'parent':
      return [
        { text: 'Dashboard', icon: <HomeIcon />, path: '/parent/dashboard', group: 'TỔNG QUAN' },
        { text: 'Con em', icon: <SchoolIcon />, path: '/parent/children', group: 'QUẢN LÝ' },
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

// ─── Group label ───
const GroupLabel: React.FC<{ label: string; open: boolean; first?: boolean }> = ({ label, open, first }) => {
  if (!open) return <Divider sx={{ my: 1.2, mx: 2, borderColor: 'rgba(30, 58, 138, 0.06)' }} />;
  return (
    <Box sx={{ pt: first ? 0.5 : 2.2, pb: 0.8, px: 2.5 }}>
      <Typography
        variant="overline"
        sx={{
          fontSize: '0.6rem',
          fontWeight: 700,
          letterSpacing: '1.5px',
          color: '#94a3b8',
          lineHeight: 1,
        }}
      >
        {label}
      </Typography>
    </Box>
  );
};

// ─── Sub-menu item ───
const SubMenuItem: React.FC<{
  label: string;
  path: string;
  open: boolean;
  isSelected: boolean;
  onClick: () => void;
}> = ({ label, open, isSelected, onClick }) => (
  <ListItemButton
    selected={isSelected}
    onClick={onClick}
    sx={{
      minHeight: 36,
      justifyContent: open ? 'initial' : 'center',
      pl: open ? 6 : 2.5,
      pr: 2,
      borderRadius: '10px',
      mx: 1.5,
      my: 0.15,
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      bgcolor: isSelected ? `rgba(30, 58, 138, 0.06)` : 'transparent',
      '&:hover': {
        bgcolor: isSelected ? 'rgba(30, 58, 138, 0.08)' : 'rgba(0, 0, 0, 0.025)',
      },
      '& .MuiListItemText-primary': {
        fontSize: '0.8rem',
        fontWeight: isSelected ? 600 : 400,
        color: isSelected ? NAVY : '#64748b',
        transition: 'all 0.2s ease',
      },
      // Dot indicator
      '&::before': {
        content: '""',
        position: 'absolute',
        left: open ? 20 : 'auto',
        top: '50%',
        transform: 'translateY(-50%)',
        width: isSelected ? 5 : 4,
        height: isSelected ? 5 : 4,
        borderRadius: '50%',
        bgcolor: isSelected ? NAVY_LIGHT : '#cbd5e1',
        transition: 'all 0.25s ease',
      },
    }}
  >
    {open && <ListItemText primary={label} />}
  </ListItemButton>
);

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

  React.useEffect(() => {
    if (!open) {
      setStatsOpen(false);
      setUsersOpen(false);
    }
  }, [open]);

  const handleNavigate = (path: string): void => {
    navigate(path);
    if (isMobile) closeSidebar();
  };

  // ─── Render a single menu item ───
  const renderMenuItem = (item: MenuItem, isSelected: boolean) => (
    <ListItemButton
      selected={isSelected}
      onClick={() => handleNavigate(item.path)}
      sx={{
        minHeight: 44,
        justifyContent: open ? 'initial' : 'center',
        px: open ? 2 : 1.5,
        borderRadius: '12px',
        mx: 1.5,
        my: 0.3,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        // Override MUI default pink/red Mui-selected background
        '&.Mui-selected': {
          background: 'rgba(30, 58, 138, 0.07)',
          '&:hover': { background: 'rgba(30, 58, 138, 0.10)' },
        },
        background: isSelected ? 'rgba(30, 58, 138, 0.07)' : 'transparent',
        boxShadow: isSelected
          ? 'inset 0 1px 0 rgba(255,255,255,0.6)'
          : 'none',
        // ── Active left accent ──
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: '8%',
          height: '84%',
          width: isSelected ? 4 : 0,
          borderRadius: '0 4px 4px 0',
          bgcolor: NAVY,
          transition: 'width 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        },
        // ── Hover glow ──
        '&:hover': {
          background: isSelected ? 'rgba(30, 58, 138, 0.10)' : 'rgba(30, 58, 138, 0.035)',
          transform: 'translateX(2px)',
          '&::before': {
            width: isSelected ? 4 : 2,
            bgcolor: isSelected ? NAVY : '#cbd5e1',
          },
          '& .sidebar-icon': {
            color: isSelected ? NAVY : '#475569',
            transform: 'scale(1.08)',
          },
          '& .MuiListItemText-primary': {
            color: isSelected ? NAVY : '#1e293b',
          },
        },
        '&:active': {
          transform: 'translateX(1px) scale(0.99)',
        },
      }}
    >
      <ListItemIcon
        className="sidebar-icon"
        sx={{
          minWidth: 0,
          mr: open ? 1.5 : 'auto',
          justifyContent: 'center',
          color: isSelected ? NAVY : '#64748b',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          '& .MuiSvgIcon-root': {
            fontSize: '1.2rem',
          },
        }}
      >
        {item.icon}
      </ListItemIcon>
      {open && (
        <ListItemText
          primary={item.text}
          sx={{
            '& .MuiListItemText-primary': {
              fontWeight: isSelected ? 650 : 450,
              fontSize: '0.855rem',
              color: isSelected ? '#0f172a' : '#475569',
              letterSpacing: '-0.15px',
              transition: 'all 0.2s ease',
            },
          }}
        />
      )}
    </ListItemButton>
  );

  // ─── Render expandable menu item ───
  const renderExpandable = (
    item: MenuItem,
    isSelected: boolean,
    isExpanded: boolean,
    toggle: () => void,
    children: { label: string; path: string }[],
  ) => (
    <>
      <ListItem disablePadding sx={{ display: 'block' }}>
        <ListItemButton
          selected={isSelected}
          onClick={() => {
            if (!open) openSidebar();
            toggle();
          }}
          sx={{
            minHeight: 44,
            justifyContent: open ? 'initial' : 'center',
            px: open ? 2 : 1.5,
            borderRadius: '12px',
            mx: 1.5,
            my: 0.3,
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            '&.Mui-selected': {
              background: 'rgba(30, 58, 138, 0.07)',
              '&:hover': { background: 'rgba(30, 58, 138, 0.10)' },
            },
            background: isSelected ? 'rgba(30, 58, 138, 0.07)' : 'transparent',
            boxShadow: isSelected ? 'inset 0 1px 0 rgba(255,255,255,0.6)' : 'none',
            '&::before': {
              content: '""',
              position: 'absolute',
              left: 0,
              top: '8%',
              height: '84%',
              width: isSelected ? 4 : 0,
              borderRadius: '0 4px 4px 0',
              bgcolor: NAVY,
              transition: 'width 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            },
            '&:hover': {
              background: isSelected ? 'rgba(30, 58, 138, 0.10)' : 'rgba(30, 58, 138, 0.035)',
              transform: 'translateX(2px)',
              '&::before': {
                width: isSelected ? 4 : 2,
                bgcolor: isSelected ? NAVY : '#cbd5e1',
              },
              '& .sidebar-icon': {
                color: isSelected ? NAVY : '#475569',
                transform: 'scale(1.08)',
              },
            },
          }}
        >
          <ListItemIcon
            className="sidebar-icon"
            sx={{
              minWidth: 0,
              mr: open ? 1.5 : 'auto',
              justifyContent: 'center',
              color: isSelected ? NAVY : '#64748b',
              transition: 'all 0.25s ease',
              '& .MuiSvgIcon-root': { fontSize: '1.2rem' },
            }}
          >
            {item.icon}
          </ListItemIcon>
          {open && (
            <ListItemText
              primary={item.text}
              sx={{
                mr: 0.5,
                '& .MuiListItemText-primary': {
                  fontWeight: isSelected ? 650 : 450,
                  fontSize: '0.855rem',
                  color: isSelected ? '#0f172a' : '#475569',
                  letterSpacing: '-0.15px',
                },
              }}
            />
          )}
          {open && (
            <ExpandMoreIcon
              sx={{
                fontSize: 17,
                color: '#94a3b8',
                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
              }}
            />
          )}
        </ListItemButton>
      </ListItem>
      <Collapse in={isExpanded && open} timeout={250} unmountOnExit>
        <Box
          sx={{
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              left: 34,
              top: 4,
              bottom: 4,
              width: 1.5,
              borderRadius: 1,
              bgcolor: 'rgba(30, 58, 138, 0.06)',
            },
          }}
        >
          <List component="div" disablePadding sx={{ py: 0.5 }}>
            {children.map((sub) => (
              <SubMenuItem
                key={sub.path}
                label={sub.label}
                path={sub.path}
                open={open}
                isSelected={location.pathname === sub.path}
                onClick={() => handleNavigate(sub.path)}
              />
            ))}
          </List>
        </Box>
      </Collapse>
    </>
  );

  let isFirstGroup = true;
  const drawerContent = (
    <Box sx={{ mt: 8, pb: 3 }}>
      <List disablePadding>
        {menuItems.map((item) => {
          const isStatistics = item.path === '/admin/statistics';
          const isUsers = item.path === '/admin/users';

          // Group label
          let groupEl: React.ReactNode = null;
          if (item.group) {
            groupEl = <GroupLabel key={`g-${item.group}`} label={item.group} open={open} first={isFirstGroup} />;
            isFirstGroup = false;
          }

          // ─── Normal item ───
          if (!isStatistics && !isUsers) {
            const isSelected = location.pathname === item.path;
            return (
              <React.Fragment key={item.text}>
                {groupEl}
                <Tooltip title={!open ? item.text : ''} placement="right" arrow>
                  <ListItem disablePadding sx={{ display: 'block' }}>
                    {renderMenuItem(item, isSelected)}
                  </ListItem>
                </Tooltip>
              </React.Fragment>
            );
          }

          // ─── Users expandable ───
          if (isUsers) {
            return (
              <React.Fragment key={item.text}>
                {groupEl}
                {renderExpandable(
                  item,
                  location.pathname.startsWith('/admin/users'),
                  usersOpen,
                  () => setUsersOpen((v) => !v),
                  [
                    { label: 'Học viên', path: '/admin/users/students' },
                    { label: 'Giáo viên', path: '/admin/users/teachers' },
                    { label: 'Phụ huynh', path: '/admin/users/parents' },
                  ],
                )}
              </React.Fragment>
            );
          }

          // ─── Statistics expandable ───
          return (
            <React.Fragment key={item.text}>
              {groupEl}
              {renderExpandable(
                item,
                location.pathname.startsWith('/admin/statistics'),
                statsOpen,
                () => setStatsOpen((v) => !v),
                [
                  { label: 'Thống kê tài chính', path: '/admin/statistics/financial' },
                  { label: 'Thống kê học sinh', path: '/admin/statistics/students' },
                ],
              )}
            </React.Fragment>
          );
        })}
      </List>
    </Box>
  );

  // ─── Drawer paper ───
  const drawerPaperSx = {
    width: open ? drawerWidth : miniWidth,
    transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    overflowX: 'hidden' as const,
    bgcolor: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(16px) saturate(180%)',
    WebkitBackdropFilter: 'blur(16px) saturate(180%)',
    borderRight: '1px solid rgba(30, 58, 138, 0.06)',
    boxShadow: '4px 0 24px rgba(0, 0, 0, 0.02)',
    // Subtle top-to-bottom gradient overlay
    backgroundImage: open
      ? 'linear-gradient(180deg, rgba(248, 250, 252, 0.9) 0%, rgba(241, 245, 249, 0.5) 100%)'
      : 'none',
  };

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={open}
        onClose={closeSidebar}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': { ...drawerPaperSx, width: drawerWidth },
          '& .MuiBackdrop-root': { backdropFilter: 'blur(4px)' },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

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
        '& .MuiDrawer-paper': drawerPaperSx,
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
