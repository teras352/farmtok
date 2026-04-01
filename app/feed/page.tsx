"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import VideoCard from "../components/VideoCard";

export default function FeedPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);

  // 🔐 AUTH
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });

    return () => unsubscribe();
  }, []);

  // 👤 GET ROLE
  useEffect(() => {
    if (!user) return;

    const fetchRole = async () => {
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setRole(snap.data().role);
      }
    };

    fetchRole();
  }, [user]);

  // 🔄 FETCH VIDEOS
  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));

        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setVideos(data);
      } catch (error) {
        console.error("FETCH ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 🚀 ΓΙΝΕ SELLER
  const becomeSeller = async () => {
    if (!user) {
      alert("Κάνε login πρώτα");
      return;
    }

    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          role: "seller"
        },
        { merge: true }
      );

      setRole("seller"); // 🔥 instant update UI

      alert("Έγινες πωλητής!");
    } catch (error) {
      console.error(error);
      alert("Σφάλμα");
    }
  };

  // 🔄 LOADING
  if (loading) {
    return (
      <div
        style={{
          height: "100dvh",
          background: "black",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100dvh",
        overflowY: "scroll",
        scrollSnapType: "y mandatory",
        WebkitOverflowScrolling: "touch",
        scrollBehavior: "smooth",
        display: "flex",
        flexDirection: "column",
        background: "black"
      }}
    >
      {/* 🎥 FEED */}
      {videos.map((item) => (
        <div
          key={item.id}
          style={{
            height: "100dvh",
            scrollSnapAlign: "start",
            scrollSnapStop: "always"
          }}
        >
          <VideoCard video={item.video} product={item} />
        </div>
      ))}

      {/* 🚀 SELL BUTTON (μόνο για buyer) */}
      {user && role !== "seller" && (
        <div
          onClick={becomeSeller}
          style={{
            position: "fixed",
            bottom: "calc(80px + env(safe-area-inset-bottom))",
            left: "50%",
            transform: "translateX(-50%)",
            background: "linear-gradient(135deg, #22c55e, #16a34a)",
            padding: "12px 18px",
            borderRadius: 999,
            color: "white",
            fontWeight: "bold",
            fontSize: 14,
            boxShadow: "0 6px 20px rgba(34,197,94,0.4)",
            zIndex: 999,
            cursor: "pointer"
          }}
        >
          Ξεκίνα να πουλάς 🚀
        </div>
      )}
    </div>
  );
}