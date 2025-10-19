
import { LoginForm } from "@/components/auth/LoginForm";
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

export default async function LoginPage() {
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
          <h1 className="text-3xl font-bold">Welcome Back!</h1>
          <p className="text-muted-foreground">
            Sign in to access your dashboard.
          </p>
        </div>
        <LoginForm />
        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
