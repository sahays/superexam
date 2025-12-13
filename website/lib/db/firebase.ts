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

// Firestore collection prefix (must match processing-service config)
const COLLECTION_PREFIX = process.env.FIRESTORE_COLLECTION_PREFIX || 'superexam-';

/**
 * Get prefixed collection name
 *
 * @param name - Unprefixed collection name (e.g., 'documents')
 * @returns Prefixed collection name (e.g., 'superexam-documents')
 */
export function collection(name: string) {
  return `${COLLECTION_PREFIX}${name}`;
}
