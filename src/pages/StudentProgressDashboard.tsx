import { useEffect, useState } from "react";
import { collection, getDocs, query, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Users, Trophy, Zap, BarChart3, Home, Book, Search, ChevronDown, ChevronRight, Target } from "lucide-react";
import { Link } from "react-router-dom";

interface StudentData {
  uid: string;
  name: string;
  email: string;
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  achievements: string[];
  stats: {
    totalQuizzes: number;
    totalCorrect: number;
    totalWrong: number;
    gamesPlayed: number;
  };
}

interface ChapterProgressInfo {
  chapterId: string;
  chapterTitle: string;
  totalSubChapters: number;
  completedSubChapters: number;
  percentage: number;
}

const CHAPTERS = [
  { id: "about-me", title: "About Me", subs: ["personal-info", "greetings", "pronouns"] },
  { id: "culinary", title: "Culinary and Me", subs: ["food", "drinks", "kitchen"] },
  { id: "home", title: "Home Sweet Home", subs: ["rooms", "furniture", "utensils"] },
  { id: "myschool", title: "My School", subs: ["schedule", "hobbies", "activities"] },
  { id: "myworld", title: "This is My World", subs: ["animals", "nature", "environment"] },
  { id: "cleanup", title: "Let's Clean Up!", subs: ["cleaning", "hygiene", "procedures"] },
];

