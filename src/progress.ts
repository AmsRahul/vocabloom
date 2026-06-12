import { doc, updateDoc, getDoc, setDoc, increment, arrayUnion, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export type ActivityType = "flashcard" | "matching" | "quiz" | "scrambled" | "sayit";

export interface ActivityProgress {
  unlocked: boolean;
  completed: boolean;
  score?: number;
  completedAt?: Date;
}

export interface SubChapterProgress {
  unlocked: boolean;
  activity: {
    flashcard: ActivityProgress;
    matching: ActivityProgress;
    quiz: ActivityProgress;
    scrambled: ActivityProgress;
    sayit: ActivityProgress;
  };
  lastActivity?: string;
  updatedAt?: Date;
}

export const XP_REWARDS = {
  flashcard: 10,
  matching: 15,
  quiz: 20,
  scrambled: 15,
  sayit: 15,
};

export const getProgressDoc = (userId: string, chapterId: string, subChapterId: string) => {
  return doc(db, "users", userId, "progress", chapterId, "sub_chapters", subChapterId);
};

export const getChapterProgressDoc = (userId: string, chapterId: string) => {
  return doc(db, "users", userId, "chapter_progress", chapterId);
};

export const getUserStatsDoc = (userId: string) => {
  return doc(db, "users", userId);
};

export const fetchChapterProgress = async (userId: string, chapterId: string) => {
  try {
    const docRef = doc(db, "users", userId, "chapter_progress", chapterId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    console.error("Error fetching chapter progress:", error);
    return null;
  }
};

export const fetchAllChapterProgress = async (userId: string) => {
  try {
    const chapters = ["about-me", "culinary", "home", "myschool", "myworld", "cleanup"];
    const progress: Record<string, SubChapterProgress | null> = {};
    
    for (const chapterId of chapters) {
      progress[chapterId] = await fetchChapterProgress(userId, chapterId);
    }
    return progress;
  } catch (error) {
    console.error("Error fetching all chapter progress:", error);
    return {};
  }
};

export const initializeChapterProgress = async (
  userId: string,
  chapterId: string,
  subChapters: string[]
) => {
  try {
    const batch = subChapters.map((subChapterId, index) => {
      const docRef = getProgressDoc(userId, chapterId, subChapterId);
      return setDoc(docRef, {
        unlocked: index === 0,
        activity: {
          flashcard: { unlocked: index === 0, completed: false },
          matching: { unlocked: false, completed: false },
          quiz: { unlocked: false, completed: false },
          scrambled: { unlocked: false, completed: false },
          sayit: { unlocked: false, completed: false },
        },
        createdAt: serverTimestamp(),
      });
    });
    await Promise.all(batch);
  } catch (error) {
    console.error("Error initializing chapter progress:", error);
  }
};

export const unlockActivity = async (
  userId: string,
  chapterId: string,
  subChapterId: string,
  activity: ActivityType
) => {
  try {
    const docRef = getProgressDoc(userId, chapterId, subChapterId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      await updateDoc(docRef, {
        [`activity.${activity}.unlocked`]: true,
        lastActivity: activity,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(docRef, {
        activity: {
          [activity]: {
            unlocked: true,
          },
        },
        lastActivity: activity,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error("Error unlocking activity:", error);
  }
};

export const completeActivity = async (
  userId: string,
  chapterId: string,
  subChapterId: string,
  activity: ActivityType,
  score: number = 100
) => {
  try {
    const docRef = getProgressDoc(userId, chapterId, subChapterId);
    const currentXp = XP_REWARDS[activity];
    
    await setDoc(docRef, {
      activity: {
        [activity]: {
          completed: true,
          score,
          completedAt: serverTimestamp(),
          unlocked: true,
        },
      },
      lastActivity: activity,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    await updateDoc(getUserStatsDoc(userId), {
      totalXp: increment(currentXp),
      [`stats.${activity}Completed`]: increment(1),
    });

    return currentXp;
  } catch (error) {
    console.error("Error completing activity:", error);
    return 0;
  }
};

export const unlockNextActivity = async (
  userId: string,
  chapterId: string,
  subChapterId: string,
  currentActivity: ActivityType
) => {
  const activityOrder: ActivityType[] = ["flashcard", "matching", "quiz", "scrambled", "sayit"];
  const currentIndex = activityOrder.indexOf(currentActivity);
  
  if (currentIndex < activityOrder.length - 1) {
    const nextActivity = activityOrder[currentIndex + 1];
    await unlockActivity(userId, chapterId, subChapterId, nextActivity);
    return nextActivity;
  }
  return null;
};

export const checkActivityAccess = async (
  userId: string,
  chapterId: string,
  subChapterId: string,
  requiredActivity: ActivityType
): Promise<boolean> => {
  try {
    const docRef = doc(db, "users", userId, "progress", chapterId, "sub_chapters", subChapterId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return requiredActivity === "flashcard";
    
    const data = docSnap.data();
    const activityOrder: ActivityType[] = ["flashcard", "matching", "quiz", "scrambled", "sayit"];
    const requiredIndex = activityOrder.indexOf(requiredActivity);
    
    if (requiredIndex === 0) return true;
    
    const prevActivity = activityOrder[requiredIndex - 1];
    const isPrevCompleted = data.activity?.[prevActivity]?.completed === true;
    const isCurrentUnlocked = data.activity?.[requiredActivity]?.unlocked === true;
    
    return isPrevCompleted || isCurrentUnlocked;
  } catch (error) {
    console.error("Error checking activity access:", error);
    return requiredActivity === "flashcard";
  }
};

export const isAllActivitiesCompleted = (progress: SubChapterProgress) => {
  const activities = Object.values(progress.activity);
  return activities.every((a) => a.completed);
};

export const getCompletedActivitiesCount = (progress: SubChapterProgress) => {
  return Object.values(progress.activity).filter((a) => a.completed).length;
};

export const getChapterCompletionPercentage = async (
  userId: string,
  chapterId: string,
  totalSubChapters: number
) => {
  try {
    let completedCount = 0;
    
    for (let i = 0; i < totalSubChapters; i++) {
      const docRef = doc(db, "users", userId, "progress", chapterId, "sub_chapters", `sub_${i + 1}`);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (isAllActivitiesCompleted(data)) {
          completedCount++;
        }
      }
    }
    
    return Math.round((completedCount / totalSubChapters) * 100);
  } catch (error) {
    console.error("Error calculating chapter completion:", error);
    return 0;
  }
};

export const recordGameScore = async (
  userId: string,
  activityType: ActivityType,
  correct: number,
  wrong: number,
  xpEarned: number
) => {
  try {
    await updateDoc(getUserStatsDoc(userId), {
      totalXp: increment(xpEarned),
      [`stats.totalGames`]: increment(1),
      [`stats.totalCorrect`]: increment(correct),
      [`stats.totalWrong`]: increment(wrong),
      lastActiveDate: serverTimestamp(),
      completedLessons: arrayUnion({
        type: activityType,
        correct,
        wrong,
        xpEarned,
        date: new Date().toISOString(),
      }),
    });
  } catch (error) {
    console.error("Error recording game score:", error);
  }
};

export const checkAndUnlockNextSubChapter = async (
  userId: string,
  chapterId: string,
  currentSubChapterId: string,
  allSubChapterIds: string[]
) => {
  const currentIndex = allSubChapterIds.indexOf(currentSubChapterId);
  
  if (currentIndex < allSubChapterIds.length - 1) {
    const nextSubChapterId = allSubChapterIds[currentIndex + 1];
    const nextDocRef = getProgressDoc(userId, chapterId, nextSubChapterId);
    
    const nextSnap = await getDoc(nextDocRef);
    if (!nextSnap.exists()) {
      await setDoc(nextDocRef, {
        unlocked: true,
        activity: {
          flashcard: { unlocked: true, completed: false },
          matching: { unlocked: false, completed: false },
          quiz: { unlocked: false, completed: false },
          scrambled: { unlocked: false, completed: false },
          sayit: { unlocked: false, completed: false },
        },
        createdAt: serverTimestamp(),
      });
    } else {
      await updateDoc(nextDocRef, { unlocked: true });
    }
    return nextSubChapterId;
  }
  return null;
};