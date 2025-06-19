import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  School as SchoolIcon,
  Search as SearchIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { COLORS } from '../../utils/colors';
import { useNavigate } from 'react-router-dom';

const HomeHeader = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero-section');

  const sectionIds = [
    { label: 'Trang chủ', id: 'hero-section' },
    { label: 'Giáo viên', id: 'teachers-section' },
    { label: 'Về chúng tôi', id: 'about-section' },
  ];

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({
        top: el.offsetTop - 72, // trừ chiều cao header
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      let found = 'hero-section';
      for (const sec of sectionIds) {
        const el = document.getElementById(sec.id);
        if (el && scrollY + 80 >= el.offsetTop) {
          found = sec.id;
        }
      }
      setActiveSection(found);
      setScrolled(scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNavigate = (path) => {
    navigate(path);
    handleClose();
  };

  const menuItems = [
    { label: 'Trang chủ', path: '/' },
    { label: 'Khóa học', path: '/courses' },
    { label: 'Giáo viên', path: '/teachers' },
    { label: 'Về chúng tôi', path: '/about' },
    { label: 'Liên hệ', path: '/contact' },
  ];

  return (
    <AppBar
      position="fixed"
      sx={{
        bgcolor: '#fff',
        color: COLORS.text,
        borderBottom: '1px solid #eee',
        boxShadow: scrolled ? 1 : 'none',
        transition: 'all 0.3s',
      }}
    >
      <Toolbar sx={{ minHeight: 72, px: { xs: 1, md: 4 }, display: 'flex', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => scrollToSection('hero-section')}>
          <SchoolIcon sx={{ fontSize: 32, color: COLORS.primary, mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#111', fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
            English Center
          </Typography>
        </Box>
        {/* Menu */}
        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center', ml: 4 }}>
          {sectionIds.map((item) => (
            <Button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              sx={{
                mx: 1,
                color: activeSection === item.id ? COLORS.primary : '#111',
                fontWeight: activeSection === item.id ? 700 : 500,
                fontSize: '1rem',
                border: 'none',
                borderRadius: 0,
                bgcolor: 'transparent',
                outline: 'none',
                boxShadow: 'none',
                '&:focus': {
                  outline: 'none',
                  boxShadow: 'none',
                  bgcolor: 'transparent',
                },
                '&:active': {
                  outline: 'none',
                  boxShadow: 'none',
                  bgcolor: 'transparent',
                },
                '&:hover': {
                  color: COLORS.primary,
                  bgcolor: 'transparent',
                },
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>
        {/* Đăng nhập */}
        <Button
          variant="contained"
          onClick={() => navigate('/login')}
          startIcon={<PersonIcon />}
          sx={{
            bgcolor: COLORS.primary,
            color: 'white',
            px: 2,
            py: 1,
            borderRadius: 2,
            fontWeight: 'bold',
            boxShadow: '0 4px 14px 0 rgba(0,118,255,0.19)',
            ml: { xs: 1, md: 3 },
            '&:hover': {
              bgcolor: COLORS.primaryDark,
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(0,118,255,0.23)',
            },
            transition: 'all 0.3s',
          }}
        >
          Đăng nhập
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default HomeHeader;
