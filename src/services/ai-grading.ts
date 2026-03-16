// AI Grading Service
// Handles AI-powered automatic grading of tests

import axiosInstance from '../utils/axios.customize';
import { AIGradingResult, TestAttemptResponse } from '../types/test';

/**
 * Submit test answers for AI grading
 * @param testId - ID of the test
 * @param answers - Array of student's answers (indices 0-3 for A-D)
 * @returns AI grading result with score, feedback, and suggestions
 */
export const submitTestForGrading = async (
    testId: string,
    answers: number[]
): Promise<TestAttemptResponse> => {
    const response = await axiosInstance.post(`/tests/${testId}/submit`, {
        answers,
    });
    return response.data;
};

/**
 * Submit a Writing test for AI grading
 * @param testId - ID of the test
 * @param writingResponse - Student's essay text
 */
export const submitWritingTest = async (
    testId: string,
    writingResponse: string
): Promise<TestAttemptResponse> => {
    const response = await axiosInstance.post(`/tests/${testId}/submit/writing`, {
        writingResponse,
    });
    return response.data;
};

/**
 * Submit a Speaking test for AI grading (audio recording)
 * @param testId - ID of the test
 * @param audioBlob - Recorded audio blob
 */
export const submitSpeakingTest = async (
    testId: string,
    audioBlob: Blob
): Promise<TestAttemptResponse> => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    const response = await axiosInstance.post(`/tests/${testId}/submit/speaking`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000, // 60s timeout for AI grading
    });
    return response.data;
};

/**
 * Get AI feedback for an attempt
 */
export const getAiFeedback = async (attemptId: string) => {
    const response = await axiosInstance.get(`/tests/attempts/${attemptId}/ai-feedback`);
    return response.data;
};

/**
 * Get AI grading result for a specific attempt
 * @param attemptId - ID of the test attempt
 * @returns Full grading details with feedback
 */
export const getGradingResult = async (attemptId: string): Promise<TestAttemptResponse> => {
    const response = await axiosInstance.get(`/tests/attempts/${attemptId}/result`);
    return response.data;
};

/**
 * Request AI to re-grade a test attempt
 * (Useful if AI model is updated or grading logic changes)
 * @param attemptId - ID of the test attempt to re-grade
 */
export const regradeAttempt = async (attemptId: string): Promise<TestAttemptResponse> => {
    const response = await axiosInstance.post(`/tests/attempts/${attemptId}/regrade`);
    return response.data;
};

/**
 * Get AI suggestions for improvement based on test performance
 * @param attemptId - ID of the test attempt
 * @returns Personalized learning suggestions
 */
export const getAISuggestions = async (
    attemptId: string
): Promise<{ suggestions: string[]; topics: string[] }> => {
    const response = await axiosInstance.get(`/tests/attempts/${attemptId}/suggestions`);
    return response.data;
};

// ============================================
// Mock AI Grading (for development/testing)
// ============================================

/**
 * Mock AI grading function for development
 * Simulates AI grading when backend is not available
 * @param answers - Student's answers
 * @param correctAnswers - Correct answers from test
 * @param questions - Test questions for feedback generation
 */
export const mockAIGrading = (
    answers: number[],
    correctAnswers: number[],
    questions: Array<{ question: string; points: number }>
): AIGradingResult => {
    let score = 0;
    let correctCount = 0;
    const feedback: string[] = [];
    const detailedResults = [];

    for (let i = 0; i < answers.length; i++) {
        const isCorrect = answers[i] === correctAnswers[i];
        const question = questions[i];

        if (isCorrect) {
            score += question.points;
            correctCount++;
            feedback.push(`Question ${i + 1}: Correct! Well done.`);
        } else {
            feedback.push(
                `Question ${i + 1}: Incorrect. The correct answer is option ${String.fromCharCode(65 + correctAnswers[i])}.`
            );
        }

        detailedResults.push({
            questionId: `${i + 1}`,
            studentAnswer: answers[i],
            correctAnswer: correctAnswers[i],
            isCorrect,
            feedback: feedback[i],
            points: question.points,
            pointsEarned: isCorrect ? question.points : 0,
        });
    }

    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
    const percentage = (score / totalPoints) * 100;
    const passed = percentage >= 70; // Default passing score

    const suggestions = [];
    if (percentage < 50) {
        suggestions.push('Review the fundamental concepts covered in this test.');
        suggestions.push('Practice more exercises on the topics you missed.');
    } else if (percentage < 70) {
        suggestions.push('You\'re close to passing! Focus on the questions you got wrong.');
        suggestions.push('Try to understand the explanations for incorrect answers.');
    } else if (percentage < 90) {
        suggestions.push('Good job! Review the questions you missed to achieve perfection.');
    } else {
        suggestions.push('Excellent work! Keep up the great performance.');
    }

    return {
        score,
        percentage: Math.round(percentage * 10) / 10,
        passed,
        feedback,
        correctAnswers: correctCount,
        incorrectAnswers: answers.length - correctCount,
        suggestions,
        detailedResults,
    };
};
