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
  updateDoc
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

// ================= TYPES =================
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

// ================= HELPERS =================
const shuffle = <T,>(array: T[]): T[] =>
  [...array].sort(() => Math.random() - 0.5);

const generateQuiz = (vocabs: Vocab[]): QuizQuestion[] =>
  vocabs.map((vocab) => {
    const wrongOptions = shuffle(
      vocabs
        .filter((v) => v.indonesian !== vocab.indonesian)
        .map((v) => v.indonesian)
    ).slice(0, 3);

    return {
      question: vocab.word,
      correctAnswer: vocab.indonesian,
      options: shuffle([vocab.indonesian, ...wrongOptions]),
      image: vocab.imageUrl,
    };
  });

// ================= COMPONENT =================
const QuizPage: React.FC = () => {
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3); // Menambahkan state untuk nyawa
  const [gameOver, setGameOver] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isFinished, setIsFinished] = useState(false); // State untuk layar sukses akhir

  const currentQuestion = quiz[currentIndex];
  const updateProgressToScramble = async () => {
    try {
      setIsUpdating(true);
      const userId = "2hE606upFBgYTG496dkWhcb1Uy93"; // Ganti dengan Auth UID
      const progressDocRef = doc(
        db,
        "users",
        userId,
        "progress",
        "about-me",
        "sub_chapters",
        "personal-info",
      );

      await updateDoc(progressDocRef, {
        "activity.quiz.completed": true,
        "activity.scrambled.unlocked": true, // 🔥 Membuka tahap Scramble Word
        lastActivity: "quiz",
        updatedAt: new Date(),
      });

      console.log("Progress updated: Scramble Word Unlocked!");
    } catch (error) {
      console.error("Error updating progress:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const fetchVocabs = async () => {
      try {
        const subDoc = await getDoc(
          doc(db, `chapters/about me/sub_chapters/personal-info`),
        );
        const ids = subDoc.data()?.vocab_ids || [];

        const vocabQuery = query(
          collection(db, "vocabularies"),
          where(documentId(), "in", ids),
          limit(10),
        );
        const snapshot = await getDocs(vocabQuery);
        const vocabsData = snapshot.docs.map((doc) => doc.data() as Vocab);

        setQuiz(generateQuiz(vocabsData));
      } catch (error) {
        console.error("Error fetching quiz:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVocabs();
  }, []);

  /* ================= SPEECH SYNTHESIS LOGIC ================= */
  const speakWord = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (!loading && currentQuestion && !gameOver) {
      const timer = setTimeout(() => {
        speakWord(currentQuestion.question);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, loading, gameOver]);

  /* ================= ACTIONS ================= */
  const handleCheck = () => {
    if (!currentQuestion || status !== "idle" || !selectedOption || gameOver)
      return;

    if (selectedOption === currentQuestion.correctAnswer) {
      setStatus("correct");
      setScore((prev) => prev + 10);

      setTimeout(async () => {
        if (currentIndex < quiz.length - 1) {
          setCurrentIndex((prev) => prev + 1);
          setSelectedOption(null);
          setStatus("idle");
        } else {
          await updateProgressToScramble();
          setIsFinished(true);
        }
      }, 1500);
    } else {
      setStatus("wrong");

      // Mengurangi nyawa ketika jawaban salah
      const newLives = lives - 1;
      setLives(newLives);

      setTimeout(() => {
        if (newLives <= 0) {
          // Game over ketika nyawa habis
          setGameOver(true);
          setTimeout(() => {
            navigate("/chapter/about-me");
          }, 3000);
        } else {
          setStatus("idle");
          // Pindah ke soal berikutnya meski jawaban salah
          if (currentIndex < quiz.length - 1) {
            setCurrentIndex((prev) => prev + 1);
            setSelectedOption(null);
          } else {
            navigate("/chapter/about-me");
          }
        }
      }, 1000);
    }
  };

  // Fungsi untuk mereset game
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
            <div className="mt-6 py-3 px-4 bg-orange-50 rounded-2xl border border-orange-100">
              <p className="text-sm text-orange-700 font-bold">
                🔓 Tantangan Baru Terbuka: Scramble Word!
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => navigate("/scrambled/personal-info")} // 🔥 Navigasi ke Scramble
              className="w-full py-5 bg-orange-500 text-white font-black rounded-3xl shadow-lg shadow-orange-200 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              Main Scramble Word
              <CheckCircle2 size={22} />
            </button>

            <button
              onClick={() => navigate("/chapter/about-me")}
              className="w-full py-4 text-gray-400 font-bold text-sm"
            >
              Nanti saja, kembali ke menu
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
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mb-6"
          >
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
              onClick={() => navigate("/chapter/about-me")}
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
          {/* HEADER dengan Lives */}
          <div className="px-6 pt-8 pb-4 flex justify-between items-center">
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-black rounded-full text-white active:scale-90 transition-transform"
            >
              <Pause size={16} fill="currentColor" />
            </button>
            <h2 className="font-black text-[#1E293B] text-lg">
              Vocabulary Quiz
            </h2>
            <div className="flex items-center gap-4">
              {/* Lives Display */}
              <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
                {[...Array(3)].map((_, index) => (
                  <Heart
                    key={index}
                    size={16}
                    className={
                      index < lives
                        ? "text-red-500 fill-current"
                        : "text-gray-300"
                    }
                  />
                ))}
              </div>

              {/* Score Display */}
              <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
                <Star
                  size={16}
                  className="text-yellow-400"
                  fill="currentColor"
                />
                <span className="font-bold text-sm text-gray-700">{score}</span>
              </div>
            </div>
          </div>

          {/* PROGRESS */}
          <div className="px-8 mb-6">
            <p className="text-[10px] text-gray-400 font-bold uppercase mb-2 tracking-widest">
              Question {currentIndex + 1} of {quiz.length}
            </p>
            <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${((currentIndex + 1) / quiz.length) * 100}%`,
                }}
                className="bg-yellow-400 h-full rounded-full"
              />
            </div>
          </div>

          {/* IMAGE SECTION */}
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

          {/* QUESTION AREA WITH SPEECH BUTTON */}
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

          {/* OPTIONS */}
          <div className="px-8 grid grid-cols-2 gap-4 mb-8">
            {currentQuestion.options.map((option) => {
              const isSelected = selectedOption === option;
              const isCorrect =
                status === "correct" &&
                option === currentQuestion.correctAnswer;
              const isWrong = status === "wrong" && isSelected;

              return (
                <motion.button
                  key={option}
                  disabled={status !== "idle"}
                  onClick={() => setSelectedOption(option)}
                  animate={isWrong ? { x: [-5, 5, -5, 5, 0] } : {}}
                  className={`py-5 rounded-2xl font-bold text-md border-b-4 transition-all
                    ${
                      isSelected
                        ? "translate-y-[-2px]"
                        : "active:translate-y-[2px]"
                    }
                    ${
                      isCorrect
                        ? "bg-green-500 border-green-700 text-white"
                        : ""
                    }
                    ${isWrong ? "bg-red-500 border-red-700 text-white" : ""}
                    ${
                      !isCorrect && !isWrong && isSelected
                        ? "bg-white border-yellow-500 text-yellow-600 shadow-md"
                        : ""
                    }
                    ${
                      !isCorrect && !isWrong && !isSelected
                        ? "bg-white border-gray-200 text-gray-600"
                        : ""
                    }
                  `}
                >
                  {option}
                </motion.button>
              );
            })}
          </div>

          {/* ACTION BUTTON */}
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
              {status === "correct"
                ? "Hebat!"
                : status === "wrong"
                  ? `Salah! Nyawa: ${lives}`
                  : "Periksa Jawaban"}
              {status === "wrong" ? (
                <XCircle size={24} />
              ) : (
                <CheckCircle2 size={24} />
              )}
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizPage;
