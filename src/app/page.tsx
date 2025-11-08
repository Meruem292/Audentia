
import Hero from '@/components/landing/Hero';
import { cookies } from 'next/headers';
import { getAuth } from 'firebase-admin/auth';
import { redirect } from 'next/navigation';
import admin from '@/lib/firebase/admin';

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

export default async function Home() {
  const user = await checkUserSession();

  // The "Access Your Dashboard" button on the hero page will handle navigation
  // for logged-in users, so a redirect here is not strictly needed,
  // but it's good practice to keep it for users who land here directly.
  if (user) {
    if (user.role === 'admin') {
      redirect('/admin/dashboard');
    } else {
      redirect('/dashboard');
    }
  }

  return (
    <div className="flex flex-col">
      <Hero />
    </div>
  );
}
