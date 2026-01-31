import React, { useState } from "react";
import { ChevronLeft, CheckCircle2, ListOrdered } from "lucide-react";
import { collection, addDoc, serverTimestamp, doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";

const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")       // spasi → -
    // eslint-disable-next-line no-useless-escape
    .replace(/[^\w\-]+/g, "")   // hapus karakter aneh
    // eslint-disable-next-line no-useless-escape
    .replace(/\-\-+/g, "-");    // multiple - → single -


const AddChapterPage = () => {
    const navigate = useNavigate();

    const [judul, setJudul] = useState("");
    const [deskripsi, setDeskripsi] = useState("");
    const [urutan, setUrutan] = useState(""); // State baru untuk urutan
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (loading) return;
        setLoading(true);
        if (!judul.trim()) {
            alert("Judul chapter wajib diisi");
            return;
        }

        if (!urutan) {
            alert("Urutan chapter wajib diisi");
            return;
        }

        try {
            const chapterId = slugify(judul);

            await setDoc(doc(db, "chapters", chapterId), {
              title: judul,
              description: deskripsi,
              order: Number(urutan),
              status: "PUBLISHED", // atau DRAFT
              createdAt: serverTimestamp(),
            });

            alert("Chapter berhasil ditambahkan");

            // reset form
            setJudul("");
            setDeskripsi("");
            setUrutan("");

            navigate("/teacher/chapter");
            
        } catch (error) {
            console.error("Gagal menambahkan chapter:", error);
            alert("Terjadi kesalahan saat menyimpan chapter");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#FAF9F6] min-h-screen flex flex-col font-sans text-slate-800">
            {/* Header */}
            <header className="px-6 py-4 flex items-center gap-4 bg-white shadow-sm">
                <button
                    onClick={() => window.history.back()}
                    className="p-2 bg-slate-100 rounded-full text-slate-600 active:scale-90 transition-transform"
                >
                    <ChevronLeft size={24} strokeWidth={3} />
                </button>
                <div>
                    <h1 className="font-black text-lg leading-tight text-slate-800">
                        Tambah Chapter Baru
                    </h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Manajemen Chapter
                    </p>
                </div>
            </header>

            {/* Form Content */}
            <main className="flex-1 px-6 pt-8 space-y-6 pb-10">
                {/* Input Urutan & Judul (Grup Sampingan) */}
                <div className="">
                    {/* Input Judul */}
                    <div className="space-y-3 flex-1">
                        <label className="block text-sm font-black text-slate-700 ml-1">
                            Judul Chapter
                        </label>
                        <input
                            type="text"
                            value={judul}
                            onChange={(e) => setJudul(e.target.value)}
                            placeholder="My School Activities"
                            className="w-full px-6 py-4 bg-white border-2 border-slate-50 rounded-[24px] shadow-sm focus:border-yellow-400 focus:ring-0 outline-none transition-all placeholder:text-slate-300 font-bold"
                        />
                    </div>
                </div>

                {/* Input Urutan */}
                <div className="space-y-3 w-32">
                    <label className="block text-sm font-black text-slate-700 ml-1">
                        Urutan
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            value={urutan}
                            onChange={(e) => setUrutan(e.target.value)}
                            placeholder="1"
                            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-50 rounded-[24px] shadow-sm focus:border-yellow-400 focus:ring-0 outline-none transition-all font-bold"
                        />
                        <ListOrdered
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                            size={20}
                        />
                    </div>
                </div>

                {/* Input Deskripsi */}
                <div className="space-y-3">
                    <label className="block text-sm font-black text-slate-700 ml-1">
                        Deskripsi Chapter
                    </label>
                    <textarea
                        value={deskripsi}
                        onChange={(e) => setDeskripsi(e.target.value)}
                        placeholder="Berikan deskripsi singkat tentang apa yang akan dipelajari siswa di chapter ini..."
                        rows={6}
                        className="w-full px-6 py-6 bg-white border-2 border-slate-50 rounded-[32px] shadow-sm focus:border-yellow-400 focus:ring-0 outline-none transition-all placeholder:text-slate-300 font-bold resize-none"
                    />
                </div>
            </main>

            {/* Bottom Actions */}
            <footer className="p-6 bg-white border-t border-slate-100 flex gap-4">
                <button className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-[24px] font-black text-base active:scale-95 transition-all">
                    Batal
                </button>
                <button
                    disabled={loading}
                    onClick={handleSubmit}
                    className={`flex-[2] py-4 rounded-[24px] font-black text-base transition-all
                    ${loading ? "bg-slate-300" : "bg-[#F5B500] text-white"}
                `}
                >Simpan Chapter</button>
            </footer>
        </div>
    );
};

export default AddChapterPage;
