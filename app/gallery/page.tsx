"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { collectAlbums, formatDate, type Photo } from "@/lib/gallery";
import { usePhotos } from "@/lib/store";
import GalleryGrid from "@/components/GalleryGrid";
import PhotoLightbox from "@/components/PhotoLightbox";

export default function GalleryPage() {
  const [album, setAlbum] = useState<string>("Semua");
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState<number | null>(null);
  const { photos: all, live, loading, error } = usePhotos();

  // Kategori mengikuti data (custom) — bukan daftar tetap.
  const chips = useMemo(() => ["Semua", ...collectAlbums(all), "Favorit"], [all]);
  // Kategori aktif yang sudah tidak ada di data (mis. habis diedit) → Semua.
  const activeAlbum = chips.includes(album) ? album : "Semua";

  const photos = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter((p) => {
      if (activeAlbum === "Favorit" ? !p.favorite : activeAlbum !== "Semua" && p.album !== activeAlbum) return false;
      if (q && !`${p.caption} ${p.location}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [activeAlbum, query, all]);

  // Kelompok per tanggal (hari), terbaru dulu. Tiap item menyimpan
  // index global agar lightbox prev/next tidak terputus antar tanggal.
  const groups = useMemo(() => {
    const byDate = new Map<string, { p: Photo; gi: number }[]>();
    photos.forEach((p, gi) => {
      const k = (p.takenAt || "").slice(0, 10);
      if (!byDate.has(k)) byDate.set(k, []);
      byDate.get(k)!.push({ p, gi });
    });
    return Array.from(byDate.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([date, items]) => ({ date, items }));
  }, [photos]);

  useEffect(() => {
    if (index !== null && index >= photos.length) {
      setIndex(photos.length > 0 ? photos.length - 1 : null);
    }
  }, [photos.length, index]);

  return (
    <main className="px-3 py-4 sm:px-5">
      <div className="relative border-[3px] border-black bg-white shadow-hardSm">
        <span aria-hidden className="tape absolute -top-3 left-6 z-10 h-6 w-20 -rotate-6" />
        <span aria-hidden className="tape absolute -top-3 right-6 z-10 h-6 w-20 rotate-6" />
        <p className="border-b-[3px] border-black py-1.5 text-center text-[10px] font-extrabold tracking-[0.3em]">
          ★ OUR STORIES ★
        </p>
        <h1 className="py-4 text-center font-display leading-none text-[clamp(2.625rem,11vw,4.5rem)]">
          PHOTO GALLERY!
        </h1>
        <p className="border-t-[3px] border-black py-2 text-center font-hand text-[16px] font-semibold">
          {live && photos.length === 0 ? "Belum ada foto — upload dulu yuk ♥" : `${photos.length} foto`}
        </p>
      </div>

      <div className="mt-4 border-[3px] border-black bg-white shadow-hardSm">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="🔍 Cari caption atau lokasi…"
          className="w-full bg-white px-4 py-2.5 text-sm font-bold outline-none placeholder:font-serif placeholder:font-normal placeholder:italic placeholder:opacity-60"
        />
      </div>

      <div className="no-scrollbar -mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1">
        {chips.map((a, n) => {
          const active = a === activeAlbum;
          return (
            <button
              key={a}
              onClick={() => setAlbum(a)}
              className={`sticker flex shrink-0 items-center gap-2 border-[2.5px] border-black px-4 py-2 text-[11px] font-extrabold tracking-[0.14em] transition ${
                active ? "bg-raspberry text-white" : "bg-white hover:bg-blush"
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                  active ? "bg-white text-raspberry" : "bg-raspberry text-white"
                }`}
              >
                {a === "Favorit" ? "★" : `0${n + 1}`.slice(-2)}
              </span>
              {a === "Favorit" ? "FAVORIT" : a.toUpperCase()}
            </button>
          );
        })}
      </div>

      {error && (
        <p className="mt-4 border-2 border-red-600 bg-red-50 p-3 text-[13px] font-bold text-red-800">
          {error}
        </p>
      )}

      {loading ? (
        <div className="mt-10 flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent" />
          <p className="font-serif text-[12px] italic">Memuat foto dari cloud…</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeAlbum}-${query}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="mt-4"
          >
            {groups.map((g) => (
              <section key={g.date} className="mt-6 first:mt-0">
                <div className="mb-3 border-[3px] border-black bg-black px-3 py-1.5 text-center text-[11px] font-extrabold tracking-[0.2em] text-white">
                  {formatDate(g.date).toUpperCase()} — {g.items.length} FOTO
                </div>
                <GalleryGrid
                  photos={g.items.map((x) => x.p)}
                  onSelect={(i) => setIndex(g.items[i].gi)}
                />
              </section>
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      <PhotoLightbox photos={photos} index={index} onClose={() => setIndex(null)} onNav={setIndex} />
    </main>
  );
}
