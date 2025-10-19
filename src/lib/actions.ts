
"use server";

import * as z from "zod";
import admin from "@/lib/firebase/admin";
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import { generateMotivationalMessage } from "@/ai/flows/generate-motivational-message";
import type { Reward, UserProfile } from "./types";
import { auth } from "firebase-admin";

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

    return { success: true, uid: userRecord.uid, role };

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
        const defaultRewards = [
            { name: "Reusable Water Bottle", points: 1000 },
            { name: "Bamboo Toothbrush Set", points: 1500 },
            { name: "Eco-friendly Tote Bag", points: 2000 },
            { name: "Solar-powered Charger", points: 5000 },
            { name: "Recycled Paper Notebook", points: 800 },
            { name: "Plantable Seed Pencils", points: 1200 },
        ];
        defaultRewards.forEach((reward, index) => {
            const id = `item_${index + 1}`
            const docRef = rewardsRef.doc(id);
            batch.set(docRef, { ...reward, id });
        });
        await batch.commit();
    }
}

export async function getRewardsAction() {
  try {
    await seedInitialRewards();
    const rewardsSnapshot = await admin.firestore().collection('rewards').orderBy('id').get();
    const rewards = rewardsSnapshot.docs.map(doc => doc.data() as Reward);
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

export async function updateRewardAction(reward: Omit<Reward, 'imageUrl'>) {
  try {
    const validatedReward = rewardUpdateSchema.safeParse(reward);
    if (!validatedReward.success) {
      return { error: "Invalid reward data." };
    }

    const { id, ...rewardData } = validatedReward.data;
    await admin.firestore().collection('rewards').doc(id).update(rewardData);

    return { success: true };
  } catch (error) {
    console.error("Error updating reward:", error);
    return { error: 'Failed to update reward' };
  }
}
