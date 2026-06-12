import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { User, Settings, HelpCircle, Star, RotateCcw } from 'lucide-react';

interface ProfileScreenProps {
  totalPoints: number;
  wordsLearned: number;
  onResetProgress: () => void;
}

export const ProfileScreen = ({ 
  totalPoints, 
  wordsLearned, 
  onResetProgress 
}: ProfileScreenProps) => {
  const { user, userProgress } = useAuth();
  const displayName = user?.displayName || userProgress?.name || 'Pelajar Hebat';
  const joinDate = userProgress?.createdAt 
    ? new Date(userProgress.createdAt).toLocaleDateString('id-ID', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      }) 
    : 'hari ini';

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="p-4 text-center">
          <h1 className="text-xl font-bold text-foreground">Profil</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        <div className="card-interactive p-6 text-center animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-glow mx-auto mb-4 flex items-center justify-center">
            <User className="w-10 h-10 text-primary-foreground" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-1">{displayName}</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Bergabung sejak {joinDate}
          </p>
          
          <div className="flex justify-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{totalPoints}</div>
              <p className="text-xs text-muted-foreground">Poin</p>
            </div>
            <div className="h-10 w-px bg-border" />
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">{wordsLearned}</div>
              <p className="text-xs text-muted-foreground">Kata</p>
            </div>
            <div className="h-10 w-px bg-border" />
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">{userProgress?.currentStreak || 0}</div>
              <p className="text-xs text-muted-foreground">Streak</p>
            </div>
          </div>
        </div>

        <div className="card-interactive p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-warning" />
              <span className="font-bold text-foreground">Level {Math.floor(totalPoints / 500) + 1}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {totalPoints % 500}/500 XP
            </span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-bar-fill"
              style={{ width: `${(totalPoints % 500) / 5}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {500 - (totalPoints % 500) > 0 ? `${500 - (totalPoints % 500)} XP lagi untuk level selanjutnya` : 'Siap naik level!'}
          </p>
        </div>

        <div className="space-y-2">
          <button className="card-interactive w-full p-4 flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <Settings className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">Pengaturan</p>
              <p className="text-sm text-muted-foreground">Notifikasi, tema, bahasa</p>
            </div>
          </button>

          <button className="card-interactive w-full p-4 flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">Bantuan</p>
              <p className="text-sm text-muted-foreground">FAQ dan panduan</p>
            </div>
          </button>
        </div>

        <div className="pt-4">
          <Button
            variant="outline"
            onClick={onResetProgress}
            className="text-destructive border-destructive/30 hover:bg-destructive/10 w-full"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Progres
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Ini akan menghapus semua progres belajarmu
          </p>
        </div>
      </div>
    </div>
  );
};