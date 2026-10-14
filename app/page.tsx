"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { TIMELINE, formatDate } from "@/lib/gallery";
import { usePhotos } from "@/lib/store";
import PhotoLightbox from "@/components/PhotoLightbox";

const MANIFESTO = [
  "Silent stories.",
  "Honest frames.",
  "Still truth.",
  "Quiet depth.",
];

const START = new Date("2024-02-14T00:00:00");
const daysTogether = Math.max(
  1,
  Math.floor((Date.now() - START.getTime()) / 86_400_000)
);

export default function Home() {
  const { photos } = usePhotos();
  const favorites = photos.filter((p) => p.favorite).slice(0, 6);
  const picks = favorites.length > 0 ? favorites : photos.slice(0, 6);
  const heroCollage = photos.slice(0, 8);
  const [pickIndex, setPickIndex] = useState<number | null>(null);

  return (
    <main>
      {/* ── HERO — Noir reference ─────────────────────────────── */}
      <section className="px-5 pt-8 md:px-10 md:pt-14">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-6">
          {/* Left copy */}
          <div className="lg:col-span-4">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p className="inline-flex items-center gap-2 rounded-full border border-black/10 px-3 py-1 text-[11px] font-bold tracking-widest text-charcoal/70">
                <span className="h-1.5 w-1.5 rounded-full bg-charcoal" />
                {daysTogether} DAYS TOGETHER
              </p>
              <h1 className="mt-4 text-[42px] font-extrabold leading-[1.02] tracking-tighter text-charcoal sm:text-[56px] lg:text-[58px]">
                Beyond Color.
                <br />
                Pure Emotion.
              </h1>
              <p className="mt-4 max-w-[32ch] text-[14px] font-semibold leading-relaxed text-charcoal/70">
                Timeless black and white frames that speak without words.
              </p>
              <div className="mt-5 flex items-center gap-3">
                <Link
                  href="/gallery"
                  className="rounded-full bg-charcoal px-6 py-3 text-[13px] font-bold text-white transition hover:bg-black active:scale-95"
                >
                  See the Stories
                </Link>
                <Link
                  href="/timeline"
                  className="text-[13px] font-bold underline-offset-4 hover:underline"
                >
                  Our journey
                </Link>
              </div>

              {/* manifesto list — Noir right-side arrows */}
              <ul className="mt-8 space-y-2">
                {MANIFESTO.map((m) => (
                  <li key={m} className="flex items-center gap-2 text-[13px] font-bold">
                    <span aria-hidden>↗</span>
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Right collage — Noir B&W masonry */}
          <div className="lg:col-span-8">
            <div className="columns-2 gap-3 sm:columns-3 lg:columns-4 [&>*]:mb-3">
              {heroCollage.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: i * 0.06 }}
                  className={`break-inside-avoid overflow-hidden rounded-2xl bg-black/[0.04] ${
                    i % 4 === 1 ? "mt-0 sm:mt-8" : i % 4 === 3 ? "sm:mt-12" : ""
                  }`}
                >
                  <div className="relative w-full">
                    <Image
                      src={p.src}
                      alt={p.caption}
                      width={p.width}
                      height={p.height}
                      sizes="(max-width: 768px) 50vw, 240px"
                      className="h-auto w-full object-cover grayscale"
                      loading={i < 4 ? "eager" : "lazy"}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── EDITOR'S PICKS — Artfolio dark reference ──────────── */}
      <section className="px-3 pt-10 md:px-6">
        <div className="overflow-hidden rounded-[26px] bg-ink px-5 py-8 text-white md:px-12 md:py-14">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-[11px] font-bold tracking-widest text-white/70">
                <span className="font-mono">◉</span> EDITOR&apos;S PICKS
              </p>
              <h2 className="mt-4 text-[30px] font-extrabold leading-[1.05] tracking-tighter sm:text-[40px]">
                Curated collections from the Kita community
              </h2>
            </div>
            <p className="max-w-xs text-[12.5px] leading-relaxed text-white/55">
              A carefully selected collection of honest frames and quiet moments —
              curated to keep every chapter of us.
            </p>
          </div>

          <div className="no-scrollbar -mx-5 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-1 md:-mx-12 md:px-12">
            {picks.map((p, i) => (
              <motion.article
                key={p.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: (i % 4) * 0.06 }}
                className="group relative h-[440px] w-[76vw] max-w-[320px] shrink-0 snap-start overflow-hidden rounded-[20px] bg-smoke sm:w-[300px]"
              >
                <button
                  onClick={() => setPickIndex(i)}
                  className="absolute inset-0 h-full w-full text-left"
                  aria-label={`Open ${p.caption}`}
                >
                  <Image
                    src={p.src}
                    alt={p.caption}
                    fill
                    sizes="320px"
                    className="object-cover transition duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/25" />

                  {/* author pill — Artfolio */}
                  <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-white/15 py-1 pl-1 pr-3 backdrop-blur-md">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[11px] font-extrabold text-charcoal">
                      {p.location?.charAt(0) ?? "K"}
                    </span>
                    <span className="max-w-[120px] truncate text-[11px] font-bold text-white">
                      {p.location || "Kita"}
                    </span>
                  </div>

                  {/* bottom copy — Artfolio */}
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <h3 className="text-[17px] font-extrabold leading-tight tracking-tight">
                      {p.caption}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-[11.5px] leading-relaxed text-white/65">
                      {formatDate(p.takenAt)} — {p.album}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-white/80">
                        More Details
                      </span>
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-charcoal transition group-hover:bg-charcoal group-hover:text-white">
                        →
                      </span>
                    </div>
                  </div>
                </button>
              </motion.article>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
            <p className="text-[11px] font-bold tracking-widest text-white/50">
              {picks.length} FEATURED FRAMES
            </p>
            <Link href="/gallery" className="rounded-full bg-white px-5 py-2.5 text-[12px] font-bold text-charcoal hover:bg-white/90">
              Open Gallery
            </Link>
          </div>
        </div>
      </section>

      {/* ── STORIES PREVIEW — Luna reference ──────────────────── */}
      <section className="px-5 pt-12 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="inline-block rounded-full bg-black/[0.05] px-3 py-1 text-[11px] font-bold tracking-wide">
              Our Stories
            </p>
            <h2 className="mt-3 text-[38px] font-extrabold leading-none tracking-tighter sm:text-[54px]">
              Photo Gallery
            </h2>
          </div>
          <p className="max-w-[220px] text-right text-[12.5px] font-medium leading-relaxed text-charcoal/60">
            Captured moments from our trips and scenic routes together.
          </p>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {TIMELINE.slice(0, 3).map((ev, i) => (
            <motion.div
              key={ev.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <Link
                href="/timeline"
                className="group flex items-center justify-between rounded-2xl border border-black/[0.06] bg-white p-4 shadow-card transition hover:shadow-soft"
              >
                <div className="flex items-center gap-4">
                  <span className="font-mono text-[13px] font-bold text-charcoal/40">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <span className="block text-[15px] font-extrabold tracking-tight">
                      {ev.title}
                    </span>
                    <span className="block text-[12px] font-semibold text-charcoal/55">
                      {formatDate(ev.date)}
                    </span>
                  </span>
                </div>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/[0.05] transition group-hover:bg-charcoal group-hover:text-white">
                  →
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        <p className="mx-auto max-w-[32ch] pt-14 text-center text-[22px] font-extrabold leading-snug tracking-tighter">
          “Yang sederhana, justru paling lama diingat.”
        </p>
        <p className="pb-2 pt-2 text-center text-[11px] font-bold tracking-[0.2em] text-charcoal/50">
          — KITA.
        </p>
      </section>

      <PhotoLightbox photos={picks} index={pickIndex} onClose={() => setPickIndex(null)} onNav={setPickIndex} />
    </main>
  );
}
