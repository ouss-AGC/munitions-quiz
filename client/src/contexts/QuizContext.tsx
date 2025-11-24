import React, { createContext, useContext, useState, useEffect } from 'react';
import type { QuizData, UserAnswer, QuizResult, LeaderboardEntry } from '@/types/quiz';
import type { Discipline } from '@/types/discipline';

interface QuizContextType {
  quizData: QuizData | null;
  currentQuestionIndex: number;
  userAnswers: UserAnswer[];
  quizStarted: boolean;
  quizCompleted: boolean;
  studentName: string;
  startTime: number;
  leaderboard: LeaderboardEntry[];
  questionStartTime: number;
  questionTimeRemaining: number;
  isQuestionLocked: boolean;
  sessionActive: boolean;
  waitingParticipants: string[];
  sessionPin: string;
  selectedDiscipline: Discipline | null;
  setSelectedDiscipline: (discipline: Discipline) => void;
  generateSessionPin: () => void;
  validatePin: (pin: string) => boolean;
  setStudentName: (name: string) => void;
  startQuiz: (name?: string) => void;
  answerQuestion: (questionId: number, selectedAnswer: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  submitQuiz: () => QuizResult | null;
  resetQuiz: () => void;
  loadQuizData: (dataFile?: string) => Promise<void>;
  goToQuestion: (index: number) => void;
  joinSession: (name: string, studentInfo?: { name: string; grade: string; class: string; registerNumber: string }) => void;
  startSessionForAll: () => void;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export function QuizProvider({ children }: { children: React.ReactNode }) {
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [startTime, setStartTime] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [questionStartTime, setQuestionStartTime] = useState(0);
  const [questionTimeRemaining, setQuestionTimeRemaining] = useState(60);
  const [isQuestionLocked, setIsQuestionLocked] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [waitingParticipants, setWaitingParticipants] = useState<string[]>([]);
  const [sessionPin, setSessionPin] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState<Discipline | null>(null);

  // Generate a random 6-digit PIN with 4-hour expiration
  const generateSessionPin = () => {
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + (4 * 60 * 60 * 1000); // 4 hours
    setSessionPin(pin);
    localStorage.setItem('sessionPin', pin);
    localStorage.setItem('sessionPinExpiry', expiresAt.toString());
  };

  // Validate PIN entered by student (check expiration)
  const validatePin = (pin: string): boolean => {
    const storedPin = localStorage.getItem('sessionPin') || sessionPin;
    const expiry = localStorage.getItem('sessionPinExpiry');
    
    // Check if PIN has expired
    if (expiry && Date.now() > parseInt(expiry)) {
      return false;
    }
    
    return pin === storedPin;
  };

  // Load quiz data from JSON (with discipline support)
  const loadQuizData = async (dataFile?: string) => {
    try {
      const file = dataFile || selectedDiscipline?.dataFile || '/quiz_data_agc.json';
      const response = await fetch(file);
      const data: QuizData = await response.json();
      setQuizData(data);
    } catch (error) {
      console.error('Failed to load quiz data:', error);
    }
  };

  // Load leaderboard from localStorage (discipline-specific)
  useEffect(() => {
    if (!selectedDiscipline) return;
    const savedLeaderboard = localStorage.getItem(`agc-quiz-leaderboard-${selectedDiscipline.id}`);
    if (savedLeaderboard) {
      const parsed = JSON.parse(savedLeaderboard);
      // Convert date strings back to Date objects
      const entries = parsed.map((entry: any) => ({
        ...entry,
        completedAt: new Date(entry.completedAt)
      }));
      setLeaderboard(entries);
    }
  }, []);

  // Countdown timer for each question
  useEffect(() => {
    if (!quizStarted || quizCompleted || isQuestionLocked) return;

    const timer = setInterval(() => {
      setQuestionTimeRemaining(prev => {
        if (prev <= 1) {
          setIsQuestionLocked(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizStarted, quizCompleted, isQuestionLocked, currentQuestionIndex]);

  const startQuiz = (name?: string) => {
    const nameToUse = name || studentName;
    if (!nameToUse || !nameToUse.trim()) {
      alert('Veuillez entrer votre nom avant de commencer');
      return;
    }
    if (!quizData) {
      alert('Le quiz n\'est pas encore chargé. Veuillez patienter.');
      return;
    }
    if (name) {
      setStudentName(name);
    }
    setQuizStarted(true);
    setStartTime(Date.now());
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setQuizCompleted(false);
    setQuestionStartTime(Date.now());
    setQuestionTimeRemaining(60);
    setIsQuestionLocked(false);
  };

  const answerQuestion = (questionId: number, selectedAnswer: number) => {
    if (!quizData || isQuestionLocked) return;

    const question = quizData.questions.find(q => q.id === questionId);
    if (!question) return;

    const isCorrect = selectedAnswer === question.correctAnswer;
    const timeSpent = 60 - questionTimeRemaining; // Time taken for this question

    const newAnswer: UserAnswer = {
      questionId,
      selectedAnswer,
      isCorrect,
      timeSpent,
      correctAnswer: question.correctAnswer
    };

    setUserAnswers(prev => {
      const filtered = prev.filter(a => a.questionId !== questionId);
      return [...filtered, newAnswer];
    });
  };

  const nextQuestion = () => {
    if (!quizData) return;
    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setQuestionStartTime(Date.now());
      setQuestionTimeRemaining(60);
      setIsQuestionLocked(false);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setQuestionStartTime(Date.now());
      setQuestionTimeRemaining(60);
      setIsQuestionLocked(false);
    }
  };

  const goToQuestion = (index: number) => {
    if (!quizData) return;
    if (index >= 0 && index < quizData.questions.length) {
      setCurrentQuestionIndex(index);
      setQuestionStartTime(Date.now());
      setQuestionTimeRemaining(60);
      setIsQuestionLocked(false);
    }
  };

  const submitQuiz = (): QuizResult | null => {
    if (!quizData) return null;

    const score = userAnswers.filter(a => a.isCorrect).length;
    const totalQuestions = quizData.questions.length;
    const percentage = Math.round((score / totalQuestions) * 100);

    // Get student info from localStorage
    const studentInfoStr = localStorage.getItem('currentStudentInfo');
    const studentInfo = studentInfoStr ? JSON.parse(studentInfoStr) : null;

    const result: QuizResult = {
      score,
      totalQuestions,
      percentage,
      answers: userAnswers,
      completedAt: new Date(),
      studentName,
      grade: studentInfo?.grade,
      studentClass: studentInfo?.class,
      registerNumber: studentInfo?.registerNumber
    };

    // Add to leaderboard
    const newEntry: LeaderboardEntry = {
      studentName,
      score,
      totalQuestions,
      percentage,
      completedAt: new Date(),
      userAnswers,
      grade: studentInfo?.grade,
      studentClass: studentInfo?.class,
      registerNumber: studentInfo?.registerNumber
    };

    const updatedLeaderboard = [...leaderboard, newEntry]
      .sort((a, b) => b.score - a.score || b.percentage - a.percentage); // Keep all entries for admin view

    setLeaderboard(updatedLeaderboard);
    if (selectedDiscipline) {
      localStorage.setItem(`agc-quiz-leaderboard-${selectedDiscipline.id}`, JSON.stringify(updatedLeaderboard));
    }

    setQuizCompleted(true);
    return result;
  };

  // Join waiting session (discipline-specific)
  const joinSession = (name: string, studentInfo?: { name: string; grade: string; class: string; registerNumber: string }) => {
    setStudentName(name);
    if (!selectedDiscipline) return;
    
    // Store student info in localStorage for later use
    if (studentInfo) {
      localStorage.setItem('currentStudentInfo', JSON.stringify(studentInfo));
    }
    
    const participants = JSON.parse(localStorage.getItem(`agc-quiz-participants-${selectedDiscipline.id}`) || '[]');
    if (!participants.includes(name)) {
      participants.push(name);
      if (selectedDiscipline) {
        localStorage.setItem(`agc-quiz-participants-${selectedDiscipline.id}`, JSON.stringify(participants));
      }
      setWaitingParticipants(participants);
    }
  };

  // Admin starts quiz for all participants (discipline-specific)
  const startSessionForAll = () => {
    if (!selectedDiscipline) return;
    setSessionActive(true);
    localStorage.setItem(`agc-quiz-session-active-${selectedDiscipline.id}`, 'true');
    localStorage.setItem(`agc-quiz-session-start-time-${selectedDiscipline.id}`, Date.now().toString());
  };

  // Monitor session status (discipline-specific)
  useEffect(() => {
    if (!selectedDiscipline) return;
    const checkSession = () => {
      const active = localStorage.getItem(`agc-quiz-session-active-${selectedDiscipline.id}`) === 'true';
      const participants = JSON.parse(localStorage.getItem(`agc-quiz-participants-${selectedDiscipline.id}`) || '[]');
      setSessionActive(active);
      setWaitingParticipants(participants);
      
      // If session is active and student is waiting, start quiz
      if (active && studentName && !quizStarted && !quizCompleted) {
        setQuizStarted(true);
        setStartTime(Date.now());
        setQuestionStartTime(Date.now());
        setQuestionTimeRemaining(60);
      }
    };

    checkSession();
    const interval = setInterval(checkSession, 1000); // Check every second
    return () => clearInterval(interval);
  }, [studentName, quizStarted, quizCompleted]);

  const resetQuiz = () => {
    setQuizStarted(false);
    setQuizCompleted(false);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setStudentName('');
    setStartTime(0);
    setQuestionStartTime(0);
    setQuestionTimeRemaining(60);
    setIsQuestionLocked(false);
  };

  return (
    <QuizContext.Provider
      value={{
        quizData,
        currentQuestionIndex,
        userAnswers,
        quizStarted,
        quizCompleted,
        studentName,
        startTime,
        leaderboard,
        setStudentName,
        startQuiz,
        answerQuestion,
        nextQuestion,
        previousQuestion,
        submitQuiz,
        resetQuiz,
        loadQuizData,
        questionStartTime,
        questionTimeRemaining,
        isQuestionLocked,
        goToQuestion,
        sessionActive,
        waitingParticipants,
        sessionPin,
        selectedDiscipline,
        setSelectedDiscipline,
        generateSessionPin,
        validatePin,
        joinSession,
        startSessionForAll
      }}
    >
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
}

