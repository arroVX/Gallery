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

  useEffect(() => {
    if (index !== null && index >= photos.length) {
      setIndex(photos.length > 0 ? photos.length - 1 : null);
    }
  }, [photos.length, index]);

  return (
    <main className="px-5 pt-8 md:px-10 md:pt-12">
      {/* Header — Luna Photo Gallery reference */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="inline-block rounded-full bg-black/[0.05] px-3 py-1 text-[11px] font-bold tracking-wide">
            Our Stories
          </p>
          <h1 className="mt-3 text-[42px] font-extrabold leading-[0.95] tracking-tighter sm:text-[64px]">
            Photo Gallery
          </h1>
          <p className="mt-2 text-[13px] font-semibold text-charcoal/60">
            {live && photos.length === 0
              ? "Belum ada foto — upload dulu"
              : `${photos.length} foto tersimpan rapi`}
          </p>
        </div>
        <p className="max-w-[220px] text-right text-[12.5px] font-medium leading-relaxed text-charcoal/60">
          Captured moments from our desert trips and scenic routes.
        </p>
      </div>

      {/* Filters */}
      <div className="no-scrollbar -mx-5 mt-6 flex gap-2 overflow-x-auto px-5 pb-1 md:mx-0 md:px-0">
        {ALBUMS.map((a) => {
          const active = a === album;
          return (
            <button
              key={a}
              onClick={() => setAlbum(a)}
              className={`relative shrink-0 rounded-full px-5 py-2.5 text-[12px] font-bold transition ${
                active ? "text-white" : "bg-black/[0.05] text-charcoal hover:bg-black/[0.08]"
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
          className="mt-5"
        >
          <GalleryGrid photos={photos} onSelect={setIndex} />
        </motion.div>
      </AnimatePresence>

      <PhotoLightbox photos={photos} index={index} onClose={() => setIndex(null)} onNav={setIndex} />
    </main>
  );
}
