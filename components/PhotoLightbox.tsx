"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ALBUMS, formatDate, type Photo } from "@/lib/gallery";
import { usePhotos, useUser, type PhotoPatch } from "@/lib/store";

function EditForm({
  photo,
  onSave,
  onCancel,
}: {
  photo: Photo;
  onSave: (patch: PhotoPatch) => Promise<void>;
  onCancel: () => void;
}) {
  const [caption, setCaption] = useState(photo.caption);
  const [location, setLocation] = useState(photo.location);
  const [takenAt, setTakenAt] = useState(photo.takenAt);
  const [album, setAlbum] = useState(photo.album);
  const [favorite, setFavorite] = useState(!!photo.favorite);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await onSave({ caption, location, takenAt, album, favorite });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-3 space-y-2 rounded-2xl bg-white p-3 shadow-card">
      <input
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="Caption"
        className="w-full rounded-xl border border-hairline bg-ivory px-3 py-2.5 text-sm outline-none focus:border-rosewood"
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Lokasi"
          className="rounded-xl border border-hairline bg-ivory px-3 py-2.5 text-sm outline-none focus:border-rosewood"
        />
        <input
          value={takenAt}
          onChange={(e) => setTakenAt(e.target.value)}
          type="date"
          className="rounded-xl border border-hairline bg-ivory px-3 py-2.5 text-sm outline-none focus:border-rosewood"
        />
      </div>
      <div className="flex gap-1.5">
        {ALBUMS.filter((a) => a !== "Semua").map((a) => (
          <button
            key={a}
            onClick={() => setAlbum(a)}
            className={`flex-1 rounded-full py-2 text-[11px] font-bold ${
              album === a ? "bg-charcoal text-ivory" : "bg-cream text-charcoal"
            }`}
          >
            {a}
          </button>
        ))}
      </div>
      <button
        onClick={() => setFavorite((f) => !f)}
        className="flex w-full items-center justify-between rounded-xl bg-cream px-3 py-2.5 text-sm font-semibold"
      >
        <span>Jadikan favorit</span>
        <span
          className={`flex h-6 w-11 items-center rounded-full p-0.5 transition ${
            favorite ? "justify-end bg-rosewood" : "justify-start bg-charcoal/20"
          }`}
        >
          <span className="h-5 w-5 rounded-full bg-white" />
        </span>
      </button>
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 rounded-full border border-hairline py-2.5 text-sm font-bold"
        >
          Batal
        </button>
        <button
          onClick={save}
          disabled={saving}
          className="flex-1 rounded-full bg-charcoal py-2.5 text-sm font-bold text-ivory disabled:opacity-50"
        >
          {saving ? "Menyimpan…" : "Simpan"}
        </button>
      </div>
    </div>
  );
}

export default function PhotoLightbox({
  photos,
  index,
  onClose,
  onNav,
}: {
  photos: Photo[];
  index: number | null;
  onClose: () => void;
  onNav: (index: number) => void;
}) {
  const photo: Photo | null = index === null ? null : photos[index] ?? null;
  const { live, updatePhoto, removePhoto } = usePhotos();
  const user = useUser();
  const canWrite = !live || !!user;

  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setEditing(false);
    setConfirming(false);
  }, [photo?.id]);

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (!editing) {
        if (e.key === "ArrowLeft") onNav((index - 1 + photos.length) % photos.length);
        if (e.key === "ArrowRight") onNav((index + 1) % photos.length);
      }
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, onClose, onNav, photos.length, editing]);

  const prev = () => {
    if (index !== null) onNav((index - 1 + photos.length) % photos.length);
  };
  const next = () => {
    if (index !== null) onNav((index + 1) % photos.length);
  };

  const doDelete = async () => {
    if (!photo) return;
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setBusy(true);
    try {
      await removePhoto(photo.id);
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      {photo && index !== null && (
        <div className="fixed inset-0 z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-charcoal/60"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 600) onClose();
            }}
            className="absolute inset-x-0 bottom-0 mx-auto max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-ivory"
          >
            <div className="sticky top-0 z-10 flex justify-center bg-ivory/90 py-2 backdrop-blur">
              <span className="h-1 w-10 rounded-full bg-charcoal/20" />
            </div>
            <div className="px-4 pb-6">
              <div className="relative overflow-hidden rounded-2xl bg-cream">
                <Image
                  key={photo.id}
                  src={photo.src}
                  alt={photo.caption}
                  width={photo.width}
                  height={photo.height}
                  sizes="(max-width: 480px) 100vw, 420px"
                  className="max-h-[52dvh] w-full object-contain"
                  priority
                />
              </div>
              <div className="mt-3 flex items-start justify-between gap-3">
                <div>
                  <p className="font-hand text-lg leading-none text-rosewood">
                    {formatDate(photo.takenAt)}
                  </p>
                  <h3 className="mt-1 font-serif text-2xl leading-tight">{photo.caption}</h3>
                  <p className="mt-1 text-sm text-muted">{photo.location}</p>
                </div>
                <button
                  onClick={onClose}
                  className="shrink-0 rounded-full border border-hairline bg-white px-3 py-1.5 text-xs font-bold"
                  aria-label="Tutup"
                >
                  Tutup
                </button>
              </div>

              {canWrite ? (
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => {
                      setConfirming(false);
                      setEditing((e) => !e);
                    }}
                    className="flex-1 rounded-full border border-charcoal/20 bg-white py-2.5 text-sm font-bold active:scale-[0.98]"
                  >
                    {editing ? "Tutup edit" : "Edit"}
                  </button>
                  <button
                    onClick={doDelete}
                    disabled={busy}
                    className={`flex-1 rounded-full py-2.5 text-sm font-bold active:scale-[0.98] disabled:opacity-50 ${
                      confirming ? "bg-red-700 text-white" : "border border-red-300 bg-white text-red-700"
                    }`}
                  >
                    {busy ? "Menghapus…" : confirming ? "Ketuk lagi untuk hapus" : "Hapus"}
                  </button>
                </div>
              ) : (
                <p className="mt-3 rounded-xl bg-cream px-3 py-2 text-center text-xs font-semibold text-muted">
                  <Link href="/upload" className="font-bold text-rosewood">
                    Masuk
                  </Link>{" "}
                  dulu untuk edit / hapus foto.
                </p>
              )}

              {editing && canWrite && (
                <EditForm
                  key={photo.id}
                  photo={photo}
                  onCancel={() => setEditing(false)}
                  onSave={async (patch) => {
                    await updatePhoto(photo.id, patch);
                    setEditing(false);
                  }}
                />
              )}

              <div className="mt-4 flex items-center justify-between">
                <button
                  onClick={prev}
                  className="rounded-full bg-charcoal px-5 py-2.5 text-sm font-bold text-ivory active:scale-95"
                >
                  ← Prev
                </button>
                <p className="text-xs font-semibold text-muted">
                  {index + 1} / {photos.length}
                </p>
                <button
                  onClick={next}
                  className="rounded-full bg-charcoal px-5 py-2.5 text-sm font-bold text-ivory active:scale-95"
                >
                  Next →
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
