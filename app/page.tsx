"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc
} from "firebase/firestore";
import { db, auth } from "./lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import VideoCard from "./components/VideoCard";

export default function Home() {
  const router = useRouter();

  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isSeller, setIsSeller] = useState(false);

  // 🔥 AUTH + AUTO USER CREATE + ROLE SYSTEM
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setIsSeller(false);

      if (!u) return;

      try {
        const userRef = doc(db, "users", u.uid);
        const userSnap = await getDoc(userRef);

        // 🆕 CREATE USER (ΑΝ ΔΕΝ ΥΠΑΡΧΕΙ)
        if (!userSnap.exists()) {
          console.log("CREATING USER...");

          await setDoc(userRef, {
            email: u.email,
            role: "buyer",
            isSeller: false,
            createdAt: new Date()
          });

          return;
        }

        const data = userSnap.data();

        // 🔄 MIGRATION (παλιό σύστημα → νέο)
        if (data.role === "seller" && !data.isSeller) {
          console.log("MIGRATING USER...");

          await setDoc(
            userRef,
            {
              isSeller: true
            },
            { merge: true }
          );

          setIsSeller(true);
          return;
        }

        // ✅ CHECK SELLER
        if (data.isSeller === true || data.role === "seller") {
          setIsSeller(true);
        }

      } catch (error) {
        console.error("USER ERROR:", error);
      }
    });

    return () => unsubscribe();
  }, []);

  // 🔥 ΓΙΝΕ SELLER
  const becomeSeller = async () => {
    if (!user) {
      alert("Κάνε login πρώτα");
      router.push("/login");
      return;
    }

    try {
      const ref = doc(db, "users", user.uid);

      await setDoc(
        ref,
        {
          role: "seller",
          isSeller: true,
          updatedAt: new Date()
        },
        { merge: true }
      );

      setIsSeller(true);

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
      <div
        style={{
          height: "100vh",
          background: "black",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
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
        background: "black",
      }}
    >
      {/* 🔐 LOGIN BUTTON */}
      {!user && (
        <div
          style={{
            position: "fixed",
            top: 15,
            left: 15,
            zIndex: 9999,
          }}
        >
          <button
            onClick={() => router.push("/login")}
            style={{
              background: "rgba(0,0,0,0.6)",
              color: "white",
              border: "1px solid #333",
              padding: "6px 12px",
              borderRadius: 8,
              fontSize: 12,
              backdropFilter: "blur(5px)",
              cursor: "pointer",
            }}
          >
            🔐 Είσοδος
          </button>
        </div>
      )}

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
          backdropFilter: "blur(5px)",
        }}
      >
        FarmTok 🌱
      </div>

      {/* 🧑‍🌾 SELLER BUTTON */}
      {user && !isSeller && (
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
            cursor: "pointer",
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