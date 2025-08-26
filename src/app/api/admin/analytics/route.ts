import { NextResponse } from 'next/server';
import admin from '@/lib/firebase/admin';
import { getAuth } from 'firebase-admin/auth';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);
    
    const userDoc = await admin.firestore().collection('users').doc(decodedToken.uid).get();
    if (!userDoc.exists || userDoc.data()?.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const usersSnapshot = await admin.firestore().collection('users').get();
    const totalUsers = usersSnapshot.size;
    
    const analyticsData = {
        totalUsers,
    };

    return NextResponse.json({ success: true, data: analyticsData });

  } catch (error: any) {
    console.error("Error fetching admin analytics:", error);
    if(error.code === 'auth/id-token-expired'){
        return NextResponse.json({ error: 'Token expired, please login again.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
