import { initializeApp, getApps, getApp, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let app: App;

if (!getApps().length) {
  const projectId = process.env.GCP_PROJECT_ID;

  if (projectId) {
    app = initializeApp({ projectId });
  } else {
    app = initializeApp();
  }
} else {
  app = getApp();
}

export const db = getFirestore(app);
