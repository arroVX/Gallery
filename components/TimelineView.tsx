"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useSpring } from "framer-motion";
import { formatDate, photoById } from "@/lib/gallery";
import { usePhotos, useTimeline } from "@/lib/store";

export default function TimelineView() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.7", "end 0.6"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });
  const events = useTimeline();
  const { photos } = usePhotos();

  const coverOf = (coverId: string) =>
    photos.find((p) => p.id === coverId) ?? photoById(coverId);

  return (
    <div ref={ref} className="relative pl-7 md:pl-9">
      <div className="absolute bottom-2 left-[9px] top-2 w-px bg-black/10" />
      <motion.div
        style={{ scaleY: progress }}
        className="absolute bottom-2 left-[9px] top-2 w-px origin-top bg-charcoal"
      />
      <div className="space-y-4">
        {events.map((ev, i) => {
          const cover = coverOf(ev.coverId);
          return (
            <motion.article
              key={ev.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="relative overflow-hidden rounded-[20px] border border-black/[0.06] bg-white shadow-card"
            >
              <span className="absolute -left-7 top-6 flex h-5 w-5 items-center justify-center md:-left-9">
                <span className="h-2.5 w-2.5 rounded-full border-2 border-charcoal bg-white" />
              </span>
              <div className="relative h-52 w-full overflow-hidden md:h-64">
                <Image
                  src={cover.src}
                  alt={ev.title}
                  width={cover.width}
                  height={cover.height}
                  sizes="(max-width: 768px) 100vw, 640px"
                  className="h-full w-full object-cover"
                  loading={i < 2 ? "eager" : "lazy"}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                <p className="absolute left-4 top-4 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold tracking-wide text-white backdrop-blur-md">
                  {formatDate(ev.date)}
                </p>
                <p className="absolute bottom-4 left-4 font-mono text-[12px] font-bold text-white/70">
                  {String(i + 1).padStart(2, "0")}
                </p>
              </div>
              <div className="p-4 md:p-5">
                <h3 className="text-[20px] font-extrabold leading-tight tracking-tighter">
                  {ev.title}
                </h3>
                <p className="mt-1.5 text-[13px] font-medium leading-relaxed text-charcoal/65">
                  {ev.description}
                </p>
                <Link
                  href="/gallery"
                  className="mt-3 inline-flex items-center gap-2 text-[12px] font-bold"
                >
                  <span className="rounded-full bg-charcoal px-4 py-2 text-white">Lihat foto</span>
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
}
