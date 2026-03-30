import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// In-memory storage for demo (replace with database in production)
const savedDiagnosesStorage: Array<{
  id: string;
  email: string;
  diagnosisId: string;
  itemDescription: string;
  savedAt: string;
}> = [];

export async function POST(request: Request) {
  try {
    const { email, diagnosisId, itemDescription } = await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      );
    }

    if (!diagnosisId) {
      return NextResponse.json(
        { error: 'Diagnosis ID is required' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://repairiq.app';
    const diagnosisLink = `${baseUrl}/diagnose?session=${diagnosisId}`;

    const record = {
      id: uuidv4(),
      email,
      diagnosisId,
      itemDescription: itemDescription || 'Your repair diagnosis',
      savedAt: new Date().toISOString(),
    };

    savedDiagnosesStorage.push(record);

    // Send email with diagnosis link via Resend
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
            from: process.env.RESEND_FROM_EMAIL || 'RepairIQ <noreply@repairiq.app>',
            to: [email],
            subject: `Your RepairIQ Diagnosis: ${itemDescription || 'Repair Guide'}`,
            html: `
              <div style="font-family: -apple-system, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 16px;">
                <h1 style="color: #22c55e; font-size: 24px; margin-bottom: 8px;">Your Saved Diagnosis</h1>
                <p style="color: #6b7280; font-size: 14px; margin-bottom: 24px;">
                  ${itemDescription || 'Repair diagnosis'}
                </p>
                <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                  Your diagnosis has been saved. Use the link below to come back to it anytime —
                  your repair steps, parts list, and all tools will be right where you left them.
                </p>
                <a href="${diagnosisLink}"
                   style="display: inline-block; background: #22c55e; color: white; padding: 14px 28px;
                          border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px;">
                  Open My Diagnosis
                </a>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
                <p style="color: #9ca3af; font-size: 13px;">
                  Saved from RepairIQ on ${new Date().toLocaleDateString()}.
                  <br />This diagnosis is stored in your browser. Open the link on the same device for best results.
                </p>
              </div>
            `,
          }),
        });
      } catch (emailError) {
        console.error('Failed to send diagnosis email:', emailError);
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
            event: 'diagnosis_saved',
            record,
            timestamp: new Date().toISOString(),
          }),
        });
      } catch {
        // non-blocking
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Diagnosis saved! Check your email for the link.',
    });
  } catch (error) {
    console.error('Save diagnosis API error:', error);
    return NextResponse.json(
      { error: 'Failed to save diagnosis' },
      { status: 500 }
    );
  }
}
