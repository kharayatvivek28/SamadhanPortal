import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const isConfigValid = !!firebaseConfig.apiKey;

let app;
let auth: any;
let analytics: any;

if (isConfigValid) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
  }
} else {
  console.warn('Firebase configuration is missing in .env. Google OAuth may not work.');
  auth = { settings: {} };
}

export { auth, analytics };
