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

// TMix brand colors
const NAVY = '#1E3A5F';
const NAVY_DARK = '#0F1F33';
const RED = '#D32F2F';

const stats = [
    { icon: <SchoolIcon sx={{ fontSize: 40 }} />, value: '10+', label: 'Năm kinh nghiệm' },
    { icon: <GroupsIcon sx={{ fontSize: 40 }} />, value: '500+', label: 'Học viên' },
    { icon: <TrophyIcon sx={{ fontSize: 40 }} />, value: '50+', label: 'Giáo viên giỏi' },
    { icon: <VerifiedIcon sx={{ fontSize: 40 }} />, value: '98%', label: 'Hài lòng' },
];

const AboutPage: React.FC = () => {
    return (
        <PublicLayout>
            {/* Hero Header — TMix Navy gradient */}
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
                    <Typography
                        variant="h3"
                        fontWeight={800}
                        gutterBottom
                        sx={{
                            fontSize: { xs: '2rem', md: '3rem' },
                            letterSpacing: '-0.5px',
                            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                        }}
                    >
                        Về TMix Education
                    </Typography>
                    <Box sx={{ width: 60, height: 4, bgcolor: RED, mx: 'auto', mb: 2, borderRadius: 2 }} />
                    <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400, lineHeight: 1.7, maxWidth: 600, mx: 'auto' }}>
                        Trung tâm Anh ngữ hàng đầu — đồng hành cùng bạn trên hành trình chinh phục tiếng Anh
                    </Typography>
                </Container>
            </Box>

            {/* Stats — floating cards */}
            <Container maxWidth="lg" sx={{ mt: -5, position: 'relative', zIndex: 1 }}>
                <Grid container spacing={3}>
                    {stats.map((stat, idx) => (
                        <Grid item xs={6} md={3} key={idx}>
                            <Paper
                                elevation={4}
                                sx={{
                                    p: 3,
                                    textAlign: 'center',
                                    borderRadius: 3,
                                    borderTop: `4px solid ${RED}`,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-6px)',
                                        boxShadow: '0 12px 40px rgba(30,58,95,0.15)',
                                    },
                                }}
                            >
                                <Box sx={{ color: RED, mb: 1 }}>{stat.icon}</Box>
                                <Typography variant="h4" fontWeight={800} sx={{ color: NAVY }}>
                                    {stat.value}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                    {stat.label}
                                </Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* Sứ mệnh & Tầm nhìn */}
            <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
                <Grid container spacing={6}>
                    <Grid item xs={12} md={6}>
                        <Box sx={{ borderLeft: `4px solid ${RED}`, pl: 3 }}>
                            <Typography variant="h5" fontWeight={700} gutterBottom sx={{ color: NAVY }}>
                                Sứ mệnh
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.9 }}>
                                TMix Education cam kết mang đến môi trường học tập tiếng Anh chất lượng cao,
                                giúp học viên tự tin giao tiếp và đạt được các chứng chỉ quốc tế.
                                Chúng tôi tin rằng mỗi học viên đều có tiềm năng to lớn, và nhiệm vụ
                                của chúng tôi là khơi dậy và phát triển tiềm năng đó.
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Box sx={{ borderLeft: `4px solid ${NAVY}`, pl: 3 }}>
                            <Typography variant="h5" fontWeight={700} gutterBottom sx={{ color: NAVY }}>
                                Tầm nhìn
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.9 }}>
                                Trở thành trung tâm Anh ngữ được tin yêu nhất, nơi mọi học viên
                                đều có cơ hội tiếp cận giáo dục chất lượng quốc tế. Chúng tôi hướng tới
                                xây dựng thế hệ học viên tự tin, năng động và sẵn sàng hội nhập toàn cầu.
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Container>

            {/* Giá trị cốt lõi */}
            <Box sx={{ bgcolor: '#f8f9fc', py: { xs: 6, md: 10 } }}>
                <Container maxWidth="lg">
                    <Typography variant="h5" fontWeight={700} textAlign="center" gutterBottom sx={{ color: NAVY }}>
                        Giá trị cốt lõi
                    </Typography>
                    <Box sx={{ width: 50, height: 4, bgcolor: RED, mx: 'auto', mb: 1, borderRadius: 2 }} />
                    <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 5, maxWidth: 600, mx: 'auto' }}>
                        Những nguyên tắc định hướng mọi hoạt động của TMix Education
                    </Typography>
                    <Grid container spacing={3}>
                        {[
                            { title: 'Chất lượng giảng dạy', desc: 'Đội ngũ giáo viên giàu kinh nghiệm, phương pháp hiện đại, bài học sinh động.' },
                            { title: 'Học viên là trung tâm', desc: 'Cá nhân hóa chương trình học phù hợp với từng trình độ và mục tiêu.' },
                            { title: 'Đổi mới sáng tạo', desc: 'Áp dụng công nghệ và phương pháp giảng dạy tiên tiến nhất.' },
                            { title: 'Cam kết kết quả', desc: 'Đảm bảo đầu ra với các lộ trình học rõ ràng và đo lường được.' },
                        ].map((item, idx) => (
                            <Grid item xs={12} sm={6} key={idx}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 3.5,
                                        height: '100%',
                                        borderRadius: 3,
                                        border: '1px solid #e8ecf1',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            borderColor: RED,
                                            boxShadow: '0 4px 20px rgba(211,47,47,0.08)',
                                        },
                                    }}
                                >
                                    <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: NAVY }}>
                                        {item.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                                        {item.desc}
                                    </Typography>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* Liên hệ */}
            <Box sx={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_DARK} 100%)`, py: { xs: 6, md: 8 } }}>
                <Container maxWidth="md" sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" fontWeight={700} gutterBottom sx={{ color: '#fff' }}>
                        Liên hệ với chúng tôi
                    </Typography>
                    <Box sx={{ width: 50, height: 4, bgcolor: RED, mx: 'auto', mb: 2, borderRadius: 2 }} />
                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.8, maxWidth: 500, mx: 'auto' }}>
                        Nếu bạn có bất kỳ câu hỏi nào hoặc muốn tìm hiểu thêm, đừng ngần ngại liên hệ.
                        Đội ngũ tư vấn của TMix Education luôn sẵn sàng hỗ trợ bạn.
                    </Typography>
                </Container>
            </Box>
        </PublicLayout>
    );
};

export default AboutPage;
