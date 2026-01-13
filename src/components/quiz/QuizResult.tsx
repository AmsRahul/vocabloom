import { Button } from '@/components/ui/button';
import { Trophy, Star, ArrowRight, RotateCcw, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuizResultProps {
  score: number;
  total: number;
  pointsEarned: number;
  onRetry: () => void;
  onExit: () => void;
}

export const QuizResult = ({ score, total, pointsEarned, onRetry, onExit }: QuizResultProps) => {
  const percentage = Math.round((score / total) * 100);
  const isPerfect = percentage === 100;
  const isGood = percentage >= 70;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-5">
      <div className="w-full max-w-sm animate-fade-in">
        {/* Trophy */}
        <div className="text-center mb-6">
          <div className={cn(
            "w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center animate-pop",
            isPerfect ? "bg-warning/20" : isGood ? "bg-success/20" : "bg-primary/20"
          )}>
            <Trophy className={cn(
              "w-12 h-12",
              isPerfect ? "text-warning" : isGood ? "text-success" : "text-primary"
            )} />
          </div>
          
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {isPerfect ? 'Sempurna! 🎉' : isGood ? 'Bagus Sekali! 👏' : 'Terus Berlatih! 💪'}
          </h2>
          <p className="text-muted-foreground">
            {isPerfect 
              ? 'Kamu menjawab semua dengan benar!' 
              : isGood 
                ? 'Hasil yang luar biasa!' 
                : 'Jangan menyerah, kamu bisa!'}
          </p>
        </div>

        {/* Score card */}
        <div className="card-interactive p-6 mb-6">
          <div className="text-center mb-6">
            <div className="text-5xl font-bold gradient-text mb-1">
              {score}/{total}
            </div>
            <p className="text-sm text-muted-foreground">Jawaban Benar</p>
          </div>

          {/* Progress ring alternative - simple bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Akurasi</span>
              <span className="font-bold text-foreground">{percentage}%</span>
            </div>
            <div className="progress-bar h-4">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-1000",
                  isPerfect ? "bg-warning" : isGood ? "bg-success" : "bg-primary"
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {/* Points earned */}
          <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-primary/10">
            <Star className="w-5 h-5 text-primary" />
            <span className="font-bold text-primary">+{pointsEarned} Poin</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <Button
            variant="default"
            size={"full" as any}
            onClick={onRetry}
            className="gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Main Lagi
          </Button>
          
          <Button
            variant="outline"
            size={"full" as any}
            onClick={onExit}
            className="gap-2"
          >
            <Home className="w-5 h-5" />
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    </div>
  );
};
