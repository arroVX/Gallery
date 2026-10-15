import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  config.apiKey && config.projectId && config.appId && config.storageBucket
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length ? getApps()[0]! : initializeApp(config as Record<string, string>);
  } catch (err) {
    console.error("[Firebase] Gagal initializeApp:", err);
  }
  // Auth: aman di server & client.
  if (app) {
    try {
      auth = getAuth(app);
    } catch (err) {
      console.error("[Firebase] Gagal getAuth:", err);
    }
  }
  // Firestore & Storage hanya di browser. Saat `next build` (prerender server)
  // SDK web melempar "Service firestore is not available" — bukan error asli.
  if (app && typeof window !== "undefined") {
    try {
      db = getFirestore(app);
    } catch (err) {
      console.error("[Firebase] Gagal getFirestore:", err);
    }
    try {
      // URL bucket eksplisit agar support domain baru (*.firebasestorage.app)
      // maupun lama (*.appspot.com).
      storage = getStorage(app, `gs://${config.storageBucket}`);
    } catch (err) {
      console.error("[Firebase] Gagal getStorage:", err);
    }
  }
}

export { app, auth, db, storage };
