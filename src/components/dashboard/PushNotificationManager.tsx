"use client";

import { useEffect } from "react";
import { getToken } from "firebase/messaging";
import { messaging } from "@/lib/firebase/config";
import { useAuth } from "@/hooks/useAuth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useToast } from "@/hooks/use-toast";

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

export default function PushNotificationManager() {
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if ("Notification" in window && VAPID_KEY) {
      if (Notification.permission === "granted" && user) {
        setupNotifications();
      }
    }
  }, [user]);

  const setupNotifications = async () => {
    if (!user) return;

    try {
      const messagingInstance = await messaging();
      if (!messagingInstance) {
          console.warn("Firebase Messaging not supported in this browser.");
          return;
      }

      const currentToken = await getToken(messagingInstance, { vapidKey: VAPID_KEY });
      if (currentToken) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            const existingTokens = userData.fcmTokens || [];
            if (!existingTokens.includes(currentToken)) {
                await setDoc(userDocRef, { fcmTokens: [...existingTokens, currentToken] }, { merge: true });
                console.log("FCM token saved.");
            }
        }
      } else {
        console.log("No registration token available. Request permission to generate one.");
      }
    } catch (err) {
      console.error("An error occurred while retrieving token. ", err);
      toast({
        variant: "destructive",
        title: "Could not get notification permission",
        description: "There was an issue setting up push notifications.",
      });
    }
  };

  return null; // This component does not render anything
}