import { useEffect, useState } from "react";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  type DocumentData,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
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
});

const toEvent = (id: string, d: DocumentData): TimelineEvent => ({
  id,
  date: asISODate(d.date),
  title: String(d.title ?? ""),
  description: String(d.description ?? ""),
  coverId: String(d.coverPhotoId ?? ""),
  photoIds: Array.isArray(d.photoIds) ? d.photoIds.map(String) : [],
});

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
        setPhotos(snap.docs.map((doc) => toPhoto(doc.id, doc.data())));
        setLive(true);
      },
      () => setLive(false)
    );
    return unsub;
  }, []);

  return { photos, live };
}

// Timeline: data asli dari Firestore jika terkonfigurasi, dummy jika belum.
export function useTimeline() {
  const [events, setEvents] = useState<TimelineEvent[]>(TIMELINE);

  useEffect(() => {
    if (!isFirebaseConfigured || !db) return;
    const q = query(collection(db, "timeline_events"), orderBy("order", "asc"), limit(50));
    const unsub = onSnapshot(
      q,
      (snap) => setEvents(snap.docs.map((doc) => toEvent(doc.id, doc.data()))),
      () => {}
    );
    return unsub;
  }, []);

  return events;
}
