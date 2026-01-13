import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { VocabularySet } from '@/data/vocabulary';
import { TextQuiz } from '@/components/quiz/TextQuiz';
import { MatchingGame } from '@/components/quiz/MatchingGame';
import { PronunciationQuiz } from '@/components/quiz/PronunciationQuiz';
import { QuizResult } from '@/components/quiz/QuizResult';
import { ArrowLeft, BookText, Puzzle, Mic } from 'lucide-react';

interface LessonScreenProps {
  set: VocabularySet;
  onBack: () => void;
  onComplete: (points: number) => void;
}

type LessonType = 'menu' | 'text-quiz' | 'matching' | 'pronunciation' | 'result';

export const LessonScreen = ({ set, onBack, onComplete }: LessonScreenProps) => {
  const [currentLesson, setCurrentLesson] = useState<LessonType>('menu');
  const [lastScore, setLastScore] = useState(0);
  const [lastTotal, setLastTotal] = useState(0);
  const [pointsEarned, setPointsEarned] = useState(0);

  const handleQuizComplete = (score: number, total: number) => {
    const points = score * 10;
    setLastScore(score);
    setLastTotal(total);
    setPointsEarned(points);
    setCurrentLesson('result');
    onComplete(points);
  };

  const handleRetry = () => {
    setCurrentLesson('menu');
  };

  const handleExit = () => {
    setCurrentLesson('menu');
  };

  if (currentLesson === 'text-quiz') {
    return (
      <TextQuiz
        words={set.words}
        onComplete={handleQuizComplete}
        onExit={handleExit}
      />
    );
  }

  if (currentLesson === 'matching') {
    return (
      <MatchingGame
        words={set.words}
        onComplete={handleQuizComplete}
        onExit={handleExit}
      />
    );
  }

  if (currentLesson === 'pronunciation') {
    return (
      <PronunciationQuiz
        words={set.words}
        onComplete={handleQuizComplete}
        onExit={handleExit}
      />
    );
  }

  if (currentLesson === 'result') {
    return (
      <QuizResult
        score={lastScore}
        total={lastTotal}
        pointsEarned={pointsEarned}
        onRetry={handleRetry}
        onExit={() => setCurrentLesson('menu')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-foreground">{set.title}</h1>
              <p className="text-sm text-muted-foreground">{set.words.length} kata</p>
            </div>
            <div className="text-3xl">{set.icon}</div>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Set description */}
        <div className="card-interactive p-4 mb-6">
          <p className="text-muted-foreground text-center">
            {set.description}
          </p>
        </div>

        {/* Lesson options */}
        <h3 className="text-lg font-bold text-foreground mb-4 text-center">
          Pilih Jenis Latihan
        </h3>

        <div className="space-y-3">
          {/* Text Quiz */}
          <button
            onClick={() => setCurrentLesson('text-quiz')}
            className="card-interactive w-full p-5 text-left flex items-center gap-4 animate-slide-up"
          >
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <BookText className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-foreground">Kuis Teks</h4>
              <p className="text-sm text-muted-foreground">
                Pilihan ganda: Temukan arti kata dalam Bahasa Indonesia
              </p>
            </div>
          </button>

          {/* Matching Game */}
          <button
            onClick={() => setCurrentLesson('matching')}
            className="card-interactive w-full p-5 text-left flex items-center gap-4 animate-slide-up"
            style={{ animationDelay: '100ms' }}
          >
            <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center">
              <Puzzle className="w-7 h-7 text-secondary" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-foreground">Mencocokkan Pasangan</h4>
              <p className="text-sm text-muted-foreground">
                Cocokkan kata Inggris dengan artinya
              </p>
            </div>
          </button>

          {/* Pronunciation */}
          <button
            onClick={() => setCurrentLesson('pronunciation')}
            className="card-interactive w-full p-5 text-left flex items-center gap-4 animate-slide-up"
            style={{ animationDelay: '200ms' }}
          >
            <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
              <Mic className="w-7 h-7 text-accent" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-foreground">Latihan Pengucapan</h4>
              <p className="text-sm text-muted-foreground">
                Dengar, ulangi, dan perbaiki pengucapanmu
              </p>
            </div>
          </button>
        </div>

        {/* Word preview */}
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">
            Kata-kata yang akan dipelajari:
          </h3>
          <div className="flex flex-wrap gap-2">
            {set.words.map((word) => (
              <span
                key={word.id}
                className="px-3 py-1.5 rounded-full bg-muted text-sm font-medium text-foreground"
              >
                {word.english}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
