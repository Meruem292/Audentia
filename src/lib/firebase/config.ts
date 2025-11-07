"use client";

import { initializeApp, getApps, getApp, FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function createFirebaseApp(config: FirebaseOptions) {
    try {
        return getApp();
    } catch {
        const missingVars = Object.entries(config)
            .filter(([key, value]) => !value)
            .map(([key]) => `NEXT_PUBLIC_${key.replace(/([A-Z])/g, '_$1').toUpperCase()}`);

        if (missingVars.length > 0) {
            console.error(`Firebase initialization failed. Missing environment variables: ${missingVars.join(', ')}. Please add them to your Vercel project settings.`);
            // Return a dummy object or throw an error to prevent further execution
            // For now, we will let it fail on initializeApp to make the error obvious.
        }
        return initializeApp(config);
    }
}


// Initialize Firebase
const app = createFirebaseApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const messaging = async () => {
    const supported = await isSupported();
    return supported ? getMessaging(app) : null;
};


export { app, auth, db, messaging };
