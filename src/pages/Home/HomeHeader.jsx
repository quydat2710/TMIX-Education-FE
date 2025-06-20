import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  School as SchoolIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { COLORS } from '../../utils/colors';
import { useNavigate } from 'react-router-dom';
import { commonStyles } from '../../utils/styles';

const sectionIds = [
  { label: 'Trang chủ', id: 'hero-section' },
  { label: 'Giáo viên', id: 'teachers-section' },
  { label: 'Về chúng tôi', id: 'about-section' },
];

const scrollToSection = (id) => {
  const el = document.getElementById(id);
  if (el) {
    window.scrollTo({
      top: el.offsetTop - 72, // Offset for header height
      behavior: 'smooth',
    });
  }
};

const HomeHeader = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero-section');
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const currentSection = sectionIds.reduce((acc, section) => {
        const el = document.getElementById(section.id);
        if (el && scrollY >= el.offsetTop - 80) {
          return section.id;
        }
        return acc;
      }, 'hero-section');

      setActiveSection(currentSection);
      setScrolled(scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const handleMobileMenuItemClick = (id) => {
    scrollToSection(id);
    handleMobileMenuClose();
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        bgcolor: '#fff',
        color: COLORS.text.primary,
        borderBottom: 'none',
        boxShadow: scrolled ? 1 : 'none',
        transition: 'all 0.3s',
        borderRadius: 0,
      }}
    >
      <Toolbar sx={{ minHeight: 72, px: { xs: 2, md: 4 }, display: 'flex', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => scrollToSection('hero-section')}>
          <SchoolIcon sx={{ fontSize: 32, color: COLORS.primary.main, mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#111', fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
            English Center
          </Typography>
        </Box>

        {isMobile ? (
          // Mobile Menu
          <>
            <IconButton
              size="large"
              edge="end"
              color="inherit"
              aria-label="menu"
              onClick={handleMobileMenuOpen}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={mobileMenuAnchor}
              open={Boolean(mobileMenuAnchor)}
              onClose={handleMobileMenuClose}
              sx={{ mt: 1 }}
            >
              {sectionIds.map((item) => (
                <MenuItem key={item.id} onClick={() => handleMobileMenuItemClick(item.id)}>
                  {item.label}
                </MenuItem>
              ))}
              <MenuItem onClick={() => { navigate('/login'); handleMobileMenuClose(); }}>
                Đăng nhập
              </MenuItem>
            </Menu>
          </>
        ) : (
          // Desktop Menu
          <>
            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
              {sectionIds.map((item) => (
                <Button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  sx={{
                    mx: 1.5,
                    color: activeSection === item.id ? COLORS.primary.main : '#111',
                    fontWeight: activeSection === item.id ? 700 : 500,
                    fontSize: '1rem',
                    borderRadius: 2,
                    bgcolor: 'transparent',
                    outline: 'none',
                    boxShadow: 'none',
                    '&:focus, &:active': {
                      outline: 'none',
                      boxShadow: 'none',
                      bgcolor: 'transparent',
                    },
                    '&:hover': {
                      color: COLORS.primary.main,
                      bgcolor: 'transparent',
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>

            <Button
              variant="contained"
              onClick={() => navigate('/login')}
              startIcon={<PersonIcon />}
              sx={{
                ...commonStyles.primaryButton,
                px: 2.5,
                py: 1,
                borderRadius: 2,
              }}
            >
              Đăng nhập
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default HomeHeader;
