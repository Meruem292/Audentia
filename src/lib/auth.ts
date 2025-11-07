import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "firebase-admin/auth";
import admin from "@/lib/firebase/admin"; 

export async function verifyAdmin() {
  const sessionCookie = cookies().get("session")?.value;

  if (!sessionCookie) {
    redirect("/login");
  }

  try {
    const decodedClaims = await getAuth().verifySessionCookie(sessionCookie, true);
    const userDoc = await admin.firestore().collection("users").doc(decodedClaims.uid).get();

    if (!userDoc.exists || userDoc.data()?.role !== "admin") {
      redirect("/dashboard"); // Redirect non-admins
    }
    
    return decodedClaims;
  } catch (error) {
    // Session cookie is invalid or expired.
    console.error("Session verification failed:", error);
    redirect("/login");
  }
}
