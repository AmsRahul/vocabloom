import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { X, ChevronLeft, ChevronRight, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection,
  getDocs,
  query,
  getDoc,
  doc,
  documentId,
  where,
  limit,
} from "firebase/firestore";
import { db } from "@/firebase";

type Vocab = {
  id: string;
  word: string;
  indonesian: string;
  phonetic: string;
  imageUrl?: string;
};

const NewWordSession: React.FC = () => {
  const [vocabs, setVocabs] = useState<Vocab[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🔥 SPEECH SYNTHESIS FUNCTION
  const speakWord = useCallback((text: string) => {
    window.speechSynthesis.cancel(); // Hentikan suara sebelumnya
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.85; // Sedikit lebih lambat untuk pembelajaran
    window.speechSynthesis.speak(utterance);
  }, []);

  // 🔥 FETCH VOCAB
  useEffect(() => {
    const fetchVocabs = async () => {
      try {
        const subDoc = await getDoc(
          doc(db, `chapters/about me/sub_chapters/personal-info`)
        );
        const ids = subDoc.data()?.vocab_ids || [];

        if (ids.length === 0) {
          setLoading(false);
          return;
        }

        const vocabQuery = query(
          collection(db, "vocabularies"),
          where(documentId(), "in", ids),
          limit(10)
        );
        const snapshot = await getDocs(vocabQuery);

        const data: Vocab[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Vocab, "id">),
        }));

        setVocabs(data);
      } catch (error) {
        console.error("Error fetching:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVocabs();
  }, []);

  // 🔥 AUTO PLAY SUARA SAAT KARTU BERUBAH
  useEffect(() => {
    if (!loading && vocabs.length > 0) {
      const timer = setTimeout(() => {
        speakWord(vocabs[currentIndex].word);
      }, 500); // Tunggu animasi kartu selesai
      return () => clearTimeout(timer);
    }
  }, [currentIndex, loading, vocabs, speakWord]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFDFB]">
        <p className="font-bold text-gray-400 animate-pulse">
          Menyiapkan kartu...
        </p>
      </div>
    );
  }

  const vocab = vocabs[currentIndex];
  const progress = ((currentIndex + 1) / vocabs.length) * 100;

  const handleNext = () => {
    if (currentIndex < vocabs.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      navigate("/chapter/about-me");
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFB] flex justify-center px-4 py-6 antialiased">
      <div className="w-full max-w-sm flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 bg-white rounded-full border border-gray-100 shadow-sm active:scale-90 transition-transform"
          >
            <X size={20} />
          </button>

          <div className="text-center">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Flashcard
            </p>
            <h1 className="text-lg font-black text-gray-800">Sesi Belajar</h1>
          </div>

          <div className="w-10" />
        </div>

        {/* Progress */}
        <div className="mb-10">
          <div className="flex justify-between items-end text-[11px] font-black mb-2">
            <span className="text-gray-400 uppercase tracking-tighter">
              Progress Belajar
            </span>
            <span className="text-yellow-500 bg-yellow-50 px-2 py-0.5 rounded-md">
              {currentIndex + 1} / {vocabs.length}
            </span>
          </div>

          <div className="h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-yellow-400 rounded-full"
            />
          </div>
        </div>

        {/* Flashcard Area */}
        <div className="flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={vocab.id}
              initial={{ opacity: 0, x: 20, rotate: 2 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              exit={{ opacity: 0, x: -20, rotate: -2 }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              className="bg-white rounded-[40px] p-6 shadow-xl border border-gray-50 relative group"
            >
              {/* Image Container */}
              <div className="aspect-[4/3] rounded-[30px] overflow-hidden mb-8 bg-gray-50 shadow-inner">
                <img
                  src={
                    vocab.imageUrl ||
                    `https://placehold.co/600x400?text=${vocab.word}`
                  }
                  alt={vocab.word}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Text Content */}
              <div className="text-center space-y-2 pb-4">
                <div className="flex items-center justify-center gap-3">
                  <h2 className="text-4xl font-black text-gray-800 tracking-tight">
                    {vocab.word}
                  </h2>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => speakWord(vocab.word)}
                    className="p-2.5 bg-yellow-400 text-white rounded-2xl shadow-lg shadow-yellow-200"
                  >
                    <Volume2 size={22} fill="currentColor" />
                  </motion.button>
                </div>

                <p className="text-lg font-bold text-gray-400 italic">
                  {vocab.phonetic}
                </p>

                <div className="pt-2">
                  <span className="px-6 py-2 bg-yellow-50 text-yellow-600 rounded-2xl font-black text-xl">
                    {vocab.indonesian}
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Controls */}
        <div className="flex gap-4 mt-12 pb-4">
          <button
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((i) => i - 1)}
            className="w-16 h-16 bg-white border-2 border-gray-100 rounded-3xl flex items-center justify-center disabled:opacity-30 text-gray-400 active:scale-90 transition-all shadow-sm"
          >
            <ChevronLeft size={32} strokeWidth={3} />
          </button>

          <button
            onClick={handleNext}
            className="flex-1 h-16 bg-yellow-400 text-gray-800 font-black text-xl rounded-3xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-yellow-100"
          >
            {currentIndex === vocabs.length - 1 ? "Selesai" : "Lanjut"}
            <ChevronRight size={24} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewWordSession;
