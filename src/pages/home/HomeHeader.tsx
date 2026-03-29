import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Avatar,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Dashboard as DashboardIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  KeyboardArrowRight as ArrowRightIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { NavigationMenuItem } from '../../types';
import logoTMix from '../../assets/logo_tmix.png';

// ── Static menu ───────────────────────────────────────────────────────────────
const PUBLIC_MENU: NavigationMenuItem[] = [
  { id: 'pub-1', title: 'Về chúng tôi', slug: '/ve-chung-toi', order: 1, isActive: true, childrenMenu: [] },
  { id: 'pub-2', title: 'Giáo viên',    slug: '/giao-vien',    order: 2, isActive: true, childrenMenu: [] },
  { id: 'pub-3', title: 'Các khóa học', slug: '/cac-khoa-hoc', order: 3, isActive: true, childrenMenu: [] },
  { id: 'pub-4', title: 'Đánh giá',     slug: '/danh-gia',     order: 4, isActive: true, childrenMenu: [] },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const BRAND = {
  navy:  '#1E3A5F',
  red:   '#D32F2F',
  blue:  '#3D7CC9',
};

const HomeHeader: React.FC = () => {
  const navigate   = useNavigate();
  const location   = useLocation();
  const theme      = useTheme();
  const isMobile   = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout } = useAuth();

  const [scrolled,       setScrolled]       = useState(false);
  const [drawerOpen,     setDrawerOpen]     = useState(false);
  const [avatarAnchor,   setAvatarAnchor]   = useState<HTMLElement | null>(null);
  const [hoveredId,      setHoveredId]      = useState<string | null>(null);

  const menuItems = PUBLIC_MENU.filter(m => m.isActive).sort((a, b) => (a.order || 0) - (b.order || 0));

  // ── Scroll detection ────────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Navigation ──────────────────────────────────────────────────────────────
  const goTo = (slug?: string) => {
    if (slug) navigate(slug.startsWith('/') ? slug : `/${slug}`);
    setDrawerOpen(false);
  };

  // ── Active detection ────────────────────────────────────────────────────────
  const isActive = (slug?: string) =>
    slug ? location.pathname === slug : false;

  // ── Auth handlers ───────────────────────────────────────────────────────────
  const handleDashboard   = () => { navigate(`/${user?.role}/dashboard`); setAvatarAnchor(null); };
  const handleProfile     = () => {
    const map: Record<string, string> = { admin: '/admin/profile', teacher: '/teacher/profile', student: '/student/profile', parent: '/parent/profile' };
    navigate(map[user?.role ?? ''] ?? '/profile');
    setAvatarAnchor(null);
  };
  const handleLogout      = () => { logout(); navigate('/'); setAvatarAnchor(null); };

  // ────────────────────────────────────────────────────────────────────────────
  //  RENDER
  // ────────────────────────────────────────────────────────────────────────────
  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: scrolled ? 'rgba(255,255,255,0.82)' : 'rgba(255,255,255,1)',
          backdropFilter: scrolled ? 'blur(22px) saturate(180%)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(22px) saturate(180%)' : 'none',
          borderBottom: scrolled
            ? '1px solid rgba(30,58,95,0.08)'
            : '1px solid transparent',
          boxShadow: scrolled ? '0 4px 24px rgba(30,58,95,0.06)' : 'none',
          transition: 'background-color 0.4s ease, backdrop-filter 0.4s ease, box-shadow 0.4s ease, border-color 0.4s ease',
          zIndex: theme.zIndex.drawer + 10,
        }}
      >
        <Toolbar
          sx={{
            minHeight: { xs: 64, md: 72 },
            px: { xs: 2, md: 4 },
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          {/* ── Logo ── */}
          <Box
            onClick={() => navigate('/')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              flexShrink: 0,
              '&:hover .logo-img': { transform: 'scale(1.06) rotate(-2deg)' },
              '&:hover .logo-text': { letterSpacing: '0.02em' },
            }}
          >
            <Box
              component="img"
              src={logoTMix}
              alt="TMix"
              className="logo-img"
              sx={{
                height: { xs: 38, md: 44 },
                width: 'auto',
                mixBlendMode: 'multiply',
                transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)',
              }}
            />
            <Typography
              className="logo-text"
              variant="h6"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '1rem', md: '1.18rem' },
                letterSpacing: '-0.01em',
                lineHeight: 1,
                transition: 'letter-spacing 0.3s ease',
                userSelect: 'none',
              }}
            >
              <span style={{ color: BRAND.red }}>TMix</span>
              {' '}
              <span style={{ color: BRAND.navy }}>Education</span>
            </Typography>
          </Box>

          {/* ── Desktop Nav ── */}
          {!isMobile && (
            <Box
              component="nav"
              sx={{
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              {menuItems.map((item) => {
                const active  = isActive(item.slug);
                const hovered = hoveredId === item.id;

                return (
                  <Box
                    key={item.id}
                    onMouseEnter={() => setHoveredId(item.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => goTo(item.slug)}
                    sx={{
                      position: 'relative',
                      px: 2.2,
                      py: 1,
                      cursor: 'pointer',
                      borderRadius: '50px',
                      bgcolor: active
                        ? 'rgba(30,58,95,0.09)'
                        : hovered
                        ? 'rgba(30,58,95,0.06)'
                        : 'transparent',
                      border: active
                        ? '1.5px solid rgba(30,58,95,0.2)'
                        : hovered
                        ? '1.5px solid rgba(30,58,95,0.1)'
                        : '1.5px solid transparent',
                      transition: 'background-color 0.22s ease, border-color 0.22s ease',
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: active ? 700 : hovered ? 700 : 600,
                        fontSize: '0.98rem',
                        letterSpacing: active ? '0.015em' : hovered ? '0.005em' : 0,
                        // Elite hover micro-lift
                        transform: hovered && !active ? 'scale(1.02)' : 'scale(1)',
                        transformOrigin: 'center',
                        display: 'block',
                        // Gradient text when active; color shift on hover
                        ...(active
                          ? {
                              background: `linear-gradient(110deg, ${BRAND.navy} 10%, ${BRAND.red} 100%)`,
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                            }
                          : {
                              color: hovered ? BRAND.blue : '#1A2B45',
                            }),
                        transition:
                          'color 0.22s ease, font-weight 0.15s ease, letter-spacing 0.22s ease, transform 0.22s cubic-bezier(0.34,1.4,0.64,1)',
                        userSelect: 'none',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.title}
                    </Typography>

                    {/* ─── Slide-in underline ─── */}
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 3,
                        left: '50%',
                        height: '2.5px',
                        borderRadius: '3px',
                        background: active
                          ? `linear-gradient(90deg, ${BRAND.navy}, ${BRAND.red})`
                          : `linear-gradient(90deg, ${BRAND.blue}, ${BRAND.navy})`,
                        transform: (active || hovered)
                          ? 'translateX(-50%) scaleX(1)'
                          : 'translateX(-50%) scaleX(0)',
                        width: '68%',
                        transformOrigin: 'center',
                        transition: 'transform 0.28s cubic-bezier(0.34,1.2,0.64,1), background 0.22s ease',
                      }}
                    />
                  </Box>
                );
              })}
            </Box>
          )}

          {/* ── Right Controls ── */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0, ml: 'auto' }}>
            {/* Desktop user controls */}
            {!isMobile && (
              user ? (
                <>
                  <Box
                    onClick={(e) => setAvatarAnchor(e.currentTarget)}
                    sx={{
                      position: 'relative',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      px: 1.5,
                      py: 0.7,
                      borderRadius: '50px',
                      border: '1.5px solid rgba(30,58,95,0.12)',
                      transition: 'all 0.25s ease',
                      '&:hover': {
                        bgcolor: 'rgba(30,58,95,0.04)',
                        borderColor: 'rgba(30,58,95,0.22)',
                        boxShadow: '0 2px 12px rgba(30,58,95,0.1)',
                      },
                    }}
                  >
                    <Avatar
                      src={user.avatar}
                      alt={user.name || user.username}
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: BRAND.navy,
                        fontSize: 14,
                        fontWeight: 700,
                        border: '2px solid rgba(255,255,255,0.9)',
                        boxShadow: '0 2px 8px rgba(30,58,95,0.2)',
                      }}
                    >
                      {!user.avatar && (user.name?.charAt(0) || user.username?.charAt(0) || '?')}
                    </Avatar>
                    <Typography
                      sx={{
                        fontSize: '0.88rem',
                        fontWeight: 600,
                        color: BRAND.navy,
                        maxWidth: 90,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {user.name || user.username}
                    </Typography>
                  </Box>
                  <Menu
                    anchorEl={avatarAnchor}
                    open={Boolean(avatarAnchor)}
                    onClose={() => setAvatarAnchor(null)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    PaperProps={{
                      sx: {
                        mt: 1.5,
                        borderRadius: '16px',
                        minWidth: 200,
                        boxShadow: '0 8px 40px rgba(30,58,95,0.14)',
                        border: '1px solid rgba(30,58,95,0.08)',
                        overflow: 'hidden',
                        '& .MuiMenuItem-root': {
                          px: 2.5,
                          py: 1.2,
                          fontSize: '0.92rem',
                          fontWeight: 500,
                          gap: 1.5,
                          borderRadius: '8px',
                          mx: 1,
                          my: 0.3,
                          transition: 'background-color 0.2s ease',
                          '&:hover': { bgcolor: 'rgba(30,58,95,0.06)' },
                        },
                      },
                    }}
                  >
                    <Box sx={{ px: 2.5, pt: 1.5, pb: 1 }}>
                      <Typography sx={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 500 }}>Đăng nhập với vai trò</Typography>
                      <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: BRAND.navy, mt: 0.2 }}>{user.name || user.username}</Typography>
                    </Box>
                    <Divider sx={{ mx: 2, mb: 0.5 }} />
                    <MenuItem onClick={handleDashboard}><DashboardIcon fontSize="small" sx={{ color: BRAND.navy }} />Dashboard</MenuItem>
                    <MenuItem onClick={handleProfile}><AccountCircleIcon fontSize="small" sx={{ color: BRAND.navy }} />Trang cá nhân</MenuItem>
                    <Divider sx={{ mx: 2, my: 0.5 }} />
                    <MenuItem onClick={handleLogout} sx={{ color: BRAND.red + ' !important', '& svg': { color: BRAND.red } }}>
                      <LogoutIcon fontSize="small" />Đăng xuất
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Box
                  onClick={() => navigate('/login')}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.8,
                    px: 2.5,
                    py: 1,
                    borderRadius: '50px',
                    background: `linear-gradient(135deg, ${BRAND.navy} 0%, ${BRAND.blue} 100%)`,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(30,58,95,0.25)',
                    transition: 'all 0.3s cubic-bezier(0.34,1.2,0.64,1)',
                    '&:hover': {
                      transform: 'translateY(-2px) scale(1.03)',
                      boxShadow: '0 8px 22px rgba(30,58,95,0.3)',
                    },
                    '&:active': { transform: 'translateY(0) scale(0.98)' },
                  }}
                >
                  <PersonIcon sx={{ fontSize: 18, color: '#fff' }} />
                  <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', userSelect: 'none' }}>
                    Đăng nhập
                  </Typography>
                </Box>
              )
            )}

            {/* Mobile hamburger */}
            {isMobile && (
              <IconButton
                onClick={() => setDrawerOpen(true)}
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: '12px',
                  border: '1.5px solid rgba(30,58,95,0.12)',
                  color: BRAND.navy,
                  transition: 'all 0.25s ease',
                  '&:hover': { bgcolor: 'rgba(30,58,95,0.05)', borderColor: 'rgba(30,58,95,0.22)' },
                }}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* ── Mobile Premium Drawer ───────────────────────────────────────────── */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '82vw', sm: 340 },
            background: 'rgba(255,255,255,0.97)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            boxShadow: '-8px 0 48px rgba(30,58,95,0.12)',
            borderRadius: '20px 0 0 20px',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
        slotProps={{
          backdrop: {
            sx: {
              backdropFilter: 'blur(4px)',
              backgroundColor: 'rgba(0,0,0,0.25)',
            },
          },
        }}
      >
        {/* Drawer Header */}
        <Box
          sx={{
            px: 3,
            pt: 3,
            pb: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid rgba(30,58,95,0.07)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              component="img"
              src={logoTMix}
              alt="TMix"
              sx={{ height: 36, mixBlendMode: 'multiply' }}
            />
            <Typography sx={{ fontWeight: 800, fontSize: '1.05rem' }}>
              <span style={{ color: BRAND.red }}>TMix</span>{' '}
              <span style={{ color: BRAND.navy }}>Education</span>
            </Typography>
          </Box>
          <IconButton
            onClick={() => setDrawerOpen(false)}
            size="small"
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              border: '1.5px solid rgba(30,58,95,0.10)',
              color: '#64748B',
              transition: 'all 0.2s ease',
              '&:hover': { bgcolor: 'rgba(211,47,47,0.07)', borderColor: BRAND.red, color: BRAND.red },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Nav Links */}
        <List sx={{ px: 2, pt: 2, flex: 1 }}>
          {menuItems.map((item, idx) => {
            const active = isActive(item.slug);
            return (
              <ListItemButton
                key={item.id}
                onClick={() => goTo(item.slug)}
                sx={{
                  borderRadius: '14px',
                  mb: 0.5,
                  px: 2.5,
                  py: 1.4,
                  overflow: 'hidden',
                  position: 'relative',
                  bgcolor: active ? 'rgba(30,58,95,0.07)' : 'transparent',
                  border: active ? '1.5px solid rgba(30,58,95,0.12)' : '1.5px solid transparent',
                  transition: 'all 0.22s ease',
                  // Slide-in animation stagger
                  animation: drawerOpen ? `slideInRight 0.35s cubic-bezier(0.34,1.1,0.64,1) ${idx * 0.06 + 0.1}s both` : 'none',
                  '@keyframes slideInRight': {
                    from: { opacity: 0, transform: 'translateX(24px)' },
                    to:   { opacity: 1, transform: 'translateX(0)' },
                  },
                  '&:hover': {
                    bgcolor: active ? 'rgba(30,58,95,0.1)' : 'rgba(30,58,95,0.05)',
                    borderColor: 'rgba(30,58,95,0.14)',
                    '& .nav-arrow': { opacity: 1, transform: 'translateX(0)' },
                  },
                  // Left accent bar
                  '&::before': active ? {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: '20%',
                    height: '60%',
                    width: '3px',
                    borderRadius: '0 3px 3px 0',
                    background: `linear-gradient(180deg, ${BRAND.red}, ${BRAND.navy})`,
                  } : {},
                }}
              >
                <ListItemText
                  primary={item.title}
                  primaryTypographyProps={{
                    sx: {
                      fontWeight: active ? 700 : 500,
                      fontSize: '1rem',
                      ...(active
                        ? {
                            background: `linear-gradient(100deg, ${BRAND.navy}, ${BRAND.red})`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                          }
                        : { color: '#374151' }),
                    },
                  }}
                />
                <ArrowRightIcon
                  className="nav-arrow"
                  sx={{
                    fontSize: 18,
                    color: BRAND.blue,
                    opacity: active ? 0.8 : 0,
                    transform: active ? 'translateX(0)' : 'translateX(-6px)',
                    transition: 'all 0.22s ease',
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>

        {/* Drawer Footer – auth section */}
        <Box
          sx={{
            px: 2,
            pb: 3,
            pt: 1,
            borderTop: '1px solid rgba(30,58,95,0.07)',
          }}
        >
          {user ? (
            <>
              {/* User info chip */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 2,
                  py: 1.5,
                  bgcolor: 'rgba(30,58,95,0.04)',
                  borderRadius: '14px',
                  mb: 1.5,
                  border: '1.5px solid rgba(30,58,95,0.07)',
                }}
              >
                <Avatar
                  src={user.avatar}
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: BRAND.navy,
                    fontSize: 16,
                    fontWeight: 700,
                    border: '2px solid #fff',
                    boxShadow: '0 2px 8px rgba(30,58,95,0.2)',
                  }}
                >
                  {!user.avatar && (user.name?.charAt(0) || user.username?.charAt(0) || '?')}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: BRAND.navy, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.name || user.username}
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 500, textTransform: 'capitalize' }}>
                    {user.role}
                  </Typography>
                </Box>
              </Box>
              <List disablePadding>
                {[
                  { label: 'Dashboard',    icon: <DashboardIcon fontSize="small" />,   action: handleDashboard,                  color: BRAND.navy },
                  { label: 'Trang cá nhân', icon: <AccountCircleIcon fontSize="small" />, action: handleProfile,   color: BRAND.navy },
                  { label: 'Đăng xuất',   icon: <LogoutIcon fontSize="small" />,      action: handleLogout,                     color: BRAND.red  },
                ].map((item) => (
                  <ListItemButton
                    key={item.label}
                    onClick={item.action}
                    sx={{
                      borderRadius: '12px',
                      px: 2,
                      py: 1.1,
                      mb: 0.3,
                      gap: 1.5,
                      transition: 'all 0.22s ease',
                      '&:hover': { bgcolor: `${item.color}10` },
                    }}
                  >
                    <Box sx={{ color: item.color, display: 'flex' }}>{item.icon}</Box>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{ sx: { fontWeight: 600, fontSize: '0.9rem', color: item.color } }}
                    />
                  </ListItemButton>
                ))}
              </List>
            </>
          ) : (
            <Box
              onClick={() => { navigate('/login'); setDrawerOpen(false); }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                py: 1.5,
                borderRadius: '50px',
                background: `linear-gradient(135deg, ${BRAND.navy} 0%, ${BRAND.blue} 100%)`,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(30,58,95,0.25)',
                transition: 'all 0.3s ease',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 22px rgba(30,58,95,0.3)' },
                '&:active': { transform: 'translateY(0)' },
              }}
            >
              <PersonIcon sx={{ fontSize: 18, color: '#fff' }} />
              <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>Đăng nhập</Typography>
            </Box>
          )}
        </Box>
      </Drawer>
    </>
  );
};

export default React.memo(HomeHeader);
