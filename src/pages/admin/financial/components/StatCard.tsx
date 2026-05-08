import React from 'react';
import { Box, Paper, Typography, Skeleton } from '@mui/material';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  accent: string;
  subtitle?: string;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, accent, subtitle, loading }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2.5,
      borderRadius: 3,
      border: '1px solid rgba(0,0,0,0.04)',
      borderLeft: `4px solid ${accent}`,
      bgcolor: '#fff',
      height: '100%',
      transition: 'all 0.25s ease',
      '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.06)', transform: 'translateY(-1px)' },
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
      <Box sx={{ color: accent, display: 'flex', '& .MuiSvgIcon-root': { fontSize: 18 } }}>{icon}</Box>
      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.72rem', letterSpacing: '0.3px', textTransform: 'uppercase' }}>
        {title}
      </Typography>
    </Box>
    {loading ? (
      <>
        <Skeleton variant="text" width="70%" height={32} sx={{ borderRadius: 1 }} />
        <Skeleton variant="text" width="90%" height={16} sx={{ mt: 0.5, borderRadius: 1 }} />
      </>
    ) : (
      <>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: '#0f172a',
            fontSize: { xs: '1.1rem', md: '1.35rem' },
            lineHeight: 1.2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.72rem', mt: 0.5, display: 'block' }}>
            {subtitle}
          </Typography>
        )}
      </>
    )}
  </Paper>
);

export default StatCard;
