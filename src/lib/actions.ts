"use server";

import * as z from "zod";
import admin from "@/lib/firebase/admin";
import { Timestamp } from 'firebase-admin/firestore';
import { generateMotivationalMessage } from "@/ai/flows/generate-motivational-message";
import { UserProfile } from "./types";

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

async function isSixDigitIdUnique(id: string): Promise<boolean> {
  const snapshot = await admin.firestore().collection("users").where("sixDigitId", "==", id).limit(1).get();
  return snapshot.empty;
}

async function generateUniqueSixDigitId(): Promise<string> {
  let id: string;
  let isUnique = false;
  while (!isUnique) {
    id = Math.floor(100000 + Math.random() * 900000).toString();
    isUnique = await isSixDigitIdUnique(id);
  }
  return id!;
}

async function hasUsers(): Promise<boolean> {
    const userList = await admin.auth().listUsers(1);
    return userList.users.length > 0;
}


export async function signUpWithEmailAndPassword(values: z.infer<typeof signupSchema>) {
  try {
    const validatedValues = signupSchema.safeParse(values);
    if (!validatedValues.success) {
      return { error: "Invalid input." };
    }
    
    const isFirstUser = !(await hasUsers());
    const role = isFirstUser ? 'admin' : 'user';

    const { email, password } = validatedValues.data;

    const userRecord = await admin.auth().createUser({
      email,
      password,
    });
    
    const sixDigitId = await generateUniqueSixDigitId();

    await admin.firestore().collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      points: 0,
      sixDigitId,
      createdAt: Timestamp.now(),
      role,
    });

    return { success: true, uid: userRecord.uid, role };

  } catch (error: any) {
    // If user creation fails, delete the auth user if it was created
    if (error.code === 'auth/email-already-exists' && (await hasUsers())) {
        const user = await admin.auth().getUserByEmail(values.email);
        const userDoc = await admin.firestore().collection('users').doc(user.uid).get();
        if (!userDoc.exists) {
            await admin.auth().deleteUser(user.uid);
        }
    }
    return { error: error.message || "An unexpected error occurred." };
  }
}

export async function getMotivationalMessageAction(points: number) {
  try {
    const result = await generateMotivationalMessage({ points });
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Error generating motivational message:", error);
    return { error: "Failed to generate a message. Please try again." };
  }
}

export async function getUserRole(uid: string): Promise<{ role?: 'user' | 'admin', error?: string }> {
    try {
        const userDoc = await admin.firestore().collection('users').doc(uid).get();
        if (!userDoc.exists) {
            return { error: 'User not found.' };
        }
        const userProfile = userDoc.data() as UserProfile;
        return { role: userProfile.role };
    } catch (error) {
        return { error: 'Failed to get user role.' };
    }
}
