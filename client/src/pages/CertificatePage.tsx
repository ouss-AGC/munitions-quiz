import { useQuiz } from '@/contexts/QuizContext';
import { useLocation } from 'wouter';
import { useEffect } from 'react';
import Certificate from '@/components/Certificate';

export default function CertificatePage() {
  const { userAnswers, studentName, quizData, leaderboard } = useQuiz();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Redirect if no quiz data or not completed
    if (!quizData || userAnswers.length === 0) {
      setLocation('/');
    }
  }, [quizData, userAnswers, setLocation]);

  if (!quizData || userAnswers.length === 0) {
    return null;
  }

  const score = userAnswers.filter(a => a.isCorrect).length;
  const totalQuestions = quizData.questions.length;
  const percentage = Math.round((score / totalQuestions) * 100);
  const rank = leaderboard.findIndex(entry => entry.studentName === studentName) + 1;

  // Format date in French
  const date = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  return (
    <Certificate
      studentName={studentName}
      score={score}
      totalQuestions={totalQuestions}
      percentage={percentage}
      rank={rank}
      date={date}
    />
  );
}

