import { useEffect, useState } from 'react';
import { useQuiz } from '@/contexts/QuizContext';
import { generateStudentCertificate } from '@/utils/pdfGenerator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, CheckCircle2, XCircle, RotateCcw, Home, Award, Download } from 'lucide-react';
import { useLocation } from 'wouter';
import type { QuizResult } from '@/types/quiz';

export default function Results() {
  const { quizData, userAnswers, studentName, resetQuiz, leaderboard, selectedDiscipline } = useQuiz();
  const [, setLocation] = useLocation();
  const [result, setResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    if (!quizData) return;

    const score = userAnswers.filter(a => a.isCorrect).length;
    const totalQuestions = quizData.questions.length;
    const percentage = Math.round((score / totalQuestions) * 100);

    setResult({
      score,
      totalQuestions,
      percentage,
      answers: userAnswers,
      completedAt: new Date(),
      studentName
    });
  }, [quizData, userAnswers, studentName]);

  const handleRestart = () => {
    resetQuiz();
    setLocation('/');
  };

  const handleDownloadCertificate = async () => {
    if (!result || !selectedDiscipline) return;
    await generateStudentCertificate(result, selectedDiscipline);
  };

  if (!quizData || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Chargement des résultats...</p>
      </div>
    );
  }

  const incorrectAnswers = result.totalQuestions - result.score;
  const rank = leaderboard.findIndex(entry => 
    entry.studentName === studentName && 
    Math.abs(new Date(entry.completedAt).getTime() - result.completedAt.getTime()) < 1000
  ) + 1;

  const getPerformanceMessage = (percentage: number) => {
    if (percentage >= 90) return { text: "Excellent !", color: "text-success" };
    if (percentage >= 75) return { text: "Très bien !", color: "text-primary" };
    if (percentage >= 60) return { text: "Bien", color: "text-secondary" };
    if (percentage >= 50) return { text: "Passable", color: "text-accent" };
    return { text: "À améliorer", color: "text-destructive" };
  };

  const performance = getPerformanceMessage(result.percentage);
  const isTopScorer = rank === 1 && leaderboard.length > 0;
  const [showCertificate, setShowCertificate] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-4 sm:py-8 px-3 sm:px-4">
      <div className="container max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
            <Trophy className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Quiz Terminé !</h1>
          <p className="text-base sm:text-lg text-muted-foreground">{studentName}</p>
        </div>

        {/* Score Overview */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          <Card className="border-2 shadow-lg text-center">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground font-normal">Score Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-2">
                {result.score}<span className="text-xl sm:text-2xl text-muted-foreground">/{result.totalQuestions}</span>
              </div>
              <p className="text-sm text-muted-foreground">questions correctes</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg text-center">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground font-normal">Pourcentage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-2 ${performance.color}`}>
                {result.percentage}%
              </div>
              <p className={`text-sm font-medium ${performance.color}`}>{performance.text}</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg text-center">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground font-normal">Classement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-accent mb-2">
                {rank > 0 ? `#${rank}` : '-'}
              </div>
              <p className="text-sm text-muted-foreground">sur {leaderboard.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Breakdown */}
        <Card className="border-2 shadow-lg mb-8">
          <CardHeader>
            <CardTitle>Statistiques de Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  Réponses correctes
                </span>
                <span className="text-sm font-bold">{result.score} ({result.percentage}%)</span>
              </div>
              <Progress value={result.percentage} className="h-2 bg-muted" />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-destructive" />
                  Réponses incorrectes
                </span>
                <span className="text-sm font-bold">
                  {incorrectAnswers} ({Math.round((incorrectAnswers / result.totalQuestions) * 100)}%)
                </span>
              </div>
              <Progress 
                value={(incorrectAnswers / result.totalQuestions) * 100} 
                className="h-2 bg-muted [&>div]:bg-destructive" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center p-4 bg-success/10 rounded-lg">
                <CheckCircle2 className="w-8 h-8 text-success mx-auto mb-2" />
                <p className="text-2xl font-bold text-success">{result.score}</p>
                <p className="text-sm text-muted-foreground">Correctes</p>
              </div>
              <div className="text-center p-4 bg-destructive/10 rounded-lg">
                <XCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
                <p className="text-2xl font-bold text-destructive">{incorrectAnswers}</p>
                <p className="text-sm text-muted-foreground">Incorrectes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Answers Review */}
        <Card className="border-2 shadow-lg mb-8">
          <CardHeader>
            <CardTitle>Révision Détaillée</CardTitle>
            <CardDescription>
              Passez en revue vos réponses et les corrections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4 max-h-[600px] overflow-y-auto pr-1 sm:pr-2">
              {quizData.questions.map((question, index) => {
                const userAnswer = userAnswers.find(a => a.questionId === question.id);
                const isCorrect = userAnswer?.isCorrect ?? false;
                const userSelectedIndex = userAnswer?.selectedAnswer;

                return (
                  <div
                    key={question.id}
                    className={`p-3 sm:p-4 rounded-lg border-2 ${
                      isCorrect
                        ? 'bg-success/5 border-success/20'
                        : userAnswer
                        ? 'bg-destructive/5 border-destructive/20'
                        : 'bg-muted/30 border-muted'
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        isCorrect
                          ? 'bg-success text-success-foreground'
                          : userAnswer
                          ? 'bg-destructive text-destructive-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {isCorrect ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : userAnswer ? (
                          <XCircle className="w-5 h-5" />
                        ) : (
                          <span className="text-sm font-bold">?</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm sm:text-base font-semibold mb-2">
                          Question {index + 1}: {question.question}
                        </h4>
                        
                        <div className="space-y-2 ml-4">
                          {question.options.map((option, optIndex) => {
                            const isUserSelection = userSelectedIndex === optIndex;
                            const isCorrectAnswer = question.correctAnswer === optIndex;
                            const optionLabel = String.fromCharCode(97 + optIndex);

                            return (
                              <div
                                key={optIndex}
                                className={`p-2 rounded flex items-start gap-2 ${
                                  isCorrectAnswer
                                    ? 'bg-success/20 font-medium'
                                    : isUserSelection && !isCorrect
                                    ? 'bg-destructive/20'
                                    : ''
                                }`}
                              >
                                <span className="font-mono text-sm">{optionLabel})</span>
                                <span className="flex-1">{option}</span>
                                {isCorrectAnswer && (
                                  <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                                )}
                                {isUserSelection && !isCorrect && (
                                  <XCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {!userAnswer && (
                          <p className="text-sm text-muted-foreground mt-2 ml-4">
                            Non répondue
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Scorer Certificate Button */}
        {isTopScorer && (
          <Card className="border-4 border-yellow-500 bg-gradient-to-br from-yellow-50 to-amber-50 shadow-2xl mb-8">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-500/20 mb-2">
                  <Award className="w-12 h-12 text-yellow-600" />
                </div>
                <h3 className="text-2xl font-bold text-yellow-900">🏆 Félicitations !</h3>
                <p className="text-lg text-yellow-800 font-semibold">
                  Vous avez obtenu le <span className="text-yellow-900 font-bold">MEILLEUR SCORE</span> de la promotion !
                </p>
                <p className="text-sm text-yellow-700">
                  En reconnaissance de votre excellence académique, vous pouvez télécharger votre certificat d'honneur.
                </p>
                <Button
                  onClick={() => setLocation('/certificate')}
                  size="lg"
                  className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold shadow-lg"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Télécharger mon Certificat d'Excellence
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleDownloadCertificate}
            size="lg"
            variant="default"
            className="min-w-48 bg-blue-600 hover:bg-blue-700"
          >
            <Download className="w-5 h-5 mr-2" />
            Télécharger Certificat PDF
          </Button>
          <Button
            onClick={handleRestart}
            size="lg"
            variant="outline"
            className="min-w-48"
          >
            <Home className="w-5 h-5 mr-2" />
            Retour à l'accueil
          </Button>
          <Button
            onClick={() => {
              resetQuiz();
              window.location.reload();
            }}
            size="lg"
            className="min-w-48"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Refaire le Quiz
          </Button>
        </div>

        {/* Rank Badge */}
        {rank > 0 && rank <= 3 && (
          <div className="mt-8 text-center">
            <Card className={`inline-block border-2 ${
              rank === 1
                ? 'bg-accent/10 border-accent shadow-xl'
                : rank === 2
                ? 'bg-secondary/10 border-secondary shadow-lg'
                : 'bg-primary/10 border-primary shadow-md'
            }`}>
              <CardContent className="pt-6">
                <Award className={`w-16 h-16 mx-auto mb-2 ${
                  rank === 1
                    ? 'text-accent'
                    : rank === 2
                    ? 'text-secondary'
                    : 'text-primary'
                }`} />
                <p className="text-2xl font-bold mb-1">
                  {rank === 1 ? '🥇 1ère Place !' : rank === 2 ? '🥈 2ème Place !' : '🥉 3ème Place !'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Félicitations pour votre excellent score !
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

