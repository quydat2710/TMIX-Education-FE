import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Grid, Button } from '@mui/material';
import { keyframes } from '@mui/system';
import AnimatedSection, { AnimatedItem, AnimatedCounter } from '../../../components/common/AnimatedSection';
import SchoolIcon from '@mui/icons-material/School';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GroupsIcon from '@mui/icons-material/Groups';
import StarIcon from '@mui/icons-material/Star';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import ForumIcon from '@mui/icons-material/Forum';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';

/* ════════════════ Keyframes ════════════════ */
const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  25% { transform: translateY(-6px) rotate(1deg); }
  75% { transform: translateY(4px) rotate(-1deg); }
`;

const pulseRing = keyframes`
  0% { transform: scale(1); opacity: 0.4; }
  50% { transform: scale(1.08); opacity: 0.15; }
  100% { transform: scale(1); opacity: 0.4; }
`;

const orbitSpin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const glowPulse = keyframes`
  0%, 100% { box-shadow: 0 0 30px rgba(211,47,47,0.2), 0 0 60px rgba(30,58,95,0.1); }
  50% { box-shadow: 0 0 50px rgba(211,47,47,0.35), 0 0 80px rgba(30,58,95,0.2); }
`;


const countPulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.08); }
`;

const progressFill = keyframes`
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
`;

/* ════════════════ Data ════════════════ */
const stats = [
  {
    number: 10,
    suffix: '+',
    label: 'Năm kinh nghiệm',
    description: 'Đồng hành cùng hàng nghìn học viên trên hành trình chinh phục tiếng Anh',
    Icon: EmojiEventsIcon,
    color: '#D32F2F',
    colorRgb: '211,47,47',
    gradient: 'linear-gradient(135deg, #D32F2F 0%, #FF6B6B 100%)',
    lightBg: 'linear-gradient(135deg, rgba(211,47,47,0.08) 0%, rgba(255,107,107,0.04) 100%)',
    progressPercent: 100,
  },
  {
    number: 500,
    suffix: '+',
    label: 'Học viên tin tưởng',
    description: 'Cộng đồng học viên năng động, không ngừng phát triển mỗi ngày',
    Icon: GroupsIcon,
    color: '#1E3A5F',
    colorRgb: '30,58,95',
    gradient: 'linear-gradient(135deg, #1E3A5F 0%, #3D7CC9 100%)',
    lightBg: 'linear-gradient(135deg, rgba(30,58,95,0.08) 0%, rgba(61,124,201,0.04) 100%)',
    progressPercent: 85,
  },
  {
    number: 95,
    suffix: '%',
    label: 'Tỷ lệ hài lòng',
    description: 'Chất lượng giảng dạy xuất sắc, được phụ huynh và học viên đánh giá cao',
    Icon: StarIcon,
    color: '#E8A817',
    colorRgb: '232,168,23',
    gradient: 'linear-gradient(135deg, #E8A817 0%, #FFD54F 100%)',
    lightBg: 'linear-gradient(135deg, rgba(232,168,23,0.08) 0%, rgba(255,213,79,0.04) 100%)',
    progressPercent: 95,
  },
  {
    number: 20,
    suffix: '+',
    label: 'Giáo viên chuyên nghiệp',
    description: 'Đội ngũ giảng viên tận tâm, giàu kinh nghiệm quốc tế',
    Icon: SchoolIcon,
    color: '#2E7D32',
    colorRgb: '46,125,50',
    gradient: 'linear-gradient(135deg, #2E7D32 0%, #66BB6A 100%)',
    lightBg: 'linear-gradient(135deg, rgba(46,125,50,0.08) 0%, rgba(102,187,106,0.04) 100%)',
    progressPercent: 90,
  },
];

const highlights = [
  { text: 'Phương pháp giảng dạy hiện đại, tương tác cao', accent: '#D32F2F' },
  { text: 'Lộ trình học cá nhân hoá cho từng học viên', accent: '#1E3A5F' },
  { text: 'Ứng dụng AI hỗ trợ luyện phát âm & hội thoại', accent: '#7B1FA2' },
  { text: 'Môi trường học tập năng động, truyền cảm hứng', accent: '#2E7D32' },
];

