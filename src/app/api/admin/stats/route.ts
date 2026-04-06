import { NextResponse } from 'next/server';
import { getMetrics } from '@/lib/metrics';

export async function GET(request: Request) {
  // Simple auth check — in production use proper auth
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');

  if (key !== process.env.ADMIN_API_KEY && process.env.ADMIN_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const metrics = getMetrics();

  // Fetch counts from other in-memory stores
  let subscriberCount = 0;
  let leadCount = 0;

  try {
    const subRes = await fetch(new URL('/api/subscribe', request.url).toString());
    const subData = await subRes.json();
    subscriberCount = subData.total || 0;
  } catch {}

  try {
    const leadRes = await fetch(new URL('/api/leads?limit=1', request.url).toString());
    const leadData = await leadRes.json();
    leadCount = leadData.total || 0;
  } catch {}

  return NextResponse.json({
    metrics: {
      ...metrics,
      subscriberCount,
      leadCount,
    },
    serverInfo: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      note: 'Metrics are in-memory and reset on server restart. Connect a database for persistence.',
    },
  });
}
