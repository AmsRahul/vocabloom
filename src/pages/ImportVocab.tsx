// src/pages/ImportVocab.tsx
import { bulkInsertAnimals } from "../utils/bulkInsertAnimals";

export default function ImportVocab() {
  const handleImport = async () => {
    try {
      await bulkInsertAnimals();
      alert("Import vocabulary berhasil ✅");
    } catch (err) {
      console.error(err);
      alert("Import gagal ❌");
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Import Vocabulary</h2>
      <button onClick={handleImport}>Import Animals Vocabulary</button>
    </div>
  );
}
