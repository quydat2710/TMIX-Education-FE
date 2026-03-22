import React from 'react';
import { Box, Container } from '@mui/material';
import PublicLayout from '../../components/layouts/PublicLayout';

// Home page sections
import { BannerCarousel } from './components';
import HomeWelcomeAdPopup from './components/WelcomeAdPopup';
import AboutSection from './components/AboutSection';
import FeaturedTeachersHome from '../../components/features/home/FeaturedTeachersHome';
import FeedbackHome from '../../components/features/home/FeedbackHome';
import ConsultationRegistration from '../../components/features/home/ConsultationRegistration';

/**
 * InteractiveHome - Trang chủ chính của website TMix Education
 * Full premium redesign with scroll animations, glassmorphism, and modern effects
 */
const InteractiveHome: React.FC = () => {
    return (
        <PublicLayout>
            {/* Welcome Popup */}
            <HomeWelcomeAdPopup />

            {/* Banner Carousel - Quảng cáo */}
            <BannerCarousel />

            {/* About Section - Giới thiệu trung tâm */}
            <Box
                sx={{
                    py: { xs: 5, md: 8 },
                    position: 'relative',
                    background: 'linear-gradient(180deg, #ffffff 0%, #f8f9ff 100%)',
                }}
            >
                {/* Subtle dot pattern background */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        opacity: 0.3,
                        backgroundImage: 'radial-gradient(circle, #ddd 1px, transparent 1px)',
                        backgroundSize: '30px 30px',
                    }}
                />
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <AboutSection />
                </Container>
            </Box>

            {/* Section Divider */}
            <Box
                sx={{
                    height: 2,
                    background: 'linear-gradient(90deg, transparent, rgba(229,57,53,0.15), rgba(25,118,210,0.15), transparent)',
                }}
            />

            {/* Featured Teachers - Giáo viên tiêu biểu */}
            <Box
                sx={{
                    py: { xs: 5, md: 8 },
                    background: 'linear-gradient(180deg, #fafbff 0%, #f5f6fa 50%, #fafbff 100%)',
                }}
            >
                <Container maxWidth="lg">
                    <FeaturedTeachersHome />
                </Container>
            </Box>

            {/* Section Divider */}
            <Box
                sx={{
                    height: 2,
                    background: 'linear-gradient(90deg, transparent, rgba(229,57,53,0.15), rgba(25,118,210,0.15), transparent)',
                }}
            />

            {/* Feedback - Phản hồi học viên */}
            <Box
                sx={{
                    py: { xs: 5, md: 8 },
                    background: 'linear-gradient(180deg, #ffffff 0%, #fef7f7 100%)',
                }}
            >
                <Container maxWidth="lg">
                    <FeedbackHome />
                </Container>
            </Box>

            {/* Consultation Registration - Đăng ký tư vấn */}
            <ConsultationRegistration />
        </PublicLayout>
    );
};

export default InteractiveHome;
