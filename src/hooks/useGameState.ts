import { useState, useCallback } from 'react';

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

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem('vocabBuilder_gameState');
    return saved ? JSON.parse(saved) : INITIAL_STATE;
  });

  const saveState = useCallback((newState: GameState) => {
    localStorage.setItem('vocabBuilder_gameState', JSON.stringify(newState));
    setGameState(newState);
  }, []);

  const addPoints = useCallback((points: number) => {
    setGameState(prev => {
      const newState = { ...prev, totalPoints: prev.totalPoints + points };
      saveState(newState);
      return newState;
    });
  }, [saveState]);

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
      return newState;
    });
  }, [saveState]);

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

  return {
    ...gameState,
    addPoints,
    incrementWordsLearned,
    completeQuiz,
    completePronunciation,
    unlockBadge,
    resetProgress,
  };
};
