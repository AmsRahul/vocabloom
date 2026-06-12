import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, updateDoc, serverTimestamp, increment } from "firebase/firestore";

export const getFirebaseErrorMessage = (error) => {
  const errorCodes = {
    "auth/user-not-found": "Akun tidak ditemukan. Periksa email Anda.",
    "auth/wrong-password": "Password salah. Coba lagi.",
    "auth/invalid-email": "Format email tidak valid.",
    "auth/email-already-in-use": "Email sudah terdaftar. Gunakan email lain.",
    "auth/weak-password": "Password minimal 6 karakter.",
    "auth/invalid-credential": "Email atau password salah.",
    "auth/too-many-requests": "Terlalu banyak percobaan. Coba lagi nanti.",
    "auth/network-request-failed": "Koneksi internet bermasalah.",
    "auth/invalid-api-key": "Konfigurasi aplikasi bermasalah.",
  };
  return errorCodes[error.code] || "Terjadi kesalahan. Coba lagi.";
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  if (password.length < 6) {
    return "Password minimal 6 karakter";
  }
  return null;
};

export const handleRegister = async (email, password, name) => {
  if (!email || !password || !name) {
    throw { code: "auth/required-fields", message: "Semua field wajib diisi" };
  }

  if (!validateEmail(email)) {
    throw { code: "auth/invalid-email", message: "Format email tidak valid" };
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    throw { code: "auth/weak-password", message: passwordError };
  }

  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  await updateProfile(user, { displayName: name });

  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    name,
    email,
    totalXp: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: null,
    completedLessons: [],
    achievements: [],
    stats: {
      totalQuizzes: 0,
      totalCorrect: 0,
      totalWrong: 0,
      gamesPlayed: 0,
    },
    createdAt: serverTimestamp(),
    lastLogin: serverTimestamp(),
  });

  return user;
};

export const handleLogin = async (email, password) => {
  if (!email || !password) {
    throw { code: "auth/required-fields", message: "Email dan password wajib diisi" };
  }

  const userCredential = await signInWithEmailAndPassword(auth, email, password);

  await updateDoc(doc(db, "users", userCredential.user.uid), {
    lastLogin: serverTimestamp(),
  });

  return userCredential.user;
};

export const getUserProgress = async (uid) => {
  const { doc, getDoc } = await import("firebase/firestore");
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
};

export const updateUserProgress = async (uid, updates) => {
  const { doc, updateDoc } = await import("firebase/firestore");
  await updateDoc(doc(db, "users", uid), updates);
};

export const addXp = async (uid, amount) => {
  const { doc, updateDoc, increment } = await import("firebase/firestore");
  await updateDoc(doc(db, "users", uid), {
    totalXp: increment(amount),
  });
};

export const recordGameScore = async (uid, correct, wrong, gameType) => {
  const { doc, updateDoc, arrayUnion, increment, serverTimestamp } = await import("firebase/firestore");
  await updateDoc(doc(db, "users", uid), {
    "stats.totalQuizzes": increment(1),
    "stats.totalCorrect": increment(correct),
    "stats.totalWrong": increment(wrong),
    "stats.gamesPlayed": increment(1),
    completedLessons: arrayUnion({
      gameType,
      correct,
      wrong,
      date: new Date().toISOString(),
    }),
    lastActiveDate: serverTimestamp(),
  });
};

export const updateStreak = async (uid) => {
  const { doc, getDoc, updateDoc, serverTimestamp } = await import("firebase/firestore");
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return;

  const userData = docSnap.data();
  const today = new Date().toDateString();
  const lastActive = userData.lastActiveDate?.toDate().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  let newStreak = userData.currentStreak || 0;

  if (lastActive === today) {
    return;
  } else if (lastActive === yesterday) {
    newStreak += 1;
  } else {
    newStreak = 1;
  }

  const longestStreak = Math.max(newStreak, userData.longestStreak || 0);

  await updateDoc(docRef, {
    currentStreak: newStreak,
    longestStreak,
    lastActiveDate: serverTimestamp(),
  });
};