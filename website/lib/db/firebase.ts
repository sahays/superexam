import { initializeApp, getApps, getApp, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let app: App;

// Log key environment config
console.log('--- Firebase Admin Initializing ---');
console.log(`ENV: FIRESTORE_COLLECTION_PREFIX='${process.env.FIRESTORE_COLLECTION_PREFIX}'`);
console.log(`ENV: GCP_PROJECT_ID='${process.env.GCP_PROJECT_ID}'`);
console.log(`ENV: GEMINI_MODEL='${process.env.GEMINI_MODEL}'`);

if (!getApps().length) {
  const projectId = process.env.GCP_PROJECT_ID;

  if (projectId) {
    console.log(`Initializing Firebase Admin with specific project: ${projectId}`);
    app = initializeApp({ projectId });
  } else {
    console.log('Initializing Firebase Admin with default credentials');
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
  const prefixedName = `${COLLECTION_PREFIX}${name}`;
  // console.log(`Accessing collection: ${prefixedName}`);
  return prefixedName;
}