const courseChips = [
  { label: 'IELTS', Icon: RocketLaunchIcon, top: { xs: '2%', sm: '8%' }, left: { xs: '0%', sm: '8%' }, delay: 0, size: 'large', color: '#D32F2F' },
  { label: 'Giao tiếp', Icon: ForumIcon, top: { xs: '14%', sm: '15%' }, right: { xs: '0%', sm: '6%' }, delay: 0.5, size: 'normal', color: '#1E3A5F' },
  { label: 'Thiếu nhi', Icon: ChildCareIcon, bottom: { xs: '12%', sm: '15%' }, left: { xs: '0%', sm: '5%' }, delay: 1, size: 'normal', color: '#D32F2F' },
  { label: 'TOEIC', Icon: AutoStoriesIcon, bottom: { xs: '2%', sm: '12%' }, right: { xs: '0%', sm: '10%' }, delay: 1.5, size: 'large', color: '#3D7CC9' },
  { label: 'Du học', Icon: FlightTakeoffIcon, top: { xs: '52%', sm: '55%' }, right: { xs: '2%', sm: '0%' }, delay: 2, size: 'small', color: '#7B1FA2' },
];

/* ════════════════ Component ════════════════ */
const AboutSection: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Box id="about-section" sx={{ position: 'relative', overflow: 'hidden' }}>

      {/* ── Background Decorative Blobs ── */}
      <Box
        sx={{
          position: 'absolute',
          top: -80,
          right: -120,
          width: 350,
          height: 350,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(211,47,47,0.06) 0%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -60,
          left: -100,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(30,58,95,0.06) 0%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />

      {/* ═══════════ TOP: Hero Introduction ═══════════ */}
      <Grid container spacing={{ xs: 2, md: 8 }} alignItems="center" sx={{ mb: { xs: 3, md: 10 } }}>

        {/* ── Left: Narrative ── */}
        <Grid item xs={12} md={6}>
          <AnimatedSection variant="fadeRight">
            {/* Badge Pill */}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.8,
                px: 2.5,
                py: 0.8,
                mb: { xs: 1.5, md: 3 },
                borderRadius: '50px',
                background: 'linear-gradient(135deg, rgba(211,47,47,0.06) 0%, rgba(30,58,95,0.06) 100%)',
                border: '1px solid rgba(211,47,47,0.12)',
                backdropFilter: 'blur(8px)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50px',
                  padding: '1px',
                  background: 'linear-gradient(135deg, rgba(211,47,47,0.3), rgba(30,58,95,0.3))',
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                },
              }}
            >
              <AutoAwesomeIcon sx={{ fontSize: 15, color: '#D32F2F' }} />
              <Typography
                sx={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  letterSpacing: 2.5,
                  textTransform: 'uppercase',
                  background: 'linear-gradient(135deg, #D32F2F, #1E3A5F)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Về chúng tôi
              </Typography>
            </Box>

            {/* Heading */}
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                fontWeight: 900,
                lineHeight: 1.15,
                mb: 3,
                color: '#0f172a',
                letterSpacing: '-0.02em',
              }}
            >
              Nơi khởi đầu{' '}
              <Box
                component="span"
                sx={{
                  position: 'relative',
                  display: 'inline-block',
                  background: 'linear-gradient(135deg, #D32F2F 0%, #FF4444 50%, #D32F2F 100%)',
                  backgroundSize: '200% auto',
                  animation: `${gradientShift} 4s ease infinite`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                hành trình
              </Box>
              <br />
              chinh phục{' '}
              <Box
                component="span"
                sx={{
                  position: 'relative',
                  background: 'linear-gradient(135deg, #1E3A5F 0%, #3D7CC9 50%, #1E3A5F 100%)',
                  backgroundSize: '200% auto',
                  animation: `${gradientShift} 4s ease infinite`,
                  animationDelay: '1s',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                tiếng Anh
              </Box>
              {' '}
              <TrendingUpIcon sx={{ fontSize: { xs: 28, md: 36 }, color: '#D32F2F', verticalAlign: 'middle', mb: 0.5 }} />
            </Typography>

            {/* Description with left accent border */}
            <Box
              sx={{
                borderLeft: '3px solid',
                borderImage: 'linear-gradient(to bottom, #D32F2F, #1E3A5F) 1',
                pl: 2.5,
                mb: { xs: 2.5, md: 4 },
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: '0.95rem', md: '1.05rem' },
                  lineHeight: 1.9,
                  color: '#64748b',
                  '& strong': {
                    color: '#D32F2F',
                    fontWeight: 700,
                  },
                }}
              >
                <strong>TMix Education</strong> mang đến trải nghiệm học tiếng Anh
                hoàn toàn mới — kết hợp công nghệ AI tiên tiến với phương pháp giảng dạy hiện đại,
                giúp học viên tự tin giao tiếp và bứt phá trong mọi kỳ thi.
              </Typography>
            </Box>

            {/* Highlight Cards */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1, md: 1.5 }, mb: { xs: 2.5, md: 4 } }}>
              {highlights.map((item, i) => (
                <Box
                  key={i}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    p: 1.2,
                    pl: 1.8,
                    borderRadius: 2.5,
                    background: 'rgba(255,255,255,0.7)',
                    backdropFilter: 'blur(6px)',
                    border: '1px solid rgba(0,0,0,0.04)',
                    transition: 'all 0.3s ease',
                    cursor: 'default',
                    '&:hover': {
                      transform: 'translateX(8px)',
                      background: 'rgba(255,255,255,0.95)',
                      boxShadow: `0 4px 20px rgba(0,0,0,0.06), inset 3px 0 0 ${item.accent}`,
                    },
                  }}
                >
                  <CheckCircleIcon
                    sx={{
                      fontSize: 20,
                      color: item.accent,
                      flexShrink: 0,
                      filter: `drop-shadow(0 2px 4px ${item.accent}33)`,
                    }}
                  />
                  <Typography sx={{ fontSize: '0.9rem', color: '#334155', fontWeight: 550 }}>
                    {item.text}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* CTA Buttons */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/cac-khoa-hoc')}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: '50px',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%)',
                  boxShadow: '0 8px 32px rgba(211,47,47,0.3)',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.35s ease',
                  color: '#ffffff', // Ensure base text is white
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(135deg, #FF5252 0%, #D32F2F 100%)',
                    opacity: 0,
                    transition: 'opacity 0.35s ease',
                  },
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 14px 40px rgba(211,47,47,0.4)',
                    color: '#ffffff', // Force white text on hover to override <a> blue link styles
                    '&::before': { opacity: 1 },
                  },
                  '& .MuiButton-endIcon': { position: 'relative', zIndex: 1 },
                  '& .MuiButton-startIcon': { position: 'relative', zIndex: 1 },
                  '& > span, & > .MuiButton-label': { position: 'relative', zIndex: 1 },
                }}
              >
                <Box component="span" sx={{ position: 'relative', zIndex: 1 }}>Khám phá khóa học</Box>
              </Button>
            </Box>
          </AnimatedSection>
        </Grid>

        {/* ── Right: Visual Graphic ── */}
        <Grid item xs={12} md={6}>
          <AnimatedSection variant="fadeLeft">
            <Box
              sx={{
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: { xs: 260, md: 440 },
              }}
            >
              {/* Outermost glow ring */}
              <Box
                sx={{
                  position: 'absolute',
                  width: { xs: 300, md: 380 },
                  height: { xs: 300, md: 380 },
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(211,47,47,0.04) 0%, transparent 70%)',
                  animation: `${pulseRing} 4s ease-in-out infinite`,
                }}
              />

              {/* Orbit ring 1 */}
              <Box
                sx={{
                  position: 'absolute',
                  width: { xs: 260, md: 340 },
                  height: { xs: 260, md: 340 },
                  borderRadius: '50%',
                  border: '1.5px solid rgba(211,47,47,0.1)',
                  animation: `${orbitSpin} 25s linear infinite`,
                  willChange: 'transform',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -5,
                    left: '50%',
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #D32F2F, #FF6B6B)',
                    boxShadow: '0 0 15px rgba(211,47,47,0.5)',
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: -4,
                    right: '30%',
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #E8A817, #FFD54F)',
                    boxShadow: '0 0 10px rgba(232,168,23,0.4)',
                  },
                }}
              />

              {/* Orbit ring 2 — reverse direction */}
              <Box
                sx={{
                  position: 'absolute',
                  width: { xs: 200, md: 260 },
                  height: { xs: 200, md: 260 },
                  borderRadius: '50%',
                  border: '1px solid rgba(30,58,95,0.08)',
                  animation: `${orbitSpin} 18s linear infinite reverse`,
                willChange: 'transform',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '15%',
                    right: -4,
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #1E3A5F, #3D7CC9)',
                    boxShadow: '0 0 12px rgba(30,58,95,0.4)',
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: '20%',
                    left: -3,
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: '#3D7CC9',
                    boxShadow: '0 0 8px rgba(61,124,201,0.4)',
                  },
                }}
              />

              {/* Inner decorative ring */}
              <Box
                sx={{
                  position: 'absolute',
                  width: { xs: 160, md: 200 },
                  height: { xs: 160, md: 200 },
                  borderRadius: '50%',
                  border: '1px dashed rgba(211,47,47,0.08)',
                  animation: `${orbitSpin} 35s linear infinite`,
                willChange: 'transform',
                }}
              />

              {/* Center Logo */}
              <Box
                sx={{
                  width: { xs: 120, md: 150 },
                  height: { xs: 120, md: 150 },
                  borderRadius: '50%',
                  background: 'radial-gradient(circle at 35% 25%, #3D7CC9 0%, #1E3A5F 40%, #0f2440 80%, #0a192f 100%)',
                  boxShadow: 'inset -8px -8px 16px rgba(0,0,0,0.6), inset 8px 8px 16px rgba(255,255,255,0.2), 0 20px 50px rgba(30,58,95,0.6)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  zIndex: 2,
                  animation: `${glowPulse} 3s ease-in-out infinite`,
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: -3,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #1E3A5F, #3D7CC9, #D32F2F, #1E3A5F)',
                    backgroundSize: '300% 300%',
                    animation: `${gradientShift} 3s ease infinite`,
                    zIndex: -1,
                    opacity: 0.6,
                    filter: 'blur(4px)',
                  },
                }}
              >
                <Typography
                  sx={{
                    color: '#fff',
                    fontWeight: 900,
                    fontSize: { xs: '1.5rem', md: '1.9rem' },
                    letterSpacing: -0.5,
                    lineHeight: 1,
                    textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  }}
                >
                  TMix
                </Typography>
                <Typography
                  sx={{
                    color: 'rgba(255,255,255,0.8)',
                    fontWeight: 600,
                    fontSize: { xs: '0.55rem', md: '0.65rem' },
                    letterSpacing: 4,
                    textTransform: 'uppercase',
                    mt: 0.3,
                  }}
                >
                  Education
                </Typography>
              </Box>

              {/* Floating Course Chips */}
              {courseChips.map((chip, i) => {
                const positionProps = Object.fromEntries(
                  Object.entries(chip).filter(([k]) => ['top', 'right', 'bottom', 'left'].includes(k))
                );
                return (
                  <Box
                    key={i}
                    sx={{
                      position: 'absolute',
                      ...positionProps,
                      display: 'flex',
                      alignItems: 'center',
                      gap: { xs: 0.5, md: 1 },
                      px: chip.size === 'large' ? { xs: 1.5, md: 2.2 } : chip.size === 'small' ? { xs: 1, md: 1.4 } : { xs: 1.2, md: 1.8 },
                      py: chip.size === 'large' ? { xs: 0.6, md: 1 } : chip.size === 'small' ? { xs: 0.3, md: 0.5 } : { xs: 0.5, md: 0.7 },
                      borderRadius: '50px',
                      background: 'rgba(255,255,255,0.85)',
                      backdropFilter: 'blur(16px)',
                      boxShadow: '0 8px 32px rgba(30,58,95,0.08), 0 2px 8px rgba(0,0,0,0.04), inset 0 0 0 1px rgba(255,255,255,0.9)',
                      border: 'none',
                      fontSize: chip.size === 'large' ? { xs: '0.75rem', md: '0.88rem' } : chip.size === 'small' ? { xs: '0.65rem', md: '0.72rem' } : { xs: '0.7rem', md: '0.8rem' },
                      fontWeight: 700,
                      color: '#1E3A5F',
                      animation: `${float} ${3 + i * 0.7}s ease-in-out infinite`,
                      animationDelay: `${chip.delay}s`,
                      zIndex: 3,
                      whiteSpace: 'nowrap',
                      transition: 'transform 0.3s cubic-bezier(0.25,0.46,0.45,0.94), box-shadow 0.3s ease, background 0.3s ease',
                      cursor: 'default',
                      transformOrigin: 'center center',
                      willChange: 'transform',
                      '&:hover': {
                        transform: 'scale(1.1) translateY(-6px)',
                        boxShadow: `0 16px 40px rgba(30,58,95,0.15), 0 0 0 2px ${chip.color}44`,
                        background: '#fff',
                        '& .icon-box': {
                          transform: 'scale(1.15) rotate(8deg)',
                          background: chip.color,
                          color: '#fff',
                          boxShadow: `0 4px 12px ${chip.color}55`,
                        }
                      },
                    }}
                  >
                    <Box
                      className="icon-box"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: chip.size === 'large' ? { xs: 22, md: 26 } : chip.size === 'small' ? { xs: 16, md: 20 } : { xs: 18, md: 24 },
                        height: chip.size === 'large' ? { xs: 22, md: 26 } : chip.size === 'small' ? { xs: 16, md: 20 } : { xs: 18, md: 24 },
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${chip.color}15, ${chip.color}25)`,
                        color: chip.color,
                        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      }}
                    >
                      <chip.Icon sx={{ fontSize: chip.size === 'large' ? { xs: 12, md: 15 } : chip.size === 'small' ? { xs: 9, md: 11 } : { xs: 10, md: 13 } }} />
                    </Box>
                    {chip.label}
                  </Box>
                );
              })}
            </Box>
          </AnimatedSection>
        </Grid>
      </Grid>

      {/* ═══════════ Divider with label ═══════════ */}
      <AnimatedSection variant="fadeIn" sx={{ mb: { xs: 3, md: 7 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, px: { xs: 0, md: 4 } }}>
          <Box sx={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(211,47,47,0.2), rgba(30,58,95,0.2))' }} />
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 2.5,
              py: 0.8,
              borderRadius: '50px',
              background: 'linear-gradient(135deg, rgba(211,47,47,0.06), rgba(30,58,95,0.06))',
              border: '1px solid rgba(211,47,47,0.1)',
            }}
          >
            <AutoAwesomeIcon sx={{ fontSize: 14, color: '#D32F2F' }} />
            <Typography
              sx={{
                fontSize: '0.68rem',
                fontWeight: 800,
                letterSpacing: 4,
                textTransform: 'uppercase',
                background: 'linear-gradient(135deg, #D32F2F, #1E3A5F)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                whiteSpace: 'nowrap',
              }}
            >
              Thành tựu nổi bật
            </Typography>
          </Box>
          <Box sx={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(30,58,95,0.2), rgba(211,47,47,0.2), transparent)' }} />
        </Box>
      </AnimatedSection>

      {/* ═══════════ BOTTOM: Ultra-Premium Stats Cards ═══════════ */}
      <AnimatedSection staggerChildren={0.15}>
        <Grid container spacing={{ xs: 2, md: 3 }}>
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <AnimatedItem variant="fadeUp">
                {/* ── Outer wrapper with animated gradient border ── */}
                <Box
                  sx={{
                    position: 'relative',
                    borderRadius: 5,
                    padding: '1.5px',
                    background: `linear-gradient(135deg, rgba(${stat.colorRgb},0.15), transparent 40%, transparent 60%, rgba(${stat.colorRgb},0.15))`,
                    transition: 'all 0.5s ease',
                    height: '100%',
                    '&:hover': {
                      background: stat.gradient,
                      '& .stat-card-inner': {
                        boxShadow: `0 25px 60px rgba(${stat.colorRgb},0.15), 0 8px 24px rgba(0,0,0,0.06)`,
                        transform: 'translateY(-6px)',
                      },
                      '& .stat-icon-circle': {
                        background: stat.gradient,
                        transform: 'scale(1.12) rotate(-8deg)',
                        boxShadow: `0 8px 25px rgba(${stat.colorRgb},0.35)`,
                        '& svg': { color: '#fff !important' },
                      },
                      '& .stat-number': {
                        animation: `${countPulse} 0.6s ease`,
                      },
                      '& .stat-progress-fill': {
                        transform: 'scaleX(1) !important',
                      },
                      '& .stat-corner-blob': {
                        opacity: 0.12,
                        transform: 'scale(1.2)',
                      },
                    },
                  }}
                >
                  {/* ── Inner card ── */}
                  <Box
                    className="stat-card-inner"
                    sx={{
                      position: 'relative',
                      p: { xs: 2.5, md: 3.5 },
                      pt: { xs: 3, md: 4 },
                      borderRadius: 4.5,
                      background: 'rgba(255,255,255,0.95)',
                      backdropFilter: 'blur(20px)',
                      overflow: 'hidden',
                      transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                      cursor: 'default',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    {/* Decorative corner blob */}
                    <Box
                      className="stat-corner-blob"
                      sx={{
                        position: 'absolute',
                        top: -30,
                        right: -30,
                        width: 100,
                        height: 100,
                        borderRadius: '50%',
                        background: stat.gradient,
                        opacity: 0.06,
                        transition: 'all 0.5s ease',
                        pointerEvents: 'none',
                      }}
                    />

                    {/* Decorative line accent */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '3px',
                        background: stat.gradient,
                        borderRadius: '20px 20px 0 0',
                      }}
                    />

                    {/* Icon Circle */}
                    <Box
                      className="stat-icon-circle"
                      sx={{
                        width: { xs: 52, md: 60 },
                        height: { xs: 52, md: 60 },
                        borderRadius: '50%',
                        background: stat.lightBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2.5,
                        transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                        position: 'relative',
                        zIndex: 1,
                        boxShadow: `0 4px 15px rgba(${stat.colorRgb},0.1)`,
                      }}
                    >
                      <stat.Icon
                        sx={{
                          fontSize: { xs: 24, md: 28 },
                          color: stat.color,
                          transition: 'color 0.4s ease',
                        }}
                      />
                    </Box>

                    {/* Number */}
                    <Box
                      className="stat-number"
                      sx={{
                        position: 'relative',
                        zIndex: 1,
                        mb: 0.5,
                      }}
                    >
                      <AnimatedCounter
                        target={stat.number}
                        suffix={stat.suffix}
                        duration={2.5}
                        style={{
                          fontWeight: 900,
                          fontSize: '2.8rem',
                          lineHeight: 1.1,
                          display: 'block',
                          marginBottom: 6,
                          background: stat.gradient,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                        }}
                      />
                    </Box>

                    {/* Label */}
                    <Typography
                      sx={{
                        fontWeight: 800,
                        fontSize: { xs: '0.85rem', md: '0.95rem' },
                        color: '#0f172a',
                        mb: 1,
                        lineHeight: 1.3,
                        position: 'relative',
                        zIndex: 1,
                      }}
                    >
                      {stat.label}
                    </Typography>

                    {/* Description */}
                    <Typography
                      sx={{
                        fontSize: { xs: '0.76rem', md: '0.82rem' },
                        color: '#94a3b8',
                        lineHeight: 1.65,
                        position: 'relative',
                        zIndex: 1,
                        mb: 2.5,
                        flex: 1,
                      }}
                    >
                      {stat.description}
                    </Typography>

                    {/* Progress Bar */}
                    <Box
                      sx={{
                        position: 'relative',
                        zIndex: 1,
                        width: '100%',
                        height: 4,
                        borderRadius: 2,
                        background: 'rgba(0,0,0,0.04)',
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        className="stat-progress-fill"
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          height: '100%',
                          width: `${stat.progressPercent}%`,
                          borderRadius: 2,
                          background: stat.gradient,
                          transform: 'scaleX(0)',
                          transformOrigin: 'left',
                          transition: 'transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                          animation: `${progressFill} 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.5s forwards`,
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              </AnimatedItem>
            </Grid>
          ))}
        </Grid>
      </AnimatedSection>
    </Box>
  );
};

export default React.memo(AboutSection);
