"use client";

import { useCallback, useEffect } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { formatDate, type Photo } from "@/lib/gallery";

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

  const prev = useCallback(() => {
    if (index === null) return;
    onNav((index - 1 + photos.length) % photos.length);
  }, [index, photos.length, onNav]);

  const next = useCallback(() => {
    if (index === null) return;
    onNav((index + 1) % photos.length);
  }, [index, photos.length, onNav]);

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, onClose, prev, next]);

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
