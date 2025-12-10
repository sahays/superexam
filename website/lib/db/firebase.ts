import { initializeApp, getApps, cert, getApp, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const FIREBASE_CREDENTIALS = process.env.FIREBASE_CREDENTIALS;

let app: App;

if (!getApps().length) {
  if (FIREBASE_CREDENTIALS) {
    try {
      const serviceAccount = JSON.parse(FIREBASE_CREDENTIALS);
      app = initializeApp({
        credential: cert(serviceAccount),
      });
    } catch (e) {
      console.error('Failed to parse FIREBASE_CREDENTIALS', e);
      // Fallback or re-throw depending on strictness
      throw new Error('Invalid FIREBASE_CREDENTIALS JSON');
    }
  } else {
    // If no credentials provided, might be running in GCP/Firebase environment
    // or just initialization for build time (where we don't want to crash)
    console.warn('FIREBASE_CREDENTIALS not found. Initializing with default application credentials.');
    app = initializeApp();
  }
} else {
  app = getApp();
}

export const db = getFirestore(app);
