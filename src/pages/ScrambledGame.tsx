import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Lightbulb, Volume2, CheckCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
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
import { useAuth } from "@/context/AuthContext";
import { completeActivity, unlockNextActivity, XP_REWARDS, checkActivityAccess } from "@/progress";

interface Vocab {
  word: string;
  indonesian: string;
  imageUrl?: string;
}

interface LetterOption {
  id: number;
  char: string;
}

const rightSound = new Audio("/assets/sounds/right.mp3");
const wrongSound = new Audio("/assets/sounds/wrong.mp3");

const shuffle = <T,>(array: T[]): T[] => [...array].sort(() => Math.random() - 0.5);

const ScrambledWordGame: React.FC = () => {
  const { chapterId, topicId } = useParams<{ chapterId: string; topicId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [allVocabs, setAllVocabs] = useState<Vocab[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledOptions, setShuffledOptions] = useState<LetterOption[]>([]);
  const [answers, setAnswers] = useState<(LetterOption | null)[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");
  const [showSuccess, setShowSuccess] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);

  const currentVocab = allVocabs[currentIndex];

  useEffect(() => {
    if (!user || !chapterId || !topicId) return;
    checkActivityAccess(user.uid, chapterId, topicId, "scrambled").then((hasAccess) => {
      if (!hasAccess) {
        navigate(`/quiz/${chapterId}/${topicId}`);
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
  }, [topicId]);

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

  const handleFinish = async () => {
    if (!user || !chapterId || !topicId) return;
    const xpEarned = await completeActivity(user.uid, chapterId, topicId, "scrambled", 100);
    await unlockNextActivity(user.uid, chapterId, topicId, "scrambled");
    setEarnedXp(xpEarned);
    setShowSuccess(true);
  };

  const speakLetter = useCallback((char: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(char);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }, []);

  const handleSelectLetter = (option: LetterOption) => {
    if (status === "correct") return;
    const emptyIndex = answers.indexOf(null);
    if (emptyIndex === -1) return;

    speakLetter(option.char);

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
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentVocab.word);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      utterance.onend = () => {
        rightSound.currentTime = 0;
        rightSound.play().catch(() => {});
      };
      window.speechSynthesis.speak(utterance);
      setTimeout(async () => {
        if (currentIndex < allVocabs.length - 1) {
          const nextIdx = currentIndex + 1;
          setCurrentIndex(nextIdx);
          setupGame(allVocabs[nextIdx]);
        } else {
          await handleFinish();
        }
      }, 2000);
    } else {
      wrongSound.currentTime = 0;
      wrongSound.play().catch(() => {});
      setStatus("wrong");
      if (navigator.vibrate) navigator.vibrate(200);
      setTimeout(() => setStatus("idle"), 1000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFDFB]">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFB] flex justify-center p-4 font-sans antialiased">
      <div className="w-full max-w-md flex flex-col items-center">
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

        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                className="w-32 h-32 bg-orange-100 rounded-full flex items-center justify-center mb-6"
              >
                <Volume2 size={60} className="text-orange-500" />
              </motion.div>

              <h2 className="text-4xl font-black text-gray-800 mb-2">
                Luar Biasa!
              </h2>
              <p className="text-gray-500 mb-4 font-medium">
                Kamu sudah jago menyusun kata!
              </p>
              <div className="bg-green-50 text-green-600 font-bold text-xl px-4 py-2 rounded-xl inline-block mb-8">
                +{earnedXp || XP_REWARDS.scrambled} XP
              </div>

              <div className="w-full space-y-3">
                <button
                  onClick={() => navigate(`/say-it/${chapterId}/${topicId}`)}
                  className="w-full py-5 bg-orange-500 text-white font-black rounded-[28px] shadow-xl shadow-orange-100 flex items-center justify-center gap-3 active:scale-95 transition-all"
                >
                  Lanjut ke Say It!
                  <CheckCircle size={24} />
                </button>
                <button
                  onClick={() => navigate(`/chapter/${chapterId}`)}
                  className="w-full py-4 text-gray-400 font-bold"
                >
                  Kembali ke Menu
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
        </motion.div>

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