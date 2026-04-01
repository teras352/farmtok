"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import VideoCard from "../components/VideoCard";

export default function FeedPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div style={{
        height: "100dvh",
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
        height: "100dvh", // 🔥 FIX
        overflowY: "scroll",
        scrollSnapType: "y mandatory",
        WebkitOverflowScrolling: "touch",
        scrollBehavior: "smooth",
        display: "flex",
        flexDirection: "column",
        background: "black"
      }}
    >
      {videos.map((item) => (
        <div
          key={item.id}
          style={{
            height: "100dvh", // 🔥 κάθε video full screen
            scrollSnapAlign: "start",
            scrollSnapStop: "always"
          }}
        >
          <VideoCard video={item.video} product={item} />
        </div>
      ))}
    </div>
  );
}