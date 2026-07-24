// Firebase configuration
// Set these environment variables in your .env file or Replit Secrets:
// VITE_FIREBASE_API_KEY
// VITE_FIREBASE_AUTH_DOMAIN
// VITE_FIREBASE_PROJECT_ID
// VITE_FIREBASE_STORAGE_BUCKET
// VITE_FIREBASE_MESSAGING_SENDER_ID
// VITE_FIREBASE_APP_ID

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Only initialize if config values are present
const hasConfig = Object.values(firebaseConfig).every(Boolean);

export const app = hasConfig ? initializeApp(firebaseConfig) : null;
export const db = app ? getFirestore(app) : null;
export const auth = app ? getAuth(app) : null;

export { hasConfig };
