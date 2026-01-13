export interface VocabularyWord {
  id: string;
  english: string;
  indonesian: string;
  pronunciation: string;
  example: string;
  exampleTranslation: string;
  category: string;
  difficulty: 'mudah' | 'sedang' | 'sulit';
  synonyms?: string[];
}

export interface VocabularySet {
  id: string;
  title: string;
  description: string;
  icon: string;
  words: VocabularyWord[];
  totalPoints: number;
}

export const vocabularySets: VocabularySet[] = [
  {
    id: 'daily-life',
    title: 'Kehidupan Sehari-hari',
    description: 'Kata-kata yang sering digunakan dalam aktivitas harian',
    icon: '🌅',
    totalPoints: 100,
    words: [
      {
        id: '1',
        english: 'Adventure',
        indonesian: 'Petualangan',
        pronunciation: '/ədˈventʃər/',
        example: 'Life is an adventure waiting to happen.',
        exampleTranslation: 'Hidup adalah petualangan yang menunggu untuk terjadi.',
        category: 'Kehidupan',
        difficulty: 'sedang',
        synonyms: ['Journey', 'Quest'],
      },
      {
        id: '2',
        english: 'Breathe',
        indonesian: 'Bernapas',
        pronunciation: '/briːð/',
        example: 'Take a moment to breathe deeply.',
        exampleTranslation: 'Luangkan waktu sejenak untuk bernapas dalam-dalam.',
        category: 'Kehidupan',
        difficulty: 'mudah',
      },
      {
        id: '3',
        english: 'Grateful',
        indonesian: 'Bersyukur',
        pronunciation: '/ˈɡreɪtfəl/',
        example: 'I am grateful for your help.',
        exampleTranslation: 'Saya bersyukur atas bantuan Anda.',
        category: 'Perasaan',
        difficulty: 'sedang',
        synonyms: ['Thankful', 'Appreciative'],
      },
      {
        id: '4',
        english: 'Accomplish',
        indonesian: 'Mencapai',
        pronunciation: '/əˈkɒmplɪʃ/',
        example: 'She accomplished her goals.',
        exampleTranslation: 'Dia mencapai tujuannya.',
        category: 'Kehidupan',
        difficulty: 'sedang',
        synonyms: ['Achieve', 'Complete'],
      },
      {
        id: '5',
        english: 'Curious',
        indonesian: 'Penasaran',
        pronunciation: '/ˈkjʊəriəs/',
        example: 'Children are naturally curious.',
        exampleTranslation: 'Anak-anak secara alami penasaran.',
        category: 'Perasaan',
        difficulty: 'mudah',
      },
    ],
  },
  {
    id: 'school',
    title: 'Kehidupan Sekolah',
    description: 'Kosakata untuk aktivitas dan lingkungan sekolah',
    icon: '📚',
    totalPoints: 100,
    words: [
      {
        id: '6',
        english: 'Assignment',
        indonesian: 'Tugas',
        pronunciation: '/əˈsaɪnmənt/',
        example: 'The assignment is due tomorrow.',
        exampleTranslation: 'Tugas harus dikumpulkan besok.',
        category: 'Sekolah',
        difficulty: 'mudah',
      },
      {
        id: '7',
        english: 'Concentrate',
        indonesian: 'Berkonsentrasi',
        pronunciation: '/ˈkɒnsəntreɪt/',
        example: 'Please concentrate on your work.',
        exampleTranslation: 'Tolong berkonsentrasi pada pekerjaanmu.',
        category: 'Sekolah',
        difficulty: 'sedang',
        synonyms: ['Focus', 'Attention'],
      },
      {
        id: '8',
        english: 'Examination',
        indonesian: 'Ujian',
        pronunciation: '/ɪɡˌzæmɪˈneɪʃən/',
        example: 'The final examination is next week.',
        exampleTranslation: 'Ujian akhir minggu depan.',
        category: 'Sekolah',
        difficulty: 'sedang',
        synonyms: ['Test', 'Exam'],
      },
      {
        id: '9',
        english: 'Knowledge',
        indonesian: 'Pengetahuan',
        pronunciation: '/ˈnɒlɪdʒ/',
        example: 'Knowledge is power.',
        exampleTranslation: 'Pengetahuan adalah kekuatan.',
        category: 'Sekolah',
        difficulty: 'mudah',
      },
      {
        id: '10',
        english: 'Research',
        indonesian: 'Penelitian',
        pronunciation: '/rɪˈsɜːtʃ/',
        example: 'We need to do more research.',
        exampleTranslation: 'Kita perlu melakukan lebih banyak penelitian.',
        category: 'Sekolah',
        difficulty: 'sedang',
      },
    ],
  },
  {
    id: 'emotions',
    title: 'Emosi & Perasaan',
    description: 'Ekspresikan perasaanmu dalam Bahasa Inggris',
    icon: '💭',
    totalPoints: 100,
    words: [
      {
        id: '11',
        english: 'Anxious',
        indonesian: 'Cemas',
        pronunciation: '/ˈæŋkʃəs/',
        example: 'I feel anxious about the test.',
        exampleTranslation: 'Saya merasa cemas tentang ujian.',
        category: 'Emosi',
        difficulty: 'sedang',
        synonyms: ['Worried', 'Nervous'],
      },
      {
        id: '12',
        english: 'Delighted',
        indonesian: 'Gembira',
        pronunciation: '/dɪˈlaɪtɪd/',
        example: 'I am delighted to meet you.',
        exampleTranslation: 'Saya gembira bertemu denganmu.',
        category: 'Emosi',
        difficulty: 'sedang',
        synonyms: ['Happy', 'Pleased'],
      },
      {
        id: '13',
        english: 'Frustrated',
        indonesian: 'Frustrasi',
        pronunciation: '/frʌˈstreɪtɪd/',
        example: 'He was frustrated by the delay.',
        exampleTranslation: 'Dia frustrasi karena penundaan.',
        category: 'Emosi',
        difficulty: 'sedang',
      },
      {
        id: '14',
        english: 'Overwhelmed',
        indonesian: 'Kewalahan',
        pronunciation: '/ˌoʊvərˈwelmd/',
        example: 'She felt overwhelmed with work.',
        exampleTranslation: 'Dia merasa kewalahan dengan pekerjaan.',
        category: 'Emosi',
        difficulty: 'sulit',
      },
      {
        id: '15',
        english: 'Confident',
        indonesian: 'Percaya diri',
        pronunciation: '/ˈkɒnfɪdənt/',
        example: 'Be confident in yourself.',
        exampleTranslation: 'Percaya dirilah pada dirimu sendiri.',
        category: 'Emosi',
        difficulty: 'mudah',
      },
    ],
  },
];

export const badges = [
  { id: 'first-quiz', name: 'Pemula', icon: '🌟', description: 'Selesaikan kuis pertamamu', requirement: 1 },
  { id: 'streak-3', name: 'Rajin', icon: '🔥', description: 'Latihan 3 hari berturut-turut', requirement: 3 },
  { id: 'perfect-score', name: 'Sempurna', icon: '💎', description: 'Dapatkan skor sempurna', requirement: 100 },
  { id: 'word-master', name: 'Ahli Kata', icon: '📖', description: 'Pelajari 50 kata baru', requirement: 50 },
  { id: 'pronunciation', name: 'Fasih', icon: '🎤', description: 'Selesaikan 10 latihan pengucapan', requirement: 10 },
];
