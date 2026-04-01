"use client";

import { useState } from "react";
import { storage, db, auth } from "../lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";

export default function Upload() {
  const [video, setVideo] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [phone, setPhone] = useState("");

  const handleUpload = async () => {
  if (!video || !name || !price) {
    return alert("Συμπλήρωσε όλα τα πεδία");
  }

  if (!auth.currentUser) {
    return alert("Κάνε login πρώτα");
  }

  try {
    console.log("USER:", auth.currentUser);

    const videoRef = ref(storage, `videos/${Date.now()}-${video.name}`);
    await uploadBytes(videoRef, video);

    const url = await getDownloadURL(videoRef);

    await addDoc(collection(db, "products"), {
      name,
      price: Number(price),
      video: url,
      userId: auth.currentUser.uid,   // 🔥 important
    });

    alert("Ανέβηκε το προϊόν 🚀");

  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    alert("Σφάλμα - δες console");
  }
};
  return (
    <div style={{ padding: 20 }}>
      <h1>Upload προϊόν</h1>

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

      <button onClick={handleUpload}>
        Upload
      </button>
    </div>
  );
}