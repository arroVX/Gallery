"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { Photo } from "@/lib/gallery";
import { formatDate } from "@/lib/gallery";

export default function GalleryGrid({
  photos,
  onSelect,
}: {
  photos: Photo[];
  onSelect: (index: number) => void;
}) {
  if (photos.length === 0) {
    return (
      <div className="rounded-[20px] border border-dashed border-black/15 bg-black/[0.02] p-10 text-center">
        <p className="text-[15px] font-extrabold tracking-tight">Belum ada foto</p>
        <p className="mt-1 text-[13px] font-medium text-charcoal/60">
          Upload dulu untuk mengisi galeri ini.
        </p>
      </div>
    );
  }

  return (
    <div className="columns-2 gap-3 md:columns-3 [&>*]:mb-3">
      {photos.map((p, i) => (
        <motion.figure
          key={p.id}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.35, ease: "easeOut", delay: (i % 4) * 0.04 }}
          className="group relative break-inside-avoid overflow-hidden rounded-[18px] bg-black/[0.04]"
        >
          <button
            onClick={() => onSelect(i)}
            className="block w-full text-left"
            aria-label={`Buka foto ${p.caption}`}
          >
            <div className="relative w-full overflow-hidden">
              <Image
                src={p.src}
                alt={p.caption}
                width={p.width}
                height={p.height}
                sizes="(max-width: 768px) 50vw, 320px"
                className="h-auto w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-black/20 opacity-90" />
            </div>

            {/* top pill — Artfolio */}
            <div className="absolute left-2.5 top-2.5 flex items-center gap-1.5 rounded-full bg-white/15 py-1 pl-1 pr-2.5 backdrop-blur-md">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-extrabold text-charcoal">
                {(p.location || "K").charAt(0)}
              </span>
              <span className="max-w-[110px] truncate text-[10.5px] font-bold text-white">
                {p.location || p.album}
              </span>
            </div>

            {p.favorite && (
              <span className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[13px]">
                ♥
              </span>
            )}

            {/* bottom — Artfolio + Luna rounded */}
            <figcaption className="absolute inset-x-0 bottom-0 p-3">
              <p className="line-clamp-2 text-[13.5px] font-extrabold leading-tight tracking-tight text-white">
                {p.caption}
              </p>
              <div className="mt-1.5 flex items-center justify-between">
                <p className="text-[10.5px] font-bold text-white/70">
                  {formatDate(p.takenAt)}
                </p>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[13px] text-charcoal transition group-hover:bg-charcoal group-hover:text-white">
                  →
                </span>
              </div>
            </figcaption>
          </button>
        </motion.figure>
      ))}
    </div>
  );
}
