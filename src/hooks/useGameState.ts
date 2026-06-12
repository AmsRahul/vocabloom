import { useState, useCallback, useEffect } from 'react';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';

interface GameState {
  totalPoints: number;
  currentStreak: number;
  bestStreak: number;
  wordsLearned: number;
  quizzesCompleted: number;
  pronunciationExercises: number;
  unlockedBadges: string[];
}

const INITIAL_STATE: GameState = {
  totalPoints: 0,
  currentStreak: 1,
  bestStreak: 1,
  wordsLearned: 0,
  quizzesCompleted: 0,
  pronunciationExercises: 0,
  unlockedBadges: [],
};

export const useGameState = (uid?: string | null) => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('vocabBuilder_gameState');
    if (saved) {
      setGameState(JSON.parse(saved));
    }
    setIsLoading(false);
  }, []);

  const saveState = useCallback((newState: GameState) => {
    localStorage.setItem('vocabBuilder_gameState', JSON.stringify(newState));
    setGameState(newState);
  }, []);

  const syncToFirebase = useCallback(async (updates: Partial<GameState>) => {
    if (!uid) return;
    try {
      const updateObj: Record<string, any> = {};
      if (updates.totalPoints !== undefined) updateObj.totalXp = increment(updates.totalPoints);
      if (updates.currentStreak !== undefined) updateObj.currentStreak = updates.currentStreak;
      if (updates.longestStreak !== undefined) updateObj.longestStreak = updates.longestStreak;
      if (updates.quizzesCompleted !== undefined) updateObj['stats.totalQuizzes'] = increment(1);
      if (Object.keys(updateObj).length > 0) {
        await updateDoc(doc(db, 'users', uid), updateObj);
      }
    } catch (error) {
      console.error('Error syncing to Firebase:', error);
    }
  }, [uid]);

  const addPoints = useCallback((points: number) => {
    setGameState(prev => {
      const newState = { ...prev, totalPoints: prev.totalPoints + points };
      saveState(newState);
      syncToFirebase({ totalPoints: points });
      return newState;
    });
  }, [saveState, syncToFirebase]);

  const incrementWordsLearned = useCallback((count: number = 1) => {
    setGameState(prev => {
      const newState = { ...prev, wordsLearned: prev.wordsLearned + count };
      saveState(newState);
      return newState;
    });
  }, [saveState]);

  const completeQuiz = useCallback(() => {
    setGameState(prev => {
      const newState = { ...prev, quizzesCompleted: prev.quizzesCompleted + 1 };
      saveState(newState);
      syncToFirebase({ quizzesCompleted: 1 });
      return newState;
    });
  }, [saveState, syncToFirebase]);

  const completePronunciation = useCallback(() => {
    setGameState(prev => {
      const newState = { ...prev, pronunciationExercises: prev.pronunciationExercises + 1 };
      saveState(newState);
      return newState;
    });
  }, [saveState]);

  const unlockBadge = useCallback((badgeId: string) => {
    setGameState(prev => {
      if (prev.unlockedBadges.includes(badgeId)) return prev;
      const newState = { ...prev, unlockedBadges: [...prev.unlockedBadges, badgeId] };
      saveState(newState);
      return newState;
    });
  }, [saveState]);

  const resetProgress = useCallback(() => {
    saveState(INITIAL_STATE);
  }, [saveState]);

  const syncProgress = useCallback((firebaseData: Partial<GameState>) => {
    setGameState(prev => {
      const newState = { ...prev, ...firebaseData };
      saveState(newState);
      return newState;
    });
  }, [saveState]);

  return {
    ...gameState,
    isLoading,
    addPoints,
    incrementWordsLearned,
    completeQuiz,
    completePronunciation,
    unlockBadge,
    resetProgress,
    syncProgress,
  };
};