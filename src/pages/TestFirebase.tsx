// src/components/VocabularyList.jsx
import React, { useState, useEffect } from "react";
// Impor instance database Anda
import { db } from "../firebase";
// Impor fungsi Firestore yang diperlukan
import { collection, getDocs } from "firebase/firestore";

function VocabularyList() {
  const [vocabularies, setVocabularies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Tambahkan state untuk menangani error

  useEffect(() => {
    const fetchVocab = async () => {
      setLoading(true); // Pastikan loading true saat memulai fetch
      setError(null); // Reset error

      try {
        const vocabulariesCollectionRef = collection(db, "vocabularies");
        console.log(vocabulariesCollectionRef);
        // 2. Ambil semua dokumen (getDocs)
        // Catatan: getDocs mengambil semua data, yang mungkin lambat jika data sangat besar.
        // Untuk data besar, pertimbangkan pagination atau query.
        const querySnapshot = await getDocs(vocabulariesCollectionRef);

        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id, // ID Dokumen Firestore (misalnya 'run')
          ...doc.data(), // Data fields Dokumen: word, indonesian, example, dll.
        }));

        setVocabularies(data);
        setLoading(false);
      } catch (err) {
        // PERBAIKAN 2: Penanganan error yang lebih spesifik
        console.error("Error fetching vocabularies: ", err);
        setError(
          "Gagal mengambil data dari Firestore. Cek koneksi atau Security Rules Anda."
        );
        setLoading(false);
      }
    };

    fetchVocab();
    // PERBAIKAN 3: Gunakan dependency array yang kosong jika memang hanya dijalankan sekali
  }, []);

  // --- JSX Rendering ---

  if (loading) return <div>⏳ Sedang memuat daftar Kosakata...</div>;

  if (error) return <div style={{ color: "red" }}>🛑 {error}</div>;

  // Kasus jika data berhasil diambil tetapi hasilnya kosong
  if (vocabularies.length === 0) {
    return (
      <div>
        Belum ada data kosakata yang dimasukkan ke dalam koleksi 'vocabularies'.
      </div>
    );
  }

  return (
    <div>
      <h2>📚 Master Vocabulary ({vocabularies.length} kata)</h2>
      <ul>
        {vocabularies.map((word) => (
          // PERBAIKAN 4: Tambahkan data lain sesuai struktur yang diinginkan
          <li
            key={word.id}
            style={{
              marginBottom: "15px",
              borderBottom: "1px dotted #ccc",
              paddingBottom: "10px",
            }}
          >
            <p>
              <strong>{word.word}</strong>{" "}
              <small>({word.phonetic || "N/A"})</small>—{" "}
              {word.indonesian || "Tidak Ada Terjemahan"}
            </p>
            <p>
              Contoh: <em>"{word.example}"</em>
            </p>
            <p
              style={{ fontStyle: "italic", fontSize: "0.9em", color: "#555" }}
            >
              Terjemahan Contoh: "{word.exampleTranslate}"
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default VocabularyList;
