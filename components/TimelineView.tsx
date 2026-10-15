"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useSpring } from "framer-motion";
import { formatDate, photoById, thumb } from "@/lib/gallery";
import { usePhotos, useTimeline } from "@/lib/store";

export default function TimelineView() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.7", "end 0.6"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });
  const { events, error } = useTimeline();
  const { photos } = usePhotos();

  const coverOf = (coverId: string) =>
    photos.find((p) => p.id === coverId) ?? photoById(coverId);

  return (
    <div ref={ref} className="relative pl-7">
      <div className="absolute bottom-2 left-[9px] top-2 w-[3px] bg-black/15" />
      <motion.div
        style={{ scaleY: progress }}
        className="absolute bottom-2 left-[9px] top-2 w-[3px] origin-top bg-black"
      />
      {error && (
        <p className="mb-4 border-2 border-red-600 bg-red-50 p-3 text-[13px] font-bold text-red-800">
          {error}
        </p>
      )}
      {events.length === 0 && !error && (
        <div className="border-[3px] border-dashed border-black bg-white p-8 text-center">
          <p className="font-display text-[20px] tracking-wide">BELUM ADA CERITA</p>
          <p className="mt-1 font-serif text-[12px] italic">Upload foto dulu untuk mengisi timeline.</p>
        </div>
      )}
      <div className="space-y-5">
        {events.map((ev, i) => {
          const cover = coverOf(ev.coverId);
          return (
            <motion.article
              key={ev.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.35 }}
              className="relative border-[3px] border-black bg-white shadow-hardSm"
            >
              <span className="absolute -left-7 top-6 flex h-5 w-5 items-center justify-center">
                <span className="h-3 w-3 border-2 border-black bg-white" />
              </span>
              <p className="border-b-[3px] border-black bg-raspberry py-1.5 text-center text-[10px] font-extrabold tracking-[0.3em] text-white">
                {formatDate(ev.date).toUpperCase()} — NO. {String(i + 1).padStart(2, "0")}
              </p>
              <div className="relative p-2">
                <span aria-hidden className="tape absolute -top-1 left-1/2 z-10 h-5 w-16 -translate-x-1/2 -rotate-2" />
                <div className="border-2 border-black bg-black/10">
                  <Image
                    src={thumb(cover.src, 800, cover.rotate ?? 0)}
                    alt={ev.title}
                    width={cover.width}
                    height={cover.height}
                    sizes="(max-width: 768px) 100vw, 640px"
                    className="h-52 w-full object-cover md:h-64"
                    loading={i < 2 ? "eager" : "lazy"}
                  />
                </div>
              </div>
              <div className="p-4 pt-1">
                <h3 className="font-display text-[26px] leading-none tracking-wide">
                  {ev.title.toUpperCase()}
                </h3>
                <p className="mt-2 font-serif text-[12.5px] italic leading-relaxed">
                  {ev.description}
                </p>
                <Link
                  href="/gallery"
                  className="mt-3 inline-block border-2 border-black bg-black px-5 py-2 text-[11px] font-extrabold tracking-[0.2em] text-white"
                >
                  LIHAT FOTO →
                </Link>
              </div>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
}
