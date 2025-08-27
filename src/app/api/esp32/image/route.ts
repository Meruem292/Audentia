import { NextResponse } from 'next/server';
import admin from '@/lib/firebase/admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
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
    const formData = await request.formData();
    const imageFile = formData.get('image') as File | null;

    if (!imageFile) {
      return NextResponse.json({ error: 'No image file found in form data' }, { status: 400 });
    }

    // 1. Convert image to buffer and then to data URI
    const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
    const mimeType = imageFile.type;
    const photoDataUri = `data:${mimeType};base64,${imageBuffer.toString('base64')}`;

    // 2. Upload image to Firebase Storage
    const bucket = getStorage().bucket(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
    const fileName = `machine-vision/${randomUUID()}-${imageFile.name}`;
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
