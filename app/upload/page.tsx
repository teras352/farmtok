"use client";

import { useState, useEffect } from "react";
import { storage, db, auth } from "../lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function Upload() {
  const router = useRouter();

  const [video, setVideo] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(false);
  const [allowed, setAllowed] = useState(false);

  // 🔐 CHECK USER + ROLE
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        alert("Κάνε login πρώτα");
        router.push("/login");
        return;
      }

      const refUser = doc(db, "users", user.uid);
      const snap = await getDoc(refUser);

      if (snap.exists() && snap.data().role === "seller") {
        setAllowed(true);
      } else {
        alert("Μόνο παραγωγοί μπορούν να ανεβάσουν προϊόντα");
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, []);

  // 🚀 UPLOAD
  const handleUpload = async () => {
    if (!video || !name || !price || !phone) {
      return alert("Συμπλήρωσε όλα τα πεδία");
    }

    if (!auth.currentUser) {
      return alert("Κάνε login πρώτα");
    }

    try {
      setLoading(true);

      const fileName = `${Date.now()}-${video.name}`;
      const videoRef = ref(storage, `videos/${fileName}`);

      await uploadBytes(videoRef, video);

      const url = await getDownloadURL(videoRef);

      await addDoc(collection(db, "products"), {
        name,
        price: Number(price),
        phone,
        video: url,
        userId: auth.currentUser.uid,
        createdAt: new Date()
      });

      alert("Ανέβηκε το προϊόν 🚀");

      // 🔄 reset form
      setVideo(null);
      setName("");
      setPrice("");
      setPhone("");

      router.push("/");
    } catch (error) {
      console.error("UPLOAD ERROR:", error);
      alert("Σφάλμα - δες console");
    } finally {
      setLoading(false);
    }
  };

  // ⏳ block until check
  if (!allowed) {
    return (
      <div style={{
        height: "100vh",
        background: "black",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        Έλεγχος πρόσβασης...
      </div>
    );
  }

  return (
    <div style={{
      padding: 20,
      color: "white",
      background: "black",
      minHeight: "100vh"
    }}>
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

      <input
        type="text"
        placeholder="Τηλέφωνο (π.χ. 3069...)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
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