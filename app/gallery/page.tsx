"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ALBUMS } from "@/lib/gallery";
import { usePhotos } from "@/lib/store";
import GalleryGrid from "@/components/GalleryGrid";
import PhotoLightbox from "@/components/PhotoLightbox";

export default function GalleryPage() {
  const [album, setAlbum] = useState<(typeof ALBUMS)[number] | "Favorit">("Semua");
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState<number | null>(null);
  const { photos: all, live, loading, error } = usePhotos();

  const photos = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter((p) => {
      if (album === "Favorit" ? !p.favorite : album !== "Semua" && p.album !== album) return false;
      if (q && !`${p.caption} ${p.location}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [album, query, all]);

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
          {live && photos.length === 0
            ? "Belum ada foto — upload dulu yuk ♥"
            : `${photos.length} foto tersimpan rapi — captured moments from our trips.`}
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
        {[...ALBUMS, "Favorit"].map((a, n) => {
          const active = a === album;
          return (
            <button
              key={a}
              onClick={() => setAlbum(a as (typeof ALBUMS)[number] | "Favorit")}
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
            key={`${album}-${query}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="mt-4"
          >
            <GalleryGrid photos={photos} onSelect={setIndex} />
          </motion.div>
        </AnimatePresence>
      )}

      <PhotoLightbox photos={photos} index={index} onClose={() => setIndex(null)} onNav={setIndex} />
    </main>
  );
}
