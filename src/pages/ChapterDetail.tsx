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

// --- Interfaces ---
interface TopicItemProps {
  id: string;
  title: string;
  sub: string;
  icon: LucideIcon;
  colorClass: string;
  isLocked?: boolean;
  children?: React.ReactNode;
}

interface ActivityCardProps {
  icon: LucideIcon;
  label: string;
  color: "blue" | "orange" | "green" | "purple";
  progress: string;
  to: string; // Tambahkan prop route tujuan
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
  icon: Icon,
  colorClass,
  isLocked = false,
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
            <div className={`p-3 rounded-2xl ${colorClass}`}>
              <Icon size={24} />
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
      to={to}
      className={`${style.bg} ${style.border} block rounded-3xl p-4 border shadow-sm active:scale-95 transition-transform`}
    >
      <div className={`flex justify-center mb-2 ${style.icon}`}>
        <Icon size={20} />
      </div>
      <p className={`text-[11px] font-black text-center mb-1 ${style.text}`}>
        {label}
      </p>
      <div className="flex justify-between text-[9px] font-bold text-gray-400 mb-1">
        <span>{progress}</span>
        <span>100%</span>
      </div>
      <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${style.bar}`}
          style={{ width: progress === "0/0" ? "0%" : "100%" }}
        ></div>
      </div>
    </Link>
  );
};

// --- Main Component ---

const ChapterDetail: React.FC = () => {
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
            <span className="text-white text-xs font-bold uppercase tracking-wider mb-1">
              Vocabulary Builder
            </span>
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

        <Accordion.Root
          type="single"
          collapsible
          defaultValue="topic-1"
          className="pb-10"
        >
          <TopicItem
            id="topic-1"
            title="Personal Information"
            sub="Informasi Pribadi"
            icon={Info}
            colorClass="bg-blue-100 text-blue-500"
          >
            <Link
              to="/flashcard/personal-info"
              className="flex items-center justify-between bg-orange-50 rounded-3xl p-4 mb-4 border border-orange-100 active:scale-95 transition-transform"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-500 rounded-2xl text-white shadow-lg shadow-orange-200">
                  <Play size={20} fill="currentColor" />
                </div>
                <div>
                  <h5 className="font-black text-orange-600 text-sm leading-tight">
                    Flashcard <br /> Introduction
                  </h5>
                  <p className="text-[10px] text-orange-400 font-bold">
                    Start here to learn new words!
                  </p>
                </div>
              </div>
            </Link>

            <div className="grid grid-cols-2 gap-3">
              <ActivityCard
                to="/matching/personal-info"
                icon={LinkIcon}
                label="Matching Word"
                color="blue"
                progress="5/5"
              />
              <ActivityCard
                to="/quiz/personal-info"
                icon={HelpCircle}
                label="Quiz"
                color="orange"
                progress="10/10"
              />

              <ActivityCard
                to="/scrambled/personal-info"
                icon={Type}
                label="Scrambled Word"
                color="purple"
                progress="8/8"
              />

              <ActivityCard
                to="/sayit/personal-info"
                icon={Mic}
                label="Say It"
                color="green"
                progress="5/5"
              />
            </div>
          </TopicItem>

          <TopicItem
            id="topic-2"
            title="Physical Appearance"
            sub="Penampilan Fisik"
            icon={Smile}
            colorClass="bg-orange-100 text-orange-500"
          >
            <div className="p-4 bg-gray-50 rounded-2xl text-center text-sm text-gray-500 italic">
              New activities coming soon!
            </div>
          </TopicItem>

          <TopicItem
            id="topic-3"
            title="Personality"
            sub="Kepribadian"
            icon={User}
            colorClass="bg-gray-100 text-gray-400"
            isLocked={true}
          />
        </Accordion.Root>
      </div>
    </div>
  );
};

export default ChapterDetail;
