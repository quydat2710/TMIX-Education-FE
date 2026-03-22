import React from 'react';
import { Box, Container, Grid, Typography, Link, IconButton } from '@mui/material';
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Facebook as FacebookIcon,
  YouTube as YouTubeIcon
} from '@mui/icons-material';
import { useFooterSettings } from '../../hooks/useFooterSettings';
import AnimatedSection from '../common/AnimatedSection';

const Footer: React.FC = () => {
  const { footerSettings: settings } = useFooterSettings();

  const socialLinks = [
    { icon: <FacebookIcon fontSize="small" />, url: settings.facebookUrl, hoverBg: '#1877F2', label: 'Facebook' },
    { icon: <YouTubeIcon fontSize="small" />, url: settings.youtubeUrl, hoverBg: '#FF0000', label: 'YouTube' },
    { icon: <Typography sx={{ fontSize: '11px', fontWeight: 700, color: 'white' }}>Z</Typography>, url: settings.zaloUrl, hoverBg: '#0068FF', label: 'Zalo' },
  ];

  return (
    <Box
      component="footer"
      sx={{
        position: 'relative',
        bgcolor: '#0F1F33',
        color: 'white',
        py: 6,
        mt: 'auto',
        overflow: 'hidden',
      }}
    >
      {/* Animated gradient top border */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: 'linear-gradient(90deg, #D32F2F 0%, #FF6659 25%, #1976d2 50%, #42a5f5 75%, #D32F2F 100%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 3s linear infinite',
        }}
      />

      <Container maxWidth="lg">
        <AnimatedSection variant="fadeUp">
          <Grid container spacing={4}>
            {/* Cột 1: Về chúng tôi */}
            <Grid item xs={12} sm={6} md={4}>
              <Typography
                variant="h5"
                gutterBottom
                sx={{
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #FF6659, #D32F2F)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 2,
                }}
              >
                {settings.companyName}
              </Typography>
              <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.8, color: 'rgba(255,255,255,0.55)' }}>
                {settings.description || 'Trung tâm Anh ngữ chất lượng cao với đội ngũ giáo viên giàu kinh nghiệm.'}
              </Typography>

              {/* Social Media */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600, mb: 1.5, fontSize: '0.85rem' }}>
                  Theo dõi chúng tôi
                </Typography>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  {socialLinks.map(({ icon, url, hoverBg, label }) => (
                    <IconButton
                      key={label}
                      component={url ? 'a' : 'div'}
                      href={url || undefined}
                      target={url ? '_blank' : undefined}
                      rel={url ? 'noopener noreferrer' : undefined}
                      sx={{
                        color: 'rgba(255,255,255,0.7)',
                        bgcolor: url ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        width: 40,
                        height: 40,
                        cursor: url ? 'pointer' : 'default',
                        opacity: url ? 1 : 0.4,
                        transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                        '&:hover': url
                          ? {
                              bgcolor: hoverBg,
                              color: 'white',
                              transform: 'translateY(-4px) scale(1.1)',
                              boxShadow: `0 8px 20px ${hoverBg}40`,
                              border: `1px solid ${hoverBg}`,
                            }
                          : {},
                      }}
                      aria-label={label}
                      title={label}
                    >
                      {icon}
                    </IconButton>
                  ))}
                </Box>
              </Box>
            </Grid>

            {/* Cột 2: Thông tin liên hệ */}
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: 'white', fontSize: '1rem' }}>
                Thông tin liên hệ
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {/* Address */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <Box
                    sx={{
                      minWidth: 38,
                      height: 38,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mt: 0.2,
                      boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                    }}
                  >
                    <LocationIcon sx={{ color: 'white', fontSize: 18 }} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600, mb: 0.8, fontSize: '0.85rem' }}>
                      Hệ thống cơ sở
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                      {settings.address.split('|').map((branch, index) => (
                        <Typography
                          key={index}
                          variant="body2"
                          sx={{
                            color: 'rgba(255,255,255,0.5)',
                            fontSize: '0.78rem',
                            lineHeight: 1.5,
                            transition: 'all 0.3s ease',
                            '&:hover': { color: '#FF6659', transform: 'translateX(3px)' },
                          }}
                        >
                          📍 {branch.trim()}
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                </Box>

                {/* Phone */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <Box
                    sx={{
                      minWidth: 38,
                      height: 38,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #e53935, #FF6659)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(229, 57, 53, 0.3)',
                    }}
                  >
                    <PhoneIcon sx={{ color: 'white', fontSize: 18 }} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600, mb: 0.3, fontSize: '0.85rem' }}>
                      Điện thoại
                    </Typography>
                    <Link
                      href={`tel:${settings.phone.replace(/\s/g, '')}`}
                      sx={{
                        color: 'rgba(255,255,255,0.55)',
                        textDecoration: 'none',
                        fontSize: '0.85rem',
                        display: 'block',
                        transition: 'all 0.3s ease',
                        '&:hover': { color: '#FF6659' },
                      }}
                    >
                      {settings.phone}
                    </Link>
                  </Box>
                </Box>

                {/* Email */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <Box
                    sx={{
                      minWidth: 38,
                      height: 38,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #f57c00, #ffb74d)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(245, 124, 0, 0.3)',
                    }}
                  >
                    <EmailIcon sx={{ color: 'white', fontSize: 18 }} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600, mb: 0.3, fontSize: '0.85rem' }}>
                      Email
                    </Typography>
                    <Link
                      href={`mailto:${settings.email}`}
                      sx={{
                        color: 'rgba(255,255,255,0.55)',
                        textDecoration: 'none',
                        fontSize: '0.85rem',
                        display: 'block',
                        wordBreak: 'break-word',
                        transition: 'all 0.3s ease',
                        '&:hover': { color: '#FF6659' },
                      }}
                    >
                      {settings.email}
                    </Link>
                  </Box>
                </Box>
              </Box>
            </Grid>

            {/* Cột 3: Bản đồ */}
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: 'white', fontSize: '1rem' }}>
                Bản đồ
              </Typography>
              {settings.mapEmbedUrl && settings.mapEmbedUrl.includes('google.com/maps/embed') ? (
                <Box
                  sx={{
                    width: '100%',
                    height: 200,
                    borderRadius: 3,
                    overflow: 'hidden',
                    border: '2px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                  }}
                >
                  <iframe
                    src={settings.mapEmbedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Google Map Location"
                  />
                </Box>
              ) : (
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>
                  Bản đồ chưa được cấu hình
                </Typography>
              )}
            </Grid>
          </Grid>
        </AnimatedSection>

        {/* Copyright */}
        <Box
          sx={{
            mt: 4,
            pt: 3,
            borderTop: '1px solid rgba(255,255,255,0.06)',
            textAlign: 'center',
          }}
        >
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.35)' }}>
            © {new Date().getFullYear()} {settings.companyName}. All rights reserved.
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'rgba(255,255,255,0.2)' }}>
            Đào tạo chất lượng - Kiến tạo tương lai
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
