import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { X, ChevronLeft, ChevronRight, Volume2 } from "lucide-react";
import { Trophy, CheckCircle2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { completeActivity, unlockNextActivity, XP_REWARDS } from "@/progress";
import { fetchSubChapterVocabs } from "@/dataService";
import HelpModal from "@/components/HelpModal";

type Vocab = {
  id: string;
  word: string;
  indonesian: string;
  phonetic: string;
  imageUrl?: string;
};

const NewWordSession: React.FC = () => {
  const { chapterId, topicId } = useParams<{ chapterId: string; topicId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [vocabs, setVocabs] = useState<Vocab[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [currentImg, setCurrentImg] = useState<string>("");
  const [earnedXp, setEarnedXp] = useState(0);

  const speakWord = useCallback((text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  }, []);

  const fetchPixabayImage = async (word: string) => {
    try {
      const response = await fetch(
        `https://pixabay.com/api/?key=54425160-221f7d912071d99ee9aa423a1&q=${encodeURIComponent(word)}&image_type=illustration&safesearch=true&per_page=3`
      );
      const data = await response.json();
      return data.hits.length > 0 ? data.hits[0].webformatURL : null;
    } catch (error) {
      console.error("Error fetching Pixabay:", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchVocabs = async () => {
      if (!chapterId || !topicId) return;

      try {
        const data = await fetchSubChapterVocabs(chapterId, topicId);
        setVocabs(data as Vocab[]);
      } catch (error) {
        console.error("Error fetching:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVocabs();
  }, [topicId]);

  useEffect(() => {
    if (loading || vocabs.length === 0) return;

    const activeVocab = vocabs[currentIndex];
    if (!activeVocab) return;

    const timer = setTimeout(() => speakWord(activeVocab.word), 500);

    if (activeVocab.imageUrl) {
      setCurrentImg(activeVocab.imageUrl);
    } else {
      fetchPixabayImage(activeVocab.word).then((url) => {
        setCurrentImg(url || `https://placehold.co/600x400?text=${activeVocab.word}`);
      });
    }

    return () => clearTimeout(timer);
  }, [currentIndex, vocabs, speakWord]);

  const handleFinish = async () => {
    if (!user || !chapterId || !topicId) return;

    setLoading(true);
    const xpEarned = await completeActivity(user.uid, chapterId, topicId, "flashcard", 100);
    await unlockNextActivity(user.uid, chapterId, topicId, "flashcard");
    setEarnedXp(xpEarned);
    setLoading(false);
    setIsFinished(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <p className="font-bold text-gray-400 animate-pulse">
          Menyiapkan kartu...
        </p>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm text-center"
        >
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-yellow-200 blur-3xl rounded-full opacity-50" />
            <div className="relative bg-white p-8 rounded-[40px] shadow-xl border-4 border-yellow-400">
              <Trophy
                size={80}
                className="text-yellow-500 mx-auto"
                strokeWidth={1.5}
              />
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
              className="absolute -bottom-2 -right-2 bg-green-500 text-white p-2 rounded-full border-4 border-[#FDFDFB]"
            >
              <CheckCircle2 size={24} />
            </motion.div>
          </div>

          <h2 className="text-3xl font-black text-gray-800 mb-2">
            Luar Biasa!
          </h2>
          <p className="text-gray-500 font-medium mb-4">
            Kamu baru saja mempelajari{" "}
            <span className="text-yellow-600 font-bold">
              {vocabs.length} kata baru
            </span>
          </p>
          {/* <div className="bg-green-50 text-green-600 font-bold text-lg px-4 py-2 rounded-xl inline-block mb-10">
            +{earnedXp || XP_REWARDS.flashcard} XP
          </div> */}

          <div className="space-y-4">
            <button
              onClick={() => navigate(`/matching/${chapterId}/${topicId}`)}
              className="w-full h-16 bg-gray-800 text-white font-black text-lg rounded-3xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl"
            >
              Lanjut ke Matching
              <ArrowRight size={22} />
            </button>

            <button
              onClick={() => navigate(`/chapter/${chapterId}`)}
              className="w-full h-14 bg-white text-gray-400 font-bold text-sm rounded-3xl flex items-center justify-center active:scale-95 transition-all border border-gray-100"
            >
              Kembali ke Menu
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const vocab = vocabs[currentIndex];
  const progress = ((currentIndex + 1) / vocabs.length) * 100;

  const handleNext = async () => {
    if (currentIndex < vocabs.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      await handleFinish();
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 flex justify-center px-4 py-6 antialiased">
      <div className="w-full max-w-sm flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white rounded-full border border-gray-100 shadow-sm active:scale-90 transition-transform"
          >
            <X size={16} />
          </button>

          <div className="text-center">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Flashcard
            </p>
            <h1 className="text-lg font-black text-gray-800">Sesi Belajar</h1>
          </div>

          <HelpModal
            activityName="Flashcard"
            steps={[
              { icon: "1", title: "Lihat Kartu", description: "Amati gambar, kata Inggris, cara baca (fonetik), dan arti dalam Bahasa Indonesia." },
              { icon: "2", title: "Dengarkan", description: "Ketik tombol speaker untuk mendengarkan cara pengucapan kata." },
              { icon: "3", title: "Lanjut", description: "Tekan tombol Next untuk berpindah ke kartu berikutnya. Selesaikan semua kartu untuk menyelesaikan sesi ini." },
            ]}
          />
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-end text-[11px] font-black mb-2">
            <span className="text-gray-400 uppercase tracking-tighter">
              Total Card
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
              <div className="aspect-[4/3] rounded-[30px] overflow-hidden mb-6 bg-gray-50 shadow-inner">
                <img
                  src={currentImg}
                  alt={vocab.word}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="text-center space-y-2">
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

        <div className="flex gap-4">
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
            {currentIndex === vocabs.length - 1 ? "Finish" : "Next"}
            <ChevronRight size={24} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewWordSession;