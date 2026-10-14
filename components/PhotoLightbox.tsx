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

  const input =
    "w-full rounded-xl border border-black/10 bg-black/[0.03] px-3 py-2.5 text-sm font-medium outline-none focus:border-charcoal";

  return (
    <div className="mt-4 space-y-2 rounded-2xl border border-black/[0.06] bg-black/[0.02] p-3">
      <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Caption" className={input} />
      <div className="grid grid-cols-2 gap-2">
        <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Lokasi" className={input} />
        <input value={takenAt} onChange={(e) => setTakenAt(e.target.value)} type="date" className={input} />
      </div>
      <div className="flex gap-1.5">
        {ALBUMS.filter((a) => a !== "Semua").map((a) => (
          <button
            key={a}
            onClick={() => setAlbum(a)}
            className={`flex-1 rounded-full py-2 text-[11px] font-bold ${
              album === a ? "bg-charcoal text-white" : "bg-black/[0.06] text-charcoal"
            }`}
          >
            {a}
          </button>
        ))}
      </div>
      <button
        onClick={() => setFavorite((f) => !f)}
        className="flex w-full items-center justify-between rounded-xl bg-white px-3 py-2.5 text-sm font-bold"
      >
        <span>Jadikan favorit</span>
        <span
          className={`flex h-6 w-11 items-center rounded-full p-0.5 transition ${
            favorite ? "justify-end bg-charcoal" : "justify-start bg-charcoal/20"
          }`}
        >
          <span className="h-5 w-5 rounded-full bg-white" />
        </span>
      </button>
      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 rounded-full border border-black/15 py-2.5 text-sm font-bold">
          Batal
        </button>
        <button
          onClick={save}
          disabled={saving}
          className="flex-1 rounded-full bg-charcoal py-2.5 text-sm font-bold text-white disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: 60, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="relative max-h-[92dvh] w-full max-w-3xl overflow-y-auto rounded-t-[24px] bg-white shadow-pop sm:rounded-[24px]"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-[16px] font-bold text-white backdrop-blur transition hover:bg-black"
              aria-label="Tutup"
            >
              ✕
            </button>
            <div className="grid sm:grid-cols-[1.25fr_1fr]">
              <div className="relative min-h-[320px] overflow-hidden bg-ink sm:min-h-[480px]">
                <Image
                  key={photo.id}
                  src={photo.src}
                  alt={photo.caption}
                  width={photo.width}
                  height={photo.height}
                  sizes="(max-width: 640px) 100vw, 560px"
                  className="h-full max-h-[46dvh] w-full object-cover sm:max-h-none sm:min-h-[480px]"
                  priority
                />
                <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-white/15 py-1 pl-1 pr-3 backdrop-blur-md">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[11px] font-extrabold text-charcoal">
                    {(photo.location || "K").charAt(0)}
                  </span>
                  <span className="max-w-[140px] truncate text-[11px] font-bold text-white">
                    {photo.location || photo.album}
                  </span>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <p className="text-[11px] font-bold tracking-widest text-charcoal/50">
                  {formatDate(photo.takenAt).toUpperCase()} — {photo.album.toUpperCase()}
                </p>
                <h3 className="mt-2 text-[26px] font-extrabold leading-[1.05] tracking-tighter">
                  {photo.caption}
                </h3>
                <p className="mt-1 text-[13px] font-medium text-charcoal/60">{photo.location}</p>

                {canWrite ? (
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => {
                        setConfirming(false);
                        setEditing((e) => !e);
                      }}
                      className="flex-1 rounded-full border border-black/15 bg-white py-2.5 text-[13px] font-bold active:scale-[0.98]"
                    >
                      {editing ? "Tutup edit" : "Edit"}
                    </button>
                    <button
                      onClick={doDelete}
                      disabled={busy}
                      className={`flex-1 rounded-full py-2.5 text-[13px] font-bold active:scale-[0.98] disabled:opacity-50 ${
                        confirming ? "bg-red-700 text-white" : "border border-red-300 bg-white text-red-700"
                      }`}
                    >
                      {busy ? "Menghapus…" : confirming ? "Ketuk lagi untuk hapus" : "Hapus"}
                    </button>
                  </div>
                ) : (
                  <p className="mt-4 rounded-xl bg-black/[0.04] px-3 py-2 text-center text-xs font-semibold text-charcoal/60">
                    <Link href="/upload" className="font-bold text-charcoal underline">
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

                <div className="mt-5 flex items-center justify-between border-t border-black/[0.07] pt-4">
                  <button
                    onClick={prev}
                    className="rounded-full bg-charcoal px-5 py-2.5 text-[13px] font-bold text-white active:scale-95"
                  >
                    ← Prev
                  </button>
                  <p className="font-mono text-[12px] font-bold text-charcoal/50">
                    {index + 1} / {photos.length}
                  </p>
                  <button
                    onClick={next}
                    className="rounded-full bg-charcoal px-5 py-2.5 text-[13px] font-bold text-white active:scale-95"
                  >
                    Next →
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
