"use client";

import { useEffect, useState } from "react";
import { db, auth } from "../lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc
} from "firebase/firestore";

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  // 🔐 current user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
    });

    return () => unsubscribe();
  }, []);

  // 🔥 REAL-TIME orders
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "orders"),
      where("sellerId", "==", user.uid)
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

  // 🔥 UPDATE STATUS (SAFE)
  const updateStatus = async (id: string, newStatus: string, order: any) => {
    try {
      // 🔒 security check
      if (!user || order.sellerId !== user.uid) return;

      const ref = doc(db, "orders", id);

      await updateDoc(ref, {
        status: newStatus
      });

      // ❌ ΔΕΝ βάζουμε notification εδώ
      // 👉 το κάνει ήδη το Firebase function

    } catch (error) {
      console.error("UPDATE ERROR:", error);
      alert("Σφάλμα");
    }
  };

  return (
    <div
      style={{
        padding: 20,
        color: "white",
        background: "black",
        minHeight: "100vh"
      }}
    >
      <h1>📦 Οι παραγγελίες μου</h1>

      {orders.length === 0 && (
        <p>Δεν υπάρχουν παραγγελίες</p>
      )}

      {orders.map(order => (
        <div
          key={order.id}
          style={{
            border: "1px solid #444",
            marginBottom: 15,
            padding: 12,
            borderRadius: 10
          }}
        >
          <p><strong>Προϊόν:</strong> {order.productName}</p>
          <p><strong>Τιμή:</strong> {order.price}€</p>

          {/* 🔥 STATUS */}
          <p>
            <strong>Status:</strong>
            {order.status === "pending" && " ⏳ Εκκρεμεί"}
            {order.status === "accepted" && " ✅ Έγινε αποδοχή"}
            {order.status === "paid" && " 💰 Πληρώθηκε"}
            {order.status === "rejected" && " ❌ Απορρίφθηκε"}
          </p>

          {/* 🔥 ACTIONS */}
          {order.status === "pending" && (
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => updateStatus(order.id, "accepted", order)}
                style={{
                  background: "#22c55e",
                  border: "none",
                  padding: "8px 12px",
                  borderRadius: 8,
                  color: "white",
                  cursor: "pointer"
                }}
              >
                ✅ Αποδοχή
              </button>

              <button
                onClick={() => updateStatus(order.id, "rejected", order)}
                style={{
                  background: "#ef4444",
                  border: "none",
                  padding: "8px 12px",
                  borderRadius: 8,
                  color: "white",
                  cursor: "pointer"
                }}
              >
                ❌ Απόρριψη
              </button>
            </div>
          )}

          {order.status === "accepted" && (
            <button
              onClick={() => updateStatus(order.id, "paid", order)}
              style={{
                marginTop: 10,
                background: "#3b82f6",
                border: "none",
                padding: "8px 12px",
                borderRadius: 8,
                color: "white",
                cursor: "pointer"
              }}
            >
              💰 Πληρωμή ολοκληρώθηκε
            </button>
          )}
        </div>
      ))}
    </div>
  );
}