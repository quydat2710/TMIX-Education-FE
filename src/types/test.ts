// Test Module Types for AI Auto-grading System

import { BaseEntity } from './index';

// Multiple Choice Question (Reading + Listening)
export interface MCQuestion {
  id: string;
  question: string;
  options: string[];         // Array of 4 options (A, B, C, D)
  correctAnswer: number;     // Index of correct option (0-3)
  explanation?: string;      // Optional explanation
  points: number;            // Points for this question
  audioUrl?: string;         // Per-question audio (listening)
}

// Writing Question
export interface WritingQuestion {
  id: string;
  prompt: string;
  minWords?: number;
  maxWords?: number;
  sampleAnswer?: string;
  rubric?: string;           // Grading criteria for AI
  points: number;
}

// Speaking Question
export interface SpeakingQuestion {
  id: string;
  prompt: string;
  referenceText: string;     // Correct text for comparison
  audioUrl?: string;         // Reference pronunciation audio
  duration?: number;         // Max recording time in seconds
  points: number;
}

export type SkillType = 'reading' | 'listening' | 'writing' | 'speaking';

// Test Entity
export interface Test extends BaseEntity {
  title: string;
  description?: string;
  skillType: SkillType;
  classId: string;
  teacherId: string;
  duration: number;          // in minutes
  totalPoints: number;
  passingScore: number;      // percentage (0-100)
  questions: any[];          // MCQuestion[] | WritingQuestion[] | SpeakingQuestion[]
  audioUrl?: string;         // Main audio URL (listening)
  passage?: string;          // Reading passage or Writing prompt
  speakingPrompt?: string;   // Speaking test general prompt
  status: 'draft' | 'published' | 'archived';
  // Additional metadata
  className?: string;
  teacherName?: string;
}

// Student Test Attempt
export interface TestAttempt extends BaseEntity {
  testId: string;
  studentId: string;
  answers: number[];         // Student's answers (indices)
  score: number;             // Points earned
  percentage: number;        // Percentage score
  passed: boolean;
  feedback: string[];        // AI feedback for each question
  startedAt: string;
  submittedAt: string;
  gradedAt: string;
  // Additional metadata
  test?: Test;
  studentName?: string;
}

// AI Grading Response
export interface AIGradingResult {
  score: number;
  percentage: number;
  passed: boolean;
  feedback: string[];        // Feedback for each question
  correctAnswers: number;
  incorrectAnswers: number;
  suggestions: string[];     // Overall improvement suggestions
  detailedResults: {
    questionId: string;
    studentAnswer: number;
    correctAnswer: number;
    isCorrect: boolean;
    feedback: string;
    points: number;
        pointsEarned: number;
  }[];
}

// Form Data Types
export interface TestFormData {
  title: string;
  description: string;
  skillType: SkillType;
  classId: string;
  duration: number;
  passingScore: number;
  questions: any[];          // MCQuestion[] | WritingQuestion[] | SpeakingQuestion[]
  passage?: string;          // Reading passage or Writing prompt
  speakingPrompt?: string;   // Speaking test general prompt
  audioUrl?: string;         // Main audio URL (listening)
  status: 'draft' | 'published';
}

export interface TestFormErrors {
  title?: string;
  description?: string;
  classId?: string;
  duration?: string;
  passingScore?: string;
  questions?: string;
}

// Question Form Data
export interface QuestionFormData {
  question: string;
  options: [string, string, string, string]; // Exactly 4 options
  correctAnswer: number;
  explanation: string;
  points: number;
}

export interface QuestionFormErrors {
  question?: string;
  options?: string[];
  correctAnswer?: string;
  points?: string;
}

// API Response Types
export interface TestsListResponse {
  statusCode: number;
  message: string;
  data: {
    meta: {
      limit: number;
      page: number;
      totalPages: number;
      totalItems: number;
    };
    result: Test[];
  };
}

export interface TestResponse {
  statusCode: number;
  message: string;
  data: Test;
}

export interface TestAttemptResponse {
  statusCode: number;
  message: string;
  data: TestAttempt;
}

export interface AttemptsListResponse {
  statusCode: number;
  message: string;
  data: {
    meta: {
      limit: number;
      page: number;
      totalPages: number;
      totalItems: number;
    };
    result: TestAttempt[];
  };
}

// Statistics Types
export interface TestStatistics {
  testId: string;
  totalAttempts: number;
  averageScore: number;
  averagePercentage: number;
  passRate: number;
  highestScore: number;
  lowestScore: number;
}

// Student Test List Item (simplified for list view)
export interface StudentTestItem {
  id: string;
  title: string;
  description?: string;
  className: string;
  teacherName: string;
  duration: number;
  totalPoints: number;
  passingScore: number;
  questionCount: number;
  hasAttempted: boolean;
  lastAttempt?: {
    score: number;
    percentage: number;
    passed: boolean;
    submittedAt: string;
  };
}
