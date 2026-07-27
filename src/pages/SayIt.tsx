import React, { useEffect, useRef, useState, useCallback } from "react";
import { Mic, ArrowRight, Pause, CheckCircle2, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { completeActivity, checkAndUnlockNextSubChapter, XP_REWARDS, checkActivityAccess } from "@/progress";
import { fetchSubChapterVocabs, fetchChapterTopics } from "@/dataService";
import { balloons } from "balloons-js";
import HelpModal from "@/components/HelpModal";

const rightSound = new Audio("/assets/sounds/right.mp3");
const wrongSound = new Audio("/assets/sounds/wrong.mp3");
const subchapterFinishSound = new Audio("/assets/sounds/subchapter-finish.mp3");

interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  onerror: (event: Event) => void;
}

interface SpeechRecognitionEvent extends Event {
  results: {
    [key: number]: {
      [key: number]: { transcript: string };
    };
  };
}

declare global {
  interface Window {
    SpeechRecognition: { new (): SpeechRecognitionInstance };
    webkitSpeechRecognition: { new (): SpeechRecognitionInstance };
    confetti: (options?: Record<string, unknown>) => void;
  }
}

interface Vocab {
  id: string;
  word: string;
  indonesian: string;
  phonetic?: string;
  imageUrl?: string;
}

interface TopicItemData {
  id: string;
  title: string;
  sub: string;
  order: number;
}

