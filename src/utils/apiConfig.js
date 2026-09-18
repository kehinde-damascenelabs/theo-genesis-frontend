// Base URL of the theo-genesis-backend service.
//
// Falls back to the Railway deployment so behavior is unchanged for any build
// that doesn't set NEXT_PUBLIC_API_BASE_URL (e.g. the current Vercel deploy,
// which predates this variable). Set it in .env.local to run against a local
// backend instead — see .env.example.
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://openaibackend-production.up.railway.app';
