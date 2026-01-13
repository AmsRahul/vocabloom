// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAOoITgosv9fu3FFUrwUserp3G1JMkRSG4",
  authDomain: "vocabloom-d8a96.firebaseapp.com",
  projectId: "vocabloom-d8a96",
  storageBucket: "vocabloom-d8a96.firebasestorage.app",
  messagingSenderId: "587085853648",
  appId: "1:587085853648:web:75797897dae8d84e5e7fd5",
  measurementId: "G-V15FBL2X3Q",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);

export const db = getFirestore(app);