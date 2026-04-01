"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db, auth } from "./lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import VideoCard from "./components/VideoCard";

export default function Home() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // 🔥 AUTH LISTENER
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      console.log("AUTH USER:", u);
      setUser(u);
    });

    return () => unsubscribe();
  }, []);

  // 🔥 ΓΙΝΕ ΠΑΡΑΓΩΓΟΣ (FIXED)
  const becomeSeller = async () => {
    if (!user) {
      alert("Κάνε login πρώτα");
      return;
    }

    try {
      console.log("UID:", user.uid);

      // 🔥 ΔΥΝΑΤΟ WRITE (overwrite για test)
      await setDoc(doc(db, "users", user.uid), {
        role: "seller",
        updatedAt: new Date(),
        email: user.email
      });

      console.log("✅ UPDATED TO SELLER");

      alert("Έγινες παραγωγός!");
    } catch (error) {
      console.error("❌ ERROR:", error);
      alert("Σφάλμα");
    }
  };

  // 🔥 FETCH PRODUCTS
  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));

        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setVideos(data);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{
        height: "100vh",
        background: "black",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100vh",
        overflowY: "scroll",
        scrollSnapType: "y mandatory",
        WebkitOverflowScrolling: "touch",
        scrollBehavior: "smooth",
        background: "black"
      }}
    >
      {/* 🔝 TOP BAR */}
      <div
        style={{
          position: "fixed",
          top: 0,
          width: "100%",
          textAlign: "center",
          color: "white",
          zIndex: 10,
          padding: 12,
          fontWeight: "bold",
          fontSize: 18,
          background: "rgba(0,0,0,0.3)",
          backdropFilter: "blur(5px)"
        }}
      >
        FarmTok 🌱
      </div>

      {/* 🔥 BUTTON */}
      <button
        onClick={becomeSeller}
        style={{
          position: "fixed",
          top: 60,
          right: 10,
          zIndex: 9999,
          padding: "8px 12px",
          background: "#22c55e",
          color: "white",
          border: "none",
          borderRadius: 8,
          fontSize: 12,
          fontWeight: "bold",
          cursor: "pointer"
        }}
      >
        Γίνε παραγωγός
      </button>

      {/* 🎥 FEED */}
      {videos.map((item) => (
        <div key={item.id} style={{ scrollSnapAlign: "start" }}>
          <VideoCard video={item.video} product={item} />
        </div>
      ))}
    </div>
  );
}