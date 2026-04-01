"use client";

import { useEffect, useState } from "react";
import { db, auth } from "../lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  orderBy
} from "firebase/firestore";

export default function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  // 🔥 current user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
    });

    return () => unsubscribe();
  }, []);

  // 🔴 REAL-TIME notifications
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc") // 🔥 newest first
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setNotifications(data);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div style={{ padding: 20, color: "white" }}>
      <h1>🔔 Ειδοποιήσεις</h1>

      {notifications.length === 0 && (
        <p>Δεν υπάρχουν ειδοποιήσεις</p>
      )}

      {notifications.map((n) => (
        <div
          key={n.id}
          onClick={async () => {
            // 🔥 mark as read
            if (!n.read) {
              const ref = doc(db, "notifications", n.id);
              await updateDoc(ref, { read: true });
            }
          }}
          style={{
            marginBottom: 12,
            padding: 12,
            border: "1px solid #444",
            borderRadius: 10,
            background: n.read ? "#111" : "#1f2937", // 🔥 unread πιο φωτεινό
            cursor: "pointer",
            transition: "0.2s"
          }}
        >
          {n.message}
        </div>
      ))}
    </div>
  );
}