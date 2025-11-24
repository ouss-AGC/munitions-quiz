import { X, CheckCircle, XCircle, Clock, Award } from 'lucide-react';
import { LeaderboardEntry } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateAdminReport } from '@/utils/adminPdfGenerator';
import { useQuiz } from '@/contexts/QuizContext';

interface StudentDetailProps {
  student: LeaderboardEntry;
  onClose: () => void;
}

export function StudentDetail({ student, onClose }: StudentDetailProps) {
  const { leaderboard, selectedDiscipline } = useQuiz();

  const handleDownloadReport = async () => {
    if (!selectedDiscipline) return;
    await generateAdminReport(student, leaderboard, selectedDiscipline);
  };
  // Safety check for old leaderboard data without userAnswers
  if (!student.userAnswers || student.userAnswers.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-background rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-bold">Données Incomplètes</h2>
            <p className="text-muted-foreground">
              Les détails de performance ne sont pas disponibles pour cet étudiant.
              Cela peut être dû à des données anciennes avant la mise à jour du système.
            </p>
            <Button onClick={onClose} className="w-full">
              Fermer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const correctAnswers = student.userAnswers.filter(a => a.isCorrect).length;
  const incorrectAnswers = student.userAnswers.filter(a => !a.isCorrect && a.selectedAnswer !== null).length;
  const unanswered = student.totalQuestions - student.userAnswers.length;
  
  // Calculate average response time
  const totalTime = student.userAnswers.reduce((sum, a) => sum + (a.timeSpent || 0), 0);
  const avgTime = student.userAnswers.length > 0 ? Math.round(totalTime / student.userAnswers.length) : 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <Award className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-500" />
                {student.studentName}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Détails de performance individuelle
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          <Button 
            onClick={handleDownloadReport}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Télécharger Rapport Détaillé PDF
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="p-4 sm:p-6 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm text-muted-foreground">Score</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl sm:text-2xl font-bold">{student.score}/{student.totalQuestions}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm text-muted-foreground">Pourcentage</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-xl sm:text-2xl font-bold ${
                  student.percentage >= 90 ? 'text-green-600' :
                  student.percentage >= 70 ? 'text-blue-600' :
                  student.percentage >= 50 ? 'text-orange-600' : 'text-red-600'
                }`}>
                  {student.percentage}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm text-muted-foreground">Temps Moyen</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl sm:text-2xl font-bold flex items-center gap-1">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                  {avgTime}s
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm text-muted-foreground">Date</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base font-semibold">
                  {new Date(student.completedAt).toLocaleDateString('fr-FR')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(student.completedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Répartition des Réponses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm sm:text-base">Correctes</span>
                </div>
                <span className="font-bold text-green-600">{correctAnswers}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span className="text-sm sm:text-base">Incorrectes</span>
                </div>
                <span className="font-bold text-red-600">{incorrectAnswers}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center">
                    <span className="text-xs text-gray-400">?</span>
                  </div>
                  <span className="text-sm sm:text-base">Non répondues</span>
                </div>
                <span className="font-bold text-gray-600">{unanswered}</span>
              </div>
            </CardContent>
          </Card>

          {/* Question-by-Question Review */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Révision Détaillée par Question</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {student.userAnswers.map((answer, idx) => (
                <div
                  key={idx}
                  className={`p-3 sm:p-4 rounded-lg border-2 ${
                    answer.isCorrect
                      ? 'border-green-200 bg-green-50'
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    {answer.isCorrect ? (
                      <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm sm:text-base mb-1">
                        Question {answer.questionId}
                      </p>
                      <div className="text-xs sm:text-sm space-y-1">
                        <p>
                          <span className="font-medium">Réponse de l'étudiant:</span>{' '}
                          <span className={answer.isCorrect ? 'text-green-700' : 'text-red-700'}>
                            Option {String.fromCharCode(97 + answer.selectedAnswer)}
                          </span>
                        </p>
                        {!answer.isCorrect && answer.correctAnswer !== undefined && (
                          <p>
                            <span className="font-medium">Réponse correcte:</span>{' '}
                            <span className="text-green-700">
                              Option {String.fromCharCode(97 + answer.correctAnswer)}
                            </span>
                          </p>
                        )}
                        {answer.timeSpent !== undefined && (
                          <p className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            Temps: {answer.timeSpent}s
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-background border-t p-4 sm:p-6">
          <Button onClick={onClose} className="w-full sm:w-auto">
            Fermer
          </Button>
        </div>
      </div>
    </div>
  );
}

