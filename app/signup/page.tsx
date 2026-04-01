"use client";

import { useState } from "react";
import { auth, db } from "../lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSignup = async () => {
    if (!email || !password) {
      alert("Συμπλήρωσε όλα τα πεδία");
      return;
    }

    try {
      // 🔐 Δημιουργία χρήστη
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      console.log("NEW USER:", user.uid);

      // 🔥 Αποθήκευση στο Firestore (role system)
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        role: "buyer", // default
        createdAt: new Date()
      });

      alert("Έγινε εγγραφή!");

      // 🔥 redirect στο feed
      router.push("/");

    } catch (error: any) {
      console.error("SIGNUP ERROR:", error);

      if (error.code === "auth/email-already-in-use") {
        alert("Το email χρησιμοποιείται ήδη");
      } else if (error.code === "auth/weak-password") {
        alert("Ο κωδικός είναι πολύ αδύναμος");
      } else {
        alert("Σφάλμα εγγραφής");
      }
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
        alignItems: "center"
      }}
    >
      <h1>Signup</h1>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          padding: 10,
          marginBottom: 10,
          borderRadius: 8,
          border: "none"
        }}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{
          padding: 10,
          marginBottom: 20,
          borderRadius: 8,
          border: "none"
        }}
      />

      <button
        onClick={handleSignup}
        style={{
          padding: "10px 20px",
          background: "#22c55e",
          border: "none",
          borderRadius: 8,
          color: "white",
          fontWeight: "bold",
          cursor: "pointer"
        }}
      >
        Εγγραφή
      </button>
    </div>
  );
}