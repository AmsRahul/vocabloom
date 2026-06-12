import { useState, useEffect } from 'react';
import { MobileNav } from '@/components/layout/MobileNav';
import { HomeScreen } from '@/components/screens/HomeScreen';
import { LessonScreen } from '@/components/screens/LessonScreen';
import { AchievementsScreen } from '@/components/screens/AchievementsScreen';
import { ProfileScreen } from '@/components/screens/ProfileScreen';
import { useGameState } from '@/hooks/useGameState';
import { useAuth } from '@/context/AuthContext';
import { VocabularySet } from '@/data/vocabulary';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

const Index = () => {
  const { user, userProgress } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [selectedSet, setSelectedSet] = useState<VocabularySet | null>(null);
  
  const {
    totalPoints,
    currentStreak,
    wordsLearned,
    quizzesCompleted,
    pronunciationExercises,
    unlockedBadges,
    addPoints,
    incrementWordsLearned,
    completeQuiz,
    unlockBadge,
    resetProgress,
    syncProgress,
  } = useGameState(user?.uid);

  useEffect(() => {
    if (userProgress) {
      syncProgress({
        totalPoints: userProgress.totalXp,
        currentStreak: userProgress.currentStreak,
        wordsLearned: userProgress.completedLessons?.length || 0,
        quizzesCompleted: userProgress.stats?.totalQuizzes || 0,
        unlockedBadges: userProgress.achievements || [],
      });
    }
  }, [userProgress, syncProgress]);

  const handleSelectSet = (set: VocabularySet) => {
    setSelectedSet(set);
  };

  const handleBackFromLesson = () => {
    setSelectedSet(null);
  };

  const handleLessonComplete = (points: number) => {
    addPoints(points);
    completeQuiz();
    incrementWordsLearned(5);

    if (quizzesCompleted === 0) {
      unlockBadge('first-quiz');
      toast.success('🌟 Lencana baru: Pemula!', {
        description: 'Kamu menyelesaikan kuis pertamamu!'
      });
    }

    if (points >= 50) {
      unlockBadge('perfect-score');
      toast.success('💎 Lencana baru: Sempurna!', {
        description: 'Skor sempurna!'
      });
    }
  };

  const handleResetProgress = () => {
    resetProgress();
    toast.success('Progres berhasil direset', {
      description: 'Semua data telah dihapus'
    });
  };

  if (selectedSet) {
    return (
      <LessonScreen
        set={selectedSet}
        onBack={handleBackFromLesson}
        onComplete={handleLessonComplete}
      />
    );
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
      case 'learn':
        return (
          <HomeScreen
            totalPoints={totalPoints}
            currentStreak={currentStreak}
            wordsLearned={wordsLearned}
            unlockedBadges={unlockedBadges}
            onSelectSet={handleSelectSet}
          />
        );
      case 'achievements':
        return (
          <AchievementsScreen
            totalPoints={totalPoints}
            wordsLearned={wordsLearned}
            quizzesCompleted={quizzesCompleted}
            currentStreak={currentStreak}
            pronunciationExercises={pronunciationExercises}
            unlockedBadges={unlockedBadges}
          />
        );
      case 'profile':
        return (
          <ProfileScreen
            totalPoints={totalPoints}
            wordsLearned={wordsLearned}
            onResetProgress={handleResetProgress}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" />
      {renderScreen()}
      <MobileNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;