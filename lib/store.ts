import { useCallback, useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  type DocumentData,
} from "firebase/firestore";
import { onAuthStateChanged, type User } from "firebase/auth";
import { deleteObject, ref } from "firebase/storage";
import { auth, db, isFirebaseConfigured, storage } from "./firebase";
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
  favorite: Boolean(d.isFavorite ?? false),
  storagePath: typeof d.storagePath === "string" ? d.storagePath : undefined,
});

const toEvent = (id: string, d: DocumentData): TimelineEvent => ({
  id,
  date: asISODate(d.date),
  title: String(d.title ?? ""),
  description: String(d.description ?? ""),
  coverId: String(d.coverPhotoId ?? ""),
  photoIds: Array.isArray(d.photoIds) ? d.photoIds.map(String) : [],
});

export type PhotoPatch = Partial<
  Pick<Photo, "caption" | "location" | "takenAt" | "album" | "favorite">
>;

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, setUser);
  }, []);
  return user;
}

// Foto: data asli dari Firestore jika terkonfigurasi, dummy jika belum.
export function usePhotos() {
  const [photos, setPhotos] = useState<Photo[]>(PHOTOS);
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (!isFirebaseConfigured || !db) return;
    const q = query(collection(db, "photos"), orderBy("takenAt", "desc"), limit(100));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setPhotos(snap.docs.map((d) => toPhoto(d.id, d.data())));
        setLive(true);
      },
      () => setLive(false)
    );
    return unsub;
  }, []);

  const updatePhoto = useCallback(
    async (id: string, patch: PhotoPatch) => {
      if (live && db) {
        await updateDoc(doc(db, "photos", id), { ...patch });
      } else {
        setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
      }
    },
    [live]
  );

  const removePhoto = useCallback(
    async (id: string) => {
      const target = photos.find((p) => p.id === id);
      if (live && db) {
        await deleteDoc(doc(db, "photos", id));
        if (target?.storagePath && storage) {
          try {
            await deleteObject(ref(storage, target.storagePath));
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

  return { photos, live, updatePhoto, removePhoto };
}

// Timeline: data asli dari Firestore jika terkonfigurasi, dummy jika belum.
export function useTimeline() {
  const [events, setEvents] = useState<TimelineEvent[]>(TIMELINE);

  useEffect(() => {
    if (!isFirebaseConfigured || !db) return;
    const q = query(collection(db, "timeline_events"), orderBy("order", "asc"), limit(50));
    const unsub = onSnapshot(
      q,
      (snap) => setEvents(snap.docs.map((d) => toEvent(d.id, d.data()))),
      () => {}
    );
    return unsub;
  }, []);

  return events;
}
