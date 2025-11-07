
import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { cookies } from 'next/headers';
import admin from '@/lib/firebase/admin';

export async function POST(request: Request) {
  const { idToken } = await request.json();

  if (!idToken) {
    return NextResponse.json({ error: 'ID token is required' }, { status: 400 });
  }

  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

  try {
    // Verify the ID token to get the user's UID
    const decodedIdToken = await getAuth().verifyIdToken(idToken);
    const uid = decodedIdToken.uid;

    // Fetch the user document from Firestore to get the role
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    if (!userDoc.exists) {
      // This case might happen if a user is created in Auth but their Firestore document fails to be created.
      return NextResponse.json({ error: 'User data not found in Firestore.' }, { status: 404 });
    }
    
    const userRole = userDoc.data()?.role || 'user';

    // Set custom claim on the user's token - this is good practice for consistency
    // across the Firebase ecosystem (e.g., for security rules).
    await getAuth().setCustomUserClaims(uid, { role: userRole });

    // Create the session cookie
    const sessionCookie = await getAuth().createSessionCookie(idToken, { expiresIn });
    
    cookies().set('session', sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: expiresIn,
      path: '/',
    });
    
    // Return the user's role to the client for immediate redirection
    return NextResponse.json({ success: true, role: userRole });
  } catch (error) {
    console.error('Error creating session cookie:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 401 });
  }
}

export async function DELETE() {
  const sessionCookie = cookies().get('session')?.value;
  if (sessionCookie) {
    try {
      const decodedClaims = await getAuth().verifySessionCookie(sessionCookie);
      await getAuth().revokeRefreshTokens(decodedClaims.sub);
    } catch (error) {
      // Ignore error if cookie is invalid
    }
  }
  
  cookies().delete('session');
  
  return NextResponse.json({ success: true });
}
