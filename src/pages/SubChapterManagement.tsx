import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";

import {
  ChevronLeft,
  MoreHorizontal,
  Plus,
  ArrowUpDown,
  BookText,
  Pencil,
  Trash2,
  Home,
  Book,
  Users,
  BarChart3,
  Languages,
} from "lucide-react";

const SubChapterManagement = () => {
  const { chapterId } = useParams();
  const navigate = useNavigate();

  const [subChapters, setSubChapters] = useState([]);
  const [loading, setLoading] = useState(true);

  /* =========================
     Fetch Sub-Chapters
  ========================= */
  useEffect(() => {
    if (!chapterId) return;

    const fetchSubChapters = async () => {
      try {
        const q = query(
          collection(db, "chapters", chapterId, "sub_chapters"),
          orderBy("order"),
        );

        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setSubChapters(data);
      } catch (error) {
        console.error("Gagal mengambil sub-chapter:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubChapters();
  }, [chapterId]);

  return (
    <div className="bg-[#FAF9F6] min-h-screen pb-24 font-sans text-slate-800">
      {/* ================= Header ================= */}
      <header className="px-6 py-4 flex justify-between items-center bg-white shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-slate-100 rounded-full text-slate-600 active:scale-90 transition-transform"
          >
            <ChevronLeft size={24} strokeWidth={3} />
          </button>
          <div>
            <h1 className="font-black text-lg leading-tight">Sub-Chapter</h1>
            <p className="text-[10px] font-black text-yellow-500 uppercase tracking-wider">
              Chapter ID: {chapterId}
            </p>
          </div>
        </div>
        <button className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200">
          <MoreHorizontal size={20} />
        </button>
      </header>

      {/* ================= Main ================= */}
      <main className="px-6 pt-6">
        {/* Add Sub-Chapter */}
        <Link
          to={`/teacher/chapter/${chapterId}/sub/add`}
          className="w-full py-4 bg-[#F5B500] hover:bg-[#E0A600] text-white rounded-[28px] font-black text-lg flex items-center justify-center gap-2 shadow-lg shadow-yellow-200 transition-all active:scale-95 mb-8"
        >
          <div className="bg-white/20 p-1 rounded-full">
            <Plus size={20} strokeWidth={4} />
          </div>
          Tambah Sub-Chapter Baru
        </Link>

        {/* List Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-black text-slate-400 uppercase tracking-widest text-xs">
            Daftar Sub-Chapter ({subChapters.length})
          </h2>
          <button className="text-slate-400">
            <ArrowUpDown size={18} />
          </button>
        </div>

        {/* ================= List ================= */}
        {loading ? (
          <p className="text-center text-slate-400 font-bold">
            Memuat sub-chapter...
          </p>
        ) : subChapters.length === 0 ? (
          <p className="text-center text-slate-400 font-bold">
            Belum ada sub-chapter
          </p>
        ) : (
          <div className="flex flex-col gap-6">
            {subChapters.map((sub) => (
              <div
                key={sub.id}
                className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-50"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-xl font-black text-slate-800">
                      {sub.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Languages size={14} strokeWidth={3} />
                      <span className="text-sm font-bold">
                        {sub.vocabCount ?? 0} Vocabulary words
                      </span>
                    </div>
                  </div>

                  {/* Icon Placeholder */}
                  <div className="w-14 h-14 bg-yellow-50 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-white/50">
                    📘
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <Link
                    to={`/teacher/chapter/${chapterId}/sub/${sub.id}`}
                    className="flex-[3] py-4 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-2xl font-black text-sm flex items-center justify-center gap-2 border border-slate-100 transition-colors shadow-sm"
                  >
                    <BookText size={18} strokeWidth={3} />
                    Daftar Kata
                  </Link>

                  <button className="flex-1 py-4 bg-blue-50 hover:bg-blue-100 text-blue-500 rounded-2xl flex items-center justify-center transition-colors">
                    <Pencil size={18} strokeWidth={3} />
                  </button>

                  <button className="flex-1 py-4 bg-red-50 hover:bg-red-100 text-red-500 rounded-2xl flex items-center justify-center transition-colors">
                    <Trash2 size={18} strokeWidth={3} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ================= Bottom Nav ================= */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-8 py-3 flex justify-between items-center z-50">
        <button className="flex flex-col items-center gap-1 text-slate-300">
          <Home size={24} />
          <span className="text-[10px] font-bold">Home</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-[#F5B500]">
          <Book size={24} />
          <span className="text-[10px] font-bold">Chapters</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-300">
          <Users size={24} />
          <span className="text-[10px] font-bold">Students</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-300">
          <BarChart3 size={24} />
          <span className="text-[10px] font-bold">Analytics</span>
        </button>
      </nav>
    </div>
  );
};

export default SubChapterManagement;
