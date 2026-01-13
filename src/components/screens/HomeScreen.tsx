import { ProgressCard } from '@/components/home/ProgressCard';
import { SetCard } from '@/components/home/SetCard';
import { BadgeDisplay } from '@/components/home/BadgeDisplay';
import { vocabularySets, VocabularySet } from '@/data/vocabulary';

interface HomeScreenProps {
  totalPoints: number;
  currentStreak: number;
  wordsLearned: number;
  unlockedBadges: string[];
  onSelectSet: (set: VocabularySet) => void;
}

export const HomeScreen = ({
  totalPoints,
  currentStreak,
  wordsLearned,
  unlockedBadges,
  onSelectSet,
}: HomeScreenProps) => {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-xl">
              📖
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">VocaBloom</h1>
              <p className="text-sm text-muted-foreground">Selamat belajar! 👋</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Progress card */}
        <ProgressCard 
          totalPoints={totalPoints}
          currentStreak={currentStreak}
          wordsLearned={wordsLearned}
        />

        {/* Badges */}
        <BadgeDisplay unlockedBadges={unlockedBadges} />

        {/* Vocabulary sets */}
        <div>
          <h3 className="text-lg font-bold text-foreground mb-3">Pilih Set Kosakata</h3>
          <div className="space-y-3">
            {vocabularySets.map((set, index) => (
              <div 
                key={set.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <SetCard
                  set={set}
                  progress={Math.floor(Math.random() * 50)} // Simulated progress
                  onSelect={() => onSelectSet(set)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
