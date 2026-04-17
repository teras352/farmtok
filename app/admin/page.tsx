"use client";

import { useEffect, useState } from "react";
import { db, auth } from "../lib/firebase";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  getDoc
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function AdminPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // 🔐 AUTH + ADMIN CHECK
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);

      if (!u) {
        setLoading(false);
        return;
      }

      try {
        const ref = doc(db, "users", u.uid);
        const snap = await getDoc(ref);

        if (snap.exists() && snap.data().role === "admin") {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("ADMIN ERROR:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // 🔥 REAL-TIME ORDERS
  useEffect(() => {
    if (!isAdmin) return;

    const unsubscribe = onSnapshot(collection(db, "orders"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setOrders(data);
    });

    return () => unsubscribe();
  }, [isAdmin]);

  // 🔥 FLOW RULES (same as Firestore rules)
  const allowedTransitions: any = {
    pending: ["accepted"],
    accepted: ["paid_to_platform"],
    paid_to_platform: ["shipped"],
    shipped: ["completed"],
    completed: []
  };

  const canUpdate = (current: string, next: string) => {
    return allowedTransitions[current]?.includes(next);
  };

  // 🔥 UPDATE STATUS
  const updateStatus = async (order: any, newStatus: string) => {
    try {
      if (!canUpdate(order.status, newStatus)) {
        alert("Μη έγκυρη μετάβαση!");
        return;
      }

      const ref = doc(db, "orders", order.id);

      await updateDoc(ref, {
        status: newStatus
      });

    } catch (error) {
      console.error("UPDATE ERROR:", error);
      alert("Σφάλμα");
    }
  };

  // 🔄 LOADING
  if (loading) {
    return (
      <div style={{
        height: "100vh",
        background: "black",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        Loading...
      </div>
    );
  }

  // ❌ NOT LOGGED IN
  if (!user) {
    return <div style={{ color: "white", padding: 20 }}>Κάνε login</div>;
  }

  // ❌ NOT ADMIN
  if (!isAdmin) {
    return <div style={{ color: "white", padding: 20 }}>Δεν έχεις πρόσβαση</div>;
  }

  // ✅ ADMIN PANEL
  return (
    <div style={{
      padding: 20,
      color: "white",
      background: "black",
      minHeight: "100vh"
    }}>
      <h1>🧠 Admin Panel</h1>

      {orders.length === 0 && (
        <p>Δεν υπάρχουν παραγγελίες</p>
      )}

      {orders.map((order) => (
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
          <p><strong>Buyer:</strong> {order.buyerId}</p>
          <p><strong>Seller:</strong> {order.sellerId}</p>

          <p>
            <strong>Status:</strong> {order.status}
          </p>

          {/* 🔥 BUTTONS BASED ON STATUS */}
          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>

            {order.status === "pending" && (
              <button onClick={() => updateStatus(order, "accepted")}>
                ✅ Αποδοχή
              </button>
            )}

            {order.status === "accepted" && (
              <button onClick={() => updateStatus(order, "paid_to_platform")}>
                💳 Πληρώθηκε
              </button>
            )}

            {order.status === "paid_to_platform" && (
              <button onClick={() => updateStatus(order, "shipped")}>
                🚚 Στάλθηκε
              </button>
            )}

            {order.status === "shipped" && (
              <button onClick={() => updateStatus(order, "completed")}>
                ✅ Ολοκληρώθηκε
              </button>
            )}

          </div>
        </div>
      ))}
    </div>
  );
}