import { doc, getDoc, collection, getDocs, query, where, documentId, orderBy } from "firebase/firestore";
import { db } from "./firebase";
import personalInfo from "./data/personal_information.json";
import physicalAppearance from "./data/physical_appearance.json";
import personality from "./data/personality.json";
import hobbies from "./data/hobbies.json";
import feelings from "./data/feelings.json";
import dreams from "./data/dreams.json";
import dailyActivities from "./data/daily_activities.json";
import culinary from "./data/culinary.json";
import animals from "./data/animals.json";

interface LocalVocab {
  word: string;
  phonetic: string;
  indonesian: string;
  example: string;
  exampleTranslate: string;
  topics: string[];
}

interface VocabData {
  id: string;
  word: string;
  indonesian: string;
  phonetic?: string;
  imageUrl?: string;
}

interface TopicItem {
  id: string;
  title: string;
  sub: string;
  order: number;
}

const ALL_LOCAL_VOCAB: LocalVocab[] = [
  ...personalInfo,
  ...physicalAppearance,
  ...personality,
  ...hobbies,
  ...feelings,
  ...dreams,
  ...dailyActivities,
  ...culinary,
  ...animals,
];

const TOPIC_TAG_MAP: Record<string, string[]> = {
  "personal-info": ["personal_information", "physical_appearance", "personality"],
  "greetings": ["personal_information"],
  "pronouns": ["personality"],
  food: ["culinary"],
  drinks: ["culinary"],
  kitchen: ["culinary"],
  rooms: ["daily_activities", "physical_appearance"],
  furniture: ["daily_activities"],
  utensils: ["culinary"],
  schedule: ["daily_activities"],
  hobbies: ["hobbies_and_interests"],
  activities: ["daily_activities", "hobbies_and_interests"],
  animals: ["animals"],
  nature: ["animals"],
  environment: ["animals"],
  cleaning: ["daily_activities"],
  hygiene: ["daily_activities"],
  procedures: ["daily_activities"],
};

const CHAPTER_TAG_MAP: Record<string, string[]> = {
  "about-me": ["personal_information", "physical_appearance", "personality", "feelings_and_emotions", "dreams_and_goals", "daily_activities", "hobbies_and_interests"],
  culinary: ["culinary"],
  home: ["daily_activities", "physical_appearance", "personal_information"],
  myschool: ["daily_activities", "hobbies_and_interests", "personality"],
  myworld: ["animals"],
  cleanup: ["daily_activities"],
};

function getVocabFromLocal(topics: string[]): VocabData[] {
  const seen = new Set<string>();
  return ALL_LOCAL_VOCAB
    .filter((v) => v.topics.some((t) => topics.includes(t)))
    .filter((v) => {
      if (seen.has(v.word.toLowerCase())) return false;
      seen.add(v.word.toLowerCase());
      return true;
    })
    .map((v, i) => ({
      id: `local_${i}`,
      word: v.word,
      indonesian: v.indonesian,
      phonetic: v.phonetic,
    }));
}

function getVocabForTopic(topicId: string): VocabData[] {
  const tags = TOPIC_TAG_MAP[topicId];
  if (!tags) return getVocabFromLocal([]);
  return getVocabFromLocal(tags);
}

function getVocabForChapter(chapterId: string): VocabData[] {
  const tags = CHAPTER_TAG_MAP[chapterId];
  if (!tags) return ALL_LOCAL_VOCAB.map((v, i) => ({
    id: `local_${i}`,
    word: v.word,
    indonesian: v.indonesian,
    phonetic: v.phonetic,
  }));
  return getVocabFromLocal(tags);
}

