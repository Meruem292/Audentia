import admin from 'firebase-admin';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

if (!admin.apps.length) {
  try {
    // Ensure that environment variables are loaded before initializing
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
      });
    } else {
        console.error('Firebase admin credentials are not fully set in environment variables.');
    }
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

export default admin;
