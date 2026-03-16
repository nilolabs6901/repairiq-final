/**
 * API base URL for making requests to the backend.
 * In Capacitor (iOS/Android), the frontend is served from local files,
 * so API calls must go to the remote backend.
 * In web/dev, this defaults to '' (same-origin).
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
