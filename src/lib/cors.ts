import { NextResponse } from 'next/server';

const ALLOWED_ORIGINS = [
  'capacitor://localhost',
  'ionic://localhost',
  'http://localhost',
  'http://localhost:3000',
];

export function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('origin') || '';
  const isAllowed = ALLOWED_ORIGINS.includes(origin) || origin.endsWith('.vercel.app');

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : '',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export function handleCorsPreflightRequest(request: Request): NextResponse | null {
  if (request.method === 'OPTIONS') {
    return NextResponse.json(null, { status: 204, headers: corsHeaders(request) });
  }
  return null;
}

export function jsonWithCors(
  request: Request,
  data: unknown,
  options?: { status?: number }
): NextResponse {
  return NextResponse.json(data, {
    status: options?.status,
    headers: corsHeaders(request),
  });
}
