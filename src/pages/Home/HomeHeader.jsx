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

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

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
        bgcolor: scrolled ? 'white' : 'rgba(0, 0, 0, 0.8)',
        backdropFilter: scrolled ? 'none' : 'blur(8px)',
        boxShadow: scrolled ? 1 : 'none',
        transition: 'all 0.3s ease-in-out',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar
          disableGutters
          sx={{
            minHeight: { xs: 64, md: 70 },
            transition: 'all 0.3s ease-in-out',
          }}
        >
          {/* Logo */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
              },
            }}
            onClick={() => navigate('/')}
          >
            <SchoolIcon
              sx={{
                fontSize: 32,
                color: scrolled ? COLORS.primary : 'white',
                mr: 1,
                transition: 'color 0.3s ease',
              }}
            />
            <Typography
              variant="h6"
              sx={{
                color: scrolled ? COLORS.primary : 'white',
                fontWeight: 'bold',
                transition: 'color 0.3s ease',
                fontSize: { xs: '1.1rem', md: '1.25rem' },
              }}
            >
              English Center
            </Typography>
          </Box>

          {isMobile ? (
            <>
              <Box sx={{ flexGrow: 1 }} />
              <IconButton
                size="large"
                edge="end"
                color={scrolled ? 'primary' : 'inherit'}
                aria-label="menu"
                onClick={handleMenu}
                sx={{
                  transition: 'color 0.3s ease',
                }}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                  sx: {
                    mt: 1.5,
                    minWidth: 200,
                    borderRadius: 2,
                    boxShadow: 3,
                  },
                }}
              >
                {menuItems.map((item) => (
                  <MenuItem
                    key={item.label}
                    onClick={() => handleNavigate(item.path)}
                    sx={{
                      py: 1.5,
                      '&:hover': {
                        bgcolor: 'rgba(25, 118, 210, 0.08)',
                      },
                    }}
                  >
                    {item.label}
                  </MenuItem>
                ))}
                <MenuItem
                  onClick={() => handleNavigate('/login')}
                  sx={{
                    py: 1.5,
                    color: COLORS.primary,
                    fontWeight: 'bold',
                    '&:hover': {
                      bgcolor: 'rgba(25, 118, 210, 0.08)',
                    },
                  }}
                >
                  Đăng nhập
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              {/* Navigation Links */}
              <Box
                sx={{
                  flexGrow: 1,
                  display: 'flex',
                  justifyContent: 'center',
                  ml: 4,
                }}
              >
                {menuItems.map((item) => (
                  <Button
                    key={item.label}
                    color="inherit"
                    onClick={() => handleNavigate(item.path)}
                    sx={{
                      mx: 1,
                      color: scrolled ? COLORS.text : 'white',
                      fontWeight: 500,
                      fontSize: '0.95rem',
                      '&:hover': {
                        color: COLORS.primary,
                        bgcolor: 'transparent',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>

              {/* Right Side Actions */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title="Tìm kiếm">
                  <IconButton
                    color={scrolled ? 'primary' : 'inherit'}
                    sx={{
                      transition: 'color 0.3s ease',
                      '&:hover': {
                        color: scrolled ? COLORS.primaryDark : 'rgba(255, 255, 255, 0.8)',
                      }
                    }}
                  >
                    <SearchIcon />
                  </IconButton>
                </Tooltip>

                <Button
                  variant="contained"
                  onClick={() => handleNavigate('/login')}
                  startIcon={<PersonIcon />}
                  sx={{
                    bgcolor: COLORS.primary,
                    color: 'white',
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    fontWeight: 'bold',
                    boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)',
                    '&:hover': {
                      bgcolor: COLORS.primaryDark,
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(0,118,255,0.23)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Đăng nhập
                </Button>
              </Box>
            </>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default HomeHeader;
