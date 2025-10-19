import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getAuth } from 'firebase-admin/auth';
import admin from '@/lib/firebase/admin'; // ensure admin is initialized

export default async function DashboardRedirectPage() {
    const sessionCookie = cookies().get('session')?.value;
    if (!sessionCookie) {
        redirect('/login');
    }

    try {
        const decodedClaims = await getAuth().verifySessionCookie(sessionCookie, true);
        if (decodedClaims.role === 'admin') {
            redirect('/admin/dashboard');
        } else {
            redirect('/dashboard/home');
        }
    } catch (error: any) {
        // If the error is a redirect, we don't want to log it as an error.
        // NEXT_REDIRECT is a special string Next.js uses for this purpose.
        if (error.digest?.includes('NEXT_REDIRECT')) {
            throw error;
        }
        console.error("Session verification failed, redirecting to login:", error);
        redirect('/login');
    }

    return null; // This page should never render anything
}
