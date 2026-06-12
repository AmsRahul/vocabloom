import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

interface UserProgress {
  uid: string;
  name: string;
  email: string;
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: Date | null;
  completedLessons: any[];
  achievements: string[];
  stats: {
    totalQuizzes: number;
    totalCorrect: number;
    totalWrong: number;
    gamesPlayed: number;
  };
}

interface AuthContextType {
  user: User | null;
  userProgress: UserProgress | null;
  loading: boolean;
  refreshProgress: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProgress = async (uid: string) => {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserProgress({
          uid: data.uid,
          name: data.name || "",
          email: data.email || "",
          totalXp: data.totalXp || 0,
          currentStreak: data.currentStreak || 0,
          longestStreak: data.longestStreak || 0,
          lastActiveDate: data.lastActiveDate?.toDate() || null,
          completedLessons: data.completedLessons || [],
          achievements: data.achievements || [],
          stats: data.stats || {
            totalQuizzes: 0,
            totalCorrect: 0,
            totalWrong: 0,
            gamesPlayed: 0,
          },
        });
      }
    } catch (error) {
      console.error("Error fetching user progress:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchUserProgress(firebaseUser.uid);
      } else {
        setUserProgress(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshProgress = async () => {
    if (user) {
      await fetchUserProgress(user.uid);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserProgress(null);
  };

  return (
    <AuthContext.Provider value={{ user, userProgress, loading, refreshProgress, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};