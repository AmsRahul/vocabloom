import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Volume2,
  CheckCircle2,
  Trophy,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const INITIAL_WORDS = [
  { id: 1, text: "Cat", matchId: "cat", lang: "en" },
  { id: 2, text: "Mobil", matchId: "car", lang: "id" },
  { id: 3, text: "Apple", matchId: "apple", lang: "en" },
  { id: 4, text: "Apel", matchId: "apple", lang: "id" },
  { id: 5, text: "Dog", matchId: "dog", lang: "en" },
  { id: 6, text: "Rumah", matchId: "house", lang: "id" },
  { id: 7, text: "House", matchId: "house", lang: "en" },
  { id: 8, text: "Anjing", matchId: "dog", lang: "id" },
  { id: 9, text: "Car", matchId: "car", lang: "en" },
  { id: 10, text: "Kucing", matchId: "cat", lang: "id" },
];

const MatchingGame = () => {
  const [selected, setSelected] = useState(null);
  const [solvedIds, setSolvedIds] = useState([]);
  const [wrongId, setWrongId] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const voicesRef = useRef([]);

  // 1. Inisialisasi Suara & Haptic Warm-up
  useEffect(() => {
    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };
    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();

    return () => window.speechSynthesis.cancel();
  }, []);

  // 2. Fungsi Haptic Feedback (Getar)
  const triggerHaptic = (type) => {
    if (!("vibrate" in navigator)) return; 

    if (type === "correct") {
      navigator.vibrate(50); 
    } else if (type === "wrong") {
      navigator.vibrate([100, 50, 100]); 
    } else if (type === "success") {
      navigator.vibrate([200, 100, 200]); 
    }
  };

  const playSpeech = (text, lang) => {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // 1. Tentukan locale target secara spesifik
    const targetLang = lang === "en" ? "en-US" : "id-ID";
    utterance.lang = targetLang; 

    // 2. Cari suara yang benar-benar mendukung targetLang
    const voice = voicesRef.current.find(
      (v) =>
        v.lang.toLowerCase() === targetLang.toLowerCase() ||
        v.lang.toLowerCase().replace("_", "-") === targetLang.toLowerCase()
    );

    if (voice) {
      utterance.voice = voice;
    }

    // 3. Atur kecepatan agar tidak terlalu lambat/terseret
    utterance.rate = 1.0;
    utterance.pitch = 1.1;

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (solvedIds.length === INITIAL_WORDS.length && INITIAL_WORDS.length > 0) {
      setTimeout(() => {
        setShowSuccess(true);
        triggerHaptic("success");
        playSpeech("Amazing! You did it!", "en");
      }, 500);
    }
  }, [solvedIds]);

  const handleSelect = (item) => {
    if (solvedIds.includes(item.id) || (selected && selected.id === item.id))
      return;

    playSpeech(item.text, item.lang);

    if (!selected) {
      setSelected(item);
    } else {
      if (selected.matchId === item.matchId && selected.lang !== item.lang) {
        // --- JAWABAN BENAR ---
        triggerHaptic("correct");
        setSolvedIds([...solvedIds, selected.id, item.id]);
        setSelected(null);
      } else {
        // --- JAWABAN SALAH ---
        triggerHaptic("wrong");
        setWrongId(item.id);
        setTimeout(() => {
          setWrongId(null);
          setSelected(null);
        }, 600);
      }
    }
  };

  const progress = (solvedIds.length / INITIAL_WORDS.length) * 100;

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex justify-center p-4 relative overflow-hidden font-sans select-none">
      <div className="w-full max-w-md flex flex-col items-center">
        {/* Header */}
        <div className="w-full flex items-center justify-between mb-6 pt-2">
          <button className="p-2 bg-white rounded-full shadow-sm border border-gray-100">
            <X size={20} />
          </button>
          <div className="text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Chapter 1
            </p>
            <h1 className="text-xl font-black text-gray-800">Animals</h1>
          </div>
          <button className="p-2 bg-white rounded-full shadow-sm border border-gray-100">
            <Volume2 size={20} />
          </button>
        </div>

        {/* Progress */}
        <div className="w-full mb-8">
          <div className="flex justify-between items-end mb-2">
            <span className="text-xs font-bold text-gray-400">
              {solvedIds.length / 2}/5 Pairs
            </span>
            <span className="bg-yellow-100 text-yellow-600 text-[10px] font-black px-2 py-1 rounded-md">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${progress}%` }}
              className="bg-[#f4c430] h-full"
            />
          </div>
        </div>

        {/* Word Grid */}
        <div className="grid grid-cols-2 gap-4 w-full mb-8">
          {INITIAL_WORDS.map((item) => {
            const isSelected = selected?.id === item.id;
            const isCorrect = solvedIds.includes(item.id);
            const isWrong = wrongId === item.id || (wrongId && isSelected);

            return (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.92 }}
                onClick={() => handleSelect(item)}
                className={`
                  h-20 flex items-center justify-center gap-2 rounded-[28px] border-2 font-black text-lg transition-all
                  ${
                    isCorrect
                      ? "bg-green-50 border-green-200 text-green-600"
                      : isWrong
                      ? "bg-red-50 border-red-200 text-red-600"
                      : isSelected
                      ? "bg-[#f4c430] border-yellow-500 text-gray-800 shadow-lg scale-95"
                      : "bg-white border-gray-100 text-gray-700 shadow-sm"
                  }
                `}
                animate={
                  isWrong
                    ? { x: [-4, 4, -4, 4, 0], rotate: [-1, 1, -1, 1, 0] }
                    : {}
                }
              >
                {isCorrect && <CheckCircle2 size={18} />}
                {item.text}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-white/80 backdrop-blur-md z-50 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white w-full max-w-sm rounded-[45px] shadow-2xl p-10 border border-gray-100 flex flex-col items-center text-center"
            >
              <div className="w-24 h-24 bg-yellow-50 rounded-full flex items-center justify-center mb-6">
                <Trophy size={50} className="text-[#f4c430]" />
              </div>
              <h2 className="text-3xl font-black text-gray-800 mb-2">
                Amazing!
              </h2>
              <p className="text-gray-400 mb-8 leading-relaxed">
                You've mastered all the animal names!
              </p>
              <button
                onClick={() => window.location.reload()}
                className="w-full py-4 bg-[#f4c430] text-gray-800 font-extrabold rounded-full shadow-xl shadow-yellow-100 active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                Next Chapter <ArrowRight size={20} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MatchingGame;
