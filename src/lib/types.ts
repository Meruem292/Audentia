
import type { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string;
  points: number;
  sixDigitId: string;
  createdAt: Timestamp;
  role: 'user' | 'admin';
}

export interface Reward {
    id: string;
    name: string;
    points: number;
}

export interface Transaction {
  id: string;
  timestamp: Date;
  userId: string; // This is the six-digit ID
  status: 'valid' | 'invalid' | 'dispensed';
  
  // Fields for bottle insertion
  plasticBottleCount?: number;
  pointsEarned?: number;

  // Fields for reward dispense
  pointsUsed?: number;
  dispenserIndex?: number;
  details?: string;
}


declare module "firebase-admin/auth" {
  interface DecodedIdToken {
    role?: 'user' | 'admin';
  }
}
