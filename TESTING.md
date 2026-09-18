# Manual test plan

The automated checks cover the backend HTTP contract. They cannot cover microphone
capture, WebRTC negotiation, or whether the agent actually sounds right — those need a
human with a working mic. This document covers both halves.

Status column reflects a full pass run on **2026-09-17** against `main` of both repos.

---

## 0. Prerequisites

- Node 20+ (verified on 24.4.0)
- A microphone, and a Chromium or Safari browser (WebRTC + `getUserMedia`)
- An OpenAI API key with Realtime API access
- Optional, for the side panels: a Google Places API key, a Google Calendar OAuth
  client, a weather API key

Both repos must run at once. They are two halves of one app:

| Repo | Role | Port |
|---|---|---|
| `openai_backend` | Mints OpenAI ephemeral keys, calendar/weather/S3 | 3000 |
| `ai-voice-agent_v0.1` | Next.js browser client, WebRTC to OpenAI | 3001 |

The frontend port is not optional. The backend's CORS allowlist is built from
`F_LOCAL_HOST_PORT` (default `3001`), so a frontend on any other port is rejected.
`next dev` defaults to 3000 and will collide with the backend, so the port must be
passed explicitly.

## 1. Bring both up

```bash
# terminal 1 — backend
cd openai_backend
cp .env.example .env      # then fill in real values
npm install
npm start                 # -> http://localhost:3000
```

```bash
# terminal 2 — frontend
cd ai-voice-agent_v0.1
cp .env.example .env.local   # then fill in real values
npm install
npm run dev                  # -> http://localhost:3001
```

| # | Check | Expected | Status |
|---|---|---|---|
| 1.1 | Backend logs `Server running on port 3000` | JSON log line | PASS |
| 1.2 | Backend boots with an incomplete `.env` | Clear error naming the missing var | PASS — throws listing `API_KEYS, OPENAI_API_KEY` |
| 1.3 | Frontend compiles and serves 3001 | `Ready in …` | PASS |
| 1.4 | `npm run build` succeeds | Optimized build | PASS |
| 1.5 | `npm run lint` succeeds | Lint report | **FAIL** — `Cannot serialize key "parse" in parser` |

## 2. Backend contract

```bash
cd openai_backend
node scripts/smoke-test.mjs
```

Run it against the deployment too:

```bash
BASE_URL=https://your-deploy.example.com API_KEY=… node scripts/smoke-test.mjs
```

Last local run: 9 passed, 3 failed, 7 warnings, 2 skipped. See §6.

## 3. Page load

| # | Check | Expected | Status |
|---|---|---|---|
| 3.1 | Page renders without a console error | Clean console | **FAIL** — `placeDetails.configureFromPlace is not a function` |
| 3.2 | Browser tab title names the right product | — | **FAIL** — reads `Genesis Labs Voice AI Demo` |
| 3.3 | Footer names the right product | — | **FAIL** — reads `Genesis Labs` |
| 3.4 | Restaurant Info panel loads place details | Address, hours, photos | **FAIL** — Google Maps `InvalidKey`, and the panel pins `v=alpha` |
| 3.5 | Menu panel matches the restaurant the agent believes it works for | Same restaurant both sides | **FAIL** — UI shows Eleven Madison Park, backend prompt says Miti Miti |
| 3.6 | No Google "development purposes only" watermark | No banner | **FAIL** — alpha-channel banner shown |

## 4. Voice session — the happy path

**Not yet verified.** These steps need a real microphone; they could not be exercised
in the automated environment (`getUserMedia` → `NotAllowedError: Permission denied`).
They are also expected to fail ahead of the §6 fixes, because the ephemeral-key mint
is broken upstream.

| # | Step | Expected |
|---|---|---|
| 4.1 | Click **Connect**, grant mic permission | Button enters a connecting/live state |
| 4.2 | Watch the network tab | `GET /getEKey` returns `{ ephemeralKey }` |
| 4.3 | — | `POST api.openai.com/v1/realtime…` completes the SDP exchange |
| 4.4 | Say "hello" | Waveform reacts to your voice |
| 4.5 | — | Agent replies in audio within roughly a second |
| 4.6 | — | Both turns appear in the Transcript panel |
| 4.7 | Ask what's on the menu | Agent describes the *same* restaurant the Menu panel shows |
| 4.8 | Book a table: name, date, time, party size | Agent confirms out loud |
| 4.9 | Open the Calendar panel | Reservation appears |
| 4.10 | Check Google Calendar | Event exists with the right details |
| 4.11 | Ask to change it to a different time | Agent confirms; Calendar panel updates |
| 4.12 | Ask to cancel it | Agent confirms; event disappears |
| 4.13 | Ask for the weather | Agent gives a forecast |
| 4.14 | Click **Connect** again to disconnect | Session ends cleanly |
| 4.15 | Check `chrome://webrtc-internals` | No peer connection left open |
| 4.16 | Reconnect and repeat 4.4–4.6 | Works a second time, no leak |

