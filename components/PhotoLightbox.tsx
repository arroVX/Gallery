"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { collectAlbums, formatDate, full, thumb, type Photo } from "@/lib/gallery";
import { usePhotos, useTimeline, useUser, type PhotoPatch } from "@/lib/store";
import { useNotify } from "@/lib/notify";

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
  albums,
  onSave,
  onCancel,
}: {
  photo: Photo;
  albums: string[];
  onSave: (patch: PhotoPatch) => Promise<void>;
  onCancel: () => void;
}) {
  const [caption, setCaption] = useState(photo.caption);
  const [location, setLocation] = useState(photo.location);
  const [takenAt, setTakenAt] = useState(photo.takenAt);
  const [album, setAlbum] = useState(photo.album);
  const [favorite, setFavorite] = useState(!!photo.favorite);
  const [rotation, setRotation] = useState(photo.rotate ?? 0);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const cleanAlbum = album.trim() || "Harian";
      await onSave({ caption, location, takenAt, album: cleanAlbum, favorite, rotate: rotation });
    } finally {
      setSaving(false);
    }
  };

  const input =
    "w-full border-2 border-black bg-white px-3 py-2.5 text-sm font-bold outline-none";

  return (
    <div className="mt-4 space-y-2 border-[3px] border-black bg-cream p-3 shadow-hardSm">
      <p className="text-center text-[10px] font-extrabold tracking-[0.3em]">✎ EDIT FOTO</p>
      <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Caption" className={input} />
      <div className="grid grid-cols-2 gap-2">
        <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Lokasi" className={input} />
        <input value={takenAt} onChange={(e) => setTakenAt(e.target.value)} type="date" className={input} />
      </div>
      <input
        value={album}
        onChange={(e) => setAlbum(e.target.value)}
        placeholder="Kategori — ketik baru / pilih saran"
        list="lb-album-suggest"
        className={input}
      />
      <datalist id="lb-album-suggest">
        {albums.map((a) => (
          <option key={a} value={a} />
        ))}
      </datalist>
      <button
        onClick={() => setFavorite((f) => !f)}
        className="flex w-full items-center justify-between border-2 border-black bg-white px-3 py-2.5 text-sm font-extrabold"
      >
        <span>★ Jadikan favorit</span>
        <span
          className={`flex h-6 w-11 items-center border-2 border-black px-0.5 transition ${
            favorite ? "justify-end bg-raspberry" : "justify-start bg-black/10"
          }`}
        >
          <span className="h-4 w-4 bg-white" />
        </span>
      </button>
      <div className="flex items-center gap-2 border-2 border-black bg-white px-3 py-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.src}
          alt="pratinjau putar"
          style={{ transform: `rotate(${rotation}deg)` }}
          className="h-14 w-14 shrink-0 border-2 border-black object-cover transition-transform"
        />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-extrabold tracking-widest">PUTAR FOTO</p>
          <p className="truncate font-serif text-[11px] italic opacity-70">
            Tersimpan permanen — berlaku di semua halaman.
          </p>
        </div>
        <button
          onClick={() => setRotation((r) => (r + 90) % 360)}
          className="shrink-0 border-2 border-black bg-black px-3 py-1.5 text-[15px] font-extrabold text-white"
          aria-label="Putar 90 derajat"
        >
          ⟳ {rotation}°
        </button>
      </div>
      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 border-2 border-black bg-white py-2.5 text-[12px] font-extrabold tracking-widest">
          BATAL
        </button>
        <button
          onClick={save}
          disabled={saving}
          className="flex-1 border-2 border-black bg-raspberry py-2.5 text-[12px] font-extrabold tracking-widest text-white disabled:opacity-50"
        >
          {saving ? "MENYIMPAN…" : "SIMPAN ♥"}
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
  moment,
}: {
  photos: Photo[];
  index: number | null;
  onClose: () => void;
  onNav: (index: number) => void;
  // Konteks momen (dari kartu momen): panel info menampilkan judul +
  // deskripsi momen, bukan caption/lokasi foto.
  moment?: { title: string; description?: string; date?: string } | null;
}) {
  const photo: Photo | null = index === null ? null : photos[index] ?? null;
  const { photos: allPhotos, live, updatePhoto, removePhoto } = usePhotos();
  const albumOptions = collectAlbums(allPhotos);
  const { events } = useTimeline();
  const user = useUser();
  const notify = useNotify();
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
  const [infoOpen, setInfoOpen] = useState(true); // panel info bisa dilipat
  const [dragging, setDragging] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchDist = useRef<number | null>(null);
  const lastPt = useRef({ x: 0, y: 0 });
  const swipe = useRef<{ x: number; y: number; t: number } | null>(null);

  useEffect(() => {
    setEditing(false);
    setConfirming(false);
    // Zoom sengaja TIDAK direset saat pindah foto — foto yang diperbesar
    // tetap diperbesar saat dislide. Pan direset agar posisi tidak aneh.
    setPan({ x: 0, y: 0 });
    setRotation(0);
    setFocus(false);
    setInfoOpen(true);
    pointers.current.clear();
    pinchDist.current = null;
  }, [photo?.id]);

  // Reset zoom hanya saat lightbox dibuka/ditutup.
  useEffect(() => {
    if (index === null) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
    }
  }, [index]);

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

  const toggleFavorite = useCallback(async () => {
    if (!photo) return;
    try {
      await updatePhoto(photo.id, { favorite: !photo.favorite });
      notify(photo.favorite ? "Dihapus dari favorit." : "Ditandai favorit ★", "success");
    } catch (e) {
      notify(`Gagal: ${e instanceof Error ? e.message : String(e)}`, "error");
    }
  }, [photo, updatePhoto, notify]);

  const rotatePermanent = useCallback(async () => {
    if (!photo) return;
    try {
      await updatePhoto(photo.id, { rotate: ((photo.rotate ?? 0) + 90) % 360 });
      notify("Foto diputar & tersimpan ♥", "success");
    } catch (e) {
      notify(`Gagal memutar: ${e instanceof Error ? e.message : String(e)}`, "error");
    }
  }, [photo, updatePhoto, notify]);

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
      notify("Foto dihapus.", "success");
      onClose();
    } catch (e) {
      notify(`Gagal menghapus: ${e instanceof Error ? e.message : String(e)}`, "error");
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
      swipe.current = null; // cubit membatalkan gestur geser
    } else if (zoom > 1) {
      lastPt.current = { x: e.clientX, y: e.clientY };
      setDragging(true);
      // Catat calon swipe juga — geser cepat = pindah foto (zoom dipertahankan).
      swipe.current = { x: e.clientX, y: e.clientY, t: Date.now() };
    } else if (pointers.current.size === 1) {
      // Calon gestur geser pindah foto (hanya saat belum zoom).
      swipe.current = { x: e.clientX, y: e.clientY, t: Date.now() };
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
    if (pointers.current.size === 0) {
      setDragging(false);
      // Geser horizontal cepat = pindah foto (berlaku juga saat zoom —
      // zoom dipertahankan). Geser pelan saat zoom = pan (sudah diterapkan
      // selama drag, lalu foto pindah hanya jika memenuhi syarat cepat).
      // Abaikan jika dilepas di atas tombol (mis. toolbar zoom).
      const s = swipe.current;
      swipe.current = null;
      if (
        s &&
        photos.length > 1 &&
        !(e.target as HTMLElement).closest?.("button")
      ) {
        const dx = e.clientX - s.x;
        const dy = e.clientY - s.y;
        if (Date.now() - s.t < 500 && Math.abs(dx) > 70 && Math.abs(dy) < 60) {
          if (dx < 0) next();
          else prev();
        }
      }
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
            className="relative max-h-[92dvh] w-full max-w-3xl overflow-y-auto border-[3px] border-black bg-[#FFFDF7] shadow-hard"
          >
            <div className="absolute right-3 top-3 z-10 flex gap-1.5">
              {canWrite && (
                <button
                  onClick={toggleFavorite}
                  className={`flex h-9 w-9 items-center justify-center border-2 border-black text-[16px] font-bold transition ${
                    photo.favorite ? "bg-raspberry text-white" : "bg-white text-black"
                  }`}
                  aria-label="Toggle favorit"
                  title="Favorit"
                >
                  {photo.favorite ? "★" : "☆"}
                </button>
              )}
              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center border-2 border-black bg-black text-[15px] font-bold text-white transition hover:bg-white hover:text-black"
                aria-label="Tutup"
              >
                ✕
              </button>
            </div>
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
                    src={full(photo.src, photo.rotate ?? 0)}
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
                    title="Putar (sementara, untuk lihat)"
                  >
                    ⟳
                  </button>
                  {canWrite && (
                    <button
                      onClick={rotatePermanent}
                      className="border-l-2 border-black bg-raspberry px-2 py-1.5 text-[14px] font-extrabold text-white sm:px-2.5"
                      aria-label="Putar permanen dan simpan"
                      title="Putar permanen & simpan"
                    >
                      ↻
                    </button>
                  )}
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

              {photos.length > 1 && (
                <div className="no-scrollbar flex gap-1.5 overflow-x-auto border-b-[3px] border-black bg-black/5 p-1.5">
                  {photos.map((p, i) => (
                    <button
                      key={p.id}
                      onClick={() => onNav(i)}
                      aria-label={`Ke foto ${i + 1}`}
                      className={`h-12 w-12 shrink-0 overflow-hidden border-2 transition ${
                        i === index ? "border-raspberry" : "border-black/30 opacity-60"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={thumb(p.src, 150, p.rotate ?? 0)}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                        draggable={false}
                      />
                    </button>
                  ))}
                </div>
              )}

              {!focus && (
              <div className="p-5 sm:p-6">
                {infoOpen && (
                <>
                <p className="text-[11px] font-bold tracking-widest text-charcoal/50">
                  {moment?.date
                    ? formatDate(moment.date).toUpperCase()
                    : `${formatDate(photo.takenAt).toUpperCase()} — ${photo.album.toUpperCase()}`}
                </p>
                <h3 className="mt-2 font-display text-[30px] leading-none tracking-wide">
                  {(moment?.title || photo.caption || "Tanpa judul").toUpperCase()}
                </h3>
                <p className="mt-1 font-hand text-[17px] font-semibold">
                  {moment?.description || photo.location}
                </p>

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
                    albums={albumOptions}
                    onCancel={() => setEditing(false)}
                    onSave={async (patch) => {
                      try {
                        await updatePhoto(photo.id, patch);
                        notify("Perubahan tersimpan ♥", "success");
                        setEditing(false);
                      } catch (e) {
                        notify(`Gagal menyimpan: ${e instanceof Error ? e.message : String(e)}`, "error");
                      }
                    }}
                  />
                )}

                {usedIn.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[10px] font-extrabold tracking-[0.18em] opacity-60">
                      ADA DI MOMEN:
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {usedIn.map((e) => (
                        <Link
                          key={e.id}
                          href="/memories"
                          onClick={onClose}
                          className="border-2 border-black bg-blush px-2.5 py-1 text-[10px] font-extrabold tracking-wide"
                        >
                          ◉ {e.title.toUpperCase()}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                </>
                )}

                <button
                  onClick={() => setInfoOpen((v) => !v)}
                  className="mt-4 flex w-full items-center justify-center gap-1 py-1 text-[10px] font-extrabold tracking-[0.2em] opacity-60"
                >
                  {infoOpen ? "▴ SEMBUNYIKAN INFO" : "▾ TAMPILKAN INFO"}
                </button>

                <div className="mt-3 flex items-center justify-between border-t-[3px] border-black pt-4">
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
