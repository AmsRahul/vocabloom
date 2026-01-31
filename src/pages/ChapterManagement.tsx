import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";

import {
  Plus,
  Settings,
  BookOpen,
  Eye,
  Edit2,
  Trash2,
  Home,
  Book,
  Users,
  BarChart3,
  Filter,
  Grid,
} from "lucide-react";
import { Link } from "react-router-dom";

interface Chapter {
  id: string;
  title: string;
  vocabCount: number;
  status: "PUBLISHED" | "DRAFT";
  icon: string;
  order: number;
}

const ChapterManagement = () => {
 const [chapters, setChapters] = useState<Chapter[]>([]);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
   const fetchChapters = async () => {
     try {
       const q = query(collection(db, "chapters"));

       const snapshot = await getDocs(q);

       const data = snapshot.docs.map((doc) => ({
         id: doc.id,
         ...doc.data(),
       })) as Chapter[];

       setChapters(data);
     } catch (error) {
       console.error("Error fetching chapters:", error);
     } finally {
       setLoading(false);
     }
   };

   fetchChapters();
 }, []);

  return (
    <div className="bg-[#FAF9F6] min-h-screen pb-24 font-sans text-slate-800">
      {/* Header */}
      <header className="px-6 py-4 flex justify-between items-center bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-yellow-100 p-2 rounded-xl">
            <Grid className="text-yellow-600" size={24} />
          </div>
          <div>
            <h1 className="font-black text-lg leading-tight">
              Manajemen Chapter
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Teacher Dashboard
            </p>
          </div>
        </div>
        <button className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors">
          <Settings size={20} />
        </button>
      </header>

      <main className="px-6 pt-6">
        {/* Add New Chapter Button */}
        <Link
          to="add"
          className="w-full py-4 bg-[#F5B500] hover:bg-[#E0A600] text-white rounded-[28px] font-black text-lg flex items-center justify-center gap-2 shadow-lg shadow-yellow-200 transition-all active:scale-95 mb-8"
        >
          <div className="bg-white/20 p-1 rounded-full">
            <Plus size={20} strokeWidth={4} />
          </div>
          Tambah Chapter Baru
        </Link>

        {/* List Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-black text-slate-400 uppercase tracking-widest text-xs">
            Daftar Chapter ({chapters.length})
          </h2>
          <button className="text-slate-400">
            <Filter size={18} />
          </button>
        </div>

        {/* Chapter Cards */}
        <div className="flex flex-col gap-6">
          {chapters.map((chapter) => (
            <div
              key={chapter.id}
              className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-50 relative overflow-hidden"
            >
              {/* Status Badge */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-black text-[#F5B500] uppercase tracking-tighter">
                  CHAPTER {chapter.order}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-lg text-[9px] font-black ${
                    chapter.status === "PUBLISHED"
                      ? "bg-green-100 text-green-500"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {chapter.status}
                </span>
              </div>

              {/* Title & Icon */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-black text-slate-800 mb-1">
                    {chapter.title}
                  </h3>
                  <div className="flex items-center gap-2 text-slate-400">
                    <BookOpen size={16} />
                    <span className="text-sm font-bold">
                      {chapter.vocabCount} Vocabulary words
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-2xl shadow-inner">
                  {chapter.icon}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-4">
                <Link to={chapter.id} className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-colors">
                  <Eye size={18} strokeWidth={3} />
                  Detail
                </Link>
                <button className="flex-1 py-3 bg-blue-50 hover:bg-blue-100 text-blue-500 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-colors">
                  <Edit2 size={18} strokeWidth={3} />
                  Edit
                </button>
                <button className="p-3 bg-red-50 hover:bg-red-100 text-red-500 rounded-2xl transition-colors">
                  <Trash2 size={18} strokeWidth={3} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-8 py-3 flex justify-between items-center z-50">
        <button className="flex flex-col items-center gap-1 text-slate-300">
          <Home size={24} />
          <span className="text-[10px] font-bold">Home</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-[#F5B500]">
          <div className="relative">
            <Book size={24} />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#F5B500] rounded-full border-2 border-white"></div>
          </div>
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

export default ChapterManagement;