const SayIt: React.FC = () => {
  const { chapterId, topicId } = useParams<{ chapterId: string; topicId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [vocabs, setVocabs] = useState<Vocab[]>([]);
  const [index, setIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);
  const [allSubChapters, setAllSubChapters] = useState<string[]>([]);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const vocab = vocabs[index];

  useEffect(() => {
    if (!user || !chapterId || !topicId) return;
    checkActivityAccess(user.uid, chapterId, topicId, "sayit").then((hasAccess) => {
      if (!hasAccess) {
        navigate(`/scrambled/${chapterId}/${topicId}`);
      }
    });
  }, [user, chapterId, topicId, navigate]);

  const speakWord = useCallback((text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!chapterId || !topicId) return;
        const topics = await fetchChapterTopics(chapterId);
        setAllSubChapters(topics.map((t) => t.id));

        const vocabs = await fetchSubChapterVocabs(chapterId, topicId);
        setVocabs(vocabs as Vocab[]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [topicId]);

  useEffect(() => {
    const SpeechRecognitionConstructor =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionConstructor || !vocab) return;

    const recognition = new SpeechRecognitionConstructor();
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const spoken = e.results[0][0].transcript.toLowerCase().trim();
      setTranscript(spoken);

      if (spoken.includes(vocab.word.toLowerCase())) {
        rightSound.currentTime = 0;
        rightSound.play().catch(() => {});
        setIsCorrect(true);
        speakWord(vocab.word);
      } else {
        wrongSound.currentTime = 0;
        wrongSound.play().catch(() => {});
      }
    };

    recognition.onend = () => setIsRecording(false);
    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [vocab, speakWord]);

  const handleFinish = async () => {
    if (!user || !chapterId || !topicId) return;
    const xpEarned = await completeActivity(user.uid, chapterId, topicId, "sayit", 100);
    await checkAndUnlockNextSubChapter(user.uid, chapterId, topicId, allSubChapters);
    setEarnedXp(xpEarned);
    setShowSuccess(true);
  };

  useEffect(() => {
    if (showSuccess) {
      subchapterFinishSound.currentTime = 0;
      subchapterFinishSound.play().catch(() => {});
      window.confetti?.();
      balloons();
    }
  }, [showSuccess]);

  const startRecording = () => {
    if (isCorrect) return;
    setTranscript("");
    setIsCorrect(false);
    setIsRecording(true);
    try {
      recognitionRef.current?.start();
    } catch (e) {
      console.error("Recognition already started", e);
    }
  };

  const nextWord = () => {
    if (index < vocabs.length - 1) {
      setIndex((i) => i + 1);
      setIsCorrect(false);
      setTranscript("");
    } else {
      handleFinish();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <p className="font-bold text-gray-500 animate-pulse">
          Loading Vocabulary...
        </p>
      </div>
    );
  }

  if (!vocab) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <p className="font-bold text-gray-500">No data found.</p>
      </div>
    );
  }

  const image = vocab.imageUrl || `https://placehold.co/400x400?text=${vocab.word}`;

  return (
    <div className="w-full max-w-md bg-orange-50 rounded-[40px] shadow-2xl overflow-hidden flex flex-col border border-white">
      <div className="px-6 pt-8 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/chapter/${chapterId}`)}
            className="p-2 bg-black rounded-full text-white active:scale-90 transition-transform"
          >
            <Pause size={16} fill="currentColor" />
          </button>
          <HelpModal
            activityName="Say It!"
            steps={[
              { icon: "1", title: "Lihat Kata", description: "Perhatikan gambar dan kata Indonesia yang ditampilkan." },
              { icon: "2", title: "Tekan Mikrofon", description: "Ketik tombol mikrofon untuk mulai merekam suara kamu." },
              { icon: "3", title: "Ucapkan", description: "Ucapkan kata Inggris yang sesuai dengan arti yang ditampilkan." },
              { icon: "4", title: "Lanjut", description: "Jika pengucapan benar, tekan tombol Next Word untuk melanjutkan ke kata berikutnya." },
            ]}
          />
        </div>
        <h2 className="font-black text-[#1E293B] text-lg">Say It!</h2>
        <button onClick={() => speakWord(vocab.word)} className="p-2 bg-yellow-100 rounded-full text-yellow-600">
          <Volume2 size={20} />
        </button>
      </div>

      <div className="px-8 mb-6">
        <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">
          Word {index + 1} of {vocabs.length}
        </p>
        <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${((index + 1) / vocabs.length) * 100}%` }}
            className="bg-yellow-400 h-full rounded-full"
          />
        </div>
      </div>

      <div className="px-8 mb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-[32px] shadow-lg border-4 border-white overflow-hidden relative"
          >
            <div className="aspect-square flex items-center justify-center bg-gray-50">
              <img
                src={image}
                alt={vocab.word}
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="text-center mb-4 px-6">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
          Terjemahkan ke Bahasa Inggris:
        </span>
        <h1 className="text-4xl font-black text-[#1E293B] mt-1 capitalize">
          {vocab.indonesian}
        </h1>

        <div className="h-16 mt-4 flex items-center justify-center">
          {transcript && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`font-black text-lg ${
                isCorrect ? "text-green-500" : "text-red-400"
              }`}
            >
              {isCorrect
                ? "Perfect Pronunciation!"
                : `You said: "${transcript}"`}
            </motion.p>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-white/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mb-6"
            >
              <CheckCircle2 size={60} className="text-green-500" />
            </motion.div>

            <h2 className="text-4xl font-black text-gray-800 mb-2">
              Selamat!
            </h2>
            <p className="text-gray-500 mb-4 font-medium">
              Kamu sudah menyelesaikan semua tantangan!
            </p>
            <div className="bg-green-50 text-green-600 font-bold text-xl px-4 py-2 rounded-xl inline-block mb-8">
              +{earnedXp || XP_REWARDS.sayit} XP
            </div>

            <div className="w-full space-y-3">
              <button
                onClick={() => navigate(`/chapter/${chapterId}`)}
                className="w-full py-5 bg-yellow-400 text-gray-800 font-black rounded-[28px] shadow-xl shadow-yellow-100 flex items-center justify-center gap-3 active:scale-95 transition-all"
              >
                Kembali ke Menu
                <ArrowRight size={24} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col items-center gap-8 pb-10 mt-auto">
        <div className="relative">
          {isRecording && (
            <motion.div
              className="absolute inset-0 bg-yellow-400 rounded-full"
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 1.8, opacity: 0 }}
              transition={{
                repeat: Infinity,
                duration: 1.2,
                ease: "easeOut",
              }}
            />
          )}
          <button
            onClick={startRecording}
            disabled={isCorrect}
            className={`w-24 h-24 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 relative z-10
              ${
                isCorrect
                  ? "bg-green-500 text-white"
                  : "bg-yellow-400 text-gray-800 active:scale-90"
              }
              ${isRecording ? "scale-110" : ""}
            `}
          >
            {isCorrect ? <CheckCircle2 size={48} /> : <Mic size={40} />}
          </button>
        </div>

        <div className="h-12">
          <AnimatePresence>
            {isCorrect && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={nextWord}
                className="flex items-center gap-2 font-black text-green-600 bg-green-50 px-8 py-3 rounded-full border-2 border-green-200 shadow-sm active:scale-95 transition-transform"
              >
                {index === vocabs.length - 1 ? "Finish Session" : "Next Word"}{" "}
                <ArrowRight size={20} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SayIt;