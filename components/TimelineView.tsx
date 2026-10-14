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
    <div ref={ref} className="relative pl-7">
      <div className="absolute bottom-2 left-[9px] top-2 w-px bg-hairline" />
      <motion.div
        style={{ scaleY: progress }}
        className="absolute bottom-2 left-[9px] top-2 w-px origin-top bg-rosewood"
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
              className="relative rounded-2xl bg-white p-3 shadow-card"
            >
              <span className="absolute -left-7 top-5 flex h-5 w-5 items-center justify-center">
                <span className="h-2.5 w-2.5 rounded-full border-2 border-rosewood bg-ivory" />
              </span>
              <p className="font-hand text-lg leading-none text-rosewood">
                {formatDate(ev.date)}
              </p>
              <h3 className="mt-1 font-serif text-[22px] leading-tight">{ev.title}</h3>
              <div className="relative mt-2 overflow-hidden rounded-xl">
                <Image
                  src={cover.src}
                  alt={ev.title}
                  width={cover.width}
                  height={cover.height}
                  sizes="(max-width: 480px) 100vw, 420px"
                  className="h-52 w-full object-cover"
                  loading={i < 2 ? "eager" : "lazy"}
                />
              </div>
              <p className="mt-2 text-[13px] leading-relaxed text-charcoal/80">
                {ev.description}
              </p>
              <Link
                href="/gallery"
                className="mt-2 inline-block text-xs font-bold tracking-wide text-rosewood"
              >
                Lihat foto →
              </Link>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
}
