
import { cookies } from "next/headers";
import { getAuth } from "firebase-admin/auth";
import admin from "@/lib/firebase/admin"; 

type VerificationResult = {
  success: true;
  claims: auth.DecodedIdToken;
} | {
  success: false;
  redirect: string;
  error: string;
};


export async function verifyAdmin(): Promise<{ error: string, redirect: string } | { error: null, claims: auth.DecodedIdToken }> {
  const sessionCookie = cookies().get("session")?.value;

  if (!sessionCookie) {
    return { error: "No session cookie.", redirect: "/login" };
  }

  try {
    const decodedClaims = await getAuth().verifySessionCookie(sessionCookie, true);
    const userDoc = await admin.firestore().collection("users").doc(decodedClaims.uid).get();

    if (!userDoc.exists || userDoc.data()?.role !== "admin") {
      return { error: "User is not an admin.", redirect: "/dashboard" };
    }
    
    return { error: null, claims: decodedClaims };
  } catch (error) {
    console.error("Session verification failed:", error);
    return { error: "Session verification failed.", redirect: "/login" };
  }
}
