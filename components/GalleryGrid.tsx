"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { Photo } from "@/lib/gallery";

export default function GalleryGrid({
  photos,
  onSelect,
}: {
  photos: Photo[];
  onSelect: (index: number) => void;
}) {
  return (
    <div className="columns-2 gap-2">
      {photos.map((p, i) => (
        <motion.figure
          key={p.id}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.35, ease: "easeOut", delay: (i % 4) * 0.04 }}
          className="mb-2 break-inside-avoid overflow-hidden rounded-2xl bg-white shadow-card"
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
                sizes="(max-width: 480px) 50vw, 220px"
                className="h-auto w-full object-cover"
                loading="lazy"
              />
            </div>
            <figcaption className="px-3 pb-3 pt-2">
              <p className="line-clamp-2 font-serif text-[15px] leading-snug">{p.caption}</p>
              <p className="mt-0.5 font-hand text-sm text-rosewood">{p.location}</p>
            </figcaption>
          </button>
        </motion.figure>
      ))}
    </div>
  );
}
