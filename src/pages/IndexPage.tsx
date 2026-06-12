import { useEffect, useState } from "react";
import { Search, BookOpen, Lock, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut, User } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { fetchAllChapterProgress, isAllActivitiesCompleted, SubChapterProgress } from "../progress";

interface Chapter {
  id: number;
  title: string;
  sub: string;
  img: string;
  slug: string;
  firestoreId: string;
  subChapters: string[];
}

const CHAPTERS: Chapter[] = [
  {
    id: 1,
    title: "Chapter 1: About Me",
    sub: "Perkenalan, Sapaan & Pronoun",
    img: "/assets/images/chapter-aboutme.webp",
    slug: "about me",
    firestoreId: "about-me",
    subChapters: ["personal-info", "greetings", "pronouns"],
  },
  {
    id: 2,
    title: "Chapter 2: Culinary and Me",
    sub: "Makanan, Minuman & Dapur",
    img: "/assets/images/chapter-culinary.webp",
    slug: "culinary",
    firestoreId: "culinary",
    subChapters: ["food", "drinks", "kitchen"],
  },
  {
    id: 3,
    title: "Chapter 3: Home Sweet Home",
    sub: "Ruangan & Perabotan Rumah",
    img: "/assets/images/chapter-home.webp",
    slug: "home",
    firestoreId: "home",
    subChapters: ["rooms", "furniture", "utensils"],
  },
  {
    id: 4,
    title: "Chapter 4: My School",
    sub: "Jadwal, Hobi & Kegiatan Luang",
    img: "/assets/images/chapter-myschool.webp",
    slug: "myschool",
    firestoreId: "myschool",
    subChapters: ["schedule", "hobbies", "activities"],
  },
  {
    id: 5,
    title: "Chapter 5: This is My World",
    sub: "Hewan & Lingkungan Alam",
    img: "https://img.freepik.com/free-photo/view-wild-lion-nature_23-2150460830.jpg",
    slug: "myworld",
    firestoreId: "myworld",
    subChapters: ["animals", "nature", "environment"],
  },
  {
    id: 6,
    title: "Chapter 6: Let's Clean Up!",
    sub: "Kebersihan & Teks Prosedur",
    img: "https://img.freepik.com/free-vector/waste-management-concept-illustration_114360-8457.jpg",
    slug: "cleanup",
    firestoreId: "cleanup",
    subChapters: ["cleaning", "hygiene", "procedures"],
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [chapterProgress, setChapterProgress] = useState<Record<string, SubChapterProgress | null>>({});
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(getAuth());
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadChapterProgress = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const allProgress = await fetchAllChapterProgress(user.uid);
        setChapterProgress(allProgress);
      } catch (error) {
        console.error("Error loading chapter progress:", error);
      } finally {
        setLoading(false);
      }
    };

    loadChapterProgress();
  }, [user]);

  const isChapterUnlocked = (chapter: Chapter) => {
    if (chapter.id === 1) return true;
    const prevChapter = CHAPTERS[chapter.id - 2];
    const prevProgress = chapterProgress[prevChapter.firestoreId];

    if (!prevProgress) return false;
    return isAllActivitiesCompleted(prevProgress);
  };

  const getChapterProgress = (chapter: Chapter) => {
    const progress = chapterProgress[chapter.firestoreId];
    if (!progress) return 0;

    let completed = 0;
    chapter.subChapters.forEach((subId) => {
      const subProgress = progress[subId];
      if (subProgress && isAllActivitiesCompleted(subProgress)) {
        completed++;
      }
    });

    return Math.round((completed / chapter.subChapters.length) * 100);
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex justify-center p-4">
      <div className="w-full max-w-md flex flex-col">
        <header className="flex items-center justify-between mb-6 pt-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src="/assets/images/person.webp"
                alt="Avatar"
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">
                Hello, {user?.displayName || "Guest"}!
              </p>
              <h1 className="text-xl font-extrabold text-gray-800">
                Let's Learn!
              </h1>
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 bg-white rounded-full shadow-sm border border-gray-100"
            >
              <LogOut size={20} className="text-gray-700" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-2 min-w-[140px] z-50">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
          <input
            type="text"
            placeholder="Search for a chapter..."
            className="w-full bg-white border border-gray-100 rounded-full py-4 pl-12 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 pb-10">
          {CHAPTERS.map((chapter) => {
            const isUnlocked = isChapterUnlocked(chapter);
            const progress = getChapterProgress(chapter);

            return (
              <div
                key={chapter.id}
                className={`bg-white rounded-[32px] p-5 flex items-center gap-4 shadow-sm border border-transparent transition-all 
                  ${!isUnlocked ? "opacity-70 cursor-not-allowed" : "hover:border-yellow-200 cursor-pointer group"}`}
              >
                <div
                  className={`w-24 h-24 bg-[#FDF5E6] rounded-2xl flex-shrink-0 overflow-hidden flex items-center justify-center p-1 
                    ${!isUnlocked ? "grayscale" : ""}`}
                >
                  <img
                    src={chapter.img}
                    alt={chapter.title}
                    className={`w-full h-full object-cover rounded-xl transition-transform duration-300 ${!isUnlocked ? "" : "group-hover:scale-110"}`}
                  />
                </div>

                {isUnlocked ? (
                  <Link to={`/chapter/${chapter.slug}`} className="flex-1">
                    <h3 className="text-md font-bold text-gray-800 leading-tight mb-1">
                      {chapter.title}
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
                      {chapter.sub}
                    </p>
                    {progress > 0 && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {progress}% completed
                        </p>
                      </div>
                    )}
                    <div className="flex items-center gap-1 mt-2 text-[#f4c430]">
                      <BookOpen size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        {progress > 0 ? "Continue" : "Start Chapter"}
                      </span>
                    </div>
                  </Link>
                ) : (
                  <div className="flex-1">
                    <h3 className="text-md font-bold text-gray-400 leading-tight mb-1">
                      {chapter.title}
                    </h3>
                    <p className="text-xs text-gray-300 leading-relaxed line-clamp-2">
                      {chapter.sub}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-gray-300">
                      <Lock size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Locked - Complete previous chapter
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;