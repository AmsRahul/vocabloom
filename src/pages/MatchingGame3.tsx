import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Volume2,
  CheckCircle2,
  Trophy,
  ArrowRight,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  documentId,
  query,
  where,
  limit,
  DocumentData,
} from "firebase/firestore";

// --- INTERFACES ---
interface RawVocabulary {
  id: string;
  word: string;
  indonesian: string;
  level?: string;
  topics?: string[];
}

interface GameItem {
  id: string;
  text: string;
  matchId: string;
  lang: "en" | "id";
  originalData?: RawVocabulary;
}

interface GameWordsState {
  en: GameItem[];
  id: GameItem[];
}

const MatchingGame2: React.FC = () => {
  const [words, setWords] = useState<GameWordsState>({ en: [], id: [] });
  const [selected, setSelected] = useState<GameItem | null>(null);
  const [solvedIds, setSolvedIds] = useState<string[]>([]);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState<string | null>(null);

  // 1. FETCH DATA
  useEffect(() => {
    const fetchWords = async () => {
      try {
        setLoading(true);

        // 1. Ambil list ID dari Sub-Chapter
        const subDoc = await getDoc(
          doc(db, `chapters/about me/sub_chapters/personal-info`)
        );
        const ids = subDoc.data().vocab_ids; // Isinya ["word_001", "word_002"]
        setTitle(subDoc.data().title);

        // 2. Ambil semua detail kata berdasarkan ID tersebut
        const vocabQuery = query(
          collection(db, "vocabularies"),
          where(documentId(), "in", ids),
          limit(5)
        );
        const snapshot = await getDocs(vocabQuery);

        // const wordsRef = collection(db, "vocabularies");
        // const q = query(wordsRef, limit(5));
        // const snapshot = await getDocs(q);

        let dataToProcess: RawVocabulary[] = [];
        // console.log(snapshot);
        if (snapshot.empty) {
          dataToProcess = getFallbackWords();
        } else {
          snapshot.forEach((doc) => {
            const data = doc.data() as DocumentData;

            if (data.word && data.indonesian) {
              dataToProcess.push({
                id: doc.id,
                word: data.word,
                indonesian: data.indonesian,
              });
            }
          });
        }

        setWords(createWordPairs(dataToProcess));
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Gagal memuat data dari Firebase.");
        setWords(createWordPairs(getFallbackWords()));
        setLoading(false);
      }
    };
    fetchWords();
  }, []);

  // 2. HELPERS
  const getFallbackWords = (): RawVocabulary[] => [
    { id: "1", word: "Hello", indonesian: "Halo" },
    { id: "2", word: "Goodbye", indonesian: "Selamat tinggal" },
    { id: "3", word: "Thank you", indonesian: "Terima kasih" },
    { id: "4", word: "Please", indonesian: "Tolong" },
    { id: "5", word: "Apple", indonesian: "Apel" },
  ];

  const createWordPairs = (wordList: RawVocabulary[]): GameWordsState => {
    const englishSide: GameItem[] = [];
    const indonesianSide: GameItem[] = [];

    wordList.forEach((word) => {
      const matchKey = word.word.toLowerCase();
      englishSide.push({
        id: `${word.id}_en`,
        text: word.word,
        matchId: matchKey,
        lang: "en",
        originalData: word,
      });
      indonesianSide.push({
        id: `${word.id}_id`,
        text: word.indonesian,
        matchId: matchKey,
        lang: "id",
        originalData: word,
      });
    });

    return {
      en: shuffleArray(englishSide),
      id: shuffleArray(indonesianSide),
    };
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // 3. ACTIONS
  const handleSelect = (item: GameItem) => {
    if (solvedIds.includes(item.id) || selected?.id === item.id) return;

    // Speech logic (Hanya untuk Bahasa Inggris)
    if (item.lang === "en") {
      window.speechSynthesis.cancel(); // Hentikan suara sebelumnya jika ada

      const utterance = new SpeechSynthesisUtterance(item.text);
      utterance.lang = "en-US";

      // Opsional: Mencari voice bahasa Inggris yang lebih natural jika tersedia
      const voices = window.speechSynthesis.getVoices();
      const enVoice = voices.find(
        (v) => v.lang === "en-US" || v.lang === "en_US"
      );
      if (enVoice) utterance.voice = enVoice;

      window.speechSynthesis.speak(utterance);
    }

    if (!selected) {
      setSelected(item);
    } else {
      if (selected.matchId === item.matchId && selected.lang !== item.lang) {
        setSolvedIds((prev) => [...prev, selected.id, item.id]);
        setSelected(null);
        if (navigator.vibrate) navigator.vibrate(50);
      } else {
        setWrongId(item.id);
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        setTimeout(() => {
          setWrongId(null);
          setSelected(null);
        }, 800);
      }
    }
  };

  useEffect(() => {
    const totalItems = words.en.length + words.id.length;
    if (totalItems > 0 && solvedIds.length === totalItems) {
      setTimeout(() => setShowSuccess(true), 500);
    }
  }, [solvedIds, words]);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F9F9F9] p-4 font-sans">
      <div className="max-w-2xl mx-auto">
        <header className="flex justify-between items-center mb-8 pt-4">
          <button
            onClick={() => window.location.reload()}
            className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100"
          >
            <RotateCcw size={20} />
          </button>
          <div className="text-center">
            <h1 className="text-xl font-black text-gray-800">
              Chapter : {title}
            </h1>
          </div>
          <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center font-black text-white shadow-lg">
            {solvedIds.length / 2}
          </div>
        </header>

        {/* --- DUA KOLOM SISI --- */}
        <div className="grid grid-cols-2 gap-6">
          {/* Kolom Kiri: English */}
          <div className="flex flex-col gap-4">
            <p className="text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
              English
            </p>
            {words.en.map((item) => (
              <WordCard
                key={item.id}
                item={item}
                isSelected={selected?.id === item.id}
                isSolved={solvedIds.includes(item.id)}
                isWrong={
                  wrongId === item.id ||
                  (wrongId !== null && selected?.id === item.id)
                }
                onSelect={handleSelect}
              />
            ))}
          </div>

          {/* Kolom Kanan: Indonesia */}
          <div className="flex flex-col gap-4">
            <p className="text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Indonesia
            </p>
            {words.id.map((item) => (
              <WordCard
                key={item.id}
                item={item}
                isSelected={selected?.id === item.id}
                isSolved={solvedIds.includes(item.id)}
                isWrong={
                  wrongId === item.id ||
                  (wrongId !== null && selected?.id === item.id)
                }
                onSelect={handleSelect}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Success UI */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-white/90 backdrop-blur-md flex items-center justify-center p-6 z-50"
          >
            <div className="text-center">
              <Trophy size={80} className="mx-auto text-yellow-500 mb-4" />
              <h2 className="text-3xl font-black text-gray-800">Luar Biasa!</h2>
              <Link
                to="/chapter/aboutme"
                className="mt-8 px-10 py-4 bg-yellow-400 text-white font-black rounded-full shadow-xl inline-block"
              >
                Lanjut Belajar
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- SUB-COMPONENT WORD CARD ---
interface WordCardProps {
  item: GameItem;
  isSelected: boolean;
  isSolved: boolean;
  isWrong: boolean;
  onSelect: (item: GameItem) => void;
}

const WordCard: React.FC<WordCardProps> = ({
  item,
  isSelected,
  isSolved,
  isWrong,
  onSelect,
}) => {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={() => onSelect(item)}
      className={`
        w-full h-20 rounded-[28px] border-2 font-black text-[15px] transition-all duration-300 shadow-sm
        ${
          isSolved
            ? "bg-green-50 border-green-100 text-green-500 opacity-40 shadow-none pointer-events-none"
            : isWrong
            ? "bg-red-50 border-red-200 text-red-500"
            : isSelected
            ? "bg-blue-500 border-blue-600 text-white scale-[1.03] shadow-lg shadow-blue-100"
            : "bg-white border-gray-100 text-gray-700 hover:border-blue-100"
        }
      `}
      animate={isWrong ? { x: [-3, 3, -3, 3, 0] } : {}}
    >
      {isSolved ? <CheckCircle2 size={24} className="mx-auto" /> : item.text}
    </motion.button>
  );
};

export default MatchingGame2;
