// Question Card Component
// Displays a multiple choice question with radio button options

import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    Box,
    Chip,
} from '@mui/material';
import { MCQuestion } from '../../../types/test';

interface QuestionCardProps {
    question: MCQuestion;
    questionNumber: number;
    selectedAnswer?: number;
    onAnswerChange?: (answer: number) => void;
    showCorrectAnswer?: boolean;
    showResult?: boolean;
    studentAnswer?: number;
    feedback?: string;
    disabled?: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
    question,
    questionNumber,
    selectedAnswer,
    onAnswerChange,
    showCorrectAnswer = false,
    showResult = false,
    studentAnswer,
    feedback,
    disabled = false,
}) => {
    const getOptionLabel = (index: number): string => {
        return String.fromCharCode(65 + index); // A, B, C, D
    };

    const getOptionColor = (index: number) => {
        if (!showResult) return undefined;

        if (showCorrectAnswer && index === question.correctAnswer) {
            return 'success.light';
        }
        if (studentAnswer !== undefined && index === studentAnswer && studentAnswer !== question.correctAnswer) {
            return 'error.light';
        }
        return undefined;
    };

    const getOptionBorder = (index: number) => {
        if (!showResult) return undefined;

        if (showCorrectAnswer && index === question.correctAnswer) {
            return '2px solid';
        }
        if (studentAnswer !== undefined && index === studentAnswer && studentAnswer !== question.correctAnswer) {
            return '2px solid';
        }
        return undefined;
    };

    return (
        <Card sx={{ mb: 3, boxShadow: 2 }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        <strong>Question {questionNumber}</strong>
                        {question.points > 0 && (
                            <Chip
                                label={`${question.points} pts`}
                                size="small"
                                color="primary"
                                sx={{ ml: 2 }}
                            />
                        )}
                    </Typography>
                </Box>

                <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
                    {question.question}
                </Typography>

                <FormControl component="fieldset" fullWidth disabled={disabled}>
                    <RadioGroup
                        value={selectedAnswer !== undefined ? selectedAnswer : ''}
                        onChange={(e) => onAnswerChange && onAnswerChange(parseInt(e.target.value))}
                    >
                        {question.options.map((option, index) => (
                            <Box
                                key={index}
                                sx={{
                                    mb: 1,
                                    p: 1.5,
                                    borderRadius: 1,
                                    bgcolor: getOptionColor(index),
                                    border: getOptionBorder(index),
                                    borderColor: index === question.correctAnswer ? 'success.main' : 'error.main',
                                    transition: 'all 0.3s',
                                    '&:hover': !disabled ? {
                                        bgcolor: 'action.hover',
                                    } : {},
                                }}
                            >
                                <FormControlLabel
                                    value={index}
                                    control={<Radio />}
                                    label={
                                        <Typography variant="body1">
                                            <strong>{getOptionLabel(index)}.</strong> {option}
                                        </Typography>
                                    }
                                    sx={{ width: '100%', m: 0 }}
                                />
                            </Box>
                        ))}
                    </RadioGroup>
                </FormControl>

                {/* Show explanation if available and in review mode */}
                {showCorrectAnswer && question.explanation && (
                    <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                        <Typography variant="subtitle2" color="info.dark" gutterBottom>
                            <strong>Explanation:</strong>
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {question.explanation}
                        </Typography>
                    </Box>
                )}

                {/* Show AI feedback if available */}
                {showResult && feedback && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                        <Typography variant="subtitle2" gutterBottom>
                            <strong>AI Feedback:</strong>
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {feedback}
                        </Typography>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export default QuestionCard;
