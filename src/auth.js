import { auth, db } from "./firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export const handleRegister = async (email, password, nama) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;
    await updateProfile(user, {
      displayName: nama,
    });

    // 2. Simpan Data Profil ke Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      name: nama,
      email: email,
      totalXp: 0,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    });

    return user;
  } catch (error) {
    throw error; // Lempar error untuk ditangani di UI
  }
};

import { signInWithEmailAndPassword } from "firebase/auth";

export const handleLogin = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};