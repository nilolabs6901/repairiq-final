import { NextResponse } from 'next/server';

// Default to a friendly, clear voice - "Rachel" is a popular choice
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      console.error('ELEVENLABS_API_KEY environment variable is not set');
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured', available: false },
        { status: 503 }
      );
    }

    // Validate API key format (should start with sk_)
    if (!apiKey.startsWith('sk_')) {
      console.error('ELEVENLABS_API_KEY appears to be in wrong format (should start with sk_)');
      return NextResponse.json(
        { error: 'ElevenLabs API key format invalid', available: false },
        { status: 503 }
      );
    }

    // Call ElevenLabs Text-to-Speech API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to generate speech', details: errorText },
        { status: response.status }
      );
    }

    // Get the audio as an ArrayBuffer
    const audioBuffer = await response.arrayBuffer();

    // Return the audio with proper headers
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error('ElevenLabs API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate speech', details: String(error) },
      { status: 500 }
    );
  }
}

// GET endpoint to check if ElevenLabs is available
export async function GET() {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ available: false, reason: 'API key not configured' });
  }

  if (!apiKey.startsWith('sk_')) {
    return NextResponse.json({ available: false, reason: 'API key format invalid' });
  }

  return NextResponse.json({ available: true });
}
