import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pause, Volume2, CheckCircle2, XCircle, Star } from "lucide-react";
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

  const currentQuestion = quiz[currentIndex];

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const fetchVocabs = async () => {
      try {
        const subDoc = await getDoc(
          doc(db, `chapters/about me/sub_chapters/personal-info`)
        );
        const ids = subDoc.data()?.vocab_ids || [];

        const vocabQuery = query(
          collection(db, "vocabularies"),
          where(documentId(), "in", ids),
          limit(10)
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
    // Membatalkan suara yang sedang berjalan agar tidak tumpang tindih
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9; // Sedikit lebih lambat agar jelas
    utterance.pitch = 1;

    window.speechSynthesis.speak(utterance);
  };

  // Efek untuk memutar suara otomatis saat soal muncul
  useEffect(() => {
    if (!loading && currentQuestion) {
      const timer = setTimeout(() => {
        speakWord(currentQuestion.question);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, loading]);

  /* ================= ACTIONS ================= */
  const handleCheck = () => {
    if (!currentQuestion || status !== "idle" || !selectedOption) return;

    if (selectedOption === currentQuestion.correctAnswer) {
      setStatus("correct");
      setScore((prev) => prev + 10);

      setTimeout(() => {
        if (currentIndex < quiz.length - 1) {
          setCurrentIndex((prev) => prev + 1);
          setSelectedOption(null);
          setStatus("idle");
        } else {
          navigate("/chapter/about-me");
        }
      }, 1500);
    } else {
      setStatus("wrong");
      setTimeout(() => setStatus("idle"), 1000);
    }
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

  return (
      <div className="w-full max-w-md bg-[#FAF9F6] rounded-[40px] shadow-2xl flex flex-col overflow-hidden border border-white">
        {/* HEADER */}
        <div className="px-6 pt-8 pb-4 flex justify-between items-center">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-black rounded-full text-white active:scale-90 transition-transform"
          >
            <Pause size={16} fill="currentColor" />
          </button>
          <h2 className="font-black text-[#1E293B] text-lg">Vocabulary Quiz</h2>
          <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
            <Star size={16} className="text-yellow-400" fill="currentColor" />
            <span className="font-bold text-sm text-gray-700">{score}</span>
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
              status === "correct" && option === currentQuestion.correctAnswer;
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
                  ${isCorrect ? "bg-green-500 border-green-700 text-white" : ""}
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
            disabled={!selectedOption || status !== "idle"}
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
              ? "Coba Lagi"
              : "Periksa Jawaban"}
            <CheckCircle2 size={24} />
          </motion.button>
        </div>
      </div>
    
  );
};

export default QuizPage;
