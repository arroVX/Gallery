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
  const { photos: all, live } = usePhotos();

  const photos = useMemo(
    () => (album === "Semua" ? all : all.filter((p) => p.album === album)),
    [album, all]
  );

  // Jaga index lightbox tetap valid saat foto dihapus
  useEffect(() => {
    if (index !== null && index >= photos.length) {
      setIndex(photos.length > 0 ? photos.length - 1 : null);
    }
  }, [photos.length, index]);

  return (
    <main className="px-4 pt-4">
      <h1 className="font-serif text-4xl">Galeri</h1>
      <p className="mt-0.5 font-hand text-xl text-rosewood">
        {live && photos.length === 0
          ? "belum ada foto — upload dulu"
          : `${photos.length} foto tersimpan rapi`}
      </p>

      <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
        {ALBUMS.map((a) => {
          const active = a === album;
          return (
            <button
              key={a}
              onClick={() => setAlbum(a)}
              className={`relative shrink-0 rounded-full px-4 py-2 text-xs font-bold ${
                active ? "text-ivory" : "bg-white text-charcoal shadow-card"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="chip"
                  className="absolute inset-0 rounded-full bg-charcoal"
                  transition={{ type: "spring", stiffness: 500, damping: 38 }}
                />
              )}
              <span className="relative">{a}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={album}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="mt-3"
        >
          <GalleryGrid photos={photos} onSelect={setIndex} />
        </motion.div>
      </AnimatePresence>

      <PhotoLightbox photos={photos} index={index} onClose={() => setIndex(null)} onNav={setIndex} />
    </main>
  );
}
