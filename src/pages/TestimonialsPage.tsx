import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Avatar,
  Button,
} from '@mui/material';
import {
  Star as StarIcon,
} from '@mui/icons-material';
import PublicLayout from '../components/layouts/PublicLayout';
import { getFeedbacksAPI } from '../services/feedback';
import { Feedback } from '../types';

// TMix brand colors
const NAVY = '#1E3A5F';
const NAVY_DARK = '#0F1F33';
const RED = '#D32F2F';

const AVATAR_SIZE = 110;
const AVATAR_BORDER = 4;
const AVATAR_MARGIN = 12;

// Helper function to get social media icon based on URL
const getSocialIcon = (url: string) => {
  const domain = url.toLowerCase();

  if (domain.includes('facebook.com') || domain.includes('fb.com')) {
    return (
      <svg fill="#1877F2" strokeWidth="0" viewBox="0 0 16 16" style={{ width: 20, height: 20, marginLeft: 4 }} xmlns="http://www.w3.org/2000/svg">
        <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"></path>
      </svg>
    );
  }
  if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
    return (
      <svg fill="#FF0000" strokeWidth="0" viewBox="0 0 24 24" style={{ width: 20, height: 20, marginLeft: 4 }} xmlns="http://www.w3.org/2000/svg">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    );
  }
  // Default icon
  return (
    <svg fill="#6c757d" strokeWidth="0" viewBox="0 0 16 16" style={{ width: 20, height: 20, marginLeft: 4 }} xmlns="http://www.w3.org/2000/svg">
      <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4.018 4.018 0 0 1-.128-1.287z" />
      <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243L6.586 4.672z" />
    </svg>
  );
};

const FeedbackCard = ({ feedback }: { feedback: Feedback }) => (
  <Box sx={{ px: 2, pb: 2, display: "flex", flexDirection: "column", alignItems: "center", height: '100%' }}>
    <Box
      sx={{
        width: AVATAR_SIZE + AVATAR_BORDER * 2,
        height: AVATAR_SIZE + AVATAR_BORDER * 2,
        borderRadius: "50%",
        bgcolor: "#fff",
        boxShadow: 3,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        mb: `-${AVATAR_SIZE / 2 + AVATAR_MARGIN / 2}px`,
        zIndex: 2,
        position: "relative"
      }}
    >
      <Avatar
        src={feedback.imageUrl}
        alt={feedback.name}
        sx={{
          width: AVATAR_SIZE,
          height: AVATAR_SIZE,
          border: `${AVATAR_BORDER}px solid #e53935`,
          background: "#fff"
        }}
      >
        {feedback.name?.charAt(0)?.toUpperCase()}
      </Avatar>
    </Box>
    <Card
      sx={{
        border: "2px solid #e53935",
        borderRadius: 4,
        minHeight: 340,
        pt: `${AVATAR_SIZE / 2 + AVATAR_MARGIN}px`,
        pb: 2,
        px: 2,
        boxShadow: "0 2px 8px rgba(229,57,53,0.08)",
        overflow: "visible",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: "#fff",
        width: "100%",
        position: "relative",
        height: '100%'
      }}
    >
      <CardContent sx={{ width: "100%", p: 0, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <Typography variant="body1" sx={{ mb: 2, minHeight: 100, textAlign: "justify", fontSize: '1.1rem', lineHeight: 1.6, flexGrow: 1 }}>
          {feedback.description}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 'auto' }}>
          <Typography variant="h6" sx={{ color: "#e53935", fontWeight: "bold" }}>
            {feedback.name}
          </Typography>
          {feedback.socialUrl && (
            <Button
              href={feedback.socialUrl}
              target="_blank"
              sx={{ color: "#1976d2", textTransform: "none", fontWeight: 600, ml: 1 }}
            >
              Xem
              {getSocialIcon(feedback.socialUrl)}
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  </Box>
);

const TestimonialsPage: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch feedbacks trực tiếp từ DB 
  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getFeedbacksAPI({ page: 1, limit: 100 });
        if (response.data?.data?.result) {
          setFeedbacks(response.data.data.result);
        } else {
          setFeedbacks([]);
        }
      } catch (err: any) {
        console.error('Error fetching feedbacks:', err);
        setError(err?.response?.data?.message || 'Không thể tải đánh giá');
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  if (loading) {
    return (
      <PublicLayout>
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress size={60} />
          </Box>
        </Container>
      </PublicLayout>
    );
  }

  if (error) {
    return (
      <PublicLayout>
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Typography color="error" textAlign="center">{error}</Typography>
        </Container>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      {/* Hero Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_DARK} 100%)`,
          color: '#fff',
          py: { xs: 8, md: 10 },
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
            Đánh Giá Từ Học Viên
          </Typography>
          <Box sx={{ width: 60, height: 4, bgcolor: RED, mx: 'auto', mb: 2, borderRadius: 2 }} />
          <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400, lineHeight: 1.7, maxWidth: 600, mx: 'auto' }}>
            Những chia sẻ chân thực từ các học viên đã và đang theo học tại TMix Education
          </Typography>
        </Container>
      </Box>

      <Box sx={{ bgcolor: '#fafafa', minHeight: '60vh' }}>
        <Container maxWidth="lg" sx={{ py: 6 }}>
          {feedbacks.length === 0 ? (
            <Box textAlign="center" py={8}>
              <StarIcon sx={{ fontSize: 80, color: '#bbb', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Chưa có đánh giá nào
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Hiện tại chưa có đánh giá nào từ học viên. Vui lòng quay lại sau.
              </Typography>
            </Box>
          ) : (
            <>
              <Grid container spacing={3}>
                {feedbacks.map((feedback) => (
                  <Grid item xs={12} sm={6} md={4} key={feedback.id}>
                    <FeedbackCard feedback={feedback} />
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </Container>
      </Box>
    </PublicLayout>
  );
};

export default TestimonialsPage;