export async function fetchSubChapterVocabs(chapterId: string, topicId: string): Promise<VocabData[]> {
  try {
    const subDoc = await getDoc(doc(db, `chapters/${chapterId}/sub_chapters/${topicId}`));
    if (!subDoc.exists()) throw new Error("not found");
    const ids: string[] = subDoc.data()?.vocab_ids || [];
    if (ids.length === 0) return [];

    const batchSize = 10;
    const results: VocabData[] = [];
    for (let i = 0; i < ids.length; i += batchSize) {
      const batchIds = ids.slice(i, i + batchSize);
      const vocabQuery = query(
        collection(db, "vocabularies"),
        where(documentId(), "in", batchIds)
      );
      const snapshot = await getDocs(vocabQuery);
      snapshot.docs.forEach((d) => {
        results.push({ id: d.id, ...(d.data() as Omit<VocabData, "id">) });
      });
    }
    return results;
  } catch {
    return getVocabForTopic(topicId);
  }
}

export async function fetchSubChapterTitle(chapterId: string, topicId: string): Promise<string> {
  try {
    const subDoc = await getDoc(doc(db, `chapters/${chapterId}/sub_chapters/${topicId}`));
    return subDoc.data()?.title || topicId;
  } catch {
    const titles: Record<string, string> = {
      "personal-info": "Personal Information",
      greetings: "Greetings",
      pronouns: "Pronouns",
      food: "Food",
      drinks: "Drinks",
      kitchen: "Kitchen",
      rooms: "Rooms",
      furniture: "Furniture",
      utensils: "Utensils",
      schedule: "Schedule",
      hobbies: "Hobbies",
      activities: "Activities",
      animals: "Animals",
      nature: "Nature",
      environment: "Environment",
      cleaning: "Cleaning",
      hygiene: "Hygiene",
      procedures: "Procedures",
    };
    return titles[topicId] || topicId;
  }
}

export async function fetchChapterTopics(chapterId: string): Promise<TopicItem[]> {
  try {
    const q = query(
      collection(db, "chapters", chapterId, "sub_chapters"),
      orderBy("order", "asc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      id: d.id,
      title: d.data().title || d.id,
      sub: d.data().sub || "",
      order: d.data().order || 0,
    }));
  } catch {
    const defaultTopics: Record<string, TopicItem[]> = {
      "about-me": [
        { id: "personal-info", title: "Personal Information", sub: "Introduce yourself", order: 1 },
        { id: "greetings", title: "Greetings", sub: "Say hello", order: 2 },
        { id: "pronouns", title: "Pronouns", sub: "He, she, it", order: 3 },
      ],
      culinary: [
        { id: "food", title: "Food", sub: "Delicious meals", order: 1 },
        { id: "drinks", title: "Drinks", sub: "Beverages", order: 2 },
        { id: "kitchen", title: "Kitchen", sub: "Cooking tools", order: 3 },
      ],
      home: [
        { id: "rooms", title: "Rooms", sub: "Parts of a house", order: 1 },
        { id: "furniture", title: "Furniture", sub: "Home items", order: 2 },
        { id: "utensils", title: "Utensils", sub: "Kitchen tools", order: 3 },
      ],
      myschool: [
        { id: "schedule", title: "Schedule", sub: "Daily timetable", order: 1 },
        { id: "hobbies", title: "Hobbies", sub: "Free time", order: 2 },
        { id: "activities", title: "Activities", sub: "School activities", order: 3 },
      ],
      myworld: [
        { id: "animals", title: "Animals", sub: "Living creatures", order: 1 },
        { id: "nature", title: "Nature", sub: "Natural world", order: 2 },
        { id: "environment", title: "Environment", sub: "Our planet", order: 3 },
      ],
      cleanup: [
        { id: "cleaning", title: "Cleaning", sub: "Keep it clean", order: 1 },
        { id: "hygiene", title: "Hygiene", sub: "Stay healthy", order: 2 },
        { id: "procedures", title: "Procedures", sub: "Step by step", order: 3 },
      ],
    };
    return defaultTopics[chapterId] || [];
  }
}

export async function fetchUserProgressOffline(uid: string, chapterId: string, topicId: string) {
  try {
    const docRef = doc(db, "users", uid, "progress", chapterId, "sub_chapters", topicId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  } catch {
    return null;
  }
}
