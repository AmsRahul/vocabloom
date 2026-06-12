import React, { useEffect, useState } from "react";
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
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { collection, getDocs, query, orderBy, getDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

interface TopicItem {
  id: string;
  title: string;
  sub: string;
  order: number;
}

interface SubChapterProgress {
  activity: {
    flashcard: { completed: boolean; unlocked: boolean };
    matching: { completed: boolean; unlocked: boolean };
    quiz: { completed: boolean; unlocked: boolean };
    scrambled: { completed: boolean; unlocked: boolean };
    sayit: { completed: boolean; unlocked: boolean };
  };
}

const ChapterDetail: React.FC = () => {
  const { chapterId } = useParams<{ chapterId: string }>();
  const { user } = useAuth();
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [progress, setProgress] = useState<Record<string, SubChapterProgress>>({});
  const [loading, setLoading] = useState(true);

  const itemColors = [
    "bg-blue-100 text-blue-500",
    "bg-orange-100 text-orange-500",
    "bg-purple-100 text-purple-500",
    "bg-green-100 text-green-500",
    "bg-pink-100 text-pink-500",
    "bg-yellow-100 text-yellow-600",
  ];

  const chapterPath = chapterId;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(
          collection(db, "chapters", chapterPath, "sub_chapters"),
          orderBy("order", "asc")
        );
        const snapshot = await getDocs(q);
        const topicData: TopicItem[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          title: doc.data().title || doc.id,
          sub: doc.data().sub || "",
          order: doc.data().order || 0,
        }));
        setTopics(topicData);

        if (user) {
          const progressData: Record<string, SubChapterProgress> = {};
          for (const topic of topicData) {
            const docRef = doc(db, "users", user.uid, "progress", chapterPath, "sub_chapters", topic.id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              progressData[topic.id] = docSnap.data() as SubChapterProgress;
            }
          }
          setProgress(progressData);
        }
      } catch (err) {
        console.error("Failed to load data", err);
        setTopics([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [chapterId, user, chapterPath]);

  const getActivityStatus = (topicIndex: number, activity: string) => {
    const topic = topics[topicIndex];
    if (!topic) return { locked: true, completed: false };

    const topicProgress = progress[topic.id];

    if (topicIndex > 0) {
      const prevTopic = topics[topicIndex - 1];
      if (!prevTopic) return { locked: true, completed: false };
      const prevProgress = progress[prevTopic.id];
      if (!prevProgress?.activity?.sayit?.completed) {
        return { locked: true, completed: false };
      }
    }

    if (activity === "flashcard") return { locked: false, completed: topicProgress?.activity?.flashcard?.completed || false };
    if (activity === "matching") return { locked: !topicProgress?.activity?.flashcard?.completed, completed: topicProgress?.activity?.matching?.completed || false };
    if (activity === "quiz") return { locked: !topicProgress?.activity?.matching?.completed, completed: topicProgress?.activity?.quiz?.completed || false };
    if (activity === "scrambled") return { locked: !topicProgress?.activity?.quiz?.completed, completed: topicProgress?.activity?.scrambled?.completed || false };
    if (activity === "sayit") return { locked: !topicProgress?.activity?.scrambled?.completed, completed: topicProgress?.activity?.sayit?.completed || false };

    return { locked: true, completed: false };
  };

  const isTopicUnlocked = (index: number) => {
    if (index === 0) return true;
    const prevTopic = topics[index - 1];
    if (!prevTopic) return false;
    return !!progress[prevTopic.id]?.activity?.sayit?.completed;
  };

  const calculateProgress = () => {
    let completed = 0;
    let total = 0;
    topics.forEach((topic, index) => {
      const statuses = [
        getActivityStatus(index, "flashcard"),
        getActivityStatus(index, "matching"),
        getActivityStatus(index, "quiz"),
        getActivityStatus(index, "scrambled"),
        getActivityStatus(index, "sayit"),
      ];
      statuses.forEach(s => {
        if (s.completed) completed++;
        total++;
      });
    });
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex justify-center p-4 antialiased">
      <div className="w-full max-w-md flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <Link to="/index" className="p-2 hover:bg-white rounded-full transition-colors">
            <ArrowLeft size={24} className="text-gray-600" />
          </Link>
          <h2 className="font-bold text-gray-800 text-lg">Chapter 1</h2>
          <div className="w-10" />
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative w-full h-44 rounded-[32px] overflow-hidden mb-6 shadow-md"
        >
          <img src="/assets/images/chapter-aboutme.webp" alt="Classroom" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-6">
            <h1 className="text-white text-3xl font-black">About Me</h1>
          </div>
        </motion.div>

        <div className="mb-8 px-2">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-extrabold text-gray-800 text-sm">Chapter Progress</h3>
            <Trophy size={20} className="text-orange-400" />
          </div>
          <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${calculateProgress()}%` }}
              className="bg-orange-500 h-full rounded-full"
            />
          </div>
          <p className="text-right text-xs text-gray-500 mt-2 font-bold">
            {Object.values(progress).filter(p => Object.values(p.activity).some(a => a.completed)).length}/{topics.length} Topics Completed
          </p>
        </div>

        <div className="flex justify-between items-center mb-4 px-2">
          <h3 className="font-black text-gray-800 text-xl">Topics</h3>
          <span className="text-[10px] bg-gray-100 px-2 py-1 rounded-md text-gray-500 font-bold">
            {topics.length} Parts
          </span>
        </div>

        <Accordion.Root type="single" collapsible className="pb-10">
          {loading ? (
            <div className="text-center py-10 animate-pulse">Loading...</div>
          ) : topics.length === 0 ? (
            <div className="text-center py-10 text-gray-400">No topics available</div>
          ) : (
            topics.map((topic, index) => {
              const colorClass = itemColors[index % itemColors.length];

              return (
                <TopicItemComponent
                  key={topic.id}
                  chapterId={chapterPath}
                  id={topic.id}
                  title={topic.title}
                  sub={topic.sub}
                  index={index + 1}
                  colorClass={colorClass}
                  isLocked={!isTopicUnlocked(index)}
                  getActivityStatus={(activity) => getActivityStatus(index, activity)}
                />
              );
            })
          )}
        </Accordion.Root>
      </div>
    </div>
  );
};

const AccordionContentInternal = React.forwardRef<
  HTMLDivElement,
  { children: React.ReactNode;[key: string]: unknown }
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

interface TopicItemProps {
  chapterId: string;
  id: string;
  title: string;
  sub: string;
  index: number;
  colorClass: string;
  isLocked: boolean;
  getActivityStatus: (activity: string) => { locked: boolean; completed: boolean };
}

const TopicItemComponent: React.FC<TopicItemProps> = ({
  chapterId,
  id,
  title,
  sub,
  index,
  colorClass,
  isLocked,
  getActivityStatus,
}) => {
  const flashcardStatus = getActivityStatus("flashcard");
  const matchingStatus = getActivityStatus("matching");
  const quizStatus = getActivityStatus("quiz");
  const scrambledStatus = getActivityStatus("scrambled");
  const sayitStatus = getActivityStatus("sayit");

  return (
    <Accordion.Item value={id} disabled={isLocked}>
      <Accordion.Header>
        <Accordion.Trigger className="w-full flex items-center justify-between p-4 group outline-none transition-colors hover:bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 flex items-center justify-center rounded-2xl font-bold text-lg ${colorClass}`}>
              {index}
            </div>
            <div className="text-left">
              <h4 className={`font-black text-sm ${isLocked ? "text-gray-400" : "text-[#1E293B]"}`}>
                {title}
              </h4>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{sub}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isLocked && <Lock size={18} className="text-gray-300" />}
            <ChevronDown size={24} className="text-gray-300 transition-transform duration-500 group-data-[state=open]:rotate-180" />
          </div>
        </Accordion.Trigger>
      </Accordion.Header>

      <Accordion.Content forceMount asChild>
        <AccordionContentInternal>
          <Link
            to={!flashcardStatus.locked ? `/flashcard/${chapterId}/${id}` : "#"}
            className={`flex items-center justify-between bg-orange-50 rounded-3xl p-4 mb-4 border border-orange-100 transition-all ${!flashcardStatus.locked ? "active:scale-95" : "opacity-50 grayscale"
              }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-500 rounded-2xl text-white shadow-lg shadow-orange-200">
                {flashcardStatus.completed ? <CheckCircle2 size={20} /> : <Play size={20} fill="currentColor" />}
              </div>
              <div>
                <h5 className="font-black text-orange-600 text-sm leading-tight">Flashcard</h5>
                <p className="text-[10px] text-orange-400 font-bold">
                  {flashcardStatus.completed ? "Completed" : "Start Learning"}
                </p>
              </div>
            </div>
            {!flashcardStatus.completed && <ChevronRight size={16} className="text-orange-300" />}
          </Link>

          <div className="grid grid-cols-2 gap-3">
            <ActivityCard
              to={!matchingStatus.locked ? `/matching/${chapterId}/${id}` : "#"}
              icon={LinkIcon}
              label="Matching"
              color="blue"
              isLocked={matchingStatus.locked}
              isCompleted={matchingStatus.completed}
            />
            <ActivityCard
              to={!quizStatus.locked ? `/quiz/${chapterId}/${id}` : "#"}
              icon={HelpCircle}
              label="Quiz"
              color="orange"
              isLocked={quizStatus.locked}
              isCompleted={quizStatus.completed}
            />
            <ActivityCard
              to={!scrambledStatus.locked ? `/scrambled/${chapterId}/${id}` : "#"}
              icon={Type}
              label="Scrambled"
              color="purple"
              isLocked={scrambledStatus.locked}
              isCompleted={scrambledStatus.completed}
            />
            <ActivityCard
              to={!sayitStatus.locked ? `/say-it/${chapterId}/${id}` : "#"}
              icon={Mic}
              label="Say It"
              color="green"
              isLocked={sayitStatus.locked}
              isCompleted={sayitStatus.completed}
            />
          </div>
        </AccordionContentInternal>
      </Accordion.Content>
    </Accordion.Item>
  );
};

interface ActivityCardProps {
  icon: React.ElementType;
  label: string;
  color: "blue" | "orange" | "green" | "purple";
  to: string;
  isLocked: boolean;
  isCompleted: boolean;
}

const ActivityCard: React.FC<ActivityCardProps> = ({
  icon: Icon,
  label,
  color,
  to,
  isLocked,
  isCompleted,
}) => {
  const colorStyles = {
    blue: { bg: "bg-blue-50/50", border: "border-blue-100", icon: "text-blue-500", text: "text-blue-700", bar: "bg-blue-500" },
    orange: { bg: "bg-orange-50/50", border: "border-orange-100", icon: "text-orange-500", text: "text-orange-700", bar: "bg-orange-500" },
    green: { bg: "bg-green-50/50", border: "border-green-100", icon: "text-green-500", text: "text-green-700", bar: "bg-green-500" },
    purple: { bg: "bg-purple-50/50", border: "border-purple-100", icon: "text-purple-500", text: "text-purple-700", bar: "bg-purple-500" },
  };

  const style = colorStyles[color];

  return (
    <Link
      to={isLocked ? "#" : to}
      onClick={(e) => isLocked && e.preventDefault()}
      className={`${style.bg} ${style.border} block rounded-3xl p-4 border shadow-sm transition-all ${isLocked ? "opacity-40 grayscale cursor-not-allowed" : "active:scale-95 hover:shadow-md"
        }`}
    >
      <div className={`flex justify-center mb-2 ${isLocked ? "text-gray-400" : style.icon}`}>
        {isLocked ? <Lock size={20} /> : isCompleted ? <CheckCircle2 size={20} /> : <Icon size={20} />}
      </div>
      <p className={`text-[11px] font-black text-center mb-1 ${isLocked ? "text-gray-400" : style.text}`}>
        {label}
      </p>
      <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mt-2">
        {isCompleted && <div className={`h-full rounded-full ${style.bar}`} style={{ width: "100%" }} />}
      </div>
    </Link>
  );
};

export default ChapterDetail;