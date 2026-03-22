import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import AnimatedSection, { AnimatedItem, AnimatedCounter } from '../../../components/common/AnimatedSection';

const stats = [
  {
    number: 10,
    suffix: '+',
    label: 'Năm kinh nghiệm',
    description: 'Phục vụ hàng nghìn học viên với chất lượng giảng dạy hàng đầu',
    gradient: 'linear-gradient(135deg, #e53935 0%, #ff6659 100%)',
    icon: '🏆',
    glowColor: 'rgba(229, 57, 53, 0.25)',
  },
  {
    number: 500,
    suffix: '+',
    label: 'Học viên đã tin tưởng',
    description: 'Cộng đồng học viên năng động và luôn phát triển',
    gradient: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
    icon: '👨‍🎓',
    glowColor: 'rgba(25, 118, 210, 0.25)',
  },
  {
    number: 95,
    suffix: '%',
    label: 'Tỷ lệ hài lòng',
    description: 'Cam kết chất lượng đào tạo xuất sắc được công nhận',
    gradient: 'linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%)',
    icon: '⭐',
    glowColor: 'rgba(46, 125, 50, 0.25)',
  },
  {
    number: 20,
    suffix: '+',
    label: 'Giáo viên chuyên nghiệp',
    description: 'Đội ngũ giảng viên giàu kinh nghiệm và tâm huyết',
    gradient: 'linear-gradient(135deg, #f57c00 0%, #ffb74d 100%)',
    icon: '👩‍🏫',
    glowColor: 'rgba(245, 124, 0, 0.25)',
  },
];

const AboutSection: React.FC = () => {
  return (
    <Box id="about-section" sx={{ mb: 4, position: 'relative' }}>
      {/* Section Title */}
      <AnimatedSection variant="fadeUp" sx={{ textAlign: 'center', mb: 6 }}>
        <Typography
          variant="overline"
          sx={{
            color: '#e53935',
            fontWeight: 700,
            letterSpacing: 3,
            fontSize: '0.85rem',
            mb: 1,
            display: 'block',
          }}
        >
          VỀ CHÚNG TÔI
        </Typography>
        <Typography
          variant="h2"
          sx={{
            fontSize: { xs: '2rem', md: '2.8rem' },
            mb: 1.5,
          }}
        >
          <span style={{ color: '#333333', fontWeight: 600 }}>Tìm hiểu về </span>
          <span style={{ color: '#D32F2F', fontWeight: 700 }}>TMix</span>{' '}
          <span style={{ color: '#1E3A5F', fontWeight: 700 }}>Education</span>
        </Typography>
      </AnimatedSection>

      {/* Stats Grid */}
      <AnimatedSection staggerChildren={0.12}>
        <Grid container spacing={3}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <AnimatedItem variant="fadeUp">
                <Paper
                  elevation={0}
                  sx={{
                    p: 3.5,
                    height: '100%',
                    background: 'rgba(255, 255, 255, 0.75)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    borderRadius: 4,
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.06)',
                    transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    cursor: 'default',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: stat.gradient,
                      borderRadius: '16px 16px 0 0',
                    },
                    '&:hover': {
                      transform: 'translateY(-10px) scale(1.02)',
                      boxShadow: `0 20px 50px ${stat.glowColor}, 0 8px 20px rgba(0,0,0,0.08)`,
                      border: `1px solid ${stat.glowColor}`,
                      '& .stat-icon': {
                        transform: 'scale(1.15) rotate(5deg)',
                      },
                    },
                  }}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    {/* Icon */}
                    <Box
                      className="stat-icon"
                      sx={{
                        fontSize: '2.5rem',
                        mb: 1.5,
                        transition: 'transform 0.4s ease',
                        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
                      }}
                    >
                      {stat.icon}
                    </Box>

                    {/* Counter */}
                    <AnimatedCounter
                      target={stat.number}
                      suffix={stat.suffix}
                      duration={2.5}
                      style={{
                        fontWeight: 800,
                        fontSize: '2.8rem',
                        lineHeight: 1,
                        display: 'block',
                        marginBottom: 8,
                        background: stat.gradient,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    />

                    {/* Label */}
                    <Typography
                      variant="h6"
                      sx={{
                        color: '#1E3A5F',
                        fontWeight: 700,
                        mb: 1,
                        fontSize: '1rem',
                      }}
                    >
                      {stat.label}
                    </Typography>

                    {/* Description */}
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#666',
                        lineHeight: 1.7,
                        fontSize: '0.875rem',
                      }}
                    >
                      {stat.description}
                    </Typography>
                  </Box>
                </Paper>
              </AnimatedItem>
            </Grid>
          ))}
        </Grid>
      </AnimatedSection>
    </Box>
  );
};

export default AboutSection;
