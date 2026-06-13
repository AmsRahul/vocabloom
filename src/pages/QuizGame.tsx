import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pause,
  Volume2,
  CheckCircle2,
  XCircle,
  Star,
  Heart,
} from "lucide-react";
import { db } from "@/firebase";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  documentId,
  query,
  where,
  limit,
} from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { completeActivity, unlockNextActivity, XP_REWARDS, checkActivityAccess } from "@/progress";

interface Vocab {
  word: string;
  indonesian: string;
  imageUrl?: string;
}

interface QuizQuestion {
  question: string;
  correctAnswer: string;
  options: string[];
  image?: string;
}

const rightSound = new Audio("/assets/sounds/right.mp3");
const wrongSound = new Audio("/assets/sounds/wrong.mp3");
const gameDoneSound = new Audio("/assets/sounds/game-done.mp3");

declare global {
  interface Window {
    confetti: (options?: Record<string, unknown>) => void;
  }
}

const shuffle = <T,>(array: T[]): T[] => [...array].sort(() => Math.random() - 0.5);

const FALLBACK_WRONG = ["Tidak", "Iya", "Mungkin", "Sama", "Baru", "Lama", "Besar", "Kecil"];

const generateQuiz = (vocabs: Vocab[]): QuizQuestion[] =>
  vocabs.map((vocab) => {
    const wrongPool = Array.from(
      new Set(
        vocabs
          .filter((v) => v.indonesian !== vocab.indonesian)
          .map((v) => v.indonesian)
      )
    );

    while (wrongPool.length < 3) {
      const pad = FALLBACK_WRONG.filter((w) => !wrongPool.includes(w) && w !== vocab.indonesian);
      wrongPool.push(...pad);
    }

    const wrongOptions = shuffle(wrongPool).slice(0, 3);

    return {
      question: vocab.word,
      correctAnswer: vocab.indonesian,
      options: shuffle([vocab.indonesian, ...wrongOptions]),
      image: vocab.imageUrl,
    };
  });

