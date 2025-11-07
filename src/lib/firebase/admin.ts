
import admin from 'firebase-admin';
import { config } from 'dotenv';

// Load environment variables from .env file at the very top
config();

try {
  if (!admin.apps.length) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

    let missingVars: string[] = [];
    if (!projectId) missingVars.push('FIREBASE_PROJECT_ID');
    if (!clientEmail) missingVars.push('FIREBASE_CLIENT_EMAIL');
    if (!privateKey) missingVars.push('FIREBASE_PRIVATE_KEY');

    if (missingVars.length > 0) {
        console.error(`Firebase admin initialization failed. Missing server-side environment variables: ${missingVars.join(', ')}. Please add them to your Vercel project settings.`);
    } else {
        admin.initializeApp({
            credential: admin.credential.cert({
              projectId: projectId,
              clientEmail: clientEmail,
              // Replace the literal '\\n' strings from the .env file with actual newline characters.
              privateKey: privateKey!.replace(/\\n/g, '\n'),
            }),
        });
    }
  }
} catch (error: any) {
  console.error('Firebase admin initialization error', {
    message: error.message,
    stack: error.stack,
  });
}

export default admin;
