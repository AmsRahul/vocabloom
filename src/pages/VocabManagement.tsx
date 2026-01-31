import React, { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  Search,
  Plus,
  Pencil,
  Trash2,
  Languages,
  Loader2,
  X,
  Camera,
  Image as ImageIcon,
} from "lucide-react";

import { db } from "../firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  documentId,
  getDocs,
  addDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  deleteDoc,
} from "firebase/firestore";

const VocabManagement = () => {
  // --- KONFIGURASI CLOUDINARY ---
  const CLOUD_NAME = "dycak3ekf";
  const UPLOAD_PRESET = "vocab_upload";

  const [vocabs, setVocabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    word: "",
    indonesian: "",
    example: "",
    exampleTranslate: "",
    phonetic: "",
    imageUrl: "",
  });

  const subChapterPath = "chapters/about me/sub_chapters/personal-info";

  const fetchVocabs = async () => {
    try {
      setLoading(true);
      const subDoc = await getDoc(doc(db, subChapterPath));
      const ids = subDoc.data()?.vocab_ids || [];

      if (ids.length === 0) {
        setVocabs([]);
        return;
      }

      const vocabQuery = query(
        collection(db, "vocabularies"),
        where(documentId(), "in", ids),
      );

      const snapshot = await getDocs(vocabQuery);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const sortedData = ids
        .map((id) => data.find((item) => item.id === id))
        .filter(Boolean);
      setVocabs(sortedData);
    } catch (error) {
      console.error("Error fetching:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVocabs();
  }, []);

  // --- FUNGSI UPLOAD CLOUDINARY ---
  const uploadToCloudinary = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", UPLOAD_PRESET);

    try {
      const resp = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: data,
        },
      );
      const fileData = await resp.json();
      // Gunakan auto-optimization Cloudinary
      return fileData.secure_url.replace(
        "/upload/",
        "/upload/f_auto,q_auto,w_600/",
      );
    } catch (error) {
      console.error("Cloudinary Error:", error);
      throw new Error("Gagal upload gambar");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSaveVocab = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let finalImageUrl = formData.imageUrl;

      if (imageFile) {
        finalImageUrl = await uploadToCloudinary(imageFile);
      }

      const payload = {
        word: formData.word,
        phonetic: formData.phonetic,
        indonesian: formData.indonesian,
        example: formData.example,
        exampleTranslate: formData.exampleTranslate,
        imageUrl: finalImageUrl,
        updatedAt: new Date(),
      };

      if (editingId) {
        await updateDoc(doc(db, "vocabularies", editingId), payload);
      } else {
        const docRef = await addDoc(collection(db, "vocabularies"), {
          ...payload,
          createdAt: new Date(),
        });

        const subChapterRef = doc(db, subChapterPath);
        await updateDoc(subChapterRef, {
          vocab_ids: arrayUnion(docRef.id),
        });
      }

      closeModal();
      fetchVocabs();
    } catch (error) {
      console.error("Error saving:", error);
      alert("Gagal menyimpan data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus kata ini?")) return;

    try {
      const subChapterRef = doc(db, subChapterPath);
      await updateDoc(subChapterRef, { vocab_ids: arrayRemove(id) });
      await deleteDoc(doc(db, "vocabularies", id));
      setVocabs((prev) => prev.filter((v) => v.id !== id));
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Gagal menghapus data.");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ word: "", phonetic: "", example: "", exampleTranslate: "", indonesian: "", imageUrl: "" });
    setImageFile(null);
    setImagePreview(null);
  };

  const openEditModal = (item) => {
    setEditingId(item.id);
    setFormData({
      word: item.word,
      phonetic: item.phonetic || "",
      example: item.example || "",
      exampleTranslate: item.exampleTranslate || "",
      indonesian: item.indonesian,
      imageUrl: item.imageUrl || "",
    });
    setImagePreview(item.imageUrl || null);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-[#FAF9F6] min-h-screen pb-12 font-sans text-slate-800 relative">
      <header className="px-6 py-4 flex justify-between items-center bg-white shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button className="p-2 bg-slate-100 rounded-full text-slate-600 active:scale-90 transition-transform">
            <ChevronLeft size={24} strokeWidth={3} />
          </button>
          <div>
            <h1 className="font-black text-lg leading-tight">
              Manajemen Kosa Kata
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Dashboard Guru
            </p>
          </div>
        </div>
        <button className="p-2 text-slate-500">
          <Search size={24} />
        </button>
      </header>

      <main className="px-6 pt-6">
        <div className="mb-6">
          <p className="text-[11px] font-black text-orange-500 uppercase tracking-widest mb-1">
            Sub-Chapter
          </p>
          <h2 className="text-3xl font-black text-slate-800">
            Personal Information
          </h2>
        </div>

        <button
          onClick={() => {
            closeModal();
            setIsModalOpen(true);
          }}
          className="w-full py-4 bg-[#F79432] hover:bg-[#E67E22] text-white rounded-[28px] font-black text-lg flex items-center justify-center gap-2 shadow-lg shadow-orange-200 transition-all active:scale-95 mb-8"
        >
          <div className="bg-white/20 p-1 rounded-full">
            <Plus size={20} strokeWidth={4} />
          </div>
          Tambah Kosa Kata
        </button>

        <div className="flex flex-col gap-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
              <Loader2 className="animate-spin" size={40} />
              <p className="font-bold">Memuat...</p>
            </div>
          ) : (
            vocabs.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-[28px] p-5 shadow-sm border border-slate-50 flex items-center justify-between animate-in fade-in duration-500"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 overflow-hidden border border-orange-100">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.word}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Languages size={28} strokeWidth={2.5} />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800 leading-tight">
                      {item.word}
                    </h3>
                    <p className="text-xs font-medium text-slate-400 italic mb-1">
                      {item.phonetic || "/.../"}
                    </p>
                    <p className="text-sm font-black text-orange-500">
                      {item.indonesian}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-blue-50 hover:text-blue-500 transition-colors"
                  >
                    <Pencil size={18} strokeWidth={3} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} strokeWidth={3} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* MODAL INPUT */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[32px] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-800">
                {editingId ? "Edit Kata" : "Kata Baru"}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 bg-slate-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveVocab} className="space-y-4">
              {/* PHOTO SELECTOR */}
              <div className="flex flex-col items-center gap-2 mb-4">
                <div
                  onClick={() => fileInputRef.current.click()}
                  className="w-32 h-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[32px] flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group transition-all hover:border-orange-300"
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      className="w-full h-full object-cover"
                      alt="Preview"
                    />
                  ) : (
                    <>
                      <Camera className="text-slate-300 mb-1" size={32} />
                      <span className="text-[10px] font-black text-slate-400 uppercase">
                        Upload Foto
                      </span>
                    </>
                  )}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <ImageIcon className="text-white" />
                  </div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">
                  Kata (English)
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none font-bold"
                  placeholder="e.g. Grateful"
                  value={formData.word}
                  onChange={(e) =>
                    setFormData({ ...formData, word: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">
                  Phonetic
                </label>
                <input
                  type="text"
                  className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none font-bold"
                  placeholder="e.g. /ˈɡreɪtfəl/"
                  value={formData.phonetic}
                  onChange={(e) =>
                    setFormData({ ...formData, phonetic: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">
                  Terjemahan
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none font-bold"
                  placeholder="e.g. Bersyukur"
                  value={formData.indonesian}
                  onChange={(e) =>
                    setFormData({ ...formData, indonesian: e.target.value })
                  }
                />
              </div>
             
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">
                  Example
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none font-bold"
                  placeholder="e.g. My name is Raka"
                  value={formData.example}
                  onChange={(e) =>
                    setFormData({ ...formData, example: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">
                  Arti
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none font-bold"
                  placeholder="e.g. Nama saya Raka"
                  value={formData.exampleTranslate}
                  onChange={(e) =>
                    setFormData({ ...formData, exampleTranslate: e.target.value })
                  }
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-slate-800 text-white rounded-2xl font-black text-lg mt-4 disabled:opacity-50 active:scale-95 transition-all shadow-lg"
              >
                {isSubmitting
                  ? "Menyimpan..."
                  : editingId
                    ? "Perbarui"
                    : "Simpan Kata"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VocabManagement;
