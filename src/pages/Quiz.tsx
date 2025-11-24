import { useState, useEffect } from 'react';
import { useQuiz } from '@/contexts/QuizContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Send, AlertCircle } from 'lucide-react';
import { QuestionTimer } from '@/components/QuestionTimer';
import { useLocation } from 'wouter';

export default function Quiz() {
  const {
    quizData,
    currentQuestionIndex,
    userAnswers,
    answerQuestion,
    nextQuestion,
    previousQuestion,
    submitQuiz,
    questionTimeRemaining,
    isQuestionLocked,
    goToQuestion
  } = useQuiz();
  
  const [, setLocation] = useLocation();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  const currentQuestion = quizData?.questions[currentQuestionIndex];
  const totalQuestions = quizData?.questions.length || 0;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  // Load existing answer when question changes
  useEffect(() => {
    if (currentQuestion) {
      const existingAnswer = userAnswers.find(a => a.questionId === currentQuestion.id);
      setSelectedOption(existingAnswer ? existingAnswer.selectedAnswer : null);
      setShowWarning(false);
    }
  }, [currentQuestionIndex, currentQuestion, userAnswers]);

  const handleOptionSelect = (optionIndex: number) => {
    if (isQuestionLocked) return; // Prevent selection when locked
    setSelectedOption(optionIndex);
    if (currentQuestion) {
      answerQuestion(currentQuestion.id, optionIndex);
    }
  };

  const handleNext = () => {
    if (selectedOption === null) {
      setShowWarning(true);
      return;
    }
    setShowWarning(false);
    nextQuestion();
  };

  const handlePrevious = () => {
    setShowWarning(false);
    previousQuestion();
  };

  const handleSubmit = () => {
    const unansweredCount = totalQuestions - userAnswers.length;
    
    if (unansweredCount > 0) {
      const confirmSubmit = window.confirm(
        `Vous avez ${unansweredCount} question(s) non répondue(s). Voulez-vous vraiment soumettre le quiz ?`
      );
      if (!confirmSubmit) return;
    }

    submitQuiz();
    setLocation('/results');
  };

  if (!quizData || !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  const answeredCount = userAnswers.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-4 sm:py-8 px-3 sm:px-4">
      <div className="container max-w-4xl mx-auto">
        {/* Progress Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
            <h2 className="text-base sm:text-lg font-semibold">
              Question {currentQuestionIndex + 1} sur {totalQuestions}
            </h2>
            <div className="flex items-center gap-3">
              <QuestionTimer timeRemaining={questionTimeRemaining} isLocked={isQuestionLocked} />
              <span className="text-xs sm:text-sm text-muted-foreground">
                {answeredCount} / {totalQuestions} répondues
              </span>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="border-2 shadow-xl mb-4 sm:mb-6">
          <CardHeader className="bg-muted/30">
            <CardTitle className="text-base sm:text-lg md:text-xl leading-relaxed">
              {currentQuestion.question}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedOption === index;
                const optionLabel = String.fromCharCode(97 + index); // a, b, c, d

                return (
                  <button
                    key={index}
                    onClick={() => handleOptionSelect(index)}
                    disabled={isQuestionLocked}
                    className={`w-full text-left p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 text-sm sm:text-base ${
                      isQuestionLocked
                        ? 'opacity-50 cursor-not-allowed bg-muted/30'
                        : isSelected
                        ? 'border-primary bg-primary/10 shadow-md scale-[1.02]'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold transition-colors ${
                          isSelected
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-muted-foreground/30 text-muted-foreground'
                        }`}
                      >
                        {optionLabel}
                      </div>
                      <span className={`flex-1 pt-1 ${isSelected ? 'font-medium' : ''}`}>
                        {option}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {showWarning && (
              <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 text-destructive">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">Veuillez sélectionner une réponse avant de continuer</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center gap-2 sm:gap-4">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            variant="outline"
            size="default"
            className="min-w-24 sm:min-w-32 text-sm sm:text-base"
          >
            <ChevronLeft className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">
Précédent</span>
          </Button>

          <div className="flex gap-2">
            {Array.from({ length: totalQuestions }, (_, i) => {
              const isAnswered = userAnswers.some(a => a.questionId === quizData.questions[i].id);
              const isCurrent = i === currentQuestionIndex;

              return (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all ${
                    isCurrent
                      ? 'bg-primary w-6'
                      : isAnswered
                      ? 'bg-primary/60'
                      : 'bg-muted-foreground/20'
                  }`}
                />
              );
            })}
          </div>

          {isLastQuestion ? (
            <Button
              onClick={handleSubmit}
              size="default"
              className="min-w-24 sm:min-w-32 bg-accent hover:bg-accent/90 text-sm sm:text-base"
            >
              Soumettre
              <Send className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              size="default"
              className="min-w-24 sm:min-w-32 text-sm sm:text-base"
            >
              Suivant
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Quick Navigation */}
        <Card className="mt-6 border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Navigation rapide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-8 sm:grid-cols-12 md:grid-cols-15 lg:grid-cols-19 gap-1.5 sm:gap-2">
              {quizData.questions.map((q, index) => {
                const isAnswered = userAnswers.some(a => a.questionId === q.id);
                const isCurrent = index === currentQuestionIndex;

                return (
                  <button
                    key={q.id}
                    onClick={() => goToQuestion(index)}
                    className={`aspect-square rounded-md text-xs sm:text-sm font-medium transition-all ${
                      isCurrent
                        ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2'
                        : isAnswered
                        ? 'bg-primary/20 text-primary hover:bg-primary/30'
                        : 'bg-muted text-muted-foreground hover:bg-muted/70'
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

