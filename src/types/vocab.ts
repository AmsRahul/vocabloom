// src/types/vocab.ts
export type Vocab = {
  id: string; // dari firestore doc.id
  word: string;
  phonetic: string;
  indonesian: string;
  example: string;
  exampleTranslate: string;
  topics: string[];
  chapter: string;
};
