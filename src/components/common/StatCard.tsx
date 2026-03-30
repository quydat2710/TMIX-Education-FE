import React, { useEffect, useState } from 'react';
import { Box, Typography, Avatar, useTheme, Theme } from '@mui/material';
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
}

// Hook đếm số (Count-up) animate mượt mà
const useCountUp = (end: number, start = 0, duration = 1500) => {
  const [count, setCount] = useState(start);

  useEffect(() => {
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing out cubic function
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(easeOut * (end - start) + start);
      
      setCount(current);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(end); // Ensure we end exactly on the target number
      }
    };
    window.requestAnimationFrame(step);
  }, [end, start, duration]);

  return count;
};

// Định nghĩa Glow & Gradient cho từng color
const colorMap: Record<string, { gradient: string; shadow: string; glow: string }> = {
  primary: {
    gradient: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', // Navy to light blue
    shadow: 'rgba(59, 130, 246, 0.4)',
    glow: 'rgba(59, 130, 246, 0.15)',
  },
  secondary: {
    gradient: 'linear-gradient(135deg, #818cf8 0%, #4f46e5 100%)', // Indigo
    shadow: 'rgba(79, 70, 229, 0.4)',
    glow: 'rgba(79, 70, 229, 0.15)',
  },
  success: {
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', // Emerald
    shadow: 'rgba(16, 185, 129, 0.4)',
    glow: 'rgba(16, 185, 129, 0.15)',
  },
  error: {
    gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', // Red
    shadow: 'rgba(239, 68, 68, 0.4)',
    glow: 'rgba(239, 68, 68, 0.15)',
  },
  warning: {
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', // Amber
    shadow: 'rgba(245, 158, 11, 0.4)',
    glow: 'rgba(245, 158, 11, 0.15)',
  },
  info: {
    gradient: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)', // Sky blue
    shadow: 'rgba(14, 165, 233, 0.4)',
    glow: 'rgba(14, 165, 233, 0.15)',
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
}) => {
  const theme: Theme = useTheme();
  
  // Extract number for countUp safely
  let numericValue: number | string = value;
  if (typeof value === 'string') {
    if (!isNaN(Number(value))) {
      numericValue = Number(value);
    } else if (value.includes('%')) {
      numericValue = parseFloat(value.replace(/[^0-9.-]+/g, ""));
    } else {
      // Strip out spaces, currency symbols, AND thousand separators (dots or commas)
      numericValue = parseFloat(value.replace(/[^0-9-]/g, ""));
    }
  }

  const isNumeric = !isNaN(numericValue as number) && value !== null && value !== '';
  const animatedNumber = useCountUp(isNumeric ? (numericValue as number) : 0);
  
  // Combine formatted string with animated number
  const displayValue = isNumeric 
    ? typeof value === 'string' 
      ? value.replace(/[0-9.,]+/, new Intl.NumberFormat('vi-VN').format(animatedNumber)) 
      : new Intl.NumberFormat('vi-VN').format(animatedNumber)
    : value || '0';

  const styles = colorMap[color] || colorMap.primary;

  const getTrendIcon = (): React.ReactNode | null => {
    if (!trend) return null;
    return trend === 'up' ? (
      <TrendingUp sx={{ color: theme.palette.success.main, fontSize: 18 }} />
    ) : (
      <TrendingDown sx={{ color: theme.palette.error.main, fontSize: 18 }} />
    );
  };

  const getTrendColor = (): string => {
    if (!trend) return 'text.secondary';
    return trend === 'up' ? 'success.main' : 'error.main';
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1, 
        type: "spring", 
        stiffness: 100 
      }}
      whileHover={{ y: -8, scale: 1.02 }}
      onClick={onClick}
      sx={{
        position: 'relative',
        cursor: onClick ? 'pointer' : 'default',
        padding: 3,
        borderRadius: 4,
        background: '#ffffff',
        border: '1px solid rgba(0, 0, 0, 0.04)',
        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.02)',
        overflow: 'hidden',
        zIndex: 1,
        // Glow effect behind the card
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-50%',
          right: '-50%',
          width: '200%',
          height: '200%',
          background: `radial-gradient(circle at top right, ${styles.glow}, transparent 70%)`,
          opacity: 0,
          transition: 'opacity 0.4s ease-in-out',
          zIndex: -1,
        },
        '&:hover::before': {
          opacity: 1,
        },
        // Animated top border line
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: styles.gradient,
          transform: 'scaleX(0)',
          transformOrigin: 'left',
          transition: 'transform 0.4s ease-out',
        },
        '&:hover::after': {
          transform: 'scaleX(1)',
        }
      }}
    >
      <Box display="flex" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography 
          variant="overline" 
          sx={{ 
            color: 'text.secondary', 
            fontWeight: 600, 
            letterSpacing: 1,
            textTransform: 'uppercase',
            fontSize: '0.75rem'
          }}
        >
          {title}
        </Typography>

        {icon && (
          <Avatar
            component={motion.div}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
            sx={{
              background: styles.gradient,
              color: '#fff',
              width: 50,
              height: 50,
              boxShadow: `0 8px 16px -4px ${styles.shadow}`,
              // Add a subtle inner border
              border: '2px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            {icon}
          </Avatar>
        )}
      </Box>

      <Box>
        <Typography 
          variant="h3" 
          component={motion.h3}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 + 0.3 }}
          sx={{ 
            fontWeight: 800, 
            color: 'text.primary',
            letterSpacing: '-1px',
            lineHeight: 1.2
          }}
        >
          {displayValue}
        </Typography>

        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontWeight: 500 }}>
            {subtitle}
          </Typography>
        )}

        {(trend || trendValue) && (
          <Box display="flex" alignItems="center" mt={1.5} sx={{ 
            bgcolor: trend === 'up' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            padding: '4px 8px',
            borderRadius: '12px',
            display: 'inline-flex',
            width: 'fit-content'
          }}>
            {getTrendIcon()}
            <Typography
              variant="caption"
              color={getTrendColor()}
              sx={{ ml: 0.5, fontWeight: 700 }}
            >
              {trendValue}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default StatCard;
