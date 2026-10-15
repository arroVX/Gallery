"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ALBUMS } from "@/lib/gallery";
import { usePhotos } from "@/lib/store";
import GalleryGrid from "@/components/GalleryGrid";
import PhotoLightbox from "@/components/PhotoLightbox";

export default function GalleryPage() {
  const [album, setAlbum] = useState<(typeof ALBUMS)[number]>("Semua");
  const [index, setIndex] = useState<number | null>(null);
  const { photos: all, live, loading, error } = usePhotos();

  const photos = useMemo(
    () => (album === "Semua" ? all : all.filter((p) => p.album === album)),
    [album, all]
  );

  useEffect(() => {
    if (index !== null && index >= photos.length) {
      setIndex(photos.length > 0 ? photos.length - 1 : null);
    }
  }, [photos.length, index]);

  return (
    <main className="px-3 py-4 sm:px-5">
      <div className="border-[3px] border-black bg-white shadow-hardSm">
        <p className="border-b-[3px] border-black py-1.5 text-center text-[10px] font-extrabold tracking-[0.3em]">
          ★ OUR STORIES ★
        </p>
        <h1 className="py-4 text-center font-display text-[42px] leading-none sm:text-[72px]">
          PHOTO GALLERY!
        </h1>
        <p className="border-t-[3px] border-black py-2 text-center font-serif text-[12px] italic">
          {live && photos.length === 0
            ? "Belum ada foto — upload dulu"
            : `${photos.length} foto tersimpan rapi — captured moments from our trips.`}
        </p>
      </div>

      <div className="no-scrollbar -mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1">
        {ALBUMS.map((a) => {
          const active = a === album;
          return (
            <button
              key={a}
              onClick={() => setAlbum(a)}
              className={`shrink-0 border-[2.5px] border-black px-5 py-2 text-[11px] font-extrabold tracking-[0.14em] transition ${
                active ? "bg-black text-white shadow-hardSm" : "bg-white hover:bg-black/5"
              }`}
            >
              {a.toUpperCase()}
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
            key={album}
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
