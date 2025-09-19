import { NextResponse } from 'next/server';
import admin from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';
import { describeImage } from '@/ai/flows/describe-image-flow';
import { countBottles } from '@/ai/flows/count-bottles-flow';

export async function POST(request: Request) {
  const apiKey = request.headers.get('x-api-key');
  if (apiKey !== process.env.REVENDO_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const contentType = request.headers.get('Content-Type');
    if (!contentType?.includes('application/json')) {
        return NextResponse.json({ error: `Unsupported content type: ${contentType}` }, { status: 400 });
    }

    const body = await request.json();
    const base64Image = body.image;

    if (!base64Image || typeof base64Image !== 'string') {
        return NextResponse.json({ error: 'Invalid JSON payload. "image" field with base64 string is required.' }, { status: 400 });
    }
    
    const imageDataUri = `data:image/jpeg;base64,${base64Image}`;

    // Call our AI flows in parallel for efficiency
    const [descriptionResult, bottleCountResult] = await Promise.all([
      describeImage({ photoDataUri: imageDataUri }),
      countBottles({ photoDataUri: imageDataUri })
    ]);

    if (!descriptionResult || !bottleCountResult) {
      throw new Error("AI analysis failed.");
    }
    
    // Save the analysis to Firestore
    const visionData = {
      imageDataUri,
      description: descriptionResult.description,
      isRecyclable: descriptionResult.isRecyclable,
      bottleCount: bottleCountResult.bottleCount,
      createdAt: Timestamp.now(),
    };
    await admin.firestore().collection('machine_vision').doc('latest').set(visionData);

    // Respond to the ESP32 with the bottle count and recyclability status
    return NextResponse.json({
      success: true,
      isRecyclable: visionData.isRecyclable,
      bottleCount: visionData.bottleCount,
    });

  } catch (error) {
    console.error('Error processing image:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
