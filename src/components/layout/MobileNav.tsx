import { Home, BookOpen, Trophy, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'achievements', icon: Trophy, label: 'Leaderboard' },
  { id: 'profile', icon: User, label: 'Profile' },
];

export const MobileNav = ({ activeTab, onTabChange }: MobileNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border px-2 pb-safe">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex flex-col items-center justify-center w-16 h-full gap-1 transition-all duration-200",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div
                className={cn(
                  "p-2 rounded-xl transition-all duration-200",
                  isActive && "bg-primary/10"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive && "animate-pop")} />
              </div>
              <span className="text-xs font-semibold">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
