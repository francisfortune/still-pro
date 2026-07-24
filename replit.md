# STILL

A mindfulness focus app with the philosophy "Stay with what you're doing." STILL asks one question — "What are you doing right now?" — and holds space for the answer. No streaks, no dashboards, no guilt.

## Run & Operate

- `pnpm --filter @workspace/still-app run dev` — run the PWA (port auto-assigned)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite (PWA)
- Routing: wouter
- Theme: next-themes (light + dark mode)
- Animations: framer-motion
- Storage: localStorage (Firebase SDK installed for future cloud sync)
- Notifications: OneSignal (via env var)
- Browser Extension: Manifest V3 (Chrome/Edge)

## Where things live

- `artifacts/still-app/` — the main PWA (React + Vite)
- `artifacts/still-app/src/lib/storage.ts` — typed localStorage helpers
- `artifacts/still-app/src/lib/firebase.ts` — Firebase config (uses VITE_ env vars)
- `still-extension/` — browser extension (Manifest V3) — load unpacked from Chrome
- `API_SETUP.md` — step-by-step guide for all required API keys

## Environment Variables (Replit Secrets)

| Key | Purpose |
|-----|---------|
| `VITE_FIREBASE_API_KEY` | Firebase |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase |
| `VITE_FIREBASE_PROJECT_ID` | Firebase |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase |
| `VITE_FIREBASE_APP_ID` | Firebase |
| `VITE_ONESIGNAL_APP_ID` | OneSignal push notifications |

## Architecture decisions

- localStorage-first: App works fully offline with no keys set; Firebase is wired but not required until user adds keys.
- Extension and PWA share the same localStorage key schema (`still_active`, `still_sessions`, `still_distractions`, `still_projects`) so they stay in sync locally.
- No backend API needed — all data is client-side (Firebase Firestore is the cloud option).
- PWA manifest at `public/manifest.json` with blue (#2563EB) theme colour.

## Product

STILL is a focus app built around one active intention at a time:
1. **Landing** — user types what they're doing and starts a session
2. **Session** — full-screen timer with their intention, pause/finish controls
3. **Break** — intentional rest with optional countdown
4. **Done** — calm session summary + accomplishment note
5. **Today** — daily timeline of sessions
6. **Week** — weekly summary + distraction map
7. **Still Building** — project tracker (no streak pressure)
8. **Browser Extension** — gentle overlay on distraction sites

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- All VITE_ env vars must be set before the app can sync to Firebase; it works on localStorage without them.
- Browser extension icons must be created manually (PNG files in `still-extension/icons/`).
- Extension must be loaded unpacked in Chrome Developer mode before publishing.
- `pnpm add` for `onesignal-web` package doesn't exist in npm; use the CDN script tag approach in index.html instead.

## Pointers

- See `API_SETUP.md` for full instructions on getting Firebase, OneSignal, and Chrome Web Store credentials
- See `still-extension/README.md` for extension installation and publishing steps
- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
