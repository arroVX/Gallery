import { useCallback, useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  query,
  updateDoc,
  type DocumentData,
} from "firebase/firestore";
import { onAuthStateChanged, type User } from "firebase/auth";
import { deleteObject, ref } from "firebase/storage";
import { firebase, initFirebase, isFirebaseConfigured, firebaseInitError } from "./firebase";
import { PHOTOS, TIMELINE, type Photo, type TimelineEvent } from "./gallery";

const asISODate = (v: unknown): string => {
  if (typeof v === "string") return v.slice(0, 10);
  if (v && typeof v === "object" && "toDate" in v) {
    try {
      return (v as { toDate: () => Date }).toDate().toISOString().slice(0, 10);
    } catch {
      return new Date().toISOString().slice(0, 10);
    }
  }
  return new Date().toISOString().slice(0, 10);
};

const toPhoto = (id: string, d: DocumentData): Photo => ({
  id,
  src: String(d.imageUrl ?? ""),
  width: Number(d.width ?? 800),
  height: Number(d.height ?? 1000),
  caption: String(d.caption ?? ""),
  location: String(d.location ?? ""),
  takenAt: asISODate(d.takenAt),
  album: String(d.album ?? "Harian"),
  // Dokumen Firestore memakai `isFavorite`, model UI memakai `favorite`.
  favorite: Boolean(d.isFavorite ?? d.favorite ?? false),
  storagePath: typeof d.storagePath === "string" ? d.storagePath : undefined,
  // Upload baru via Cloudinary (tanpa Firebase Storage).
  cloudinaryPublicId:
    typeof d.cloudinaryPublicId === "string" ? d.cloudinaryPublicId : undefined,
  rotate: Number(d.rotate ?? 0) || 0,
});

// Waktu upload dalam ms untuk sorting client-side.
// Mendukung Timestamp, string ISO, number, atau tidak ada (fallback 0).
const uploadedAtMillis = (d: DocumentData): number => {
  const v = d.uploadedAt;
  if (v && typeof v === "object" && "toMillis" in v) {
    try {
      return (v as { toMillis: () => number }).toMillis();
    } catch {
      return 0;
    }
  }
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const t = Date.parse(v);
    return Number.isNaN(t) ? 0 : t;
  }
  return 0;
};

// Pesan error Firestore yang ramah untuk ditampilkan ke user.
export const firestoreErrorMessage = (err: unknown): string => {
  const code = (err as { code?: string })?.code ?? "";
  if (code === "permission-denied")
    return "Firestore menolak akses (permission-denied). Penyebab umum: rules belum di-deploy atau belum login. Jalankan `firebase deploy --only firestore:rules` dan pastikan sudah login.";
  if (code === "failed-precondition")
    return "Firestore butuh index (failed-precondition). Buka link index di console error atau jalankan `firebase deploy --only firestore:indexes`.";
  if (code === "unavailable")
    return "Firestore tidak dapat dijangkau (unavailable). Cek koneksi / pastikan Firestore database sudah dibuat di Console.";
  if (code === "unauthenticated")
    return "Belum login (unauthenticated). Silakan masuk dulu di halaman Upload.";
  const msg = err instanceof Error ? err.message : String(err);
  return `Gagal memuat data: ${msg}`;
};

const toEvent = (id: string, d: DocumentData): TimelineEvent => ({
  id,
  date: asISODate(d.date),
  title: String(d.title ?? ""),
  description: String(d.description ?? ""),
  coverId: String(d.coverPhotoId ?? ""),
  photoIds: Array.isArray(d.photoIds) ? d.photoIds.map(String) : [],
});

export type PhotoPatch = Partial<
  Pick<Photo, "caption" | "location" | "takenAt" | "album" | "favorite" | "rotate">
>;

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    const { auth } = initFirebase();
    if (!auth) return;
    return onAuthStateChanged(auth, setUser);
  }, []);
  return user;
}

