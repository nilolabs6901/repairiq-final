import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// In-memory storage for demo (replace with database in production)
const subscribersStorage: Array<{
  id: string;
  email: string;
  subscribedAt: string;
}> = [];

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      );
    }

    // Check duplicate
    const existing = subscribersStorage.find(s => s.email === email);
    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'You are already subscribed!',
      });
    }

    const subscriber = {
      id: uuidv4(),
      email,
      subscribedAt: new Date().toISOString(),
    };

    subscribersStorage.push(subscriber);

    // Send welcome email via Resend if configured
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM_EMAIL || 'RepairIQ <tips@repairiq.app>',
            to: [email],
            subject: 'Welcome to RepairIQ Weekly Tips!',
            html: `
              <div style="font-family: -apple-system, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 16px;">
                <h1 style="color: #22c55e; font-size: 24px; margin-bottom: 16px;">Welcome to RepairIQ Tips!</h1>
                <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                  You'll receive one quick appliance maintenance tip every week — the kind of simple stuff
                  that saves you hundreds in repair bills.
                </p>
                <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                  Here's your first tip: <strong>Clean your refrigerator's condenser coils every 6 months.</strong>
                  Dusty coils make the compressor work 25% harder, shortening its life and raising your electric bill.
                </p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
                <p style="color: #9ca3af; font-size: 13px;">
                  You signed up at RepairIQ. Reply to this email if you have questions.
                  <br />To unsubscribe, reply with "unsubscribe".
                </p>
              </div>
            `,
          }),
        });
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't fail the request if email fails
      }
    }

    // Notify webhook if configured
    const webhookUrl = process.env.WEBHOOK_URL;
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'new_subscriber',
            subscriber,
            timestamp: new Date().toISOString(),
          }),
        });
      } catch {
        // non-blocking
      }
    }

    return NextResponse.json({
      success: true,
      subscriberId: subscriber.id,
      message: 'Successfully subscribed to weekly tips!',
    });
  } catch (error) {
    console.error('Subscribe API error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Admin endpoint (protect with auth in production)
  return NextResponse.json({
    subscribers: subscribersStorage,
    total: subscribersStorage.length,
  });
}
