
import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getFirebaseConfig } from './config';

// Re-export hooks and providers
export { FirebaseProvider, useFirebaseApp, useAuth, useFirestore, FirebaseClientProvider } from './provider';
export { useUser } from './auth/use-user';
export { useDoc } from './firestore/use-doc';
export { useCollection } from './firestore/use-collection';

// Main firebase initialization
let firebaseApp: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

export function initializeFirebase() {
  if (typeof window !== 'undefined') {
    if (!getApps().length) {
      try {
        const firebaseConfig = getFirebaseConfig();
        firebaseApp = initializeApp(firebaseConfig);
      } catch (e) {
        console.error('Failed to initialize Firebase', e);
      }
    } else {
      firebaseApp = getApp();
    }
    auth = getAuth(firebaseApp);
    firestore = getFirestore(firebaseApp);
  } else {
    // On the server, we can't initialize. We can return dummy/null objects
    // or handle it gracefully. For this app, client-side auth is sufficient.
  }

  return { firebaseApp, auth, firestore };
}

// Helper hook to get initialized services
export function useFirebase() {
  return initializeFirebase();
}
