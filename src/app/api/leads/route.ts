import { NextResponse } from 'next/server';
import { LeadCapture } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// In-memory storage for demo (replace with database in production)
const leadsStorage: LeadCapture[] = [];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      phone,
      email,
      address,
      zipCode,
      problemDescription,
      diagnosisId,
      itemType,
      issueTitle,
      preferredContactTime,
      preferredContactMethod,
      urgency,
      selectedProfessionalId,
      selectedProfessionalName,
    } = body;

    // Validate required fields
    if (!name || !phone || !email || !problemDescription) {
      return NextResponse.json(
        { error: 'Name, phone, email, and problem description are required' },
        { status: 400 }
      );
    }

    // Create lead
    const lead: LeadCapture = {
      id: uuidv4(),
      createdAt: new Date(),
      name,
      phone,
      email,
      address: address || '',
      zipCode: zipCode || '',
      problemDescription,
      diagnosisId,
      itemType,
      issueTitle,
      preferredContactTime: preferredContactTime || 'anytime',
      preferredContactMethod: preferredContactMethod || 'phone',
      urgency: urgency || 'flexible',
      selectedProfessionalId,
      selectedProfessionalName,
    };

    // Store locally
    leadsStorage.push(lead);

    // Send to webhook if configured
    const webhookUrl = process.env.WEBHOOK_URL;
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            event: 'new_lead',
            lead,
            timestamp: new Date().toISOString(),
          }),
        });
        console.log('Lead sent to webhook successfully');
      } catch (webhookError) {
        console.error('Failed to send lead to webhook:', webhookError);
        // Don't fail the request if webhook fails
      }
    }

    // Send email notification if configured (using a simple email API)
    const notificationEmail = process.env.LEAD_NOTIFICATION_EMAIL;
    if (notificationEmail && process.env.SENDGRID_API_KEY) {
      try {
        await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: notificationEmail }] }],
            from: { email: 'leads@repairiq.app', name: 'RepairIQ Leads' },
            subject: `New Lead: ${itemType || 'Home Repair'} - ${urgency === 'emergency' ? 'URGENT' : 'Normal'}`,
            content: [
              {
                type: 'text/html',
                value: `
                  <h2>New Lead from RepairIQ</h2>
                  <p><strong>Name:</strong> ${name}</p>
                  <p><strong>Phone:</strong> ${phone}</p>
                  <p><strong>Email:</strong> ${email}</p>
                  <p><strong>Address:</strong> ${address || 'Not provided'}</p>
                  <p><strong>Zip Code:</strong> ${zipCode || 'Not provided'}</p>
                  <p><strong>Problem:</strong> ${problemDescription}</p>
                  <p><strong>Item Type:</strong> ${itemType || 'Not specified'}</p>
                  <p><strong>Issue:</strong> ${issueTitle || 'Not specified'}</p>
                  <p><strong>Urgency:</strong> ${urgency}</p>
                  <p><strong>Preferred Contact:</strong> ${preferredContactMethod} - ${preferredContactTime}</p>
                  ${selectedProfessionalName ? `<p><strong>Selected Pro:</strong> ${selectedProfessionalName}</p>` : ''}
                `,
              },
            ],
          }),
        });
        console.log('Lead notification email sent');
      } catch (emailError) {
        console.error('Failed to send lead notification email:', emailError);
      }
    }

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      message: 'Your request has been submitted. A professional will contact you soon.',
    });
  } catch (error) {
    console.error('Leads API error:', error);
    return NextResponse.json(
      { error: 'Failed to submit lead' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve leads (for admin purposes)
export async function GET(request: Request) {
  // In production, this should be protected with authentication
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '50');

  return NextResponse.json({
    leads: leadsStorage.slice(-limit),
    total: leadsStorage.length,
  });
}
