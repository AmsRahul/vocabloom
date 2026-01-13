import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { VocabularyWord } from '@/data/vocabulary';
import { Volume2, Mic, MicOff, X, ArrowRight, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PronunciationQuizProps {
  words: VocabularyWord[];
  onComplete: (score: number, total: number) => void;
  onExit: () => void;
}

type RecordingState = 'idle' | 'recording' | 'processing' | 'result';

export const PronunciationQuiz = ({ words, onComplete, onExit }: PronunciationQuizProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [transcript, setTranscript] = useState('');
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  
  const recognitionRef = useRef<any>(null);

  const currentWord = words[currentIndex];
  const progress = ((currentIndex + 1) / words.length) * 100;

  useEffect(() => {
    // Initialize speech recognition
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognitionAPI) {
      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const result = event.results[0][0].transcript.toLowerCase();
        setTranscript(result);
        evaluatePronunciation(result);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setRecordingState('idle');
        setFeedback('Tidak dapat mendengar. Coba lagi!');
      };

      recognitionRef.current.onend = () => {
        if (recordingState === 'recording') {
          setRecordingState('processing');
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const playAudio = () => {
    const utterance = new SpeechSynthesisUtterance(currentWord.english);
    utterance.lang = 'en-US';
    utterance.rate = 0.7;
    speechSynthesis.speak(utterance);
  };

  const startRecording = () => {
    if (!recognitionRef.current) {
      setFeedback('Browser tidak mendukung pengenalan suara');
      return;
    }

    setTranscript('');
    setAccuracy(null);
    setFeedback('');
    setRecordingState('recording');
    
    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting recognition:', error);
      setRecordingState('idle');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const evaluatePronunciation = (spokenText: string) => {
    const target = currentWord.english.toLowerCase();
    const spoken = spokenText.trim().toLowerCase();

    // Simple similarity calculation
    let matchScore = 0;
    
    if (spoken === target) {
      matchScore = 100;
    } else if (target.includes(spoken) || spoken.includes(target)) {
      matchScore = 80;
    } else {
      // Calculate character similarity
      const targetChars = target.split('');
      const spokenChars = spoken.split('');
      let matches = 0;
      
      targetChars.forEach((char, i) => {
        if (spokenChars[i] === char) matches++;
      });
      
      matchScore = Math.round((matches / Math.max(targetChars.length, spokenChars.length)) * 100);
    }

    setAccuracy(matchScore);
    setRecordingState('result');

    if (matchScore >= 70) {
      setScore(prev => prev + 1);
      setFeedback(matchScore >= 90 ? 'Sempurna! 🎉' : 'Bagus! Hampir sempurna! 👍');
    } else if (matchScore >= 40) {
      setFeedback('Cukup baik! Coba dengarkan lagi dan ulangi 🔄');
    } else {
      setFeedback('Ayo coba lagi! Perhatikan pengucapannya 💪');
    }
  };

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setRecordingState('idle');
      setTranscript('');
      setAccuracy(null);
      setFeedback('');
    } else {
      onComplete(score, words.length);
    }
  };

  const handleRetry = () => {
    setRecordingState('idle');
    setTranscript('');
    setAccuracy(null);
    setFeedback('');
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

      {/* Main content */}
      <div className="flex-1 flex flex-col p-5">
        <div className="text-center mb-4">
          <span className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-semibold">
            Dengarkan & Ucapkan
          </span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Word card */}
          <div className="card-interactive p-6 mb-6 w-full max-w-sm animate-fade-in">
            <div className="text-center mb-4">
              <h2 className="text-3xl font-bold text-foreground mb-2">
                {currentWord.english}
              </h2>
              <p className="text-sm text-muted-foreground mb-2">
                {currentWord.pronunciation}
              </p>
              <p className="text-base text-primary font-semibold">
                {currentWord.indonesian}
              </p>
            </div>

            {/* Listen button */}
            <Button
              variant="outline"
              size="lg"
              onClick={playAudio}
              className="w-full gap-2 mb-4"
            >
              <Volume2 className="w-5 h-5" />
              Dengarkan
            </Button>
          </div>

          {/* Recording area */}
          <div className="w-full max-w-sm">
            {recordingState === 'idle' && (
              <Button
                variant="secondary"
                size={"full" as any}
                onClick={startRecording}
                className="gap-2"
              >
                <Mic className="w-5 h-5" />
                Tekan untuk Merekam
              </Button>
            )}

            {recordingState === 'recording' && (
              <div className="text-center">
                <button
                  onClick={stopRecording}
                  className="w-20 h-20 rounded-full bg-destructive flex items-center justify-center mx-auto mb-3 animate-pulse-soft"
                >
                  <MicOff className="w-8 h-8 text-destructive-foreground" />
                </button>
                <p className="text-sm text-muted-foreground">
                  Sedang merekam... Tekan untuk berhenti
                </p>
              </div>
            )}

            {recordingState === 'processing' && (
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 animate-pulse">
                  <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="text-sm text-muted-foreground">Memproses...</p>
              </div>
            )}

            {recordingState === 'result' && (
              <div className="animate-slide-up">
                {/* Accuracy display */}
                <div className={cn(
                  "text-center p-4 rounded-2xl mb-4",
                  accuracy !== null && accuracy >= 70 ? "bg-success/10" : "bg-warning/10"
                )}>
                  <div className={cn(
                    "text-4xl font-bold mb-1",
                    accuracy !== null && accuracy >= 70 ? "text-success" : "text-warning"
                  )}>
                    {accuracy}%
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    {feedback}
                  </p>
                  {transcript && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Kamu mengucapkan: "{transcript}"
                    </p>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size={"full" as any}
                    onClick={handleRetry}
                    className="gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Ulangi
                  </Button>
                  <Button
                    variant="default"
                    size={"full" as any}
                    onClick={handleNext}
                    className="gap-2"
                  >
                    {currentIndex < words.length - 1 ? 'Lanjut' : 'Selesai'}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
