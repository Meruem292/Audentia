
'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuth, useFirestore } from '../provider';

interface UserProfile {
  uid: string;
  email: string | null;
  role?: 'user' | 'admin';
  [key: string]: any;
}

export function useUser() {
  const auth = useAuth();
  const firestore = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth || !firestore) return;

    const unsubscribeAuth = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        setUser(authUser);
        const userDocRef = doc(firestore, 'users', authUser.uid);
        
        const unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            setUserProfile({
              uid: authUser.uid,
              email: authUser.email,
              ...data,
            });
          } else {
            // User exists in Auth but not in Firestore.
            // You might want to create a document here or handle this case.
            setUserProfile({ uid: authUser.uid, email: authUser.email });
          }
          setLoading(false);
        });

        return () => unsubscribeSnapshot();
      } else {
        setUser(null);
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [auth, firestore]);

  return { user, userProfile, loading };
}
