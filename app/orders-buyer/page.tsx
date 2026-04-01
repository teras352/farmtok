"use client";

import { useEffect, useState } from "react";
import { db, auth } from "../lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function BuyerOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  // 🔥 current user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
    });

    return () => unsubscribe();
  }, []);

  // 🔥 fetch buyer orders
  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      try {
        const q = query(
          collection(db, "orders"),
          where("buyerId", "==", user.uid)
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

  return (
    <div style={{ padding: 20, color: "white" }}>
      <h1>🛒 Οι αγορές μου</h1>

      {orders.length === 0 && (
        <p>Δεν έχεις κάνει αγορές</p>
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

          <p>
            <strong>Status:</strong>
            {order.status === "pending" && " ⏳ Περιμένει αποδοχή"}
            {order.status === "accepted" && " ✅ Έγινε αποδοχή"}
            {order.status === "paid" && " 💰 Πληρώθηκε"}
            {order.status === "rejected" && " ❌ Απορρίφθηκε"}
          </p>
        </div>
      ))}
    </div>
  );
}