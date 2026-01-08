// Test Demo Page - For UI Preview Without Backend
// Access at: http://localhost:3000/test-demo

import React, { useState } from 'react';
import {
    Container,
    Typography,
    Box,
    Button,
    Paper,
    Tabs,
    Tab,
    Divider,
} from '@mui/material';
import { Test, TestAttempt } from '../types/test';
import { QuestionCard, TestTimer, ScoreBadge, FeedbackCard } from '../components/features/test';

// Mock Test Data
const mockTest: Test = {
    id: '1',
    title: 'English Grammar Quiz - Present Perfect Tense',
    description: 'Test your understanding of Present Perfect tense usage and formation',
    classId: 'class-1',
    teacherId: 'teacher-1',
    className: 'English Advanced - Grade 10',
    teacherName: 'Ms. Sarah Johnson',
    duration: 30,
    totalPoints: 100,
    passingScore: 70,
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    questions: [
        {
            id: 'q1',
            question: 'She ___ to Paris three times this year.',
            options: ['go', 'goes', 'has gone', 'went'],
            correctAnswer: 2,
            explanation: 'We use Present Perfect (has/have + past participle) for experiences up to now.',
            points: 20,
        },
        {
            id: 'q2',
            question: 'They ___ their homework yet.',
            options: ["haven't finished", "didn't finish", "don't finish", "hasn't finished"],
            correctAnswer: 0,
            explanation: 'Use "haven\'t" with plural subjects in Present Perfect negative.',
            points: 20,
        },
        {
            id: 'q3',
            question: 'Have you ever ___ Japanese food?',
            options: ['eat', 'ate', 'eaten', 'eating'],
            correctAnswer: 2,
            explanation: 'After "have/has", we use the past participle form of the verb.',
            points: 20,
        },
        {
            id: 'q4',
            question: 'I ___ my keys. Can you help me find them?',
            options: ['lose', 'lost', 'have lost', 'am losing'],
            correctAnswer: 2,
            explanation: 'Present Perfect is used when the past action has a present result.',
            points: 20,
        },
        {
            id: 'q5',
            question: 'How long ___ English?',
            options: ['do you study', 'are you studying', 'have you studied', 'did you study'],
            correctAnswer: 2,
            explanation: '"How long" questions about duration use Present Perfect.',
            points: 20,
        },
    ],
};

// Mock Test Attempt (Results)
const mockAttempt: TestAttempt = {
    id: 'attempt-1',
    testId: '1',
    studentId: 'student-1',
    studentName: 'John Doe',
    answers: [2, 0, 2, 1, 2], // Student's answers
    score: 80,
    percentage: 80,
    passed: true,
    feedback: [
        '✓ Correct! Great job understanding Present Perfect usage.',
        '✓ Perfect! You correctly identified the negative form.',
        '✓ Excellent! You know when to use past participle.',
        '✗ Incorrect. The correct answer is C. Present Perfect shows past action with present result.',
        '✓ Well done! "How long" requires Present Perfect tense.',
    ],
    startedAt: new Date(Date.now() - 1800000).toISOString(),
    submittedAt: new Date().toISOString(),
    gradedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    test: mockTest,
};

