import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { VocabularyWord } from '@/data/vocabulary';
import { Volume2, Check, X, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TextQuizProps {
  words: VocabularyWord[];
  onComplete: (score: number, total: number) => void;
  onExit: () => void;
}

type AnswerState = 'idle' | 'correct' | 'wrong';

export const TextQuiz = ({ words, onComplete, onExit }: TextQuizProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>('idle');
  const [options, setOptions] = useState<string[]>([]);

  const currentWord = words[currentIndex];
  const progress = ((currentIndex + 1) / words.length) * 100;

  useEffect(() => {
    generateOptions();
  }, [currentIndex]);

  const generateOptions = () => {
    const correctAnswer = currentWord.indonesian;
    const otherWords = words
      .filter(w => w.id !== currentWord.id)
      .map(w => w.indonesian)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    const allOptions = [...otherWords, correctAnswer].sort(() => Math.random() - 0.5);
    setOptions(allOptions);
    setSelectedAnswer(null);
    setAnswerState('idle');
  };

  const playAudio = () => {
    const utterance = new SpeechSynthesisUtterance(currentWord.english);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
  };

  const handleAnswer = (answer: string) => {
    if (answerState !== 'idle') return;
    
    setSelectedAnswer(answer);
    const isCorrect = answer === currentWord.indonesian;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      setAnswerState('correct');
    } else {
      setAnswerState('wrong');
    }
  };

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onComplete(score + (answerState === 'correct' ? 0 : 0), words.length);
    }
  };

  const getButtonVariant = (option: string) => {
    if (answerState === 'idle') {
      return selectedAnswer === option ? 'optionSelected' : 'option';
    }
    
    if (option === currentWord.indonesian) {
      return 'optionCorrect';
    }
    
    if (selectedAnswer === option && answerState === 'wrong') {
      return 'optionWrong';
    }
    
    return 'option';
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
            {currentIndex + 1} / {words.length}
          </span>
          <div className="w-6" />
        </div>
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col p-5">
        <div className="text-center mb-2">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold">
            Apa arti kata ini?
          </span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="card-interactive p-6 mb-6 w-full max-w-sm animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <span className={cn(
                "px-2 py-1 rounded-lg text-xs font-semibold",
                currentWord.difficulty === 'mudah' && "bg-success/10 text-success",
                currentWord.difficulty === 'sedang' && "bg-warning/10 text-warning",
                currentWord.difficulty === 'sulit' && "bg-destructive/10 text-destructive",
              )}>
                {currentWord.difficulty}
              </span>
              <button
                onClick={playAudio}
                className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
              >
                <Volume2 className="w-5 h-5 text-primary" />
              </button>
            </div>
            
            <h2 className="text-3xl font-bold text-foreground text-center mb-2">
              {currentWord.english}
            </h2>
            <p className="text-sm text-muted-foreground text-center">
              {currentWord.pronunciation}
            </p>
          </div>

          {/* Answer feedback */}
          {answerState !== 'idle' && (
            <div className={cn(
              "flex items-center gap-2 mb-4 px-4 py-2 rounded-xl animate-pop",
              answerState === 'correct' ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
            )}>
              {answerState === 'correct' ? (
                <>
                  <Check className="w-5 h-5" />
                  <span className="font-semibold">Benar! Hebat!</span>
                </>
              ) : (
                <>
                  <X className="w-5 h-5" />
                  <span className="font-semibold">
                    Jawaban yang benar: {currentWord.indonesian}
                  </span>
                </>
              )}
            </div>
          )}

          {/* Options */}
          <div className="w-full max-w-sm space-y-3">
            {options.map((option, index) => (
              <Button
                key={index}
                variant={getButtonVariant(option) as any}
                size={"full" as any}
                onClick={() => handleAnswer(option)}
                disabled={answerState !== 'idle'}
                className="justify-start text-left"
              >
                <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold mr-3">
                  {String.fromCharCode(65 + index)}
                </span>
                {option}
              </Button>
            ))}
          </div>
        </div>

        {/* Next button */}
        {answerState !== 'idle' && (
          <div className="mt-4 animate-slide-up">
            <Button 
              variant="default" 
              size={"full" as any}
              onClick={handleNext}
              className="gap-2"
            >
              {currentIndex < words.length - 1 ? 'Lanjut' : 'Selesai'}
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
