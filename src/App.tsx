import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import OnboardingPage from "./pages/OnboardingPages";
import VocabularyList from "./pages/TestFirebase";
import AddVocabularyForm from "./components/AddVocabularyForm";
import ImportVocab from "./pages/ImportVocab";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import Dashboard from "./pages/IndexPage";
import ChapterDetail from "./pages/ChapterDetail";
import MatchingGame from "./pages/MatchingGame2";
import MatchingGame2 from "./pages/MatchingGame3";
import NewWordSession from "./pages/FlashCard";
import SayIt from "./pages/SayIt";
import ScrambledWordGame from "./pages/ScrambledGame";
import QuizPage from "./pages/QuizGame";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* PUBLIC */}
            <Route path="/" element={<OnboardingPage />} />
            <Route path="/index" element={<Dashboard />} />
            <Route path="/chapter/:chapterId" element={<ChapterDetail />} />
            {/* <Route path="/matching" element={<MatchingGame />} /> */}
            <Route path="/flashcard/:courseId" element={<NewWordSession />} />
            <Route path="/matching/:topicId" element={<MatchingGame2 />} />
            <Route path="/sayit/:topicId" element={<SayIt />} />
            <Route path="/quiz/:topicId" element={<QuizPage />} />
            <Route path="/scrambled/:topicId" element={<ScrambledWordGame />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* PROTECTED */}
            <Route
              path="/main"
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              }
            />

            <Route
              path="/firebase"
              element={
                <ProtectedRoute>
                  <VocabularyList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/addfirebase"
              element={
                <ProtectedRoute>
                  <AddVocabularyForm />
                </ProtectedRoute>
              }
            />

            <Route
              path="/importAnimals"
              element={
                <ProtectedRoute>
                  <ImportVocab />
                </ProtectedRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
