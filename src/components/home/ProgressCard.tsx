import { Flame, Star, BookOpen } from 'lucide-react';

interface ProgressCardProps {
  totalPoints: number;
  currentStreak: number;
  wordsLearned: number;
}

export const ProgressCard = ({ totalPoints, currentStreak, wordsLearned }: ProgressCardProps) => {
  return (
    <div className="card-interactive p-5">
      <h3 className="text-lg font-bold text-foreground mb-4">Progresmu Hari Ini</h3>
      
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center p-3 rounded-xl bg-primary/10">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mb-2">
            <Star className="w-5 h-5 text-primary" />
          </div>
          <span className="text-xl font-bold text-primary">{totalPoints}</span>
          <span className="text-xs text-muted-foreground font-medium">Poin</span>
        </div>
        
        <div className="flex flex-col items-center p-3 rounded-xl bg-secondary/10">
          <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center mb-2">
            <Flame className="w-5 h-5 text-secondary" />
          </div>
          <span className="text-xl font-bold text-secondary">{currentStreak}</span>
          <span className="text-xs text-muted-foreground font-medium">Hari</span>
        </div>
        
        <div className="flex flex-col items-center p-3 rounded-xl bg-accent/10">
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center mb-2">
            <BookOpen className="w-5 h-5 text-accent" />
          </div>
          <span className="text-xl font-bold text-accent">{wordsLearned}</span>
          <span className="text-xs text-muted-foreground font-medium">Kata</span>
        </div>
      </div>
    </div>
  );
};
