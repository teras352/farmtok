"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
import { db, auth } from "./lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import VideoCard from "./components/VideoCard";

export default function Home() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isSeller, setIsSeller] = useState(false);

  // 🔥 AUTH + ROLE CHECK
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      console.log("AUTH USER:", u);
      setUser(u);

      if (u) {
        try {
          const userRef = doc(db, "users", u.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const data = userSnap.data();
            if (data.role === "seller") {
              setIsSeller(true);
            }
          }
        } catch (error) {
          console.error("ROLE ERROR:", error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // 🔥 ΓΙΝΕ SELLER
  const becomeSeller = async () => {
    if (!user) {
      alert("Κάνε login πρώτα");
      return;
    }

    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          role: "seller",
          email: user.email,
          updatedAt: new Date()
        },
        { merge: true }
      );

      setIsSeller(true); // 🔥 instant UI update

      alert("Τώρα μπορείς να πουλάς 🚀");
    } catch (error) {
      console.error("SELLER ERROR:", error);
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

  // 🔄 LOADING
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

      {/* 🔥 BUTTON (ONLY IF NOT SELLER) */}
      {!isSeller && (
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
          Ξεκίνα να πουλάς 🚀
        </button>
      )}

      {/* 🎥 FEED */}
      {videos.map((item) => (
        <div key={item.id} style={{ scrollSnapAlign: "start" }}>
          <VideoCard video={item.video} product={item} />
        </div>
      ))}
    </div>
  );
}