import React from 'react';
import { Box, Container, Grid, Typography, Link, IconButton, Divider } from '@mui/material';
import {
  Facebook as FacebookIcon, Instagram as InstagramIcon, YouTube as YouTubeIcon,
  Phone as PhoneIcon, Email as EmailIcon
} from '@mui/icons-material';
import { COLORS } from '../../utils/colors';

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

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'grey.900',
        color: 'white',
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Logo và thông tin liên hệ */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: COLORS.primary.main }}>
              TMix Education
            </Typography>
            <Typography variant="body2" color="grey.400" paragraph>
              Trung tâm đào tạo chất lượng cao với đội ngũ giảng viên chuyên nghiệp và phương pháp giảng dạy hiện đại.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <PhoneIcon sx={{ mr: 1, color: COLORS.primary.main }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>097.773.0167 - 098.681.9955</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <EmailIcon sx={{ mr: 1, color: COLORS.primary.main }} />
                <Typography variant="body2">info@tmixeducation.com</Typography>
              </Box>
            </Box>
            {/* Danh sách cơ sở */}
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, color: COLORS.primary.light, fontWeight: 600 }}>
              Hệ thống cơ sở:
            </Typography>
            <Box sx={{ fontSize: '0.85rem' }}>
              <Typography variant="body2" color="grey.400" sx={{ mb: 0.5 }}>
                <strong>CS1:</strong> 6/111 An Trai, Vân Canh, Hoài Đức
              </Typography>
              <Typography variant="body2" color="grey.400" sx={{ mb: 0.5 }}>
                <strong>CS2:</strong> Hàm Nghi, Mỹ Đình, Nam Từ Liêm
              </Typography>
              <Typography variant="body2" color="grey.400" sx={{ mb: 0.5 }}>
                <strong>CS3:</strong> Ngõ 31/22 Trần Quốc Hoàn, Cầu Giấy
              </Typography>
              <Typography variant="body2" color="grey.400" sx={{ mb: 0.5 }}>
                <strong>CS4:</strong> 86 Cầu Diễn, Phúc Diễn, Bắc Từ Liêm
              </Typography>
              <Typography variant="body2" color="grey.400">
                <strong>CS5:</strong> Số 5 Nguyễn Đổ Cung, Dịch Vọng, Cầu Giấy
              </Typography>
            </Box>
          </Grid>

          {/* Links */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={4}>
                <Typography variant="h6" gutterBottom>
                  Về chúng tôi
                </Typography>
                {footerLinks.about.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    color="inherit"
                    display="block"
                    sx={{ mb: 1, textDecoration: 'none', '&:hover': { color: COLORS.primary.main } }}
                  >
                    {link.label}
                  </Link>
                ))}
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="h6" gutterBottom>
                  Khóa học
                </Typography>
                {footerLinks.courses.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    color="inherit"
                    display="block"
                    sx={{ mb: 1, textDecoration: 'none', '&:hover': { color: COLORS.primary.main } }}
                  >
                    {link.label}
                  </Link>
                ))}
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="h6" gutterBottom>
                  Hỗ trợ
                </Typography>
                {footerLinks.support.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    color="inherit"
                    display="block"
                    sx={{ mb: 1, textDecoration: 'none', '&:hover': { color: COLORS.primary.main } }}
                  >
                    {link.label}
                  </Link>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, bgcolor: 'grey.800' }} />

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
            <Typography variant="body2" color="grey.400">
              © {currentYear} TMix Education. All rights reserved.
            </Typography>
            <Typography variant="caption" color="grey.500" sx={{ display: 'block', mt: 0.5 }}>
              Đào tạo chất lượng - Kiến tạo tương lai
            </Typography>
          </Box>
          <Box sx={{ mt: { xs: 2, sm: 0 }, display: 'flex', gap: 1 }}>
            <IconButton
              component="a"
              href="https://facebook.com/tmixeducation"
              target="_blank"
              sx={{
                color: 'white',
                bgcolor: 'rgba(255,255,255,0.1)',
                '&:hover': { bgcolor: '#1877F2', transform: 'translateY(-3px)' },
                transition: 'all 0.3s ease'
              }}
              aria-label="Facebook"
            >
              <FacebookIcon />
            </IconButton>
            <IconButton
              component="a"
              href="https://youtube.com/@tmixeducation"
              target="_blank"
              sx={{
                color: 'white',
                bgcolor: 'rgba(255,255,255,0.1)',
                '&:hover': { bgcolor: '#FF0000', transform: 'translateY(-3px)' },
                transition: 'all 0.3s ease'
              }}
              aria-label="YouTube"
            >
              <YouTubeIcon />
            </IconButton>
            <IconButton
              component="a"
              href="https://tiktok.com/@tmixeducation"
              target="_blank"
              sx={{
                color: 'white',
                bgcolor: 'rgba(255,255,255,0.1)',
                '&:hover': { bgcolor: '#000000', transform: 'translateY(-3px)' },
                transition: 'all 0.3s ease'
              }}
              aria-label="TikTok"
            >
              <InstagramIcon />
            </IconButton>
            <IconButton
              component="a"
              href="https://zalo.me/0977730167"
              target="_blank"
              sx={{
                color: 'white',
                bgcolor: 'rgba(255,255,255,0.1)',
                '&:hover': { bgcolor: '#0068FF', transform: 'translateY(-3px)' },
                transition: 'all 0.3s ease'
              }}
              aria-label="Zalo"
            >
              <PhoneIcon />
            </IconButton>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
