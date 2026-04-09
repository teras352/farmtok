"use client";

import { useState, useEffect } from "react";
import { storage, db, auth } from "../lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function Upload() {
  const router = useRouter();

  const [video, setVideo] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  const [loading, setLoading] = useState(false);
  const [allowed, setAllowed] = useState(false);

  // 🔐 CHECK USER + SELLER
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        alert("Κάνε login πρώτα");
        router.push("/login");
        return;
      }

      try {
        const refUser = doc(db, "users", user.uid);
        const snap = await getDoc(refUser);

        if (snap.exists()) {
          const data = snap.data();

          // 🔥 migrate παλιό σύστημα
          if (data.role === "seller" && !data.isSeller) {
            await setDoc(refUser, { isSeller: true }, { merge: true });
            setAllowed(true);
            return;
          }

          if (data.isSeller === true) {
            setAllowed(true);
          } else {
            alert("Μόνο παραγωγοί μπορούν να ανεβάσουν προϊόντα");
            router.push("/");
          }
        } else {
          router.push("/");
        }
      } catch (error) {
        console.error(error);
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, []);

  // 🚀 UPLOAD
  const handleUpload = async () => {
    if (!video || !name || !price) {
      return alert("Συμπλήρωσε όλα τα πεδία");
    }

    if (!auth.currentUser) {
      return alert("Κάνε login πρώτα");
    }

    try {
      setLoading(true);

      // 📦 upload video
      const fileName = `${Date.now()}-${video.name}`;
      const videoRef = ref(storage, `videos/${fileName}`);

      await uploadBytes(videoRef, video);
      const url = await getDownloadURL(videoRef);

      // 👤 πάρε seller info
      const userRef = doc(db, "users", auth.currentUser.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();

      // 🧾 save product
      await addDoc(collection(db, "products"), {
        name,
        price: Number(price),
        video: url,
        userId: auth.currentUser.uid,
        sellerName: userData?.name || "Παραγωγός",
        status: "pending",
        createdAt: new Date()
      });

      alert("Ανέβηκε το προϊόν 🚀");

      // reset
      setVideo(null);
      setName("");
      setPrice("");

      router.push("/");
    } catch (error) {
      console.error("UPLOAD ERROR:", error);
      alert("Σφάλμα");
    } finally {
      setLoading(false);
    }
  };

  // ⏳ loading screen
  if (!allowed) {
    return (
      <div
        style={{
          height: "100vh",
          background: "black",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        Έλεγχος πρόσβασης...
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 20,
        color: "white",
        background: "black",
        minHeight: "100vh"
      }}
    >
      <h1>📤 Upload προϊόν</h1>

      <input
        type="file"
        accept="video/*"
        onChange={(e) => {
          if (e.target.files) {
            setVideo(e.target.files[0]);
          }
        }}
      />

      <br /><br />

      <input
        type="text"
        placeholder="Όνομα προϊόντος"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <br /><br />

      <input
        type="number"
        placeholder="Τιμή (€)"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />

      <br /><br />

      <button
        onClick={handleUpload}
        disabled={loading}
        style={{
          background: loading ? "#555" : "#22c55e",
          border: "none",
          padding: "10px 16px",
          borderRadius: 8,
          color: "white",
          fontWeight: "bold",
          cursor: "pointer"
        }}
      >
        {loading ? "Ανεβαίνει..." : "Upload"}
      </button>
    </div>
  );
}