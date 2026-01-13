import { badges } from '@/data/vocabulary';
import { cn } from '@/lib/utils';
import { Trophy, Star, Flame, BookOpen, Mic } from 'lucide-react';

interface AchievementsScreenProps {
  totalPoints: number;
  wordsLearned: number;
  quizzesCompleted: number;
  currentStreak: number;
  pronunciationExercises: number;
  unlockedBadges: string[];
}

export const AchievementsScreen = ({
  totalPoints,
  wordsLearned,
  quizzesCompleted,
  currentStreak,
  pronunciationExercises,
  unlockedBadges,
}: AchievementsScreenProps) => {
  const stats = [
    { icon: Star, label: 'Total Poin', value: totalPoints, color: 'text-primary' },
    { icon: BookOpen, label: 'Kata Dipelajari', value: wordsLearned, color: 'text-accent' },
    { icon: Trophy, label: 'Kuis Selesai', value: quizzesCompleted, color: 'text-warning' },
    { icon: Flame, label: 'Hari Berturut', value: currentStreak, color: 'text-secondary' },
    { icon: Mic, label: 'Latihan Ucap', value: pronunciationExercises, color: 'text-success' },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="p-4 text-center">
          <h1 className="text-xl font-bold text-foreground">Prestasi</h1>
          <p className="text-sm text-muted-foreground">Lihat pencapaianmu!</p>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={cn(
                  "card-interactive p-4 text-center animate-slide-up",
                  index === 0 && "col-span-2"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Icon className={cn("w-8 h-8 mx-auto mb-2", stat.color)} />
                <div className={cn("text-2xl font-bold", stat.color)}>
                  {stat.value}
                </div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Badges section */}
        <div>
          <h3 className="text-lg font-bold text-foreground mb-4">
            Lencana ({unlockedBadges.length}/{badges.length})
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            {badges.map((badge, index) => {
              const isUnlocked = unlockedBadges.includes(badge.id);
              
              return (
                <div
                  key={badge.id}
                  className={cn(
                    "card-interactive p-4 text-center animate-slide-up",
                    !isUnlocked && "opacity-50"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={cn(
                    "text-4xl mb-2",
                    isUnlocked && "animate-bounce-soft"
                  )}>
                    {isUnlocked ? badge.icon : '🔒'}
                  </div>
                  <h4 className="font-bold text-foreground text-sm">{badge.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {badge.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
