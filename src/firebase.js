import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, serverTimestamp, enableIndexedDbPersistence } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAOoITgosv9fu3FFUrwUserp3G1JMkRSG4",
  authDomain: "vocabloom-d8a96.firebaseapp.com",
  projectId: "vocabloom-d8a96",
  storageBucket: "vocabloom-d8a96.firebasestorage.app",
  messagingSenderId: "587085853648",
  appId: "1:587085853648:web:75797897dae8d84e5e7fd5",
  measurementId: "G-V15FBL2X3Q",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);

export const db = getFirestore(app);

const enableOfflinePersistence = async () => {
  try {
    await enableIndexedDbPersistence(db);
    console.log("Firestore offline persistence enabled");
  } catch (err) {
    if (err.code === "failed-precondition") {
      console.warn("Firestore persistence: multiple tabs open, persistence disabled in this tab");
    } else if (err.code === "unimplemented") {
      console.warn("Firestore persistence: browser doesn't support IndexedDB");
    }
  }
};
enableOfflinePersistence();