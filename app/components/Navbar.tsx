"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db, auth } from "../lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

export default function Navbar() {
  const router = useRouter();
  const [count, setCount] = useState(0);
  const [user, setUser] = useState<any>(null);

  // 🔥 current user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
    });

    return () => unsubscribe();
  }, []);

  // 🔴 REAL-TIME unread notifications
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      where("read", "==", false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCount(snapshot.size);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        width: "100%",
        height: 60,
        background: "black",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        borderTop: "1px solid #333",
        zIndex: 100
      }}
    >
      <button onClick={() => router.push("/")}>🏠</button>

      <button onClick={() => router.push("/upload")}>➕</button>

      <button onClick={() => router.push("/orders")}>📦</button>

      {/* 🔔 NOTIFICATIONS */}
      <div
        style={{ position: "relative", cursor: "pointer" }}
        onClick={() => router.push("/notifications")}
      >
        🔔

        {count > 0 && (
          <span
            style={{
              position: "absolute",
              top: -5,
              right: -10,
              background: "red",
              color: "white",
              borderRadius: "50%",
              padding: "2px 6px",
              fontSize: 12,
              fontWeight: "bold"
            }}
          >
            {count}
          </span>
        )}
      </div>
    </div>
  );
}