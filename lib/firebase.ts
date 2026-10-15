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

// Objek tunggal yang bisa di-mutate — solusi untuk masalah
// destructured import kehilangan live binding setelah lazy init.
export const firebase = {
  app: null as FirebaseApp | null,
  auth: null as Auth | null,
  db: null as Firestore | null,
  storage: null as FirebaseStorage | null,
};

let _ready = false;

/**
 * Inisialisasi Firebase — idempotent, aman dipanggil berkali-kali.
 *
 * ROOT CAUSE FIX: Dulu db/storage di-init di module-level dengan guard
 * `typeof window !== "undefined"`. Di Next.js, modul dievaluasi di SERVER
 * saat SSR → window belum ada → db = null. Nilai null ter-cache, sehingga
 * saat client component berjalan di browser, `import { db }` tetap null.
 *
 * Solusi: panggil initFirebase() di dalam useEffect / event handler
 * (yang selalu berjalan di browser, bukan server), lalu akses via
 * `firebase.db`, bukan destructured `db`.
 */
export function initFirebase(): typeof firebase {
  if (_ready) return firebase;
  if (!isFirebaseConfigured) return firebase;

  try {
    firebase.app = getApps().length
      ? getApps()[0]!
      : initializeApp(config as Record<string, string>);
  } catch (err) {
    console.error("[Firebase] initializeApp gagal:", err);
    return firebase;
  }

  try {
    firebase.auth = getAuth(firebase.app);
  } catch (err) {
    console.error("[Firebase] getAuth gagal:", err);
  }

  try {
    firebase.db = getFirestore(firebase.app);
  } catch (err) {
    console.error("[Firebase] getFirestore gagal:", err);
  }

  try {
    const bucket = config.storageBucket ?? "";
    const uri = bucket.startsWith("gs://") ? bucket : `gs://${bucket}`;
    firebase.storage = getStorage(firebase.app, uri);
  } catch (err) {
    console.error("[Firebase] getStorage gagal:", err);
  }

  _ready = true;
  return firebase;
}

// Ekspor langsung untuk backward-compat di tempat yang membaca di browser
// (upload/page.tsx, store.ts). Nilai akan null di SSR — gunakan initFirebase()
// di useEffect sebelum akses.
export const app = firebase.app;
export const auth = firebase.auth;
export const db = firebase.db;
export const storage = firebase.storage;
