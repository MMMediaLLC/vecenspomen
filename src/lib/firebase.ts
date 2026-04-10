import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const isMock = !import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY.includes('your_api_key');

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'mock',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'mock',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'mock',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'mock',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'mock',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'mock'
};

export const app = isMock ? ({} as any) : initializeApp(firebaseConfig);
export const db = isMock ? ({} as any) : getFirestore(app);
export const storage = isMock ? ({} as any) : getStorage(app);
export const auth = isMock ? ({} as any) : getAuth(app);

if (import.meta.env.DEV) {
  console.log('--- FIREBASE INIT (CLIENT) ---');
  console.log('isMock:', isMock);
  console.log('VITE_FIREBASE_PROJECT_ID:', import.meta.env.VITE_FIREBASE_PROJECT_ID);
  console.log('------------------------------');
}

export { isMock };
