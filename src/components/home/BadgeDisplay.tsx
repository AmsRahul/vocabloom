import { badges } from '@/data/vocabulary';
import { cn } from '@/lib/utils';

interface BadgeDisplayProps {
  unlockedBadges: string[];
}

export const BadgeDisplay = ({ unlockedBadges }: BadgeDisplayProps) => {
  return (
    <div className="card-interactive p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground">Lencana</h3>
        <span className="text-sm text-muted-foreground">
          {unlockedBadges.length}/{badges.length}
        </span>
      </div>
      
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
        {badges.map((badge) => {
          const isUnlocked = unlockedBadges.includes(badge.id);
          
          return (
            <div
              key={badge.id}
              className={cn(
                "flex-shrink-0 flex flex-col items-center p-3 rounded-2xl w-20 transition-all duration-200",
                isUnlocked 
                  ? "bg-gradient-to-br from-warning/20 to-warning/10" 
                  : "bg-muted/50 opacity-50"
              )}
            >
              <div
                className={cn(
                  "text-3xl mb-1",
                  isUnlocked && "animate-bounce-soft"
                )}
              >
                {isUnlocked ? badge.icon : '🔒'}
              </div>
              <span className="text-xs font-semibold text-center text-foreground">
                {badge.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
