import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Container, Typography, CircularProgress, Alert, Breadcrumbs, Link } from '@mui/material';
import PublicLayout from '../components/layouts/PublicLayout';
import { getArticlesByMenuIdAPI } from '../services/articles'; // Assuming this exists or similar
import { getMenuBySlugAPI } from '../services/menus'; // Assuming this exists

interface DynamicArticle {
    id: string;
    content: string;
    [key: string]: any;
}

interface DynamicMenu {
    id: string;
    title: string;
    [key: string]: any;
}

const DynamicMenuPage = () => {
    const { slug, parentSlug, childSlug } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [articles, setArticles] = useState<DynamicArticle[]>([]);
    const [menu, setMenu] = useState<DynamicMenu | null>(null);

    // Determine current slug
    const currentSlug = childSlug || slug;

    useEffect(() => {
        const fetchData = async () => {
            if (!currentSlug) return;

            setLoading(true);
            setError(null);
            try {
                // 1. Get menu info to get title and ID
                const menuResponse = await getMenuBySlugAPI(currentSlug);
                const menuData = menuResponse.data?.data || menuResponse.data;
                if (!menuData) {
                    setError('Không tìm thấy trang này.');
                    setLoading(false);
                    return;
                }
                setMenu(menuData);

                // 2. Get articles
                const articlesResponse = await getArticlesByMenuIdAPI(menuData.id);
                const articlesData = articlesResponse.data?.data?.result || articlesResponse.data?.data || articlesResponse.data || [];
                setArticles(Array.isArray(articlesData) ? articlesData : []);

            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Có lỗi xảy ra khi tải dữ liệu.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentSlug]);

    if (loading) {
        return (
            <PublicLayout>
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 10, minHeight: '60vh' }}>
                    <CircularProgress />
                </Box>
            </PublicLayout>
        );
    }

    if (error || !menu) {
        return (
            <PublicLayout>
                <Container maxWidth="lg" sx={{ py: 8, minHeight: '60vh' }}>
                    <Alert severity="error">{error || 'Trang không tồn tại'}</Alert>
                    <Box mt={2}>
                        <Link href="/" underline="hover">Về trang chủ</Link>
                    </Box>
                </Container>
            </PublicLayout>
        );
    }

    return (
        <PublicLayout>
            <Box sx={{ bgcolor: '#fafafa', minHeight: '100vh' }}>
                {/* Hero Section */}
                <Box
                    sx={{
                        background: 'linear-gradient(135deg, #D32F2F 0%, #1E3A5F 100%)',
                        color: 'white',
                        py: { xs: 4, md: 6 },
                        mb: 0,
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    <Container maxWidth="lg">
                        <Breadcrumbs aria-label="breadcrumb" sx={{ color: 'rgba(255,255,255,0.8)', mb: 2 }}>
                            <Link color="inherit" href="/" underline="hover">Trang chủ</Link>
                            {parentSlug && <Typography color="inherit">{parentSlug}</Typography>}
                            <Typography color="white">{menu.title}</Typography>
                        </Breadcrumbs>
                        <Typography
                            variant="h3"
                            component="h1"
                            sx={{ fontWeight: 700, fontSize: { xs: '1.75rem', md: '2.5rem' } }}
                        >
                            {menu.title}
                        </Typography>
                    </Container>
                </Box>

                {/* Content */}
                <Container maxWidth="lg" sx={{ py: 4 }}>
                    {articles.length === 0 ? (
                        <Box textAlign="center" py={4}>
                            <Typography color="text.secondary">Nội dung đang được cập nhật...</Typography>
                        </Box>
                    ) : (
                        <Box sx={{ bgcolor: 'white', borderRadius: '16px', p: { xs: 3, md: 5 }, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
                            {articles.map((article) => (
                                <Box key={article.id} sx={{ mb: 4 }}>
                                    {/* Render raw HTML content from LayoutBuilder/ArticleEditor */}
                                    <div dangerouslySetInnerHTML={{ __html: article.content }} />
                                </Box>
                            ))}
                        </Box>
                    )}
                </Container>
            </Box>
        </PublicLayout>
    );
};

export default DynamicMenuPage;
