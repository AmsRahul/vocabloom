import React, { useEffect, useRef, useState } from "react";
import { Mic, Volume2, ArrowRight, Pause, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  documentId,
  query,
  where,
  limit,
  updateDoc,
  setDoc,
  orderBy,
} from "firebase/firestore";
import { db } from "@/firebase";
import { useNavigate } from "react-router-dom";

// ================= TYPES & BROWSER DECLARATIONS =================

/**
 * Mendefinisikan interface SpeechRecognition secara manual
 * agar TypeScript mengenalinya meskipun tidak ada di lib.dom standar.
 */
interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: (event: Event) => void;
  onerror: (event: Event) => void;
}

interface SpeechRecognitionEvent extends Event {
  results: {
    [key: number]: {
      [key: number]: {
        transcript: string;
      };
    };
  };
}

// Menambahkan constructor ke objek Window
declare global {
  interface Window {
    SpeechRecognition: {
      new (): SpeechRecognitionInstance;
    };
    webkitSpeechRecognition: {
      new (): SpeechRecognitionInstance;
    };
  }
}

interface Vocab {
  id: string;
  word: string;
  indonesian: string;
  phonetic?: string;
  imageUrl?: string;
  audioUrl?: string;
}

interface TopicItemData {
  id: string;
  title: string;
  sub: string;
  order: number;
  locked?: boolean;
}


// ================= COMPONENT =================

const SayIt: React.FC = () => {
  const navigate = useNavigate();
  const [vocabs, setVocabs] = useState<Vocab[]>([]);
  const [index, setIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [topics, setTopics] = useState<TopicItemData[]>([]);

  // Menggunakan interface yang baru dibuat
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const vocab = vocabs[index];

  const completeSubChapter = async () => {
    try {
      setIsUpdating(true);
      const userId = "2hE606upFBgYTG496dkWhcb1Uy93"; // Gunakan Auth UID asli
      const currentSubId = "personal-info"; // ID sub-chapter saat ini

      // 1. Update sub-chapter saat ini menjadi completed
      const currentRef = doc(
        db,
        "users",
        userId,
        "progress",
        "about-me",
        "sub_chapters",
        currentSubId,
      );

      await updateDoc(currentRef, {
        "activity.sayit.completed": true,
        status: "completed",
        completedAt: new Date(),
      });

      // 2. Cari Sub-chapter berikutnya berdasarkan urutan (order)
      // Mencari index dari sub-chapter yang sekarang sedang dimainkan

      const currentIndex = topics.findIndex((t) => t.id === currentSubId);
      // Note: Pastikan state `vocabs` atau `topics` tersedia di sini
      const nextTopic = vocabs[currentIndex + 1];

      if (nextTopic) {
        // Jika ada topik selanjutnya, buka gemboknya
        const nextSubRef = doc(
          db,
          "users",
          userId,
          "progress",
          "about-me",
          "sub_chapters",
          nextTopic.id, // ID dinamis dari Firestore
        );

        await setDoc(
          nextSubRef,
          {
            status: "unlocked",
            activity: {
              flashcard: { unlocked: true, completed: false },
              matching: { unlocked: false, completed: false },
              quiz: { unlocked: false, completed: false },
              scramble: { unlocked: false, completed: false },
              sayit: { unlocked: false, completed: false },
            },
          },
          { merge: true },
        );

        console.log(`Next sub-chapter unlocked: ${nextTopic.id}`);
      } else {
        console.log("Ini adalah sub-chapter terakhir di chapter ini.");
      }
    } catch (error) {
      console.error("Error updating sequence progress:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Mulai loading di awal
      try {
        // 1. Ambil Data Topics terlebih dahulu
        const topicsQuery = query(
          collection(db, "chapters", "about me", "sub_chapters"),
          orderBy("order", "asc"),
        );
        const topicsSnapshot = await getDocs(topicsQuery);
        const topicsData = topicsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as TopicItemData[];

        // Simpan ke state agar UI terupdate
        setTopics(topicsData);

        // 3. Ambil data Vocabularies berdasarkan ID tertentu
        const subDocRef = doc(
          db,
          "chapters",
          "about me",
          "sub_chapters",
          "personal-info",
        );
        const subDoc = await getDoc(subDocRef);
        const ids = subDoc.data()?.vocab_ids || [];

        if (ids.length === 0) {
          setVocabs([]); // Kosongkan jika tidak ada ID
          return;
        }

        // Firebase 'in' query maksimal 10 IDs (cocok dengan limit(10) kamu)
        const vocabQuery = query(
          collection(db, "vocabularies"),
          where(documentId(), "in", ids),
          limit(10),
        );

        const vocabSnap = await getDocs(vocabQuery);
        const vocabList = vocabSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Vocab[];

        setVocabs(vocabList);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Pastikan dependency array sesuai kebutuhan

  /* ================= SPEECH SETUP ================= */
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
        setIsCorrect(true);
      }
    };

    recognition.onend = () => setIsRecording(false);
    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [vocab]);

  /* ================= ACTIONS ================= */
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

  const playAudio = () => {
    if (!vocab?.audioUrl) return;
    const audio = new Audio(vocab.audioUrl);
    audio.play();
  };

  const nextWord = () => {
    if (index < vocabs.length - 1) {
      setIndex((i) => i + 1);
      setIsCorrect(false);
      setTranscript("");
    } else {
      navigate("/chapters/about-me");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <p className="font-bold text-gray-500 animate-pulse">
          Loading Vocabulary...
        </p>
      </div>
    );
  }

  if (!vocab) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <p className="font-bold text-gray-500">No data found.</p>
      </div>
    );
  }

  const image =
    vocab.imageUrl || `https://placehold.co/400x400?text=vocab-image`;

  return (
    <div className="w-full max-w-md bg-[#FAF9F6] rounded-[40px] shadow-2xl overflow-hidden flex flex-col border border-white">
      {/* HEADER */}
      <div className="px-6 pt-8 pb-4 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-black rounded-full text-white active:scale-90 transition-transform"
        >
          <Pause size={16} fill="currentColor" />
        </button>
        <h2 className="font-black text-[#1E293B] text-lg">Say It!</h2>
        <div className="w-10" />
      </div>

      {/* PROGRESS BAR */}
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

      {/* CARD SECTION */}
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

      {/* QUESTION TEXT */}
      <div className="text-center mb-4 px-6">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
          Terjemahkan ke Bahasa Inggris:
        </span>
        <h1 className="text-4xl font-black text-[#1E293B] mt-1 capitalize">
          {vocab.indonesian}
        </h1>
        {/* {vocab.phonetic && (
            <p className="text-gray-400 font-medium mt-1">[{vocab.phonetic}]</p>
          )} */}

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

      {/* MIC & ACTION */}
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
