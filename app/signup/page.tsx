"use client";

import { useState } from "react";
import { auth, db } from "../lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSignup = async () => {
    if (!email || !password) {
      alert("Συμπλήρωσε όλα τα πεδία");
      return;
    }

    try {
      setLoading(true);

      // 🔐 Δημιουργία χρήστη
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      console.log("NEW USER:", user.uid);

      // 🔥 Αποθήκευση στο Firestore (NEW SYSTEM)
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        isSeller: false, // ✅ NEW SYSTEM
        createdAt: new Date()
      });

      alert("Έγινε εγγραφή!");

      router.push("/"); // 🔥 redirect

    } catch (error: any) {
      console.error("SIGNUP ERROR:", error);

      if (error.code === "auth/email-already-in-use") {
        alert("Το email χρησιμοποιείται ήδη");
      } else if (error.code === "auth/weak-password") {
        alert("Ο κωδικός είναι πολύ αδύναμος");
      } else {
        alert("Σφάλμα εγγραφής");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        background: "black",
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: 20
      }}
    >
      <h1 style={{ marginBottom: 20 }}>Εγγραφή</h1>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          padding: 12,
          marginBottom: 12,
          borderRadius: 10,
          border: "none",
          width: "250px"
        }}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{
          padding: 12,
          marginBottom: 20,
          borderRadius: 10,
          border: "none",
          width: "250px"
        }}
      />

      <button
        onClick={handleSignup}
        disabled={loading}
        style={{
          padding: "12px 20px",
          background: loading ? "#555" : "#22c55e",
          border: "none",
          borderRadius: 10,
          color: "white",
          fontWeight: "bold",
          cursor: "pointer",
          width: "250px"
        }}
      >
        {loading ? "Δημιουργία..." : "Εγγραφή"}
      </button>
    </div>
  );
}