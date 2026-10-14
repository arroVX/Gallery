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
      <div className="border-[3px] border-dashed border-black bg-white p-10 text-center">
        <p className="font-display text-[22px] tracking-wide">NO PHOTOS YET</p>
        <p className="mt-1 font-serif text-[13px] italic">Upload dulu untuk mengisi halaman ini.</p>
      </div>
    );
  }

  return (
    <div className="columns-2 gap-3 md:columns-3 [&>*]:mb-3">
      {photos.map((p, i) => (
        <motion.figure
          key={p.id}
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.3, delay: (i % 4) * 0.03 }}
          className="break-inside-avoid border-[3px] border-black bg-white p-1.5 shadow-hardSm"
        >
          <button
            onClick={() => onSelect(i)}
            className="block w-full text-left"
            aria-label={`Buka foto ${p.caption}`}
          >
            <span className="block border-2 border-black">
              <Image
                src={p.src}
                alt={p.caption}
                width={p.width}
                height={p.height}
                sizes="(max-width: 768px) 50vw, 300px"
                className="h-auto w-full object-cover"
                loading="lazy"
              />
            </span>
            <span
              className={`mt-1.5 block border-2 border-black px-2 py-1.5 text-center text-[10.5px] font-extrabold tracking-wide ${
                i % 3 === 1 ? "bg-white text-black" : "bg-black text-white"
              }`}
            >
              <span className="block truncate">{p.caption.toUpperCase()}</span>
              <span className={`mt-0.5 block text-[9px] font-bold tracking-[0.14em] ${i % 3 === 1 ? "text-black/60" : "text-white/70"}`}>
                {formatDate(p.takenAt).toUpperCase()}
              </span>
            </span>
          </button>
        </motion.figure>
      ))}
    </div>
  );
}
