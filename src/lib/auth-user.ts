
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "firebase-admin/auth";
import admin from "@/lib/firebase/admin"; 

export async function verifyUser() {
  const sessionCookie = cookies().get("session")?.value;

  if (!sessionCookie) {
    redirect("/login");
  }

  try {
    const decodedClaims = await getAuth().verifySessionCookie(sessionCookie, true);
    return decodedClaims;
  } catch (error) {
    // Session cookie is invalid or expired.
    console.error("Session verification failed:", error);
    redirect("/login");
  }
}
