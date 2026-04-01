import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getMessaging } from "firebase/messaging";

// 🔑 Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCwDs1YKfflROZE6fBzDUrCC-NM0WgnKiU",
  authDomain: "farmtok2-df99e.firebaseapp.com",
  projectId: "farmtok2-df99e",
  storageBucket: "farmtok2-df99e.firebasestorage.app",
  messagingSenderId: "1039287951392",
  appId: "1:1039287951392:web:df9a11db1d4c60c41a1c45"
};

// 🔥 Initialize
const app = initializeApp(firebaseConfig);

// 🔥 Services
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

// 🔔 Messaging (για push notifications)
// ⚠️ μόνο σε browser (όχι server)
export const messaging =
  typeof window !== "undefined" ? getMessaging(app) : null;