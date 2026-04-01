"use client";

import { useState, useRef, useEffect } from "react";
import { FaHeart, FaCommentDots, FaShare } from "react-icons/fa";
import { db, auth } from "../lib/firebase";
import { collection, addDoc } from "firebase/firestore";

type Product = {
  id?: string;
  name: string;
  price: number;
  userId?: string;
};

type Props = {
  video: string;
  product: Product;
};

export default function VideoCard({ video, product }: Props) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(12);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleLike = () => {
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
  };

  // 🎥 AUTO PLAY / PAUSE (TikTok style)
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoEl.play().catch(() => {});
        } else {
          videoEl.pause();
        }
      },
      { threshold: 0.8 }
    );

    observer.observe(videoEl);

    return () => {
      observer.unobserve(videoEl);
    };
  }, []);

  return (
    <div
      style={{
        height: "100dvh", // 🔥 FIX MOBILE
        position: "relative",
        overflow: "hidden",
        background: "black",
        color: "white"
      }}
    >
      {/* 🎥 VIDEO */}
      <video
        ref={videoRef}
        src={video}
        loop
        muted
        playsInline
        preload="metadata"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          pointerEvents: "none" // 🔥 important για scroll
        }}
      />

      {/* 🌑 GRADIENT */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          height: "45%",
          background:
            "linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.3), transparent)"
        }}
      />

      {/* 📦 PRODUCT INFO */}
      <div
        style={{
          position: "absolute",
          bottom: "calc(60px + env(safe-area-inset-bottom))",
          left: 15,
          background: "rgba(0,0,0,0.6)",
          padding: "8px 10px",
          borderRadius: 10,
          backdropFilter: "blur(8px)",
          maxWidth: "55%",
          zIndex: 5
        }}
      >
        <h2 style={{ fontSize: 14, margin: 0 }}>
          {product.name}
        </h2>

        <p style={{ fontSize: 12, opacity: 0.8, margin: 0 }}>
          {product.price}€
        </p>

        <button
          onClick={async () => {
            if (!auth.currentUser) {
              alert("Κάνε login πρώτα");
              return;
            }

            // 🚫 μην αγοράζεις δικό σου προϊόν
            if (product.userId === auth.currentUser.uid) {
              alert("Δεν μπορείς να αγοράσεις το δικό σου προϊόν");
              return;
            }

            try {
              await addDoc(collection(db, "orders"), {
                productId: product.id || "",
                productName: product.name,
                price: product.price,
                buyerId: auth.currentUser.uid,
                sellerId: product.userId || "",
                status: "pending",
                createdAt: new Date()
              });

              alert("Η παραγγελία καταχωρήθηκε!");
            } catch (error) {
              console.error(error);
              alert("Σφάλμα");
            }
          }}
          style={{
            marginTop: 6,
            background: "#22c55e",
            border: "none",
            padding: "6px 10px",
            borderRadius: 20,
            fontWeight: "bold",
            fontSize: 12,
            color: "white",
            cursor: "pointer"
          }}
        >
          🛒 Αγορά
        </button>
      </div>

      {/* ❤️ ACTIONS */}
      <div
        style={{
          position: "absolute",
          right: 10,
          bottom: "calc(110px + env(safe-area-inset-bottom))",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
          zIndex: 5
        }}
      >
        <div onClick={handleLike} style={{ cursor: "pointer" }}>
          <FaHeart size={26} color={liked ? "red" : "white"} />
          <div style={{ fontSize: 12 }}>{likes}</div>
        </div>

        <FaCommentDots size={26} />
        <FaShare size={26} />
      </div>
    </div>
  );
}