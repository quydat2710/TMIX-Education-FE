// Take Test Page
// Student interface to take a multiple choice test

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Button,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Alert,
    LinearProgress,
} from '@mui/material';
import {
    Send as SendIcon,
    ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { getStudentTestById } from '../../services/tests';
import { submitTestForGrading } from '../../services/ai-grading';
import { Test } from '../../types/test';
import { QuestionCard, TestTimer } from '../../components/features/test';

const TakeTest: React.FC = () => {
    const { testId } = useParams<{ testId: string }>();
    const navigate = useNavigate();

    const [test, setTest] = useState<Test | null>(null);
    const [answers, setAnswers] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [timeUpTriggered, setTimeUpTriggered] = useState(false);

    useEffect(() => {
        loadTest();
    }, [testId]);

    const loadTest = async () => {
        if (!testId) return;

        try {
            setLoading(true);
            const response = await getStudentTestById(testId);
            setTest(response.data);
            // Initialize answers array with -1 (no answer)
            setAnswers(new Array(response.data.questions.length).fill(-1));
        } catch (err: any) {
            setError(err.message || 'Failed to load test');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (questionIndex: number, answer: number) => {
        const newAnswers = [...answers];
        newAnswers[questionIndex] = answer;
        setAnswers(newAnswers);
    };

    const getAnsweredCount = (): number => {
        return answers.filter((a) => a !== -1).length;
    };

    const getProgressPercentage = (): number => {
        if (!test) return 0;
        return (getAnsweredCount() / test.questions.length) * 100;
    };

    const handleSubmitClick = () => {
        const unanswered = test!.questions.length - getAnsweredCount();
        if (unanswered > 0) {
            if (!window.confirm(`You have ${unanswered} unanswered questions. Submit anyway?`)) {
                return;
            }
        }
        setShowConfirmDialog(true);
    };

    const handleConfirmSubmit = async () => {
        if (!testId) return;

        setShowConfirmDialog(false);
        setSubmitting(true);

        try {
            const response = await submitTestForGrading(testId, answers);
            // Navigate to results page
            navigate(`/student/tests/results/${response.data.id}`);
        } catch (err: any) {
            setError(err.message || 'Failed to submit test');
            setSubmitting(false);
        }
    };

    const handleTimeUp = () => {
        if (timeUpTriggered) return;
        setTimeUpTriggered(true);
        alert('Time is up! Your test will be submitted automatically.');
        handleConfirmSubmit();
    };

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>Loading test...</Typography>
            </Container>
        );
    }

    if (error || !test) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Alert severity="error">{error || 'Test not found'}</Alert>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/student/tests')} sx={{ mt: 2 }}>
                    Back to Tests
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            {/* Header */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h4" gutterBottom>
                    {test.title}
                </Typography>
                {test.description && (
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                        {test.description}
                    </Typography>
                )}

                <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                    <Typography variant="body2">
                        <strong>Questions:</strong> {test.questions.length}
                    </Typography>
                    <Typography variant="body2">
                        <strong>Total Points:</strong> {test.totalPoints}
                    </Typography>
                    <Typography variant="body2">
                        <strong>Passing Score:</strong> {test.passingScore}%
                    </Typography>
                </Box>

                {/* Timer */}
                <TestTimer durationMinutes={test.duration} onTimeUp={handleTimeUp} isPaused={submitting} />

                {/* Progress */}
                <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" gutterBottom>
                        Progress: {getAnsweredCount()} / {test.questions.length} answered
                    </Typography>
                    <LinearProgress variant="determinate" value={getProgressPercentage()} sx={{ height: 6, borderRadius: 1 }} />
                </Box>
            </Paper>

            {/* Questions */}
            {test.questions.map((question, index) => (
                <QuestionCard
                    key={question.id}
                    question={question}
                    questionNumber={index + 1}
                    selectedAnswer={answers[index] === -1 ? undefined : answers[index]}
                    onAnswerChange={(answer) => handleAnswerChange(index, answer)}
                    disabled={submitting}
                />
            ))}

            {/* Submit Button */}
            <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => {
                        if (window.confirm('Are you sure you want to leave? Your progress will be lost.')) {
                            navigate('/student/tests');
                        }
                    }}
                    disabled={submitting}
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    size="large"
                    startIcon={<SendIcon />}
                    onClick={handleSubmitClick}
                    disabled={submitting || getAnsweredCount() === 0}
                    sx={{ flex: 1 }}
                >
                    {submitting ? 'Submitting...' : 'Submit Test'}
                </Button>
            </Box>

            {/* Confirm Dialog */}
            <Dialog open={showConfirmDialog} onClose={() => setShowConfirmDialog(false)}>
                <DialogTitle>Confirm Submission</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to submit your test? You cannot change your answers after submission.
                    </Typography>
                    <Typography sx={{ mt: 2 }}>
                        <strong>Answered:</strong> {getAnsweredCount()} / {test.questions.length}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
                    <Button onClick={handleConfirmSubmit} variant="contained" color="primary">
                        Confirm Submit
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default TakeTest;
