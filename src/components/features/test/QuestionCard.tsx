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
import TTSButton from '../../TTSButton';

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
    isActive?: boolean;
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
    isActive = false,
}) => {
    const getOptionLabel = (index: number): string => {
        return String.fromCharCode(65 + index); // A, B, C, D
    };

    const isAnswered = selectedAnswer !== undefined && selectedAnswer !== -1;
    const isSelected = (index: number) => selectedAnswer === index;



    // Build option styling for take-test mode (non-review)
    const getOptionSx = (index: number) => {
        if (showResult) {
            // Review mode — premium styling with left-border accents
            const isCorrect = showCorrectAnswer && index === question.correctAnswer;
            const isWrong = studentAnswer !== undefined && index === studentAnswer && studentAnswer !== question.correctAnswer;
            return {
                mb: 1,
                p: 1.5,
                borderRadius: 2.5,
                border: '1.5px solid',
                borderColor: isCorrect ? '#22c55e' : isWrong ? '#ef4444' : '#e5e7eb',
                borderLeftWidth: (isCorrect || isWrong) ? '4px' : '1.5px',
                borderLeftColor: isCorrect ? '#22c55e' : isWrong ? '#ef4444' : '#e5e7eb',
                bgcolor: isCorrect ? '#f0fdf4' : isWrong ? '#fef2f2' : '#fff',
                transition: 'all 0.2s',
            };
        }

        // Take-test mode — premium styling
        const selected = isSelected(index);
        return {
            mb: 1,
            p: 1.5,
            borderRadius: 2.5,
            border: '1.5px solid',
            borderColor: selected ? '#3b82f6' : '#e5e7eb',
            borderLeftWidth: selected ? '4px' : '1.5px',
            borderLeftColor: selected ? '#3b82f6' : '#e5e7eb',
            bgcolor: selected ? '#eff6ff' : '#fff',
            transition: 'all 0.2s ease',
            cursor: disabled ? 'default' : 'pointer',
            ...(!disabled ? {
                '&:hover': {
                    bgcolor: selected ? '#eff6ff' : '#f8fafc',
                    borderColor: selected ? '#3b82f6' : '#cbd5e1',
                    transform: 'translateX(3px)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                },
            } : {}),
        };
    };

    return (
        <Card sx={{
            mb: 2.5,
            borderRadius: 4,
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            border: '1px solid',
            borderColor: isActive ? '#3b82f6' : 'transparent',
            borderLeftWidth: isAnswered && !showResult ? '4px' : undefined,
            borderLeftColor: isAnswered && !showResult ? '#22c55e' : undefined,
            transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
            ...(isActive ? { boxShadow: '0 0 0 2px rgba(59,130,246,0.15), 0 2px 8px rgba(0,0,0,0.08)' } : {}),
            '&:hover': {
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            },
        }}>
            <CardContent sx={{ p: { xs: 2, md: 3 }, '&:last-child': { pb: { xs: 2, md: 3 } } }}>
                {/* Question Header */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
                    {/* Number Badge */}
                    <Box sx={{
                        width: 36, height: 36, minWidth: 36,
                        borderRadius: '50%',
                        bgcolor: isAnswered && !showResult ? '#22c55e' : '#1E3A5F',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        mt: 0.3,
                        transition: 'background-color 0.3s ease',
                    }}>
                        {questionNumber}
                    </Box>

                    {/* Question Text */}
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 500, lineHeight: 1.7, color: '#1a1a1a' }}>
                            {question.question}
                        </Typography>
                    </Box>

                    {/* Right side: Points + TTS */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                        {question.points > 0 && (
                            <Chip
                                label={`${question.points} pts`}
                                size="small"
                                sx={{
                                    bgcolor: '#dbeafe',
                                    color: '#1d4ed8',
                                    fontWeight: 700,
                                    fontSize: '0.7rem',
                                    height: 24,
                                }}
                            />
                        )}
                        <TTSButton
                            text={`${question.question}. ${question.options.map((opt, i) => `${String.fromCharCode(65 + i)}: ${opt}`).join('. ')}`}
                            tooltip="🔊 Nghe câu hỏi"
                        />
                    </Box>
                </Box>

                {/* Per-Question Audio (Listening) */}
                {question.audioUrl && (
                    <Box sx={{
                        mb: 2, p: 2, borderRadius: 2.5,
                        background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
                        border: '1px solid #e0d4f5',
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#6d28d9', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                🎧 Nghe audio câu {questionNumber}
                            </Typography>
                        </Box>
                        <audio
                            controls
                            src={question.audioUrl}
                            style={{ width: '100%', borderRadius: 8 }}
                        />
                    </Box>
                )}

                {/* Options */}
                <FormControl component="fieldset" fullWidth disabled={disabled}>
                    <RadioGroup
                        value={selectedAnswer !== undefined ? selectedAnswer : ''}
                        onChange={(e) => onAnswerChange && onAnswerChange(parseInt(e.target.value))}
                    >
                        {question.options.map((option, index) => (
                            <Box key={index} sx={getOptionSx(index)}>
                                <FormControlLabel
                                    value={index}
                                    control={
                                        <Radio
                                            size="small"
                                            sx={{
                                                color: isSelected(index) && !showResult ? '#3b82f6' : '#9ca3af',
                                                '&.Mui-checked': { color: '#3b82f6' },
                                            }}
                                        />
                                    }
                                    label={
                                        <Typography variant="body1" sx={{
                                            color: isSelected(index) && !showResult ? '#1e40af' : '#374151',
                                            fontWeight: isSelected(index) && !showResult ? 600 : 400,
                                        }}>
                                            <strong style={{ marginRight: 6, color: isSelected(index) && !showResult ? '#3b82f6' : '#6b7280' }}>
                                                {getOptionLabel(index)}.
                                            </strong>
                                            {option}
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
                    <Box sx={{ mt: 3, p: 2, bgcolor: '#eff6ff', borderRadius: 2, borderLeft: '4px solid #3b82f6' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1d4ed8', mb: 0.5 }}>
                            💡 Giải thích:
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#374151', lineHeight: 1.7 }}>
                            {question.explanation}
                        </Typography>
                    </Box>
                )}

                {/* Show AI feedback if available */}
                {showResult && feedback && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: '#f9fafb', borderRadius: 2, borderLeft: '4px solid #6b7280' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#374151', mb: 0.5 }}>
                            🤖 Nhận xét AI:
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#4b5563', lineHeight: 1.7 }}>
                            {feedback}
                        </Typography>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export default QuestionCard;
