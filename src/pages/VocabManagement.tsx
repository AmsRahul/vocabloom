import React, { useState, useEffect, useRef, useCallback } from "react";
import Cropper from "react-easy-crop";
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

// --- HELPER UNTUK PROSES CROP ---
const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve) => (image.onload = resolve));

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, "image/jpeg");
  });
};
interface Vocabulary {
  id: string;
  createdAt?: { seconds: number; nanoseconds: number };
  word?: string;
  indonesian?: string;
  imageUrl?: string;
  phonetic?: string;
  example?: string;
  exampleTranslate?: string;
}

interface Vocabulary {
  id: string;
  createdAt?: { seconds: number; nanoseconds: number };
  word?: string;
  indonesian?: string;
  imageUrl?: string;
  phonetic?: string;
  example?: string;
  exampleTranslate?: string;
}

const VocabManagement = () => {
  const CLOUD_NAME = "dycak3ekf";
  const UPLOAD_PRESET = "vocab_upload";

  const [vocabs, setVocabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // --- STATE KHUSUS CROPPER ---
  const [tempImage, setTempImage] = useState(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [imageFile, setImageFile] = useState(null); // Ini hasil crop yang akan diupload

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
        where(documentId(), "in", ids.slice(0, 30)),
      );

      const snapshot = await getDocs(vocabQuery);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }) as Vocabulary);

      const sortedByDate = data.sort(
        (a, b) => b.createdAt?.seconds - a.createdAt?.seconds,
      );
      setVocabs(sortedByDate);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVocabs();
  }, []);

  const uploadToCloudinary = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", UPLOAD_PRESET);
    const resp = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: data,
      },
    );
    const fileData = await resp.json();
    return fileData.secure_url.replace(
      "/upload/",
      "/upload/f_auto,q_auto,w_600/",
    );
  };

  // --- HANDLER FOTO ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setTempImage(reader.result);
        setIsCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropSave = useCallback(async () => {
    try {
      const croppedBlob = await getCroppedImg(tempImage, croppedAreaPixels);
      setImageFile(croppedBlob);
      setImagePreview(URL.createObjectURL(croppedBlob));
      setIsCropModalOpen(false);
    } catch (e) {
      console.error(e);
    }
  }, [tempImage, croppedAreaPixels]);

  const handleSaveVocab = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let finalImageUrl = formData.imageUrl;
      if (imageFile) {
        finalImageUrl = await uploadToCloudinary(imageFile);
      }

      const payload = {
        ...formData,
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
        await updateDoc(doc(db, subChapterPath), {
          vocab_ids: arrayUnion(docRef.id),
        });
      }
      closeModal();
      fetchVocabs();
    } catch (error) {
      alert("Gagal menyimpan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      word: "",
      phonetic: "",
      example: "",
      exampleTranslate: "",
      indonesian: "",
      imageUrl: "",
    });
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

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus kata ini?")) return;
    try {
      await updateDoc(doc(db, subChapterPath), { vocab_ids: arrayRemove(id) });
      await deleteDoc(doc(db, "vocabularies", id));
      setVocabs((prev) => prev.filter((v) => v.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="bg-[#FAF9F6] min-h-screen pb-12 font-sans text-slate-800 relative">
      {/* HEADER & MAIN BUTTON (Style Tetap) */}
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
          className="w-full py-4 bg-[#F79432] hover:bg-[#E67E22] text-white rounded-[28px] font-black text-lg flex items-center justify-center gap-2 shadow-lg mb-8 transition-all active:scale-95"
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
                  <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center overflow-hidden border border-orange-100">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Languages
                        className="text-orange-500"
                        size={28}
                        strokeWidth={2.5}
                      />
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
                    className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:text-blue-500 transition-colors"
                  >
                    <Pencil size={18} strokeWidth={3} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} strokeWidth={3} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* MODAL INPUT (Dengan animasi slide-in original) */}
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

              {/* INPUT FIELDS */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">
                  Kata (English)
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 outline-none font-bold focus:ring-2 focus:ring-orange-500"
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
                  className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 outline-none font-bold focus:ring-2 focus:ring-orange-500"
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
                  className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 outline-none font-bold focus:ring-2 focus:ring-orange-500"
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
                  className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 outline-none font-bold focus:ring-2 focus:ring-orange-500"
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
                  className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 outline-none font-bold focus:ring-2 focus:ring-orange-500"
                  value={formData.exampleTranslate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      exampleTranslate: e.target.value,
                    })
                  }
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-slate-800 text-white rounded-2xl font-black text-lg mt-4 shadow-lg disabled:opacity-50 active:scale-95 transition-all"
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

      {/* MODAL CROPPER (Layer Tambahan) */}
      {isCropModalOpen && (
        <div className="fixed inset-0 bg-slate-900/90 z-[60] flex flex-col items-center justify-center p-6 backdrop-blur-md">
          <div className="relative w-full max-w-md aspect-square bg-slate-800 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10">
            <Cropper
              image={tempImage}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
            />
          </div>

          <div className="mt-8 w-full max-w-md flex gap-4">
            <button
              onClick={() => setIsCropModalOpen(false)}
              className="flex-1 py-4 bg-white/10 text-white rounded-2xl font-black hover:bg-white/20 transition-all"
            >
              BATAL
            </button>
            <button
              onClick={onCropSave}
              className="flex-1 py-4 bg-orange-500 text-white rounded-2xl font-black shadow-lg shadow-orange-500/30 active:scale-95 transition-all"
            >
              TERAPKAN
            </button>
          </div>
          <p className="text-white/40 text-[10px] font-bold uppercase mt-4 tracking-widest text-center">
            Geser dan cubit gambar untuk menyesuaikan
          </p>
        </div>
      )}
    </div>
  );
};

export default VocabManagement;
