import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "firebase-admin/auth";
import admin from "@/lib/firebase/admin"; // In case you need it for other checks

export async function verifyAdmin() {
  const sessionCookie = cookies().get("session")?.value;

  if (!sessionCookie) {
    redirect("/login");
  }

  try {
    const decodedClaims = await getAuth().verifySessionCookie(sessionCookie, true);
    if (decodedClaims.role !== "admin") {
      redirect("/dashboard"); // Redirect non-admins to their dashboard
    }
    return decodedClaims;
  } catch (error) {
    // Session cookie is invalid or expired.
    console.error("Session verification failed:", error);
    redirect("/login");
  }
}
