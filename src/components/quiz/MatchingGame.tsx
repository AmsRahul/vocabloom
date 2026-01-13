import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { VocabularyWord } from '@/data/vocabulary';
import { X, Check, Shuffle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MatchingGameProps {
  words: VocabularyWord[];
  onComplete: (score: number, total: number) => void;
  onExit: () => void;
}

interface MatchItem {
  id: string;
  text: string;
  type: 'english' | 'indonesian';
  wordId: string;
  matched: boolean;
}

export const MatchingGame = ({ words, onComplete, onExit }: MatchingGameProps) => {
  const [items, setItems] = useState<MatchItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MatchItem | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [wrongPair, setWrongPair] = useState<string[]>([]);
  const [score, setScore] = useState(0);

  const gameWords = words.slice(0, 5);
  const progress = (matchedPairs.length / 2 / gameWords.length) * 100;

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const englishItems: MatchItem[] = gameWords.map(w => ({
      id: `en-${w.id}`,
      text: w.english,
      type: 'english',
      wordId: w.id,
      matched: false,
    }));

    const indonesianItems: MatchItem[] = gameWords.map(w => ({
      id: `id-${w.id}`,
      text: w.indonesian,
      type: 'indonesian',
      wordId: w.id,
      matched: false,
    }));

    const shuffledEnglish = [...englishItems].sort(() => Math.random() - 0.5);
    const shuffledIndonesian = [...indonesianItems].sort(() => Math.random() - 0.5);

    setItems([...shuffledEnglish, ...shuffledIndonesian]);
    setSelectedItem(null);
    setMatchedPairs([]);
    setWrongPair([]);
    setScore(0);
  };

  const handleItemClick = (item: MatchItem) => {
    if (item.matched || wrongPair.length > 0) return;

    if (!selectedItem) {
      setSelectedItem(item);
      return;
    }

    if (selectedItem.id === item.id) {
      setSelectedItem(null);
      return;
    }

    if (selectedItem.type === item.type) {
      setSelectedItem(item);
      return;
    }

    // Check if match
    if (selectedItem.wordId === item.wordId) {
      // Correct match
      setMatchedPairs(prev => [...prev, selectedItem.id, item.id]);
      setItems(prev => prev.map(i => 
        i.id === selectedItem.id || i.id === item.id 
          ? { ...i, matched: true } 
          : i
      ));
      setScore(prev => prev + 1);
      setSelectedItem(null);

      // Check if game complete
      if (matchedPairs.length + 2 === gameWords.length * 2) {
        setTimeout(() => {
          onComplete(score + 1, gameWords.length);
        }, 500);
      }
    } else {
      // Wrong match
      setWrongPair([selectedItem.id, item.id]);
      setTimeout(() => {
        setWrongPair([]);
        setSelectedItem(null);
      }, 800);
    }
  };

  const englishItems = items.filter(i => i.type === 'english');
  const indonesianItems = items.filter(i => i.type === 'indonesian');

  const getItemStyle = (item: MatchItem) => {
    if (item.matched) return 'bg-success/10 border-success text-success';
    if (wrongPair.includes(item.id)) return 'bg-destructive/10 border-destructive text-destructive animate-shake';
    if (selectedItem?.id === item.id) return 'bg-primary/10 border-primary text-primary';
    return 'bg-card border-border text-foreground hover:border-primary/50';
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm p-4 border-b border-border z-10">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onExit}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <span className="text-sm font-semibold text-muted-foreground">
            {matchedPairs.length / 2} / {gameWords.length} pasang
          </span>
          <button
            onClick={initializeGame}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Shuffle className="w-5 h-5" />
          </button>
        </div>
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Instructions */}
      <div className="p-4 text-center">
        <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold">
          Cocokkan kata Inggris dengan artinya!
        </span>
      </div>

      {/* Game area */}
      <div className="flex-1 p-4">
        <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
          {/* English column */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground text-center mb-2">
              🇬🇧 Inggris
            </p>
            {englishItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                disabled={item.matched}
                className={cn(
                  "w-full p-3 rounded-xl border-2 font-semibold text-sm transition-all duration-200",
                  getItemStyle(item),
                  item.matched && "opacity-60"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="truncate">{item.text}</span>
                  {item.matched && <Check className="w-4 h-4 flex-shrink-0" />}
                </div>
              </button>
            ))}
          </div>

          {/* Indonesian column */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground text-center mb-2">
              🇮🇩 Indonesia
            </p>
            {indonesianItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                disabled={item.matched}
                className={cn(
                  "w-full p-3 rounded-xl border-2 font-semibold text-sm transition-all duration-200",
                  getItemStyle(item),
                  item.matched && "opacity-60"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="truncate">{item.text}</span>
                  {item.matched && <Check className="w-4 h-4 flex-shrink-0" />}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Score */}
      <div className="p-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10">
          <span className="text-sm font-semibold text-primary">
            Skor: {score} / {gameWords.length}
          </span>
        </div>
      </div>
    </div>
  );
};
