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
 * Tổng hợp tất cả các section: Banner, About, Featured Teachers, Feedback, Registration
 */
const InteractiveHome: React.FC = () => {
    return (
        <PublicLayout>
            {/* Welcome Popup */}
            <HomeWelcomeAdPopup />

            {/* Banner Carousel - Quảng cáo */}
            <BannerCarousel />

            {/* About Section - Giới thiệu trung tâm */}
            <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
                <AboutSection />
            </Container>

            {/* Featured Teachers - Giáo viên tiêu biểu */}
            <Box sx={{ py: { xs: 4, md: 6 }, bgcolor: '#fafafa' }}>
                <Container maxWidth="lg">
                    <FeaturedTeachersHome />
                </Container>
            </Box>

            {/* Feedback - Phản hồi học viên */}
            <Box sx={{ py: { xs: 4, md: 6 } }}>
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
