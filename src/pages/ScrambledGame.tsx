import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Lightbulb, Volume2, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
import { db } from "@/firebase";

// ================= TYPES =================
interface Vocab {
  word: string;
  indonesian: string;
  imageUrl?: string;
}

interface LetterOption {
  id: number;
  char: string;
}

// ================= HELPERS =================
const shuffle = <T,>(array: T[]): T[] =>
  [...array].sort(() => Math.random() - 0.5);

// ================= COMPONENT =================
const ScrambledWordGame: React.FC = () => {
  const navigate = useNavigate();
  const [allVocabs, setAllVocabs] = useState<Vocab[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledOptions, setShuffledOptions] = useState<LetterOption[]>([]);
  const [answers, setAnswers] = useState<(LetterOption | null)[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");

  const currentVocab = allVocabs[currentIndex];

  // ===== SPEECH SYNTHESIS =====
  const speakWord = useCallback((text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }, []);

  // ===== FETCH DATA =====
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

        setAllVocabs(vocabsData);
        if (vocabsData.length > 0) {
          setupGame(vocabsData[0]);
        }
      } catch (error) {
        console.error("Error fetching vocabs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVocabs();
  }, []);

  // ===== SETUP GAME PER WORD =====
  const setupGame = (vocab: Vocab) => {
    const letters = vocab.word.toUpperCase().split("");
    setAnswers(new Array(letters.length).fill(null));
    setShuffledOptions(
      shuffle(
        letters.map((char, index) => ({
          id: index,
          char,
        }))
      )
    );
    setStatus("idle");
  };

  // ===== HANDLERS =====
  const handleSelectLetter = (option: LetterOption) => {
    if (status === "correct") return;
    const emptyIndex = answers.indexOf(null);
    if (emptyIndex === -1) return;

    const newAnswers = [...answers];
    newAnswers[emptyIndex] = option;
    setAnswers(newAnswers);
    setShuffledOptions((prev) => prev.filter((item) => item.id !== option.id));
  };

  const handleRemoveLetter = (index: number) => {
    if (status === "correct") return;
    const letter = answers[index];
    if (!letter) return;

    const newAnswers = [...answers];
    newAnswers[index] = null;
    setAnswers(newAnswers);
    setShuffledOptions((prev) => [...prev, letter]);
  };

  const handleCheck = () => {
    if (!currentVocab) return;
    const userWord = answers.map((a) => a?.char).join("");
    const isCorrect = userWord === currentVocab.word.toUpperCase();

    if (isCorrect) {
      setStatus("correct");
      speakWord(currentVocab.word);
      setTimeout(() => {
        if (currentIndex < allVocabs.length - 1) {
          const nextIdx = currentIndex + 1;
          setCurrentIndex(nextIdx);
          setupGame(allVocabs[nextIdx]);
        } else {
          navigate("/chapter/about-me");
        }
      }, 2000);
    } else {
      setStatus("wrong");
      setTimeout(() => setStatus("idle"), 1000);
    }
  };

  if (loading || !currentVocab) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFDFB]">
        <p className="font-bold text-gray-400">Loading game...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFB] flex justify-center p-4 font-sans antialiased">
      <div className="w-full max-w-md flex flex-col items-center">
        {/* HEADER */}
        <div className="w-full flex items-center justify-between mt-2 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white rounded-full shadow-sm border"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="text-center">
            <h1 className="text-lg font-black text-gray-800">Scrambled Word</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Level {currentIndex + 1} of {allVocabs.length}
            </p>
          </div>
          <button className="p-2 bg-yellow-100 rounded-full text-yellow-600">
            <Lightbulb size={20} fill="currentColor" />
          </button>
        </div>

        {/* CARD */}
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`w-full bg-white rounded-[40px] p-6 shadow-xl border-2 mb-8 relative transition-colors
          ${
            status === "correct"
              ? "border-green-400"
              : status === "wrong"
              ? "border-red-400"
              : "border-transparent"
          }`}
        >
          <div className="w-full aspect-square bg-gray-50 rounded-[32px] flex items-center justify-center p-4 mb-2">
            <img
              src={
                currentVocab.imageUrl ||
                `https://placehold.co/400x400?text=vocab-image`
              }
              alt={currentVocab.word}
              className="w-full h-full object-contain"
            />
          </div>
          <p className="text-center text-yellow-500 font-black text-2xl uppercase">
            {currentVocab.indonesian}
          </p>
          {/* <button
            onClick={() => speakWord(currentVocab.word)}
            className="absolute bottom-6 right-6 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-yellow-500 active:scale-90 transition-transform"
          >
            <Volume2 size={24} fill="currentColor" fillOpacity={0.1} />
          </button> */}
        </motion.div>

        {/* ANSWER SLOTS */}
        <div className="flex flex-wrap justify-center gap-2 mb-10 min-h-[60px]">
          {answers.map((letter, idx) => (
            <motion.button
              key={idx}
              onClick={() => handleRemoveLetter(idx)}
              className={`w-10 h-14 border-b-4 flex items-center justify-center text-2xl font-black transition-all
                ${
                  status === "correct"
                    ? "border-green-500 text-green-600 bg-green-50 rounded-t-xl"
                    : letter
                    ? "border-yellow-400 text-yellow-500 bg-yellow-50 rounded-t-xl"
                    : "border-gray-200 text-transparent"
                }`}
            >
              {letter?.char}
            </motion.button>
          ))}
        </div>

        {/* OPTIONS (DENGAN ANIMASI SMOOTH) */}
        <div className="w-full mb-8">
          <p className="text-center text-gray-400 font-bold text-[11px] uppercase tracking-widest mb-4">
            Tap the letters to spell the word
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <AnimatePresence mode="popLayout">
              {shuffledOptions.map((option) => (
                <motion.button
                  key={option.id}
                  layout
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  onClick={() => handleSelectLetter(option)}
                  className="w-12 h-12 bg-white rounded-full shadow-md border-2 border-gray-50 flex items-center justify-center text-lg font-black text-gray-700 active:bg-yellow-50"
                >
                  {option.char}
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* CHECK BUTTON */}
        <div className="w-full pb-4">
          <motion.button
            whileTap={{ scale: 0.98 }}
            disabled={!answers.every(Boolean) || status === "correct"}
            onClick={handleCheck}
            className={`w-full py-5 rounded-[28px] font-black text-lg flex items-center justify-center gap-3 transition-all
              ${
                status === "correct"
                  ? "bg-green-500 text-white"
                  : answers.every(Boolean)
                  ? "bg-yellow-400 text-gray-800 shadow-lg"
                  : "bg-gray-200 text-gray-400"
              }`}
          >
            {status === "correct" ? "Hebat!" : "Check Word"}
            <CheckCircle size={24} />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default ScrambledWordGame;
