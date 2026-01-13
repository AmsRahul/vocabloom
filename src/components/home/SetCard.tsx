import { ChevronRight } from 'lucide-react';
import { VocabularySet } from '@/data/vocabulary';

interface SetCardProps {
  set: VocabularySet;
  progress: number;
  onSelect: () => void;
}

export const SetCard = ({ set, progress, onSelect }: SetCardProps) => {
  return (
    <button
      onClick={onSelect}
      className="card-interactive w-full p-4 text-left flex items-center gap-4"
    >
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-2xl">
        {set.icon}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-foreground truncate">{set.title}</h4>
        <p className="text-sm text-muted-foreground truncate">{set.description}</p>
        
        <div className="mt-2">
          <div className="progress-bar">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {progress}% selesai • {set.words.length} kata
          </p>
        </div>
      </div>
      
      <ChevronRight className="w-5 h-5 text-muted-foreground" />
    </button>
  );
};