### 4b. Failure and edge behaviour

| # | Step | Expected | Status |
|---|---|---|---|
| 4b.1 | Deny mic permission, click Connect | A visible message explaining the problem | **FAIL** — console-only; button silently reverts to `Connect` |
| 4b.2 | Stop the backend, click Connect | A visible "can't reach the server" message | **FAIL** — same silent revert |
| 4b.3 | Disconnect mid-sentence | Clean teardown, no dangling audio | Not verified |
| 4b.4 | Book a reservation for a date in the past | Agent refuses | Not verified |
| 4b.5 | Book for two guests with the same name | Both bookings survive independently | **Expected FAIL** — events are keyed by name |
| 4b.6 | Hold one session for 5+ minutes | Session survives or reconnects | Not verified |
| 4b.7 | Reload mid-session | No orphaned peer connection | Not verified |

## 5. Feedback form

| # | Check | Expected | Status |
|---|---|---|---|
| 5.1 | Submit the form | Success alert | Not verified — posts to a live Google Apps Script endpoint |
| 5.2 | Submit with every field empty | Rejected client-side | **FAIL** — no validation; empty rows are accepted |

## 6. Known broken as of 2026-09-17

Ordered by what blocks a working demo.

1. **The voice agent cannot start at all.** `backend/controllers/openaiController.js`
   posts to `https://api.openai.com/v1/realtime/sessions`, which OpenAI retired — it
   now returns `404 Invalid URL`. The model `gpt-4o-realtime-preview-2024-12-17` is
   retired too. The current endpoint is `POST /v1/realtime/client_secrets`. Everything
   downstream (`/getEKey`, the frontend's WebRTC setup) fails because of this.
2. **The frontend cannot talk to a local backend.** Every call site hardcodes the
   Railway URL with the localhost line commented out just above it
   (`src/service/realtimeAPI/startConnection.js`, `src/service/function_calling.js`,
   `src/service/sessionRecorder.js`, `src/utils/transcriptService.js`). One call in
   `transcriptService.js` still points at localhost, so the two disagree. This needs a
   single `NEXT_PUBLIC_API_BASE_URL`.
3. **Auth is bypassable with one character.** `middleware/apiKey.js` does
   `config.apiKeys.includes(key)` against the raw comma-separated string, so any
   substring authenticates — `x-api-key: l` is enough. Verified live.
4. **Most routes have no auth at all.** `server.js` imports `apiKeyMiddleware` and
   never applies it. Only `/session` uses it, so `/getEKey`, `/calendar/*`,
   `/weather/*` and `/audio/*` are open to anyone.
5. **`NODE_ENV` defaults to `development`, which fails open.** `errorHandler.js`
   suppresses stack traces only when the environment is not `development`, and
   `config/env.js` defaults it to `development`. A deploy that forgets to set
   `NODE_ENV` therefore returns stack traces with absolute filesystem paths.
   The current Railway deployment does set it, so it is not leaking today —
   but the default is the wrong way round. Verified locally.
6. **9 frontend tests fail** across 4 suites: `startConnection.test.js` (asserts the
   localhost URL the source no longer uses), `useConversation.test.js` (4),
   `useMicrophone.test.js` (4).
7. **`npm run lint` is broken** — `next lint` dies on
   `Cannot serialize key "parse" in parser`. Root cause is the project-root
   `babel.config.js`, which also disables SWC for every build.
8. **Restaurant identity is inconsistent** between the two repos: the agent prompt
   says Miti Miti, the UI says Eleven Madison Park.
9. **Stale branding** — `Genesis Labs` in `src/app/layout.jsx` and
   `src/components/Footer.jsx`.
10. **The Restaurant Info panel is broken** — it pins the Google Maps
    `v=alpha` channel, whose API changed underneath it.
11. **Rate limiting is set to 5 requests/minute across all routes**, which one normal
    session exceeds. `/getEKey`'s HTTP round-trip to its own `/session` consumes the
    same budget.
