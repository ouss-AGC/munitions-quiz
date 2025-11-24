export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface QuizData {
  quizTitle: string;
  creator: string;
  module: string;
  questions: Question[];
}

export interface UserAnswer {
  questionId: number;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpent: number;
  correctAnswer?: number;
}

export interface QuizResult {
  score: number;
  totalQuestions: number;
  percentage: number;
  answers: UserAnswer[];
  completedAt: Date;
  studentName: string;
  grade?: string;
  studentClass?: string;
  registerNumber?: string;
}

export interface LeaderboardEntry {
  studentName: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  completedAt: Date;
  userAnswers: UserAnswer[];
  grade?: string;
  studentClass?: string;
  registerNumber?: string;
}

