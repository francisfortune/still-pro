# STILL — Browser Extension

The STILL browser extension quietly monitors your browsing while you have an active session. When you open a potentially distracting site, it gently surfaces your current intention and asks: **"Why are you here?"**

## Features

- Gentle overlay on distraction sites (YouTube, TikTok, Instagram, etc.)
- Intentional vs. accidental distraction recognition
- Follow-up reminders when intentionally browsing ("Still looking for that tutorial?")
- Pause/resume your session from the popup
- Customisable distraction site list
- Push notifications (periodic check-ins)
- Dark mode automatic via `prefers-color-scheme`

## Installation (Developer Mode)

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select the `still-extension/` folder
5. The STILL icon will appear in your Chrome toolbar

> **Note:** You need to create icon files before loading the extension.
> See the "Icons" section below.

## Icons

You need PNG icon files at these paths inside `still-extension/icons/`:
- `icon16.png` — 16×16
- `icon32.png` — 32×32
- `icon48.png` — 48×48
- `icon128.png` — 128×128

You can generate them from the STILL logo (a blue square with "STILL" text) using any image editor, or use a service like [favicon.io](https://favicon.io).

A simple blue square works well as the icon:
- Background: `#2563EB`
- Text: White, font Inter, bold

## Connecting to the STILL App

The extension stores sessions in `chrome.storage.local` using the same key structure as the PWA (`still_active`, `still_sessions`, `still_distractions`).

To sync between the extension and your PWA:
1. When the user starts a session in the PWA, also write to `chrome.storage.local` via the extension's message API
2. Or: use Firebase Firestore as the shared store (both the PWA and extension read/write to Firestore)

See `API_SETUP.md` in the project root for Firebase setup instructions.

## Files

| File | Purpose |
|------|---------|
| `manifest.json` | Extension manifest (Manifest V3) |
| `background.js` | Service worker — alarm management, message routing, distraction logging |
| `content.js` | Injected into every page — detects distraction sites, shows overlay |
| `popup.html` | Extension popup UI (click the toolbar icon) |
| `popup.js` | Popup logic — session display, timer, settings |

## Publishing to Chrome Web Store

1. Zip the `still-extension/` folder
2. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
3. Pay the one-time $5 developer fee
4. Upload the zip
5. Fill in the store listing (name, description, screenshots)
6. Submit for review (usually 1-3 business days)
