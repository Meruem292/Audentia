
import { SignupForm } from "@/components/auth/SignupForm";
import Link from "next/link";
import { cookies } from "next/headers";
import { getAuth } from "firebase-admin/auth";
import { redirect } from "next/navigation";
import admin from "@/lib/firebase/admin"; // ensure admin is initialized

async function checkUserSession() {
    const sessionCookie = cookies().get('session')?.value;
    if (!sessionCookie) return null;

    try {
        const decodedClaims = await getAuth().verifySessionCookie(sessionCookie, true);
        return decodedClaims;
    } catch (error) {
        return null;
    }
}

export default async function SignupPage() {
    const user = await checkUserSession();

    if (user) {
        if (user.role === 'admin') {
            redirect('/admin/dashboard');
        } else {
            redirect('/dashboard');
        }
    }

  return (
    <div className="flex min-h-[calc(100vh-112px)] items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Create an Account</h1>
          <p className="text-muted-foreground">
            Join EcoVend and start earning points today.
          </p>
        </div>
        <SignupForm />
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
