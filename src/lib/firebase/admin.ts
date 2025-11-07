
import admin from 'firebase-admin';
import { config } from 'dotenv';

// Load environment variables from .env file at the very top
config();

try {
  if (!admin.apps.length) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && privateKey && process.env.FIREBASE_DATABASE_URL) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
      });
    } else {
      console.error('Firebase admin credentials are not fully set in environment variables. Make sure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, and FIREBASE_DATABASE_URL are present in your .env file.');
    }
  }
} catch (error: any) {
  console.error('Firebase admin initialization error', {
    message: error.message,
    stack: error.stack,
  });
}

export default admin;