const QuizPage: React.FC = () => {
  const { chapterId, topicId } = useParams<{ chapterId: string; topicId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);

  const currentQuestion = quiz[currentIndex];

  useEffect(() => {
    if (!user || !chapterId || !topicId) return;
    checkActivityAccess(user.uid, chapterId, topicId, "quiz").then((hasAccess) => {
      if (!hasAccess) {
        navigate(`/matching/${chapterId}/${topicId}`);
      }
    });
  }, [user, chapterId, topicId, navigate]);

  useEffect(() => {
    const fetchVocabs = async () => {
      if (!chapterId || !topicId) return;
      try {
        const subDoc = await getDoc(doc(db, `chapters/${chapterId}/sub_chapters/${topicId}`));
        const ids = subDoc.data()?.vocab_ids || [];

        const vocabQuery = query(
          collection(db, "vocabularies"),
          where(documentId(), "in", ids)
        );
        const snapshot = await getDocs(vocabQuery);
        const vocabsData = snapshot.docs.map((d) => d.data() as Vocab);

        setQuiz(generateQuiz(vocabsData));
      } catch (error) {
        console.error("Error fetching quiz:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVocabs();
  }, [topicId]);

  const speakWord = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (!loading && currentQuestion && !gameOver) {
      const timer = setTimeout(() => speakWord(currentQuestion.question), 600);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, loading, gameOver]);

  const handleFinish = async () => {
    if (!user || !chapterId || !topicId) return;
    const xpEarned = await completeActivity(user.uid, chapterId, topicId, "quiz", score);
    await unlockNextActivity(user.uid, chapterId, topicId, "quiz");
    setEarnedXp(xpEarned);
    setIsFinished(true);
  };

  useEffect(() => {
    if (isFinished) {
      gameDoneSound.currentTime = 0;
      gameDoneSound.play().catch(() => {});
      window.confetti?.();
    }
  }, [isFinished]);

  const handleCheck = () => {
    if (!currentQuestion || status !== "idle" || !selectedOption || gameOver) return;

    if (selectedOption === currentQuestion.correctAnswer) {
      rightSound.currentTime = 0;
      rightSound.play().catch(() => {});
      setStatus("correct");
      setScore((prev) => prev + 10);

      setTimeout(async () => {
        if (currentIndex < quiz.length - 1) {
          setCurrentIndex((prev) => prev + 1);
          setSelectedOption(null);
          setStatus("idle");
        } else {
          await handleFinish();
        }
      }, 1500);
    } else {
      wrongSound.currentTime = 0;
      wrongSound.play().catch(() => {});
      setStatus("wrong");
      const newLives = lives - 1;
      setLives(newLives);

      setTimeout(() => {
        if (newLives <= 0) {
          setGameOver(true);
          setTimeout(() => navigate(`/chapter/${chapterId}`), 3000);
        } else {
          setStatus("idle");
          if (currentIndex < quiz.length - 1) {
            setCurrentIndex((prev) => prev + 1);
            setSelectedOption(null);
          } else {
            navigate(`/chapter/${chapterId}`);
          }
        }
      }, 1000);
    }
  };

  const resetGame = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setStatus("idle");
    setScore(0);
    setLives(3);
    setGameOver(false);
  };

  if (loading || !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="font-bold text-gray-500"
        >
          Loading quiz...
        </motion.p>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] p-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center w-full max-w-sm"
        >
          <div className="bg-white p-10 rounded-[40px] shadow-2xl border-b-8 border-orange-400 mb-8">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star size={40} className="text-orange-500" fill="currentColor" />
            </div>
            <h2 className="text-3xl font-black text-gray-800">Quiz Selesai!</h2>
            <p className="text-gray-500 font-medium mt-2">
              Skor kamu:{" "}
              <span className="text-orange-500 font-bold">{score}</span>
            </p>
            <div className="mt-4 bg-green-50 text-green-600 font-bold text-xl px-4 py-2 rounded-xl inline-block">
              +{earnedXp || XP_REWARDS.quiz} XP
            </div>
            <div className="mt-6 py-3 px-4 bg-orange-50 rounded-2xl border border-orange-100">
              <p className="text-sm text-orange-700 font-bold">
                Unlock: Scramble Word!
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => navigate(`/scrambled/${chapterId}/${topicId}`)}
              className="w-full py-5 bg-orange-500 text-white font-black rounded-3xl shadow-lg shadow-orange-200 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              Main Scramble Word
              <CheckCircle2 size={22} />
            </button>

            <button
              onClick={() => navigate(`/chapter/${chapterId}`)}
              className="w-full py-4 text-gray-400 font-bold text-sm"
            >
              Kembali ke menu
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div>
      {gameOver ? (
        <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl flex flex-col items-center justify-center p-8 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mb-6">
            <XCircle size={80} className="text-red-500 mx-auto" />
          </motion.div>
          <h2 className="text-3xl font-black text-red-600 mb-4">Game Over!</h2>
          <p className="text-gray-600 mb-2">Nyawa kamu sudah habis.</p>
          <p className="text-gray-600 mb-6">
            Skor akhir:{" "}
            <span className="font-bold text-yellow-600">{score}</span>
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => navigate(`/chapter/${chapterId}`)}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-full font-bold hover:bg-gray-300 transition-colors"
            >
              Kembali
            </button>
            <button
              onClick={resetGame}
              className="px-6 py-3 bg-yellow-400 text-gray-800 rounded-full font-bold hover:bg-yellow-500 transition-colors"
            >
              Main Lagi
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md bg-[#FAF9F6] rounded-[40px] shadow-2xl flex flex-col overflow-hidden border border-white">
          <div className="px-6 pt-8 pb-4 flex justify-between items-center">
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-black rounded-full text-white active:scale-90 transition-transform"
            >
              <Pause size={16} fill="currentColor" />
            </button>
            <h2 className="font-black text-[#1E293B] text-lg">Vocabulary Quiz</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
                {[...Array(3)].map((_, index) => (
                  <Heart
                    key={index}
                    size={16}
                    className={index < lives ? "text-red-500 fill-current" : "text-gray-300"}
                  />
                ))}
              </div>
              <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
                <Star size={16} className="text-yellow-400" fill="currentColor" />
                <span className="font-bold text-sm text-gray-700">{score}</span>
              </div>
            </div>
          </div>

          <div className="px-8 mb-6">
            <p className="text-[10px] text-gray-400 font-bold uppercase mb-2 tracking-widest">
              Question {currentIndex + 1} of {quiz.length}
            </p>
            <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${((currentIndex + 1) / quiz.length) * 100}%` }}
                className="bg-yellow-400 h-full rounded-full"
              />
            </div>
          </div>

          <div className="px-8 mb-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative"
              >
                <div className="aspect-square rounded-[32px] overflow-hidden border-4 border-white shadow-xl bg-white">
                  <img
                    src={
                      currentQuestion.image ||
                      `https://placehold.co/400x400?text=${currentQuestion.question}`
                    }
                    alt="Quiz"
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="text-center mb-6 px-4">
            <span className="text-[10px] uppercase font-black text-gray-400 tracking-[0.2em]">
              Apa arti dari kata:
            </span>
            <div className="flex items-center justify-center gap-3 mt-1">
              <h1 className="text-4xl font-black text-[#1E293B] capitalize">
                {currentQuestion.question}
              </h1>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => speakWord(currentQuestion.question)}
                className="p-2 bg-yellow-100 text-yellow-600 rounded-full hover:bg-yellow-200 transition-colors"
              >
                <Volume2 size={24} />
              </motion.button>
            </div>
          </div>

          <div className="px-8 grid grid-cols-2 gap-4 mb-8">
            {currentQuestion.options.map((option, oi) => {
              const isSelected = selectedOption === option;
              const isCorrect = status === "correct" && option === currentQuestion.correctAnswer;
              const isWrong = status === "wrong" && isSelected;

              return (
                <motion.button
                  key={oi}
                  disabled={status !== "idle"}
                  onClick={() => setSelectedOption(option)}
                  animate={isWrong ? { x: [-5, 5, -5, 5, 0] } : {}}
                  className={`py-5 rounded-2xl font-bold text-md border-b-4 transition-all
                    ${isSelected ? "translate-y-[-2px]" : "active:translate-y-[2px]"}
                    ${isCorrect ? "bg-green-500 border-green-700 text-white" : ""}
                    ${isWrong ? "bg-red-500 border-red-700 text-white" : ""}
                    ${!isCorrect && !isWrong && isSelected ? "bg-white border-yellow-500 text-yellow-600 shadow-md" : ""}
                    ${!isCorrect && !isWrong && !isSelected ? "bg-white border-gray-200 text-gray-600" : ""}
                  `}
                >
                  {option}
                </motion.button>
              );
            })}
          </div>

          <div className="px-8 pb-10 mt-auto">
            <motion.button
              onClick={handleCheck}
              disabled={!selectedOption || status !== "idle" || gameOver}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-5 rounded-[24px] font-black text-lg flex items-center justify-center gap-3 shadow-lg transition-all
                ${
                  status === "correct"
                    ? "bg-green-500 text-white"
                    : status === "wrong"
                    ? "bg-red-500 text-white"
                    : selectedOption
                    ? "bg-yellow-400 text-gray-800"
                    : "bg-gray-200 text-gray-400"
                }
              `}
            >
              {status === "correct" ? "Hebat!" : status === "wrong" ? `Salah! Nyawa: ${lives}` : "Periksa Jawaban"}
              {status === "wrong" ? <XCircle size={24} /> : <CheckCircle2 size={24} />}
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizPage;