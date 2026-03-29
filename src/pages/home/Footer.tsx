import React from 'react';
import { Box, Container, Grid, Typography, Link, IconButton, Divider } from '@mui/material';
import {
  Facebook as FacebookIcon, Instagram as InstagramIcon, YouTube as YouTubeIcon,
  Phone as PhoneIcon, Email as EmailIcon
} from '@mui/icons-material';
import AnimatedSection from '../../components/common/AnimatedSection';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterLinks {
  about: FooterLink[];
  courses: FooterLink[];
  support: FooterLink[];
}

const Footer: React.FC = () => {
  const currentYear: number = new Date().getFullYear();

  const footerLinks: FooterLinks = {
    about: [
      { label: 'Về chúng tôi', href: '/about' },
      { label: 'Đội ngũ giảng viên', href: '/teachers' },
      { label: 'Cơ sở vật chất', href: '/facilities' },
      { label: 'Tuyển dụng', href: '/careers' },
    ],
    courses: [
      { label: 'Tiếng Anh Giao Tiếp', href: '/courses/communication' },
      { label: 'Luyện Thi IELTS', href: '/courses/ielts' },
      { label: 'Tiếng Anh Doanh Nghiệp', href: '/courses/business' },
      { label: 'Tiếng Anh Trẻ Em', href: '/courses/kids' },
    ],
    support: [
      { label: 'FAQ', href: '/faq' },
      { label: 'Chính sách bảo mật', href: '/privacy' },
      { label: 'Điều khoản sử dụng', href: '/terms' },
      { label: 'Liên hệ', href: '/contact' },
    ],
  };

  const socialButtons = [
    { icon: <FacebookIcon />, href: 'https://facebook.com/tmixeducation', hoverBg: '#1877F2', label: 'Facebook' },
    { icon: <YouTubeIcon />, href: 'https://youtube.com/@tmixeducation', hoverBg: '#FF0000', label: 'YouTube' },
    { icon: <InstagramIcon />, href: 'https://tiktok.com/@tmixeducation', hoverBg: '#E4405F', label: 'TikTok' },
    { icon: <PhoneIcon />, href: 'https://zalo.me/0977730167', hoverBg: '#0068FF', label: 'Zalo' },
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
      {/* Gradient top border */}
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
            {/* Logo và thông tin liên hệ */}
            <Grid item xs={12} md={4}>
              <Typography
                variant="h5"
                gutterBottom
                sx={{
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #FF6659, #D32F2F)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                TMix Education
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, mb: 2 }}>
                Trung tâm đào tạo chất lượng cao với đội ngũ giảng viên chuyên nghiệp và phương pháp giảng dạy hiện đại.
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                  <PhoneIcon sx={{ mr: 1, color: '#FF6659', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>097.773.0167 - 098.681.9955</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                  <EmailIcon sx={{ mr: 1, color: '#FF6659', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>info@tmixeducation.com</Typography>
                </Box>
              </Box>
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, color: '#FF6659', fontWeight: 700 }}>
                Hệ thống cơ sở:
              </Typography>
              <Box sx={{ fontSize: '0.85rem' }}>
                {[
                  'CS1: 6/111 An Trai, Vân Canh, Hoài Đức',
                  'CS2: Hàm Nghi, Mỹ Đình, Nam Từ Liêm',
                  'CS3: Ngõ 31/22 Trần Quốc Hoàn, Cầu Giấy',
                  'CS4: 86 Cầu Diễn, Phúc Diễn, Bắc Từ Liêm',
                  'CS5: Số 5 Nguyễn Đổ Cung, Dịch Vọng, Cầu Giấy',
                ].map((addr) => (
                  <Typography key={addr} variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mb: 0.5, fontSize: '0.8rem' }}>
                    {addr}
                  </Typography>
                ))}
              </Box>
            </Grid>

            {/* Links */}
            <Grid item xs={12} md={8}>
              <Grid container spacing={4}>
                {[
                  { title: 'Về chúng tôi', links: footerLinks.about },
                  { title: 'Khóa học', links: footerLinks.courses },
                  { title: 'Hỗ trợ', links: footerLinks.support },
                ].map(({ title, links }) => (
                  <Grid item xs={12} sm={4} key={title}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, fontSize: '1rem' }}>
                      {title}
                    </Typography>
                    {links.map((link) => (
                      <Link
                        key={link.label}
                        href={link.href}
                        color="inherit"
                        display="block"
                        sx={{
                          mb: 1.2,
                          textDecoration: 'none',
                          color: 'rgba(255,255,255,0.55)',
                          fontSize: '0.9rem',
                          transition: 'all 0.3s ease',
                          position: 'relative',
                          '&:hover': {
                            color: '#FF6659',
                            transform: 'translateX(4px)',
                          },
                        }}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </AnimatedSection>

        <Divider sx={{ my: 4, bgcolor: 'rgba(255,255,255,0.08)' }} />

        {/* Social media và copyright */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)' }}>
              © {currentYear} TMix Education. All rights reserved.
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'rgba(255,255,255,0.3)' }}>
              Đào tạo chất lượng - Kiến tạo tương lai
            </Typography>
          </Box>
          <Box sx={{ mt: { xs: 2, sm: 0 }, display: 'flex', gap: 1.5 }}>
            {socialButtons.map(({ icon, href, hoverBg, label }) => (
              <IconButton
                key={label}
                component="a"
                href={href}
                target="_blank"
                sx={{
                  color: 'rgba(255,255,255,0.7)',
                  bgcolor: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  width: 40,
                  height: 40,
                  transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  '&:hover': {
                    bgcolor: hoverBg,
                    color: 'white',
                    transform: 'translateY(-4px) scale(1.1)',
                    boxShadow: `0 8px 20px ${hoverBg}40`,
                    border: `1px solid ${hoverBg}`,
                  },
                }}
                aria-label={label}
              >
                {icon}
              </IconButton>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
