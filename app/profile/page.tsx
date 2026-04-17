"use client";

import { useEffect, useState } from "react";
import { db, auth } from "../lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  onSnapshot
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);

  const [form, setForm] = useState({
    name: "",
    bio: "",
    location: "",
    photo: ""
  });

  // 🔐 AUTH (σωστό)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setLoading(false);
        return;
      }

      setUser(u);

      try {
        const ref = doc(db, "users", u.uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();

          setForm({
            name: data.name || "",
            bio: data.bio || "",
            location: data.location || "",
            photo: data.photo || ""
          });
        }
      } catch (error) {
        console.error("PROFILE LOAD ERROR:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // 📦 ORDERS (buyer profile)
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "orders"),
      where("buyerId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setOrders(data);
    });

    return () => unsubscribe();
  }, [user]);

  // 💾 SAVE
  const saveProfile = async () => {
    if (!user) return;

    try {
      await updateDoc(doc(db, "users", user.uid), form);
      alert("Αποθηκεύτηκε!");
    } catch (error: any) {
      console.error(error);

      if (error.code === "permission-denied") {
        alert("Δεν έχεις δικαίωμα");
      } else {
        alert("Σφάλμα");
      }
    }
  };

  // ⏳ LOADING
  if (loading) {
    return <div style={{ color: "white", padding: 20 }}>Loading...</div>;
  }

  // ❌ NO USER
  if (!user) {
    return <div style={{ color: "white", padding: 20 }}>Κάνε login</div>;
  }

  return (
    <div style={{
      padding: 20,
      color: "white",
      background: "black",
      minHeight: "100vh"
    }}>
      <h1>👤 Το προφίλ μου</h1>

      {/* 🧾 FORM */}
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

      {/* 📦 ORDERS */}
      <h2 style={{ marginTop: 30 }}>📦 Οι αγορές μου</h2>

      {orders.length === 0 && <p>Δεν υπάρχουν αγορές</p>}

      {orders.map(order => (
        <div
          key={order.id}
          style={{
            border: "1px solid #444",
            marginBottom: 10,
            padding: 10,
            borderRadius: 8
          }}
        >
          <p><strong>{order.productName}</strong></p>
          <p>{order.price}€</p>
          <p>Status: {order.status}</p>
        </div>
      ))}
    </div>
  );
}