import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  RotateCcw,
  Loader2,
  Trophy,
  Heart, // Ikon untuk nyawa
  XCircle,
  CheckCircle2,
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
  updateDoc
} from "firebase/firestore";

// --- INTERFACES ---
interface RawVocabulary {
  id: string;
  word: string;
  indonesian: string;
}

interface GameItem {
  id: string;
  text: string;
  matchId: string;
  lang: "en" | "id";
}

interface GameWordsState {
  en: GameItem[];
  id: GameItem[];
}

const MatchingGame2: React.FC = () => {
  const navigate = useNavigate();
  const [words, setWords] = useState<GameWordsState>({ en: [], id: [] });
  const [selected, setSelected] = useState<GameItem | null>(null);
  const [solvedIds, setSolvedIds] = useState<string[]>([]);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [lives, setLives] = useState<number>(3);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [title, setTitle] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false); // State baru untuk proses simpan progress

  const updateProgressToQuiz = async () => {
    try {
      setIsUpdating(true);
      const userId = "2hE606upFBgYTG496dkWhcb1Uy93"; // Sesuaikan dengan Auth UID
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
        "activity.matching.completed": true,
        "activity.quiz.unlocked": true, // Membuka aktivitas selanjutnya (Quiz)
        lastActivity: "matching",
        updatedAt: new Date(),
      });

      console.log("Progress updated: Quiz Unlocked!");
    } catch (error) {
      console.error("Error updating progress:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // 1. FETCH DATA - LIMIT KE 5 KATA SAJA
  useEffect(() => {
    const fetchWords = async () => {
      try {
        setLoading(true);
        const subDoc = await getDoc(
          doc(db, `chapters/about me/sub_chapters/personal-info`),
        );
        if (!subDoc.exists()) throw new Error("Sub-chapter tidak ditemukan");

        const ids = subDoc.data().vocab_ids;
        setTitle(subDoc.data().title);

        // Batasi hanya 5 kata pertama dari vocab_ids
        const limitedIds = ids.slice(0, 5);

        const vocabQuery = query(
          collection(db, "vocabularies"),
          where(documentId(), "in", limitedIds),
          limit(5), // Limit query ke 5 dokumen
        );
        const snapshot = await getDocs(vocabQuery);

        const dataToProcess: RawVocabulary[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          dataToProcess.push({
            id: doc.id,
            word: data.word,
            indonesian: data.indonesian,
          });
        });

        // Jika data kurang dari 5, tambahkan fallback words
        if (dataToProcess.length < 5) {
          const fallbackWords = getFallbackWords();
          // Ambil sejumlah kata yang dibutuhkan dari fallback
          const needed = 5 - dataToProcess.length;
          const additionalWords = fallbackWords.slice(0, needed);
          dataToProcess.push(...additionalWords);
        }

        // Pastikan hanya 5 kata
        const limitedData = dataToProcess.slice(0, 5);

        const gameData = createWordPairs(limitedData);
        setWords(gameData);
      } catch (err) {
        console.error("Error fetching words:", err);
        // Gunakan fallback words jika error, tetap 5 kata
        const fallbackWords = getFallbackWords().slice(0, 5);
        setWords(createWordPairs(fallbackWords));
      } finally {
        setLoading(false);
      }
    };
    fetchWords();
  }, []);

  // --- TRIGGER SUCCESS DENGAN UPDATE DB ---
  useEffect(() => {
    const total = words.en.length + words.id.length;
    if (total > 0 && solvedIds.length === total) {
      // Jalankan update database sebelum menampilkan modal sukses
      updateProgressToQuiz().then(() => {
        setTimeout(() => setShowSuccess(true), 500);
      });
    }
  }, [solvedIds, words]);
  // 2. HELPERS
  const getFallbackWords = (): RawVocabulary[] => [
    { id: "1", word: "Hello", indonesian: "Halo" },
    { id: "2", word: "Apple", indonesian: "Apel" },
    { id: "3", word: "Water", indonesian: "Air" },
    { id: "4", word: "Book", indonesian: "Buku" },
    { id: "5", word: "School", indonesian: "Sekolah" },
    { id: "6", word: "Family", indonesian: "Keluarga" },
    { id: "7", word: "Friend", indonesian: "Teman" },
    { id: "8", word: "Teacher", indonesian: "Guru" },
    { id: "9", word: "Student", indonesian: "Murid" },
    { id: "10", word: "Home", indonesian: "Rumah" },
  ];

  const createWordPairs = (wordList: RawVocabulary[]): GameWordsState => {
    // Pastikan hanya maksimal 5 kata
    const limitedList = wordList.slice(0, 5);

    const enSide: GameItem[] = [];
    const idSide: GameItem[] = [];

    limitedList.forEach((word) => {
      const matchKey = word.word.toLowerCase();
      enSide.push({
        id: `${word.id}_en`,
        text: word.word,
        matchId: matchKey,
        lang: "en",
      });
      idSide.push({
        id: `${word.id}_id`,
        text: word.indonesian,
        matchId: matchKey,
        lang: "id",
      });
    });

    return { en: shuffleArray(enSide), id: shuffleArray(idSide) };
  };

  const shuffleArray = <T,>(array: T[]): T[] =>
    [...array].sort(() => Math.random() - 0.5);

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const ut = new SpeechSynthesisUtterance(text);
    ut.lang = "en-US";
    window.speechSynthesis.speak(ut);
  };

  // 3. ACTIONS
  const handleSelect = (item: GameItem) => {
    if (solvedIds.includes(item.id) || selected?.id === item.id || gameOver)
      return;

    if (item.lang === "en") speak(item.text);

    if (!selected) {
      setSelected(item);
    } else {
      // Cek apakah match
      if (selected.matchId === item.matchId && selected.lang !== item.lang) {
        setSolvedIds((prev) => [...prev, selected.id, item.id]);
        setSelected(null);
      } else {
        // SALAH JAWABAN
        setWrongId(item.id);
        setLives((prev) => {
          const newLives = prev - 1;
          if (newLives <= 0) setGameOver(true); // Cek Game Over
          return newLives;
        });

        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

        setTimeout(() => {
          setWrongId(null);
          setSelected(null);
        }, 800);
      }
    }
  };

  useEffect(() => {
    const total = words.en.length + words.id.length;
    if (total > 0 && solvedIds.length === total) {
      setTimeout(() => setShowSuccess(true), 500);
    }
  }, [solvedIds, words]);

  if (loading)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#F9F9F9]">
        <Loader2 className="animate-spin text-blue-500 mb-2" size={40} />
        <p className="font-bold text-gray-400">Menyiapkan tantangan...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F9F9F9] p-4 font-sans">
      {isUpdating && (
        <div className="fixed inset-0 bg-white/50 backdrop-blur-[2px] z-[60] flex items-center justify-center">
          <Loader2 className="animate-spin text-blue-500" />
        </div>
      )}
      <div className="max-w-2xl mx-auto">
        <header className="flex justify-between items-center mb-8 pt-4">
          <button
            onClick={() => navigate(-1)}
            className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 active:scale-90 transition-transform"
          >
            <XCircle size={20} className="text-gray-500" />
          </button>

          <div className="flex flex-col items-center">
            <h1 className="text-lg font-black text-gray-800 uppercase tracking-tight">
              {title || "Matching Game"}
            </h1>
            {/* --- UI NYAWA --- */}
            <div className="flex gap-1 mt-1">
              {[...Array(3)].map((_, i) => (
                <Heart
                  key={i}
                  size={18}
                  fill={i < lives ? "#ef4444" : "none"}
                  className={i < lives ? "text-red-500" : "text-gray-300"}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Cocokkan {words.en.length} pasang kata
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center font-black text-white shadow-lg">
              {solvedIds.length / 2}/{words.en.length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Selesai</p>
          </div>
        </header>

        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col gap-4">
            <div className="text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                English
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {words.en.filter((item) => !solvedIds.includes(item.id)).length}{" "}
                tersisa
              </p>
            </div>
            {words.en.map((item) => (
              <WordCard
                key={item.id}
                item={item}
                onSelect={handleSelect}
                isSelected={selected?.id === item.id}
                isSolved={solvedIds.includes(item.id)}
                isWrong={
                  wrongId === item.id ||
                  (wrongId !== null && selected?.id === item.id)
                }
              />
            ))}
          </div>
          <div className="flex flex-col gap-4">
            <div className="text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Indonesia
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {words.id.filter((item) => !solvedIds.includes(item.id)).length}{" "}
                tersisa
              </p>
            </div>
            {words.id.map((item) => (
              <WordCard
                key={item.id}
                item={item}
                onSelect={handleSelect}
                isSelected={selected?.id === item.id}
                isSolved={solvedIds.includes(item.id)}
                isWrong={
                  wrongId === item.id ||
                  (wrongId !== null && selected?.id === item.id)
                }
              />
            ))}
          </div>
        </div>
      </div>

      {/* --- MODAL SUCCESS --- */}
     <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-white/90 backdrop-blur-md flex items-center justify-center p-6 z-50"
          >
            <div className="text-center max-w-sm">
              <div className="relative inline-block mb-4">
                <Trophy size={80} className="mx-auto text-yellow-500" />
                <motion.div 
                  initial={{ scale: 0 }} 
                  animate={{ scale: 1 }} 
                  className="absolute -top-2 -right-2 bg-green-500 text-white p-2 rounded-full border-4 border-white"
                >
                  <CheckCircle2 size={20} />
                </motion.div>
              </div>
              
              <h2 className="text-3xl font-black text-gray-800 mb-2">
                Mantap!
              </h2>
              <p className="text-gray-600 mb-8 font-medium">
                Kamu hebat! Matching Word selesai dan <span className="text-orange-500 font-bold">Sesi Quiz</span> sekarang sudah terbuka.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => navigate("/chapter/about-me")}
                  className="w-full py-4 bg-gray-800 text-white font-black rounded-[24px] shadow-xl active:scale-95 transition-all"
                >
                  Kembali ke Menu
                </button>
                <button
                  onClick={() => navigate("/quiz/personal-info")}
                  className="w-full py-4 bg-white text-gray-400 font-bold text-sm rounded-[24px] border border-gray-100 active:scale-95 transition-all"
                >
                  Lanjut ke Quiz Sekarang
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MODAL GAME OVER --- */}
      <AnimatePresence>
        {gameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-red-500/90 backdrop-blur-md flex items-center justify-center p-6 z-50"
          >
            <div className="text-center text-white max-w-sm">
              <XCircle size={80} className="mx-auto mb-4" />
              <h2 className="text-3xl font-black mb-2">Yah, Nyawa Habis!</h2>
              <p className="mb-2 font-medium">
                Kamu berhasil menyelesaikan {solvedIds.length / 2} dari{" "}
                {words.en.length} pasang kata.
              </p>
              <p className="mb-6 font-medium">
                Jangan menyerah, coba lagi yuk.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => window.location.reload()}
                  className="px-10 py-4 bg-white text-red-500 font-black rounded-full shadow-xl flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
                >
                  <RotateCcw size={20} /> Coba Lagi
                </button>
                <button
                  onClick={() => navigate("/chapter/aboutme")}
                  className="px-10 py-4 bg-red-700 text-white font-black rounded-full shadow-xl hover:bg-red-800 transition-colors"
                >
                  Keluar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};;

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
}) => (
  <motion.button
    whileTap={{ scale: 0.95 }}
    onClick={() => onSelect(item)}
    animate={isWrong ? { x: [-3, 3, -3, 3, 0] } : {}}
    className={`w-full h-20 rounded-[28px] border-2 font-black text-[15px] transition-all duration-300 shadow-sm
      ${
        isSolved
          ? "bg-green-50 border-green-100 text-green-500 opacity-40 shadow-none pointer-events-none"
          : isWrong
          ? "bg-red-50 border-red-200 text-red-500 shadow-red-100"
          : isSelected
          ? "bg-blue-500 border-blue-600 text-white scale-[1.03] shadow-lg shadow-blue-100"
          : "bg-white border-gray-100 text-gray-700 hover:border-blue-100"
      }`}
  >
    {isSolved ? <CheckCircle2 size={24} className="mx-auto" /> : item.text}
  </motion.button>
);

export default MatchingGame2;