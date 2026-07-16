import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const secondaryApp = initializeApp(firebaseConfig, 'Secondary');

export const auth = getAuth(app);
export const adminAuth = getAuth(secondaryApp);

// Restore experimentalForceLongPolling while keeping the databaseId
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);

// Connection test as recommended by the skill
async function testConnection() {
  try {
    // Use a path that is known to be readable (appConfig/branding is public)
    await getDocFromServer(doc(db, 'appConfig', 'branding'));
    console.log("Firestore connection test: Success (backend reachable)");
  } catch (error) {
    if (error instanceof Error) {
      console.error("Firestore connection failure:", error.message);
      if (error.message.includes('the client is offline') || error.message.includes('unavailable')) {
        console.warn("Please check if the Firestore database is provisioned and accessible.");
      }
    }
  }
}

testConnection();

// Persistence temporarily disabled to debug connectivity
// import { enableMultiTabIndexedDbPersistence } from 'firebase/firestore';
// enableMultiTabIndexedDbPersistence(db).catch(...)

// Storage initialization
let storageInstance = null;
try {
  storageInstance = getStorage(app);
} catch (error) {
  console.warn("Firebase Storage not available.");
}

export const storage = storageInstance;
export { app };
