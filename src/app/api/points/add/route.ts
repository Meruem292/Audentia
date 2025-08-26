import { NextResponse } from 'next/server';
import admin from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: Request) {
  const apiKey = request.headers.get('x-api-key');
  if (apiKey !== process.env.REVENDO_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { sixDigitId, pointsToAdd } = body;

    if (!sixDigitId || typeof pointsToAdd !== 'number' || pointsToAdd <= 0) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const usersRef = admin.firestore().collection('users');
    const querySnapshot = await usersRef.where('sixDigitId', '==', sixDigitId).limit(1).get();

    if (querySnapshot.empty) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userDoc = querySnapshot.docs[0];
    await userDoc.ref.update({
      points: FieldValue.increment(pointsToAdd),
    });

    return NextResponse.json({ success: true, message: `Added ${pointsToAdd} points to user ${userDoc.id}` });

  } catch (error) {
    console.error('Error adding points:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
