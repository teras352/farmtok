"use client";

import { useEffect, useState } from "react";
import { db, auth } from "../lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState({
    name: "",
    bio: "",
    location: "",
    photo: ""
  });

  // 🔥 load user
  useEffect(() => {
    const u = auth.currentUser;
    if (!u) return;

    setUser(u);

    const fetchData = async () => {
      const ref = doc(db, "users", u.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setForm({
          name: snap.data().name || "",
          bio: snap.data().bio || "",
          location: snap.data().location || "",
          photo: snap.data().photo || ""
        });
      }
    };

    fetchData();
  }, []);

  // 🔥 save profile
  const saveProfile = async () => {
    if (!user) return;

    try {
      await updateDoc(doc(db, "users", user.uid), form);
      alert("Αποθηκεύτηκε!");
    } catch (error) {
      console.error(error);
      alert("Σφάλμα");
    }
  };

  return (
    <div style={{ padding: 20, color: "white" }}>
      <h1>👨‍🌾 Προφίλ παραγωγού</h1>

      <input
        placeholder="Όνομα"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

      <br /><br />

      <input
        placeholder="Τοποθεσία"
        value={form.location}
        onChange={(e) => setForm({ ...form, location: e.target.value })}
      />

      <br /><br />

      <textarea
        placeholder="Περιγραφή"
        value={form.bio}
        onChange={(e) => setForm({ ...form, bio: e.target.value })}
      />

      <br /><br />

      <input
        placeholder="Link φωτογραφίας"
        value={form.photo}
        onChange={(e) => setForm({ ...form, photo: e.target.value })}
      />

      <br /><br />

      <button onClick={saveProfile}>
        Αποθήκευση
      </button>
    </div>
  );
}