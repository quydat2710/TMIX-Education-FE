// Student Test List Page
// Displays available tests and past attempts

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Card,
    CardContent,
    CardActions,
    Button,
    Tabs,
    Tab,
    Grid,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Alert,
} from '@mui/material';
import {
    Assignment as AssignmentIcon,
    PlayArrow as PlayArrowIcon,
    Visibility as VisibilityIcon,
    Schedule as ScheduleIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
} from '@mui/icons-material';
import { getStudentAvailableTests, getStudentAttempts } from '../../services/tests';
import { StudentTestItem, TestAttempt } from '../../types/test';

const TestsList: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(0);
    const [availableTests, setAvailableTests] = useState<StudentTestItem[]>([]);
    const [attempts, setAttempts] = useState<TestAttempt[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError('');

            if (activeTab === 0) {
                // Load available tests
                const response = await getStudentAvailableTests();
                setAvailableTests(response.data);
            } else {
                // Load past attempts
                const response = await getStudentAttempts();
                setAttempts(response.data.result || []);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleStartTest = (testId: string) => {
        navigate(`/student/tests/${testId}/take`);
    };

    const handleViewResult = (attemptId: string) => {
        navigate(`/student/tests/results/${attemptId}`);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                    <AssignmentIcon sx={{ mr: 1, verticalAlign: 'middle', fontSize: 32 }} />
                    My Tests
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Take tests and view your results
                </Typography>
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
                    <Tab label="Available Tests" />
                    <Tab label="My Attempts" />
                </Tabs>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error">{error}</Alert>
            ) : (
                <>
                    {/* Available Tests Tab */}
                    {activeTab === 0 && (
                        <Grid container spacing={3}>
                            {availableTests.length === 0 ? (
                                <Grid item xs={12}>
                                    <Alert severity="info">No tests available at the moment.</Alert>
                                </Grid>
                            ) : (
                                availableTests.map((test) => (
                                    <Grid item xs={12} md={6} key={test.id}>
                                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                            <CardContent sx={{ flexGrow: 1 }}>
                                                <Typography variant="h6" gutterBottom>
                                                    {test.title}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                    {test.description || 'No description provided'}
                                                </Typography>

                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                                    <Chip
                                                        icon={<ScheduleIcon />}
                                                        label={`${test.duration} mins`}
                                                        size="small"
                                                    />
                                                    <Chip
                                                        label={`${test.questionCount} questions`}
                                                        size="small"
                                                        color="primary"
                                                    />
                                                    <Chip
                                                        label={`${test.totalPoints} points`}
                                                        size="small"
                                                        color="secondary"
                                                    />
                                                </Box>

                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    Class: {test.className}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    Teacher: {test.teacherName}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    Passing score: {test.passingScore}%
                                                </Typography>

                                                {test.hasAttempted && test.lastAttempt && (
                                                    <Box sx={{ mt: 2, p: 1, bgcolor: 'info.light', borderRadius: 1 }}>
                                                        <Typography variant="caption" display="block">
                                                            Last attempt: {test.lastAttempt.percentage.toFixed(1)}% -{' '}
                                                            {test.lastAttempt.passed ? '✓ Passed' : '✗ Failed'}
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </CardContent>

                                            <CardActions>
                                                <Button
                                                    variant="contained"
                                                    startIcon={<PlayArrowIcon />}
                                                    onClick={() => handleStartTest(test.id)}
                                                    fullWidth
                                                >
                                                    {test.hasAttempted ? 'Retake Test' : 'Start Test'}
                                                </Button>
                                            </CardActions>
                                        </Card>
                                    </Grid>
                                ))
                            )}
                        </Grid>
                    )}

                    {/* My Attempts Tab */}
                    {activeTab === 1 && (
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Test Name</TableCell>
                                        <TableCell>Date & Time</TableCell>
                                        <TableCell align="center">Score</TableCell>
                                        <TableCell align="center">Percentage</TableCell>
                                        <TableCell align="center">Status</TableCell>
                                        <TableCell align="center">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {attempts.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center">
                                                <Typography color="text.secondary" sx={{ py: 4 }}>
                                                    No attempts yet. Take a test to see your results here.
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        attempts.map((attempt) => (
                                            <TableRow key={attempt.id}>
                                                <TableCell>{attempt.test?.title || 'Unknown Test'}</TableCell>
                                                <TableCell>{formatDate(attempt.submittedAt)}</TableCell>
                                                <TableCell align="center">
                                                    {attempt.score} / {attempt.test?.totalPoints || 0}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <strong>{attempt.percentage.toFixed(1)}%</strong>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        icon={attempt.passed ? <CheckCircleIcon /> : <CancelIcon />}
                                                        label={attempt.passed ? 'Passed' : 'Failed'}
                                                        color={attempt.passed ? 'success' : 'error'}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Button
                                                        size="small"
                                                        startIcon={<VisibilityIcon />}
                                                        onClick={() => handleViewResult(attempt.id)}
                                                    >
                                                        View Results
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </>
            )}
        </Container>
    );
};

export default TestsList;
