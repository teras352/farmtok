"use client";

import { useEffect } from "react";
import { messaging } from "../lib/firebase";
import { getToken, onMessage } from "firebase/messaging";
import { db, auth } from "../lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export default function PushNotifications() {
  useEffect(() => {
    const setup = async () => {
      const permission = await Notification.requestPermission();

      if (permission !== "granted") return;
      if (!messaging) return;

      const token = await getToken(messaging, {
        vapidKey: "BAdBT0KeCxvxONSQ6RZOQXvo_1qufrDPXfjT2Zm3mrB5lO6tGdkuQkr_boaZMXfRhy5bT165ababcBFdelGkAow"
      });

      if (auth.currentUser && token) {
        await setDoc(
          doc(db, "users", auth.currentUser.uid),
          { pushToken: token },
          { merge: true }
        );
      }
    };

    setup();

    if (messaging) {
      onMessage(messaging, (payload) => {
        alert(payload.notification?.title);
      });
    }
  }, []);

  return null;
}