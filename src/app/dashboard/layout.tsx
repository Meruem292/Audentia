import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "firebase-admin/auth";
import admin from "@/lib/firebase/admin"; // Initialise admin app

async function verifyUserSession() {
  const sessionCookie = cookies().get("session")?.value;

  if (!sessionCookie) {
    redirect("/login");
  }

  try {
    const decodedClaims = await getAuth().verifySessionCookie(sessionCookie, true);
    // If user is an admin, redirect them to the admin dashboard
    if (decodedClaims.role === "admin") {
      redirect("/admin/dashboard");
    }
    return decodedClaims;
  } catch (error) {
    // Session cookie is invalid or expired.
    console.error("Session verification failed:", error);
    redirect("/login");
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await verifyUserSession();

  return <>{children}</>;
}
