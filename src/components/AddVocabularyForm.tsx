// src/components/AddVocabularyForm.tsx
import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// --- Definisi Tipe ---
interface IVocabulary {
  word: string;
  indonesian: string;
  example: string;
  exampleTranslate: string;
  phonetic: string;
}

// --- State Awal ---
const INITIAL_STATE: IVocabulary = {
  word: "",
  indonesian: "",
  example: "",
  exampleTranslate: "",
  phonetic: "",
};

const AddVocabularyForm: React.FC = () => {
  // Menggunakan IVocabulary untuk mendefinisikan tipe state
  const [formData, setFormData] = useState<IVocabulary>(INITIAL_STATE);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  // Handler untuk memperbarui state
  // Menggunakan tipe React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handler saat formulir disubmit
  // Menggunakan tipe React.FormEvent
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    // Validasi dasar, pastikan 'word' tidak kosong (misalnya)
    if (!formData.word || !formData.indonesian) {
      setMessage('❌ Bidang "Word" dan "Indonesian" wajib diisi.');
      return;
    }

    setLoading(true);
    const vocabCollectionRef = collection(db, "vocabularies");

    try {
      // Data yang akan dimasukkan ke Firestore
      // Kita menambahkan bidang 'createdAt' yang tipenya ditentukan oleh Firestore
      const newWordData = {
        ...formData,
        createdAt: serverTimestamp(),
      };

      // Firestore secara otomatis menangani tipe 'serverTimestamp'
      await addDoc(vocabCollectionRef, newWordData);

      setMessage(`✅ Kata "${formData.word}" berhasil ditambahkan!`);
      setFormData(INITIAL_STATE); // Reset formulir
    } catch (error) {
      // Menggunakan unknown dan Type Guard jika perlu
      let errorMessage = "Gagal menambahkan kata.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error("Error adding document: ", error);
      setMessage(`❌ ${errorMessage}. Cek Security Rules Anda.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        maxWidth: "400px",
      }}
    >
      <h3>➕ Tambah Kosakata Baru</h3>
      <form onSubmit={handleSubmit}>
        {/* Input Word */}
        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="word">Word:</label>
          <input
            type="text"
            id="word"
            name="word"
            value={formData.word}
            onChange={handleChange}
            required
          />
        </div>

        {/* Input Indonesian */}
        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="indonesian">Indonesian:</label>
          <input
            type="text"
            id="indonesian"
            name="indonesian"
            value={formData.indonesian}
            onChange={handleChange}
            required
          />
        </div>

        {/* Input Example */}
        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="example">Example Sentence:</label>
          <input
            type="text"
            id="example"
            name="example"
            value={formData.example}
            onChange={handleChange}
            required
          />
        </div>

        {/* Input Example Translate */}
        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="exampleTranslate">Example Translation:</label>
          <input
            type="text"
            id="exampleTranslate"
            name="exampleTranslate"
            value={formData.exampleTranslate}
            onChange={handleChange}
            required
          />
        </div>

        {/* Input Phonetic */}
        <div style={{ marginBottom: "20px" }}>
          <label htmlFor="phonetic">Phonetic:</label>
          <input
            type="text"
            id="phonetic"
            name="phonetic"
            value={formData.phonetic}
            onChange={handleChange}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Menyimpan..." : "Simpan Kosakata"}
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default AddVocabularyForm;