// Foto: data asli dari Firestore jika terkonfigurasi, dummy jika belum.
// PENTING: saat Firebase terkonfigurasi, error TIDAK lagi fallback ke dummy
// agar data asli yang kosong/gagal tidak disamarkan sebagai foto picsum.
export function usePhotos() {
  // Jika Firebase dikonfigurasi mulai dari array kosong; dummy hanya jika belum terkonfigurasi.
  const [photos, setPhotos] = useState<Photo[]>(isFirebaseConfigured ? [] : PHOTOS);
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // initFirebase() di sini memastikan db terinisialisasi di browser, bukan SSR.
    const { db } = initFirebase();
    if (!isFirebaseConfigured || !db) {
      setLoading(false);
      if (isFirebaseConfigured && !db) {
        setError(
          `Firestore gagal inisialisasi — ${firebaseInitError ?? "penyebab tidak diketahui."}`
        );
      }
      return;
    }
    // Sengaja TANPA orderBy server-side: dokumen lama tanpa `uploadedAt`
    // akan hilang jika pakai orderBy("uploadedAt"). Sorting dilakukan client-side.
    const q = query(collection(db, "photos"), limit(200));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows = snap.docs.map((d) => ({ photo: toPhoto(d.id, d.data()), ts: uploadedAtMillis(d.data()) }));
        // Dokumen rusak (tanpa imageUrl) disaring agar <Image> tidak error.
        rows.sort((a, b) => b.ts - a.ts || b.photo.takenAt.localeCompare(a.photo.takenAt));
        setPhotos(rows.filter((r) => r.photo.src).map((r) => r.photo));
        setLive(true);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("[Firestore] onSnapshot error:", err);
        setPhotos([]);
        setLive(false);
        setLoading(false);
        setError(firestoreErrorMessage(err));
      }
    );
    return unsub;
  }, []);

  const updatePhoto = useCallback(
    async (id: string, patch: PhotoPatch) => {
      // Petakan `favorite` (model UI) -> `isFavorite` (field Firestore).
      const { favorite, ...rest } = patch;
      const fsPatch: Record<string, unknown> = { ...rest };
      if (favorite !== undefined) fsPatch.isFavorite = favorite;
      if (live && firebase.db) {
        await updateDoc(doc(firebase.db, "photos", id), fsPatch);
      }
      // Update optimis lokal agar UI langsung berubah.
      setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    },
    [live]
  );

  const removePhoto = useCallback(
    async (id: string) => {
      const target = photos.find((p) => p.id === id);
      if (live && firebase.db) {
        await deleteDoc(doc(firebase.db, "photos", id));
        // Dokumen lama (Firebase Storage): hapus file binernya juga.
        // Dokumen Cloudinary: file tetap ada di Media Library (delete butuh
        // signed API) — hapus manual di Cloudinary jika perlu.
        if (target?.storagePath && firebase.storage) {
          try {
            await deleteObject(ref(firebase.storage, target.storagePath));
          } catch {
            // file mungkin sudah tidak ada — abaikan
          }
        }
      } else {
        setPhotos((prev) => prev.filter((p) => p.id !== id));
      }
    },
    [live, photos]
  );

  return { photos, live, loading, error, updatePhoto, removePhoto };
}

// Timeline: data asli dari Firestore jika terkonfigurasi, dummy jika belum.
export function useTimeline() {
  const [events, setEvents] = useState<TimelineEvent[]>(isFirebaseConfigured ? [] : TIMELINE);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // initFirebase() di sini memastikan db terinisialisasi di browser, bukan SSR.
    const { db } = initFirebase();
    if (!isFirebaseConfigured || !db) {
      if (isFirebaseConfigured && !db) {
        setError(
          `Firestore gagal inisialisasi — ${firebaseInitError ?? "penyebab tidak diketahui."}`
        );
      }
      return;
    }
    const q = query(collection(db, "timeline_events"), limit(100));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows = snap.docs.map((d) => toEvent(d.id, d.data()));
        // Sorting client-side agar dokumen tanpa `order` tetap muncul.
        rows.sort((a, b) => a.date.localeCompare(b.date));
        setEvents(rows);
        setError(null);
      },
      (err) => {
        console.error("[Firestore] timeline onSnapshot error:", err);
        setEvents([]);
        setError(firestoreErrorMessage(err));
      }
    );
    return unsub;
  }, []);

  return { events, error };
}

export type MemoryInput = {
  title: string;
  date: string; // YYYY-MM-DD
  description: string;
  coverId: string;
  photoIds: string[];
};

// Tulis 1 memory card (multi-foto) ke `timeline_events`.
// Rules create wajib: date, title, order.
export async function addMemory(input: MemoryInput): Promise<string> {
  const { db } = initFirebase();
  if (!db) throw new Error("Firestore belum siap.");
  const ref = await addDoc(collection(db, "timeline_events"), {
    title: input.title,
    date: input.date,
    description: input.description,
    coverPhotoId: input.coverId,
    photoIds: input.photoIds,
    order: Date.now(),
  });
  return ref.id;
}

export async function removeMemory(id: string): Promise<void> {
  const { db } = initFirebase();
  if (!db) throw new Error("Firestore belum siap.");
  await deleteDoc(doc(db, "timeline_events", id));
}

// Ubah isi momen (dipakai untuk memperbaiki momen yang fotonya hilang).
export async function updateMemory(id: string, input: MemoryInput): Promise<void> {
  const { db } = initFirebase();
  if (!db) throw new Error("Firestore belum siap.");
  await updateDoc(doc(db, "timeline_events", id), {
    title: input.title,
    date: input.date,
    description: input.description,
    coverPhotoId: input.coverId,
    photoIds: input.photoIds,
  });
}
