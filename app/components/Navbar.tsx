"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db, auth } from "../lib/firebase";
import { collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function Navbar() {
  const router = useRouter();

  const [count, setCount] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);

  // 🔐 AUTH
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });

    return () => unsubscribe();
  }, []);

  // 👤 FETCH ROLE
  useEffect(() => {
    if (!user) return;

    const getRole = async () => {
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setRole(snap.data().role);
      }
    };

    getRole();
  }, [user]);

  // 🔔 NOTIFICATIONS
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

  // 🚪 LOGOUT
  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        width: "100%",
        height: "calc(60px + env(safe-area-inset-bottom))",
        paddingBottom: "env(safe-area-inset-bottom)",
        background: "black",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        borderTop: "1px solid #333",
        zIndex: 1000
      }}
    >
      {/* 🏠 HOME */}
      <button onClick={() => router.push("/")}>🏠</button>

      {/* ➕ ONLY SELLER */}
      {role === "seller" && (
        <button onClick={() => router.push("/upload")}>
          ➕
        </button>
      )}

      {/* 📦 ORDERS */}
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
              fontSize: 11,
              fontWeight: "bold"
            }}
          >
            {count}
          </span>
        )}
      </div>

      {/* 🔐 LOGIN / LOGOUT */}
      {!user ? (
        <button onClick={() => router.push("/login")}>🔐</button>
      ) : (
        <button onClick={handleLogout}>🚪</button>
      )}
    </div>
  );
}