const StudentProgressDashboard = () => {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
  const [chapterProgress, setChapterProgress] = useState<Record<string, ChapterProgressInfo[]>>({});
  const [loadingProgress, setLoadingProgress] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const q = query(collection(db, "users"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs
          .map((doc) => ({
            uid: doc.id,
            ...doc.data(),
          })) as StudentData[];
        setStudents(data);
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const fetchChapterProgress = async (uid: string) => {
    setLoadingProgress(uid);
    try {
      const chapterData: ChapterProgressInfo[] = [];

      for (const chapter of CHAPTERS) {
        let completedCount = 0;
        for (const subId of chapter.subs) {
          const subDocRef = doc(db, "users", uid, "progress", chapter.id, "sub_chapters", subId);
          const subSnap = await getDoc(subDocRef);
          if (subSnap.exists()) {
            const subData = subSnap.data();
            const activity = subData.activity || {};
            const allDone = ["flashcard", "matching", "quiz", "scrambled", "sayit"].every(
              (act) => activity[act]?.completed === true
            );
            if (allDone) completedCount++;
          }
        }

        chapterData.push({
          chapterId: chapter.id,
          chapterTitle: chapter.title,
          totalSubChapters: chapter.subs.length,
          completedSubChapters: completedCount,
          percentage: Math.round((completedCount / chapter.subs.length) * 100),
        });
      }

      setChapterProgress((prev) => ({ ...prev, [uid]: chapterData }));
    } catch (error) {
      console.error("Error fetching chapter progress:", error);
    } finally {
      setLoadingProgress(null);
    }
  };

  const toggleExpand = (uid: string) => {
    if (expandedStudent === uid) {
      setExpandedStudent(null);
    } else {
      setExpandedStudent(uid);
      if (!chapterProgress[uid]) {
        fetchChapterProgress(uid);
      }
    }
  };

  const getOverallProgress = (student: StudentData): number => {
    const progress = chapterProgress[student.uid];
    if (!progress) return 0;
    const totalSubs = progress.reduce((sum, ch) => sum + ch.totalSubChapters, 0);
    const completedSubs = progress.reduce((sum, ch) => sum + ch.completedSubChapters, 0);
    return totalSubs > 0 ? Math.round((completedSubs / totalSubs) * 100) : 0;
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-[#FAF9F6] min-h-screen pb-24 font-sans text-slate-800">
      {/* Header */}
      <header className="px-6 py-4 flex justify-between items-center bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 p-2 rounded-xl">
            <Users className="text-purple-600" size={24} />
          </div>
          <div>
            <h1 className="font-black text-lg leading-tight">
              Student Progress
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Teacher Dashboard
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400">
            {students.length} students
          </span>
        </div>
      </header>

      <main className="px-6 pt-6">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
          <input
            type="text"
            placeholder="Search students by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-100 rounded-full py-4 pl-12 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300 font-bold text-sm"
          />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-50">
            <div className="bg-blue-50 w-9 h-9 rounded-xl flex items-center justify-center mb-2">
              <Users size={18} className="text-blue-500" />
            </div>
            <p className="text-2xl font-black text-slate-800">{students.length}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Students</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-50">
            <div className="bg-yellow-50 w-9 h-9 rounded-xl flex items-center justify-center mb-2">
              <Trophy size={18} className="text-yellow-500" />
            </div>
            <p className="text-2xl font-black text-slate-800">
              {students.reduce((sum, s) => sum + (s.totalXp || 0), 0)}
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total XP</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-50">
            <div className="bg-green-50 w-9 h-9 rounded-xl flex items-center justify-center mb-2">
              <Zap size={18} className="text-green-500" />
            </div>
            <p className="text-2xl font-black text-slate-800">
              {students.reduce((sum, s) => sum + (s.stats?.gamesPlayed || 0), 0)}
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Games</p>
          </div>
        </div>

        {/* Student List */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-black text-slate-400 uppercase tracking-widest text-xs">
            All Students ({filteredStudents.length})
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-purple-200 border-t-purple-500 rounded-full" />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredStudents.map((student) => (
              <div key={student.uid} className="bg-white rounded-[32px] shadow-sm border border-slate-50 overflow-hidden">
                {/* Student Card Header */}
                <button
                  onClick={() => toggleExpand(student.uid)}
                  className="w-full p-5 flex items-center gap-4 text-left hover:bg-slate-50/50 transition-colors"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-50 rounded-full flex items-center justify-center text-xl font-black text-purple-600 shadow-inner flex-shrink-0">
                    {(student.name || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-black text-slate-800 truncate">
                      {student.name || "Unknown"}
                    </h3>
                    <p className="text-xs font-bold text-slate-400 truncate">
                      {student.email || ""}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="flex items-center gap-1 text-[10px] font-bold text-yellow-500">
                        <Trophy size={12} /> {student.totalXp || 0} XP
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-bold text-orange-500">
                        <Zap size={12} /> {student.currentStreak || 0} day streak
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-bold text-blue-500">
                        <Target size={12} /> {student.stats?.gamesPlayed || 0} games
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-lg font-black text-purple-500">
                        {chapterProgress[student.uid] ? getOverallProgress(student) + "%" : "—"}
                      </div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Overall</div>
                    </div>
                    {expandedStudent === student.uid ? (
                      <ChevronDown size={20} className="text-slate-300 flex-shrink-0" />
                    ) : (
                      <ChevronRight size={20} className="text-slate-300 flex-shrink-0" />
                    )}
                  </div>
                </button>

                {/* Expanded Chapter Progress */}
                {expandedStudent === student.uid && (
                  <div className="px-5 pb-5 border-t border-slate-50">
                    {loadingProgress === student.uid ? (
                      <div className="flex justify-center py-6">
                        <div className="animate-spin w-6 h-6 border-4 border-purple-200 border-t-purple-500 rounded-full" />
                      </div>
                    ) : (
                      <div className="pt-4 space-y-3">
                        {chapterProgress[student.uid]?.map((ch) => (
                          <div key={ch.chapterId} className="flex items-center gap-3">
                            <div className="flex-1">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-black text-slate-600 truncate">
                                  {ch.chapterTitle}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400">
                                  {ch.completedSubChapters}/{ch.totalSubChapters}
                                </span>
                              </div>
                              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    ch.percentage === 100
                                      ? "bg-green-500"
                                      : ch.percentage > 0
                                      ? "bg-yellow-500"
                                      : "bg-slate-200"
                                  }`}
                                  style={{ width: `${ch.percentage}%` }}
                                />
                              </div>
                            </div>
                            <span className={`text-xs font-black min-w-[40px] text-right ${
                              ch.percentage === 100 ? "text-green-500" : "text-slate-400"
                            }`}>
                              {ch.percentage}%
                            </span>
                          </div>
                        ))}
                        {(!chapterProgress[student.uid] || chapterProgress[student.uid].length === 0) && (
                          <p className="text-center text-sm font-bold text-slate-400 py-4">
                            No progress data available
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            {filteredStudents.length === 0 && (
              <div className="text-center py-20">
                <Users size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-lg font-black text-slate-400">No students found</p>
                <p className="text-sm font-bold text-slate-300">Try a different search term</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-8 py-3 flex justify-between items-center z-50">
        <Link
          to="/teacher/chapter"
          className="flex flex-col items-center gap-1 text-slate-300 hover:text-slate-500 transition-colors"
        >
          <Home size={24} />
          <span className="text-[10px] font-bold">Home</span>
        </Link>
        <Link
          to="/teacher/chapter"
          className="flex flex-col items-center gap-1 text-slate-300 hover:text-slate-500 transition-colors"
        >
          <Book size={24} />
          <span className="text-[10px] font-bold">Chapters</span>
        </Link>
        <button className="flex flex-col items-center gap-1 text-purple-500">
          <div className="relative">
            <Users size={24} />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full border-2 border-white"></div>
          </div>
          <span className="text-[10px] font-bold">Students</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-300">
          <BarChart3 size={24} />
          <span className="text-[10px] font-bold">Analytics</span>
        </button>
      </nav>
    </div>
  );
};

export default StudentProgressDashboard;