const TestDemo: React.FC = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [currentAnswers, setCurrentAnswers] = useState<number[]>(new Array(5).fill(-1));

    const handleAnswerChange = (questionIndex: number, answer: number) => {
        const newAnswers = [...currentAnswers];
        newAnswers[questionIndex] = answer;
        setCurrentAnswers(newAnswers);
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Paper sx={{ p: 3, mb: 3, bgcolor: 'info.light' }}>
                <Typography variant="h4" gutterBottom>
                    🎨 AI Test Module - UI Demo
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    This is a preview of the AI Auto-grading Test interface. Switch between tabs to see different views.
                </Typography>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    💡 <strong>Note:</strong> This uses mock data. To use with real backend, navigate to /student/tests after logging in.
                </Typography>
            </Paper>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
                    <Tab label="📝 Take Test" />
                    <Tab label="📊 Test Results" />
                    <Tab label="🧩 Components" />
                </Tabs>
            </Box>

            {/* Tab 1: Take Test Demo */}
            {activeTab === 0 && (
                <Box>
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h5" gutterBottom>
                            {mockTest.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {mockTest.description}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <Typography variant="body2"><strong>Class:</strong> {mockTest.className}</Typography>
                            <Typography variant="body2"><strong>Duration:</strong> {mockTest.duration} mins</Typography>
                            <Typography variant="body2"><strong>Passing:</strong> {mockTest.passingScore}%</Typography>
                        </Box>
                        <TestTimer durationMinutes={mockTest.duration} onTimeUp={() => alert('Time up!')} />
                    </Paper>

                    {mockTest.questions.map((question, index) => (
                        <QuestionCard
                            key={question.id}
                            question={question}
                            questionNumber={index + 1}
                            selectedAnswer={currentAnswers[index] === -1 ? undefined : currentAnswers[index]}
                            onAnswerChange={(answer) => handleAnswerChange(index, answer)}
                        />
                    ))}

                    <Button variant="contained" size="large" fullWidth sx={{ mt: 2 }}>
                        Submit Test (Demo - doesn't submit)
                    </Button>
                </Box>
            )}

            {/* Tab 2: Results Demo */}
            {activeTab === 1 && (
                <Box>
                    <Typography variant="h5" gutterBottom>
                        Test Results - {mockTest.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Submitted: {new Date(mockAttempt.submittedAt).toLocaleString()}
                    </Typography>

                    <Paper sx={{ p: 3, mb: 3 }}>
                        <ScoreBadge
                            score={mockAttempt.score}
                            totalPoints={mockTest.totalPoints}
                            percentage={mockAttempt.percentage}
                            passed={mockAttempt.passed}
                            passingScore={mockTest.passingScore}
                            size="large"
                        />

                        <Divider sx={{ my: 3 }} />

                        <Typography variant="h6" gutterBottom>
                            AI Feedback & Suggestions
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                            <FeedbackCard
                                feedback="Great job! You have a solid understanding of Present Perfect tense."
                                type="success"
                            />
                            <FeedbackCard
                                feedback="Focus on distinguishing when to use Present Perfect vs Simple Past."
                                type="suggestion"
                            />
                            <FeedbackCard
                                feedback="Practice more with state verbs in Present Perfect."
                                type="info"
                            />
                        </Box>
                    </Paper>

                    <Typography variant="h6" gutterBottom>
                        Question Review
                    </Typography>
                    {mockTest.questions.map((question, index) => (
                        <QuestionCard
                            key={question.id}
                            question={question}
                            questionNumber={index + 1}
                            selectedAnswer={mockAttempt.answers[index]}
                            studentAnswer={mockAttempt.answers[index]}
                            showCorrectAnswer={true}
                            showResult={true}
                            feedback={mockAttempt.feedback[index]}
                            disabled={true}
                        />
                    ))}
                </Box>
            )}

            {/* Tab 3: Components Demo */}
            {activeTab === 2 && (
                <Box>
                    <Typography variant="h5" gutterBottom>
                        UI Components Preview
                    </Typography>

                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>1. Score Badge - Passed</Typography>
                        <ScoreBadge
                            score={85}
                            totalPoints={100}
                            percentage={85}
                            passed={true}
                            passingScore={70}
                            size="medium"
                        />
                    </Paper>

                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>2. Score Badge - Failed</Typography>
                        <ScoreBadge
                            score={55}
                            totalPoints={100}
                            percentage={55}
                            passed={false}
                            passingScore={70}
                            size="medium"
                        />
                    </Paper>

                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>3. Feedback Cards</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <FeedbackCard feedback="This is a success feedback message!" type="success" />
                            <FeedbackCard feedback="This is an error feedback message!" type="error" />
                            <FeedbackCard feedback="This is an info feedback message!" type="info" />
                            <FeedbackCard feedback="This is a suggestion feedback message!" type="suggestion" />
                        </Box>
                    </Paper>

                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>4. Test Timer</Typography>
                        <TestTimer durationMinutes={5} onTimeUp={() => alert('Time up!')} />
                    </Paper>

                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>5. Question Card</Typography>
                        <QuestionCard
                            question={mockTest.questions[0]}
                            questionNumber={1}
                            selectedAnswer={2}
                            showCorrectAnswer={true}
                            showResult={true}
                            feedback="✓ Correct! Great job understanding Present Perfect usage."
                            disabled={true}
                        />
                    </Paper>
                </Box>
            )}
        </Container>
    );
};

export default TestDemo;
