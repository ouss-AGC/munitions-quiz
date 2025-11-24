import { useState, useEffect } from 'react';
import { useQuiz } from '@/contexts/QuizContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Trophy, Medal, Award, Download, Eye, EyeOff, Lock, Users, TrendingUp, Target, Clock, FileText } from 'lucide-react';
import type { UserAnswer } from '@/types/quiz';
import { AnimatedGauge } from '@/components/AnimatedGauge';
import { SessionQRCode } from '@/components/SessionQRCode';
import { StudentDetail } from '@/components/StudentDetail';
import { useLocation } from 'wouter';
import type { LeaderboardEntry } from '@/types/quiz';
import { generateConsolidatedReport } from '@/utils/consolidatedPdfGenerator';

export default function Admin() {
  const { leaderboard, waitingParticipants, sessionActive, startSessionForAll, sessionPin, generateSessionPin, selectedDiscipline } = useQuiz();
  const { isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedStudent, setSelectedStudent] = useState<LeaderboardEntry | null>(null);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      setLocation('/admin-login');
    }
  }, [isAuthenticated, setLocation]);

  const handleLogout = () => {
    logout();
    setLocation('/admin-login');
  };

  const exportToCSV = () => {
    const headers = ['Rang', 'Nom', 'Score', 'Pourcentage', 'Date'];
    const rows = leaderboard.map((entry, index) => [
      index + 1,
      entry.studentName,
      `${entry.score}/${entry.totalQuestions}`,
      `${entry.percentage}%`,
      new Date(entry.completedAt).toLocaleString('fr-FR')
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `classement_agc_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleConsolidatedReport = async () => {
    if (!selectedDiscipline) {
      alert('Aucune discipline sélectionnée');
      return;
    }
    if (leaderboard.length === 0) {
      alert('Aucun étudiant n\'a terminé le quiz');
      return;
    }
    await generateConsolidatedReport(leaderboard, selectedDiscipline);
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 bg-green-50';
    if (percentage >= 75) return 'text-blue-600 bg-blue-50';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-50';
    if (percentage >= 50) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-amber-700" />;
    return null;
  };

  // Authentication is now handled by redirect in useEffect
  if (!isAuthenticated) {
    return null;
  }

  const averageScore = leaderboard.length > 0
    ? Math.round(leaderboard.reduce((sum, entry) => sum + entry.percentage, 0) / leaderboard.length)
    : 0;

  const passRate = leaderboard.length > 0
    ? Math.round((leaderboard.filter(entry => entry.percentage >= 50).length / leaderboard.length) * 100)
    : 0;

  // Calculate average response time in seconds
  const averageResponseTime = leaderboard.length > 0
    ? Math.round(
        leaderboard.reduce((sum, entry) => {
          if (!entry.userAnswers || entry.userAnswers.length === 0) return sum;
          const totalTime = entry.userAnswers.reduce((t: number, a: UserAnswer) => t + (a.timeSpent || 0), 0);
          const avgTime = totalTime / entry.userAnswers.length;
          return sum + avgTime;
        }, 0) / leaderboard.length
      )
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-4 sm:py-8 px-3 sm:px-4">
      <div className="container max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-1">Tableau de Bord Administrateur</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Classement complet de la classe - Munitions LASM 3 2025/2026
            </p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button onClick={exportToCSV} variant="outline" size="sm" className="flex-1 sm:flex-none">
              <Download className="w-4 h-4 mr-2" />
              CSV
            </Button>
            <Button 
              onClick={handleConsolidatedReport} 
              variant="default" 
              size="sm" 
              className="flex-1 sm:flex-none bg-primary hover:bg-primary/90"
              disabled={leaderboard.length === 0}
            >
              <FileText className="w-4 h-4 mr-2" />
              Rapport Consolidé
            </Button>
            <Button onClick={handleLogout} variant="outline" size="sm" className="flex-1 sm:flex-none">
              Déconnexion
            </Button>
          </div>
        </div>

        {/* Session Control Panel */}
        <Card className="mb-6 border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Contrôle de Session
            </CardTitle>
            <CardDescription>
              Gérez le démarrage synchronisé du quiz pour tous les participants
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* PIN and QR Code Display */}
            {sessionPin && (
              <div className="mb-6">
                <SessionQRCode pin={sessionPin} />
              </div>
            )}
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Waiting Participants */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${waitingParticipants.length > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                  Participants en attente ({waitingParticipants.length})
                </h3>
                <div className="bg-background/50 rounded-lg p-4 max-h-48 overflow-y-auto">
                  {waitingParticipants.length > 0 ? (
                    <div className="space-y-2">
                      {waitingParticipants.map((name, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span>{name}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Aucun participant en attente
                    </p>
                  )}
                </div>
              </div>

              {/* Session Control */}
              <div>
                <h3 className="font-semibold mb-3">Statut de la Session</h3>
                <div className="space-y-4">
                  {sessionActive ? (
                    <div className="bg-green-500/10 border-2 border-green-500 rounded-lg p-4 text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                        <p className="font-bold text-green-600 dark:text-green-400">Session Active</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Le quiz est en cours pour tous les participants
                      </p>
                    </div>
                  ) : (
                    <div className="bg-yellow-500/10 border-2 border-yellow-500 rounded-lg p-4 text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <p className="font-bold text-yellow-600 dark:text-yellow-400">Session Inactive</p>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        En attente du démarrage
                      </p>
                      {!sessionPin ? (
                        <Button
                          onClick={generateSessionPin}
                          className="w-full mb-3"
                          size="lg"
                          variant="outline"
                        >
                          <Lock className="w-4 h-4 mr-2" />
                          Générer un Code PIN
                        </Button>
                      ) : (
                        <Button
                          onClick={startSessionForAll}
                          disabled={waitingParticipants.length === 0}
                          className="w-full"
                          size="lg"
                        >
                          <Target className="w-4 h-4 mr-2" />
                          Démarrer le Quiz pour Tous
                        </Button>
                      )}             </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Luxury Dashboard - Mercedes Style */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 sm:p-8 mb-8 shadow-2xl border border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Tableau de Bord Statistiques</h2>
              <p className="text-sm text-slate-400">Indicateurs de performance en temps réel</p>
            </div>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8">
            <AnimatedGauge
              value={leaderboard.length > 0 ? (leaderboard.length / 24) * 100 : 0}
              label="Participation"
              unit=""
              color="#3b82f6"
            />
            <AnimatedGauge
              value={averageScore}
              label="Score Moyen"
              unit="%"
              color="#10b981"
            />
            <AnimatedGauge
              value={passRate}
              label="Taux Réussite"
              unit="%"
              color="#f59e0b"
            />
            <AnimatedGauge
              value={leaderboard.length > 0 ? leaderboard[0].percentage : 0}
              label="Meilleur Score"
              unit="%"
              color="#ef4444"
            />
            <AnimatedGauge
              value={averageResponseTime}
              label="Temps Moyen"
              unit="s"
              color="#8b5cf6"
              maxValue={60}
            />
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 hidden">
          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground font-normal">Total Étudiants</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{leaderboard.length}</p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground font-normal">Score Moyen</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">{averageScore}%</p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground font-normal">Taux de Réussite</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{passRate}%</p>
              <p className="text-xs text-muted-foreground mt-1">≥ 50%</p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground font-normal">Meilleur Score</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-yellow-600">
                {leaderboard.length > 0 ? `${leaderboard[0].percentage}%` : '-'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Full Leaderboard */}
        <Card className="border-2 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl">Classement Complet de la Classe</CardTitle>
            <CardDescription>
              Tous les résultats des étudiants par ordre décroissant
            </CardDescription>
          </CardHeader>
          <CardContent>
            {leaderboard.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">Aucun résultat enregistré pour le moment</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Les scores apparaîtront ici une fois que les étudiants auront complété le quiz
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2">
                      <th className="text-left py-3 px-2 sm:px-4 font-semibold text-sm">Rang</th>
                      <th className="text-left py-3 px-2 sm:px-4 font-semibold text-sm">Nom de l'étudiant</th>
                      <th className="text-center py-3 px-2 sm:px-4 font-semibold text-sm">Score</th>
                      <th className="text-center py-3 px-2 sm:px-4 font-semibold text-sm hidden sm:table-cell">Pourcentage</th>
                      <th className="text-center py-3 px-2 sm:px-4 font-semibold text-sm hidden md:table-cell">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry, index) => (
                      <tr
                        key={index}
                        className={`border-b transition-colors hover:bg-muted/50 ${
                          index < 3 ? 'bg-muted/20' : ''
                        }`}
                      >
                        <td className="py-3 px-2 sm:px-4">
                          <div className="flex items-center gap-2">
                            {getMedalIcon(index + 1)}
                            <span className="font-bold text-lg">{index + 1}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 sm:px-4">
                          <button
                            onClick={() => setSelectedStudent(entry)}
                            className="font-medium text-sm sm:text-base text-primary hover:underline hover:text-primary/80 transition-colors text-left"
                          >
                            {entry.studentName}
                          </button>
                        </td>
                        <td className="py-3 px-2 sm:px-4 text-center">
                          <span className="font-semibold text-sm sm:text-base">
                            {entry.score}/{entry.totalQuestions}
                          </span>
                        </td>
                        <td className="py-3 px-2 sm:px-4 text-center hidden sm:table-cell">
                          <span
                            className={`inline-block px-3 py-1 rounded-full font-bold text-sm ${getPerformanceColor(
                              entry.percentage
                            )}`}
                          >
                            {entry.percentage}%
                          </span>
                        </td>
                        <td className="py-3 px-2 sm:px-4 text-center text-xs sm:text-sm text-muted-foreground hidden md:table-cell">
                          {new Date(entry.completedAt).toLocaleString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="mt-6 text-center">
          <Button onClick={() => setLocation('/')} variant="outline" size="lg">
            Retour à l'accueil
          </Button>
        </div>
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <StudentDetail
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
}

