import { NextResponse } from 'next/server';
import admin from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';
import { describeImage } from '@/ai/flows/describe-image-flow';
import { getStorage } from 'firebase-admin/storage';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
  const apiKey = request.headers.get('x-api-key');
  // It's important to secure your endpoint. For this prototype, we'll use a simple API key.
  if (apiKey !== process.env.REVENDO_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const contentType = request.headers.get('Content-Type');
    if (contentType !== 'application/json') {
        return NextResponse.json({ error: `Unsupported content type: ${contentType}` }, { status: 400 });
    }

    const body = await request.json();
    const base64Image = body.image;

    if (!base64Image || typeof base64Image !== 'string') {
        return NextResponse.json({ error: 'Invalid JSON payload. "image" field with base64 string is required.' }, { status: 400 });
    }
    
    const imageBuffer = Buffer.from(base64Image, 'base64');

    if (!imageBuffer.length) {
      return NextResponse.json({ error: 'No image data found in request body' }, { status: 400 });
    }

    // 1. Convert image to data URI for the AI flow
    const mimeType = 'image/jpeg';
    const photoDataUri = `data:${mimeType};base64,${base64Image}`;

    // 2. Upload image to Firebase Storage
    const bucket = getStorage().bucket(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
    const fileName = `machine-vision/${randomUUID()}.jpg`;
    const file = bucket.file(fileName);
    await file.save(imageBuffer, {
      metadata: {
        contentType: mimeType,
      },
    });
    // Make the file public so it can be displayed on the admin page
    await file.makePublic();
    const imageUrl = file.publicUrl();

    // 3. Call the AI flow to get a description
    const aiResponse = await describeImage({ photoDataUri });

    if (!aiResponse) {
      throw new Error("AI analysis failed.");
    }
    
    const { description, isRecyclable } = aiResponse;

    // 4. Save the image URL and description to Firestore
    const visionData = {
      imageUrl,
      description,
      isRecyclable,
      createdAt: Timestamp.now(),
    };
    await admin.firestore().collection('machine_vision').doc('latest').set(visionData);

    return NextResponse.json({
      success: true,
      message: 'Image processed successfully.',
      analysis: visionData
    });

  } catch (error) {
    console.error('Error processing image:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
