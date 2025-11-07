
"use server";

import * as z from "zod";
import admin from "@/lib/firebase/admin";
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import { generateMotivationalMessage } from "@/ai/flows/generate-motivational-message";
import type { Reward, Transaction, UserProfile } from "./types";
import { auth } from "firebase-admin";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { getAuth } from "firebase-admin/auth";
import { verifyAdmin } from "./auth";

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

export async function signUpWithEmailAndPassword(values: z.infer<typeof signupSchema>) {
  try {
    const validatedValues = signupSchema.safeParse(values);
    if (!validatedValues.success) {
      return { error: "Invalid input." };
    }
    
    const role = 'user';

    const { email, password } = validatedValues.data;
    
    try {
        await admin.auth().getUserByEmail(email);
        return { error: "An account with this email already exists." };
    } catch (error: any) {
        if (error.code !== 'auth/user-not-found') {
            throw error;
        }
    }

    const userRecord = await admin.auth().createUser({
      email,
      password,
    });

    await auth().setCustomUserClaims(userRecord.uid, { role });
    
    const sixDigitId = await generateUniqueSixDigitId();

    await admin.firestore().collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      points: 0,
      sixDigitId,
      createdAt: Timestamp.now(),
      role,
    });

    return { success: true, uid: userRecord.uid };

  } catch (error: any)
   {
    console.error("Signup Error:", error);
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

async function seedInitialRewards() {
    const rewardsRef = admin.firestore().collection('rewards');
    const rewardsSnapshot = await rewardsRef.limit(1).get();
    if (rewardsSnapshot.empty) {
        const batch = admin.firestore().batch();
        const defaultRewards: Omit<Reward, 'id'>[] = [
            { name: "Reusable Water Bottle", points: 1000 },
            { name: "Bamboo Toothbrush Set", points: 1500 },
            { name: "Eco-friendly Tote Bag", points: 2000 },
            { name: "Solar-powered Charger", points: 5000 },
            { name: "Recycled Paper Notebook", points: 800 },
            { name: "Plantable Seed Pencils", points: 1200 },
        ];
        defaultRewards.forEach((reward) => {
            const docRef = rewardsRef.doc();
            batch.set(docRef, { ...reward, id: docRef.id });
        });
        await batch.commit();
    }
}

export async function getAdminRewardsAction() {
  try {
    await seedInitialRewards();
    const rewardsSnapshot = await admin.firestore().collection('rewards').orderBy('name').get();
    const rewards = rewardsSnapshot.docs.map(doc => ({...doc.data(), id: doc.id} as Reward));
    return { success: true, data: rewards };
  } catch (error) {
    console.error("Error fetching rewards:", error);
    return { error: 'Failed to fetch rewards' };
  }
}

const rewardUpdateSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Name cannot be empty"),
    points: z.number().int().min(0, "Points must be a positive number"),
});

export async function updateRewardAction(reward: Reward) {
  try {
    const validatedReward = rewardUpdateSchema.safeParse(reward);
    if (!validatedReward.success) {
      return { error: "Invalid reward data." };
    }

    const { id, ...rewardData } = validatedReward.data;
    await admin.firestore().collection('rewards').doc(id).update(rewardData);

    revalidatePath("/admin/rewards");
    return { success: true };
  } catch (error) {
    console.error("Error updating reward:", error);
    return { error: 'Failed to update reward' };
  }
}

export async function deleteRewardAction(rewardId: string) {
    try {
        if(!rewardId) {
            return { error: "Invalid reward ID." };
        }
        
        await admin.firestore().collection('rewards').doc(rewardId).delete();

        revalidatePath("/admin/rewards");
        return { success: true };
    } catch (error) {
        console.error("Error deleting reward:", error);
        return { error: 'Failed to delete reward' };
    }
}

async function getCurrentUser() {
    const sessionCookie = cookies().get("session")?.value;
    if (!sessionCookie) return null;
    try {
        const decodedClaims = await getAuth().verifySessionCookie(sessionCookie, true);
        const userDoc = await admin.firestore().collection('users').doc(decodedClaims.uid).get();
        if (!userDoc.exists) return null;
        return userDoc.data() as UserProfile;
    } catch (error) {
        return null;
    }
}


export async function getTransactionsAction() {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return { error: 'User not found' };
        }
        
        const db = admin.database();
        const ref = db.ref('transaction_history');
        const snapshot = await ref.orderByChild('userId').equalTo(user.sixDigitId).get();

        if (!snapshot.exists()) {
            return { success: true, data: [] };
        }

        const historyData = snapshot.val();
        const transactions: Transaction[] = Object.keys(historyData).map(key => ({
            id: key,
            ...historyData[key]
        })).sort((a, b) => b.timestamp - a.timestamp); // Sort by newest first
        
        return { success: true, data: transactions };

    } catch (error: any) {
        console.error("Error fetching transaction history:", { message: error.message, code: error.code });
        return { error: 'Failed to fetch transaction history' };
    }
}

export async function getRewardsAction() {
    try {
        await seedInitialRewards();
        const rewardsSnapshot = await admin.firestore().collection('rewards').orderBy('points').get();
        const rewards = rewardsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Reward));
        return { success: true, data: rewards };
    } catch (error) {
        console.error("Error fetching rewards:", error);
        return { error: 'Failed to fetch rewards' };
    }
}

export async function getAdminTransactionsAction() {
    try {
        await verifyAdmin();
        const db = admin.database();
        const ref = db.ref('transaction_history');
        const snapshot = await ref.get();

        if (!snapshot.exists()) {
            return { success: true, data: [] };
        }
        
        const historyData = snapshot.val();
        const transactions: Transaction[] = Object.keys(historyData).map(key => ({
            id: key,
            ...historyData[key]
        })).sort((a, b) => b.timestamp - a.timestamp); // Sort by newest first

        return { success: true, data: transactions };

    } catch (error: any) {
         if (error.digest?.includes('NEXT_REDIRECT')) {
            throw error;
        }
        console.error("Error fetching admin transaction history:", { message: error.message, code: error.code });
        return { error: 'Failed to fetch transaction history' };
    }
}
