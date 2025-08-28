import { NextResponse } from 'next/server';
import admin from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';
import { describeImage } from '@/ai/flows/describe-image-flow';

export async function POST(request: Request) {
  const apiKey = request.headers.get('x-api-key');
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
    
    // 1. Convert image to data URI for the AI flow and for storage
    const mimeType = 'image/jpeg';
    const imageDataUri = `data:${mimeType};base64,${base64Image}`;

    // 2. Call the AI flow to get a description
    const aiResponse = await describeImage({ photoDataUri: imageDataUri });

    if (!aiResponse) {
      throw new Error("AI analysis failed.");
    }
    
    const { description, isRecyclable } = aiResponse;

    // 3. Save the image data URI and description to Firestore
    const visionData = {
      imageDataUri,
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
