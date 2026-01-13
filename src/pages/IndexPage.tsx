import React from "react";
import { Search, Settings, BookOpen, Lock } from "lucide-react"; // Tambahkan Lock
import { Link } from "react-router-dom";

const chapters = [
  {
    id: 1,
    title: "Chapter 1: About Me",
    sub: "Perkenalan, Sapaan & Pronoun",
    img: "/assets/images/chapter-aboutme.webp",
    slug: "aboutme",
  },
  {
    id: 2,
    title: "Chapter 2: Culinary and Me",
    sub: "Makanan, Minuman & Dapur",
    img: "/assets/images/chapter-culinary.webp",
    slug: "culinary",
  },
  {
    id: 3,
    title: "Chapter 3: Home Sweet Home",
    sub: "Ruangan & Perabotan Rumah",
    img: "/assets/images/chapter-home.webp",
    slug: "Home",
  },
  {
    id: 4,
    title: "Chapter 4: My School",
    sub: "Jadwal, Hobi & Kegiatan Luang",
    img: "/assets/images/chapter-myschool.webp",
    slug: "myschool",
  },
  {
    id: 5,
    title: "Chapter 5: This is My World",
    sub: "Hewan & Lingkungan Alam",
    img: "https://img.freepik.com/free-photo/view-wild-lion-nature_23-2150460830.jpg",
    slug: "myworld",
  },
  {
    id: 6,
    title: "Chapter 6: Let’s Clean Up!",
    sub: "Kebersihan & Teks Prosedur",
    img: "https://img.freepik.com/free-vector/waste-management-concept-illustration_114360-8457.jpg",
    slug: "cleanup",
  },
];

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-[#F9F9F9] flex justify-center p-4">
      <div className="w-full max-w-md flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between mb-6 pt-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src="/assets/images/person.webp"
                alt="Avatar"
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Hello, Buddy!</p>
              <h1 className="text-xl font-extrabold text-gray-800">
                Let's Learn!
              </h1>
            </div>
          </div>
          <button className="p-2 bg-white rounded-full shadow-sm border border-gray-100">
            <Settings size={20} className="text-gray-700" />
          </button>
        </header>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
          <input
            type="text"
            placeholder="Search for a chapter..."
            className="w-full bg-white border border-gray-100 rounded-full py-4 pl-12 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>

        {/* Chapters Grid */}
        <div className="grid grid-cols-1 gap-4 pb-10">
          {chapters.map((chapter) => {
            // Logika: Hanya ID 1 yang terbuka
            const isLocked = chapter.id !== 1;

            return (
              <div
                key={chapter.id}
                className={`bg-white rounded-[32px] p-5 flex items-center gap-4 shadow-sm border border-transparent transition-all 
                  ${
                    isLocked
                      ? "opacity-70 cursor-not-allowed"
                      : "hover:border-yellow-200 cursor-pointer group"
                  }`}
              >
                {/* Image Box */}
                <div
                  className={`w-24 h-24 bg-[#FDF5E6] rounded-2xl flex-shrink-0 overflow-hidden flex items-center justify-center p-1 
                  ${isLocked ? "grayscale" : ""}`}
                >
                  <img
                    src={chapter.img}
                    alt={chapter.title}
                    className={`w-full h-full object-cover rounded-xl transition-transform duration-300 
                      ${!isLocked && "group-hover:scale-110"}`}
                  />
                </div>

                {/* Content */}
                {isLocked ? (
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
                        Locked
                      </span>
                    </div>
                  </div>
                ) : (
                  <Link to={`/chapter/${chapter.slug}`} className="flex-1">
                    <h3 className="text-md font-bold text-gray-800 leading-tight mb-1">
                      {chapter.title}
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
                      {chapter.sub}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-[#f4c430]">
                      <BookOpen size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Start Chapter
                      </span>
                    </div>
                  </Link>
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
