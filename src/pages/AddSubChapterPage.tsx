import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { ChevronLeft, Info } from "lucide-react";

/* =========================
   Helper: slugify
========================= */
const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    // eslint-disable-next-line no-useless-escape
    .replace(/[^\w\-]/g, "");

/* =========================
   Component
========================= */
const AddSubChapterPage = () => {
  const { chapterId } = useParams();
  const navigate = useNavigate();

  const [namaSub, setNamaSub] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [order, setOrder] = useState("");
  const [loading, setLoading] = useState(false);

  /* =========================
     Handle Submit
  ========================= */
  const handleSubmit = async () => {
    if (!chapterId) {
      alert("Chapter tidak valid");
      return;
    }

    if (!namaSub || !order) {
      alert("Nama sub-chapter dan urutan wajib diisi");
      return;
    }

    const subChapterId = slugify(namaSub);
    setLoading(true);

    try {
      const ref = doc(db, "chapters", chapterId, "sub_chapters", subChapterId);

      await setDoc(ref, {
        title: namaSub,
        description: deskripsi,
        order: Number(order),
        vocabCount: 0,
        createdAt: serverTimestamp(),
      });

      navigate(`/teacher/chapter/${chapterId}`);
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan sub-chapter");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FAF9F6] min-h-screen flex flex-col font-sans text-slate-800">
      {/* ================= Header ================= */}
      <header className="px-6 py-4 flex items-center gap-4 bg-white shadow-sm sticky top-0 z-50">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-slate-100 rounded-full text-slate-600 active:scale-90 transition-transform"
        >
          <ChevronLeft size={24} strokeWidth={3} />
        </button>
        <div>
          <h1 className="font-black text-lg leading-tight">
            Tambah Sub-Chapter
          </h1>
          <p className="text-[10px] font-black text-yellow-500 uppercase tracking-wider">
            Chapter ID: {chapterId}
          </p>
        </div>
      </header>

      {/* ================= Form ================= */}
      <main className="flex-1 px-6 pt-8 space-y-8">
        {/* Nama Sub-Chapter */}
        <div className="space-y-3">
          <label className="block text-sm font-black text-slate-700 ml-1">
            Nama Sub-Chapter
          </label>
          <input
            type="text"
            value={namaSub}
            onChange={(e) => setNamaSub(e.target.value)}
            placeholder="Misal: Personal Info"
            className="w-full px-6 py-4 bg-white border-2 border-slate-50 rounded-[20px] shadow-sm focus:border-yellow-400 outline-none font-bold"
          />
        </div>

        {/* Urutan */}
        <div className="space-y-3 w-32">
          <label className="block text-sm font-black text-slate-700 ml-1">
            Urutan
          </label>
          <input
            type="number"
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            placeholder="1"
            className="w-full px-6 py-4 bg-white border-2 border-slate-50 rounded-[20px] shadow-sm focus:border-yellow-400 outline-none font-bold"
          />
        </div>

        {/* Deskripsi */}
        <div className="space-y-3">
          <label className="block text-sm font-black text-slate-700 ml-1">
            Deskripsi Singkat
          </label>
          <textarea
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            placeholder="Tuliskan ringkasan materi sub-chapter..."
            rows={5}
            className="w-full px-6 py-6 bg-white border-2 border-slate-50 rounded-[28px] shadow-sm focus:border-yellow-400 outline-none font-bold resize-none"
          />
        </div>

        {/* Info */}
        <div className="bg-yellow-50 border border-yellow-100 rounded-[24px] p-5 flex gap-4 items-start">
          <div className="bg-yellow-400 p-1 rounded-full mt-0.5">
            <Info size={16} className="text-white" />
          </div>
          <p className="text-xs font-bold text-slate-600 leading-relaxed">
            Sub-chapter digunakan untuk mengelompokkan kosa kata agar proses
            drilling (matching, quiz, scrambled, say it) lebih terstruktur.
          </p>
        </div>
      </main>

      {/* ================= Footer ================= */}
      <footer className="p-6">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full py-4 rounded-[24px] font-black transition-all ${
            loading
              ? "bg-slate-300 text-slate-500"
              : "bg-[#F5B500] text-white active:scale-95"
          }`}
        >
          {loading ? "Menyimpan..." : "Simpan Sub-Chapter"}
        </button>
      </footer>
    </div>
  );
};

export default AddSubChapterPage;
