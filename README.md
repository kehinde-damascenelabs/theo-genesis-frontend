# Theo Genesis — Frontend

A browser-based voice agent prototype for restaurant scheduling: real-time spoken conversation over WebRTC,
straight to OpenAI's Realtime API, with tool calls that check the weather, pull up the menu, and book a table on
Google Calendar.

This was an early, pre-company research prototype exploring what became
[Theo](https://github.com/kehinde-damascenelabs), Damascene Labs' AI voice platform. It predates the company and is
not under active development — kept public as a reference for the WebRTC + OpenAI Realtime integration pattern it
implements. Full architecture, route list, and known issues are documented in the paired backend's
[theo-genesis-backend README](https://github.com/kehinde-damascenelabs/theo-genesis-backend).

## What's actually interesting here

The client negotiates WebRTC directly with OpenAI's Realtime API — audio never round-trips through this app's own
backend. The backend's only job is to hand the browser a short-lived ephemeral key so a long-lived secret never
reaches the client. Tool calls (booking, weather, menu lookups) arrive over the WebRTC data channel mid-conversation
and are handled in [`src/service/function_calling.js`](src/service/function_calling.js).

## Setup

This frontend needs the backend running alongside it — see
[theo-genesis-backend](https://github.com/kehinde-damascenelabs/theo-genesis-backend) for that half.

```bash
# 1. backend first (separate repo/terminal)
#    see theo-genesis-backend's README — it must be up before this app can do anything

# 2. this app
npm install
cp .env.example .env.local   # fill in real values — see comments in the file
npm run dev                  # -> http://localhost:3001
```

The dev server is pinned to port 3001 because the backend's CORS allowlist is keyed off `F_LOCAL_HOST_PORT`
(default `3001`) — a frontend on any other port gets rejected.

```bash
npm run build   # production build
npm test        # jest
```

## Known issues

- **The voice agent cannot currently start a conversation.** This is a backend problem — see
  [theo-genesis-backend](https://github.com/kehinde-damascenelabs/theo-genesis-backend)'s README for the retired
  OpenAI endpoint this depends on.
- **All backend calls are hardcoded to a Railway URL** in `src/service/` and `src/utils/transcriptService.js`,
  with the localhost alternative commented out above each one. That deployment has also been inactive since
  November 2025. Point these at `NEXT_PUBLIC_API_BASE_URL` from `.env.local` to run against a local backend.
- **`npm run lint` is broken** (`next lint` fails to serialize the ESLint config), and the project-root
  `babel.config.js` — needed only for Jest — also disables Next's SWC compiler for the production build.
- **The live demo records the visitor's microphone** and uploads it to the backend's S3 bucket on hang-up, with no
  consent notice shown before a session starts. If you deploy this, add one first.

## About this project

Built with [Next.js](https://nextjs.org), bootstrapped from `create-next-app`.
