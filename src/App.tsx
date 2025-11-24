import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { QuizProvider } from "./contexts/QuizContext";
import { AuthProvider } from "./contexts/AuthContext";
import Welcome from "./pages/Welcome";
import AdminLogin from "./pages/AdminLogin";
// import DisciplineSelection from "./pages/DisciplineSelection";
import Quiz from "./pages/Quiz";
import Results from "./pages/Results";
import Admin from "./pages/Admin";
import CertificatePage from "./pages/CertificatePage";
import CertificatePreview from "./pages/CertificatePreview";
import { useEffect } from "react";
import { useQuiz } from "./contexts/QuizContext";

function RouterContent() {
  const { quizStarted, quizCompleted, loadQuizData } = useQuiz();

  useEffect(() => {
    // Load Munitions quiz data directly
    loadQuizData('/quiz_data_agc.json');
  }, []);

  return (
    <Switch>
      <Route path="/">
        {quizStarted && !quizCompleted ? (
          <Quiz />
        ) : (
          <Welcome />
        )}
      </Route>
      <Route path="/quiz" component={Quiz} />
      <Route path="/results" component={Results} />
      <Route path="/admin-login" component={AdminLogin} />
      <Route path="/admin" component={Admin} />
      <Route path="/certificate" component={CertificatePage} />
      <Route path="/certificate-preview" component={CertificatePreview} />
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function Router() {
  return (
    <AuthProvider>
      <QuizProvider>
        <RouterContent />
      </QuizProvider>
    </AuthProvider>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
