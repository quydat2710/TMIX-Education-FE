import React, { useEffect, useState } from 'react';
import { Box, Typography, useTheme, Theme } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  trend?: 'up' | 'down';
  trendValue?: string;
  onClick?: () => void;
  index?: number;
  compact?: boolean;
}

// Count-up animation hook
const useCountUp = (end: number, start = 0, duration = 1200) => {
  const [count, setCount] = useState(start);

  useEffect(() => {
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(easeOut * (end - start) + start);
      setCount(current);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, start, duration]);

  return count;
};

// Enterprise color system — muted, professional tones
const colorAccents: Record<string, { border: string; bg: string; text: string; iconBg: string }> = {
  primary: {
    border: '#1e3a8a',
    bg: 'rgba(30, 58, 138, 0.04)',
    text: '#1e3a8a',
    iconBg: 'rgba(30, 58, 138, 0.08)',
  },
  secondary: {
    border: '#1E3A5F',
    bg: 'rgba(30, 58, 95, 0.04)',
    text: '#1E3A5F',
    iconBg: 'rgba(30, 58, 95, 0.08)',
  },
  success: {
    border: '#059669',
    bg: 'rgba(5, 150, 105, 0.04)',
    text: '#059669',
    iconBg: 'rgba(5, 150, 105, 0.08)',
  },
  error: {
    border: '#dc2626',
    bg: 'rgba(220, 38, 38, 0.04)',
    text: '#dc2626',
    iconBg: 'rgba(220, 38, 38, 0.08)',
  },
  warning: {
    border: '#d97706',
    bg: 'rgba(217, 119, 6, 0.04)',
    text: '#d97706',
    iconBg: 'rgba(217, 119, 6, 0.08)',
  },
  info: {
    border: '#0284c7',
    bg: 'rgba(2, 132, 199, 0.04)',
    text: '#0284c7',
    iconBg: 'rgba(2, 132, 199, 0.08)',
  },
};

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = 'primary',
  trend,
  trendValue,
  onClick,
  index = 0,
  compact = false,
}) => {
  const theme: Theme = useTheme();
  
  // Extract number for countUp
  let numericValue: number | string = value;
  if (typeof value === 'string') {
    if (!isNaN(Number(value))) {
      numericValue = Number(value);
    } else if (value.includes('%')) {
      numericValue = parseFloat(value.replace(/[^0-9.-]+/g, ""));
    } else {
      numericValue = parseFloat(value.replace(/[^0-9-]/g, ""));
    }
  }

  const isNumeric = !isNaN(numericValue as number) && value !== null && value !== '';
  const animatedNumber = useCountUp(isNumeric ? (numericValue as number) : 0);
  
  const displayValue = isNumeric 
    ? typeof value === 'string' 
      ? value.replace(/[0-9.,]+/, new Intl.NumberFormat('vi-VN').format(animatedNumber)) 
      : new Intl.NumberFormat('vi-VN').format(animatedNumber)
    : value || '0';

  const accent = colorAccents[color] || colorAccents.primary;

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, type: "spring", stiffness: 120 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={onClick}
      sx={{
        position: 'relative',
        cursor: onClick ? 'pointer' : 'default',
        p: compact ? 2 : 2.5,
        borderRadius: 2.5,
        background: '#ffffff',
        border: '1px solid',
        borderColor: 'rgba(0, 0, 0, 0.06)',
        borderLeft: `3px solid ${accent.border}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)',
        overflow: 'hidden',
        transition: 'all 0.25s ease',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
          borderColor: 'rgba(0, 0, 0, 0.1)',
          background: accent.bg,
        },
      }}
    >
      {/* Title row with icon */}
      <Box display="flex" alignItems="center" gap={1} sx={{ mb: compact ? 0.5 : 1 }}>
        {icon && (
          <Box
            sx={{
              width: compact ? 28 : 32,
              height: compact ? 28 : 32,
              borderRadius: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: accent.iconBg,
              color: accent.text,
              flexShrink: 0,
              '& .MuiSvgIcon-root': {
                fontSize: compact ? '0.95rem' : '1.1rem',
              },
            }}
          >
            {icon}
          </Box>
        )}
        <Typography 
          variant="body2"
          sx={{ 
            color: 'text.secondary', 
            fontWeight: 500, 
            fontSize: compact ? '0.75rem' : '0.8rem',
            lineHeight: 1.3,
          }}
        >
          {title}
        </Typography>
      </Box>

      {/* Value */}
      <Typography 
        component={motion.div}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.08 + 0.2 }}
        sx={{ 
          fontWeight: 700, 
          color: 'text.primary',
          fontSize: compact ? '1.25rem' : '1.75rem',
          letterSpacing: '-0.5px',
          lineHeight: 1.2,
          mt: 0.5,
        }}
      >
        {displayValue}
      </Typography>

      {/* Subtitle */}
      {subtitle && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', fontWeight: 400 }}>
          {subtitle}
        </Typography>
      )}

      {/* Trend indicator */}
      {(trend || trendValue) && (
        <Box display="flex" alignItems="center" mt={1} gap={0.5}>
          {trend === 'up' ? (
            <TrendingUp sx={{ color: theme.palette.success.main, fontSize: 16 }} />
          ) : trend === 'down' ? (
            <TrendingDown sx={{ color: theme.palette.error.main, fontSize: 16 }} />
          ) : null}
          <Typography
            variant="caption"
            sx={{ 
              color: trend === 'up' ? 'success.main' : trend === 'down' ? 'error.main' : 'text.secondary',
              fontWeight: 600,
              fontSize: '0.7rem',
            }}
          >
            {trendValue}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default StatCard;
