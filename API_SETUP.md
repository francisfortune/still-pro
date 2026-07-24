# STILL — API Keys & Services Setup Guide

This document tells you exactly which external services STILL uses, where to get each key, and where to add it.

---

## 1. Firebase (Database + Authentication)

Firebase is used to store sessions, projects, and distraction data in the cloud — so your data syncs across devices.

### Step 1: Create a Firebase Project

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project**
3. Name it `still-app` (or anything you like)
4. Disable Google Analytics (not needed)
5. Click **Create project**

### Step 2: Add a Web App

1. Inside your project, click the **</>** (Web) icon
2. Register the app with nickname `STILL Web`
3. **Do NOT** check "Firebase Hosting" — we're using Replit
4. Click **Register app**
5. Firebase will show you a config object like this:

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "still-app-xxxxx.firebaseapp.com",
  projectId: "still-app-xxxxx",
  storageBucket: "still-app-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

### Step 3: Enable Firestore Database

1. In the Firebase console sidebar → **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (for development)
4. Select a region close to you (e.g. `europe-west1` for Africa/Europe)
5. Click **Enable**

### Step 4: Enable Authentication (Optional but recommended)

1. Sidebar → **Authentication** → **Get started**
2. Enable **Anonymous** sign-in (so users don't need to register)
3. Optionally also enable **Google** sign-in for a full account

### Step 5: Add Keys to Replit

1. In your Replit project, click the **Secrets** tab (lock icon in sidebar)
2. Add each of these secrets:

| Secret Key | Value (from Firebase config above) |
|---|---|
| `VITE_FIREBASE_API_KEY` | Your `apiKey` value |
| `VITE_FIREBASE_AUTH_DOMAIN` | Your `authDomain` value |
| `VITE_FIREBASE_PROJECT_ID` | Your `projectId` value |
| `VITE_FIREBASE_STORAGE_BUCKET` | Your `storageBucket` value |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Your `messagingSenderId` value |
| `VITE_FIREBASE_APP_ID` | Your `appId` value |

> **Important:** All keys must start with `VITE_` so they are available in the frontend.

### Firestore Data Structure

STILL uses these collections:

```
users/{userId}
  - createdAt: timestamp
  - settings: object

sessions/{sessionId}
  - userId: string
  - intention: string
  - startedAt: timestamp
  - endedAt: timestamp
  - duration: number (milliseconds)
  - accomplishment: string
  - breaks: array

distractions/{distractionId}
  - userId: string
  - sessionId: string
  - site: string
  - wasIntentional: boolean
  - reason: string
  - timestamp: timestamp

projects/{projectId}
  - userId: string
  - name: string
  - startedAt: timestamp
  - lastSessionAt: timestamp
  - totalMinutes: number
```

### Free Tier Limits

Firebase's free Spark plan includes:
- **50,000 reads/day** — more than enough for personal use
- **20,000 writes/day**
- **1 GB storage**
- No credit card required

---

## 2. OneSignal (Push Notifications)

OneSignal sends push notifications to users — e.g., "Still working on it?" check-in reminders.

### Step 1: Create an Account

1. Go to [https://onesignal.com](https://onesignal.com)
2. Sign up for a free account
3. Click **New App/Website**
4. Name it `STILL`

### Step 2: Configure Web Push

1. Select **Web** as the platform
2. Choose **Typical Site**
3. Enter your site details:
   - **Site Name:** STILL
   - **Site URL:** Your Replit app URL (e.g. `https://still-app.your-username.repl.co`) or your custom domain
   - **Default Icon:** Upload a 192×192 PNG of your STILL icon (blue square)
4. Click **Save & Continue**

### Step 3: Get Your App ID

After setup, OneSignal shows your **App ID** (a UUID like `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`).

### Step 4: Add to Replit Secrets

| Secret Key | Value |
|---|---|
| `VITE_ONESIGNAL_APP_ID` | Your OneSignal App ID |

### Step 5: Add the OneSignal SDK

Add this to your `index.html` `<head>` tag:

```html
<script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" defer></script>
<script>
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  OneSignalDeferred.push(async function(OneSignal) {
    await OneSignal.init({
      appId: "YOUR_ONESIGNAL_APP_ID",
      notifyButton: { enable: false },
      serviceWorkerParam: { scope: '/push/onesignal/' },
    });
  });
</script>
```

Replace `YOUR_ONESIGNAL_APP_ID` with the value from your Replit secret: `import.meta.env.VITE_ONESIGNAL_APP_ID`.

### Free Tier Limits

- **Unlimited push notifications** — free forever
- No credit card required

---

## 3. Chrome Web Store (Publishing the Browser Extension)

To publish the STILL browser extension so others can install it.

### Step 1: Developer Account

1. Go to [https://chrome.google.com/webstore/devconsole](https://chrome.google.com/webstore/devconsole)
2. Sign in with a Google account
3. Pay the one-time **$5 USD** developer registration fee

### Step 2: Prepare the Extension

1. Create icons for the extension (PNG files):
   - `still-extension/icons/icon16.png` — 16×16 px
   - `still-extension/icons/icon32.png` — 32×32 px
   - `still-extension/icons/icon48.png` — 48×48 px
   - `still-extension/icons/icon128.png` — 128×128 px
   - Use a blue (`#2563EB`) square background with white "S" or "STILL" text
2. Zip the entire `still-extension/` folder

### Step 3: Upload & Publish

1. In Developer Dashboard → **Add new item**
2. Upload your zip file
3. Fill in:
   - **Name:** STILL — Stay with what you're doing
   - **Short Description:** A gentle focus companion that reminds you of your intention when you drift.
   - **Detailed Description:** (describe the distraction overlay feature)
   - **Screenshots:** At least 1 screenshot (1280×800 or 640×400)
   - **Category:** Productivity
4. Under **Privacy** — declare that the extension accesses browsing activity (for the content script)
5. Submit for review — usually takes 1–3 business days

### No API key needed for Chrome Web Store — just the $5 one-time fee.

---

## 4. (Optional) Firebase Cloud Messaging — Web Push via Firebase

If you prefer Firebase for push notifications instead of OneSignal:

### Step 1: Enable Cloud Messaging

1. Firebase Console → **Project Settings** → **Cloud Messaging** tab
2. Note the **Sender ID** (already in your config as `messagingSenderId`)
3. Under **Web configuration**, click **Generate key pair** — save the **VAPID key**

### Step 2: Add to Replit Secrets

| Secret Key | Value |
|---|---|
| `VITE_FIREBASE_VAPID_KEY` | Your VAPID public key |

### Step 3: Service Worker

Create `public/firebase-messaging-sw.js`:

```js
importScripts('https://www.gstatic.com/firebasejs/10.x.x/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.x.x/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
});

const messaging = firebase.messaging();
messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: '/icons/icon-192.png'
  });
});
```

---

## 5. (Optional) Custom Domain

To give STILL a proper URL like `still.app` or `mystillapp.com`:

1. Buy a domain from [Namecheap](https://namecheap.com), [Cloudflare](https://cloudflare.com/registrar), or similar (~$10-15/year)
2. In Replit → **Deploy** → add your custom domain
3. Update your OneSignal site URL to the custom domain
4. Update Firebase **Authorized domains**: Firebase Console → Authentication → Settings → Authorized Domains → Add your domain

---

## Summary Table

| Service | Purpose | Cost | Key(s) Needed |
|---|---|---|---|
| Firebase Firestore | Database (sessions, projects) | Free up to 50K reads/day | `VITE_FIREBASE_*` (6 keys) |
| Firebase Auth | User authentication | Free | Included with Firebase |
| OneSignal | Push notifications | Free forever | `VITE_ONESIGNAL_APP_ID` |
| Chrome Web Store | Publish browser extension | $5 one-time | No key needed |
| Custom Domain | Branded URL | ~$10-15/year | No key needed |

---

## Quick Start Checklist

- [ ] Create Firebase project and web app
- [ ] Enable Firestore in test mode
- [ ] Add all 6 `VITE_FIREBASE_*` secrets to Replit
- [ ] Create OneSignal account and add `VITE_ONESIGNAL_APP_ID` to Replit
- [ ] Restart the app workflow after adding secrets
- [ ] Create extension icons (4 PNG sizes)
- [ ] Load unpacked extension in Chrome (Developer mode)
- [ ] (Optional) Register Chrome Web Store developer account ($5)
- [ ] (Optional) Deploy to custom domain
