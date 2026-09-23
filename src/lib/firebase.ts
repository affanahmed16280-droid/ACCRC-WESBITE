import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, inMemoryPersistence, setPersistence, signOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

/*
 * Admin sessions deliberately stay in memory only. No Firebase credentials are
 * retained in browser storage, so a reload, a new tab, or a later visit must
 * pass through the password screen again.
 */
export const adminSessionReady = setPersistence(auth, inMemoryPersistence)
  .then(() => signOut(auth))
  .catch((error) => {
    console.error('Unable to initialise the secure admin session.', error);
    throw error;
  });
