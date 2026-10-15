"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ALBUMS, formatDate, full, type Photo } from "@/lib/gallery";
import { usePhotos, useTimeline, useUser, type PhotoPatch } from "@/lib/store";

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

const clampZoom = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));
const clampPan = (p: { x: number; y: number }, zoom: number) => {
  const max = 140 * (zoom - 1);
  return {
    x: Math.min(max, Math.max(-max, p.x)),
    y: Math.min(max, Math.max(-max, p.y)),
  };
};

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
  const { events } = useTimeline();
  const user = useUser();
  const canWrite = !live || !!user;
  // Momen yang memakai foto aktif — untuk peringatan sebelum hapus.
  const usedIn =
    photo == null
      ? []
      : events.filter((e) => e.coverId === photo.id || e.photoIds.includes(photo.id));

  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  // ── Zoom, pan, rotate & focus state ──
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0); // 0 / 90 / 180 / 270
  const [focus, setFocus] = useState(false); // mode foto penuh (panel info disembunyikan)
  const [dragging, setDragging] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchDist = useRef<number | null>(null);
  const lastPt = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setEditing(false);
    setConfirming(false);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setRotation(0);
    setFocus(false);
    pointers.current.clear();
    pinchDist.current = null;
  }, [photo?.id]);

  const zoomIn = useCallback(() => {
    setZoom((z) => {
      const nz = clampZoom(Math.round((z + 0.5) * 100) / 100);
      setPan((p) => clampPan(p, nz));
      return nz;
    });
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((z) => {
      const nz = clampZoom(Math.round((z - 0.5) * 100) / 100);
      setPan((p) => clampPan(p, nz));
      return nz;
    });
  }, []);

  const resetZoom = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const rotate = useCallback(() => {
    setRotation((r) => (r + 90) % 360);
    setPan({ x: 0, y: 0 });
  }, []);

  const toggleZoom = useCallback(() => {
    setZoom((z) => {
      const nz = z > 1.2 ? 1 : 2.5;
      setPan({ x: 0, y: 0 });
      return nz;
    });
  }, []);

  // Wheel / trackpad zoom (native non-passive listener so we can preventDefault)
  useEffect(() => {
    const el = frameRef.current;
    if (!el || index === null) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setZoom((z) => {
        const nz = clampZoom(Math.round((z - e.deltaY * 0.003) * 100) / 100);
        setPan((p) => clampPan(p, nz));
        return nz;
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [index, photo?.id]);

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (!editing) {
        if (e.key === "ArrowLeft") onNav((index - 1 + photos.length) % photos.length);
        if (e.key === "ArrowRight") onNav((index + 1) % photos.length);
        if (e.key === "+" || e.key === "=") zoomIn();
        if (e.key === "-") zoomOut();
        if (e.key === "0") resetZoom();
      }
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, onClose, onNav, photos.length, editing, zoomIn, zoomOut, resetZoom]);

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

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // abaikan
    }
    if (pointers.current.size === 2) {
      const [a, b] = Array.from(pointers.current.values());
      pinchDist.current = Math.hypot(a.x - b.x, a.y - b.y);
      setDragging(false);
    } else if (zoom > 1) {
      lastPt.current = { x: e.clientX, y: e.clientY };
      setDragging(true);
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      // pinch zoom
      const [a, b] = Array.from(pointers.current.values());
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinchDist.current && pinchDist.current > 0) {
        const factor = dist / pinchDist.current;
        setZoom((z) => {
          const nz = clampZoom(Math.round(z * factor * 100) / 100);
          setPan((p) => clampPan(p, nz));
          return nz;
        });
      }
      pinchDist.current = dist;
    } else if (dragging && zoom > 1) {
      const dx = e.clientX - lastPt.current.x;
      const dy = e.clientY - lastPt.current.y;
      lastPt.current = { x: e.clientX, y: e.clientY };
      setPan((p) => clampPan({ x: p.x + dx, y: p.y + dy }, zoom));
    }
  };

  const endPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinchDist.current = null;
    if (pointers.current.size === 0) setDragging(false);
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
            className="relative max-h-[92dvh] w-full max-w-3xl overflow-y-auto border-[3px] border-black bg-white shadow-hard"
          >
            <button
              onClick={onClose}
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center border-2 border-black bg-black text-[15px] font-bold text-white transition hover:bg-white hover:text-black"
              aria-label="Tutup"
            >
              ✕
            </button>
            <div className={focus ? "grid" : "grid sm:grid-cols-[1.25fr_1fr]"}>
              {/* ── Zoomable photo frame ── */}
              <div
                ref={frameRef}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={endPointer}
                onPointerCancel={endPointer}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  toggleZoom();
                }}
                style={{ touchAction: zoom > 1 ? "none" : "pan-y" }}
                className={`relative flex min-h-[320px] select-none items-center justify-center overflow-hidden border-b-[3px] border-black bg-black sm:min-h-[480px] sm:border-b-0 sm:border-r-[3px] ${
                  zoom === 1 ? "cursor-zoom-in" : dragging ? "cursor-grabbing" : "cursor-grab"
                }`}
              >
                <div
                  className="flex h-full w-full items-center justify-center"
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) rotate(${rotation}deg) scale(${zoom})`,
                    transformOrigin: "center center",
                    transition: dragging ? "none" : "transform 160ms ease-out",
                  }}
                >
                  <Image
                    key={photo.id}
                    src={full(photo.src)}
                    alt={photo.caption}
                    width={photo.width}
                    height={photo.height}
                    sizes="(max-width: 640px) 100vw, 560px"
                    className={`h-auto w-full object-contain ${focus ? "max-h-[80dvh]" : "max-h-[55dvh] sm:max-h-[72dvh]"}`}
                    priority
                    draggable={false}
                  />
                </div>
                <div className="absolute left-3 top-3 border-2 border-black bg-white px-3 py-1 text-[10px] font-extrabold tracking-[0.14em]">
                  {(photo.location || photo.album).toUpperCase()}
                </div>

                {/* zoom toolbar */}
                <div
                  className="absolute bottom-3 right-3 z-10 flex items-stretch border-2 border-black bg-white"
                  onPointerDown={(e) => e.stopPropagation()}
                  onDoubleClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={zoomOut}
                    disabled={zoom <= MIN_ZOOM}
                    className="px-2 py-1.5 text-[14px] font-extrabold disabled:opacity-30 sm:px-3"
                    aria-label="Zoom out"
                  >
                    −
                  </button>
                  <span className="flex items-center border-x-2 border-black px-2 font-mono text-[11px] font-bold">
                    {zoom.toFixed(1)}×
                  </span>
                  <button
                    onClick={zoomIn}
                    disabled={zoom >= MAX_ZOOM}
                    className="px-2 py-1.5 text-[14px] font-extrabold disabled:opacity-30 sm:px-3"
                    aria-label="Zoom in"
                  >
                    +
                  </button>
                  <button
                    onClick={rotate}
                    className="border-l-2 border-black px-2 py-1.5 text-[14px] font-extrabold sm:px-2.5"
                    aria-label="Putar 90 derajat"
                    title="Putar"
                  >
                    ⟳
                  </button>
                  <button
                    onClick={() => setFocus((f) => !f)}
                    className="border-l-2 border-black bg-black px-2 py-1.5 text-[12px] font-extrabold text-white sm:px-2.5"
                    aria-label="Mode foto penuh"
                    title="Foto penuh"
                  >
                    {focus ? "✕" : "⛶"}
                  </button>
                  {zoom > 1 && (
                    <button
                      onClick={resetZoom}
                      className="border-l-2 border-black bg-black px-2 text-[10px] font-extrabold tracking-widest text-white"
                      aria-label="Reset zoom"
                    >
                      1×
                    </button>
                  )}
                </div>
                <p className="absolute bottom-3 left-3 hidden border border-white/60 bg-black/70 px-2 py-1 text-[9px] font-bold tracking-[0.14em] text-white sm:block">
                  {zoom > 1 ? "GESER UNTUK JELAJAH" : "KETUK 2× / CUBIT: ZOOM • ⟳: PUTAR"}
                </p>
                {focus && (
                  <>
                    <button
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        prev();
                      }}
                      className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center border-2 border-black bg-white text-[18px] font-extrabold"
                      aria-label="Foto sebelumnya"
                    >
                      ‹
                    </button>
                    <button
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        next();
                      }}
                      className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center border-2 border-black bg-white text-[18px] font-extrabold"
                      aria-label="Foto berikutnya"
                    >
                      ›
                    </button>
                  </>
                )}
              </div>

              {!focus && (
              <div className="p-5 sm:p-6">
                <p className="text-[11px] font-bold tracking-widest text-charcoal/50">
                  {formatDate(photo.takenAt).toUpperCase()} — {photo.album.toUpperCase()}
                </p>
                <h3 className="mt-2 font-display text-[30px] leading-none tracking-wide">
                  {photo.caption.toUpperCase()}
                </h3>
                <p className="mt-1 font-serif text-[13px] italic">{photo.location}</p>

                {canWrite ? (
                  <>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => {
                        setConfirming(false);
                        setEditing((e) => !e);
                      }}
                      className="flex-1 border-2 border-black bg-white py-2.5 text-[12px] font-extrabold tracking-widest active:translate-x-[2px] active:translate-y-[2px]"
                    >
                      {editing ? "TUTUP EDIT" : "EDIT"}
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
                  {confirming && usedIn.length > 0 && (
                    <p className="mt-2 border-2 border-amber-500 bg-amber-50 p-2 text-[12px] font-bold text-amber-900">
                      ⚠ Foto ini dipakai di {usedIn.length} momen (
                      {usedIn.slice(0, 2).map((e) => e.title).join(", ")}
                      {usedIn.length > 2 ? "…" : ""}) — momennya tidak ikut terhapus, tapi kartunya
                      akan kehilangan foto ini.
                    </p>
                  )}
                  </>
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

                <div className="mt-5 flex items-center justify-between border-t-[3px] border-black pt-4">
                  <button
                    onClick={prev}
                    className="border-2 border-black bg-black px-5 py-2.5 text-[12px] font-extrabold text-white"
                  >
                    ← PREV
                  </button>
                  <p className="font-mono text-[12px] font-bold">
                    {index + 1} / {photos.length}
                  </p>
                  <button
                    onClick={next}
                    className="border-2 border-black bg-black px-5 py-2.5 text-[12px] font-extrabold text-white"
                  >
                    NEXT →
                  </button>
                </div>
              </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
