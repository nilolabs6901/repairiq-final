import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

interface RecallAlertSubscription {
  id: string;
  phone: string;
  applianceType: string;
  brand: string;
  diagnosisId?: string;
  subscribedAt: string;
  lastChecked?: string;
  active: boolean;
}

// In-memory storage (replace with database in production)
const alertSubscriptions: RecallAlertSubscription[] = [];

export async function POST(request: Request) {
  try {
    const { phone, applianceType, brand, diagnosisId } = await request.json();

    if (!phone || !/^\+?[\d\s()-]{10,15}$/.test(phone.replace(/\s/g, ''))) {
      return NextResponse.json(
        { error: 'Valid phone number is required (e.g. +1 555-123-4567)' },
        { status: 400 }
      );
    }

    if (!applianceType) {
      return NextResponse.json(
        { error: 'Appliance type is required' },
        { status: 400 }
      );
    }

    // Normalize phone
    const normalizedPhone = phone.replace(/[^\d+]/g, '');

    // Check for duplicate
    const existing = alertSubscriptions.find(
      s => s.phone === normalizedPhone &&
           s.applianceType.toLowerCase() === applianceType.toLowerCase() &&
           s.active
    );
    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'You are already subscribed to recall alerts for this appliance.',
        subscriptionId: existing.id,
      });
    }

    const subscription: RecallAlertSubscription = {
      id: uuidv4(),
      phone: normalizedPhone,
      applianceType,
      brand: brand || '',
      diagnosisId,
      subscribedAt: new Date().toISOString(),
      active: true,
    };

    alertSubscriptions.push(subscription);

    // Send confirmation SMS via Twilio if configured
    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

    if (twilioSid && twilioAuth && twilioPhone) {
      try {
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
        await fetch(twilioUrl, {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + btoa(`${twilioSid}:${twilioAuth}`),
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            To: normalizedPhone,
            From: twilioPhone,
            Body: `RepairIQ: You're signed up for recall alerts on your ${applianceType}${brand ? ` (${brand})` : ''}. We'll text you if a safety recall is issued. Reply STOP to unsubscribe.`,
          }),
        });
      } catch (smsError) {
        console.error('Failed to send confirmation SMS:', smsError);
        // Don't fail the request if SMS fails
      }
    }

    // Notify webhook
    const webhookUrl = process.env.WEBHOOK_URL;
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'recall_alert_subscription',
            subscription,
            timestamp: new Date().toISOString(),
          }),
        });
      } catch {}
    }

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id,
      message: `Recall alerts activated for your ${applianceType}. We'll text ${phone} if a recall is issued.`,
    });
  } catch (error) {
    console.error('Recall alert subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe to recall alerts' },
      { status: 500 }
    );
  }
}

// GET: list subscriptions (admin)
export async function GET() {
  return NextResponse.json({
    subscriptions: alertSubscriptions.filter(s => s.active),
    total: alertSubscriptions.filter(s => s.active).length,
  });
}

// DELETE: unsubscribe
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const phone = searchParams.get('phone');

  const sub = alertSubscriptions.find(
    s => (id && s.id === id) || (phone && s.phone === phone.replace(/[^\d+]/g, ''))
  );

  if (sub) {
    sub.active = false;
    return NextResponse.json({ success: true, message: 'Unsubscribed from recall alerts.' });
  }

  return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
}
