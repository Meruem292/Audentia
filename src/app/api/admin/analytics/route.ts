import { NextResponse } from 'next/server';
import admin from '@/lib/firebase/admin';
import { getAuth } from 'firebase-admin/auth';
import { headers } from 'next/headers';

export async function GET(request: Request) {
  try {
    const authorization = headers().get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }
    const token = authorization.split('Bearer ')[1];

    const decodedToken = await getAuth().verifyIdToken(token);

    if (decodedToken.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: User is not an admin' }, { status: 403 });
    }

    const usersSnapshot = await admin.firestore().collection('users').get();
    const totalUsers = usersSnapshot.size;
    
    const analyticsData = {
        totalUsers,
    };

    return NextResponse.json({ success: true, data: analyticsData });

  } catch (error: any) {
    console.error("Error fetching admin analytics:", error);
    if(error.code === 'auth/id-token-expired' || error.code === 'auth/argument-error') {
        return NextResponse.json({ error: 'Token is invalid or expired. Please login again.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
