import { useState } from 'react';
import { useQuiz } from '@/contexts/QuizContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Target, Clock, Award } from 'lucide-react';
import { VoiceBriefing } from '@/components/VoiceBriefing';

export default function Welcome() {
  const { quizData, studentName, joinSession, sessionActive, waitingParticipants, leaderboard, validatePin } = useQuiz();
  const [localName, setLocalName] = useState(studentName);
  const [grade, setGrade] = useState<'Élève-Officier' | 'Officier-Élève'>('Élève-Officier');
  const [studentClass, setStudentClass] = useState('');
  const [registerNumber, setRegisterNumber] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [isWaiting, setIsWaiting] = useState(false);

  const handleJoin = () => {
    if (!localName.trim()) {
      alert('Veuillez entrer votre nom complet');
      return;
    }
    if (!studentClass.trim()) {
      alert('Veuillez entrer votre classe');
      return;
    }
    if (!registerNumber.trim()) {
      alert('Veuillez entrer votre numéro de registre');
      return;
    }
    if (!pinCode.trim()) {
      alert('Veuillez entrer le code PIN');
      return;
    }
    if (!validatePin(pinCode)) {
      alert('Code PIN incorrect');
      setPinCode('');
      return;
    }
    // Combine all student info
    const fullStudentInfo = {
      name: localName,
      grade,
      class: studentClass,
      registerNumber
    };
    joinSession(localName, fullStudentInfo);
    setIsWaiting(true);
  };

  // If waiting and session becomes active, the QuizContext will handle starting the quiz

  if (!quizData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement du quiz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-4 sm:py-8 px-3 sm:px-4">
      <div className="container max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Target className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">{quizData.quizTitle}</h1>
          <p className="text-base sm:text-lg text-muted-foreground mb-1">{quizData.module}</p>
          <p className="text-xs sm:text-sm text-muted-foreground">Créé par: {quizData.creator}</p>
        </div>

        {/* Voice Briefing */}
        <div className="mb-6 sm:mb-8">
          <VoiceBriefing />
        </div>

        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Start Quiz Card */}
          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                Commencer le Quiz
              </CardTitle>
              <CardDescription>
                Entrez votre nom pour commencer le test
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="grade" className="text-sm font-medium">
                  Grade
                </label>
                <select
                  id="grade"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value as 'Élève-Officier' | 'Officier-Élève')}
                  disabled={isWaiting}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="Élève-Officier">Élève-Officier</option>
                  <option value="Officier-Élève">Officier-Élève</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Nom complet
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Votre nom et prénom"
                  value={localName}
                  onChange={(e) => setLocalName(e.target.value)}
                  disabled={isWaiting}
                  className="text-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label htmlFor="class" className="text-sm font-medium">
                    Classe
                  </label>
                  <Input
                    id="class"
                    type="text"
                    placeholder="Ex: LASM307"
                    value={studentClass}
                    onChange={(e) => setStudentClass(e.target.value.toUpperCase())}
                    disabled={isWaiting}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="register" className="text-sm font-medium">
                    N° Registre
                  </label>
                  <Input
                    id="register"
                    type="number"
                    placeholder="Ex: 13"
                    value={registerNumber}
                    onChange={(e) => setRegisterNumber(e.target.value)}
                    disabled={isWaiting}
                    min="1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="pin" className="text-sm font-medium">
                  Code PIN de Session
                </label>
                <Input
                  id="pin"
                  type="text"
                  placeholder="Entrez le code PIN affiché par l'instructeur"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
                  disabled={isWaiting}
                  className="text-lg font-mono tracking-widest"
                  maxLength={6}
                />
                <p className="text-xs text-muted-foreground">
                  Le code PIN est affiché sur l'écran de l'instructeur
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Target className="w-4 h-4 text-primary" />
                  <span><strong>{quizData.questions.length}</strong> questions au total</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>Pas de limite de temps</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Award className="w-4 h-4 text-primary" />
                  <span>Résultats détaillés à la fin</span>
                </div>
              </div>

              {!isWaiting ? (
                <Button 
                  onClick={handleJoin}
                  disabled={!localName.trim()}
                  className="w-full text-lg py-6"
                >
                  Rejoindre la Session
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="bg-yellow-500/10 border-2 border-yellow-500 rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse" />
                      <p className="font-bold text-yellow-600 dark:text-yellow-400">En attente du démarrage...</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      L'instructeur va démarrer le quiz pour tous les participants
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm font-medium mb-2">Participants en attente ({waitingParticipants.length}):</p>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {waitingParticipants.map((name, idx) => (
                        <div key={idx} className="text-sm flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          {name}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Leaderboard Card */}
          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-accent" />
                Classement
              </CardTitle>
              <CardDescription>
                Top 10 des meilleurs scores
              </CardDescription>
            </CardHeader>
            <CardContent>
              {leaderboard.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Trophy className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p>Aucun score enregistré</p>
                  <p className="text-sm">Soyez le premier !</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {leaderboard.map((entry, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        index === 0
                          ? 'bg-accent/10 border border-accent/20'
                          : index === 1
                          ? 'bg-secondary/10 border border-secondary/20'
                          : index === 2
                          ? 'bg-primary/10 border border-primary/20'
                          : 'bg-muted/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          index === 0
                            ? 'bg-accent text-accent-foreground'
                            : index === 1
                            ? 'bg-secondary text-secondary-foreground'
                            : index === 2
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{entry.studentName}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(entry.completedAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{entry.score}/{quizData.questions.length}</p>
                        <p className="text-sm text-muted-foreground">{entry.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="border shadow-md">
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <ul className="space-y-2">
              <li>Ce quiz contient <strong>{quizData.questions.length} questions à choix multiples</strong></li>
              <li>Lisez attentivement chaque question avant de sélectionner votre réponse</li>
              <li>Vous pouvez naviguer entre les questions avec les boutons "Précédent" et "Suivant"</li>
              <li>Vous pouvez modifier vos réponses avant de soumettre le quiz</li>
              <li>Une fois le quiz soumis, vous verrez vos résultats détaillés et votre position au classement</li>
              <li>Les bonnes réponses seront affichées à la fin pour votre révision</li>
            </ul>
          </CardContent>
        </Card>

        {/* Admin Access Link */}
        <div className="mt-6 text-center">
          <a
            href="/admin"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
          >
            Accès Administrateur
          </a>
        </div>
      </div>
    </div>
  );
}

