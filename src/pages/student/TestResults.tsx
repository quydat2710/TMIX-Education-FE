// Test Results Page
// Display AI grading results with detailed feedback

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Button,
    Paper,
    Grid,
    Divider,
    CircularProgress,
    Alert,
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Download as DownloadIcon,
} from '@mui/icons-material';
import { getAttemptById } from '../../services/tests';
import { TestAttempt } from '../../types/test';
import { ScoreBadge, QuestionCard, FeedbackCard } from '../../components/features/test';

const TestResults: React.FC = () => {
    const { attemptId } = useParams<{ attemptId: string }>();
    const navigate = useNavigate();

    const [attempt, setAttempt] = useState<TestAttempt | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadResults();
    }, [attemptId]);

    const loadResults = async () => {
        if (!attemptId) return;

        try {
            setLoading(true);
            const response = await getAttemptById(attemptId);
            setAttempt(response.data);
        } catch (err: any) {
            setError(err.message || 'Failed to load results');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>Loading results...</Typography>
            </Container>
        );
    }

    if (error || !attempt) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Alert severity="error">{error || 'Results not found'}</Alert>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/student/tests')} sx={{ mt: 2 }}>
                    Back to Tests
                </Button>
            </Container>
        );
    }

    const test = attempt.test;
    if (!test) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Alert severity="error">Test information not available</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Test Results
                </Typography>
                <Typography variant="h6" color="text.secondary">
                    {test.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Submitted: {formatDate(attempt.submittedAt)}
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {/* Left Column - Score Overview */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
                        <ScoreBadge
                            score={attempt.score}
                            totalPoints={test.totalPoints}
                            percentage={attempt.percentage}
                            passed={attempt.passed}
                            passingScore={test.passingScore}
                            size="medium"
                        />

                        <Divider sx={{ my: 3 }} />

                        {/* Statistics */}
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Statistics
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2">Total Questions:</Typography>
                                <Typography variant="body2"><strong>{test.questions.length}</strong></Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2">Correct Answers:</Typography>
                                <Typography variant="body2" color="success.main">
                                    <strong>{attempt.answers.filter((a, i) => a === test.questions[i].correctAnswer).length}</strong>
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2">Incorrect Answers:</Typography>
                                <Typography variant="body2" color="error.main">
                                    <strong>{attempt.answers.filter((a, i) => a !== test.questions[i].correctAnswer).length}</strong>
                                </Typography>
                            </Box>
                        </Box>

                        <Divider sx={{ my: 3 }} />

                        {/* Actions */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Button
                                variant="outlined"
                                startIcon={<ArrowBackIcon />}
                                onClick={() => navigate('/student/tests')}
                                fullWidth
                            >
                                Back to Tests
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<DownloadIcon />}
                                onClick={() => window.print()}
                                fullWidth
                            >
                                Print Results
                            </Button>
                        </Box>
                    </Paper>
                </Grid>

                {/* Right Column - Detailed Results */}
                <Grid item xs={12} md={8}>
                    {/* AI Overall Feedback */}
                    {attempt.feedback && attempt.feedback.length > 0 && (
                        <Paper sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                AI Feedback & Suggestions
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {attempt.feedback.slice(0, 3).map((feedback, index) => (
                                    <FeedbackCard key={index} feedback={feedback} type="suggestion" />
                                ))}
                            </Box>
                        </Paper>
                    )}

                    {/* Question Review */}
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Question Review
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Review your answers and see the correct solutions
                        </Typography>

                        {test.questions.map((question, index) => (
                            <QuestionCard
                                key={question.id}
                                question={question}
                                questionNumber={index + 1}
                                selectedAnswer={attempt.answers[index]}
                                studentAnswer={attempt.answers[index]}
                                showCorrectAnswer={true}
                                showResult={true}
                                feedback={attempt.feedback[index]}
                                disabled={true}
                            />
                        ))}
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default TestResults;
