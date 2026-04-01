"use client";

import { useEffect, useState } from "react";
import { db, auth } from "../lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  addDoc
} from "firebase/firestore";

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  // 🔥 current user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
    });

    return () => unsubscribe();
  }, []);

  // 🔥 fetch seller orders
  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      try {
        const q = query(
          collection(db, "orders"),
          where("sellerId", "==", user.uid)
        );

        const snapshot = await getDocs(q);

        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setOrders(data);
      } catch (error) {
        console.error("FETCH ERROR:", error);
      }
    };

    fetchOrders();
  }, [user]);

  // 🔥 update status + notifications
  const updateStatus = async (id: string, newStatus: string, order: any) => {
    try {
      const ref = doc(db, "orders", id);

      await updateDoc(ref, {
        status: newStatus
      });

      // 🔔 notification όταν γίνει accept
      if (newStatus === "accepted") {
        await addDoc(collection(db, "notifications"), {
          userId: order.buyerId,
          message: `Η παραγγελία σου για "${order.productName}" έγινε αποδεκτή ✅`,
          createdAt: new Date(),
          read: false
        });
      }

      // 🔥 update UI instantly
      setOrders(prev =>
        prev.map(o =>
          o.id === id ? { ...o, status: newStatus } : o
        )
      );

    } catch (error) {
      console.error(error);
      alert("Σφάλμα");
    }
  };

  return (
    <div style={{ padding: 20, color: "white" }}>
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
                  color: "white"
                }}
              >
                Αποδοχή
              </button>

              <button
                onClick={() => updateStatus(order.id, "rejected", order)}
                style={{
                  background: "#ef4444",
                  border: "none",
                  padding: "8px 12px",
                  borderRadius: 8,
                  color: "white"
                }}
              >
                Απόρριψη
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
                color: "white"
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