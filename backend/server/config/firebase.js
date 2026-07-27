/**
 * Firebase Admin SDK Configuration
 *
 * Initializes the Firebase Admin SDK using service account credentials
 * from environment variables. Exports the Firestore database instance
 * for use across the backend.
 *
 * Required env vars:
 *   FIREBASE_PROJECT_ID
 *   FIREBASE_CLIENT_EMAIL
 *   FIREBASE_PRIVATE_KEY
 */
const admin = require('firebase-admin');

// Format and sanitize the private key to handle double-quotes and escaped newlines from env variables
let privateKey = process.env.FIREBASE_PRIVATE_KEY || '';
if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
  privateKey = privateKey.substring(1, privateKey.length - 1);
}
privateKey = privateKey.replace(/\\n/g, '\n');

// Build the service account config from environment variables
const serviceAccount = {
  type: 'service_account',
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key: privateKey,
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
};

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log('✅ Firebase Admin SDK initialized');
}

// Export the Firestore database instance
const db = admin.firestore();

module.exports = { admin, db };
