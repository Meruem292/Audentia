import type { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string;
  points: number;
  sixDigitId: string;
  createdAt: Timestamp;
  role: 'user' | 'admin';
}

declare module "firebase-admin/auth" {
  interface DecodedIdToken {
    role?: 'user' | 'admin';
  }
}
