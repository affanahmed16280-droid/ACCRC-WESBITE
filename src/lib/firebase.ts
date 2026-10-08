import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth, inMemoryPersistence, setPersistence, signOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDummyApiKeyForPrerendering12345",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "accrc-demo.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "accrc-demo",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "accrc-demo.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1234567890:web:1234567890",
};

// Validate Firebase config
if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY || !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
  if (typeof window !== 'undefined') {
    console.warn('Firebase configuration is missing in environment variables. Please check your .env.local file.');
  }
}

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

/*
 * Admin sessions deliberately stay in memory only. No Firebase credentials are
 * retained in browser storage, so a reload, a new tab, or a later visit must
 * pass through the password screen again.
 */
export const adminSessionReady = typeof window !== 'undefined'
  ? setPersistence(auth, inMemoryPersistence)
      .then(() => signOut(auth))
      .catch((error) => {
        console.error('Unable to initialise the secure admin session.', error);
      })
  : Promise.resolve();
