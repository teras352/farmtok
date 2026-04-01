"use client";

import { useState } from "react";
import { auth, db } from "../lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();

  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 🔐 LOGIN
  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (error) {
      console.error(error);
      alert("Λάθος στοιχεία");
    }
  };

  // 🆕 SIGNUP
  const handleSignup = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      // 🔥 δημιουργία user στο Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        role: "buyer",
        createdAt: new Date()
      });

      router.push("/");
    } catch (error) {
      console.error(error);
      alert("Σφάλμα εγγραφής");
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
        padding: 20
      }}
    >
      <h1 style={{ marginBottom: 20 }}>
        {isSignup ? "Εγγραφή" : "Είσοδος"}
      </h1>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          marginBottom: 10,
          padding: 10,
          borderRadius: 6,
          border: "none"
        }}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{
          marginBottom: 20,
          padding: 10,
          borderRadius: 6,
          border: "none"
        }}
      />

      <button
        onClick={isSignup ? handleSignup : handleLogin}
        style={{
          padding: 12,
          background: "#22c55e",
          border: "none",
          color: "white",
          borderRadius: 8,
          fontWeight: "bold",
          cursor: "pointer"
        }}
      >
        {isSignup ? "Κάνε εγγραφή" : "Σύνδεση"}
      </button>

      <p
        onClick={() => setIsSignup(!isSignup)}
        style={{
          marginTop: 20,
          cursor: "pointer",
          opacity: 0.7
        }}
      >
        {isSignup
          ? "Έχεις λογαριασμό; Σύνδεση"
          : "Δεν έχεις λογαριασμό; Εγγραφή"}
      </p>
    </div>
  );
}