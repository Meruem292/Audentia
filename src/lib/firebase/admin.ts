
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
          // This is the crucial fix: It replaces the literal '\\n' strings 
          // from the .env file with actual newline characters.
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
      });
    } else {
      let missingVars = [];
      if (!process.env.FIREBASE_PROJECT_ID) missingVars.push('FIREBASE_PROJECT_ID');
      if (!process.env.FIREBASE_CLIENT_EMAIL) missingVars.push('FIREBASE_CLIENT_EMAIL');
      if (!privateKey) missingVars.push('FIREBASE_PRIVATE_KEY');
      if (!process.env.FIREBASE_DATABASE_URL) missingVars.push('FIREBASE_DATABASE_URL');
      
      console.error(`Firebase admin credentials are not fully set. Missing: ${missingVars.join(', ')}. Please check your .env file.`);
    }
  }
} catch (error: any) {
  console.error('Firebase admin initialization error', {
    message: error.message,
    stack: error.stack,
  });
}

export default admin;
