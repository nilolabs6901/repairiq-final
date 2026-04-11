import { NextResponse } from 'next/server';

// This endpoint is designed to be called by a cron job (e.g., Vercel Cron)
// It checks the CPSC database for new recalls matching subscriber alerts
// and sends SMS notifications via Twilio.
//
// To set up on Vercel, add to vercel.json:
// { "crons": [{ "path": "/api/recall-alerts/check", "schedule": "0 9 * * *" }] }

export async function GET(request: Request) {
  // Auth check — only allow cron or admin calls
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');
  const cronSecret = request.headers.get('authorization');

  if (
    process.env.CRON_SECRET &&
    cronSecret !== `Bearer ${process.env.CRON_SECRET}` &&
    key !== process.env.ADMIN_API_KEY
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

  if (!twilioSid || !twilioAuth || !twilioPhone) {
    return NextResponse.json({
      message: 'Twilio not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER.',
      checked: 0,
      sent: 0,
    });
  }

  try {
    // Fetch active subscriptions
    const baseUrl = new URL(request.url).origin;
    const subsRes = await fetch(`${baseUrl}/api/recall-alerts`);
    const subsData = await subsRes.json();
    const subscriptions = subsData.subscriptions || [];

    if (subscriptions.length === 0) {
      return NextResponse.json({ message: 'No active subscriptions', checked: 0, sent: 0 });
    }

    // Fetch recent recalls from CPSC (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const year = thirtyDaysAgo.getFullYear();

    const cpscUrl = `https://www.saferproducts.gov/RestWebServices/Recall?format=json&RecallDateStart=${year}`;
    const cpscRes = await fetch(cpscUrl, {
      headers: { 'Accept': 'application/json' },
    });

    if (!cpscRes.ok) {
      throw new Error(`CPSC API returned ${cpscRes.status}`);
    }

    const recalls = await cpscRes.json();

    // Filter to last 30 days only
    const recentRecalls = recalls.filter((r: any) => {
      try {
        return new Date(r.RecallDate) >= thirtyDaysAgo;
      } catch { return false; }
    });

    let alertsSent = 0;

    // For each subscription, check if any recent recalls match
    for (const sub of subscriptions) {
      const typeLower = sub.applianceType.toLowerCase();
      const brandLower = (sub.brand || '').toLowerCase();

      const matches = recentRecalls.filter((recall: any) => {
        const title = (recall.Title || '').toLowerCase();
        const desc = (recall.Description || '').toLowerCase();
        const products = (recall.Products || [])
          .map((p: any) => `${p.Name || ''} ${p.Description || ''}`.toLowerCase())
          .join(' ');
        const manufacturers = (recall.Manufacturers || [])
          .map((m: any) => (m.Name || '').toLowerCase())
          .join(' ');
        const combined = `${title} ${desc} ${products} ${manufacturers}`;

        const typeMatch = combined.includes(typeLower);
        const brandMatch = !brandLower || combined.includes(brandLower);

        return typeMatch && brandMatch;
      });

      if (matches.length > 0) {
        const recall = matches[0];
        const recallTitle = recall.Title || 'Unknown recall';
        const recallUrl = recall.URL || 'https://www.cpsc.gov/Recalls';

        try {
          const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
          await fetch(twilioUrl, {
            method: 'POST',
            headers: {
              'Authorization': 'Basic ' + btoa(`${twilioSid}:${twilioAuth}`),
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              To: sub.phone,
              From: twilioPhone,
              Body: `⚠️ RepairIQ Recall Alert: ${recallTitle}\n\nThis may affect your ${sub.applianceType}${sub.brand ? ` (${sub.brand})` : ''}.\n\nDetails: ${recallUrl}\n\nReply STOP to unsubscribe.`,
            }),
          });
          alertsSent++;
        } catch (smsErr) {
          console.error(`Failed to send SMS to ${sub.phone}:`, smsErr);
        }
      }
    }

    return NextResponse.json({
      message: 'Recall check complete',
      checked: subscriptions.length,
      recentRecalls: recentRecalls.length,
      sent: alertsSent,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Recall alert check error:', error);
    return NextResponse.json(
      { error: 'Failed to check recalls' },
      { status: 500 }
    );
  }
}
