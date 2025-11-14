
import type { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string;
  points: number;
  sixDigitId: string;
  createdAt: Timestamp; // This is the Firestore Timestamp object
  role: 'user' | 'admin';
}

// A version of UserProfile where the Timestamp is a number (milliseconds)
// This is safe to pass from Server to Client Components.
export interface UserProfileSerializable extends Omit<UserProfile, 'createdAt'> {
  createdAt: number;
}


export interface Reward {
    id: string;
    name: string;
    points: number;
}

export interface Transaction {
  id: string;
  timestamp: number; // Use number for serializable date
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
