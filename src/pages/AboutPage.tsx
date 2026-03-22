import React from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Paper,
} from '@mui/material';
import {
    School as SchoolIcon,
    Groups as GroupsIcon,
    EmojiEvents as TrophyIcon,
    Verified as VerifiedIcon,
} from '@mui/icons-material';
import PublicLayout from '../components/layouts/PublicLayout';
import AnimatedSection, { AnimatedItem, AnimatedCounter } from '../components/common/AnimatedSection';

// TMix brand colors
const NAVY = '#1E3A5F';
const NAVY_DARK = '#0F1F33';
const RED = '#D32F2F';

const stats = [
    { icon: <SchoolIcon sx={{ fontSize: 36 }} />, value: 10, suffix: '+', label: 'Năm kinh nghiệm', gradient: 'linear-gradient(135deg, #e53935 0%, #ff6659 100%)', glowColor: 'rgba(229, 57, 53, 0.2)' },
    { icon: <GroupsIcon sx={{ fontSize: 36 }} />, value: 500, suffix: '+', label: 'Học viên', gradient: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', glowColor: 'rgba(25, 118, 210, 0.2)' },
    { icon: <TrophyIcon sx={{ fontSize: 36 }} />, value: 50, suffix: '+', label: 'Giáo viên giỏi', gradient: 'linear-gradient(135deg, #f57c00 0%, #ffb74d 100%)', glowColor: 'rgba(245, 124, 0, 0.2)' },
    { icon: <VerifiedIcon sx={{ fontSize: 36 }} />, value: 98, suffix: '%', label: 'Hài lòng', gradient: 'linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%)', glowColor: 'rgba(46, 125, 50, 0.2)' },
];

const coreValues = [
    { title: 'Chất lượng giảng dạy', desc: 'Đội ngũ giáo viên giàu kinh nghiệm, phương pháp hiện đại, bài học sinh động.', icon: '🎯' },
    { title: 'Học viên là trung tâm', desc: 'Cá nhân hóa chương trình học phù hợp với từng trình độ và mục tiêu.', icon: '👨‍🎓' },
    { title: 'Đổi mới sáng tạo', desc: 'Áp dụng công nghệ và phương pháp giảng dạy tiên tiến nhất.', icon: '💡' },
    { title: 'Cam kết kết quả', desc: 'Đảm bảo đầu ra với các lộ trình học rõ ràng và đo lường được.', icon: '🏆' },
];

const AboutPage: React.FC = () => {
    return (
        <PublicLayout>
            {/* Hero Header */}
            <Box
                sx={{
                    background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_DARK} 100%)`,
                    color: '#fff',
                    py: { xs: 8, md: 12 },
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'radial-gradient(circle at 20% 80%, rgba(211,47,47,0.15) 0%, transparent 50%)',
                    },
                }}
            >
                <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
                    <AnimatedSection variant="fadeUp">
                        <Typography
                            variant="h3"
                            gutterBottom
                            sx={{
                                fontSize: { xs: '2rem', md: '3rem' },
                                letterSpacing: '-0.5px',
                                textShadow: '0 2px 8px rgba(0,0,0,0.4)',
                            }}
                        >
                            <span style={{ fontWeight: 600 }}>Về </span>
                            <span style={{ fontWeight: 800, color: '#FF6659' }}>TMix</span>{' '}
                            <span style={{ fontWeight: 800 }}>Education</span>
                        </Typography>
                        <Box sx={{ width: 60, height: 4, bgcolor: RED, mx: 'auto', mb: 2, borderRadius: 2 }} />
                        <Typography variant="h6" sx={{ opacity: 0.85, fontWeight: 400, lineHeight: 1.7, maxWidth: 600, mx: 'auto' }}>
                            Trung tâm Anh ngữ hàng đầu — đồng hành cùng bạn trên hành trình chinh phục tiếng Anh
                        </Typography>
                    </AnimatedSection>
                </Container>
            </Box>

            {/* Stats — floating glassmorphism cards */}
            <Container maxWidth="lg" sx={{ mt: -5, position: 'relative', zIndex: 1 }}>
                <AnimatedSection staggerChildren={0.1}>
                    <Grid container spacing={3}>
                        {stats.map((stat, idx) => (
                            <Grid item xs={6} md={3} key={idx}>
                                <AnimatedItem variant="fadeUp">
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 3,
                                            textAlign: 'center',
                                            borderRadius: 4,
                                            background: 'rgba(255, 255, 255, 0.85)',
                                            backdropFilter: 'blur(12px)',
                                            border: '1px solid rgba(255, 255, 255, 0.4)',
                                            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.06)',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                                            '&::before': {
                                                content: '""',
                                                position: 'absolute',
                                                top: 0, left: 0, right: 0,
                                                height: 4,
                                                background: stat.gradient,
                                            },
                                            '&:hover': {
                                                transform: 'translateY(-8px) scale(1.02)',
                                                boxShadow: `0 20px 50px ${stat.glowColor}`,
                                            },
                                        }}
                                    >
                                        <Box sx={{
                                            color: RED,
                                            mb: 1,
                                            display: 'inline-flex',
                                            p: 1,
                                            borderRadius: 2,
                                            background: 'rgba(211, 47, 47, 0.08)',
                                        }}>{stat.icon}</Box>
                                        <AnimatedCounter
                                            target={stat.value}
                                            suffix={stat.suffix}
                                            duration={2}
                                            style={{
                                                display: 'block',
                                                fontWeight: 800,
                                                fontSize: '2.2rem',
                                                lineHeight: 1,
                                                marginBottom: 4,
                                                background: stat.gradient,
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent',
                                                backgroundClip: 'text',
                                            }}
                                        />
                                        <Typography variant="body2" color="text.secondary" fontWeight={600}>
                                            {stat.label}
                                        </Typography>
                                    </Paper>
                                </AnimatedItem>
                            </Grid>
                        ))}
                    </Grid>
                </AnimatedSection>
            </Container>

            {/* Sứ mệnh & Tầm nhìn */}
            <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
                <AnimatedSection staggerChildren={0.15}>
                    <Grid container spacing={6}>
                        <Grid item xs={12} md={6}>
                            <AnimatedItem variant="fadeLeft">
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 4,
                                        borderRadius: 4,
                                        borderLeft: `5px solid ${RED}`,
                                        background: 'rgba(255,255,255,0.8)',
                                        backdropFilter: 'blur(10px)',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            boxShadow: '0 8px 30px rgba(211,47,47,0.1)',
                                            transform: 'translateX(4px)',
                                        },
                                    }}
                                >
                                    <Typography variant="h5" fontWeight={700} gutterBottom sx={{ color: NAVY }}>
                                        🎯 Sứ mệnh
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.9 }}>
                                        TMix Education cam kết mang đến môi trường học tập tiếng Anh chất lượng cao,
                                        giúp học viên tự tin giao tiếp và đạt được các chứng chỉ quốc tế.
                                        Chúng tôi tin rằng mỗi học viên đều có tiềm năng to lớn, và nhiệm vụ
                                        của chúng tôi là khơi dậy và phát triển tiềm năng đó.
                                    </Typography>
                                </Paper>
                            </AnimatedItem>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <AnimatedItem variant="fadeRight">
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 4,
                                        borderRadius: 4,
                                        borderLeft: `5px solid ${NAVY}`,
                                        background: 'rgba(255,255,255,0.8)',
                                        backdropFilter: 'blur(10px)',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            boxShadow: '0 8px 30px rgba(30,58,95,0.1)',
                                            transform: 'translateX(4px)',
                                        },
                                    }}
                                >
                                    <Typography variant="h5" fontWeight={700} gutterBottom sx={{ color: NAVY }}>
                                        🔭 Tầm nhìn
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.9 }}>
                                        Trở thành trung tâm Anh ngữ được tin yêu nhất, nơi mọi học viên
                                        đều có cơ hội tiếp cận giáo dục chất lượng quốc tế. Chúng tôi hướng tới
                                        xây dựng thế hệ học viên tự tin, năng động và sẵn sàng hội nhập toàn cầu.
                                    </Typography>
                                </Paper>
                            </AnimatedItem>
                        </Grid>
                    </Grid>
                </AnimatedSection>
            </Container>

            {/* Giá trị cốt lõi */}
            <Box sx={{ background: 'linear-gradient(180deg, #f8f9ff 0%, #ffffff 100%)', py: { xs: 6, md: 10 } }}>
                <Container maxWidth="lg">
                    <AnimatedSection variant="fadeUp" sx={{ textAlign: 'center', mb: 5 }}>
                        <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }}>
                            <span style={{ color: '#333', fontWeight: 600 }}>Giá trị </span>
                            <span style={{ color: RED, fontWeight: 700 }}>cốt lõi</span>
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5, maxWidth: 600, mx: 'auto' }}>
                            Những nguyên tắc định hướng mọi hoạt động của TMix Education
                        </Typography>
                    </AnimatedSection>

                    <AnimatedSection staggerChildren={0.1}>
                        <Grid container spacing={3}>
                            {coreValues.map((item, idx) => (
                                <Grid item xs={12} sm={6} key={idx}>
                                    <AnimatedItem variant="fadeUp">
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 3.5,
                                                height: '100%',
                                                borderRadius: 4,
                                                background: 'rgba(255, 255, 255, 0.75)',
                                                backdropFilter: 'blur(10px)',
                                                border: '1px solid rgba(0,0,0,0.06)',
                                                transition: 'all 0.4s ease',
                                                '&:hover': {
                                                    borderColor: RED,
                                                    boxShadow: '0 8px 30px rgba(211,47,47,0.1)',
                                                    transform: 'translateY(-4px)',
                                                    '& .value-icon': { transform: 'scale(1.2) rotate(5deg)' },
                                                },
                                            }}
                                        >
                                            <Box className="value-icon" sx={{ fontSize: '2rem', mb: 1.5, transition: 'transform 0.3s ease' }}>
                                                {item.icon}
                                            </Box>
                                            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: NAVY }}>
                                                {item.title}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                                                {item.desc}
                                            </Typography>
                                        </Paper>
                                    </AnimatedItem>
                                </Grid>
                            ))}
                        </Grid>
                    </AnimatedSection>
                </Container>
            </Box>

            {/* Liên hệ CTA */}
            <Box sx={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_DARK} 100%)`, py: { xs: 6, md: 8 } }}>
                <Container maxWidth="md" sx={{ textAlign: 'center' }}>
                    <AnimatedSection variant="fadeUp">
                        <Typography variant="h5" gutterBottom sx={{ color: '#fff' }}>
                            <span style={{ fontWeight: 600 }}>Liên hệ với </span>
                            <span style={{ fontWeight: 800, color: '#FF6659' }}>TMix</span>{' '}
                            <span style={{ fontWeight: 800 }}>Education</span>
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.8, maxWidth: 500, mx: 'auto' }}>
                            Nếu bạn có bất kỳ câu hỏi nào hoặc muốn tìm hiểu thêm, đừng ngần ngại liên hệ.
                            Đội ngũ tư vấn luôn sẵn sàng hỗ trợ bạn.
                        </Typography>
                    </AnimatedSection>
                </Container>
            </Box>
        </PublicLayout>
    );
};

export default AboutPage;
