
import {
  collection,
  query,
  where,
  getDocs,
  writeBatch,
  serverTimestamp,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";


import culinary from "../data/personal_information.json";

export async function bulkInsertAnimals() {

  const vocabRef = collection(db, "vocabularies");
  const topicsRef = collection(db, "topics");

  const batch = writeBatch(db);

  for (const item of culinary) {
    if (!item.word || !item.indonesian) continue;

    const q = query(
      vocabRef,
      where("word", "==", item.word),
      where("indonesian", "==", item.indonesian)
    );

    const snap = await getDocs(q);

    if (!snap.empty) {
      console.log("⏭️ Skip duplicate:", item.word);
      continue;
    }

    const docRef = doc(vocabRef); // ID otomatis

    batch.set(docRef, {
      ...item,
      createdAt: serverTimestamp(),
    });
    if (item.topics && Array.isArray(item.topics)) {
      for (const topicId of item.topics) {
        const topicDocRef = doc(topicsRef, topicId.toLowerCase());

        // Gunakan set merge agar metadata (icon/color) tidak hilang jika sudah ada
        batch.set(
          topicDocRef,
          {
            id: topicId.toLowerCase(),
            name: topicId.charAt(0).toUpperCase() + topicId.slice(1), // Kapitalisasi otomatis
            lastUpdated: serverTimestamp(),
          },
          { merge: true }
        );
      }
    }
  }

  await batch.commit();
  console.log("✅ Bulk insert (anti-duplicate) success");
}
