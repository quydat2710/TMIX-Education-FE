import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography, IconButton, Button, Chip } from '@mui/material';
import { ArrowBackIos, ArrowForwardIos, LocalFireDepartment } from '@mui/icons-material';
import { Advertisement } from '../../../types';

interface AdvertisementSliderProps {
  autoPlay?: boolean;
  interval?: number;
  ads: Advertisement[];
  showArrows?: boolean;
  showDots?: boolean;
  height?: number;
  onRegisterClick?: (classId: string | null, className: string) => void;
}

const BRAND = {
  navy: '#1E3A5F',
  red: '#D32F2F',
  blue: '#3D7CC9',
};

// ── Keyframes injected once ──────────────────────────────────────────────────
const KEYFRAMES = `
  @keyframes kenBurns {
    0%   { transform: scale(1.08) translate(0%, 0%); }
    50%  { transform: scale(1.12) translate(-1%, 0.5%); }
    100% { transform: scale(1.08) translate(0%, 0%); }
  }
  @keyframes bannerFadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes bannerFadeOut {
    from { opacity: 1; }
    to   { opacity: 0; }
  }
  @keyframes slideUpFadeIn {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes progressRun {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }
`;

const AdvertisementSlider: React.FC<AdvertisementSliderProps> = ({
  autoPlay = true,
  interval = 3000,
  ads,
  showArrows = true,
  showDots = true,
  height,
  onRegisterClick,
}) => {
  const [current, setCurrent] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [progressKey, setProgressKey] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const styleInjected = useRef(false);
  const FADE_MS = 800; // crossfade duration

  // Inject keyframes once
  useEffect(() => {
    if (styleInjected.current) return;
    styleInjected.current = true;
    const style = document.createElement('style');
    style.innerHTML = KEYFRAMES;
    document.head.appendChild(style);
  }, []);

  if (!ads || ads.length === 0) return null;

  const sortedAds = [...ads]
    .sort((a, b) => {
      if ((a.priority ?? 0) !== (b.priority ?? 0))
        return (a.priority ?? 0) - (b.priority ?? 0);
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    })
    .slice(0, 5);

  const total = sortedAds.length;

  const goTo = useCallback(
    (idx: number) => {
      const next = (idx + total) % total;
      setCurrent(next);
      setAnimKey((k) => k + 1);
      setProgressKey((k) => k + 1);
    },
    [current, total]
  );

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  // Auto-play
  useEffect(() => {
    if (!autoPlay || total <= 1) return;
    timerRef.current = setInterval(next, interval);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [autoPlay, interval, next, total]);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (autoPlay && total > 1)
      timerRef.current = setInterval(next, interval);
  };

  const handlePrev = () => { prev(); resetTimer(); };
  const handleNext = () => { next(); resetTimer(); };
  const handleDot = (i: number) => { goTo(i); resetTimer(); };

  const sliderH = height ?? 560;
  const ad = sortedAds[current];
  const isHot = (ad.priority ?? 99) <= 1;

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: sliderH,
        overflow: 'hidden',
        bgcolor: BRAND.navy,
      }}
    >
      {/* ── Background sliding layer (Stacked images) ────────────────── */}
      {sortedAds.map((bgAd, index) => {
        const isActive = index === current;
        // zIndex ensures the active image is always on top.
        const zIndex = isActive ? 2 : 1;
        
        return (
          <Box
            key={bgAd.id}
            component="img"
            src={bgAd.imageUrl || bgAd.image}
            alt={bgAd.title}
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex,
              // Fade in and out smoothly
              opacity: isActive ? 1 : 0,
              // Active image zooms slowly, inactive resets quickly
              transform: isActive ? 'scale(1.12) translate(-1%, 0.5%)' : 'scale(1.02) translate(0%, 0%)',
              transition: isActive 
                ? `opacity ${FADE_MS}ms ease, transform 8s ease-out` 
                : `opacity ${FADE_MS}ms ease, transform 0s`, // Instant scale reset when hidden
              willChange: 'opacity, transform',
            }}
          />
        );
      })}

      {/* ── Cinematic gradient overlay ──────────────────────────────── */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(105deg, rgba(15,25,45,0.82) 0%, rgba(15,25,45,0.55) 50%, rgba(15,25,45,0.25) 100%)',
          zIndex: 1,
        }}
      />
      {/* Bottom-up mist */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '55%',
          background: 'linear-gradient(to top, rgba(10,18,36,0.9) 0%, transparent 100%)',
          zIndex: 1,
        }}
      />

      {/* ── Slide content ────────────────────────────────────────────── */}
      <Box
        key={`content-${animKey}`}
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          px: { xs: 3, md: 8 },
          pb: { xs: 5, md: 7 },
        }}
      >
        {/* Hot badge */}
        {isHot && (
          <Chip
            icon={<LocalFireDepartment sx={{ fontSize: 14, color: '#fff !important' }} />}
            label="HOT"
            size="small"
            sx={{
              mb: 2,
              width: 'fit-content',
              bgcolor: BRAND.red,
              color: '#fff',
              fontWeight: 800,
              fontSize: '0.7rem',
              letterSpacing: 2,
              height: 24,
              animation: 'fadeIn 0.5s ease both',
              border: '1px solid rgba(255,255,255,0.2)',
              '& .MuiChip-icon': { ml: '6px' },
            }}
          />
        )}

        {/* Title */}
        <Typography
          variant="h2"
          sx={{
            color: '#fff',
            fontWeight: 900,
            fontSize: { xs: '1.8rem', md: '3rem', lg: '3.4rem' },
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            mb: 1.5,
            textShadow: '0 4px 24px rgba(0,0,0,0.5)',
            animation: 'slideUpFadeIn 0.6s cubic-bezier(0.22,1,0.36,1) 0.05s both',
            maxWidth: { xs: '100%', md: '65%' },
          }}
        >
          {ad.title}
        </Typography>

        {/* Description */}
        {(ad.content || ad.description) && (
          <Typography
            sx={{
              color: 'rgba(255,255,255,0.85)',
              fontSize: { xs: '0.95rem', md: '1.12rem' },
              lineHeight: 1.7,
              mb: 3,
              maxWidth: { xs: '100%', md: '55%' },
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textShadow: '0 2px 12px rgba(0,0,0,0.4)',
              animation: 'slideUpFadeIn 0.65s cubic-bezier(0.22,1,0.36,1) 0.15s both',
            }}
          >
            {ad.content || ad.description}
          </Typography>
        )}

        {/* CTA button */}
        {onRegisterClick && ad.classId && (
          <Box sx={{ animation: 'slideUpFadeIn 0.7s cubic-bezier(0.22,1,0.36,1) 0.25s both' }}>
            <Button
              variant="contained"
              size="large"
              onClick={(e) => {
                e.stopPropagation();
                onRegisterClick(ad.classId || null, ad.title);
              }}
              sx={{
                px: { xs: 3.5, md: 5 },
                py: { xs: 1.2, md: 1.6 },
                borderRadius: '50px',
                fontSize: { xs: '0.88rem', md: '1rem' },
                fontWeight: 800,
                textTransform: 'none',
                letterSpacing: '0.02em',
                background: `linear-gradient(135deg, ${BRAND.red} 0%, #B71C1C 100%)`,
                boxShadow: '0 8px 32px rgba(211,47,47,0.45)',
                border: '1.5px solid rgba(255,255,255,0.12)',
                transition: 'all 0.3s cubic-bezier(0.34,1.2,0.64,1)',
                '&:hover': {
                  transform: 'translateY(-3px) scale(1.04)',
                  boxShadow: '0 16px 48px rgba(211,47,47,0.55)',
                  background: `linear-gradient(135deg, #FF3D3D 0%, ${BRAND.red} 100%)`,
                },
                '&:active': { transform: 'translateY(-1px) scale(0.98)' },
              }}
            >
              ĐĂNG KÝ NGAY →
            </Button>
          </Box>
        )}
      </Box>

      {/* ── Auto-play progress bar ──────────────────────────────────── */}
      {autoPlay && total > 1 && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            bgcolor: 'rgba(255,255,255,0.15)',
            zIndex: 10,
          }}
        >
          <Box
            key={`progress-${progressKey}`}
            sx={{
              height: '100%',
              background: `linear-gradient(90deg, ${BRAND.red}, #FF6B6B)`,
              transformOrigin: 'left',
              animation: `progressRun ${interval}ms linear both`,
              borderRadius: '0 2px 2px 0',
            }}
          />
        </Box>
      )}

      {/* ── Slide counter (top-right) ───────────────────────────────── */}
      {total > 1 && (
        <Box
          sx={{
            position: 'absolute',
            top: 20,
            right: { xs: 16, md: 36 },
            zIndex: 10,
            display: 'flex',
            alignItems: 'baseline',
            gap: 0.4,
          }}
        >
          <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem' }}>
            {String(current + 1).padStart(2, '0')}
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem' }}>
            /{String(total).padStart(2, '0')}
          </Typography>
        </Box>
      )}

      {/* ── Navigation Arrows ──────────────────────────────────────── */}
      {showArrows && total > 1 && (
        <>
          {/* Prev */}
          <IconButton
            onClick={handlePrev}
            aria-label="previous"
            sx={{
              position: 'absolute',
              left: { xs: 12, md: 28 },
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              width: { xs: 44, md: 52 },
              height: { xs: 44, md: 52 },
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1.5px solid rgba(255,255,255,0.2)',
              color: '#fff',
              transition: 'all 0.28s cubic-bezier(0.34,1.2,0.64,1)',
              '&:hover': {
                background: `rgba(211,47,47,0.7)`,
                border: '1.5px solid rgba(255,255,255,0.4)',
                transform: 'translateY(-50%) scale(1.1)',
                boxShadow: '0 8px 32px rgba(211,47,47,0.4)',
              },
            }}
          >
            <ArrowBackIos sx={{ fontSize: { xs: 16, md: 18 }, ml: '4px' }} />
          </IconButton>

          {/* Next */}
          <IconButton
            onClick={handleNext}
            aria-label="next"
            sx={{
              position: 'absolute',
              right: { xs: 12, md: 28 },
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              width: { xs: 44, md: 52 },
              height: { xs: 44, md: 52 },
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1.5px solid rgba(255,255,255,0.2)',
              color: '#fff',
              transition: 'all 0.28s cubic-bezier(0.34,1.2,0.64,1)',
              '&:hover': {
                background: `rgba(211,47,47,0.7)`,
                border: '1.5px solid rgba(255,255,255,0.4)',
                transform: 'translateY(-50%) scale(1.1)',
                boxShadow: '0 8px 32px rgba(211,47,47,0.4)',
              },
            }}
          >
            <ArrowForwardIos sx={{ fontSize: { xs: 16, md: 18 } }} />
          </IconButton>
        </>
      )}

      {/* ── Dot navigation ─────────────────────────────────────────── */}
      {showDots && total > 1 && (
        <Box
          sx={{
            position: 'absolute',
            bottom: { xs: 16, md: 24 },
            right: { xs: 16, md: 36 },
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          {sortedAds.map((_, i) => (
            <Box
              key={i}
              onClick={() => handleDot(i)}
              sx={{
                height: 6,
                width: i === current ? 28 : 6,
                borderRadius: '50px',
                bgcolor: i === current ? '#fff' : 'rgba(255,255,255,0.35)',
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.34,1.2,0.64,1)',
                boxShadow: i === current ? '0 2px 8px rgba(255,255,255,0.4)' : 'none',
                '&:hover': {
                  bgcolor: i === current ? '#fff' : 'rgba(255,255,255,0.6)',
                  transform: 'scaleY(1.3)',
                },
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default AdvertisementSlider;
