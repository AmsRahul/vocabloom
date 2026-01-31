import React from "react";
import * as Accordion from "@radix-ui/react-accordion";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Trophy,
  ChevronDown,
  Lock,
  Link as LinkIcon,
  HelpCircle,
  Mic,
  Type,
  Play,
  User,
  Smile,
  Info,
  LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";

import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { useEffect, useState } from "react";


// --- Interfaces ---
interface TopicItemProps {
  id: string;
  title: string;
  sub: string;
  icon: LucideIcon;
  index: number;
  colorClass: string;
  isLocked?: boolean;
  children?: React.ReactNode;
}
interface TopicItemData {
  id: string;
  title: string;
  sub: string;
  order: number;
  locked?: boolean;
}


interface ActivityCardProps {
  icon: LucideIcon;
  label: string;
  color: "blue" | "orange" | "green" | "purple";
  progress: string;
  to: string;
  isLocked?: boolean; // Tambah ini
}

// --- Sub-Components ---

const AccordionContentInternal = React.forwardRef<
  HTMLDivElement,
  { children: React.ReactNode; [key: string]: any }
>(({ children, ...props }, forwardedRef) => {
  const isOpen = props["data-state"] === "open";

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          ref={forwardedRef}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
          className="overflow-hidden"
          {...props}
        >
          <div className="px-4 pb-4 pt-2">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

AccordionContentInternal.displayName = "AccordionContentInternal";

const TopicItem: React.FC<TopicItemProps> = ({
  id,
  title,
  sub,
  index, // Ambil index dari props
  colorClass,
  isLocked,
  children,
}) => {
  return (
    <Accordion.Item
      value={id}
      disabled={isLocked}
      className={`bg-white rounded-[32px] overflow-hidden shadow-sm border mb-4 transition-all duration-300 ${
        isLocked
          ? "opacity-50 border-gray-100"
          : "border-orange-50 hover:shadow-md"
      }`}
    >
      <Accordion.Header className="flex">
        <Accordion.Trigger className="w-full flex items-center justify-between p-4 group outline-none transition-colors hover:bg-gray-50/50">
          <div className="flex items-center gap-3">
            {/* Bagian Icon diganti dengan Container Nomor */}
            <div
              className={`w-12 h-12 flex items-center justify-center rounded-2xl font-bold text-lg ${colorClass}`}
            >
              {index}
            </div>

            <div className="text-left">
              <h4
                className={`font-black text-sm ${
                  isLocked ? "text-gray-400" : "text-[#1E293B]"
                }`}
              >
                {title}
              </h4>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                {sub}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isLocked && <Lock size={18} className="text-gray-300" />}
            <ChevronDown
              size={24}
              className="text-gray-300 transition-transform duration-500 group-data-[state=open]:rotate-180"
            />
          </div>
        </Accordion.Trigger>
      </Accordion.Header>

      <Accordion.Content forceMount asChild>
        <AccordionContentInternal>{children}</AccordionContentInternal>
      </Accordion.Content>
    </Accordion.Item>
  );
};

const ActivityCard: React.FC<ActivityCardProps> = ({
  icon: Icon,
  label,
  color,
  progress,
  to,
  isLocked, // Ambil prop baru
}) => {
  const colorStyles = {
    blue: {
      bg: "bg-blue-50/50",
      border: "border-blue-100",
      icon: "text-blue-500",
      text: "text-blue-700",
      bar: "bg-blue-500",
    },
    orange: {
      bg: "bg-orange-50/50",
      border: "border-orange-100",
      icon: "text-orange-500",
      text: "text-orange-700",
      bar: "bg-orange-500",
    },
    green: {
      bg: "bg-green-50/50",
      border: "border-green-100",
      icon: "text-green-500",
      text: "text-green-700",
      bar: "bg-green-500",
    },
    purple: {
      bg: "bg-purple-50/50",
      border: "border-purple-100",
      icon: "text-purple-500",
      text: "text-purple-700",
      bar: "bg-purple-500",
    },
  };

  const style = colorStyles[color];

  return (
    <Link
      to={isLocked ? "#" : to}
      onClick={(e) => isLocked && e.preventDefault()}
      className={`${style.bg} ${style.border} block rounded-3xl p-4 border shadow-sm transition-all ${
        isLocked
          ? "opacity-40 grayscale cursor-not-allowed"
          : "active:scale-95 hover:shadow-md"
      }`}
    >
      <div
        className={`flex justify-center mb-2 ${isLocked ? "text-gray-400" : style.icon}`}
      >
        {isLocked ? <Lock size={20} /> : <Icon size={20} />}
      </div>
      <p
        className={`text-[11px] font-black text-center mb-1 ${isLocked ? "text-gray-400" : style.text}`}
      >
        {label}
      </p>
      {/* Progress bar disembunyikan atau di-abu-abu jika terkunci */}
      <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mt-2">
        {!isLocked && (
          <div
            className={`h-full rounded-full ${style.bar}`}
            style={{ width: progress === "100%" ? "100%" : "0%" }}
          ></div>
        )}
      </div>
    </Link>
  );
};

// --- Main Component ---

const ChapterDetail: React.FC = () => {
  const [topics, setTopics] = useState<TopicItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProgress, setUserProgress] = useState<any>({});

  const itemColors = [
    "bg-blue-100 text-blue-500",
    "bg-orange-100 text-orange-500",
    "bg-purple-100 text-purple-500",
    "bg-green-100 text-green-500",
    "bg-pink-100 text-pink-500",
    "bg-yellow-100 text-yellow-600",
  ];


  useEffect(() => {
    const fetchData = async () => {
      try {
        // ambil sub-chapter
        const fetchTopics = async () => {
          try {
            const q = query(
              collection(db, "chapters", "about me", "sub_chapters"),
              orderBy("order", "asc"),
            );

            const snapshot = await getDocs(q);

            const data = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as TopicItemData[];

            setTopics(data);
            console.log(data);
          } catch (err) {
            console.error("Failed to load topics", err);
          } finally {
            setLoading(false);
          }
        };

        fetchTopics();

        // ambil progress user
        const userId = "2hE606upFBgYTG496dkWhcb1Uy93"; // nanti ganti dari auth.currentUser.uid
        const progressSnap = await getDocs(
          collection(
            db,
            "users",
            userId,
            "progress",
            "about-me",
            "sub_chapters",
          ),
        );

        const progressData: any = {};
        progressSnap.forEach((doc) => {
          progressData[doc.id] = doc.data();
        });

        setUserProgress(progressData);
        console.log(progressData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex justify-center p-4 antialiased">
      <div className="w-full max-w-md flex flex-col">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-4">
          <Link
            to="/index"
            className="p-2 hover:bg-white rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </Link>
          <h2 className="font-bold text-gray-800 text-lg">Chapter 1</h2>
          <div className="w-10"></div>
        </div>

        {/* Hero Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative w-full h-44 rounded-[32px] overflow-hidden mb-6 shadow-md"
        >
          <img
            src="/assets/images/chapter-aboutme.webp"
            alt="Classroom"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-6">
            <h1 className="text-white text-3xl font-black">About Me</h1>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-8 px-2">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-extrabold text-gray-800 text-sm">
              Chapter Progress
            </h3>
            <Trophy size={20} className="text-orange-400" />
          </div>
          <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "20%" }}
              transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
              className="bg-orange-500 h-full rounded-full"
            />
          </div>
          <p className="text-right text-xs text-gray-500 mt-2 font-bold">
            1/5 Sections Completed
          </p>
        </div>

        {/* Section Title */}
        <div className="flex justify-between items-center mb-4 px-2">
          <h3 className="font-black text-gray-800 text-xl">Topics</h3>
          <span className="text-[10px] bg-gray-100 px-2 py-1 rounded-md text-gray-500 font-bold">
            5 Parts
          </span>
        </div>

        <Accordion.Root type="single" collapsible className="pb-10">
          {loading ? (
            <div className="text-center py-10">Loading...</div>
          ) : (
            topics.map((topic, index) => {
              // LOGIC PENGECEKAN LOCKING
              const progress = userProgress[topic.id];
              const isTopicUnlocked = progress?.unlocked === true;
              const colorClass = itemColors[index % itemColors.length];

              return (
                <TopicItem
                  key={topic.id}
                  id={topic.id}
                  title={topic.title}
                  sub={topic.sub || ""}
                  index={index + 1}
                  icon={Info}
                  colorClass={colorClass}
                  isLocked={!isTopicUnlocked} // Terkunci jika tidak ada di progress atau unlocked = false
                >
                  {/* Flashcard Logic */}
                  <Link
                    to={
                      progress?.activity?.flashcard?.unlocked
                        ? `/flashcard/${topic.id}`
                        : "#"
                    }
                    className={`flex items-center justify-between bg-orange-50 rounded-3xl p-4 mb-4 border border-orange-100 transition-all ${
                      !progress?.activity?.flashcard?.unlocked
                        ? "opacity-50 grayscale"
                        : "active:scale-95"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-orange-500 rounded-2xl text-white shadow-lg shadow-orange-200">
                        <Play size={20} fill="currentColor" />
                      </div>
                      <div>
                        <h5 className="font-black text-orange-600 text-sm leading-tight">
                          Flashcard <br /> Introduction
                        </h5>
                      </div>
                    </div>
                    {!progress?.activity?.flashcard?.unlocked && (
                      <Lock size={16} className="text-orange-300" />
                    )}
                  </Link>

                  {/* ACTIVITIES GRID */}
                  <div className="grid grid-cols-2 gap-3">
                    <ActivityCard
                      to={`/matching/${topic.id}`}
                      icon={LinkIcon}
                      label="Matching Word"
                      color="blue"
                      progress={
                        progress?.activity?.matching?.completed ? "100%" : "0%"
                      }
                      isLocked={!progress?.activity?.matching?.unlocked}
                    />
                    <ActivityCard
                      to={`/quiz/${topic.id}`}
                      icon={HelpCircle}
                      label="Quiz"
                      color="orange"
                      progress={
                        progress?.activity?.quiz?.completed ? "100%" : "0%"
                      }
                      isLocked={!progress?.activity?.quiz?.unlocked}
                    />
                    <ActivityCard
                      to={`/scrambled/${topic.id}`}
                      icon={Type}
                      label="Scrambled Word"
                      color="purple"
                      progress={
                        progress?.activity?.scrambled?.completed ? "100%" : "0%"
                      }
                      isLocked={!progress?.activity?.scrambled?.unlocked}
                    />
                    <ActivityCard
                      to={`/say-it/${topic.id}`}
                      icon={Mic}
                      label="Say It"
                      color="green"
                      progress={
                        progress?.activity?.sayit?.completed ? "100%" : "0%"
                      }
                      isLocked={!progress?.activity?.sayit?.unlocked}
                    />
                  </div>
                </TopicItem>
              );
            })
          )}
        </Accordion.Root>
      </div>
    </div>
  );
};

export default ChapterDetail;
